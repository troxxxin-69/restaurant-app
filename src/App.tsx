import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import ToastContainer from "./components/ToastContainer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { GridSkeleton } from "./components/LoadingSkeleton";
import LoginModal from "./components/LoginModal";

const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DeliveryDashboard = lazy(() => import("./pages/DeliveryDashboard"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Login = lazy(() => import("./pages/Login"));

function PageLoader() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center p-6">
      <GridSkeleton count={6} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-[#F8F8F8] dark:bg-neutral-950">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/customer" element={<Navigate to="/menu" replace />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["restaurant_admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/delivery"
                    element={
                      <ProtectedRoute allowedRoles={["delivery_partner"]}>
                        <DeliveryDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>
          <Footer />
          <CartDrawer />
          <LoginModal />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
