import { motion } from "framer-motion";

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={center ? "text-center" : ""}
    >
      {eyebrow && (
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-2 max-w-2xl text-neutral-500 dark:text-neutral-400 ${center ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
