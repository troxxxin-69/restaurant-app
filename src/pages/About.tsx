import { motion } from "framer-motion";
import { Waves, BedDouble, UtensilsCrossed, Award, Users, Smile } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Gallery from "../components/Gallery";

const facilities = [
  {
    icon: Waves,
    title: "Swimming Pool",
    desc: "Take a refreshing dip in our clean, temperature-controlled pool surrounded by lush greenery.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: BedDouble,
    title: "Luxury Rooms",
    desc: "Stay in our elegant, comfortable rooms designed for the perfect getaway with premium amenities.",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Restaurant",
    desc: "Savour multi-cuisine delicacies in our warm, welcoming dining space with impeccable service.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
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
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80"
          alt="Our restaurant"
          className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-2xl"
        />
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
          subtitle="More than just a restaurant — a complete experience."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {facilities.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-lg">
                  <f.icon size={20} />
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-ink dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
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
