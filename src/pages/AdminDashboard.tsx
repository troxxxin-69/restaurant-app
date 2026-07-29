import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  ShoppingBag,
  Utensils,
  UserCheck,
  X,
  Check,
  Search,
} from "lucide-react";
import { useApp, type UserRole } from "../context/AppContext";
import { categories, type FoodItem } from "../data/menu";
import VegBadge from "../components/VegBadge";

export default function AdminDashboard() {
  const {
    user,
    switchRole,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    orders,
    updateOrderStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "rbac">("menu");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    name: "",
    price: 150,
    category: "Paneer Special",
    veg: true,
    rating: 4.8,
    description: "",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter((o) => o.status < 3).length;

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.description.trim()) return;
    addMenuItem(newItem);
    setShowAddModal(false);
    setNewItem({
      name: "",
      price: 150,
      category: "Paneer Special",
      veg: true,
      rating: 4.8,
      description: "",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&h=600&q=80",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMenuItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: "CUSTOMER", label: "Customer", desc: "Customer ordering experience & favorites" },
    { role: "KITCHEN", label: "Kitchen Staff", desc: "Access to KDS Live Cooking Board" },
    { role: "ADMIN", label: "Restaurant Owner", desc: "Full administrative & menu editing control" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header & Role Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-extrabold text-brand">
            <ShieldCheck size={14} /> ADMIN CONTROL CENTER
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-ink dark:text-white">
            Restaurant Management Panel
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Log in as <span className="font-bold text-ink dark:text-white">{user.name}</span> ({user.email})
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          {[
            { id: "menu", label: "Menu Manager" },
            { id: "orders", label: `Orders (${orders.length})` },
            { id: "rbac", label: "RBAC Roles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "menu" | "orders" | "rbac")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "text-neutral-500 hover:text-ink dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Sales", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Active Orders", value: activeOrders, icon: ShoppingBag, color: "text-amber-500 bg-amber-500/10" },
          { label: "Total Dishes", value: menuItems.length, icon: Utensils, color: "text-brand bg-brand/10" },
          { label: "Active Role", value: user.role, icon: UserCheck, color: "text-indigo-500 bg-indigo-500/10" },
        ].map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-4 rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${m.color}`}>
              <m.icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-ink dark:text-white">{m.value}</p>
              <p className="text-xs text-neutral-400 font-medium">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TAB 1: MENU MANAGER */}
      {activeTab === "menu" && (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes to edit..."
                className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark"
            >
              <Plus size={18} /> Add New Dish
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase text-neutral-400 dark:bg-neutral-800/50">
                  <tr>
                    <th className="px-6 py-4">Dish Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredMenuItems.map((item) => (
                    <tr key={item.id} className="transition hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="h-10 w-10 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-ink dark:text-white">{item.name}</p>
                            <p className="line-clamp-1 text-xs text-neutral-400 max-w-xs">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-neutral-600 dark:text-neutral-300">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-brand">
                        ₹{item.price}
                      </td>
                      <td className="px-6 py-4">
                        <VegBadge veg={item.veg} />
                      </td>
                      <td className="px-6 py-4 font-bold text-amber-500">
                        ★ {item.rating}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-brand/10 hover:text-brand"
                            title="Edit Item"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 transition hover:bg-red-50 hover:text-red-500"
                            title="Delete Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGER */}
      {activeTab === "orders" && (
        <div className="mt-10 space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-ink dark:text-white">{ord.id}</span>
                  <span className="text-xs text-neutral-400">({new Date(ord.date).toLocaleTimeString()})</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">📍 {ord.address}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ord.items.map((it) => (
                    <span key={it.id} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold dark:bg-neutral-800">
                      {it.name} x{it.qty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-extrabold text-brand">₹{ord.total}</span>
                <select
                  value={ord.status}
                  onChange={(e) => updateOrderStatus(ord.id, Number(e.target.value))}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value={0}>0: Received 📥</option>
                  <option value={1}>1: Preparing 🍳</option>
                  <option value={2}>2: Out for Delivery 🚚</option>
                  <option value={3}>3: Delivered ✅</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RBAC ROLE SWITCHER */}
      {activeTab === "rbac" && (
        <div className="mt-10 rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <h3 className="text-xl font-bold text-ink dark:text-white">
            Role-Based Access Control (RBAC) Switcher
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Switch role dynamically to simulate and test app permissions as a Customer, Kitchen Staff, or Admin.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {roles.map((r) => (
              <div
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition ${
                  user.role === r.role
                    ? "border-brand bg-brand/5 shadow-md"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-ink dark:text-white">{r.label}</span>
                  {user.role === r.role && <Check size={18} className="text-brand" />}
                </div>
                <p className="mt-2 text-xs text-neutral-400">{r.desc}</p>
                <span className="mt-4 inline-block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                  Role: {r.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-ink dark:text-white">Add New Food Item</h3>
                <button onClick={() => setShowAddModal(false)} className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Dish Name</label>
                  <input
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Paneer Tikka Masala"
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Short appetizing description..."
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Image URL</label>
                  <input
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="veg-toggle"
                    checked={newItem.veg}
                    onChange={(e) => setNewItem({ ...newItem, veg: e.target.checked })}
                    className="h-4 w-4 rounded accent-brand"
                  />
                  <label htmlFor="veg-toggle" className="text-xs font-bold text-ink dark:text-white">Pure Vegetarian Dish</label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
                >
                  Save Dish to Menu
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT ITEM MODAL */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-ink dark:text-white">Edit Dish: {editingItem.name}</h3>
                <button onClick={() => setEditingItem(null)} className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Dish Name</label>
                  <input
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Category</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-brand py-3 font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
                >
                  Update Dish Details
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
