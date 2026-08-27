import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-[calc(100vw-24px)] sm:max-w-md -translate-x-1/2 flex-col items-center gap-2 px-3">
      <AnimatePresence mode="wait">
        {toasts.map((t) => {
          const isFav = t.message.toLowerCase().includes("favorite");
          const isError = t.type === "error";
          const isSuccess = t.type === "success";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="pointer-events-auto flex max-w-full items-center gap-2.5 rounded-2xl sm:rounded-full border border-black/10 bg-white/95 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md dark:border-white/15 dark:bg-neutral-900/95 dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
              {isFav ? (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-500">
                  <Heart size={14} className="fill-red-500" />
                </span>
              ) : isError ? (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-500/10 text-red-500">
                  <XCircle size={14} />
                </span>
              ) : isSuccess ? (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={14} />
                </span>
              ) : (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                  <Sparkles size={14} />
                </span>
              )}

              <span className="text-xs font-bold text-ink dark:text-white leading-snug break-words max-w-full [overflow-wrap:anywhere]">
                {t.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
