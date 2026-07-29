import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { sanitizePhone, sanitizeInput } from "../utils/sanitize";

export default function Login() {
  const { user, sendOTP, verifyOTP, notify } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [testOTP, setTestOTP] = useState<string | null>(null);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (user.isLoggedIn) {
      navigate("/");
    }
  }, [user.isLoggedIn, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

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

    if (cleanVal && index === 3 && newOtp.every((digit) => digit !== "")) {
      const fullOTP = newOtp.join("");
      submitVerification(fullOTP);
    }
  };

  const submitVerification = (otpString?: string) => {
    const code = otpString || otp.join("");
    if (code.length !== 4) {
      notify("Please enter 4-digit OTP", "error");
      return;
    }
    const success = verifyOTP(phone, code, name);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-white p-8 shadow-xl ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <ShieldCheck size={26} />
          </span>
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand">
              SECURE LOGIN
            </span>
            <h1 className="text-2xl font-black text-ink dark:text-white">
              {step === "phone" ? "Mobile Number Login" : "Enter OTP Code"}
            </h1>
          </div>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-neutral-500">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(sanitizeInput(e.target.value, 80))}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-neutral-500">
                Mobile Number <span className="text-brand">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-sm text-ink dark:text-white border-r pr-2 border-neutral-300 dark:border-neutral-700">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="w-full rounded-2xl border border-neutral-200 bg-white py-3 pl-24 pr-4 text-sm font-semibold outline-none transition focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              Get OTP Code <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            {testOTP && (
              <div className="rounded-2xl bg-amber-500/10 p-3 text-center border border-amber-500/20">
                <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  <Sparkles size={14} /> TEST OTP: <span className="text-sm underline tracking-widest">{testOTP}</span>
                </p>
              </div>
            )}

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
                  className="h-14 w-12 rounded-2xl border-2 border-neutral-200 text-center text-xl font-extrabold outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                {timer > 0 ? `Resend in ${timer}s` : "Didn't get code?"}
              </span>
              <button
                disabled={timer > 0}
                onClick={() => handleSendOTP()}
                className="flex items-center gap-1 font-bold text-brand disabled:opacity-40"
              >
                <RefreshCw size={13} /> Resend OTP
              </button>
            </div>

            <button
              onClick={() => submitVerification()}
              className="w-full rounded-full bg-brand py-3.5 font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              Verify & Complete Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
