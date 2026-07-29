import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  Share2,
  Camera,
  Send,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

const socials = [Share2, Camera, Send, MessageCircle];

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white">
              <UtensilsCrossed size={20} />
            </span>
            <div className="leading-none">
              <span className="block text-lg font-extrabold text-white">MANAS</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                Restaurant
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-neutral-400">
            Fresh • Pure • Delicious. Serving authentic multi-cuisine delicacies
            with love since 2010.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brand"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/menu", label: "Menu" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
              { to: "/orders", label: "My Orders" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Contact
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
              Manas Restaurant, Udaipur, Rajasthan - 313001
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-brand" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-brand" /> hello@manasrestaurant.in
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Opening Hours
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-brand" /> Mon - Fri: 9 AM – 11 PM
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-brand" /> Sat - Sun: 8 AM – 12 AM
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} MANAS Restaurant. All rights reserved. Made
        with ❤️ for food lovers.
      </div>
    </footer>
  );
}
