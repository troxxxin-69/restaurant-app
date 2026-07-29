export function FoodCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-sm dark:bg-neutral-900">
      <div className="skeleton h-44 w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  );
}
