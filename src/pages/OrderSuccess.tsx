import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Package, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function OrderSuccess() {
  const { state } = useLocation() as {
    state: { orderId?: string; total?: number; payment?: string } | null;
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.orderId) navigate("/");
  }, [state, navigate]);

  const orderId = state?.orderId ?? "MNS-000000";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative"
      >
        <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
        <span className="relative grid h-28 w-28 place-items-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/40">
          <CheckCircle2 size={64} />
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-3xl font-extrabold text-ink dark:text-white"
      >
        Order Placed Successfully! 🎉
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-neutral-500"
      >
        Thank you for ordering from MANAS Restaurant. Your food is being prepared
        with love.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 w-full rounded-[24px] bg-white p-6 shadow-lg ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <div className="flex items-center justify-between border-b border-dashed border-neutral-200 pb-4 dark:border-neutral-700">
          <div className="flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <Package size={20} />
            </span>
            <div>
              <p className="text-xs text-neutral-400">Order ID</p>
              <p className="font-bold text-ink dark:text-white">{orderId}</p>
            </div>
          </div>
          {state?.total && (
            <div className="text-right">
              <p className="text-xs text-neutral-400">Total Paid</p>
              <p className="font-bold text-brand">₹{state.total}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 pt-4 text-sm font-semibold text-green-600">
          <Clock size={16} /> Estimated Delivery: 30–40 minutes
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-wrap justify-center gap-4"
      >
        <Link
          to="/orders"
          className="flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white px-6 py-3 font-semibold text-ink transition hover:border-brand hover:text-brand dark:border-white/10 dark:bg-neutral-800 dark:text-white"
        >
          Track Order
        </Link>
        <Link
          to="/menu"
          className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
        >
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </motion.div>
    </div>
  );
}
