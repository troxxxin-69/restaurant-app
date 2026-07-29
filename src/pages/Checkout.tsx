import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Landmark, Building2, Hash, Banknote, CreditCard, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";
import MapPlaceholder from "../components/MapPlaceholder";
import { cn } from "../utils/cn";
import { sanitizeInput, sanitizePhone } from "../utils/sanitize";

interface Form {
  name: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  pincode: string;
}

export default function Checkout() {
  const { user, cart, cartSubtotal, placeOrder, clearCart, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { coupon?: string; discount?: number } | null;

  const [payment, setPayment] = useState("Cash On Delivery");
  const [form, setForm] = useState<Form>({
    name: user.isLoggedIn ? user.name : "",
    phone: user.phone || "",
    address: "",
    landmark: "",
    city: "Udaipur",
    pincode: "313001",
  });
  const [errors, setErrors] = useState<Partial<Form>>({});

  const discount = navState?.discount ?? 0;
  const couponCode = navState?.coupon ?? "";
  const delivery = cartSubtotal > 499 ? 0 : 40;
  const gst = Math.round(Math.max(0, cartSubtotal - discount) * 0.05);
  const grandTotal = Math.max(0, cartSubtotal - discount + delivery + gst);

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-28 text-center">
        <span className="text-6xl">🍽️</span>
        <h2 className="text-2xl font-extrabold text-ink dark:text-white">
          Nothing to checkout
        </h2>
        <button
          onClick={() => navigate("/menu")}
          className="rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand/30"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const validate = () => {
    const e: Partial<Form> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      notify("Please fill all required fields", "error");
      return;
    }
    const cleanName = sanitizeInput(form.name, 100);
    const cleanPhone = sanitizePhone(form.phone);
    const cleanAddress = sanitizeInput(form.address, 300);
    const cleanLandmark = sanitizeInput(form.landmark, 150);
    const cleanCity = sanitizeInput(form.city, 100);
    const cleanPincode = sanitizeInput(form.pincode, 10);

    const fullAddress = `${cleanName} — ${cleanAddress}${cleanLandmark ? ` (Near ${cleanLandmark})` : ""}, ${cleanCity} - ${cleanPincode} [Tel: ${cleanPhone}]`;

    const order = placeOrder({
      items: cart,
      total: grandTotal,
      address: fullAddress,
      payment: sanitizeInput(payment, 50),
    });
    clearCart();
    navigate("/order-success", {
      state: { orderId: order.id, total: grandTotal, payment },
    });
  };

  const fields: {
    key: keyof Form;
    label: string;
    icon: typeof User;
    placeholder: string;
    full?: boolean;
  }[] = [
    { key: "name", label: "Full Name", icon: User, placeholder: "John Doe" },
    { key: "phone", label: "Phone Number", icon: Phone, placeholder: "9876543210" },
    { key: "address", label: "Address", icon: MapPin, placeholder: "House no, Street, Area", full: true },
    { key: "landmark", label: "Landmark", icon: Landmark, placeholder: "Near..." },
    { key: "city", label: "City", icon: Building2, placeholder: "Udaipur" },
    { key: "pincode", label: "Pincode", icon: Hash, placeholder: "313001" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink dark:text-white">Checkout</h1>
      <p className="mt-1 text-neutral-500">Almost there! Complete your order.</p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Customer details */}
          <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h3 className="mb-5 text-lg font-bold text-ink dark:text-white">
              Delivery Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-500">
                    {f.label}
                    {f.key !== "landmark" && (
                      <span className="text-brand"> *</span>
                    )}
                  </label>
                  <div className="relative">
                    <f.icon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      placeholder={f.placeholder}
                      className={cn(
                        "w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:bg-neutral-800 dark:text-white",
                        errors[f.key]
                          ? "border-red-400"
                          : "border-neutral-200 dark:border-neutral-700"
                      )}
                    />
                  </div>
                  {errors[f.key] && (
                    <p className="mt-1 text-xs text-red-500">{errors[f.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">
              Delivery Location
            </h3>
            <MapPlaceholder height="h-64" />
          </div>

          {/* Payment */}
          <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">
              Payment Method
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Cash On Delivery", icon: Banknote, desc: "Pay when you receive" },
                { label: "Online Payment", icon: CreditCard, desc: "UPI / Card / Wallet" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setPayment(p.label)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
                    payment === p.label
                      ? "border-brand bg-brand/5"
                      : "border-neutral-200 dark:border-neutral-700"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      payment === p.label
                        ? "bg-brand text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    )}
                  >
                    <p.icon size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink dark:text-white">
                      {p.label}
                    </p>
                    <p className="text-xs text-neutral-400">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit lg:sticky lg:top-24">
          <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">
              Order Summary
            </h3>
            <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-ink dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      ₹{item.price} × {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-ink dark:text-white">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>
            <div className="my-4 space-y-2 border-t border-dashed border-neutral-200 pt-4 text-sm dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-semibold dark:text-white">₹{cartSubtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag size={13} /> Discount ({couponCode || "Coupon"})
                  </span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery</span>
                <span className={delivery === 0 ? "font-semibold text-green-600" : "font-semibold dark:text-white"}>
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GST (5%)</span>
                <span className="font-semibold dark:text-white">₹{gst}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold text-ink dark:text-white">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="mt-5 w-full rounded-full bg-brand py-3.5 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              Place Order — ₹{grandTotal}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
