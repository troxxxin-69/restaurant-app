import { useState, useEffect, useCallback } from "react";
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
    fetchStaffUsersSilent();
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



  const [refreshingUsers, setRefreshingUsers] = useState(false);

  const fetchStaffUsersSilent = useCallback(async () => {
    const userList = await fetchAllUserRolesAndProfiles();
    setStaffUsers(userList);
  }, []);

  const handleManualRefreshUsers = async () => {
    setRefreshingUsers(true);
    await fetchStaffUsersSilent();
    notify("🔄 Staff & User list refreshed from Database!", "info");
    setTimeout(() => setRefreshingUsers(false), 600);
  };

  useEffect(() => {
    fetchStaffUsersSilent();
    refreshMenu();

    const staffChannel = supabase
      .channel("realtime_staff_roles_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "customers" }, () => fetchStaffUsersSilent())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_roles" }, () => fetchStaffUsersSilent())
      .subscribe();

    return () => {
      supabase.removeChannel(staffChannel);
    };
  }, [activeTab, refreshMenu, fetchStaffUsersSilent]);

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
                onClick={handleManualRefreshUsers}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <RefreshCw size={13} className={refreshingUsers ? "animate-spin text-brand" : ""} /> Refresh Users
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
