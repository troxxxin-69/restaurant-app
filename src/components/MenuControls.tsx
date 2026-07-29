import { Search, SlidersHorizontal, X } from "lucide-react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
}

export default function MenuControls({
  search,
  setSearch,
  sort,
  setSort,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for dishes..."
          className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-11 pr-10 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-ink dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="relative">
        <SlidersHorizontal
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full appearance-none rounded-full border border-neutral-200 bg-white py-3 pl-11 pr-8 text-sm font-medium outline-none transition focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        >
          <option value="default">Sort by: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="rating">Rating: High to Low</option>
        </select>
      </div>
    </div>
  );
}
