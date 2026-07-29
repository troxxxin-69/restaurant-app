import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { menu as defaultMenu, type FoodItem } from "../data/menu";
import {
  safeParseJSON,
  generateSecureOTP,
  validateOTPFormat,
  sanitizePhone,
  sanitizeInput,
} from "../utils/sanitize";

export type UserRole = "CUSTOMER" | "KITCHEN" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  isLoggedIn?: boolean;
}

export interface CartItem extends FoodItem {
  qty: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: number; // 0 received, 1 preparing, 2 out for delivery, 3 delivered
  address: string;
  payment: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  user: User;
  switchRole: (role: UserRole) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (v: boolean) => void;
  sendOTP: (phone: string) => { success: boolean; testOTP?: string; error?: string };
  verifyOTP: (phone: string, otpInput: string, name?: string) => boolean;
  logout: () => void;
  menuItems: FoodItem[];
  addMenuItem: (item: Omit<FoodItem, "id">) => void;
  updateMenuItem: (id: number, updated: Partial<FoodItem>) => void;
  deleteMenuItem: (id: number) => void;
  cart: CartItem[];
  addToCart: (item: FoodItem, qty?: number) => void;
  removeFromCart: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toasts: Toast[];
  notify: (message: string, type?: Toast["type"]) => void;
  orders: Order[];
  placeOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  repeatOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const load = <T,>(key: string, fallback: T): T => {
  return safeParseJSON<T>(localStorage.getItem(key), fallback);
};

const defaultUser: User = {
  id: "usr-admin-1",
  name: "Restaurant Owner",
  email: "owner@manasrestaurant.in",
  role: "ADMIN",
};

const seedOrders: Order[] = [
  {
    id: "MNS-100234",
    items: [
      {
        id: 117,
        name: "Paneer Butter Masala",
        price: 180,
        category: "Paneer Special",
        veg: true,
        rating: 4.9,
        description: "Paneer in a rich buttery tomato gravy.",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80",
        qty: 2,
      },
      {
        id: 133,
        name: "Butter Naan",
        price: 60,
        category: "Roti",
        veg: true,
        rating: 4.7,
        description: "Fluffy naan glazed with butter.",
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&h=600&q=80",
        qty: 3,
      },
      {
        id: 1,
        name: "Sweet Lassi",
        price: 50,
        category: "Drinks",
        veg: true,
        rating: 4.6,
        description: "Thick, creamy sweetened yogurt drink in kulhad.",
        image: "https://images.pexels.com/photos/29699511/pexels-photo-29699511.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop",
        qty: 2,
      },
    ],
    total: 640,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 3,
    address: "12 Ashok Nagar, Udaipur, Rajasthan",
    payment: "Cash On Delivery",
  },
  {
    id: "MNS-100235",
    items: [
      {
        id: 156,
        name: "Veg Biryani",
        price: 180,
        category: "Rice",
        veg: true,
        rating: 4.7,
        description: "Fragrant biryani with veggies & spices.",
        image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=600&h=600&q=80",
        qty: 1,
      },
      {
        id: 123,
        name: "Malai Kopta",
        price: 220,
        category: "Paneer Special",
        veg: true,
        rating: 4.9,
        description: "Soft koftas in a rich creamy gravy.",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80",
        qty: 1,
      },
    ],
    total: 420,
    date: new Date().toISOString(),
    status: 1,
    address: "45 Lake View Road, Udaipur, Rajasthan",
    payment: "Online Payment",
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => load("manas_user", defaultUser));
  const [menuItems, setMenuItems] = useState<FoodItem[]>(() =>
    load("manas_menu_items", defaultMenu)
  );
  const [cart, setCart] = useState<CartItem[]>(() => load("manas_cart", []));
  const [favorites, setFavorites] = useState<number[]>(() =>
    load("manas_fav", [])
  );
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    load("manas_dark", false)
  );
  const [orders, setOrders] = useState<Order[]>(() => {
    const loaded = load<Order[]>("manas_orders", seedOrders);
    // Auto-repair cached orders if they contain empty items from previous storage
    return loaded.map((ord) => {
      if (!ord.items || ord.items.length === 0) {
        const matchSeed = seedOrders.find((s) => s.id === ord.id);
        if (matchSeed && matchSeed.items.length > 0) {
          return { ...ord, items: matchSeed.items };
        }
      }
      return ord;
    });
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeOTP, setActiveOTP] = useState<{ phone: string; otp: string; expiresAt: number } | null>(null);

  useEffect(() => {
    localStorage.setItem("manas_user", JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    localStorage.setItem("manas_menu_items", JSON.stringify(menuItems));
  }, [menuItems]);
  useEffect(() => {
    localStorage.setItem("manas_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("manas_fav", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem("manas_orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem("manas_dark", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const notify = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const names: Record<UserRole, string> = {
      CUSTOMER: "Guest Customer",
      KITCHEN: "Chef Rajesh (Kitchen)",
      ADMIN: "Restaurant Manager (Admin)",
    };
    setUser({
      id: `usr-${role.toLowerCase()}`,
      name: names[role],
      email: `${role.toLowerCase()}@manasrestaurant.in`,
      role,
    });
    notify(`Switched role to ${role}`, "info");
  }, [notify]);

  const addMenuItem = useCallback(
    (item: Omit<FoodItem, "id">) => {
      const newItem: FoodItem = {
        ...item,
        id: Date.now(),
      };
      setMenuItems((prev) => [newItem, ...prev]);
      notify(`Added "${newItem.name}" to menu`);
    },
    [notify]
  );

  const updateMenuItem = useCallback(
    (id: number, updated: Partial<FoodItem>) => {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      notify("Menu item updated");
    },
    [notify]
  );

  const deleteMenuItem = useCallback(
    (id: number) => {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      notify("Item removed from menu", "info");
    },
    [notify]
  );

  const sendOTP = useCallback(
    (rawPhone: string) => {
      const cleanPhone = sanitizePhone(rawPhone);
      if (cleanPhone.length !== 10) {
        notify("Please enter a valid 10-digit mobile number", "error");
        return { success: false, error: "Invalid phone number" };
      }

      const generated = generateSecureOTP();
      const expiresAt = Date.now() + 60000; // 60s validity

      setActiveOTP({ phone: cleanPhone, otp: generated, expiresAt });
      notify(`📱 TEST OTP sent to +91 ${cleanPhone}: [ ${generated} ]`, "info");
      return { success: true, testOTP: generated };
    },
    [notify]
  );

  const verifyOTP = useCallback(
    (rawPhone: string, otpInput: string, nameInput?: string) => {
      const cleanPhone = sanitizePhone(rawPhone);
      if (!validateOTPFormat(otpInput)) {
        notify("OTP must be 4 digits", "error");
        return false;
      }

      if (!activeOTP || activeOTP.phone !== cleanPhone) {
        notify("No OTP request found for this number", "error");
        return false;
      }

      if (Date.now() > activeOTP.expiresAt) {
        notify("OTP has expired. Please request a new OTP", "error");
        return false;
      }

      if (activeOTP.otp !== otpInput.trim()) {
        notify("Incorrect OTP. Please try again", "error");
        return false;
      }

      // OTP Verified Successfully!
      const cleanName = sanitizeInput(nameInput || "", 80) || `User ${cleanPhone.slice(-4)}`;
      setUser({
        id: `usr-phone-${cleanPhone}`,
        name: cleanName,
        email: `${cleanPhone}@manas.in`,
        phone: cleanPhone,
        role: "CUSTOMER",
        isLoggedIn: true,
      });

      setActiveOTP(null);
      setLoginModalOpen(false);
      notify(`🎉 Welcome back, ${cleanName}! Logged in successfully.`);
      return true;
    },
    [activeOTP, notify]
  );

  const logout = useCallback(() => {
    setUser({
      id: "usr-guest",
      name: "Guest Customer",
      email: "guest@manasrestaurant.in",
      role: "CUSTOMER",
      isLoggedIn: false,
    });
    notify("Logged out successfully", "info");
  }, [notify]);

  const updateOrderStatus = useCallback(
    (orderId: string, status: number) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      const labels = ["Received", "Preparing", "Out for Delivery", "Delivered"];
      notify(`Order ${orderId} updated to: ${labels[status]}`);
    },
    [notify]
  );

  const addToCart = useCallback(
    (item: FoodItem, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((c) => c.id === item.id);
        if (existing) {
          return prev.map((c) =>
            c.id === item.id ? { ...c, qty: c.qty + qty } : c
          );
        }
        return [...prev, { ...item, qty }];
      });
      notify(`${item.name} added to cart`);
    },
    [notify]
  );

  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const increaseQty = useCallback((id: number) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
    );
  }, []);

  const decreaseQty = useCallback((id: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        const has = prev.includes(id);
        notify(has ? "Removed from favorites" : "Added to favorites", "info");
        return has ? prev.filter((f) => f !== id) : [...prev, id];
      });
    },
    [notify]
  );

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  const placeOrder = useCallback(
    (order: Omit<Order, "id" | "date" | "status">) => {
      const newOrder: Order = {
        ...order,
        id: "MNS-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString(),
        status: 0,
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    []
  );

  const repeatOrder = useCallback(
    (order: Order) => {
      if (order.items.length === 0) {
        notify("No items to repeat for this order", "error");
        return;
      }
      setCart((prev) => {
        const merged = [...prev];
        order.items.forEach((it) => {
          const ex = merged.find((m) => m.id === it.id);
          if (ex) ex.qty += it.qty;
          else merged.push({ ...it });
        });
        return merged;
      });
      notify("Items added to cart from previous order");
    },
    [notify]
  );

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartSubtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        switchRole,
        loginModalOpen,
        setLoginModalOpen,
        sendOTP,
        verifyOTP,
        logout,
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        cartCount,
        cartSubtotal,
        favorites,
        toggleFavorite,
        darkMode,
        toggleDarkMode,
        toasts,
        notify,
        orders,
        placeOrder,
        repeatOrder,
        updateOrderStatus,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
