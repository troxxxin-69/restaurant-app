import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { galleryImages } from "../data/menu";

export default function Gallery({ limit }: { limit?: number }) {
  const imgs = limit ? galleryImages.slice(0, limit) : galleryImages;
  const [selectedImg, setSelectedImg] = useState<{ src: string; title?: string; category?: string } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {imgs.map((item, i) => {
          const src = typeof item === "string" ? item : item.src;
          const title = typeof item === "string" ? `MANAS View #${i + 1}` : item.title;
          const category = typeof item === "string" ? "Resort" : item.category;

          const isFeatured = i === 0 || i === 3;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelectedImg({ src, title, category })}
              className={`group relative cursor-pointer overflow-hidden rounded-[24px] border border-black/5 bg-neutral-900 shadow-xl transition-all duration-500 hover:shadow-2xl dark:border-white/10 ${
                isFeatured ? "sm:col-span-2 lg:col-span-2 h-72" : "h-64"
              }`}
            >
              <img
                src={src}
                alt={title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Dark Gradient Overlay for Watermark Protection & Text Contrast */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Top Category Badge */}
              <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 backdrop-blur border border-white/10">
                <Sparkles size={11} /> {category}
              </div>

              {/* Bottom Title Info */}
              <div className="absolute bottom-3.5 left-4 right-4 translate-y-1 transition-transform duration-300 group-hover:translate-y-0">
                <p className="text-sm font-extrabold text-white tracking-wide shadow-sm">
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Click to view full photo →
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-[28px] bg-neutral-900 border border-white/15 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedImg(null)}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black"
              >
                <X size={18} />
              </button>

              <div className="relative overflow-hidden">
                <img
                  src={selectedImg.src}
                  alt={selectedImg.title}
                  className="max-h-[75vh] w-full object-contain scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              <div className="bg-neutral-900 p-5 border-t border-white/10">
                <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  {selectedImg.category}
                </span>
                <h3 className="mt-1 text-lg font-extrabold text-white">
                  {selectedImg.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
