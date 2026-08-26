import { Check, Package, ChefHat, Bike, Navigation, CheckCircle2 } from "lucide-react";

const steps = [
  { key: "placed", label: "Placed", icon: Package },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready_for_pickup", label: "Ready", icon: Navigation },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export function getStatusIndex(status: string | number): number {
  if (typeof status === "number") return Math.min(status, 4);
  switch (status) {
    case "placed":
    case "paid":
      return 0;
    case "accepted":
      return 0;
    case "preparing":
      return 1;
    case "ready_for_pickup":
      return 2;
    case "picked_up":
      return 3;
    case "out_for_delivery":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
}

export default function OrderTimeline({ status }: { status: string | number }) {
  const currentIndex = getStatusIndex(status);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center justify-between min-w-[300px]">
        {steps.map((step, i) => {
          const done = i <= currentIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full transition ${
                    done
                      ? "bg-brand text-white shadow-md shadow-brand/30"
                      : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"
                  }`}
                >
                  {i < currentIndex ? <Check size={14} className="sm:w-4 sm:h-4" /> : <Icon size={14} className="sm:w-4 sm:h-4" />}
                </div>
                <span
                  className={`mt-1.5 text-center text-[9px] sm:text-[11px] font-extrabold leading-tight max-w-[56px] sm:max-w-[68px] truncate ${
                    done ? "text-brand" : "text-neutral-400"
                  }`}
                  title={step.label}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-0.5 sm:mx-1 -mt-4 sm:-mt-5 h-0.5 sm:h-1 flex-1 min-w-[10px] rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: i < currentIndex ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
