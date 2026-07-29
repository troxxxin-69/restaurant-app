import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ChefHat, Star, Clock, BadgePercent } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* decorative gradient blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand">
            <ChefHat size={14} /> Multi-Cuisine Restaurant & Kitchen
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl dark:text-white">
            MANAS{" "}
            <span className="bg-gradient-to-r from-brand to-amber-500 bg-clip-text text-transparent">
              Restaurant
            </span>
          </h1>
          <p className="mt-4 text-lg font-medium tracking-wide text-neutral-600 dark:text-neutral-300">
            Fresh <span className="text-brand">•</span> Pure{" "}
            <span className="text-brand">•</span> Delicious
          </p>
          <p className="mt-3 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Craving something delicious? Order authentic Indian, Chinese & more —
            freshly cooked and delivered hot to your doorstep.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/menu">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-xl shadow-brand/30 transition hover:bg-brand-dark"
              >
                <ShoppingBag size={18} /> Order Now
              </motion.button>
            </Link>
            <Link to="/menu">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white px-7 py-3.5 font-semibold text-ink shadow-lg transition hover:border-brand hover:text-brand dark:border-white/10 dark:bg-neutral-800 dark:text-white"
              >
                View Menu
              </motion.button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { icon: Star, label: "4.8 Rating", sub: "10k+ Reviews" },
              { icon: Clock, label: "30 Min", sub: "Fast Delivery" },
              { icon: BadgePercent, label: "50% OFF", sub: "First Order" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <s.icon size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink dark:text-white">
                    {s.label}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {s.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <motion.img
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=900&q=80"
            alt="Delicious food"
            className="mx-auto aspect-square w-full max-w-md rounded-[40px] object-cover shadow-2xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass absolute -bottom-4 left-2 flex items-center gap-3 rounded-2xl p-3 shadow-xl sm:left-6"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-500 text-white">
              <ChefHat size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink dark:text-white">
                Freshly Cooked
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-300">
                Made with love daily
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
