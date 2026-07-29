import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, UserCheck } from "lucide-react";
import { useApp, type UserRole } from "../context/AppContext";

export default function Unauthorized() {
  const { user, switchRole } = useApp();

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: "CUSTOMER", label: "Customer", desc: "Browse menu, order food, view order history" },
    { role: "KITCHEN", label: "Kitchen Staff", desc: "View live KDS board, update order status" },
    { role: "ADMIN", label: "Restaurant Owner (Admin)", desc: "Full control, menu manager, analytics & RBAC" },
  ];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="grid h-24 w-24 place-items-center rounded-3xl bg-red-500/10 text-red-500 shadow-xl"
      >
        <ShieldAlert size={50} />
      </motion.div>

      <h1 className="mt-6 text-3xl font-extrabold text-ink dark:text-white">
        Access Denied
      </h1>
      <p className="mt-2 text-neutral-500">
        Your current role is <span className="font-bold text-brand">{user.role}</span>. You do not have permission to view this page.
      </p>

      <div className="mt-8 w-full rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <h3 className="flex items-center justify-center gap-2 font-bold text-ink dark:text-white">
          <UserCheck size={18} className="text-brand" /> Switch Role to Test Access:
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`rounded-2xl border-2 p-3 text-left transition ${
                user.role === r.role
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-neutral-200 dark:border-neutral-700 dark:text-white"
              }`}
            >
              <p className="text-sm font-bold">{r.label}</p>
              <p className="text-[10px] text-neutral-400">{r.role}</p>
            </button>
          ))}
        </div>
      </div>

      <Link
        to="/"
        className="mt-8 rounded-full bg-brand px-7 py-3 font-semibold text-white shadow-lg shadow-brand/30"
      >
        Back to Home
      </Link>
    </div>
  );
}
