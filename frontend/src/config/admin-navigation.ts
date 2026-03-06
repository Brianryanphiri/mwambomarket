import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChartNoAxesCombined,
  Settings,
  Grid,
  Award,
  Truck,
  Database,
  Tag,
  Gift,
  TrendingUp,
  Mail,
  FileText,
  Image,
  HelpCircle,
  CreditCard,
  Percent,
  Shield,
  Sun,
  Calendar,
  Briefcase,
  GraduationCap,
  Zap,
  Star,
  type LucideIcon
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission: string;
  badge?: string;
}

export interface NavGroup {
  name: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
      { name: 'Analytics', href: '/admin/analytics', icon: ChartNoAxesCombined, permission: 'view_analytics' },
    ]
  },
  {
    name: 'Commerce',
    items: [
      { name: 'Products', href: '/admin/products', icon: Package, permission: 'manage_products', badge: '234' },
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, permission: 'view_orders', badge: '12' },
      { name: 'Customers', href: '/admin/customers', icon: Users, permission: 'view_customers', badge: '892' },
      { name: 'Reviews', href: '/admin/reviews', icon: Star, permission: 'manage_reviews', badge: '45' },
    ]
  },
  {
    name: 'Services',
    items: [
      { name: 'All Services', href: '/admin/services', icon: LayoutDashboard, permission: 'manage_services', badge: '6' },
      { name: 'Family Packages', href: '/admin/services/family', icon: Users, permission: 'manage_services' },
      { name: 'Daily Fresh', href: '/admin/services/daily-fresh', icon: Sun, permission: 'manage_services' },
      { name: 'Subscriptions', href: '/admin/services/subscriptions', icon: Calendar, permission: 'manage_services' },
      { name: 'Office Packs', href: '/admin/services/office', icon: Briefcase, permission: 'manage_services' },
      { name: 'Student Packs', href: '/admin/services/student', icon: GraduationCap, permission: 'manage_services' },
      { name: 'Express Delivery', href: '/admin/services/express', icon: Zap, permission: 'manage_services' },
    ]
  },
  {
    name: 'Inventory',
    items: [
      { name: 'Categories', href: '/admin/categories', icon: Grid, permission: 'manage_categories' },
      { name: 'Brands', href: '/admin/brands', icon: Award, permission: 'manage_brands' },
      { name: 'Suppliers', href: '/admin/suppliers', icon: Truck, permission: 'manage_suppliers' },
      { name: 'Warehouse', href: '/admin/warehouse', icon: Database, permission: 'manage_inventory' },
    ]
  },
  {
    name: 'Marketing',
    items: [
      { name: 'Discounts', href: '/admin/discounts', icon: Tag, permission: 'manage_discounts' },
      { name: 'Promotions', href: '/admin/promotions', icon: Gift, permission: 'manage_promotions' },
      { name: 'Campaigns', href: '/admin/campaigns', icon: TrendingUp, permission: 'manage_campaigns' },
      { name: 'Newsletter', href: '/admin/newsletter', icon: Mail, permission: 'manage_newsletter' },
    ]
  },
  {
    name: 'Content',
    items: [
      { name: 'Pages', href: '/admin/pages', icon: FileText, permission: 'manage_pages' },
      { name: 'Blog', href: '/admin/blog', icon: FileText, permission: 'manage_blog' },
      { name: 'Media', href: '/admin/media', icon: Image, permission: 'manage_media' },
      { name: 'FAQ', href: '/admin/faq', icon: HelpCircle, permission: 'manage_faq' },
    ]
  },
  {
    name: 'Settings',
    items: [
      { name: 'General', href: '/admin/settings', icon: Settings, permission: 'manage_settings' },
      { name: 'Payment', href: '/admin/payment', icon: CreditCard, permission: 'manage_payment' },
      { name: 'Shipping', href: '/admin/shipping', icon: Truck, permission: 'manage_shipping' },
      { name: 'Taxes', href: '/admin/taxes', icon: Percent, permission: 'manage_taxes' },
      { name: 'Users', href: '/admin/users', icon: Users, permission: 'manage_users' },
      { name: 'Permissions', href: '/admin/permissions', icon: Shield, permission: 'manage_permissions' },
    ]
  }
];