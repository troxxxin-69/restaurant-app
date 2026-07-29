export default function VegBadge({ veg }: { veg: boolean }) {
  const color = veg ? "#16a34a" : "#dc2626";
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] border-2"
      style={{ borderColor: color }}
      title={veg ? "Veg" : "Non-Veg"}
      aria-label={veg ? "Vegetarian" : "Non-Vegetarian"}
    >
      <span
        className="block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
