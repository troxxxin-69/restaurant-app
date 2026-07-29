import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  Tag,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Cart() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    cartSubtotal,
  } = useApp();
  const navigate = useNavigate();

  const delivery = cartSubtotal > 0 ? (cartSubtotal > 499 ? 0 : 40) : 0;
  const gst = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + delivery + gst;

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 px-6 py-28 text-center">
        <div className="grid h-28 w-28 place-items-center rounded-full bg-brand/10 text-6xl">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-ink dark:text-white">
          Your cart is empty
        </h2>
        <p className="text-neutral-500">
          Add some delicious food to get started!
        </p>
        <Link
          to="/menu"
          className="flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand/30"
        >
          <ShoppingBag size={18} /> Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">
        Your Cart
      </h1>
      <p className="mt-1 text-neutral-500">
        {cart.length} item{cart.length > 1 ? "s" : ""} in your cart
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* items */}
        <div className="space-y-4">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-ink dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neutral-400">{item.category}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-semibold">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => increaseQty(item.id)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-lg font-extrabold text-brand">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* summary */}
        <div className="h-fit space-y-5 lg:sticky lg:top-24">
          <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold text-ink dark:text-white">
                <Tag size={18} className="text-brand" /> Apply Coupon
              </h3>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                Coming Soon 🚀
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Exciting promo codes & discount offers are on the way! This feature will be live very soon.
            </p>
          </div>

          <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h3 className="mb-4 font-bold text-ink dark:text-white">
              Bill Details
            </h3>
            <div className="space-y-3 text-sm">
              <Row label="Subtotal" value={`₹${cartSubtotal}`} />
              <Row
                label="Delivery Charge"
                value={delivery === 0 ? "FREE" : `₹${delivery}`}
                green={delivery === 0}
              />
              <Row label="GST (5%)" value={`₹${gst}`} />
              <div className="my-2 border-t border-dashed border-neutral-200 dark:border-neutral-700" />
              <div className="flex items-center justify-between text-base font-extrabold text-ink dark:text-white">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  green,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={`font-semibold ${
          green ? "text-green-600" : "text-ink dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
