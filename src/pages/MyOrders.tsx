import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, Package, Phone } from "lucide-react";
import { useApp, type Order } from "../context/AppContext";
import OrderTimeline from "../components/OrderTimeline";
import UpiPaymentModal from "../components/UpiPaymentModal";
import { safeParseJSON } from "../utils/sanitize";

export default function MyOrders() {
  const { user, orders, repeatOrder } = useApp();
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [selectedUpiOrder, setSelectedUpiOrder] = useState<Order | null>(null);

  const guestOrderIds: string[] = safeParseJSON<string[]>(localStorage.getItem("manas_guest_order_ids"), []);

  // Filter orders strictly for the logged-in customer or current guest session
  const myOrders = orders.filter((o) => {
    const isGuestMatch = guestOrderIds.map(String).includes(String(o.id));
    if (user.isLoggedIn && user.id && !user.id.startsWith("usr-guest")) {
      return (
        String(o.user_id) === String(user.id) ||
        (user.email && String(o.user_id) === String(user.email)) ||
        (user.phone && String(o.phone) === String(user.phone)) ||
        isGuestMatch
      );
    }
    return String(o.user_id) === String(user.id) || isGuestMatch;
  });

  const formatStatus = (status: string | number) => {
    if (typeof status === "number") {
      const labels = ["Received", "Preparing", "Out for Delivery", "Delivered"];
      return labels[status] || "Placed";
    }
    return String(status).replace(/_/g, " ");
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">
        My Orders
      </h1>
      <p className="mt-1 text-xs text-neutral-500">Track live orders and view history in real-time.</p>

      {myOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="text-6xl">📦</span>
          <h3 className="text-xl font-bold text-ink dark:text-white">
            No orders found
          </h3>
          <Link
            to="/menu"
            className="rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand/30"
          >
            Browse Menu & Order
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {myOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-neutral-200 pb-3.5 dark:border-neutral-700">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Package size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-ink dark:text-white text-sm sm:text-base truncate">
                      Order #{order.id}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-semibold truncate">
                      {!order.date || isNaN(new Date(order.date).getTime())
                        ? "Recent Order"
                        : new Date(order.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                      String(order.status) === "paid" || String(order.status) === "delivered"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : String(order.status) === "payment_submitted"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : String(order.status) === "pending_payment"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-brand/10 text-brand"
                    }`}
                  >
                    {String(order.status) === "payment_submitted"
                      ? "⏳ Verification Pending"
                      : String(order.status) === "pending_payment"
                      ? "⚠️ Payment Pending"
                      : String(order.status) === "paid"
                      ? "✅ Payment Verified"
                      : formatStatus(order.status)}
                  </span>
                  <span className="text-base sm:text-lg font-black text-ink dark:text-white">
                    ₹{order.total}
                  </span>
                </div>
              </div>

              {/* UPI PAYMENT STATUS CARD FOR CUSTOMER */}
              {order.status === "payment_submitted" && (
                <div className="mt-4 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/20 text-xs dark:bg-amber-500/15">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-amber-800 dark:text-amber-300">
                        ⏳ Payment Submitted — Verification Pending Admin Approval
                      </p>
                      <p className="mt-0.5 font-semibold text-neutral-600 dark:text-neutral-300">
                        Submitted UTR No: <strong>{order.utr_number || "Submitted"}</strong>
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-200 px-2.5 py-1 font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                      Under Review
                    </span>
                  </div>
                </div>
              )}

              {order.status === "pending_payment" && (
                <div className="mt-4 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-xs dark:bg-red-500/15">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-red-700 dark:text-red-300">
                        ⚠️ Payment Required (Zero-Commission Direct UPI)
                      </p>
                      <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
                        Please pay ₹{order.total} via GPay/PhonePe and submit your 12-digit UTR within 30 minutes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUpiOrder(order);
                        setUpiModalOpen(true);
                      }}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-emerald-700"
                    >
                      📱 Pay Now & Submit UTR
                    </button>
                  </div>
                </div>
              )}

              {order.status === "payment_failed" && (
                <div className="mt-4 rounded-2xl bg-red-500/10 p-3.5 border border-red-500/20 text-xs dark:bg-red-500/15">
                  <p className="font-extrabold text-red-700 dark:text-red-300">
                    ❌ Payment Verification Failed
                  </p>
                  <p className="mt-0.5 text-neutral-600 dark:text-neutral-300">
                    Reason: {order.cancellation_reason || "Invalid or unverified UTR number."}
                  </p>
                </div>
              )}

              <div className="py-5">
                <OrderTimeline status={order.status} />
              </div>

              {order.delivery_boy_name && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500/10 p-3.5 ring-1 ring-amber-500/20 dark:bg-amber-500/20">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500 text-white font-black text-lg shadow">
                      🛵
                    </span>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                        PARCEL PACKED & OUT FOR DELIVERY
                      </span>
                      <h4 className="font-extrabold text-ink dark:text-white text-xs sm:text-sm">
                        Delivery Partner: {order.delivery_boy_name}
                      </h4>
                      {order.delivery_boy_phone && (
                        <p className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                          Mobile: {order.delivery_boy_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {order.delivery_boy_phone && (
                    <a
                      href={`tel:${order.delivery_boy_phone}`}
                      className="flex items-center gap-1.5 rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:bg-amber-700"
                    >
                      <Phone size={13} /> Call Delivery Partner
                    </a>
                  )}
                </div>
              )}

              {order.items.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {order.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {it.name} × {it.qty}
                    </span>
                  ))}
                </div>
              )}

              {(() => {
                const rawAddress = String(order.address || "");
                const cleanAddressText = rawAddress
                  .replace(/\[Google Maps Link:\s*[^\]]+\]/gi, "")
                  .replace(/\[GPS Pin:\s*[^\]]+\]/gi, "")
                  .replace(/\[Tel:\s*[^\]]+\]/gi, "")
                  .trim();

                return (
                  <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 max-w-full text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      <span className="font-bold text-ink dark:text-white">💳 Payment:</span> {order.payment}
                      {cleanAddressText && (
                        <p className="mt-0.5 truncate text-[11px]">
                          📍 <strong>Delivery Address:</strong> {cleanAddressText}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => repeatOrder(order)}
                      className="self-start sm:self-auto flex items-center gap-1.5 rounded-full border-2 border-brand px-4 py-1.5 text-xs font-bold text-brand transition hover:bg-brand hover:text-white shrink-0"
                    >
                      <RefreshCw size={14} /> Repeat Order
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          ))}
        </div>
      )}

      <UpiPaymentModal
        order={selectedUpiOrder}
        isOpen={upiModalOpen}
        onClose={() => {
          setUpiModalOpen(false);
          setSelectedUpiOrder(null);
        }}
        onSubmitted={() => {
          setUpiModalOpen(false);
          setSelectedUpiOrder(null);
        }}
      />
    </div>
  );
}
