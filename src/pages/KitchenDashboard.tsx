import { motion } from "framer-motion";
import { ChefHat, Clock, CheckCircle, Truck, Package } from "lucide-react";
import { useApp } from "../context/AppContext";

const statusColumns = [
  { status: 0, title: "Received", icon: Package, color: "bg-blue-500", border: "border-blue-500/20" },
  { status: 1, title: "Preparing", icon: ChefHat, color: "bg-amber-500", border: "border-amber-500/20" },
  { status: 2, title: "Out for Delivery", icon: Truck, color: "bg-purple-500", border: "border-purple-500/20" },
  { status: 3, title: "Delivered", icon: CheckCircle, color: "bg-green-500", border: "border-green-500/20" },
];

export default function KitchenDashboard() {
  const { orders, updateOrderStatus } = useApp();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <ChefHat size={14} /> KITCHEN DISPLAY SYSTEM (KDS)
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-ink dark:text-white">
            Live Kitchen Order Board
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage incoming orders and update preparation status in real-time.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        {statusColumns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          const ColIcon = col.icon;
          return (
            <div
              key={col.status}
              className={`flex flex-col rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10`}
            >
              <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className={`grid h-8 w-8 place-items-center rounded-xl text-white ${col.color}`}>
                    <ColIcon size={16} />
                  </span>
                  <h3 className="font-bold text-ink dark:text-white">{col.title}</h3>
                </div>
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-neutral-100 px-2 text-xs font-extrabold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {colOrders.length}
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {colOrders.length === 0 ? (
                  <p className="py-10 text-center text-xs text-neutral-400">
                    No orders in {col.title.toLowerCase()}
                  </p>
                ) : (
                  colOrders.map((ord) => (
                    <motion.div
                      key={ord.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-neutral-200 bg-[#F9FAFB] p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-800/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-ink dark:text-white text-sm">
                          {ord.id}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
                          <Clock size={12} />
                          {new Date(ord.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="my-3 space-y-1.5 border-y border-dashed border-neutral-200 py-2.5 dark:border-neutral-700">
                        {ord.items.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">No items listed</p>
                        ) : (
                          ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-xs font-semibold text-ink dark:text-neutral-200">
                              <span>{it.name}</span>
                              <span className="text-brand font-bold">× {it.qty}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <p className="line-clamp-1 text-[11px] text-neutral-400">
                        📍 {ord.address}
                      </p>

                      <div className="mt-3 flex gap-2">
                        {ord.status > 0 && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, ord.status - 1)}
                            className="flex-1 rounded-xl border border-neutral-200 py-1.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            ← Back
                          </button>
                        )}
                        {ord.status < 3 && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, ord.status + 1)}
                            className="flex-1 rounded-xl bg-brand py-1.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
                          >
                            {ord.status === 0 && "Start Cooking 🍳"}
                            {ord.status === 1 && "Out for Delivery 🚚"}
                            {ord.status === 2 && "Mark Delivered ✅"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
