import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  text: string;
  avatar: string;
}

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative flex h-full flex-col rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
    >
      <Quote className="absolute right-5 top-5 h-8 w-8 text-brand/15" />
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={
              i < review.rating
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-300"
            }
          />
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        "{review.text}"
      </p>
      <div className="mt-5 flex items-center gap-3">
        <img
          src={review.avatar}
          alt={review.name}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-ink dark:text-white">
            {review.name}
          </p>
          <p className="text-xs text-neutral-400">Verified Customer</p>
        </div>
      </div>
    </motion.div>
  );
}
