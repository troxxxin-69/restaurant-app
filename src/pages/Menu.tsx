import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import FoodCard from "../components/FoodCard";
import MenuControls from "../components/MenuControls";
import { GridSkeleton } from "../components/LoadingSkeleton";
import CategorySlider from "../components/CategorySlider";
import { fetchMenuItemsFromSupabase } from "../lib/supabase";

export default function Menu() {
  const { menuItems, setMenuItems, favorites } = useApp();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("category") || "All";
  const [active, setActive] = useState(initialCat);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  // Instant load: If menu items are already cached in AppContext, do NOT block UI with skeleton!
  const [loading, setLoading] = useState(() => menuItems.length === 0);

  useEffect(() => {
    let isMounted = true;
    async function loadMenuFromSupabase() {
      // Background non-blocking fetch to ensure zero delay for user
      const items = await fetchMenuItemsFromSupabase();
      if (items && items.length > 0 && isMounted) {
        setMenuItems(items);
      }
      if (isMounted) {
        setLoading(false);
      }
    }
    loadMenuFromSupabase();
    return () => {
      isMounted = false;
    };
  }, [setMenuItems]);

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
    if (active === "Favorites" || active === "❤️ Favorites") {
      list = list.filter((m) => favorites.includes(m.id));
    } else if (active !== "All") {
      list = list.filter((m) => m.category === active);
    }

    if (search.trim()) {
      const tokens = search.trim().toLowerCase().split(/\s+/);
      list = list.filter((m) => {
        const fullText = `${m.name || ""} ${m.description || ""} ${m.category || ""} ${m.veg ? "veg pure veg" : "non-veg"}`.toLowerCase();
        return tokens.every((token) => fullText.includes(token));
      });
    }

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
  }, [menuItems, active, search, sort, favorites]);

  const allCats = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((c) => c.category))).filter(Boolean);
    return ["All", "Favorites", ...cats];
  }, [menuItems]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menuItems.length, Favorites: favorites.length };
    menuItems.forEach((m) => {
      if (m.category) counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [menuItems, favorites]);

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
          {menuItems.length} items across {Math.max(0, allCats.length - 1)} categories — freshly
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

        <CategorySlider
          categories={allCats}
          activeCategory={active}
          categoryCounts={catCounts}
          onSelectCategory={selectCategory}
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <GridSkeleton count={8} />
        ) : filtered.length === 0 ? (
          active === "Favorites" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <span className="text-6xl">❤️</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">
                No favorite dishes saved yet
              </h3>
              <p className="max-w-md text-xs text-neutral-500">
                Click the heart ❤️ icon on any dish in our menu to save it here for quick 1-click ordering anytime!
              </p>
              <button
                onClick={() => selectCategory("All")}
                className="mt-2 rounded-full bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
              >
                Browse All Dishes
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <span className="text-6xl">🔍</span>
              <h3 className="text-xl font-bold text-ink dark:text-white">
                No dishes found
              </h3>
              <p className="text-neutral-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )
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

