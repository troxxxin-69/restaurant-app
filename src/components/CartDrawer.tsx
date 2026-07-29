import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    increaseQty,
    decreaseQty,
    removeFromCart,
    cartSubtotal,
  } = useApp();
  const navigate = useNavigate();

  const goToCart = () => {
    setCartOpen(false);
    navigate("/cart");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-[#F8F8F8] shadow-2xl dark:bg-neutral-950"
          >
            <div className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4 dark:border-white/10 dark:bg-neutral-900">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
                <ShoppingCart size={20} className="text-brand" /> Your Cart (
                {cart.length})
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-brand/10 text-5xl">
                  🛒
                </div>
                <h4 className="text-lg font-bold text-ink dark:text-white">
                  Your cart is empty
                </h4>
                <p className="text-sm text-neutral-500">
                  Looks like you haven't added anything yet.
                </p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/menu");
                  }}
                  className="rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lg shadow-brand/30"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-900"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <h4 className="line-clamp-1 text-sm font-semibold text-ink dark:text-white">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-brand">
                          ₹{item.price}
                        </span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-700">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => increaseQty(item.id)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-ink dark:text-white">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-black/5 bg-white p-5 dark:border-white/10 dark:bg-neutral-900">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Subtotal</span>
                    <span className="text-xl font-extrabold text-ink dark:text-white">
                      ₹{cartSubtotal}
                    </span>
                  </div>
                  <button
                    onClick={goToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
                  >
                    View Cart & Checkout <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
