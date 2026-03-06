// src/pages/BestSellers.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, TrendingUp, Star, Crown,
  Medal, Trophy, Sparkles, Flame,
  Target, TrendingUp as TrendingIcon,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products, Product } from '@/data/products';

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);

  useEffect(() => {
    // Get best sellers (marked as best seller or high sold count)
    const best = products
      .filter(p => p.isBestSeller || p.soldCount > 500)
      .sort((a, b) => b.soldCount - a.soldCount);
    setBestSellers(best);

    // Get top rated (rating 5)
    const top = products
      .filter(p => p.rating === 5)
      .sort((a, b) => b.soldCount - a.soldCount);
    setTopRated(top);

    // Get trending (high sales in last 30 days - using soldCount as proxy)
    const trend = [...products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 6); // Reduced to 6 for better layout
    setTrending(trend);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner - Redesigned */}
      <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/20 dark:via-yellow-950/20 dark:to-amber-950/20 border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
        <div className="container mx-auto px-4 py-20 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-6">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Customer Favorites</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Most Popular{' '}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Products
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover what everyone's talking about. These products have earned their spot as customer favorites through quality, value, and satisfaction.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 text-sm rounded-full shadow-lg shadow-amber-500/25">
                <Award className="w-4 h-4 mr-2" />
                {bestSellers.length} Best Sellers
              </Badge>
              <Badge variant="outline" className="px-6 py-3 text-sm rounded-full border-2 border-amber-200 dark:border-amber-800">
                <Star className="w-4 h-4 mr-2 fill-amber-400 text-amber-400" />
                {topRated.length} Top Rated
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Top 3 Podium - Redesigned */}
        {bestSellers.length >= 3 && (
          <section className="relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Champions League</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our top 3 most beloved products that have captured the hearts of our community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
              {/* Second Place */}
              <div className="order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-xl">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-card rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 pt-12 mt-8 shadow-lg">
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-gray-400">#2</span>
                    </div>
                    <ProductCard {...bestSellers[1]} />
                  </div>
                </div>
              </div>

              {/* First Place */}
              <div className="order-1 md:order-2 md:scale-105">
                <div className="relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center shadow-xl animate-pulse">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl border-4 border-amber-400 p-6 pt-14 mt-12 shadow-2xl">
                    <div className="text-center mb-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">#1</span>
                    </div>
                    <ProductCard {...bestSellers[0]} />
                  </div>
                </div>
              </div>

              {/* Third Place */}
              <div className="order-3">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-xl">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-card rounded-2xl border-2 border-amber-600/20 p-6 pt-12 mt-8 shadow-lg">
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-amber-600">#3</span>
                    </div>
                    <ProductCard {...bestSellers[2]} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trending Now - Redesigned */}
        {trending.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold">Trending Now</h2>
                    <p className="text-sm text-muted-foreground">Most popular this week</p>
                  </div>
                </div>
              </div>
              <Link to="/products" className="group hidden sm:flex items-center text-primary hover:text-primary/80 transition-colors">
                View All
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trending.map(product => (
                <div key={product.id} className="relative group">
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none shadow-lg px-3 py-1">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Rated - Redesigned */}
        {topRated.length > 0 && (
          <section className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Top Rated</h2>
                <p className="text-sm text-muted-foreground">Highest rated by customers</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {topRated.slice(0, 10).map(product => (
                <div key={product.id} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-yellow-500/90 text-white border-none">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      5.0
                    </Badge>
                  </div>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
            
            {topRated.length > 10 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="rounded-full">
                  View All Top Rated
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </section>
        )}

        {/* All Best Sellers - Redesigned */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Complete Collection</h2>
                <p className="text-sm text-muted-foreground">All our best-selling products</p>
              </div>
            </div>
          </div>

          {bestSellers.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-6">
                <Target className="w-14 h-14 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">No Best Sellers Yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Be the first to discover and love our products! Check back as our community grows.
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
                {bestSellers.map((product, index) => (
                  <div key={product.id} className="relative">
                    {index < 3 && (
                      <div className="absolute -top-2 -left-2 z-10">
                        <Badge className={`bg-gradient-to-r ${
                          index === 0 ? 'from-amber-500 to-yellow-500' :
                          index === 1 ? 'from-gray-400 to-gray-500' :
                          'from-amber-600 to-amber-700'
                        } text-white border-none shadow-lg px-3 py-1`}>
                          <Trophy className="w-3 h-3 mr-1" />
                          #{index + 1}
                        </Badge>
                      </div>
                    )}
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-12">
                <Link to="/products">
                  <Button variant="outline" size="lg" className="rounded-full group">
                    Discover More Products
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default BestSellers;