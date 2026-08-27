import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Landmark, Building2, Hash, Banknote, CreditCard, Tag, LocateFixed, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useApp, type Order } from "../context/AppContext";
import MapPlaceholder from "../components/MapPlaceholder";
import UpiPaymentModal from "../components/UpiPaymentModal";
import { cn } from "../utils/cn";
import { sanitizeInput, sanitizePhone, validatePhone, sanitizeGoogleMapsUrl } from "../utils/sanitize";
import { isWithinDeliveryRadius, resolveLocationCoordinates, parseGoogleMapsUrlCoordinatesAsync, reverseGeocodeCoordinates, RESTAURANT_LAT, RESTAURANT_LNG, MAX_DELIVERY_RADIUS_KM } from "../utils/distance";

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

  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [upiModalOrder, setUpiModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user.isLoggedIn) {
      notify("Please log in to complete your checkout order", "info");
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [user.isLoggedIn, navigate, notify]);

  const [payment, setPayment] = useState("Cash On Delivery");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [resolvingLink, setResolvingLink] = useState(false);
  const [form, setForm] = useState<Form>({
    name: user.isLoggedIn ? user.name : "",
    phone: user.phone || "",
    address: "",
    landmark: "",
    city: "Udaipur",
    pincode: "313001",
  });

  const [locationMode, setLocationMode] = useState<"google_maps_link" | "gps_device" | "manual_address">("manual_address");

  const handleGoogleMapsLinkInputChange = async (val: string) => {
    setGoogleMapsLink(val);
    if (!val || !val.trim()) {
      setUserCoords(null);
      return;
    }

    const mapsCheck = sanitizeGoogleMapsUrl(val);
    if (!mapsCheck.valid) return;

    setErrors((prev) => ({ ...prev, address: undefined }));
    setLocationMode("google_maps_link");
    setResolvingLink(true);

    // Asynchronously resolve short or long Google Maps link to exact GPS coordinates
    const parsedCoords = await parseGoogleMapsUrlCoordinatesAsync(mapsCheck.cleanUrl);
    setResolvingLink(false);

    if (parsedCoords) {
      setUserCoords({ lat: parsedCoords.lat, lng: parsedCoords.lng });

      // Calculate exact distance in real-time
      const radiusCheck = isWithinDeliveryRadius(parsedCoords.lat, parsedCoords.lng);

      if (radiusCheck.allowed) {
        notify(`✨ Pin Captured! (${parsedCoords.lat.toFixed(4)}, ${parsedCoords.lng.toFixed(4)}) — ${radiusCheck.distanceKm} km from Dabok branch`, "success");
      } else {
        notify(`❌ Delivery Restricted: Location is ${radiusCheck.distanceKm} km away. We only deliver within ${MAX_DELIVERY_RADIUS_KM} km of our Dabok branch!`, "error");
      }

      // Reverse geocode address details in background without blocking UI
      reverseGeocodeCoordinates(parsedCoords.lat, parsedCoords.lng).then((geoDetails) => {
        setForm((prev) => ({
          ...prev,
          address: geoDetails.address || prev.address || "Google Maps Shared Location",
          landmark: geoDetails.landmark || prev.landmark || "",
          city: geoDetails.city || prev.city || "Udaipur",
          pincode: geoDetails.pincode || prev.pincode || "313001",
        }));
      });
    } else {
      notify("⚠️ Could not auto-detect GPS pin from link. Please enter your street address or pincode manually.", "info");
    }
  };

  useEffect(() => {
    if (user.isLoggedIn) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      notify("Geolocation is not supported by your browser.", "error");
      return;
    }

    setDetectingLocation(true);
    notify("📍 Fetching detailed street address from GPS...", "info");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationMode("gps_device");

        let fullAddress = "";
        let landmarkStr = "";
        let cityStr = "Udaipur";
        let pincodeStr = "313001";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            const streetParts = [
              addr.building || addr.amenity,
              addr.house_number ? `House/Plot #${addr.house_number}` : "",
              addr.road,
              addr.suburb || addr.neighbourhood || addr.residential || addr.colony,
            ].filter(Boolean);

            fullAddress = streetParts.join(", ");
            if (!fullAddress && data.display_name) {
              fullAddress = data.display_name.split(", ").slice(0, -3).join(", ");
            }

            landmarkStr = addr.neighbourhood || addr.suburb || addr.road || "";
            cityStr = addr.city || addr.town || addr.village || addr.county || "Udaipur";
            pincodeStr = addr.postcode || "313001";
          }
        } catch (err) {
          console.warn("GPS Reverse geocoding notice:", err);
        }

        setForm((prev) => ({
          ...prev,
          address: fullAddress || prev.address || `GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          landmark: landmarkStr || prev.landmark,
          city: cityStr || prev.city || "Udaipur",
          pincode: pincodeStr || prev.pincode || "313001",
        }));

        setDetectingLocation(false);
        notify("📍 Hardware GPS location & street address captured successfully!", "success");
      },
      () => {
        setDetectingLocation(false);
        notify("Could not fetch GPS location. Please check browser permissions.", "error");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const [errors, setErrors] = useState<Partial<Form>>({});

  const discount = navState?.discount ?? 0;
  const couponCode = navState?.coupon ?? "";
  const delivery = cartSubtotal > 499 ? 0 : 40;
  const gst = Math.round(Math.max(0, cartSubtotal - discount) * 0.05);
  const grandTotal = Math.max(0, cartSubtotal - discount + delivery + gst);

  if (cart.length === 0 && !upiModalOpen) {
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
    
    const phoneRes = validatePhone(form.phone);
    if (!phoneRes.valid && phoneRes.error) {
      e.phone = phoneRes.error;
    }

    const hasValidGoogleMapsLink = Boolean(
      googleMapsLink && googleMapsLink.trim() && sanitizeGoogleMapsUrl(googleMapsLink).valid
    );

    // Require address ONLY IF no Google Maps link and no GPS pin is provided
    if (!form.address.trim() && !hasValidGoogleMapsLink && !userCoords) {
      e.address = "Address is required (or paste Google Maps link below)";
    }

    if (!form.city.trim()) e.city = "City is required";
    if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode (starts with 1-9)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;

    if (cart.length === 0) {
      notify("Your cart is empty. Please add items before placing order.", "error");
      return;
    }
    if (!validate()) {
      notify("Please fill all required fields correctly", "error");
      return;
    }

    // Security Check: Enforce Google Maps URL Protocol & Domain Whitelist
    if (googleMapsLink && googleMapsLink.trim()) {
      const mapsCheck = sanitizeGoogleMapsUrl(googleMapsLink);
      if (!mapsCheck.valid) {
        notify(mapsCheck.error || "⚠️ Invalid Google Maps URL", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const cleanName = sanitizeInput(form.name, 100);
      const cleanPhone = sanitizePhone(form.phone);
      const cleanGoogleMapsLink = sanitizeGoogleMapsUrl(googleMapsLink).cleanUrl;
      const cleanAddress = sanitizeInput(form.address, 300) || (cleanGoogleMapsLink ? "Google Maps Shared Location" : "Customer Address");
      const cleanLandmark = sanitizeInput(form.landmark, 150);
      const cleanCity = sanitizeInput(form.city, 100);
      const cleanPincode = sanitizeInput(form.pincode, 10);

      let finalLat = userCoords?.lat;
      let finalLng = userCoords?.lng;
      let finalMode: "google_maps_link" | "gps_device" | "manual_address" = locationMode;

      // Mode 1: Google Maps Link Priority (Supports Short URLs & Expanded Coordinate Extraction)
      if (cleanGoogleMapsLink) {
        finalMode = "google_maps_link";
        const parsedLinkCoords = await parseGoogleMapsUrlCoordinatesAsync(cleanGoogleMapsLink);
        if (parsedLinkCoords) {
          finalLat = parsedLinkCoords.lat;
          finalLng = parsedLinkCoords.lng;
          notify(`🗺️ Exact location pin extracted from Google Maps link! (${finalLat.toFixed(4)}, ${finalLng.toFixed(4)})`, "success");
        }
      }

      // Auto-geocode typed address using Multi-Tier Geocoding Engine if GPS button wasn't clicked & no link provided
      if (!finalLat || !finalLng) {
        const resolved = await resolveLocationCoordinates(cleanAddress, cleanLandmark, cleanCity, cleanPincode, cleanGoogleMapsLink);
        finalLat = resolved.lat;
        finalLng = resolved.lng;
        if (!cleanGoogleMapsLink && locationMode !== "gps_device") {
          finalMode = resolved.mode || "manual_address";
        }
      }

      // Validate delivery zone
      const radiusCheck = isWithinDeliveryRadius(finalLat, finalLng);
      if (!radiusCheck.allowed) {
        notify(`❌ Delivery Restricted: Your location is ${radiusCheck.distanceKm} km away. We only deliver within ${MAX_DELIVERY_RADIUS_KM} km of our Dabok branch!`, "error");
        setSubmitting(false);
        return;
      }

      const fullAddress = `${cleanName} — ${cleanAddress}${cleanLandmark ? ` (Near ${cleanLandmark})` : ""}, ${cleanCity} - ${cleanPincode} [Tel: ${cleanPhone}] (GPS Pin: ${finalLat.toFixed(6)}, ${finalLng.toFixed(6)})`;

      const isUpiPayment = payment.toLowerCase().includes("upi") || payment.toLowerCase().includes("online");
      const initialStatus = isUpiPayment ? "pending_payment" : "placed";

      const placeRes = await placeOrder({
        customer_name: cleanName,
        phone: cleanPhone,
        payment_type: sanitizeInput(payment, 50),
        items: cart,
        total: grandTotal,
        address: fullAddress,
        payment: sanitizeInput(payment, 50),
        lat: finalLat,
        lng: finalLng,
        street_address: cleanAddress,
        landmark: cleanLandmark,
        city: cleanCity,
        pincode: cleanPincode,
        google_maps_link: cleanGoogleMapsLink || undefined,
        location_mode: finalMode,
        status: initialStatus,
      } as any);

      if (!placeRes || !placeRes.success || !placeRes.order) {
        setSubmitting(false);
        return;
      }

      const order = placeRes.order;

      if (isUpiPayment) {
        setUpiModalOrder(order);
        setUpiModalOpen(true);
      } else {
        clearCart();
        navigate("/order-success", {
          state: { orderId: order.id, total: grandTotal, payment },
        });
      }
    } catch (err) {
      console.error("Order submission error:", err);
      notify("Failed to place order. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-ink dark:text-white">
                Delivery Details
              </h3>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition hover:bg-brand hover:text-white dark:bg-brand/20"
              >
                {detectingLocation ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                {detectingLocation ? "Detecting GPS..." : "📍 Use Current GPS Location (Auto-Fill)"}
              </button>
            </div>

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
                        setForm({
                          ...form,
                          [f.key]: f.key === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value,
                        })
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

              {/* Optional Google Maps Link Input Field */}
              <div className="col-span-full mt-2 border-t border-neutral-100 pt-3.5 dark:border-neutral-800">
                <label className="mb-1 flex items-center justify-between text-xs font-bold text-ink dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand" />
                    Enter Google Maps Link
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    Optional
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={googleMapsLink}
                    onChange={(e) => handleGoogleMapsLinkInputChange(e.target.value)}
                    placeholder="Paste your Google Maps location link (e.g. https://maps.app.goo.gl/...)"
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-3.5 pr-10 text-xs font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  {resolvingLink && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand" />
                  )}
                </div>

                {resolvingLink ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand animate-pulse">
                    <Loader2 size={13} className="animate-spin shrink-0" />
                    <span>Detecting your location from Google Maps link...</span>
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-neutral-400 leading-normal break-words max-w-full">
                    ⚡ <strong>1-Click Auto-Fill:</strong> Pasting your Google Maps link automatically fills your address, landmark, city & pincode!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Map & 7 KM Delivery Radius Geofence */}
          {(() => {
            const currentLat = userCoords?.lat || RESTAURANT_LAT;
            const currentLng = userCoords?.lng || RESTAURANT_LNG;
            const deliveryCheck = isWithinDeliveryRadius(currentLat, currentLng);

            return (
              <div className="rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-ink dark:text-white">
                    {userCoords ? "📍 Your Detected Delivery Location" : "MANAS Restaurant Branch (Dabok)"}
                  </h3>

                  {userCoords && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black shadow-sm",
                        deliveryCheck.allowed
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      )}
                    >
                      {deliveryCheck.allowed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {deliveryCheck.message}
                    </span>
                  )}
                </div>

                {!userCoords && (
                  <div className="rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    📍 <strong>Delivery Coverage Zone:</strong> MANAS Restaurant delivers within <strong>7.0 KM radius</strong> of our Dabok branch. Click <strong>"Use Current GPS Location"</strong> to verify your area!
                  </div>
                )}

                {userCoords && !deliveryCheck.allowed && (
                  <div className="rounded-2xl bg-red-500/10 p-4 border border-red-500/30 text-xs font-bold text-red-700 dark:text-red-300">
                    ❌ <strong>Out of Delivery Radius ({deliveryCheck.distanceKm} km away):</strong>
                    <p className="mt-1 font-normal text-red-600 dark:text-red-400">
                      Your location is outside our 7.0 KM delivery radius from our Dabok branch. Please select an address within 7 km or visit us for takeaway!
                    </p>
                  </div>
                )}

                <MapPlaceholder
                  height="h-64"
                  lat={currentLat}
                  lng={currentLng}
                  title={userCoords ? `Your Location (${deliveryCheck.distanceKm} km from Dabok)` : "MANAS Restaurant Dabok Branch"}
                  subtitle={userCoords ? (deliveryCheck.allowed ? "✅ Within 7.0 km delivery coverage" : "❌ Outside 7.0 km delivery coverage") : "Dabok, Udaipur — Kitchen Branch"}
                />
              </div>
            );
          })()}

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
            {(() => {
              const currentLat = userCoords?.lat || RESTAURANT_LAT;
              const currentLng = userCoords?.lng || RESTAURANT_LNG;
              const isRestricted = userCoords ? !isWithinDeliveryRadius(currentLat, currentLng).allowed : false;
              const distKm = userCoords ? isWithinDeliveryRadius(currentLat, currentLng).distanceKm : 0;

              return (
                <motion.button
                  whileTap={isRestricted ? {} : { scale: 0.97 }}
                  type="submit"
                  disabled={submitting || isRestricted}
                  className={cn(
                    "mt-5 w-full rounded-full py-3.5 font-semibold text-white shadow-lg transition",
                    isRestricted
                      ? "bg-red-600 shadow-red-600/30 cursor-not-allowed opacity-90"
                      : "bg-brand hover:bg-brand-dark shadow-brand/30"
                  )}
                >
                  {isRestricted
                    ? `❌ Delivery Restricted (${distKm} km > 7.0 km limit)`
                    : `Place Order — ₹${grandTotal}`}
                </motion.button>
              );
            })()}
          </div>
        </div>
      </form>

      <UpiPaymentModal
        order={upiModalOrder}
        isOpen={upiModalOpen}
        onClose={() => {
          clearCart();
          setUpiModalOpen(false);
          navigate("/orders");
        }}
        onSubmitted={() => {
          clearCart();
          setUpiModalOpen(false);
          navigate("/orders");
        }}
      />
    </div>
  );
}
