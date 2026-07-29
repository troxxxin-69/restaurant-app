import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, ArrowRight, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { sanitizePhone, sanitizeInput } from "../utils/sanitize";

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, sendOTP, verifyOTP, notify } = useApp();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [testOTP, setTestOTP] = useState<string | null>(null);
  const [, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Reset modal state when closed
  useEffect(() => {
    if (!loginModalOpen) {
      setStep("phone");
      setOtp(["", "", "", ""]);
      setTimer(30);
      setTestOTP(null);
    }
  }, [loginModalOpen]);

  const handleSendOTP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = sanitizePhone(phone);
    if (clean.length !== 10) {
      notify("Please enter a valid 10-digit mobile number", "error");
      return;
    }
    const res = sendOTP(clean);
    if (res.success) {
      setTestOTP(res.testOTP || null);
      setStep("otp");
      setTimer(30);
      setOtp(["", "", "", ""]);
      setTimeout(() => pinRefs[0].current?.focus(), 150);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    if (cleanVal && index < 3) {
      pinRefs[index + 1].current?.focus();
    }

    // Auto verify when all 4 boxes filled
    if (cleanVal && index === 3 && newOtp.every((digit) => digit !== "")) {
      const fullOTP = newOtp.join("");
      submitVerification(fullOTP);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const submitVerification = (otpString?: string) => {
    if (locked) {
      notify("Too many failed attempts. Please wait 60 seconds", "error");
      return;
    }

    const code = otpString || otp.join("");
    if (code.length !== 4) {
      notify("Please enter 4-digit OTP", "error");
      return;
    }

    const success = verifyOTP(phone, code, name);
    if (!success) {
      setAttempts((a) => {
        const next = a + 1;
        if (next >= 3) {
          setLocked(true);
          setTimeout(() => {
            setLocked(false);
            setAttempts(0);
          }, 60000);
        }
        return next;
      });
    }
  };

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl dark:bg-neutral-900 dark:ring-1 dark:ring-white/10"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <X size={18} />
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                <ShieldCheck size={22} />
              </span>
              <div>
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand">
                  SECURE AUTHENTICATION
                </span>
                <h3 className="text-xl font-black text-ink dark:text-white">
                  {step === "phone" ? "Login or Signup" : "Verify Phone Number"}
                </h3>
              </div>
            </div>

            {/* STEP 1: PHONE NUMBER INPUT */}
            {step === "phone" && (
              <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter your 10-digit mobile number to receive a secure OTP code.
                </p>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-neutral-500">
                    Full Name (Optional)
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(sanitizeInput(e.target.value, 80))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-neutral-500">
                    Mobile Number <span className="text-brand">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 flex items-center gap-1.5 text-sm font-bold text-ink dark:text-white border-r pr-2 border-neutral-300 dark:border-neutral-700">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-24 pr-4 text-sm font-semibold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
                >
                  Send OTP Code <ArrowRight size={18} />
                </motion.button>
              </form>
            )}

            {/* STEP 2: OTP PIN INPUT */}
            {step === "otp" && (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-brand/5 p-3 text-center border border-brand/10">
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    OTP sent to <span className="font-bold text-brand">+91 {phone}</span>
                  </p>
                  {testOTP && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      <Sparkles size={14} /> TEST OTP CODE: <span className="underline tracking-widest text-sm bg-amber-500/10 px-2 py-0.5 rounded-md">{testOTP}</span>
                    </div>
                  )}
                </div>

                {/* 4-Box PIN Input */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={pinRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="h-14 w-12 rounded-2xl border-2 border-neutral-200 text-center text-xl font-extrabold outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  ))}
                </div>

                {locked ? (
                  <p className="text-center text-xs font-bold text-red-500">
                    🔒 Account locked due to 3 failed attempts. Try in 60s.
                  </p>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      {timer > 0 ? `Resend in ${timer}s` : "Didn't receive OTP?"}
                    </span>
                    <button
                      disabled={timer > 0}
                      onClick={() => handleSendOTP()}
                      className="flex items-center gap-1 font-bold text-brand disabled:opacity-40"
                    >
                      <RefreshCw size={13} /> Resend OTP
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("phone")}
                    className="flex-1 rounded-full border border-neutral-200 py-3 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Change Number
                  </button>
                  <button
                    onClick={() => submitVerification()}
                    disabled={locked || otp.join("").length !== 4}
                    className="flex-2 flex items-center justify-center gap-1.5 rounded-full bg-brand py-3 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-50"
                  >
                    Verify & Login <Lock size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
