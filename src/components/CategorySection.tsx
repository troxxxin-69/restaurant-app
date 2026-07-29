import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "../data/menu";
import SectionTitle from "./SectionTitle";

export default function CategorySection() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionTitle
        center
        eyebrow="Explore"
        title="Popular Categories"
        subtitle="Handpicked cuisines and dishes to satisfy every craving."
      />
      <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
        {categories.map((c, i) => (
          <motion.button
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/menu?category=${encodeURIComponent(c.name)}`)}
            className="group flex flex-col items-center gap-2 rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-xl dark:bg-neutral-900 dark:ring-white/10"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl transition group-hover:bg-brand group-hover:scale-110">
              {c.icon}
            </span>
            <span className="text-center text-xs font-semibold text-ink dark:text-neutral-200">
              {c.name}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
