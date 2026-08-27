import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function FloatingCartBar() {
  const { cart, cartSubtotal } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide conditions:
  // 1. Cart is empty
  // 2. Already on /cart or /checkout page
  // 3. Admin or Delivery Dashboard routes (/admin, /delivery)
  const isHiddenRoute =
    location.pathname === "/cart" ||
    location.pathname === "/checkout" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/delivery");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  if (totalItems === 0 || isHiddenRoute) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-lg pb-[env(safe-area-inset-bottom)] md:bottom-6"
      >
        <div
          onClick={() => navigate("/cart")}
          className="group flex cursor-pointer items-center justify-between rounded-2xl bg-brand p-3.5 px-5 text-white shadow-2xl shadow-brand/40 ring-1 ring-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] dark:ring-white/10"
        >
          {/* Left Side: Shopping Bag Icon + Item Count + Subtotal */}
          <div className="flex items-center gap-3.5">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
              <ShoppingBag size={20} className="text-white" />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-black text-brand shadow">
                {totalItems}
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white/80">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} in Cart
              </p>
              <p className="text-base font-extrabold leading-none text-white">
                ₹{cartSubtotal} <span className="text-xs font-normal text-white/70">+ taxes</span>
              </p>
            </div>
          </div>

          {/* Right Side: View Cart Button Action */}
          <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-extrabold tracking-wide text-white backdrop-blur-sm transition-all group-hover:bg-white group-hover:text-brand">
            <span>View Cart</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
