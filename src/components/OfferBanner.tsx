import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgePercent, ArrowRight } from "lucide-react";

export default function OfferBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-brand via-orange-500 to-amber-500 p-8 shadow-2xl shadow-brand/30 sm:p-12"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-52 w-52 rounded-full bg-white/10" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <BadgePercent size={14} /> Limited Time Offer
            </span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Get 50% OFF on your first order!
            </h2>
            <p className="mt-2 text-white/90">
              Use code{" "}
              <span className="rounded-lg bg-white/25 px-2 py-0.5 font-bold">
                MANAS50
              </span>{" "}
              at checkout. Min order ₹199.
            </p>
          </div>
          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-brand shadow-lg"
            >
              Order Now <ArrowRight size={18} />
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
