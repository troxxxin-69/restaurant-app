import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star, Minus, Plus, ShoppingBag } from "lucide-react";
import type { FoodItem } from "../data/menu";
import { useApp } from "../context/AppContext";
import VegBadge from "./VegBadge";
import { cn } from "../utils/cn";

export default function FoodCard({ item }: { item: FoodItem }) {
  const { addToCart, favorites, toggleFavorite } = useApp();
  const [qty, setQty] = useState(1);
  const isFav = favorites.includes(item.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-shadow hover:shadow-[0_18px_50px_rgba(255,107,0,0.18)] dark:bg-neutral-900 dark:ring-white/10"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <button
          onClick={() => toggleFavorite(item.id)}
          aria-label="Toggle favorite"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110 dark:bg-neutral-800/90"
        >
          <Heart
            className={cn(
              "h-4.5 w-4.5 transition",
              isFav ? "fill-red-500 text-red-500" : "text-neutral-500"
            )}
            size={18}
          />
        </button>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ink shadow dark:bg-neutral-800/90 dark:text-white">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-2">
          <VegBadge veg={item.veg} />
          <h3 className="line-clamp-1 flex-1 font-semibold text-ink dark:text-neutral-100">
            {item.name}
          </h3>
        </div>
        <p className="mb-3 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-brand">₹{item.price}</span>
          <div className="flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-7 w-7 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Decrease"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="grid h-7 w-7 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Increase"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            addToCart(item, qty);
            setQty(1);
          }}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
        >
          <ShoppingBag size={16} /> Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
