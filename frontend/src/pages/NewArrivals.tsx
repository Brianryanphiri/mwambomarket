// src/pages/NewArrivals.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Calendar, Clock, TrendingUp,
  ChevronRight, Gift, Star, Zap,
  Rocket, Bell, Tag, Timer
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products, Product } from '@/data/products';

const NewArrivals = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [thisWeek, setThisWeek] = useState<Product[]>([]);
  const [lastWeek, setLastWeek] = useState<Product[]>([]);
  const [comingSoon, setComingSoon] = useState<Product[]>([]);

  useEffect(() => {
    // Sort by creation date (newest first)
    const sorted = [...products].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Get products marked as new
    const markedNew = products.filter(p => p.isNew);
    setNewProducts(markedNew);

    // Get products from this week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekProducts = products.filter(p => {
      const created = new Date(p.createdAt);
      return created >= oneWeekAgo;
    });
    setThisWeek(thisWeekProducts);

    const lastWeekProducts = products.filter(p => {
      const created = new Date(p.createdAt);
      return created >= twoWeeksAgo && created < oneWeekAgo;
    });
    setLastWeek(lastWeekProducts);

    // Simulate coming soon products (for demo purposes)
    // In real app, you'd have a separate field for this
    const soon = products
      .filter(p => p.isNew && p.stock && p.stock < 5)
      .slice(0, 4)
      .map(p => ({ ...p, comingSoon: true }));
    setComingSoon(soon);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner - Redesigned */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 animate-float">
          <Sparkles className="w-16 h-16 text-white/20" />
        </div>
        <div className="absolute bottom-20 left-20 animate-float-delayed">
          <Rocket className="w-20 h-20 text-white/10" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-medium">Fresh From The Dock</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              New{' '}
              <span className="text-yellow-300">Arrivals</span>
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Discover our latest products, fresh additions, and upcoming releases. Be the first to experience what's new!
            </p>
            
            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{thisWeek.length}</div>
                <div className="text-sm text-white/80">This Week</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{lastWeek.length}</div>
                <div className="text-sm text-white/80">Last Week</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{newProducts.length}</div>
                <div className="text-sm text-white/80">Total New</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 100L60 91.7C120 83.3 240 66.7 360 66.7C480 66.7 600 83.3 720 91.7C840 100 960 100 1080 91.7C1200 83.3 1320 66.7 1380 58.3L1440 50V100H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Coming Soon Section - New */}
        {comingSoon.length > 0 && (
          <section className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Coming Soon</h2>
                <p className="text-sm text-muted-foreground">Get ready for these upcoming releases</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {comingSoon.map(product => (
                <div key={product.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10 rounded-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center w-full px-4">
                    <Badge className="bg-purple-500 text-white border-none mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Pre-order
                    </Badge>
                    <Button size="sm" variant="secondary" className="rounded-full">
                      Notify Me
                    </Button>
                  </div>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* This Week's Arrivals - Redesigned */}
        {thisWeek.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold">This Week's Drop</h2>
                    <p className="text-sm text-muted-foreground">Freshly added in the last 7 days</p>
                  </div>
                </div>
              </div>
              <Link to="/new-arrivals/this-week" className="group hidden sm:flex items-center text-primary hover:text-primary/80 transition-colors">
                View All
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {thisWeek.slice(0, 10).map(product => (
                <div key={product.id} className="relative group">
                  <div className="absolute -top-2 -right-2 z-20">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg px-3 py-1.5">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  </div>
                  {product.stock && product.stock < 10 && (
                    <div className="absolute -top-2 -left-2 z-20">
                      <Badge variant="destructive" className="shadow-lg px-3 py-1.5 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    </div>
                  )}
                  <ProductCard {...product} />
                </div>
              ))}
            </div>

            {/* Mobile view all link */}
            {thisWeek.length > 10 && (
              <div className="flex sm:hidden justify-center mt-4">
                <Link to="/new-arrivals/this-week">
                  <Button variant="outline" size="sm" className="rounded-full">
                    View All This Week
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Last Week's Arrivals - Redesigned */}
        {lastWeek.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Last Week</h2>
                  <p className="text-sm text-muted-foreground">Still fresh and available</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {lastWeek.slice(0, 10).map(product => (
                <div key={product.id} className="relative group">
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-pink-100 text-pink-600 border-none dark:bg-pink-900/30 dark:text-pink-400 shadow-lg px-3 py-1.5">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recent
                    </Badge>
                  </div>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All New Arrivals - Redesigned */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Complete Collection</h2>
                  <p className="text-sm text-muted-foreground">Everything new in our store</p>
                </div>
              </div>
            </div>

            {/* Filter options */}
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                All
              </Badge>
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                Electronics
              </Badge>
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                Fashion
              </Badge>
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                Home
              </Badge>
            </div>
          </div>

          {newProducts.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-6">
                <Gift className="w-14 h-14 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No New Arrivals</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Check back soon for exciting new products and fresh additions!
              </p>
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8">
                  Browse All Products
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {newProducts.map(product => (
                  <div key={product.id} className="relative">
                    {!thisWeek.includes(product) && !lastWeek.includes(product) && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-primary text-white border-none shadow-lg px-3 py-1.5">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      </div>
                    )}
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
              
              {/* Load more button */}
              {newProducts.length > 15 && (
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" className="rounded-full group">
                    Load More
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Newsletter Section - Enhanced */}
        <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-3xl p-8 md:p-12 border border-purple-500/20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Never Miss a New Arrival</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to get notified about new products, exclusive previews, and early access to drops!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                Notify Me
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              We'll never spam you. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="text-center">
          <h2 className="text-2xl font-display font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electronics', 'Fashion', 'Home & Living', 'Beauty'].map(category => (
              <Link 
                key={category}
                to={`/products?category=${category.toLowerCase()}`}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold">{category}</h3>
                <p className="text-sm text-muted-foreground">New arrivals</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default NewArrivals;