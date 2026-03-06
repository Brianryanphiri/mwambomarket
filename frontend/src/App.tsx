import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/components/store/CartProvider";
import { AdminAuthProvider } from '@/contexts/admin/AdminAuthContext';
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProductsPage from "./pages/ProductsPage";
import NotFound from "./pages/NotFound";
import DealsPage from "./pages/DealsPage";
import NewArrivals from "./pages/NewArrivals";
import BestSellers from "./pages/BestSellers";
import TrendingPage from "./pages/TrendingPage";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RefundPolicy from "./pages/RefundPolicy";
import DeliveryPolicy from "./pages/DeliveryPolicy";
import FamilyPackages from "./pages/FamilyPackages";
import DailyFresh from "./pages/DailyFresh";
import Subscriptions from "./pages/Subscriptions";
import OfficePacks from "./pages/OfficePacks";
import StudentPacks from "./pages/StudentPacks";
import ExpressDelivery from "./pages/ExpressDelivery";
import Wishlist from "./pages/Wishlist";
import AdminRoutes from './routes/AdminRoutes';
import FamilyPackageDetails from "./pages/FamilyPackageDetails";
import DailyFreshDetailPage from "./pages/DailyFreshDetailPage";
import ManageSubscription from "./pages/ManageSubscription";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/best-sellers" element={<BestSellers />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/delivery-policy" element={<DeliveryPolicy />} />
              <Route path="/family-packages" element={<FamilyPackages />} />
              <Route path="/daily-fresh" element={<DailyFresh />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/office-packs" element={<OfficePacks />} />
              <Route path="/student-packs" element={<StudentPacks />} />
              <Route path="/express-delivery" element={<ExpressDelivery />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/family-packages/:id" element={<FamilyPackageDetails />} />
              <Route path="/daily-fresh/:id" element={<DailyFreshDetailPage />} />
              <Route path="/manage-subscription" element={<ManageSubscription />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;