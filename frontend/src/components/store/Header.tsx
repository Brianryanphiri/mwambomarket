import { 
  ShoppingCart, Search, User, MapPin, Phone, ChevronDown, Menu, X, 
  Minus, Plus, Trash2, CreditCard, Truck, Clock, Shield, 
  Apple, Beef, Egg, Package, Home, Users, Sun, Calendar,
  ShoppingBag, Tag, Sparkles, Award, Percent, Flame,
  TrendingUp, Gift, Star, Heart
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, removeItem, updateQuantity, isCartOpen, setIsCartOpen } = useCart();

  const categories = [
    { name: 'Fresh Produce', icon: Apple, slug: 'fresh-produce' },
    { name: 'Meat & Chicken', icon: Beef, slug: 'meat-chicken' },
    { name: 'Dairy & Eggs', icon: Egg, slug: 'dairy-eggs' },
    { name: 'Pantry Essentials', icon: Package, slug: 'pantry-essentials' },
    { name: 'Household', icon: Home, slug: 'household-items' },
    { name: 'Family Packages', icon: Users, slug: 'family-packages' },
    { name: 'Daily Fresh', icon: Sun, slug: 'daily-fresh' },
    { name: 'Subscriptions', icon: Calendar, slug: 'subscriptions' }
  ];

  const collections = [
    { name: 'Best Sellers', icon: Award, slug: 'best-sellers', color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'New Arrivals', icon: Sparkles, slug: 'new-arrivals', color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'Hot Deals', icon: Tag, slug: 'deals', color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'Trending', icon: Flame, slug: 'trending', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const deliveryFee = totalPrice >= 50000 ? 0 : 2500;
  const grandTotal = totalPrice + deliveryFee;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="store-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <a href="tel:+265999123456" className="hover:underline">+265 999 123 456</a>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Lilongwe, Malawi
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Free delivery over MK 50,000
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Same-day delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button 
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 rounded-xl store-gradient flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground leading-tight">Mwambo</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold -mt-0.5">Store</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Collections Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-store-green-light rounded-lg transition-colors">
                  <Sparkles className="w-4 h-4" />
                  Collections
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {collections.map(collection => {
                  const Icon = collection.icon;
                  return (
                    <DropdownMenuItem key={collection.slug} asChild>
                      <Link 
                        to={`/${collection.slug}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className={`w-6 h-6 rounded-full ${collection.bg} flex items-center justify-center`}>
                          <Icon className={`w-3 h-3 ${collection.color}`} />
                        </div>
                        {collection.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <Separator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link to="/products" className="flex items-center gap-2 cursor-pointer">
                    <Package className="w-4 h-4" />
                    All Products
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Direct Links */}
            <Link 
              to="/deals" 
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span className="relative">
                Hot Deals
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </span>
            </Link>
            
            <Link 
              to="/best-sellers" 
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Award className="w-4 h-4" />
              Best Sellers
            </Link>
            
            <Link 
              to="/new-arrivals" 
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-purple-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              New
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for groceries, packages, essentials..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link 
              to="/wishlist" 
              className="hidden sm:flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>
            
            <Link 
              to="/account" 
              className="hidden sm:flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium hidden lg:block">Account</span>
            </Link>

            {/* Cart */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <button className="relative flex items-center gap-2 store-gradient text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:opacity-90">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-store-badge text-primary-foreground border-none h-5 min-w-5 flex items-center justify-center text-xs animate-count-up">
                      {totalItems}
                    </Badge>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="font-display text-xl flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Your Cart ({totalItems})
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto py-4 px-6 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="font-medium text-lg">Your cart is empty</p>
                      <p className="text-sm mt-1">Add items to get started</p>
                      <div className="flex flex-col gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCartOpen(false)}
                        >
                          Continue Shopping
                        </Button>
                        <Link to="/deals" onClick={() => setIsCartOpen(false)}>
                          <Button variant="ghost" className="text-primary">
                            <Tag className="w-4 h-4 mr-2" />
                            Check out our deals
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="w-14 h-14 rounded-lg bg-store-green-light flex items-center justify-center text-2xl shrink-0">
                          {item.image || <ShoppingBag className="w-6 h-6 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.unit || '1 item'}</p>
                          <p className="text-sm font-semibold text-primary mt-1">MK {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                {items.length > 0 && (
                  <div className="border-t border-border p-6 space-y-4">
                    {/* Delivery Progress */}
                    {totalPrice < 50000 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Free delivery progress</span>
                          <span className="font-medium text-store-amber">
                            MK {(50000 - totalPrice).toLocaleString()} left
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full store-gradient rounded-full transition-all"
                            style={{ width: `${(totalPrice / 50000) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Subtotal
                        </span>
                        <span className="font-semibold">MK {totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" />
                          Delivery
                        </span>
                        <span className={`font-semibold ${deliveryFee === 0 ? 'text-store-success' : ''}`}>
                          {deliveryFee === 0 ? 'Free' : `MK ${deliveryFee.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>MK {grandTotal.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="rounded-xl h-11"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Continue Shopping
                      </Button>
                      <Button 
                        onClick={handleCheckout}
                        className="store-gradient text-primary-foreground h-11 text-base font-semibold rounded-xl gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Checkout
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Secure
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Fast delivery
                      </span>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="md:hidden mt-3 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groceries..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Category nav */}
      <nav className="hidden lg:block border-t border-border">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 py-1 overflow-x-auto hide-scrollbar">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <li key={cat.name}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-store-green-light rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {/* Collections Section */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Collections</p>
              <div className="grid grid-cols-2 gap-2">
                {collections.map(collection => {
                  const Icon = collection.icon;
                  return (
                    <Link
                      key={collection.slug}
                      to={`/${collection.slug}`}
                      className={`flex items-center gap-2 p-2 rounded-lg ${collection.bg} ${collection.color} hover:opacity-80 transition-opacity`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{collection.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Separator className="my-2" />

            {/* Categories */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-store-green-light rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            <Separator className="my-2" />

            {/* Account Links */}
            <div className="px-4 py-2">
              <Link
                to="/account"
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-store-green-light rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                My Account
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-store-green-light rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                Wishlist
              </Link>
              <Link
                to="/products"
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-store-green-light rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-4 h-4" />
                All Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;