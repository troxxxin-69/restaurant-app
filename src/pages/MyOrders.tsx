import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, Package, Receipt } from "lucide-react";
import { useApp } from "../context/AppContext";
import OrderTimeline from "../components/OrderTimeline";

const statusLabels = ["Received", "Preparing", "Out for Delivery", "Delivered"];

export default function MyOrders() {
  const { orders, repeatOrder } = useApp();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">
        My Orders
      </h1>
      <p className="mt-1 text-neutral-500">Track and manage your orders.</p>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <span className="text-6xl">📦</span>
          <h3 className="text-xl font-bold text-ink dark:text-white">
            No orders yet
          </h3>
          <Link
            to="/menu"
            className="rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand/30"
          >
            Order Now
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-neutral-200 pb-4 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Package size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-ink dark:text-white">
                      {order.id}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      order.status === 3
                        ? "bg-green-100 text-green-700"
                        : "bg-brand/10 text-brand"
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                  <span className="text-lg font-extrabold text-ink dark:text-white">
                    ₹{order.total}
                  </span>
                </div>
              </div>

              <div className="py-6">
                <OrderTimeline status={order.status} />
              </div>

              {order.items.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {order.items.map((it) => (
                    <span
                      key={it.id}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {it.name} × {it.qty}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Receipt size={14} /> {order.payment} • {order.address}
                </p>
                <button
                  onClick={() => repeatOrder(order)}
                  className="flex items-center gap-2 rounded-full border-2 border-brand px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                >
                  <RefreshCw size={15} /> Repeat Order
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
