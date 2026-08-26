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
