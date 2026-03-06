import { 
  ShoppingCart, MapPin, Phone, Mail, Facebook, Instagram, Twitter,
  Heart, Truck, Clock, Shield, Award, Sparkles, Tag, 
  ChevronRight, CreditCard, Package, Users, Sun, Calendar,
  Leaf, Beef, Egg, Home, Apple, Coffee, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import payment method images
import visaImg from '@/assets/footer/visa.png';
import mastercardImg from '@/assets/footer/credit-card.png';
import airtelImg from '@/assets/footer/airtel.png';
import tnmImg from '@/assets/footer/TNM.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Fresh Produce', icon: Leaf, slug: 'fresh-produce' },
    { name: 'Meat & Chicken', icon: Beef, slug: 'meat-chicken' },
    { name: 'Dairy & Eggs', icon: Egg, slug: 'dairy-eggs' },
    { name: 'Pantry Essentials', icon: Package, slug: 'pantry-essentials' },
    { name: 'Household', icon: Home, slug: 'household-items' },
    { name: 'Family Packages', icon: Users, slug: 'family-packages' },
    { name: 'Daily Fresh', icon: Sun, slug: 'daily-fresh' },
    { name: 'Subscriptions', icon: Calendar, slug: 'subscriptions' }
  ];

  const collections = [
    { name: 'Best Sellers', icon: Award, slug: 'best-sellers', color: 'text-amber-400' },
    { name: 'New Arrivals', icon: Sparkles, slug: 'new-arrivals', color: 'text-purple-400' },
    { name: 'Hot Deals', icon: Tag, slug: 'deals', color: 'text-red-400' },
    { name: 'Trending', icon: Heart, slug: 'trending', color: 'text-pink-400' }
  ];

  const policies = [
    { name: 'Terms & Conditions', slug: 'terms' },
    { name: 'Privacy Policy', slug: 'privacy' },
    { name: 'Refund Policy', slug: 'refund-policy' },
    { name: 'Delivery Policy', slug: 'delivery-policy' },
    { name: 'FAQ', slug: 'faq' },
    { name: 'Contact Us', slug: 'contact' }
  ];

  const services = [
    'Family Packages',
    'Daily Fresh',
    'Subscriptions',
    'Office Packs',
    'Student Packs',
    'Express Delivery'
  ];

  return (
    <footer className="bg-foreground text-primary-foreground relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-14 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-12 h-12 rounded-xl store-gradient flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold leading-tight">Mwambo</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-60 font-semibold -mt-0.5">Store</p>
              </div>
            </Link>
            
            <p className="text-sm opacity-70 leading-relaxed mb-4">
              The easy way to run your home. Fresh groceries, family packages, and daily essentials delivered to your door in Lilongwe and Blantyre.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-full px-3 py-1">
                <Truck className="w-3 h-3" />
                <span className="text-xs">Free delivery</span>
              </div>
              <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-full px-3 py-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">Same-day</span>
              </div>
              <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-full px-3 py-1">
                <Shield className="w-3 h-3" />
                <span className="text-xs">Secure</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="mailto:hello@mwambo.store" 
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-all hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Collections
            </h4>
            <ul className="space-y-2">
              {collections.map(collection => {
                const Icon = collection.icon;
                return (
                  <li key={collection.slug}>
                    <Link
                      to={`/${collection.slug}`}
                      className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all group"
                    >
                      <Icon className={`w-3 h-3 ${collection.color}`} />
                      {collection.name}
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <Link
                  to="/products"
                  className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground flex items-center gap-1"
                >
                  All Products <ChevronRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4" />
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map(cat => {
                const Icon = cat.icon;
                return (
                  <li key={cat.slug}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all group"
                    >
                      <Icon className="w-3 h-3" />
                      {cat.name}
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Services
            </h4>
            <ul className="space-y-2">
              {services.map(service => (
                <li key={service}>
                  <Link
                    to={`/${service.toLowerCase().replace(/ /g, '-')}`}
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all group"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary-foreground/50" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Policies
            </h4>
            <ul className="space-y-2 mb-4">
              {policies.map(policy => (
                <li key={policy.slug}>
                  <Link
                    to={`/${policy.slug}`}
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 hover:translate-x-1 transition-all group"
                  >
                    <HelpCircle className="w-3 h-3" />
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+265999123456" className="hover:underline">+265 999 123 456</a>
              </li>
              <li className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:hello@mwambo.store" className="hover:underline">hello@mwambo.store</a>
              </li>
              <li className="flex items-start gap-2 hover:opacity-100 transition-opacity">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Area 47, Lilongwe, Malawi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-primary-foreground/10 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold">Subscribe to our newsletter</h5>
                <p className="text-xs opacity-60">Get updates on new products and special offers</p>
              </div>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-l-lg bg-primary-foreground/10 border border-primary-foreground/20 text-sm focus:outline-none focus:border-primary-foreground/40"
              />
              <button className="px-4 py-2 bg-primary-foreground/20 rounded-r-lg hover:bg-primary-foreground/30 transition-colors text-sm font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-50">
          <div>
            © {currentYear} Mwambo Store. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
            <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
            <Link to="/refund-policy" className="hover:opacity-100 transition-opacity">Refunds</Link>
            <Link to="/delivery-policy" className="hover:opacity-100 transition-opacity">Delivery</Link>
            <Link to="/faq" className="hover:opacity-100 transition-opacity">FAQ</Link>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={visaImg} 
              alt="Visa" 
              className="h-6 w-auto opacity-50 hover:opacity-100 transition-opacity" 
            />
            <img 
              src={mastercardImg} 
              alt="Mastercard" 
              className="h-6 w-auto opacity-50 hover:opacity-100 transition-opacity" 
            />
            <img 
              src={airtelImg} 
              alt="Airtel Money" 
              className="h-6 w-auto opacity-50 hover:opacity-100 transition-opacity" 
            />
            <img 
              src={tnmImg} 
              alt="TNM Mpamba" 
              className="h-6 w-auto opacity-50 hover:opacity-100 transition-opacity" 
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;