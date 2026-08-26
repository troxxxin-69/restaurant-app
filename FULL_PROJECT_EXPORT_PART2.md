# MANAS RESTAURANT & RESORT — FULL PROJECT EXPORT PART 2

### File: `src/pages/AdminDashboard.tsx`
```typescript
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  ShoppingBag,
  Utensils,
  X,
  Search,
  RefreshCw,
  Users,
  MessageSquare,
  History,
  FileSpreadsheet,
  Navigation,
  Upload,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { useApp, type AppRole, type Order } from "../context/AppContext";
import type { FoodItem } from "../data/menu";
import VegBadge from "../components/VegBadge";
import MapPlaceholder from "../components/MapPlaceholder";
import {
  fetchAllUserRolesAndProfiles,
  updateUserRoleInSupabase,
  supabase,
  type UserProfileWithRole,
} from "../lib/supabase";
import { cn } from "../utils/cn";
import { safeParseJSON, validatePhone, sanitizeGoogleMapsUrl } from "../utils/sanitize";
import { exportOrdersToCsv } from "../utils/exportCsv";
import { UDAIPUR_AREA_COORDINATES, LOCALITY_KEYWORD_COORDINATES, parseGoogleMapsUrlCoordinates, RESTAURANT_LAT, RESTAURANT_LNG } from "../utils/distance";

export default function AdminDashboard() {
  const {
    user,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    orders,
    updateOrderStatus,
    adminVerifyOrderPayment,
    notify,
    refreshOrders,
    refreshMenu,
    contactMessages,
    deleteContactMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "payments" | "history" | "menu" | "staff" | "messages">("orders");
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [rejectingPaymentOrder, setRejectingPaymentOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("Invalid UTR Number / Payment Not Received in Bank Statement");
  const [historySearch, setHistorySearch] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Item Out of Stock");
  const [customReason, setCustomReason] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deliveryBoyMap, setDeliveryBoyMap] = useState<Record<string, { name: string; phone: string }>>({});
  const [staffUsers, setStaffUsers] = useState<UserProfileWithRole[]>([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [updatingUserRole, setUpdatingUserRole] = useState<string | null>(null);
  const [customAddCategory, setCustomAddCategory] = useState("");
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState("");

  const handlePromoteByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    const targetEmail = promoteEmail.trim().toLowerCase();

    // 1. Update local storage role map
    const localRoles = safeParseJSON<Record<string, AppRole>>(
      typeof window !== "undefined" ? localStorage.getItem("manas_local_user_roles") : null,
      {}
    );
    localRoles[targetEmail] = "restaurant_admin";

    // 2. Find in current staff users list
    const foundUser = staffUsers.find((u) => u.email.toLowerCase() === targetEmail);
    if (foundUser) {
      localRoles[foundUser.id] = "restaurant_admin";
      await updateUserRoleInSupabase(foundUser.id, "restaurant_admin");
    } else {
      // Create user record in registered users list
      const localUsers = safeParseJSON<UserProfileWithRole[]>(
        typeof window !== "undefined" ? localStorage.getItem("manas_registered_users") : null,
        []
      );
      const newAdminUser: UserProfileWithRole = {
        id: "usr-admin-" + Date.now(),
        email: targetEmail,
        name: targetEmail.split("@")[0] || "Admin",
        phone: "",
        role: "restaurant_admin",
        created_at: new Date().toISOString(),
      };
      localUsers.unshift(newAdminUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("manas_registered_users", JSON.stringify(localUsers));
      }
      await updateUserRoleInSupabase(newAdminUser.id, "restaurant_admin");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("manas_local_user_roles", JSON.stringify(localRoles));
    }

    // If current user logged in matches targetEmail, elevate live session
    if (typeof window !== "undefined" && user.email.toLowerCase() === targetEmail) {
      const activeUser = safeParseJSON<Record<string, any>>(localStorage.getItem("manas_user"), {});
      if (activeUser && activeUser.email) {
        localStorage.setItem("manas_user", JSON.stringify({ ...activeUser, role: "restaurant_admin" }));
      }
    }

    notify(`👑 Successfully granted Restaurant Admin access to ${targetEmail}!`, "success");
    setPromoteEmail("");
    refreshStaffUsers();
  };

  const availableCategories = Array.from(
    new Set([
      "Paneer Special",
      "Main Course",
      "Dal & Rice",
      "Breads",
      "Starters & Snacks",
      "Beverages",
      "Desserts",
      ...menuItems.map((i) => i.category).filter(Boolean),
    ])
  );



  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify("Image file size should be less than 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (isEdit) {
          setEditingItem((prev) => (prev ? { ...prev, image: resultStr } : null));
        } else {
          setNewItem((prev) => ({ ...prev, image: resultStr }));
        }
        notify("🖼️ Local image uploaded successfully!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // Form State
  const [newItem, setNewItem] = useState({
    name: "",
    price: 150,
    category: "Paneer Special",
    veg: true,
    rating: 4.8,
    description: "",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
  });



  const refreshStaffUsers = async () => {
    const userList = await fetchAllUserRolesAndProfiles();
    setStaffUsers(userList);
  };

  useEffect(() => {
    refreshStaffUsers();
    refreshMenu();

    const staffChannel = supabase
      .channel("realtime_staff_roles_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => refreshStaffUsers())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => refreshStaffUsers())
      .subscribe();

    return () => {
      supabase.removeChannel(staffChannel);
    };
  }, [activeTab, refreshMenu]);

  const activeOrdersList = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "pending_payment" && o.status !== "payment_submitted"
  );
  const pendingPaymentOrders = orders.filter(
    (o) => o.status === "payment_submitted" || o.status === "pending_payment"
  );
  const unverifiedPaymentCount = orders.filter((o) => o.status === "payment_submitted").length;

  const completedOrdersList = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");
  const activeOrdersCount = activeOrdersList.length;
  const completedOrdersCount = completedOrdersList.length;
  const totalRevenue = completedOrdersList.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);

  const filteredHistoryOrders = completedOrdersList.filter((o) => {
    const term = historySearch.toLowerCase().trim();
    if (!term) return true;
    return (
      String(o.id || "").toLowerCase().includes(term) ||
      String(o.customer_name || "").toLowerCase().includes(term) ||
      String(o.delivery_boy_name || "").toLowerCase().includes(term) ||
      String(o.phone || "").toLowerCase().includes(term) ||
      String(o.address || "").toLowerCase().includes(term) ||
      String(o.pincode || "").toLowerCase().includes(term)
    );
  });

  const getOrderCoordinates = (ord: any): { lat: number; lng: number; source?: string; mode?: string } => {
    // Mode 1: Google Maps Link Priority
    const effectiveLink =
      ord?.google_maps_link ||
      String(ord?.address || "").match(/\[Google Maps Link:\s*([^\]]+)\]/i)?.[1] ||
      String(ord?.address || "").match(/(https:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|google\.com\/maps)[^\s()\]]+)/i)?.[1];

    if (effectiveLink) {
      const parsedLink = parseGoogleMapsUrlCoordinates(effectiveLink);
      if (parsedLink) {
        return { lat: parsedLink.lat, lng: parsedLink.lng, source: "Customer Shared Google Maps Link", mode: "google_maps_link" };
      }
    }

    // Mode 2: GPS Device Hardware Pin Priority
    const match = String(ord?.address || "").match(/GPS Pin:?\s*([0-9.-]+),\s*([0-9.-]+)/i);
    if (match && match[1] && match[2]) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { lat, lng, source: "Customer Device GPS Pin", mode: "gps_device" };
      }
    }

    const latNum = Number(ord?.lat);
    const lngNum = Number(ord?.lng);
    const isDabokDefault = Math.abs(latNum - RESTAURANT_LAT) < 0.001 && Math.abs(lngNum - RESTAURANT_LNG) < 0.001;

    if (ord?.location_mode === "gps_device" && !isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
      return { lat: latNum, lng: lngNum, source: "Customer Device GPS Pin", mode: "gps_device" };
    }

    // Mode 3: Manual Address Geocoding (Institution & Locality matching)
    const fullText = `${ord?.street_address || ""} ${ord?.address || ""} ${ord?.landmark || ""}`.toLowerCase();
    for (const item of LOCALITY_KEYWORD_COORDINATES) {
      if (item.keywords.some((kw) => fullText.includes(kw))) {
        return { lat: item.lat, lng: item.lng, source: `Typed Address (${item.name})`, mode: "manual_address" };
      }
    }

    if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0 && !isDabokDefault) {
      return { lat: latNum, lng: lngNum, source: "Saved Coordinates", mode: ord?.location_mode || "manual_address" };
    }

    const pincodeStr = (ord?.pincode || String(ord?.address || "").match(/313\d{3}/)?.[0] || "").trim();
    if (pincodeStr && UDAIPUR_AREA_COORDINATES[pincodeStr]) {
      const area = UDAIPUR_AREA_COORDINATES[pincodeStr];
      return { lat: area.lat, lng: area.lng, source: `Typed Address (${area.name})`, mode: "manual_address" };
    }

    if (effectiveLink) {
      const parsed = parseGoogleMapsUrlCoordinates(effectiveLink);
      if (parsed) return { lat: parsed.lat, lng: parsed.lng, source: "Customer Shared Google Maps Link", mode: "google_maps_link" };
    }

    if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
      return { lat: latNum, lng: lngNum, source: "GPS Pin", mode: "manual_address" };
    }
    return { lat: RESTAURANT_LAT, lng: RESTAURANT_LNG, source: "Restaurant Dabok Branch", mode: "manual_address" };
  };

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStaffUsers = staffUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const finalCat = isCustomCategoryMode && customAddCategory.trim() ? customAddCategory.trim() : newItem.category;
    const finalDesc = newItem.description.trim() || `Freshly prepared delicious ${newItem.name} with authentic Indian spices.`;
    addMenuItem({
      ...newItem,
      category: finalCat,
      description: finalDesc,
    });
    setShowAddModal(false);
    setIsCustomCategoryMode(false);
    setCustomAddCategory("");
    setNewItem({
      name: "",
      price: 150,
      category: "Paneer Special",
      veg: true,
      rating: 4.8,
      description: "",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMenuItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleRoleChange = async (targetUserId: string, newRole: AppRole) => {
    setUpdatingUserRole(targetUserId);
    await updateUserRoleInSupabase(targetUserId, newRole);
    setUpdatingUserRole(null);
    setStaffUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
    );
    notify(`🎉 User role successfully updated to "${newRole.replace("_", " ")}"!`, "success");
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
        return <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black uppercase text-amber-600">New Order</span>;
      case "paid":
        return <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-600">✅ Paid & Verified</span>;
      case "accepted":
        return <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black uppercase text-blue-600">Accepted</span>;
      case "preparing":
        return <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-black uppercase text-purple-600">Preparing</span>;
      case "ready_for_pickup":
        return <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-black uppercase text-indigo-600">Ready for Pickup</span>;
      case "picked_up":
      case "out_for_delivery":
        return <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase text-cyan-600">Out for Delivery</span>;
      case "delivered":
        return <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-black uppercase text-green-600">Delivered</span>;
      default:
        return <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase text-neutral-600">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header & Stats Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-extrabold text-brand">
            <ShieldCheck size={14} /> RESTAURANT ADMIN DASHBOARD
          </span>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">
            Live Operations & Staff Control
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Authenticated Admin: <span className="font-bold text-ink dark:text-white">{user.name}</span> ({user.email})
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex max-w-full overflow-x-auto no-scrollbar gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px]",
              activeTab === "orders" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <ShoppingBag size={15} /> Realtime Live Orders ({activeOrdersCount})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition relative min-h-[44px]",
              activeTab === "payments" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <CreditCard size={15} /> Payment Verification
            {unverifiedPaymentCount > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                {unverifiedPaymentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px]",
              activeTab === "history" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <History size={15} /> Order & Delivery History ({completedOrdersCount})
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px]",
              activeTab === "menu" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <Utensils size={15} /> Menu ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px]",
              activeTab === "staff" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <Users size={15} /> Manage Staff & Roles
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition min-h-[44px]",
              activeTab === "messages" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <MessageSquare size={15} /> Customer Inquiries ({contactMessages.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Revenue</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-500/10 text-green-600">
              <DollarSign size={20} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-ink dark:text-white">₹{totalRevenue}</p>
          <p className="mt-1 text-[11px] font-semibold text-green-600 dark:text-green-400">✓ Includes Delivered Orders Only (Excludes Cancelled)</p>
        </div>

        <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Live Orders</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <ShoppingBag size={20} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-ink dark:text-white">{activeOrdersCount}</p>
        </div>

        <div className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Customer Inquiries</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
              <MessageSquare size={20} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-ink dark:text-white">{contactMessages.length} Messages</p>
        </div>
      </div>

      {/* TAB 1: REALTIME ORDERS */}
      {activeTab === "orders" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-ink dark:text-white">Incoming Order Stream</h2>
            <button onClick={refreshOrders} className="flex items-center gap-1 text-xs font-bold text-brand hover:underline">
              <RefreshCw size={14} /> Refresh List
            </button>
          </div>

          {activeOrdersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white py-20 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-5xl">📦</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">No active live orders</h3>
              <p className="text-xs text-neutral-500">Incoming active customer orders will appear here automatically in real-time.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeOrdersList.map((ord) => (
                <div
                  key={ord.id}
                  className="flex flex-col justify-between rounded-[24px] bg-white p-6 shadow-md ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                      <div>
                        <span className="text-xs font-black uppercase text-brand">Order #{ord.id}</span>
                        <p className="text-xs text-neutral-400">
                          {new Date(ord.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {getOrderStatusBadge(ord.status)}
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Items</p>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-semibold text-ink dark:text-white">
                          <span>{it.qty}x {it.name}</span>
                          <span>₹{it.price * it.qty}</span>
                        </div>
                      ))}
                      <div className="mt-2 flex justify-between border-t border-dashed pt-2 text-sm font-extrabold text-ink dark:text-white">
                        <span>Total</span>
                        <span className="text-brand">₹{ord.total} ({ord.payment})</span>
                      </div>
                    </div>

                    {/* STRUCTURED CUSTOMER & LOCATION CARD */}
                    <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/60 pb-2 dark:border-neutral-700/60">
                        <span className="text-xs font-bold text-ink dark:text-white">
                          👤 <strong>{ord.customer_name || "Customer"}</strong>
                        </span>
                        <a href={`tel:${ord.phone}`} className="text-xs font-bold text-brand hover:underline">
                          📞 {ord.phone}
                        </a>
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                        <p>
                          <strong>🏠 Street Address:</strong> {ord.street_address || ord.address}
                        </p>
                        {ord.landmark && (
                          <p>
                            <strong>📍 Landmark:</strong> {ord.landmark}
                          </p>
                        )}
                        <p>
                          <strong>🏙️ City / Pincode:</strong> {ord.city || "Udaipur"} {ord.pincode ? `— ${ord.pincode}` : ""}
                        </p>
                        {(() => {
                          if (!ord.google_maps_link) return null;
                          const check = sanitizeGoogleMapsUrl(ord.google_maps_link);
                          if (!check.valid || !check.cleanUrl) return null;
                          return (
                            <div className="mt-2 rounded-xl bg-blue-500/10 p-2.5 border border-blue-500/20">
                              <span className="block text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                🗺️ Customer Shared Google Maps Link:
                              </span>
                              <a
                                href={check.cleanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 truncate max-w-full"
                              >
                                <ExternalLink size={13} /> Open Customer's Shared Google Maps Link ➔
                              </a>
                            </div>
                          );
                        })()}
                      </div>

                      {/* LIVE CUSTOMER GPS LOCATION MAP & DIRECT GPS NAVIGATION */}
                      {(() => {
                        const coords = getOrderCoordinates(ord);
                        const effectiveCustomerLink =
                          ord?.google_maps_link ||
                          String(ord?.address || "").match(/\[Google Maps Link:\s*([^\]]+)\]/i)?.[1] ||
                          String(ord?.address || "").match(/(https:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|google\.com\/maps)[^\s()\]]+)/i)?.[1];
                        const navUrl = effectiveCustomerLink || `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

                        return (
                          <div className="mt-3 border-t border-neutral-200/60 pt-3 dark:border-neutral-700/60">
                            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                                🎯 Location: {coords.source || "Customer GPS"} ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                              </span>
                              <a
                                href={navUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-red-600/30 transition hover:scale-105 hover:bg-red-700"
                              >
                                <Navigation size={13} /> {effectiveCustomerLink ? "Open Customer's Exact Shared Link" : "Open Exact GPS Pin on Google Maps"}
                              </a>
                            </div>
                            <MapPlaceholder
                              height="h-44"
                              lat={coords.lat}
                              lng={coords.lng}
                              googleMapsUrl={navUrl}
                              title={`Delivery Destination #${ord.id} (${coords.source || "Customer Location"})`}
                              subtitle={`${ord.customer_name || "Customer"} — ${ord.street_address || ord.address}`}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {/* GATED DELIVERY BOY ASSIGNMENT SECTION */}
                    {ord.status === "ready_for_pickup" && (
                      <div className="mt-4 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/30 dark:bg-amber-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            🛵 Order Ready! Enter Delivery Boy Details:
                          </label>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <input
                            type="text"
                            placeholder="Delivery Boy Name (e.g. Ramesh)"
                            value={deliveryBoyMap[ord.id]?.name ?? (ord.delivery_boy_name || "")}
                            onChange={(e) =>
                              setDeliveryBoyMap((prev) => ({
                                ...prev,
                                [ord.id]: {
                                  name: e.target.value,
                                  phone: prev[ord.id]?.phone ?? (ord.delivery_boy_phone || ""),
                                },
                              }))
                            }
                            className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Delivery Boy Mobile (10-digits)"
                            value={deliveryBoyMap[ord.id]?.phone ?? (ord.delivery_boy_phone || "")}
                            onChange={(e) =>
                              setDeliveryBoyMap((prev) => ({
                                ...prev,
                                [ord.id]: {
                                  name: prev[ord.id]?.name ?? (ord.delivery_boy_name || ""),
                                  phone: e.target.value,
                                },
                              }))
                            }
                            className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const info = deliveryBoyMap[ord.id] || {
                              name: ord.delivery_boy_name || "",
                              phone: ord.delivery_boy_phone || "",
                            };
                            if (!info.name.trim()) {
                              notify("Please enter Delivery Boy Name first.", "error");
                              return;
                            }
                            if (!info.phone.trim() || !validatePhone(info.phone)) {
                              notify("Please enter a valid 10-digit Delivery Boy Mobile number.", "error");
                              return;
                            }
                            updateOrderStatus(ord.id, "out_for_delivery", {
                              delivery_boy_name: info.name.trim(),
                              delivery_boy_phone: info.phone.trim(),
                            });
                            notify(`📦 Order Dispatched! Customer notified with Delivery Boy details (${info.name}).`, "success");
                          }}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-extrabold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600"
                        >
                          📦 Dispatch Order & Send Details to Customer
                        </button>
                      </div>
                    )}

                    {ord.status === "out_for_delivery" && ord.delivery_boy_name && (
                      <div className="mt-4 rounded-2xl bg-emerald-500/10 p-3.5 border border-emerald-500/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        🛵 <strong>Out for Delivery</strong> — Assigned to: <strong>{ord.delivery_boy_name}</strong> (📞 {ord.delivery_boy_phone})
                      </div>
                    )}

                    {(ord.status === "placed" || ord.status === "paid" || ord.status === "accepted" || ord.status === "preparing") && (
                      <div className="mt-3 text-[11px] font-semibold text-neutral-400 italic">
                        🔒 Delivery Boy details form will unlock once order is marked "Ready for Pickup".
                      </div>
                    )}
                  </div>

                  {/* Status Lifecycle Control Buttons */}
                  <div className="mt-6 flex flex-wrap gap-2 pt-2">
                    {(ord.status === "placed" || ord.status === "paid") && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "accepted")}
                        className="flex-1 rounded-full bg-blue-600 py-2.5 text-xs font-bold text-white shadow transition hover:bg-blue-700"
                      >
                        Accept Order & Start Kitchen Pipeline
                      </button>
                    )}
                    {ord.status === "accepted" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "preparing")}
                        className="flex-1 rounded-full bg-purple-600 py-2.5 text-xs font-bold text-white shadow transition hover:bg-purple-700"
                      >
                        Start Preparing
                      </button>
                    )}
                    {ord.status === "preparing" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "ready_for_pickup")}
                        className="flex-1 rounded-full bg-indigo-600 py-2.5 text-xs font-bold text-white shadow transition hover:bg-indigo-700"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}
                    {ord.status === "out_for_delivery" && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, "delivered")}
                        className="flex-1 rounded-full bg-green-600 py-2.5 text-xs font-bold text-white shadow transition hover:bg-green-700"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {ord.status !== "delivered" && ord.status !== "cancelled" && (
                      <button
                        onClick={() => setCancellingOrderId(ord.id)}
                        className="rounded-full bg-red-100 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ZERO-COMMISSION DIRECT UPI PAYMENT VERIFICATION */}
      {activeTab === "payments" && (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
            <div>
              <h3 className="text-xl font-black text-ink dark:text-white flex items-center gap-2">
                💳 Zero-Commission Direct UPI Payment Verification
              </h3>
              <p className="text-xs text-neutral-500">
                Verify customer 12-digit UTR numbers and payment screenshots against your bank statement.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              {unverifiedPaymentCount} Pending Verification
            </span>
          </div>

          {pendingPaymentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white py-20 text-center shadow-sm dark:bg-neutral-900 mt-6">
              <span className="text-5xl">✨</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">No pending payment verifications</h3>
              <p className="text-xs text-neutral-500">All customer UPI payments have been verified and processed.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {pendingPaymentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                    <div>
                      <span className="text-xs font-black uppercase text-brand">Order #{ord.id}</span>
                      <p className="text-xs text-neutral-400">
                        {new Date(ord.date).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        ord.status === "payment_submitted"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      }`}
                    >
                      {ord.status === "payment_submitted" ? "⏳ UTR Submitted" : "⚠️ Payment Pending"}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-neutral-50 p-4 border border-neutral-200/80 dark:bg-neutral-800/40 dark:border-neutral-700/60 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-neutral-500">Customer Name:</span>
                      <span className="font-extrabold text-ink dark:text-white">{ord.customer_name || "Customer"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-neutral-500">Customer Phone:</span>
                      <a href={`tel:${ord.phone}`} className="font-bold text-brand hover:underline">
                        📞 {ord.phone}
                      </a>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-neutral-500">Total Payable:</span>
                      <span className="font-black text-emerald-600 text-sm">₹{ord.total}</span>
                    </div>

                    <div className="mt-2 flex justify-between items-center bg-white p-3 rounded-xl border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Submitted 12-Digit UTR Number
                        </span>
                        <span className="font-black tracking-widest text-ink dark:text-white text-base">
                          {ord.utr_number ? `#${ord.utr_number}` : "Not Submitted Yet"}
                        </span>
                      </div>
                      {ord.utr_number && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(ord.utr_number || "");
                            notify("UTR copied to clipboard!", "success");
                          }}
                          className="rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                          Copy UTR
                        </button>
                      )}
                    </div>

                    {ord.payment_submitted_at && (
                      <div className="flex justify-between items-center text-[11px] text-neutral-400">
                        <span>Submitted Timestamp:</span>
                        <span>{new Date(ord.payment_submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}
                  </div>

                  {/* Screenshot Proof Button */}
                  {ord.payment_proof_url ? (
                    <button
                      type="button"
                      onClick={() => setSelectedProofUrl(ord.payment_proof_url || null)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      🖼️ View Uploaded Screenshot Proof
                    </button>
                  ) : (
                    <p className="mt-2 text-center text-[11px] font-semibold text-neutral-400">
                      No screenshot uploaded (verify using 12-digit UTR above)
                    </p>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        adminVerifyOrderPayment(ord.id, true);
                        notify(`Order #${ord.id} Payment Verified! Order moved to Realtime Live Kitchen Pipeline.`, "success");
                        setActiveTab("orders");
                      }}
                      className="flex-1 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition"
                    >
                      ✅ Verify Payment & Move to Live Kitchen Pipeline ➔
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingPaymentOrder(ord)}
                      className="rounded-2xl bg-red-100 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-200 dark:bg-red-950/40 dark:text-red-400"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDER & DELIVERY HISTORY */}
      {activeTab === "history" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-ink dark:text-white">Completed Order & Delivery History Log</h2>
              <p className="text-xs text-neutral-500">Archived delivered orders, completed deliveries & transaction log.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search history by Order ID, Customer or Delivery Boy..."
                  className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              {completedOrdersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => exportOrdersToCsv(filteredHistoryOrders)}
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-4.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-emerald-600/30 transition hover:scale-105 hover:bg-emerald-700"
                >
                  <FileSpreadsheet size={15} /> Export Executive Sales Report (.XLS Excel)
                </button>
              )}
            </div>
          </div>

          {filteredHistoryOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white py-20 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-5xl">📜</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">No order history found</h3>
              <p className="text-xs text-neutral-500">Completed and delivered orders will automatically archive here.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredHistoryOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex flex-col justify-between rounded-[24px] bg-white p-6 shadow-md ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                      <div>
                        <span className="text-xs font-black uppercase text-brand">Order #{ord.id}</span>
                        <p className="text-xs text-neutral-400">
                          {new Date(ord.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {getOrderStatusBadge(ord.status)}
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Customer & Items</p>
                      <p className="text-xs font-semibold text-ink dark:text-white">
                        👤 <strong>{ord.customer_name || "Customer"}</strong> (📞 {ord.phone})
                      </p>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-semibold text-ink dark:text-white">
                          <span>{it.qty}x {it.name}</span>
                          <span>₹{it.price * it.qty}</span>
                        </div>
                      ))}
                      <div className="mt-2 flex justify-between border-t border-dashed pt-2 text-sm font-extrabold text-ink dark:text-white">
                        <span>Total</span>
                        <span className="text-brand">₹{ord.total} ({ord.payment})</span>
                      </div>
                    </div>

                    {/* STRUCTURED CUSTOMER & LOCATION CARD */}
                    <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3.5 dark:border-neutral-800 dark:bg-neutral-800/40">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/60 pb-2 dark:border-neutral-700/60">
                        <span className="text-xs font-bold text-ink dark:text-white">
                          👤 <strong>{ord.customer_name || "Customer"}</strong>
                        </span>
                        <a href={`tel:${ord.phone}`} className="text-xs font-bold text-brand hover:underline">
                          📞 {ord.phone}
                        </a>
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                        <p>
                          <strong>🏠 Street Address:</strong> {ord.street_address || ord.address}
                        </p>
                        {ord.landmark && (
                          <p>
                            <strong>📍 Landmark:</strong> {ord.landmark}
                          </p>
                        )}
                        <p>
                          <strong>🏙️ City / Pincode:</strong> {ord.city || "Udaipur"} {ord.pincode ? `— ${ord.pincode}` : ""}
                        </p>
                      </div>

                      {/* LIVE CUSTOMER GPS LOCATION MAP & DIRECT GPS NAVIGATION */}
                      {(() => {
                        const coords = getOrderCoordinates(ord);
                        return (
                          <div className="mt-3 border-t border-neutral-200/60 pt-3 dark:border-neutral-700/60">
                            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                                🎯 Customer GPS Pin ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                              </span>
                              <a
                                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-red-600/30 transition hover:scale-105 hover:bg-red-700"
                              >
                                <Navigation size={13} /> Open Exact GPS Pin on Google Maps
                              </a>
                            </div>
                            <MapPlaceholder
                              height="h-44"
                              lat={coords.lat}
                              lng={coords.lng}
                              title={`Delivered Destination #${ord.id}`}
                              subtitle={`Exact Customer Pin: ${ord.customer_name || "Customer"}`}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {ord.delivery_boy_name && (
                      <div className="mt-4 rounded-2xl bg-emerald-500/10 p-3.5 border border-emerald-500/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        🛵 <strong>Delivered By:</strong> {ord.delivery_boy_name} (📞 {ord.delivery_boy_phone})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MENU MANAGEMENT */}
      {activeTab === "menu" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              <Plus size={16} /> Add New Dish
            </button>
          </div>

          <div className="overflow-x-auto rounded-[24px] bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 uppercase tracking-wider font-bold dark:bg-neutral-800/50 dark:border-neutral-800">
                <tr>
                  <th className="p-4">Dish</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredMenuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-ink dark:text-white">{item.name}</p>
                          <p className="line-clamp-1 text-[11px] text-neutral-400">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">{item.category}</td>
                    <td className="p-4 font-black text-brand">₹{item.price}</td>
                    <td className="p-4">
                      <VegBadge veg={item.veg} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-brand/10 hover:text-brand dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* TAB 4: MANAGE STAFF & USER ROLES (ADMIN ONLY) */}
      {activeTab === "staff" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-ink dark:text-white">Manage Staff & User Database Roles</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Assign or update roles in Supabase <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-brand">user_roles</code> table.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshStaffUsers}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <RefreshCw size={13} /> Refresh Users
              </button>
              <div className="relative w-full max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="Search staff or email..."
                  className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Quick Grant Admin Access by Email Card */}
          <div className="rounded-[24px] border border-brand/20 bg-gradient-to-r from-brand/5 via-brand/10 to-transparent p-5 shadow-sm dark:border-brand/30 dark:bg-neutral-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-ink dark:text-white">
                  👑 Grant Admin Permission by Email
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Type any registered user's email address below to instantly make them a Restaurant Admin / Staff.
                </p>
              </div>
              <form onSubmit={handlePromoteByEmail} className="flex items-center gap-2">
                <input
                  required
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="Enter User Email (e.g. user@gmail.com)"
                  className="w-64 rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded-xl bg-brand py-2 px-4 text-xs font-extrabold text-white shadow-md shadow-brand/30 transition hover:bg-brand-dark"
                >
                  Make Admin 👑
                </button>
              </form>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[24px] bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-400 uppercase tracking-wider font-bold dark:bg-neutral-800/50 dark:border-neutral-800">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Database Role</th>
                  <th className="p-4 text-right">Change Role (Admin Control)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredStaffUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400">
                      No user records found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredStaffUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand font-black">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-bold text-ink dark:text-white">{u.name}</p>
                            {u.phone && <p className="text-[10px] text-neutral-400">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider",
                            u.role === "restaurant_admin"
                              ? "bg-brand/10 text-brand"
                              : u.role === "delivery_partner"
                              ? "bg-purple-500/10 text-purple-600"
                              : "bg-blue-500/10 text-blue-600"
                          )}
                        >
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          disabled={updatingUserRole === u.id}
                          value={u.role === "delivery_partner" ? "customer" : u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as AppRole)}
                          className="rounded-xl border border-neutral-200 bg-white p-2 text-xs font-bold text-ink outline-none transition focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                          <option value="customer">Customer</option>
                          <option value="restaurant_admin">Restaurant Admin / Staff</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMER MESSAGES */}
      {activeTab === "messages" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-ink dark:text-white">Customer Inquiries & Messages ({contactMessages.length})</h2>
          </div>

          {contactMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white py-20 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-5xl">💬</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">No customer messages received yet</h3>
              <p className="text-xs text-neutral-500">Messages sent via the Contact Us form will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex flex-col justify-between rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                      <div>
                        <h4 className="font-extrabold text-ink dark:text-white">{msg.name}</h4>
                        <p className="text-xs font-semibold text-brand">{msg.email}</p>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400">
                        {new Date(msg.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                      "{msg.message}"
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <button
                      onClick={() => deleteContactMessage(msg.id)}
                      className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={13} /> Delete Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setEditingItem(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-[28px] bg-white p-6 shadow-xl dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-ink dark:text-white">Edit Dish Details</h3>
                <button onClick={() => setEditingItem(null)} className="rounded-full p-1 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"><X size={18} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500">Dish Name</label>
                  <input required value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} placeholder="Dish Name" className="w-full rounded-xl border p-3 text-xs outline-none dark:bg-neutral-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full rounded-xl border p-3 text-xs font-semibold outline-none dark:bg-neutral-800 dark:text-white"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500">Price (₹)</label>
                  <input required type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} placeholder="Price (₹)" className="w-full rounded-xl border p-3 text-xs outline-none dark:bg-neutral-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-neutral-500">Description</label>
                  <textarea required value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Description" rows={3} className="w-full rounded-xl border p-3 text-xs outline-none dark:bg-neutral-800 dark:text-white" />
                </div>

                {/* Dish Image Management */}
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-neutral-600 dark:text-neutral-300">
                    Dish Photo (Upload File or Paste Image Link)
                  </label>
                  
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-brand/20 bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={editingItem.image}
                        alt="Dish Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80";
                        }}
                      />
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white">Preview</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand bg-brand/5 py-2 px-3 text-xs font-bold text-brand transition hover:bg-brand/10">
                        <Upload size={14} /> Upload Image File from Computer
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, true)}
                        />
                      </label>

                      <input
                        type="url"
                        value={editingItem.image}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="Or paste Image URL (https://...)"
                        className="w-full rounded-xl border p-2.5 text-xs font-medium outline-none focus:border-brand dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-full bg-brand py-3 font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD ITEM MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-[28px] bg-white p-6 shadow-xl dark:bg-neutral-900">
              <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                <div>
                  <h3 className="text-lg font-bold text-ink dark:text-white">Add New Dish</h3>
                  <p className="text-[11px] text-neutral-400">Set name, category, price and upload dish photo</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="rounded-full p-1 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"><X size={18} /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-neutral-600 dark:text-neutral-300">Dish Name</label>
                  <input required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Dish Name (e.g. Shahi Paneer)" className="w-full rounded-xl border p-3 text-xs font-semibold outline-none focus:border-brand dark:bg-neutral-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-neutral-600 dark:text-neutral-300">Category (Select Menu Category)</label>
                  <select
                    value={isCustomCategoryMode ? "CUSTOM" : newItem.category}
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setIsCustomCategoryMode(true);
                      } else {
                        setIsCustomCategoryMode(false);
                        setNewItem({ ...newItem, category: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl border p-3 text-xs font-semibold outline-none focus:border-brand dark:bg-neutral-800 dark:text-white"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Add New Custom Category...</option>
                  </select>
                  {isCustomCategoryMode && (
                    <input
                      required
                      type="text"
                      value={customAddCategory}
                      onChange={(e) => setCustomAddCategory(e.target.value)}
                      placeholder="Type custom category name (e.g. South Indian Special)"
                      className="mt-2 w-full rounded-xl border border-brand p-3 text-xs font-semibold outline-none dark:bg-neutral-800 dark:text-white"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-neutral-600 dark:text-neutral-300">Price (₹)</label>
                  <input required type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} placeholder="Price (₹)" className="w-full rounded-xl border p-3 text-xs font-semibold outline-none focus:border-brand dark:bg-neutral-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-neutral-600 dark:text-neutral-300">Description</label>
                  <textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Short description of ingredients or taste (Optional)" rows={3} className="w-full rounded-xl border p-3 text-xs font-semibold outline-none focus:border-brand dark:bg-neutral-800 dark:text-white" />
                </div>

                {/* Dish Image Management */}
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-neutral-600 dark:text-neutral-300">
                    Dish Photo (Upload File or Paste Image Link)
                  </label>
                  
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-brand/20 bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={newItem.image}
                        alt="Dish Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80";
                        }}
                      />
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white">Preview</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand bg-brand/5 py-2 px-3 text-xs font-bold text-brand transition hover:bg-brand/10">
                        <Upload size={14} /> Upload Image File from Computer
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, false)}
                        />
                      </label>

                      <input
                        type="url"
                        value={newItem.image}
                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                        placeholder="Or paste Image URL (https://...)"
                        className="w-full rounded-xl border p-2.5 text-xs font-medium outline-none focus:border-brand dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-full bg-brand py-3.5 font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark">Save Dish</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCELLATION REASON MODAL */}
      <AnimatePresence>
        {cancellingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setCancellingOrderId(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                <h3 className="font-extrabold text-ink dark:text-white">
                  Cancel Order #{cancellingOrderId}
                </h3>
                <button
                  onClick={() => setCancellingOrderId(null)}
                  className="rounded-full p-1 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-4 text-xs text-neutral-500">
                Select a cancellation reason for customer record & audit log:
              </p>

              <div className="mt-4 space-y-2">
                {[
                  "Item Out of Stock",
                  "Kitchen Overloaded / Too Busy",
                  "Delivery Address Unreachable",
                  "Customer Requested Cancellation",
                  "Other / Custom Reason",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-xs font-semibold cursor-pointer transition",
                      cancelReason === reason
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      className="accent-brand"
                    />
                    {reason}
                  </label>
                ))}
              </div>

              {cancelReason === "Other / Custom Reason" && (
                <textarea
                  placeholder="Type custom cancellation reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs font-semibold outline-none focus:border-brand dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                  rows={2}
                />
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingOrderId(null)}
                  className="flex-1 rounded-full border border-neutral-300 py-2.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalReason =
                      cancelReason === "Other / Custom Reason"
                        ? customReason.trim() || "Canceled by restaurant admin"
                        : cancelReason;

                    updateOrderStatus(cancellingOrderId, "cancelled", {
                      cancellation_reason: finalReason,
                    });
                    notify(`Order #${cancellingOrderId} cancelled (${finalReason}).`, "info");
                    setCancellingOrderId(null);
                  }}
                  className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* SCREENSHOT PROOF LIGHTBOX MODAL */}
        {selectedProofUrl && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-[28px] bg-neutral-900 border border-white/15 p-4 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedProofUrl(null)}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black"
              >
                <X size={18} />
              </button>
              <h4 className="text-sm font-extrabold text-white mb-3">Customer Payment Screenshot Proof</h4>
              <img
                src={selectedProofUrl}
                alt="Payment Screenshot Proof"
                className="max-h-[75vh] w-full object-contain rounded-2xl border border-white/10"
              />
            </motion.div>
          </div>
        )}

        {/* PAYMENT REJECTION MODAL */}
        {rejectingPaymentOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setRejectingPaymentOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-neutral-900"
            >
              <h3 className="text-lg font-bold text-ink dark:text-white">
                Reject Payment for Order #{rejectingPaymentOrder.id}
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Please select or type a rejection reason for the customer.
              </p>

              <div className="mt-4 space-y-2">
                {[
                  "Invalid UTR Number / Payment Not Received in Bank Statement",
                  "Amount mismatch (paid less than total payable amount)",
                  "Fake or unreadable payment screenshot proof",
                  "Duplicate UTR number submitted",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-xs font-semibold cursor-pointer transition",
                      rejectionReasonInput === reason
                        ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="rejection_reason"
                      checked={rejectionReasonInput === reason}
                      onChange={() => setRejectionReasonInput(reason)}
                      className="accent-red-600"
                    />
                    {reason}
                  </label>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingPaymentOrder(null)}
                  className="flex-1 rounded-full border border-neutral-300 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adminVerifyOrderPayment(rejectingPaymentOrder.id, false, rejectionReasonInput);
                    setRejectingPaymentOrder(null);
                  }}
                  className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700"
                >
                  Reject Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

```

---

### File: `src/pages/DeliveryDashboard.tsx`
```typescript
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bike,
  CheckCircle,
  MapPin,
  Navigation,
  PackageCheck,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  fetchDeliveryPartnersFromSupabase,
  getOrCreateDeliveryPartnerProfile,
  toggleDeliveryPartnerAvailability,
  type DeliveryPartner,
} from "../lib/supabase";
import { cn } from "../utils/cn";

export default function DeliveryDashboard() {
  const { user, orders, updateOrderStatus, notify } = useApp();
  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assigned" | "history">("assigned");

  useEffect(() => {
    async function loadPartnerProfile() {
      setLoading(true);
      if (user.isLoggedIn) {
        const profile = await getOrCreateDeliveryPartnerProfile(user.id, user.name, user.phone);
        setPartner(profile);
      } else {
        const partners = await fetchDeliveryPartnersFromSupabase();
        if (partners.length > 0) {
          setPartner(partners[0]);
        }
      }
      setLoading(false);
    }
    loadPartnerProfile();
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!partner) return;
    const nextState = !partner.is_available;
    setPartner({ ...partner, is_available: nextState });
    const res = await toggleDeliveryPartnerAvailability(partner.id, nextState);
    if (res.success) {
      notify(
        nextState
          ? "🟢 You are now ONLINE & ready for deliveries!"
          : "🔴 You are now OFFLINE",
        nextState ? "success" : "info"
      );
    }
  };

  const partnerOrders = orders.filter(
    (o) =>
      o.assigned_delivery_partner_id === partner?.id ||
      (partner && o.status !== "placed" && o.status !== "cancelled" && (!o.assigned_delivery_partner_id || o.assigned_delivery_partner_id === partner.id))
  );

  const activeDeliveries = partnerOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const completedDeliveries = partnerOrders.filter((o) => o.status === "delivered");

  const getNextStatusAction = (status: string) => {
    switch (status) {
      case "ready_for_pickup":
      case "preparing":
      case "accepted":
        return {
          nextStatus: "picked_up",
          label: "Mark Picked Up",
          icon: PackageCheck,
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "picked_up":
        return {
          nextStatus: "out_for_delivery",
          label: "Start Delivery (Out for Delivery)",
          icon: Navigation,
          btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
        };
      case "out_for_delivery":
        return {
          nextStatus: "delivered",
          label: "Complete Delivery (Delivered)",
          icon: CheckCircle2,
          btnClass: "bg-green-600 hover:bg-green-700 text-white",
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-28">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-neutral-500">Loading Delivery Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header Banner */}
      <div className="flex flex-col gap-6 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Bike size={32} />
          </span>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand">
              DELIVERY PARTNER DASHBOARD
            </span>
            <h1 className="text-2xl font-black text-ink dark:text-white">
              {partner?.name || user.name || "Delivery Fleet Partner"}
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Vehicle: <span className="font-semibold text-ink dark:text-white">{partner?.vehicle_number || "RJ-27-EV-1008"}</span> • Phone: {partner?.phone || user.phone || "+91 9876543210"}
            </p>
          </div>
        </div>

        {/* Duty Status */}
        <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <div>
            <p className="text-xs font-extrabold text-ink dark:text-white">Duty Status</p>
            <p className={cn("text-xs font-bold", partner?.is_available ? "text-green-600" : "text-neutral-400")}>
              {partner?.is_available ? "🟢 Available for Orders" : "🔴 Offline"}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className="text-brand transition hover:scale-105"
            title="Click to toggle availability"
          >
            {partner?.is_available ? (
              <ToggleRight size={42} className="text-green-600" />
            ) : (
              <ToggleLeft size={42} className="text-neutral-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex max-w-full overflow-x-auto no-scrollbar gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("assigned")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition min-h-[44px]",
            activeTab === "assigned"
              ? "bg-brand text-white shadow-lg shadow-brand/20"
              : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300"
          )}
        >
          <Bike size={18} /> Active Deliveries ({activeDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition min-h-[44px]",
            activeTab === "history"
              ? "bg-brand text-white shadow-lg shadow-brand/20"
              : "bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300"
          )}
        >
          <CheckCircle size={18} /> Delivery History ({completedDeliveries.length})
        </button>
      </div>

      {/* Orders Grid */}
      <div className="mt-6">
        {activeTab === "assigned" ? (
          activeDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white py-20 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-5xl">🛵</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">No active assigned deliveries</h3>
              <p className="text-xs text-neutral-500">
                New orders assigned to you by the restaurant will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeDeliveries.map((ord) => {
                const action = getNextStatusAction(ord.status);
                return (
                  <motion.div
                    key={ord.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col justify-between rounded-[24px] bg-white p-6 shadow-md ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                        <div>
                          <span className="text-xs font-black uppercase text-brand">Order #{ord.id}</span>
                          <p className="text-xs text-neutral-400">
                            {new Date(ord.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider",
                            ord.status === "ready_for_pickup"
                              ? "bg-amber-500/10 text-amber-600"
                              : ord.status === "picked_up"
                              ? "bg-blue-500/10 text-blue-600"
                              : ord.status === "out_for_delivery"
                              ? "bg-purple-500/10 text-purple-600"
                              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                          )}
                        >
                          {ord.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order Items</p>
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-semibold text-ink dark:text-white">
                            <span>{it.qty}x {it.name}</span>
                            <span>₹{it.price * it.qty}</span>
                          </div>
                        ))}
                        <div className="mt-2 flex justify-between border-t border-dashed pt-2 text-sm font-extrabold text-ink dark:text-white">
                          <span>Total Amount to Collect</span>
                          <span className="text-brand">₹{ord.total} ({ord.payment})</span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/60">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="mt-0.5 text-brand shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-ink dark:text-white">Delivery Address</p>
                            <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">{ord.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {action && (
                      <button
                        onClick={() =>
                          updateOrderStatus(ord.id, action.nextStatus, {
                            assigned_delivery_partner_id: partner?.id,
                            delivery_boy_name: partner?.name || user.name || "Delivery Partner",
                            delivery_boy_phone: partner?.phone || user.phone || "9876543210",
                          })
                        }
                        className={cn(
                          "mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold shadow-lg transition hover:scale-[1.01]",
                          action.btnClass
                        )}
                      >
                        <action.icon size={18} /> {action.label}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )
        ) : (
          completedDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white py-20 text-center shadow-sm dark:bg-neutral-900">
              <span className="text-5xl">📋</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">No delivery history yet</h3>
              <p className="text-xs text-neutral-500">Completed deliveries will be archived here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedDeliveries.map((ord) => (
                <div
                  key={ord.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-ink dark:text-white">#{ord.id}</span>
                      <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-green-600">
                        Delivered
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {ord.address} • Total: ₹{ord.total}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-neutral-400">
                    Delivered at: {ord.delivered_at ? new Date(ord.delivered_at).toLocaleTimeString() : new Date(ord.date).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

```

---

### File: `src/pages/Unauthorized.tsx`
```typescript
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Unauthorized() {
  const { user } = useApp();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="grid h-24 w-24 place-items-center rounded-3xl bg-red-500/10 text-red-500 shadow-xl"
      >
        <ShieldAlert size={50} />
      </motion.div>

      <h1 className="mt-6 text-3xl font-black text-ink dark:text-white">
        Access Restricted
      </h1>
      <p className="mt-2 text-xs text-neutral-500">
        Your logged in role is <span className="font-bold text-brand uppercase">{user.role.replace("_", " ")}</span>. You do not have permission to access this protected route.
      </p>

      <div className="mt-6 rounded-2xl bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-300">
        Staff and Admin roles are granted securely by the restaurant owner via the Database Admin Control Panel.
      </div>

      <Link
        to="/menu"
        className="mt-8 rounded-full bg-brand px-7 py-3 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
      >
        Return to Restaurant Menu
      </Link>
    </div>
  );
}

```

---

### File: `setup_production_database.sql`
```sql
-- =========================================================================
-- MANAS RESTAURANT & RESORT — MASTER PRODUCTION DATABASE SETUP & SYNC SCRIPT
-- Copy and paste this script into Production Supabase SQL Editor and click 'Run'.
-- Project URL: https://supabase.com/dashboard/project/dqeremeigtjjlrwrwsny/sql/new
-- =========================================================================

-- 1. CLEAN RESET PUBLIC SCHEMA (Wipes old broken tables & constraints cleanly)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- 2. Create menu_items table
CREATE TABLE public.menu_items (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  veg BOOLEAN DEFAULT TRUE,
  rating NUMERIC DEFAULT 4.5,
  description TEXT,
  image TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create orders table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'placed',
  address TEXT NOT NULL,
  payment TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  street_address TEXT,
  landmark TEXT,
  city TEXT DEFAULT 'Udaipur',
  pincode TEXT DEFAULT '313001',
  google_maps_link TEXT,
  location_mode TEXT,
  assigned_delivery_partner_id UUID,
  delivery_boy_name TEXT,
  delivery_boy_phone TEXT,
  utr_number TEXT,
  payment_proof_url TEXT,
  payment_submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'restaurant_admin', 'delivery_partner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create delivery_partners table
CREATE TABLE public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_number TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create contact_messages table
CREATE TABLE public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Grant Table Access Permissions to anon, authenticated, service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role, postgres;

-- 9. Enable Row Level Security & Policies
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

-- 10. Enable Full Replica Identity for 100% Realtime DELETE events
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

CREATE POLICY "Everyone can read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert menu items" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update menu items" ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete menu items" ON public.menu_items FOR DELETE USING (true);

CREATE POLICY "Everyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can read contact messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Everyone can delete contact messages" ON public.contact_messages FOR DELETE USING (true);

CREATE POLICY "Anyone can read customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update customers" ON public.customers FOR UPDATE USING (true);

CREATE POLICY "Anyone can read user_roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_roles" ON public.user_roles FOR UPDATE USING (true);

CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Anyone can read delivery_partners" ON public.delivery_partners FOR SELECT USING (true);
CREATE POLICY "Anyone can insert delivery_partners" ON public.delivery_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update delivery_partners" ON public.delivery_partners FOR UPDATE USING (true);

-- 11. Enable Realtime Publications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'delivery_partners') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_partners;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contact_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
  END IF;
END $$;

-- 12. Functions & Triggers
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
  RETURN COALESCE(v_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Auto-Assign Admin Permissions for troxin694@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'restaurant_admin'
FROM auth.users
WHERE LOWER(email) = 'troxin694@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'restaurant_admin';

-- 14. Populate All 160 Food Items
INSERT INTO public.menu_items (id, name, price, category, veg, rating, description, image, image_url) OVERRIDING SYSTEM VALUE VALUES
(1, 'Sweet Lassi', 50, 'Drinks', true, 4.6, 'Thick, creamy sweetened yogurt drink in kulhad.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(2, 'Masala Lassi', 50, 'Drinks', true, 4.5, 'Yogurt drink blended with roasted spices & mint.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(3, 'Cold Coffee', 50, 'Drinks', true, 4.6, 'Chilled blended coffee with ice cream scoop.', 'https://images.pexels.com/photos/33094574/pexels-photo-33094574.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/33094574/pexels-photo-33094574.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(4, 'Rose Shake', 50, 'Drinks', true, 4.4, 'Refreshing rose flavoured milkshake.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(5, 'Tomato Soup', 130, 'Soup', true, 4.4, 'Creamy tomato soup served with croutons.', 'https://images.pexels.com/photos/17696681/pexels-photo-17696681.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/17696681/pexels-photo-17696681.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(6, 'Hot & Sour Soup', 150, 'Soup', true, 4.5, 'Tangy & spicy hot & sour soup with veggies.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(7, 'Manchow Soup', 150, 'Soup', true, 4.5, 'Spicy manchow soup topped with fried noodles.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(8, 'Aloo Paratha + Curd', 80, 'Breakfast', true, 4.6, 'Stuffed potato paratha served with fresh curd.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(9, 'Mix Paratha + Curd', 90, 'Breakfast', true, 4.6, 'Mixed veg stuffed paratha with curd.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(10, 'Pyaaz Paratha + Curd', 80, 'Breakfast', true, 4.5, 'Onion stuffed paratha served with curd.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(11, 'Paneer Paratha + Curd', 90, 'Breakfast', true, 4.7, 'Cottage cheese stuffed paratha with curd.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(12, 'Gobhi Paratha + Curd', 80, 'Breakfast', true, 4.5, 'Cauliflower stuffed paratha with curd.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(13, 'Chhole-Bhature', 90, 'Breakfast', true, 4.8, 'Fluffy bhature served with spiced chickpeas.', 'https://images.unsplash.com/photo-1626132647524-4a77be5178cf?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1626132647524-4a77be5178cf?auto=format&fit=crop&w=600&h=600&q=80'),
(14, 'Pav Bhaji', 70, 'Breakfast', true, 4.7, 'Buttery mashed veg curry with soft pav.', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80'),
(15, 'Finger Chips', 70, 'Breakfast', true, 4.4, 'Crispy golden potato finger chips.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(16, 'Veg Sandwich', 40, 'Snacks', true, 4.3, 'Fresh vegetable sandwich with chutney.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(17, 'Bread Butter', 40, 'Snacks', true, 4.1, 'Soft bread with a generous layer of butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(18, 'Cheese Masala Toast Sandwich', 120, 'Snacks', true, 4.6, 'Toasted sandwich loaded with cheese & masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(19, 'Veg Cheese Grill Sandwich', 100, 'Snacks', true, 4.5, 'Grilled sandwich with veggies & melted cheese.', 'https://images.pexels.com/photos/29747752/pexels-photo-29747752.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/29747752/pexels-photo-29747752.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(20, 'Hara Bahara Kabab', 180, 'Snacks', true, 4.7, 'Spinach & green pea patties, crisp and healthy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(21, 'Veg Pakoda', 140, 'Snacks', true, 4.4, 'Crunchy mixed vegetable fritters.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(22, 'Paneer Pakoda', 160, 'Snacks', true, 4.6, 'Batter-fried paneer fritters, hot & crisp.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(23, 'Peanut Chaat', 160, 'Snacks', true, 4.5, 'Tangy peanut chaat with onions & spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(24, 'Peanut Masala', 140, 'Snacks', true, 4.4, 'Roasted peanuts tossed with masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(25, 'Sweet Corn Chaat', 140, 'Snacks', true, 4.5, 'Buttery sweet corn tossed with tangy spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(26, 'Chana Roast (Kabuli)', 140, 'Snacks', true, 4.4, 'Roasted kabuli chana with masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(27, 'Paneer Tikka (Dry)', 220, 'Snacks', true, 4.8, 'Char-grilled marinated paneer, dry style.', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80'),
(28, 'Namkeen Chaat', 120, 'Snacks', true, 4.3, 'Savoury namkeen chaat with chutneys.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(29, 'Red Sauce Pasta', 100, 'Chinese', true, 4.5, 'Pasta tossed in tangy red tomato sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(30, 'White Sauce Pasta', 120, 'Chinese', true, 4.6, 'Creamy white sauce pasta with herbs.', 'https://images.pexels.com/photos/29039084/pexels-photo-29039084.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/29039084/pexels-photo-29039084.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(31, 'Veg Noodles', 100, 'Chinese', true, 4.5, 'Wok-tossed noodles with fresh vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(32, 'Hakka Noodles', 120, 'Chinese', true, 4.6, 'Classic hakka noodles with crunchy veggies.', 'https://images.pexels.com/photos/18698263/pexels-photo-18698263.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/18698263/pexels-photo-18698263.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(33, 'Schezwan Noodles', 120, 'Chinese', true, 4.6, 'Fiery Schezwan noodles with vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(34, 'American Chopsuey', 120, 'Chinese', true, 4.5, 'Crispy noodles topped with sweet & tangy sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(35, 'Chinese Bhel', 120, 'Chinese', true, 4.4, 'Crunchy Indo-Chinese bhel with veggies.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(36, 'Veg Manchurian', 110, 'Chinese', true, 4.6, 'Fried veg balls in spicy Manchurian gravy.', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/29631426/pexels-photo-29631426.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(37, 'Dry Manchurian', 120, 'Chinese', true, 4.6, 'Crisp veg balls tossed in dry Manchurian sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(38, 'Mushroom Chilli', 140, 'Chinese', true, 4.6, 'Mushrooms tossed in spicy chilli gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(39, 'Dry Mushroom Chilli', 160, 'Chinese', true, 4.7, 'Dry style spicy chilli mushrooms.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(40, 'Paneer Chilli', 130, 'Chinese', true, 4.7, 'Paneer cubes in spicy chilli gravy.', 'https://images.pexels.com/photos/29631468/pexels-photo-29631468.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/29631468/pexels-photo-29631468.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(41, 'Dry Paneer Chilli', 150, 'Chinese', true, 4.8, 'Paneer tossed dry in tangy chilli sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(42, 'Honey Chilli Potato', 150, 'Chinese', true, 4.7, 'Crispy potatoes glazed in honey chilli sauce.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(43, 'Veg Fry Rice', 120, 'Chinese', true, 4.5, 'Fried rice tossed with fresh vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(44, 'Schezwan Fry Rice', 140, 'Chinese', true, 4.6, 'Spicy Schezwan flavoured fried rice.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(45, 'Singapore Fry Rice', 160, 'Chinese', true, 4.6, 'Aromatic Singapore-style fried rice.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(46, 'Manas (Special) Fry Rice', 260, 'Chinese', true, 4.9, 'Chef''s special loaded fried rice.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(47, 'Manas Special Pizza', 180, 'Pizza', true, 4.9, 'Signature loaded pizza with extra toppings.', 'https://images.pexels.com/photos/28945103/pexels-photo-28945103.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/28945103/pexels-photo-28945103.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(48, 'Onion Pizza', 120, 'Pizza', true, 4.4, 'Cheesy pizza topped with onions.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(49, 'Onion Tomato Pizza', 120, 'Pizza', true, 4.5, 'Classic pizza with onion & tomato.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(50, 'Mushroom Pizza', 120, 'Pizza', true, 4.5, 'Pizza topped with fresh mushrooms.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(51, 'Pineapple Pizza', 120, 'Pizza', true, 4.4, 'Sweet & tangy pineapple pizza.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(52, 'Mix Veg. Pizza', 120, 'Pizza', true, 4.6, 'Loaded with assorted fresh vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(53, 'Paneer Pizza', 150, 'Pizza', true, 4.7, 'Pizza topped with spiced paneer cubes.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(54, 'Magerata Pizza', 120, 'Pizza', true, 4.5, 'Classic margherita with cheese & tomato.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(55, 'Gulab Jamun (2 pcs)', 50, 'Sweets', true, 4.8, 'Warm milk dumplings soaked in sugar syrup.', 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=600&h=600&q=80'),
(56, 'Ras Gulle (2 pcs)', 40, 'Sweets', true, 4.6, 'Spongy cheese balls in light sugar syrup.', 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=600&h=600&q=80'),
(57, 'Idli Sambhar [2]', 60, 'South Indian - Idli Sambhar', true, 4.6, 'Steamed rice cakes with sambar & chutney.', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&h=600&q=80'),
(58, 'Butter Idli Sambhar', 100, 'South Indian - Idli Sambhar', true, 4.7, 'Buttery idli served with sambar & chutney.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(59, 'Plain Dosa', 80, 'South Indian - Dosa', true, 4.5, 'Crispy rice crepe with sambar & chutney.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(60, 'Masala Dosa', 100, 'South Indian - Dosa', true, 4.8, 'Dosa stuffed with spiced potato masala.', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80'),
(61, 'Butter Masala Dosa', 120, 'South Indian - Dosa', true, 4.8, 'Buttery masala dosa, crisp & rich.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(62, 'Mysore Plain Dosa', 100, 'South Indian - Dosa', true, 4.6, 'Plain dosa with spicy Mysore chutney.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(63, 'Mysore Masala Dosa', 120, 'South Indian - Dosa', true, 4.8, 'Masala dosa with spicy Mysore chutney.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(64, 'Butter Mysore Dosa', 140, 'South Indian - Dosa', true, 4.8, 'Buttery Mysore dosa with masala filling.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(65, 'Cheese Plain Dosa', 120, 'South Indian - Dosa', true, 4.6, 'Crispy dosa loaded with melted cheese.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(66, 'Cheese Masala Dosa', 150, 'South Indian - Dosa', true, 4.8, 'Masala dosa topped with cheese.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(67, 'Cheese Butter Masala Dosa', 170, 'South Indian - Dosa', true, 4.9, 'Rich cheese & butter masala dosa.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(68, 'Paper Dosa', 160, 'South Indian - Dosa', true, 4.7, 'Extra large crispy paper-thin dosa.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(69, 'Plain Uttapam', 80, 'South Indian - Uttapam', true, 4.5, 'Thick soft rice pancake with chutney.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(70, 'Onion Uttapam', 90, 'South Indian - Uttapam', true, 4.6, 'Uttapam topped with fresh onions.', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&h=600&q=80'),
(71, 'Onion Tomato Uttapam', 100, 'South Indian - Uttapam', true, 4.6, 'Uttapam topped with onion & tomato.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(72, 'Butter Onion Tomato Uttapam', 120, 'South Indian - Uttapam', true, 4.7, 'Buttery uttapam with onion & tomato.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(73, 'Dal Fry', 110, 'Dal Dish', true, 4.5, 'Yellow lentils tempered with cumin & garlic.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(74, 'Dal Tadka', 130, 'Dal Dish', true, 4.6, 'Lentils finished with a sizzling ghee tadka.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(75, 'Dal Makhani', 180, 'Dal Dish', true, 4.8, 'Creamy black lentils slow-cooked with butter.', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&h=600&q=80'),
(76, 'Dal Jeera', 130, 'Dal Dish', true, 4.5, 'Lentils tempered with fragrant cumin.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(77, 'Dal Punjabi', 150, 'Dal Dish', true, 4.6, 'Rich Punjabi-style dal with spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(78, 'Butter Dal Fry', 180, 'Dal Dish', true, 4.7, 'Dal fry enriched with a dollop of butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(79, 'Onion Salad', 40, 'Salad / Papad / Dahi', true, 4.2, 'Sliced onion salad with lemon.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(80, 'Green Salad', 60, 'Salad / Papad / Dahi', true, 4.4, 'Fresh mixed green salad.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&h=600&q=80'),
(81, 'Roasted Papad (Moong)', 20, 'Salad / Papad / Dahi', true, 4.3, 'Crisp roasted moong papad.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(82, 'Fry Papad (Moong)', 30, 'Salad / Papad / Dahi', true, 4.3, 'Crunchy deep-fried moong papad.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(83, 'Makki Papad Roasted', 30, 'Salad / Papad / Dahi', true, 4.3, 'Roasted corn papad, light & crisp.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(84, 'Fry Makki Papad', 40, 'Salad / Papad / Dahi', true, 4.3, 'Fried corn papad, crunchy delight.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(85, 'Masala Papad', 60, 'Salad / Papad / Dahi', true, 4.5, 'Papad topped with onion, tomato & masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(86, 'Makki Masala Papad', 80, 'Salad / Papad / Dahi', true, 4.5, 'Corn papad topped with tangy masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(87, 'Curd', 50, 'Salad / Papad / Dahi', true, 4.4, 'Fresh homemade curd.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(88, 'Butter Milk', 20, 'Salad / Papad / Dahi', true, 4.4, 'Refreshing spiced buttermilk.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(89, 'Bundi Raita', 100, 'Salad / Papad / Dahi', true, 4.5, 'Curd with crunchy boondi & spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(90, 'Veg Raita', 100, 'Salad / Papad / Dahi', true, 4.5, 'Curd mixed with fresh vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(91, 'Pineapple Raita', 150, 'Salad / Papad / Dahi', true, 4.6, 'Sweet & tangy pineapple raita.', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80'),
(92, 'Kadi Pakoda', 130, 'Vegetables', true, 4.5, 'Yogurt curry with soft gram flour dumplings.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(93, 'Matar Palak', 180, 'Vegetables', true, 4.6, 'Green peas cooked in spinach gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(94, 'Mix Veg.', 180, 'Vegetables', true, 4.5, 'Assorted seasonal vegetables in gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(95, 'Bhindi Masala', 180, 'Vegetables', true, 4.6, 'Okra sautéed with onions & spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(96, 'Gobhi Masala', 130, 'Vegetables', true, 4.5, 'Cauliflower cooked in spicy masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(97, 'Sev Tamatar', 130, 'Vegetables', true, 4.5, 'Tomato gravy topped with crunchy sev.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(98, 'Dudh Sev', 180, 'Vegetables', true, 4.5, 'Traditional milk & sev preparation.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(99, 'Jira Aalu', 130, 'Vegetables', true, 4.4, 'Potatoes tempered with cumin seeds.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(100, 'Aalu Palak', 180, 'Vegetables', true, 4.5, 'Potatoes cooked in spinach gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(101, 'Aalu Payaaz', 130, 'Vegetables', true, 4.4, 'Potatoes cooked with onions & spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(102, 'Aalu Matar', 130, 'Vegetables', true, 4.4, 'Potato & green peas in tomato gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(103, 'Aalu Gobhi', 130, 'Vegetables', true, 4.5, 'Potato & cauliflower cooked with spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(104, 'Besan Gatta Dry', 180, 'Vegetables', true, 4.6, 'Gram flour dumplings tossed dry with spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(105, 'Gatta Curry', 180, 'Vegetables', true, 4.6, 'Rajasthani gram flour dumplings in curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(106, 'Lahsuni Palak', 220, 'Vegetables', true, 4.7, 'Spinach tempered with roasted garlic.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(107, 'Corn Palak', 220, 'Vegetables', true, 4.7, 'Sweet corn in creamy spinach gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(108, 'Dahi Fry', 130, 'Vegetables', true, 4.5, 'Curd-based fried curry preparation.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(109, 'Sarson Saag (Seasonal)', 220, 'Vegetables', true, 4.8, 'Winter special mustard greens saag.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(110, 'Ker Sangari Saag (Seasonal)', 260, 'Vegetables', true, 4.7, 'Traditional Rajasthani ker sangari.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(111, 'Matar Paneer', 160, 'Paneer Special', true, 4.6, 'Paneer & green peas in tomato onion gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(112, 'Chana Paneer', 180, 'Paneer Special', true, 4.6, 'Paneer with chickpeas in rich gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(113, 'Palak Paneer', 180, 'Paneer Special', true, 4.7, 'Cottage cheese in a smooth spinach gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(114, 'Paneer Tikka - Gravy', 180, 'Paneer Special', true, 4.8, 'Grilled paneer tikka in creamy gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(115, 'Shahi Paneer', 180, 'Paneer Special', true, 4.8, 'Royal paneer curry with cashew cream.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(116, 'Kadhai Paneer', 180, 'Paneer Special', true, 4.8, 'Paneer cooked with peppers & kadhai masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(117, 'Paneer Butter Masala', 180, 'Paneer Special', true, 4.9, 'Paneer in a rich buttery tomato gravy.', 'https://images.pexels.com/photos/29631461/pexels-photo-29631461.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop', 'https://images.pexels.com/photos/29631461/pexels-photo-29631461.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'),
(118, 'Paneer Bhurji', 180, 'Paneer Special', true, 4.6, 'Scrambled paneer with onion, tomato & spices.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(119, 'Mushroom Paneer', 180, 'Paneer Special', true, 4.6, 'Paneer & mushrooms in a spiced gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(120, 'Paneer Punjabi', 180, 'Paneer Special', true, 4.7, 'Rich Punjabi-style paneer curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(121, 'Paneer Angara', 180, 'Paneer Special', true, 4.7, 'Smoky paneer in a fiery tomato gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(122, 'Paneer Handi', 180, 'Paneer Special', true, 4.7, 'Paneer slow-cooked in a handi masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(123, 'Malai Kopta', 220, 'Paneer Special', true, 4.9, 'Soft koftas in a rich creamy gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(124, 'Paneer Tufani', 180, 'Paneer Special', true, 4.7, 'Spicy tufani-style paneer curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(125, 'Paneer Lababdar', 180, 'Paneer Special', true, 4.8, 'Paneer in a luscious tomato butter gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(126, 'Special Rajmaa', 180, 'Paneer Special', true, 4.7, 'Red kidney beans in a hearty gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(127, 'Makka Raabdi', 50, 'Roti', true, 4.5, 'Traditional corn raabdi preparation.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(128, 'Plain Tandoori Roti', 15, 'Roti', true, 4.4, 'Whole wheat bread baked in tandoor.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(129, 'Plain Tava Roti', 15, 'Roti', true, 4.3, 'Soft roti made on the tava.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(130, 'Butter Tandoori Roti', 20, 'Roti', true, 4.5, 'Tandoori roti brushed with butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(131, 'Amul Butter Tava Roti', 20, 'Roti', true, 4.5, 'Tava roti with Amul butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(132, 'Laccha Paratha Butter', 60, 'Roti', true, 4.7, 'Flaky layered paratha with butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(133, 'Butter Naan', 60, 'Roti', true, 4.7, 'Fluffy naan glazed with butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(134, 'Plain Naan', 50, 'Roti', true, 4.6, 'Soft leavened flatbread from the tandoor.', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80'),
(135, 'Garlic Naan Butter', 80, 'Roti', true, 4.8, 'Garlic naan brushed with butter.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(136, 'Cheese Garlic Naan', 100, 'Roti', true, 4.8, 'Garlic naan loaded with melted cheese.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(137, 'Cheese Naan', 80, 'Roti', true, 4.7, 'Soft naan stuffed with cheese.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(138, 'Missi Roti', 80, 'Roti', true, 4.6, 'Spiced gram flour flatbread.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(139, 'Makka Roti', 50, 'Roti', true, 4.5, 'Traditional corn flour flatbread.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(140, 'Bajara Roti', 60, 'Roti', true, 4.5, 'Healthy pearl millet flatbread.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(141, 'Special Manas Sabji', 280, 'Special Vegetable', true, 4.9, 'Chef''s signature special vegetable curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(142, 'Kaju Chana', 220, 'Special Vegetable', true, 4.7, 'Cashews & chickpeas in a rich gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(143, 'Kaju Kari', 240, 'Special Vegetable', true, 4.8, 'Cashews cooked in a creamy curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(144, 'Navratan Korma', 220, 'Special Vegetable', true, 4.7, 'Nine-jewel mixed veg in creamy korma.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(145, 'Mushroom Kari', 220, 'Special Vegetable', true, 4.7, 'Mushrooms in a rich flavourful curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(146, 'Matar Mushroom', 200, 'Special Vegetable', true, 4.6, 'Green peas & mushrooms in spiced gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(147, 'Kabuli Chana Masala', 200, 'Special Vegetable', true, 4.6, 'White chickpeas in tangy masala.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(148, 'Chana Kari (Kala Chana)', 200, 'Special Vegetable', true, 4.6, 'Black chickpeas in a spiced curry.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(149, 'Paneer Pasanda', 200, 'Special Vegetable', true, 4.8, 'Stuffed paneer in a rich creamy gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(150, 'Cheese Butter Masala', 260, 'Special Vegetable', true, 4.8, 'Cheese in a luscious butter masala gravy.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(151, 'Plain Rice', 100, 'Rice', true, 4.3, 'Perfectly steamed basmati rice.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(152, 'Jeera Rice', 120, 'Rice', true, 4.5, 'Basmati rice tempered with cumin seeds.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(153, 'Veg. Pulav', 150, 'Rice', true, 4.5, 'Mildly spiced rice with mixed vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(154, 'Matar Pulav', 140, 'Rice', true, 4.5, 'Fragrant rice cooked with green peas.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(155, 'Kashmiri Pulav', 150, 'Rice', true, 4.6, 'Sweet pulav with fruits & nuts.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(156, 'Veg Biryani', 180, 'Rice', true, 4.7, 'Fragrant biryani with veggies & spices.', 'https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&h=600&q=80'),
(157, 'Paneer Pulav', 180, 'Rice', true, 4.7, 'Aromatic pulav loaded with paneer.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(158, 'Dal Baati Chaach', 180, 'Special Thali / Combo', true, 4.8, 'Rajasthani dal baati with chaach. Add Churma Laddu for ₹50.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(159, 'Thali', 150, 'Special Thali / Combo', true, 4.7, 'Wholesome thali with dal, sabzi, roti & rice.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80'),
(160, 'Special Manas Thali', 250, 'Special Thali / Combo', true, 4.9, 'Grand special thali with a variety of dishes.', 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&h=600&q=80', 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&h=600&q=80');

-- 15. Reset Primary Key Sequence
SELECT setval(pg_get_serial_sequence('public.menu_items', 'id'), COALESCE((SELECT MAX(id) FROM public.menu_items), 1) + 1, false);

NOTIFY pgrst, 'reload schema';

```

---

