// src/pages/DealsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, Clock, TrendingDown, Percent, 
  Calendar, ChevronRight, AlertCircle,
  Flame, Sparkles, Timer, Zap,
  Gift, Star
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products, Product } from '@/data/products';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const DealsPage = () => {
  const [deals, setDeals] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [biggestDiscounts, setBiggestDiscounts] = useState<Product[]>([]);
  const [clearance, setClearance] = useState<Product[]>([]);

  useEffect(() => {
    // Get all products on sale
    const onSale = products.filter(p => p.isOnSale);
    setDeals(onSale);

    // Flash sales (ending soon)
    const flash = onSale.filter(p => {
      if (p.saleEnds) {
        const endDate = new Date(p.saleEnds).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3;
      }
      return false;
    }).slice(0, 8); // Limit to 8 items
    setFlashSales(flash);

    // Biggest discounts (30% off or more)
    const biggest = [...onSale]
      .filter(p => {
        if (p.originalPrice) {
          const discount = ((p.originalPrice - p.price) / p.originalPrice) * 100;
          return discount >= 30;
        }
        return false;
      })
      .sort((a, b) => {
        const discountA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
        const discountB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
        return discountB - discountA;
      })
      .slice(0, 10);
    setBiggestDiscounts(biggest);

    // Clearance items (last chance)
    const clear = [...onSale]
      .filter(p => p.stock && p.stock < 10)
      .slice(0, 6);
    setClearance(clear);
  }, []);

  // Calculate total savings
  const totalSavings = deals.reduce((acc, product) => {
    if (product.originalPrice) {
      return acc + (product.originalPrice - product.price);
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner - Redesigned */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
        
        {/* Floating sale tags */}
        <div className="absolute top-10 right-10 opacity-20">
          <Percent className="w-32 h-32 text-white rotate-12" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-20">
          <Tag className="w-24 h-24 text-white -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Time Offers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Hot{' '}
              <span className="text-yellow-300">Deals</span>
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Grab these amazing discounts before they're gone. Save big on your favorite products!
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold">{deals.length}</div>
                <div className="text-sm text-white/80">Active Deals</div>
              </div>
              {totalSavings > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-3xl font-bold">${totalSavings.toFixed(0)}+</div>
                  <div className="text-sm text-white/80">Total Savings</div>
                </div>
              )}
              {flashSales.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                  <div className="text-3xl font-bold">{flashSales.length}</div>
                  <div className="text-sm text-white/80">Flash Sales</div>
                </div>
              )}
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
        {/* Flash Sales Section - Redesigned */}
        {flashSales.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold">Flash Sales</h2>
                    <p className="text-sm text-muted-foreground">Ending in 3 days or less</p>
                  </div>
                </div>
              </div>
              <Link to="/deals/flash-sales" className="group hidden sm:flex items-center text-primary hover:text-primary/80 transition-colors">
                View All Flash Sales
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {flashSales.map(product => (
                  <CarouselItem key={product.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="relative group">
                      {product.saleEnds && (
                        <div className="absolute top-2 right-2 z-20">
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-lg px-3 py-1.5">
                            <Timer className="w-3 h-3 mr-1" />
                            {Math.ceil((new Date(product.saleEnds).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d left
                          </Badge>
                        </div>
                      )}
                      <ProductCard {...product} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-4" />
              <CarouselNext className="hidden sm:flex -right-4" />
            </Carousel>
            
            {/* Mobile view all link */}
            <div className="flex sm:hidden justify-center mt-4">
              <Link to="/deals/flash-sales">
                <Button variant="outline" size="sm" className="rounded-full">
                  View All Flash Sales
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Biggest Discounts - Redesigned */}
        {biggestDiscounts.length > 0 && (
          <section className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Biggest Discounts</h2>
                <p className="text-sm text-muted-foreground">Save 30% or more on these items</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {biggestDiscounts.map(product => (
                <div key={product.id} className="relative group">
                  {product.originalPrice && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none shadow-lg px-3 py-1.5">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </Badge>
                    </div>
                  )}
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clearance Section - New */}
        {clearance.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Clearance</h2>
                  <p className="text-sm text-muted-foreground">Last chance - low stock</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {clearance.map(product => (
                <div key={product.id} className="relative group">
                  {product.stock && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="destructive" className="shadow-lg px-3 py-1.5">
                        Only {product.stock} left
                      </Badge>
                    </div>
                  )}
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Deals Grid - Redesigned */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">All Deals</h2>
                  <p className="text-sm text-muted-foreground">{deals.length} products on sale</p>
                </div>
              </div>
            </div>
            
            {/* Filter/sort options could go here */}
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                All
              </Badge>
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                Under $25
              </Badge>
              <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-accent">
                50% off+
              </Badge>
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-6">
                <Tag className="w-14 h-14 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No Deals Available</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Check back soon for new offers and exciting discounts!
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
                {deals.map((product, index) => (
                  <div key={product.id} className="relative">
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none shadow-lg px-3 py-1.5">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </Badge>
                      </div>
                    )}
                    {product.stock && product.stock < 5 && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge variant="destructive" className="shadow-lg px-3 py-1.5 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      </div>
                    )}
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
              
              {/* Load more button */}
              {deals.length > 10 && (
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" className="rounded-full group">
                    Load More Deals
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Never Miss a Deal</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter and get notified about the latest deals and exclusive offers!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="rounded-full px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default DealsPage;