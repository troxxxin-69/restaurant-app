import { motion } from "framer-motion";
import { galleryImages } from "../data/menu";

export default function Gallery({ limit }: { limit?: number }) {
  const imgs = limit ? galleryImages.slice(0, limit) : galleryImages;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {imgs.map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className={`group relative overflow-hidden rounded-[20px] shadow-md ${
            i % 5 === 0 ? "row-span-2 sm:col-span-1" : ""
          }`}
        >
          <img
            src={src}
            alt={`Gallery ${i + 1}`}
            loading="lazy"
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
        </motion.div>
      ))}
    </div>
  );
}
