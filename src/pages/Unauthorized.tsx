import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Unauthorized() {
  const { user } = useApp();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="grid h-24 w-24 place-items-center rounded-3xl bg-red-500/10 text-red-500 shadow-xl"
      >
        <ShieldAlert size={50} />
      </motion.div>

      <h1 className="mt-6 text-3xl font-black text-ink dark:text-white">
        Access Restricted
      </h1>
      <p className="mt-2 text-xs text-neutral-500">
        Your logged in role is <span className="font-bold text-brand uppercase">{user.role.replace("_", " ")}</span>. You do not have permission to access this protected route.
      </p>

      <div className="mt-6 rounded-2xl bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-300">
        Staff and Admin roles are granted securely by the restaurant owner via the Database Admin Control Panel.
      </div>

      <Link
        to="/menu"
        className="mt-8 rounded-full bg-brand px-7 py-3 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
      >
        Return to Restaurant Menu
      </Link>
    </div>
  );
}
