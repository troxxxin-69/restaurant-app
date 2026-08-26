import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare } from "lucide-react";
import { useApp } from "../context/AppContext";
import MapPlaceholder from "../components/MapPlaceholder";
import SectionTitle from "../components/SectionTitle";
import { sanitizeInput, sanitizeEmail } from "../utils/sanitize";

export default function Contact() {
  const { notify, sendContactMessage } = useApp();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(form.name, 100);
    const cleanEmail = sanitizeEmail(form.email);
    const cleanMessage = sanitizeInput(form.message, 1000);

    if (!cleanName || !form.email || !cleanMessage) {
      notify("Please fill all fields", "error");
      return;
    }
    if (!cleanEmail) {
      notify("Please enter a valid email address", "error");
      return;
    }
    setSending(true);
    await sendContactMessage({ name: cleanName, email: cleanEmail, message: cleanMessage });
    setSending(false);
    setForm({ name: "", email: "", message: "" });
  };

  const info = [
    { icon: MapPin, title: "Address", lines: ["Manas Restaurant, Udaipur", "Rajasthan - 313001"] },
    { icon: Phone, title: "Phone", lines: ["+91 98765 43210", "+91 91234 56789"] },
    { icon: Mail, title: "Email", lines: ["hello@manasrestaurant.in", "orders@manasrestaurant.in"] },
    { icon: Clock, title: "Opening Hours", lines: ["Mon–Fri: 9 AM – 11 PM", "Sat–Sun: 8 AM – 12 AM"] },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
          Get In Touch
        </span>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-ink dark:text-white">
          Contact Us
        </h1>
        <p className="mt-2 text-neutral-500">
          Have a question, feedback, or a reservation request? We'd love to hear
          from you.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {info.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-[20px] bg-white p-6 text-center shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
          >
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
              <c.icon size={22} />
            </span>
            <h3 className="font-bold text-ink dark:text-white">{c.title}</h3>
            {c.lines.map((l) => (
              <p key={l} className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {l}
              </p>
            ))}
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <h3 className="text-xl font-bold text-ink dark:text-white">
            Send us a Message
          </h3>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your Name"
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your Email"
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-4 top-4 text-neutral-400" />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your Message"
                rows={5}
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-50"
            >
              <Send size={18} /> {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <MapPlaceholder height="h-full min-h-[380px]" />
        </div>
      </div>

      <div className="mt-16">
        <SectionTitle center title="We're Just a Call Away" subtitle="Order online or dine in — either way, you're family here." />
      </div>
    </div>
  );
}
