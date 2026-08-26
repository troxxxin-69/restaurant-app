import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  CheckCircle2,
  AlertCircle,
  Upload,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  MANAS_UPI_ID,
  MANAS_BUSINESS_NAME,
  generateUpiDeepLink,
  generateUpiQrCodeDataUrl,
  validateUtrNumber,
  isMobileDevice,
  UPI_APPS,
  generateAppUpiLink,
} from "../utils/upi";
import { useApp, type Order } from "../context/AppContext";

interface UpiPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function UpiPaymentModal({
  order,
  isOpen,
  onClose,
  onSubmitted,
}: UpiPaymentModalProps) {
  const { submitOrderPaymentProof, orders, notify } = useApp();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile] = useState(() => isMobileDevice());

  const handleAppClick = (e: React.MouseEvent, appName: string) => {
    if (!isMobile) {
      e.preventDefault();
      notify(`📱 On Laptop? Please scan the QR Code below using ${appName} on your phone!`, "info");
    }
  };

  const upiDeepLink = order
    ? generateUpiDeepLink({ amount: order.total, orderId: order.id })
    : "";

  useEffect(() => {
    if (order && upiDeepLink) {
      generateUpiQrCodeDataUrl(upiDeepLink).then((url) => setQrCodeDataUrl(url));
    }
  }, [order, upiDeepLink]);

  if (!isOpen || !order) return null;

  const handleCopyUpiId = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(MANAS_UPI_ID);
      } else {
        const input = document.createElement("input");
        input.value = MANAS_UPI_ID;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      notify("📋 UPI ID copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      notify(`UPI ID: ${MANAS_UPI_ID}`, "info");
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size should be less than 5MB.");
      return;
    }

    setFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const validation = validateUtrNumber(utrNumber);
    if (!validation.isValid) {
      setErrorMsg(validation.error || "Invalid UTR Number.");
      return;
    }

    // Duplicate UTR check across existing orders
    const cleanUtr = utrNumber.trim();
    const isDuplicate = orders.some(
      (o) => o.id !== order.id && o.utr_number && o.utr_number.trim() === cleanUtr
    );

    if (isDuplicate) {
      setErrorMsg("This UTR / Transaction ID has already been submitted for another order.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitOrderPaymentProof(order.id, cleanUtr, screenshotUrl);
      if (res.success) {
        if (onSubmitted) onSubmitted();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to submit payment proof. Please try again.");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-ink dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
          >
            <X size={18} />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <ShieldCheck size={14} /> Zero-Commission Direct UPI Payment
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-extrabold text-ink dark:text-white">
            Complete Payment for Order #{order.id}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Pay directly to <strong>{MANAS_BUSINESS_NAME}</strong> via Google Pay, PhonePe, Paytm, BHIM or any UPI App.
          </p>

          {/* Amount Box */}
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand/5 p-4 border border-brand/20 dark:bg-brand/10">
            <div>
              <p className="text-xs font-semibold uppercase text-brand">Total Payable Amount</p>
              <p className="text-2xl font-black text-ink dark:text-white">₹{order.total}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Clock size={14} /> Valid for 30 Mins
            </div>
          </div>

          {/* SELECT & PAY WITH PREFERRED UPI APP */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-850">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
              <Smartphone size={15} className="text-brand" />
              Select Your Preferred UPI App (1-Click Launch)
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {UPI_APPS.map((app) => {
                const appLink = order ? generateAppUpiLink(app.id, { amount: order.total, orderId: order.id }) : "";
                return (
                  <a
                    key={app.id}
                    href={appLink}
                    onClick={(e) => handleAppClick(e, app.name)}
                    target={isMobile ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2.5 rounded-2xl border bg-white p-3 shadow-sm transition hover:scale-[1.02] active:scale-[0.98] dark:bg-neutral-900 ${app.borderColor}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs ${app.iconBg}`}>
                      {app.iconText}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="truncate text-xs font-extrabold text-ink dark:text-white">
                        {app.name}
                      </p>
                      <p className="truncate text-[10px] font-semibold text-neutral-400">
                        {app.tagline}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* QR CODE & MANUAL UPI COPY SECTION */}
            <div className="mt-5 border-t border-dashed border-neutral-200 pt-4 dark:border-neutral-800">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  OR Scan QR Code with Any UPI App
                </p>
                {qrCodeDataUrl ? (
                  <div className="mt-2.5 overflow-hidden rounded-2xl border-4 border-white bg-white p-1.5 shadow-md dark:border-neutral-800">
                    <img src={qrCodeDataUrl} alt="UPI Payment QR Code" className="h-44 w-44 object-contain" />
                  </div>
                ) : (
                  <div className="mt-2.5 flex h-44 w-44 items-center justify-center rounded-2xl bg-neutral-200 text-xs dark:bg-neutral-800">
                    <QrCode size={28} className="animate-spin text-neutral-400" />
                  </div>
                )}
                <p className="mt-1.5 text-[10px] font-semibold text-neutral-500">
                  Scan using Google Pay, PhonePe, Paytm, BHIM or any UPI scanner to pay ₹{order.total}
                </p>
              </div>

              {/* UPI ID Copy Fallback */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-2.5 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <div className="truncate text-xs">
                  <span className="font-semibold text-neutral-400">UPI ID: </span>
                  <span className="font-bold text-ink dark:text-white">{MANAS_UPI_ID}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-xs font-bold text-ink transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* MANUAL UTR & PROOF SUBMISSION FORM */}
          <form onSubmit={handleSubmitProof} className="mt-6 space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle size={14} /> Step 2: Confirm Your Payment
              </h4>
              <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                After paying in your UPI app, please enter your <strong>12-digit UTR / UPI Ref No.</strong> below so our kitchen team can verify your payment and start cooking.
              </p>

              {/* UTR Input */}
              <div className="mt-3">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 dark:text-neutral-300">
                  12-Digit UTR / Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ""))}
                  placeholder="e.g. 423456789012"
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-extrabold tracking-widest text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  required
                />
              </div>

              {/* Optional Screenshot Upload */}
              <div className="mt-3">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 dark:text-neutral-300">
                  Payment Screenshot Proof (Optional)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-neutral-700 shadow-sm border border-neutral-300 transition hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
                    <Upload size={14} /> {fileName ? "Change Image" : "Upload Screenshot"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                  {fileName && (
                    <span className="truncate text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {fileName}
                    </span>
                  )}
                </div>
                {screenshotUrl && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 max-h-32 w-32 dark:border-neutral-800">
                    <img src={screenshotUrl} alt="Payment Proof Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400">
                <AlertCircle size={15} className="shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-extrabold text-white shadow-xl shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? (
                <>Submitting Verification Proof...</>
              ) : (
                <>Submit UTR & Confirm Order ✨</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
