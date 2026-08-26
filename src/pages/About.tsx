import { motion } from "framer-motion";
import { Waves, BedDouble, UtensilsCrossed, Award, Users, Smile } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Gallery from "../components/Gallery";

const facilities = [
  {
    icon: Waves,
    title: "Swimming Pool & Night Deck",
    desc: "Take a refreshing dip in our clean, temperature-controlled swimming pool with ambient underwater lighting.",
    image: "/images/swimming-pool.jpg",
  },
  {
    icon: BedDouble,
    title: "Luxury AC Rooms & Suites",
    desc: "Stay in our spacious, air-conditioned rooms designed with wooden ceilings, plush bedding, and modern amenities.",
    image: "/images/luxury-room.png",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Restaurant & Dining Hall",
    desc: "Savour multi-cuisine delicacies in our warm, welcoming dining hall with elegant chandeliers and impeccable service.",
    image: "/images/fine-dining.jpg",
  },
];

const stats = [
  { icon: Award, value: "14+", label: "Years of Service" },
  { icon: Users, value: "50k+", label: "Happy Customers" },
  { icon: Smile, value: "4.8★", label: "Average Rating" },
  { icon: UtensilsCrossed, value: "76+", label: "Signature Dishes" },
];

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Story */}
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
            Our Story
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink dark:text-white">
            A Legacy of Flavour & Hospitality
          </h1>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">
            Founded in 2010, MANAS Restaurant began as a humble family kitchen
            with one simple mission — to serve food that is{" "}
            <span className="font-semibold text-brand">Fresh, Pure & Delicious</span>.
            Over the years, we've grown into a beloved multi-cuisine destination,
            yet our commitment to authentic taste and warm hospitality remains
            unchanged.
          </p>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Every dish is prepared with hand-picked ingredients, traditional
            recipes, and a whole lot of love. From sizzling street snacks to royal
            thalis, we bring the flavours of India and beyond right to your plate.
          </p>
        </motion.div>
        <div className="relative overflow-hidden rounded-[28px] shadow-2xl group border border-black/5 dark:border-white/10">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            src="/images/hotel-exterior.jpg"
            alt="HOTEL MANAS Family Restaurant & Resort Exterior"
            className="aspect-[16/10] sm:aspect-[4/3] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/60 p-3.5 backdrop-blur border border-white/10 shadow-xl">
            <p className="text-sm font-extrabold text-white tracking-wide">🏨 HOTEL MANAS</p>
            <p className="text-[11px] font-bold text-amber-400">Family Restaurant • Swimming Pool • Luxury Rooms • Garden</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-[20px] bg-white p-6 text-center shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
          >
            <s.icon className="mx-auto mb-2 text-brand" size={26} />
            <p className="text-3xl font-extrabold text-ink dark:text-white">
              {s.value}
            </p>
            <p className="text-sm text-neutral-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Facilities */}
      <div className="mt-20">
        <SectionTitle
          center
          eyebrow="What We Offer"
          title="Our Facilities"
          subtitle="More than just a restaurant — a complete luxury resort experience."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {facilities.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-[28px] bg-white shadow-md ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute left-3.5 top-3.5 grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
                  <f.icon size={18} />
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-extrabold text-ink dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="mt-20">
        <SectionTitle
          center
          eyebrow="Gallery"
          title="Life at MANAS"
          subtitle="A peek into our world of food, comfort & smiles."
        />
        <div className="mt-10">
          <Gallery />
        </div>
      </div>
    </div>
  );
}
