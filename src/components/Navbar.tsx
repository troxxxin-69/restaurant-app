import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu as MenuIcon,
  X,
  Moon,
  Sun,
  UtensilsCrossed,
  ShieldCheck,
  ChefHat,
  UserCheck,
  ChevronDown,
  Key,
  LogOut,
} from "lucide-react";
import { useApp, type UserRole } from "../context/AppContext";
import { cn } from "../utils/cn";

export default function Navbar() {
  const {
    user,
    switchRole,
    setLoginModalOpen,
    logout,
    cartCount,
    darkMode,
    toggleDarkMode,
    setCartOpen,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setRoleMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    { to: "/orders", label: "My Orders" },
  ];

  if (user.role === "ADMIN" || user.role === "KITCHEN") {
    links.push({ to: "/kitchen", label: "Kitchen KDS" });
  }

  if (user.role === "ADMIN") {
    links.push({ to: "/admin", label: "Admin Panel" });
  }

  const roleLabels: Record<UserRole, { label: string; icon: typeof ShieldCheck; color: string }> = {
    CUSTOMER: { label: "Customer", icon: UserCheck, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    KITCHEN: { label: "Kitchen", icon: ChefHat, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    ADMIN: { label: "Admin", icon: ShieldCheck, color: "bg-brand/10 text-brand" },
  };

  const currentRoleInfo = roleLabels[user.role];
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
            <UtensilsCrossed size={20} />
          </span>
          <div className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight text-ink dark:text-white">
              MANAS
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
              Restaurant
            </span>
          </div>
          <span
            title="100% Pure Vegetarian"
            className="ml-1 hidden sm:inline-flex items-center gap-1 rounded-full border border-green-600/30 bg-green-50 px-2 py-1 dark:bg-green-500/10"
          >
            <span className="grid h-4 w-4 place-items-center rounded-[3px] border-2 border-green-600">
              <span className="block h-1.5 w-1.5 rounded-full bg-green-600" />
            </span>
            <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-green-700 dark:text-green-400">
              Pure Veg
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-brand/10 text-brand font-bold"
                    : "text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* RBAC Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen((r) => !r)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold transition border border-black/5 dark:border-white/10",
                currentRoleInfo.color
              )}
              title="Click to Switch User Role (RBAC)"
            >
              <RoleIcon size={14} />
              <span>{currentRoleInfo.label}</span>
              <ChevronDown size={12} className={roleMenuOpen ? "rotate-180 transition" : "transition"} />
            </button>

            <AnimatePresence>
              {roleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-11 z-50 w-52 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/10 dark:bg-neutral-900 dark:ring-white/10"
                >
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Switch Role (RBAC)
                  </p>
                  <div className="mt-1 space-y-1">
                    {(["CUSTOMER", "KITCHEN", "ADMIN"] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition",
                          user.role === r
                            ? "bg-brand/10 text-brand"
                            : "hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        )}
                      >
                        <span>{r === "CUSTOMER" ? "Customer" : r === "KITCHEN" ? "Kitchen Staff" : "Admin (Owner)"}</span>
                        {user.role === r && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login / Logout Button */}
          {user.isLoggedIn ? (
            <button
              onClick={logout}
              title={`Logged in as ${user.name} (${user.phone}). Click to Logout.`}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-bold text-ink transition hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-red-500/20 dark:hover:text-red-400"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
            >
              <Key size={14} />
              <span>Login</span>
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-black/5 lg:hidden dark:text-white dark:hover:bg-white/10"
          >
            {open ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5 bg-white lg:hidden dark:border-white/10 dark:bg-neutral-900"
          >
            <div className="flex flex-col p-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-brand/10 text-brand font-bold"
                        : "text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10"
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
