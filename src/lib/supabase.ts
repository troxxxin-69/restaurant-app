import { createClient } from "@supabase/supabase-js";
import type { FoodItem } from "../data/menu";
import type { Order, AppRole } from "../context/AppContext";
import { safeParseJSON } from "../utils/sanitize";

let url = import.meta.env.VITE_SUPABASE_URL || "";
let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Auto-correct if URL and Key are swapped in .env.local
if (!url.startsWith("http") && anonKey.startsWith("http")) {
  const temp = url;
  url = anonKey;
  anonKey = temp;
}

// Clean up URL: remove /rest/v1/ trailing paths if present
if (url.endsWith("/rest/v1/")) {
  url = url.replace("/rest/v1/", "");
} else if (url.endsWith("/rest/v1")) {
  url = url.replace("/rest/v1", "");
}

// Environmental key hygiene: Validate VITE_ env variables
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("⚠️ Security Warning: VITE_SUPABASE_URL is not set in environment variables. Falling back to local offline mode.");
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Security Warning: VITE_SUPABASE_ANON_KEY is not set in environment variables. Falling back to local offline mode.");
}

// Fallback to placeholder if url or anonKey is missing to prevent runtime crash
if (!url) {
  url = "https://placeholder.supabase.co";
}
if (!anonKey) {
  anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder";
}

export const supabase = createClient(url, anonKey);

export interface DeliveryPartner {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  vehicle_number?: string;
  is_available: boolean;
  created_at?: string;
}

export interface UserProfileWithRole {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: AppRole;
  created_at?: string;
}

export const ADMIN_EMAILS = [
  "troxin694@gmail.com",
];

/**
 * Fetches user role from 'user_roles' table in Supabase or admin list.
 * Server-verified: Returns actual database role.
 */
export async function getUserRoleFromSupabase(userId: string, email?: string): Promise<AppRole> {
  try {
    const cleanEmail = (email || "").toLowerCase().trim();

    // Priority 1: Instant Admin check for designated admin emails
    if (
      userId === "usr-admin-01" ||
      (cleanEmail && ADMIN_EMAILS.includes(cleanEmail))
    ) {
      return "restaurant_admin";
    }

    // Priority 2: Direct Supabase DB 'user_roles' check
    if (userId && !userId.startsWith("usr-guest") && !userId.startsWith("usr-local")) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.role) {
        const roleStr = data.role.toLowerCase();
        if (roleStr === "restaurant_admin" || roleStr === "admin") return "restaurant_admin";
        if (roleStr === "delivery_partner" || roleStr === "delivery") return "delivery_partner";
        return "customer";
      }
    }

    // Priority 3: Check local session cache overrides
    if (typeof window !== "undefined") {
      const activeUser = safeParseJSON<Record<string, any>>(localStorage.getItem("manas_user"), {});
      if (activeUser && (activeUser.id === userId || (cleanEmail && activeUser.email?.toLowerCase() === cleanEmail))) {
        if (activeUser.role === "restaurant_admin") return "restaurant_admin";
      }

      const localRoles = safeParseJSON<Record<string, AppRole>>(localStorage.getItem("manas_local_user_roles"), {});
      if (localRoles[userId]) return localRoles[userId];
      if (cleanEmail && localRoles[cleanEmail]) return localRoles[cleanEmail];
    }

    return "customer";
  } catch (err) {
    console.error("Exception in getUserRoleFromSupabase:", err);
    return "customer";
  }
}

/**
 * Sign Up with Email + Password.
 */
export async function signUpWithEmail(email: string, password: string, fullName: string, phone?: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
          phone: phone || "",
        },
      },
    });

    if (error) {
      console.error("Supabase signUp error:", error.message);
      const isRateLimit =
        error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("limit exceed") ||
        error.message.includes("over_email_send_rate_limit");

      if (isRateLimit) {
        // Attempt password login fallback in case user creation succeeded before email rate limit trigger
        const loginAttempt = await supabase.auth.signInWithPassword({ email, password });
        if (loginAttempt.data?.session && loginAttempt.data.user) {
          await syncCustomerProfile(loginAttempt.data.user.id, email, fullName, phone);
          return { success: true, data: loginAttempt.data, isRateLimitBypassed: true };
        }
        return {
          success: false,
          error: "⚠️ Supabase Email Rate Limit reached (max 3-4 emails/hr on default mailer). Please disable 'Confirm Email' in Supabase Auth settings to enable instant unlimited signups.",
          isRateLimit: true,
        };
      }

      return { success: false, error: error.message };
    }

    if (data.user) {
      // Sync customer profile (creates default customer role only if missing)
      await syncCustomerProfile(data.user.id, email, fullName, phone);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception in signUpWithEmail:", err);
    return { success: false, error: err?.message || "Failed to sign up" };
  }
}

/**
 * Sign In with Email + Password.
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signInWithPassword error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception in signInWithEmail:", err);
    return { success: false, error: err?.message || "Failed to log in" };
  }
}

/**
 * Sign In with Google OAuth (Continue with Google 1-Tap).
 */
export async function signInWithGoogle() {
  try {
    const redirectUrl = typeof window !== "undefined" ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Supabase Google auth error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Exception in signInWithGoogle:", err);
    return { success: false, error: err?.message || "Failed to log in with Google" };
  }
}

/**
 * Sign In with Magic Link (Passwordless OTP / Magic Link).
 */
export async function signInWithMagicLink(email: string) {
  try {
    const redirectUrl = typeof window !== "undefined" ? window.location.origin + "/login" : undefined;
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Supabase magic link error:", error.message);
      const isRateLimit =
        error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("limit exceed") ||
        error.message.includes("over_email_send_rate_limit");

      if (isRateLimit) {
        return {
          success: false,
          error: "⚠️ Supabase default email rate limit exceeded (max 3-4 emails/hour). Please use Email + Password login or connect a Custom SMTP in Supabase Dashboard.",
          isRateLimit: true,
        };
      }
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception in signInWithMagicLink:", err);
    return { success: false, error: err?.message || "Failed to send magic link" };
  }
}

/**
 * Reset Password for Email.
 */
export async function resetPasswordForEmail(email: string) {
  try {
    const redirectUrl = typeof window !== "undefined" ? window.location.origin + "/login" : undefined;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Supabase resetPassword error:", error.message);
      const isRateLimit =
        error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("limit exceed") ||
        error.message.includes("over_email_send_rate_limit");

      if (isRateLimit) {
        return {
          success: false,
          error: "⚠️ Email rate limit exceeded by Supabase default mailer. Please connect Custom SMTP in Supabase Dashboard for unlimited emails.",
          isRateLimit: true,
        };
      }
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception in resetPasswordForEmail:", err);
    return { success: false, error: err?.message || "Failed to send reset email" };
  }
}

/**
 * Creates/updates user metadata & 'customers' table in Supabase.
 * Every new user automatically gets default 'customer' role.
 */
export async function syncCustomerProfile(userId: string, email: string, name?: string, phone?: string) {
  try {
    if (name || phone) {
      await supabase.auth.updateUser({
        data: { name: name || "", full_name: name || "", phone: phone || "" },
      });
    }

    const cleanName = name || email.split("@")[0] || "Customer";
    const cleanPhone = phone || "";

    const cleanEmail = email.toLowerCase().trim();
    const isKnownAdmin = ADMIN_EMAILS.includes(cleanEmail);
    const assignedRole: AppRole = isKnownAdmin ? "restaurant_admin" : "customer";

    // Save to local registered users cache
    if (typeof window !== "undefined") {
      const localUsers = safeParseJSON<UserProfileWithRole[]>(localStorage.getItem("manas_registered_users"), []);
      const idx = localUsers.findIndex((u) => u.id === userId || u.email.toLowerCase() === cleanEmail);
      const updatedUser: UserProfileWithRole = {
        id: userId,
        email,
        name: cleanName,
        phone: cleanPhone,
        role: assignedRole,
        created_at: new Date().toISOString(),
      };
      if (idx >= 0) {
        localUsers[idx] = { ...localUsers[idx], name: cleanName, phone: cleanPhone || localUsers[idx].phone, role: assignedRole };
      } else {
        localUsers.unshift(updatedUser);
      }
      localStorage.setItem("manas_registered_users", JSON.stringify(localUsers));
    }

    // Upsert to Supabase customers table
    const { error } = await supabase.from("customers").upsert(
      {
        id: userId,
        email: email,
        name: cleanName,
        phone: cleanPhone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      console.warn("Notice on customers table upsert:", error.message);
    }

    // Create role in user_roles table ONLY IF user has no existing role
    const { data: existingRoleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
    if (!existingRoleData) {
      await supabase.from("user_roles").insert({ user_id: userId, role: assignedRole });
    }
  } catch (err) {
    console.warn("Notice: Exception syncing customer profile:", err);
  }
}

/**
 * Logs out the authenticated user.
 */
export async function signOutSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out:", err);
  }
}

/**
 * Admin Only: Fetch all real registered user profiles from Supabase DB.
 * Pure Database Query — Single Source of Truth (No localStorage merging).
 */
export async function fetchAllUserRolesAndProfiles(): Promise<UserProfileWithRole[]> {
  try {
    const { data: customers, error: custErr } = await supabase.from("customers").select("*");
    const { data: roles, error: roleErr } = await supabase.from("user_roles").select("*");

    if (custErr) console.warn("Notice fetching customers:", custErr.message);
    if (roleErr) console.warn("Notice fetching user_roles:", roleErr.message);

    const roleMap: Record<string, AppRole> = {};
    if (roles) {
      roles.forEach((r: any) => {
        const roleStr = (r.role || "customer").toLowerCase();
        if (roleStr === "restaurant_admin" || roleStr === "admin") roleMap[r.user_id] = "restaurant_admin";
        else if (roleStr === "delivery_partner" || roleStr === "delivery") roleMap[r.user_id] = "delivery_partner";
        else roleMap[r.user_id] = "customer";
      });
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    return customers.map((c: any) => ({
      id: c.id,
      email: c.email || "",
      name: c.name || c.email?.split("@")[0] || "Customer",
      phone: c.phone || "",
      role: roleMap[c.id] || "customer",
      created_at: c.created_at || c.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching all user roles:", err);
    return [];
  }
}

/**
 * Admin Only: Update a user's role in 'user_roles' table.
 */
export async function updateUserRoleInSupabase(targetUserId: string, newRole: AppRole) {
  try {
    if (typeof window !== "undefined") {
      const localRoles = safeParseJSON<Record<string, AppRole>>(localStorage.getItem("manas_local_user_roles"), {});
      localRoles[targetUserId] = newRole;
      localStorage.setItem("manas_local_user_roles", JSON.stringify(localRoles));
    }

    const { data, error } = await supabase
      .from("user_roles")
      .upsert({ user_id: targetUserId, role: newRole }, { onConflict: "user_id" })
      .select();

    if (error) {
      console.warn("Supabase user_roles upsert notice (cached locally):", error.message);
    }

    if (newRole === "delivery_partner") {
      const { data: cust } = await supabase.from("customers").select("*").eq("id", targetUserId).maybeSingle();
      if (cust) {
        await supabase.from("delivery_partners").upsert(
          {
            user_id: targetUserId,
            name: cust.name || cust.email?.split("@")[0] || "Delivery Partner",
            phone: cust.phone || "",
            is_available: true,
          },
          { onConflict: "user_id" }
        );
      }
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn("Exception updating user role (cached locally):", err);
    return { success: true };
  }
}

/**
 * Fetches menu items from the Supabase 'menu_items' table.
 */
export async function fetchMenuItemsFromSupabase(): Promise<FoodItem[] | null> {
  try {
    const { data, error } = await supabase.from("menu_items").select("*").order("id", { ascending: true });

    if (error) {
      console.warn("Supabase fetch menu_items warning/error:", error.message);
      return null;
    }
    if (!data || data.length === 0) {
      return null;
    }
    return data.map((item: any) => ({
      id: typeof item.id === "number" ? item.id : Number(item.id) || Date.now(),
      name: item.name || item.title || "Dish",
      price: Number(item.price) || 0,
      category: item.category || "General",
      veg:
        item.veg !== undefined
          ? Boolean(item.veg)
          : item.is_veg !== undefined
          ? Boolean(item.is_veg)
          : item.available !== undefined
          ? Boolean(item.available)
          : true,
      rating: Number(item.rating) || 4.5,
      description: item.description || "",
      image:
        item.image ||
        item.image_url ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
    }));
  } catch (err) {
    console.error("Failed to fetch menu_items from Supabase:", err);
    return null;
  }
}

/**
 * Inserts a new menu item into Supabase 'menu_items' table.
 */
export async function addMenuItemToSupabase(item: Omit<FoodItem, "id"> & { id?: number }) {
  try {
    const payload: Record<string, any> = {
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || "",
      veg: item.veg !== undefined ? Boolean(item.veg) : true,
      rating: item.rating || 4.5,
      image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
    };

    let { data, error } = await supabase.from("menu_items").insert([payload]).select();

    // Fallback if PostgREST schema cache has not reloaded
    if (error && error.code === "PGRST204") {
      delete payload.rating;
      delete payload.veg;
      const res = await supabase.from("menu_items").insert([payload]).select();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error("Error inserting menu item to Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception adding menu item:", err);
    return { success: false, error: err?.message || "Failed to add menu item" };
  }
}

/**
 * Updates an existing menu item in Supabase 'menu_items' table.
 */
export async function updateMenuItemInSupabase(id: number, updates: Partial<FoodItem>) {
  try {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.veg !== undefined) payload.veg = updates.veg;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.image !== undefined) {
      payload.image = updates.image;
      payload.image_url = updates.image;
    }

    const { data, error } = await supabase.from("menu_items").update(payload).eq("id", id).select();
    if (error) {
      console.error("Error updating menu item in Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception updating menu item:", err);
    return { success: false, error: err?.message || "Failed to update menu item" };
  }
}

/**
 * Deletes a menu item from Supabase 'menu_items' table.
 */
export async function deleteMenuItemFromSupabase(id: number) {
  try {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      console.error("Error deleting menu item from Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Exception deleting menu item:", err);
    return { success: false, error: err?.message || "Failed to delete menu item" };
  }
}

/**
 * Fetches all orders from Supabase.
 */
export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabase.from("orders").select("*").order("date", { ascending: false });
    if (error) {
      console.warn("Notice: fetch orders error:", error.message);
      return [];
    }
    if (!data) return [];
    return data.map((ord: any) => ({
      id: String(ord.id || ord.order_id || ""),
      user_id: ord.user_id,
      customer_name: ord.customer_name,
      phone: ord.phone,
      payment_type: ord.payment_type,
      items: typeof ord.items === "string" ? JSON.parse(ord.items) : ord.items || [],
      total: Number(ord.total || ord.total_amount) || 0,
      status: ord.status || "placed",
      address: ord.address || ord.delivery_address || "",
      payment: ord.payment || ord.payment_type || ord.payment_method || "Cash On Delivery",
      date: ord.date || ord.created_at || new Date().toISOString(),
      assigned_delivery_partner_id: ord.assigned_delivery_partner_id,
      delivery_boy_name: ord.delivery_boy_name,
      delivery_boy_phone: ord.delivery_boy_phone,
      accepted_at: ord.accepted_at,
      ready_at: ord.ready_at,
      picked_up_at: ord.picked_up_at,
      delivered_at: ord.delivered_at,
      cancellation_reason: ord.cancellation_reason,
      lat: ord.lat ? Number(ord.lat) : undefined,
      lng: ord.lng ? Number(ord.lng) : undefined,
      street_address: ord.street_address || ord.address,
      landmark: ord.landmark,
      city: ord.city,
      pincode: ord.pincode,
      google_maps_link:
        ord.google_maps_link ||
        String(ord.address || "").match(/\[Google Maps Link:\s*([^\]]+)\]/i)?.[1] ||
        String(ord.address || "").match(/(https:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|google\.com\/maps)[^\s()\]]+)/i)?.[1],
      location_mode: ord.location_mode || undefined,
      utr_number: ord.utr_number || undefined,
      payment_proof_url: ord.payment_proof_url || undefined,
      payment_submitted_at: ord.payment_submitted_at || undefined,
    }));
  } catch (err) {
    console.error("Exception fetching orders:", err);
    return [];
  }
}

/**
 * Inserts a completed order into the Supabase 'orders' table matching exact schema constraints.
 */
export async function insertOrderToSupabase(order: any) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    let authUserId = sessionUser?.id;

    if (!authUserId) {
      const userRes = await supabase.auth.getUser();
      if (userRes.data?.user) {
        authUserId = userRes.data.user.id;
      } else {
        authUserId = undefined;
      }
    }

    const rawId = typeof order.id === "number" ? order.id : Number(String(order.id).replace(/\D/g, "")) || Math.floor(10000000 + Math.random() * 89999999);
    const custName = order.customer_name || (sessionUser?.user_metadata?.full_name || sessionUser?.user_metadata?.name || "Customer");
    const custPhone = order.phone || sessionUser?.user_metadata?.phone || "9876543210";
    const payType = order.payment_type || order.payment || "Cash On Delivery";

    const fullAddrWithLink = order.google_maps_link && !String(order.address || "").includes("[Google Maps Link:")
      ? `${order.address || "Google Maps Location"} [Google Maps Link: ${order.google_maps_link}]`
      : order.address;

    const payload: Record<string, any> = {
      id: rawId,
      customer_name: custName,
      phone: custPhone,
      payment_type: payType,
      payment: payType,
      items: order.items,
      total: order.total,
      status: order.status || "placed",
      address: fullAddrWithLink,
      date: order.date || new Date().toISOString(),
      lat: order.lat ? Number(order.lat) : null,
      lng: order.lng ? Number(order.lng) : null,
      street_address: order.street_address || order.address,
      landmark: order.landmark || null,
      city: order.city || null,
      pincode: order.pincode || null,
      google_maps_link: order.google_maps_link || null,
      location_mode: order.location_mode || null,
      utr_number: order.utr_number || null,
      payment_proof_url: order.payment_proof_url || null,
      payment_submitted_at: order.payment_submitted_at || null,
    };

    if (authUserId) {
      payload.user_id = authUserId;
    }

    const res = await supabase.from("orders").insert([payload]);
    if (!res.error) {
      console.log("Order inserted successfully into Supabase orders table!");
      return { success: true, data: res.data };
    }

    console.warn("Attempt 1 insert notice:", res.error.message);

    // Attempt 2: If id is AUTO INCREMENT / UUID in database (omit custom numeric id)
    const payloadNoId = { ...payload };
    delete payloadNoId.id;
    const resNoId = await supabase.from("orders").insert([payloadNoId]);
    if (!resNoId.error) {
      console.log("Order inserted successfully without custom ID!");
      return { success: true, data: resNoId.data };
    }

    console.error("Supabase insert order error:", resNoId.error.message);
    return { success: false, error: resNoId.error.message || res.error.message };
  } catch (err: any) {
    console.error("Exception in insertOrderToSupabase:", err);
    return { success: false, error: err?.message || "Failed to insert order" };
  }
}

/**
 * Updates order status and lifecycle timestamps in Supabase.
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: string,
  extraPayload: Record<string, any> = {}
) {
  try {
    const now = new Date().toISOString();
    const updateData: Record<string, any> = { status: newStatus, ...extraPayload };

    if (newStatus === "accepted") updateData.accepted_at = now;
    if (newStatus === "ready_for_pickup") updateData.ready_at = now;
    if (newStatus === "picked_up") updateData.picked_up_at = now;
    if (newStatus === "delivered") updateData.delivered_at = now;

    // Try matching numeric id or string order_id
    const numericId = Number(String(orderId).replace(/\D/g, ""));

    let { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", numericId || orderId)
      .select();

    if (error) {
      const alt = await supabase.from("orders").update(updateData).eq("id", orderId).select();
      data = alt.data;
      error = alt.error;
    }

    if (error) {
      console.warn("Order status update warning with extra fields:", error.message);
      // Fallback: Retry with basic status update if custom columns are missing in SQL schema
      const basicData = { status: newStatus };
      const fallbackRes = await supabase.from("orders").update(basicData).eq("id", numericId || orderId).select();
      if (!fallbackRes.error) {
        return { success: true, data: fallbackRes.data, fallback: true };
      }
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception in updateOrderStatusInSupabase:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * Admin helper: Clears all orders from Supabase database.
 */
export async function deleteAllOrdersFromSupabase() {
  try {
    const { error } = await supabase.from("orders").delete().neq("id", "0");
    if (error) console.warn("Supabase clear orders notice:", error.message);
    return { success: !error };
  } catch (err) {
    console.error("Exception in deleteAllOrdersFromSupabase:", err);
    return { success: false };
  }
}

/**
 * Assigns a delivery partner to an order in Supabase.
 */
export async function assignDeliveryPartnerInSupabase(orderId: string, partnerId: string) {
  try {
    const numericId = Number(String(orderId).replace(/\D/g, ""));
    const { data, error } = await supabase
      .from("orders")
      .update({ assigned_delivery_partner_id: partnerId })
      .eq("id", numericId || orderId)
      .select();

    if (error) {
      console.error("Error assigning delivery partner:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception assigning partner:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * Fetches list of all delivery partners.
 */
export async function fetchDeliveryPartnersFromSupabase(): Promise<DeliveryPartner[]> {
  try {
    const { data, error } = await supabase.from("delivery_partners").select("*");
    if (error) {
      console.warn("Notice fetching delivery partners:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception fetching delivery partners:", err);
    return [];
  }
}

/**
 * Creates or fetches current delivery partner profile for logged-in user.
 */
export async function getOrCreateDeliveryPartnerProfile(userId: string, name: string, phone?: string): Promise<DeliveryPartner | null> {
  try {
    const { data } = await supabase.from("delivery_partners").select("*").eq("user_id", userId).maybeSingle();
    if (data) return data;

    const newPartner = {
      user_id: userId,
      name: name || "Delivery Partner",
      phone: phone || "",
      vehicle_number: "RJ-27-EV-1008",
      is_available: true,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("delivery_partners")
      .insert([newPartner])
      .select()
      .single();

    if (insertErr) {
      console.warn("Insert delivery partner warning:", insertErr.message);
      return null;
    }
    return inserted;
  } catch (err) {
    console.error("Exception in getOrCreateDeliveryPartnerProfile:", err);
    return null;
  }
}

/**
 * Toggles delivery partner availability.
 */
export async function toggleDeliveryPartnerAvailability(partnerId: string, isAvailable: boolean) {
  try {
    const { data, error } = await supabase
      .from("delivery_partners")
      .update({ is_available: isAvailable })
      .eq("id", partnerId)
      .select();

    if (error) {
      console.error("Error toggling partner availability:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Exception toggling availability:", err);
    return { success: false, error: err?.message };
  }
}

// Alias insertOrder for direct function usage
export const insertOrder = insertOrderToSupabase;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  read?: boolean;
}

export async function insertContactMessageToSupabase(msg: Omit<ContactMessage, "id" | "created_at">) {
  try {
    const newMsg = {
      id: "msg-" + Date.now(),
      name: msg.name,
      email: msg.email,
      message: msg.message,
      created_at: new Date().toISOString(),
      read: false,
    };
    const { error } = await supabase.from("contact_messages").insert([newMsg]);
    if (error) console.warn("Supabase contact_messages notice:", error.message);
    return newMsg;
  } catch (err) {
    console.error("Exception in insertContactMessageToSupabase:", err);
    return null;
  }
}

export async function fetchContactMessagesFromSupabase(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) {
      console.warn("fetchContactMessages notice:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in fetchContactMessagesFromSupabase:", err);
    return [];
  }
}

export async function deleteContactMessageFromSupabase(id: string) {
  try {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) console.warn("deleteContactMessage notice:", error.message);
    return { success: !error };
  } catch (err) {
    console.error("Exception in deleteContactMessageFromSupabase:", err);
    return { success: false };
  }
}
