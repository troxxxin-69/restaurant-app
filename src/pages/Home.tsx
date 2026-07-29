import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Truck,
  Leaf,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import Hero from "../components/Hero";
import OfferBanner from "../components/OfferBanner";
import CategorySection from "../components/CategorySection";
import FoodCard from "../components/FoodCard";
import SectionTitle from "../components/SectionTitle";
import ReviewCard from "../components/ReviewCard";
import Gallery from "../components/Gallery";
import MapPlaceholder from "../components/MapPlaceholder";
import { reviews } from "../data/menu";
import { useApp } from "../context/AppContext";

const whyChoose = [
  { icon: Leaf, title: "Fresh Ingredients", desc: "Locally sourced, farm-fresh produce daily." },
  { icon: Truck, title: "Fast Delivery", desc: "Piping hot food at your door in 30 minutes." },
  { icon: ShieldCheck, title: "Hygienic Kitchen", desc: "FSSAI certified, spotless cooking standards." },
  { icon: Clock, title: "Open Late", desc: "Serving delicious meals till midnight." },
];

export default function Home() {
  const { menuItems } = useApp();
  const popular = menuItems.filter((m) => m.rating >= 4.7).slice(0, 8);
  const special = menuItems.filter((m) =>
    ["Special Manas Thali", "Malai Kopta", "Manas Special Pizza", "Paneer Butter Masala"].includes(m.name)
  );

  return (
    <div className="overflow-hidden">
      <Hero />
      <OfferBanner />
      <CategorySection />

      {/* Popular Dishes */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="flex items-end justify-between">
          <SectionTitle
            eyebrow="Trending"
            title="Popular Dishes"
            subtitle="Most loved dishes by our customers."
          />
          <Link
            to="/menu"
            className="hidden items-center gap-1 text-sm font-semibold text-brand hover:gap-2 sm:flex"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Today's Special */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionTitle
          center
          eyebrow="Chef's Pick"
          title="Today's Special"
          subtitle="Exclusive dishes prepared fresh by our master chefs."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {special.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            center
            eyebrow="Why MANAS"
            title="Why Choose Us"
            subtitle="We are committed to delivering the best food experience."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-[20px] bg-[#F8F8F8] p-6 text-center transition hover:shadow-xl dark:bg-neutral-800"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <w.icon size={26} />
                </span>
                <h3 className="mt-4 font-bold text-ink dark:text-white">
                  {w.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {w.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionTitle
          center
          eyebrow="Moments"
          title="Our Gallery"
          subtitle="A glimpse of our delicious food and cozy ambience."
        />
        <div className="mt-10">
          <Gallery />
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-16 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6">
          <SectionTitle
            center
            eyebrow="Testimonials"
            title="What Our Customers Say"
            subtitle="Real reviews from our happy foodies."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionTitle
          center
          eyebrow="Visit Us"
          title="Find Us Here"
          subtitle="Manas Restaurant, Udaipur, Rajasthan - 313001"
        />
        <div className="mt-10">
          <MapPlaceholder height="h-96" />
        </div>
      </section>
    </div>
  );
}
