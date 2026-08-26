import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Menu as MenuIcon,
  X,
  Moon,
  Sun,
  UtensilsCrossed,
  ShieldCheck,
  Bike,
  UserCheck,
  Key,
  LogOut,
} from "lucide-react";
import { useApp, type AppRole } from "../context/AppContext";
import { cn } from "../utils/cn";

export default function Navbar() {
  const {
    user,
    orders,
    favorites,
    setLoginModalOpen,
    logout,
    cartCount,
    darkMode,
    toggleDarkMode,
    setCartOpen,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
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

  if (user.role === "delivery_partner") {
    links.push({ to: "/delivery", label: "🛵 Delivery Partner Dashboard" });
  }

  if (user.role === "restaurant_admin") {
    links.push({ to: "/admin", label: "🛡️ Admin Control Panel" });
  }

  const roleBadgeInfo: Record<AppRole, { label: string; icon: typeof ShieldCheck; color: string }> = {
    customer: { label: "Customer", icon: UserCheck, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    delivery_partner: { label: "Delivery Fleet", icon: Bike, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    restaurant_admin: { label: "Restaurant Admin", icon: ShieldCheck, color: "bg-brand/10 text-brand" },
  };

  const currentRoleInfo = roleBadgeInfo[user.role] || roleBadgeInfo.customer;
  const RoleIcon = currentRoleInfo.icon;

  const activeDeliveryOrder = orders.find(
    (o) => (o.status === "out_for_delivery" || o.status === "preparing") && o.delivery_boy_name
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      )}
    >
      {activeDeliveryOrder && (
        <div className="bg-amber-500 text-white text-xs font-extrabold py-2 px-4 text-center flex flex-wrap items-center justify-center gap-2 shadow-md">
          <span>
            🛵 Order #{activeDeliveryOrder.id} is Out for Delivery! Delivery Partner: <strong>{activeDeliveryOrder.delivery_boy_name}</strong> (📞 {activeDeliveryOrder.delivery_boy_phone})
          </span>
          <Link
            to="/orders"
            className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase text-white hover:bg-white/30 transition border border-white/30"
          >
            View Live Status ➔
          </Link>
        </div>
      )}

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

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Server-Verified Role Indicator Badge (For Staff & Admins only) */}
          {user.isLoggedIn && user.role !== "customer" && (
            <div
              className={cn(
                "hidden md:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold border border-black/5 dark:border-white/10",
                currentRoleInfo.color
              )}
            >
              <RoleIcon size={14} />
              <span>{currentRoleInfo.label}</span>
            </div>
          )}

          {/* Login / Logout Button (Desktop & Tablet) */}
          {user.isLoggedIn ? (
            <button
              onClick={logout}
              title={`Logged in as ${user.name} (${user.email}). Click to Logout.`}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-bold text-ink transition hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-red-500/20 dark:hover:text-red-400"
            >
              <LogOut size={14} />
              <span className="truncate max-w-[80px]">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
            >
              <Key size={14} />
              <span>Log In</span>
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/menu?category=Favorites"
            aria-label="View favorite dishes"
            title="View Favorite Dishes"
            className="hidden sm:grid relative h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            <Heart size={18} className={favorites.length > 0 ? "fill-red-500 text-red-500" : ""} />
            {favorites.length > 0 && (
              <motion.span
                key={favorites.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm"
              >
                {favorites.length}
              </motion.span>
            )}
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-ink transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-white"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          {/* PROMINENT 3-LINE HAMBURGER MENU BUTTON FOR ALL PHONES & TABLETS */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle Navigation Menu"
            className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl bg-brand/10 border border-brand/20 text-brand shadow-sm transition hover:bg-brand hover:text-white lg:hidden dark:bg-brand/20 dark:border-brand/30 dark:text-brand-light"
          >
            {open ? <X size={20} /> : <MenuIcon size={20} />}
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
            <div className="flex flex-col p-3 space-y-1">
              {user.isLoggedIn && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-neutral-100 p-3 dark:bg-neutral-800">
                  <div className="flex items-center gap-2">
                    <RoleIcon size={16} className="text-brand" />
                    <div>
                      <p className="text-xs font-bold text-ink dark:text-white">{user.name}</p>
                      {user.role !== "customer" && (
                        <p className="text-[10px] text-neutral-500 font-semibold">{currentRoleInfo.label}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-600 dark:text-red-400"
                  >
                    <LogOut size={12} /> Logout
                  </button>
                </div>
              )}

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

              {!user.isLoggedIn && (
                <button
                  onClick={() => {
                    setOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-md shadow-brand/20"
                >
                  <Key size={16} /> Log In / Sign Up
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
