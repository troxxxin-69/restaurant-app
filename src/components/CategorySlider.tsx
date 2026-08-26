import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

interface CategorySliderProps {
  categories: string[];
  activeCategory: string;
  categoryCounts: Record<string, number>;
  onSelectCategory: (category: string) => void;
}

export default function CategorySlider({
  categories,
  activeCategory,
  categoryCounts,
  onSelectCategory,
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categories]);

  // Scroll active item into view automatically when activeCategory changes
  useEffect(() => {
    if (activeItemRef.current && scrollRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative mt-4 flex items-center group">
      {/* Left Arrow Navigation Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Scroll Left"
          className="absolute -left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg ring-1 ring-black/10 transition hover:scale-110 hover:bg-brand hover:text-white dark:bg-neutral-800 dark:text-white dark:ring-white/10 dark:hover:bg-brand"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Left Fade Gradient Mask */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-[#F8F8F8] to-transparent dark:from-neutral-950" />
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex w-full gap-2.5 overflow-x-auto scroll-smooth py-1 px-1"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              ref={isActive ? activeItemRef : null}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 select-none cursor-pointer",
                isActive
                  ? "bg-brand text-white shadow-md shadow-brand/30 scale-105"
                  : "bg-white text-neutral-600 ring-1 ring-black/5 hover:bg-brand/10 hover:text-brand dark:bg-neutral-900 dark:text-neutral-300 dark:ring-white/10"
              )}
            >
              <span>{cat}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-black transition",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                )}
              >
                {categoryCounts[cat] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Fade Gradient Mask */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-[#F8F8F8] to-transparent dark:from-neutral-950" />
      )}

      {/* Right Arrow Navigation Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll Right"
          className="absolute -right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg ring-1 ring-black/10 transition hover:scale-110 hover:bg-brand hover:text-white dark:bg-neutral-800 dark:text-white dark:ring-white/10 dark:hover:bg-brand"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
