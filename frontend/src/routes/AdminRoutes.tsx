import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminRegister from '@/pages/admin/AdminRegister';
import Unauthorized from '@/pages/admin/Unauthorized';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Lazy load components
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));
const ProductList = lazy(() => import('@/pages/admin/Products/ProductList'));
const ProductForm = lazy(() => import('@/pages/admin/Products/ProductForm'));
const OrderList = lazy(() => import('@/pages/admin/Orders/OrderList'));
const OrderDetails = lazy(() => import('@/pages/admin/Orders/OrderDetails'));
const CustomerList = lazy(() => import('@/pages/admin/Customers/CustomerList'));
const CustomerDetails = lazy(() => import('@/pages/admin/Customers/CustomerDetails'));
const InventoryList = lazy(() => import('@/pages/admin/Inventory/InventoryList'));

// Categories
const CategoryList = lazy(() => import('@/pages/admin/Categories/CategoryList'));
const CategoryForm = lazy(() => import('@/pages/admin/Categories/CategoryForm'));

// Reports
const Reports = lazy(() => import('@/pages/admin/Reports'));

// Service components
const ServiceList = lazy(() => import('@/pages/admin/services/ServiceList'));
const FamilyPackages = lazy(() => import('@/pages/admin/services/FamilyPackages'));
const DailyFresh = lazy(() => import('@/pages/admin/services/DailyFresh'));
const Subscriptions = lazy(() => import('@/pages/admin/services/Subscriptions'));
const OfficePacks = lazy(() => import('@/pages/admin/services/OfficePacks'));
const StudentPacks = lazy(() => import('@/pages/admin/services/StudentPacks'));
const ExpressDelivery = lazy(() => import('@/pages/admin/services/ExpressDelivery'));

// ============= NEW SUBSCRIPTION MANAGEMENT COMPONENTS =============
const ActiveSubscribers = lazy(() => import('@/pages/admin/subscriptions/ActiveSubscribers'));
const SubscriptionDeliveries = lazy(() => import('@/pages/admin/subscriptions/SubscriptionDeliveries'));
const SubscriptionOrders = lazy(() => import('@/pages/admin/subscriptions/SubscriptionOrders'));
const SubscriptionInvoices = lazy(() => import('@/pages/admin/subscriptions/SubscriptionInvoices'));
const SubscriptionStats = lazy(() => import('@/pages/admin/subscriptions/SubscriptionStats'));
const SubscriberDetails = lazy(() => import('@/pages/admin/subscriptions/SubscriberDetails'));
const DeliverySchedule = lazy(() => import('@/pages/admin/subscriptions/DeliverySchedule'));
const PendingCalls = lazy(() => import('@/pages/admin/subscriptions/PendingCalls'));
const SubscriptionReminders = lazy(() => import('@/pages/admin/subscriptions/SubscriptionReminders'));
// ================================================================

// Marketing components
const Discounts = lazy(() => import('@/pages/admin/marketing/Discounts'));
const Promotions = lazy(() => import('@/pages/admin/marketing/Promotions'));
const Newsletter = lazy(() => import('@/pages/admin/marketing/Newsletter'));

// Inventory components
const Categories = lazy(() => import('@/pages/admin/Inventory/Categories'));
const Brands = lazy(() => import('@/pages/admin/Inventory/Brands'));
const Suppliers = lazy(() => import('@/pages/admin/Inventory/Suppliers'));
const Warehouse = lazy(() => import('@/pages/admin/Inventory/Warehouse'));

// Content components
const Pages = lazy(() => import('@/pages/admin/content/Pages'));
const Blog = lazy(() => import('@/pages/admin/content/Blog'));
const Media = lazy(() => import('@/pages/admin/content/Media'));
const FAQ = lazy(() => import('@/pages/admin/content/FAQ'));

// Settings components
const Settings = lazy(() => import('@/pages/admin/settings/Settings'));
const PaymentSettings = lazy(() => import('@/pages/admin/settings/PaymentSettings'));
const ShippingSettings = lazy(() => import('@/pages/admin/settings/ShippingSettings'));
const TaxSettings = lazy(() => import('@/pages/admin/settings/TaxSettings'));
const UserManagement = lazy(() => import('@/pages/admin/settings/UserManagement'));
const Permissions = lazy(() => import('@/pages/admin/settings/Permissions'));

const LoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const AdminRoutes = () => {
  useAdminAuth();

  return (
    <Routes>
      {/* Public admin routes - accessible without authentication */}
      <Route path="login" element={<AdminLogin />} />
      <Route path="register" element={<AdminRegister />} />
      
      {/* Protected admin routes - require authentication */}
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* ============= DASHBOARD ============= */}
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        
        {/* ============= ANALYTICS ============= */}
        <Route path="analytics" element={
          <Suspense fallback={<LoadingFallback />}>
            <Analytics />
          </Suspense>
        } />
        
        {/* ============= REPORTS ============= */}
        <Route path="reports" element={
          <Suspense fallback={<LoadingFallback />}>
            <Reports />
          </Suspense>
        } />
        
        {/* ============= PRODUCTS MANAGEMENT ============= */}
        <Route path="products">
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <ProductList />
            </Suspense>
          } />
          <Route path="new" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProductForm />
            </Suspense>
          } />
          <Route path=":id" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProductForm />
            </Suspense>
          } />
          <Route path=":id/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProductForm />
            </Suspense>
          } />
        </Route>

        {/* ============= CATEGORIES MANAGEMENT ============= */}
        <Route path="categories">
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <CategoryList />
            </Suspense>
          } />
          <Route path="new" element={
            <Suspense fallback={<LoadingFallback />}>
              <CategoryForm />
            </Suspense>
          } />
          <Route path=":id/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <CategoryForm />
            </Suspense>
          } />
        </Route>
        
        {/* ============= ORDERS MANAGEMENT ============= */}
        <Route path="orders">
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <OrderList />
            </Suspense>
          } />
          <Route path=":id" element={
            <Suspense fallback={<LoadingFallback />}>
              <OrderDetails />
            </Suspense>
          } />
          {/* Subscription Orders */}
          <Route path="subscriptions" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionOrders />
            </Suspense>
          } />
        </Route>
        
        {/* ============= CUSTOMERS MANAGEMENT ============= */}
        <Route path="customers">
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerList />
            </Suspense>
          } />
          <Route path=":email" element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerDetails />
            </Suspense>
          } />
        </Route>

        {/* ============= SERVICES MANAGEMENT ============= */}
        <Route path="services">
          {/* All Services Overview */}
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <ServiceList />
            </Suspense>
          } />

          {/* Family Packages */}
          <Route path="family">
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <FamilyPackages />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <FamilyPackages />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <FamilyPackages />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <FamilyPackages />
              </Suspense>
            } />
          </Route>

          {/* Daily Fresh */}
          <Route path="daily-fresh">
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <DailyFresh />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <DailyFresh />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <DailyFresh />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <DailyFresh />
              </Suspense>
            } />
          </Route>

          {/* Subscriptions - Plan Management */}
          <Route path="subscriptions">
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Subscriptions />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <Subscriptions />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <Subscriptions />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <Subscriptions />
              </Suspense>
            } />
          </Route>

          {/* Office Packs */}
          <Route path="office">
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <OfficePacks />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <OfficePacks />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <OfficePacks />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <OfficePacks />
              </Suspense>
            } />
          </Route>

          {/* Student Packs */}
          <Route path="student">
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <StudentPacks />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <StudentPacks />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <StudentPacks />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <StudentPacks />
              </Suspense>
            } />
          </Route>

          {/* Express Delivery */}
          <Route path="express">
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <ExpressDelivery />
              </Suspense>
            } />
            <Route path="new" element={
              <Suspense fallback={<LoadingFallback />}>
                <ExpressDelivery />
              </Suspense>
            } />
            <Route path=":id" element={
              <Suspense fallback={<LoadingFallback />}>
                <ExpressDelivery />
              </Suspense>
            } />
            <Route path=":id/edit" element={
              <Suspense fallback={<LoadingFallback />}>
                <ExpressDelivery />
              </Suspense>
            } />
          </Route>
        </Route>

        {/* ============= SUBSCRIPTION MANAGEMENT ============= */}
        <Route path="subscriptions">
          {/* Dashboard / Overview */}
          <Route index element={<Navigate to="subscribers" replace />} />
          
          {/* Active Subscribers */}
          <Route path="subscribers" element={
            <Suspense fallback={<LoadingFallback />}>
              <ActiveSubscribers />
            </Suspense>
          } />
          
          {/* Subscriber Details */}
          <Route path="subscribers/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriberDetails />
            </Suspense>
          } />
          
          {/* Delivery Schedule */}
          <Route path="deliveries" element={
            <Suspense fallback={<LoadingFallback />}>
              <DeliverySchedule />
            </Suspense>
          } />
          
          {/* Pending Calls */}
          <Route path="calls" element={
            <Suspense fallback={<LoadingFallback />}>
              <PendingCalls />
            </Suspense>
          } />
          
          {/* Subscription Orders */}
          <Route path="orders" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionOrders />
            </Suspense>
          } />
          
          {/* Subscription Invoices */}
          <Route path="invoices" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionInvoices />
            </Suspense>
          } />
          
          {/* Subscription Reminders */}
          <Route path="reminders" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionReminders />
            </Suspense>
          } />
          
          {/* Subscription Statistics */}
          <Route path="stats" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionStats />
            </Suspense>
          } />
        </Route>

        {/* ============= MARKETING MANAGEMENT ============= */}
        <Route path="marketing">
          <Route index element={<Navigate to="discounts" replace />} />
          
          <Route path="discounts" element={
            <Suspense fallback={<LoadingFallback />}>
              <Discounts />
            </Suspense>
          } />
          
          <Route path="promotions" element={
            <Suspense fallback={<LoadingFallback />}>
              <Promotions />
            </Suspense>
          } />
          
          <Route path="newsletter" element={
            <Suspense fallback={<LoadingFallback />}>
              <Newsletter />
            </Suspense>
          } />
        </Route>

        {/* ============= INVENTORY MANAGEMENT ============= */}
        <Route path="inventory">
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <InventoryList />
            </Suspense>
          } />
          <Route path="low-stock" element={
            <Suspense fallback={<LoadingFallback />}>
              <InventoryList />
            </Suspense>
          } />
          <Route path="out-of-stock" element={
            <Suspense fallback={<LoadingFallback />}>
              <InventoryList />
            </Suspense>
          } />
        </Route>

        {/* ============= CONTENT MANAGEMENT ============= */}
        <Route path="content">
          <Route index element={<Navigate to="pages" replace />} />
          
          <Route path="pages" element={
            <Suspense fallback={<LoadingFallback />}>
              <Pages />
            </Suspense>
          } />
          
          <Route path="blog" element={
            <Suspense fallback={<LoadingFallback />}>
              <Blog />
            </Suspense>
          } />
          
          <Route path="media" element={
            <Suspense fallback={<LoadingFallback />}>
              <Media />
            </Suspense>
          } />
          
          <Route path="faq" element={
            <Suspense fallback={<LoadingFallback />}>
              <FAQ />
            </Suspense>
          } />
        </Route>

        {/* ============= SETTINGS MANAGEMENT ============= */}
        <Route path="settings">
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          } />
          
          <Route path="payment" element={
            <Suspense fallback={<LoadingFallback />}>
              <PaymentSettings />
            </Suspense>
          } />
          
          <Route path="shipping" element={
            <Suspense fallback={<LoadingFallback />}>
              <ShippingSettings />
            </Suspense>
          } />
          
          <Route path="taxes" element={
            <Suspense fallback={<LoadingFallback />}>
              <TaxSettings />
            </Suspense>
          } />
          
          <Route path="users" element={
            <Suspense fallback={<LoadingFallback />}>
              <UserManagement />
            </Suspense>
          } />
          
          <Route path="permissions" element={
            <Suspense fallback={<LoadingFallback />}>
              <Permissions />
            </Suspense>
          } />
        </Route>
        
        {/* Catch-all route for 404 - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Unauthorized access */}
      <Route path="unauthorized" element={<Unauthorized />} />
      
      {/* Redirect any unmatched admin routes to login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;