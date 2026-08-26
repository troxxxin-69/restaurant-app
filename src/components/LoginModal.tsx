import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Mail, Lock, User, Phone, LogIn, UserPlus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { cn } from "../utils/cn";

export default function LoginModal() {
  const {
    loginModalOpen,
    setLoginModalOpen,
    login,
    signUp,
    loginWithGoogle,
  } = useApp();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
  };

  const handleClose = () => {
    resetFields();
    setLoginModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    if (mode === "login") {
      await login(email, password || "123456");
    } else if (mode === "signup") {
      await signUp(email, password || "123456", name || email.split("@")[0], phone);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {loginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
              onClick={handleClose}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <X size={18} />
            </button>

            {/* Header Badge & Title */}
            <div className="flex flex-col items-center text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                <ShieldCheck size={28} />
              </span>
              <span className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-brand">
                AUTHENTICATION PORTAL
              </span>
              <h3 className="text-2xl font-black text-ink dark:text-white">
                Welcome to MANAS
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Pure Vegetarian Fine Dining • Udaipur
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-5 flex rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 rounded-xl py-2 text-xs font-bold transition",
                  mode === "login"
                    ? "bg-white text-ink shadow dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-ink dark:hover:text-white"
                )}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "flex-1 rounded-xl py-2 text-xs font-bold transition",
                  mode === "signup"
                    ? "bg-white text-ink shadow dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-ink dark:hover:text-white"
                )}
              >
                Sign Up
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {mode === "signup" && (
                <>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-xs font-extrabold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark disabled:opacity-50"
              >
                {mode === "login" ? (
                  <>
                    <LogIn size={15} /> {loading ? "Logging in..." : "Log In"}
                  </>
                ) : (
                  <>
                    <UserPlus size={15} /> {loading ? "Creating..." : "Create Account"}
                  </>
                )}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-[10px] font-bold uppercase text-neutral-400">OR CONTINUE WITH</span>
              <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Google OAuth Button */}
            <div>
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white py-2.5 text-xs font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                1-Click Google Sign In
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
