import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "../data/menu";
import { useApp } from "../context/AppContext";
import FoodCard from "../components/FoodCard";
import MenuControls from "../components/MenuControls";
import { GridSkeleton } from "../components/LoadingSkeleton";
import { cn } from "../utils/cn";

export default function Menu() {
  const { menuItems } = useApp();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("category") || "All";
  const [active, setActive] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setActive(params.get("category") || "All");
  }, [params]);

  const selectCategory = (cat: string) => {
    setActive(cat);
    if (cat === "All") setParams({});
    else setParams({ category: cat });
  };

  const filtered = useMemo(() => {
    let list = [...menuItems];
    if (active !== "All") list = list.filter((m) => m.category === active);
    if (search.trim())
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()) ||
          m.category.toLowerCase().includes(search.toLowerCase())
      );
    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
    }
    return list;
  }, [active, search, sort]);

  const allCats = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
          Our Menu
        </span>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-ink dark:text-white">
          Explore Delicious Dishes
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {menuItems.length} items across {categories.length} categories — freshly
          made for you.
        </p>
      </motion.div>

      <div className="sticky top-16 z-30 mt-8 rounded-[24px] bg-[#F8F8F8]/80 py-4 backdrop-blur dark:bg-neutral-950/80">
        <MenuControls
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
        />

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {allCats.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition",
                active === cat
                  ? "bg-brand text-white shadow-lg shadow-brand/30"
                  : "bg-white text-neutral-600 ring-1 ring-black/5 hover:bg-brand/10 hover:text-brand dark:bg-neutral-900 dark:text-neutral-300 dark:ring-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <GridSkeleton count={8} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-bold text-ink dark:text-white">
              No dishes found
            </h3>
            <p className="text-neutral-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
