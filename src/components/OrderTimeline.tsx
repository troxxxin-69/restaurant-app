import { Check, Package, ChefHat, Bike, Home } from "lucide-react";

const steps = [
  { label: "Received", icon: Package },
  { label: "Preparing", icon: ChefHat },
  { label: "Out for Delivery", icon: Bike },
  { label: "Delivered", icon: Home },
];

export default function OrderTimeline({ status }: { status: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i <= status;
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`grid h-10 w-10 place-items-center rounded-full transition ${
                  done
                    ? "bg-brand text-white shadow-lg shadow-brand/30"
                    : "bg-neutral-200 text-neutral-400 dark:bg-neutral-700"
                }`}
              >
                {i < status ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`mt-2 w-16 text-center text-[11px] font-semibold leading-tight ${
                  done ? "text-brand" : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-1 -mt-6 h-1 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: i < status ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
