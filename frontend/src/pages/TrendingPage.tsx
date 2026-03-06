// src/pages/TrendingPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, TrendingUp, TrendingDown, Eye, Clock,
  ChevronRight, Zap, Target, Rocket, BarChart3,
  Sparkles, Users, Award, Star, ArrowUp,
  Calendar, Hash, Heart, ShoppingBag, Gift,
  AlertCircle, ArrowUpRight, Activity,
  Bell
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { products, Product } from '@/data/products';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TrendingPage = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [mostViewed, setMostViewed] = useState<Product[]>([]);
  const [fastestSelling, setFastestSelling] = useState<Product[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<any[]>([]);
  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month'>('week');
  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  useEffect(() => {
    // Simulate trending products (based on soldCount and rating)
    const trending = [...products]
      .sort((a, b) => {
        const scoreA = (a.soldCount || 0) * (a.rating || 1);
        const scoreB = (b.soldCount || 0) * (b.rating || 1);
        return scoreB - scoreA;
      })
      .slice(0, 12);
    setTrendingProducts(trending);

    // Most viewed (using soldCount as proxy)
    const viewed = [...products]
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 8);
    setMostViewed(viewed);

    // Fastest selling (high soldCount + high rating)
    const fast = [...products]
      .filter(p => p.soldCount > 500)
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 6);
    setFastestSelling(fast);

    // Trending categories with counts
    const categoryCount = products.reduce((acc: any, product) => {
      if (!acc[product.categoryName]) {
        acc[product.categoryName] = {
          name: product.categoryName,
          count: 0,
          growth: Math.floor(Math.random() * 50) + 20,
          products: []
        };
      }
      acc[product.categoryName].count++;
      acc[product.categoryName].products.push(product);
      return acc;
    }, {});

    setTrendingCategories(Object.values(categoryCount).slice(0, 6));

    // Simulate live activities
    const activities = [
      { user: 'Sarah K.', action: 'purchased', item: 'Fresh Tomatoes', time: '2 min ago', avatar: 'S' },
      { user: 'Michael O.', action: 'purchased', item: 'Farm Fresh Eggs', time: '5 min ago', avatar: 'M' },
      { user: 'Jane W.', action: 'added to cart', item: 'Basmati Rice', time: '7 min ago', avatar: 'J' },
      { user: 'David N.', action: 'purchased', item: 'Cooking Oil', time: '12 min ago', avatar: 'D' },
      { user: 'Alice M.', action: 'wishlisted', item: 'Organic Honey', time: '15 min ago', avatar: 'A' },
      { user: 'John D.', action: 'purchased', item: 'Whole Wheat Flour', time: '18 min ago', avatar: 'J' },
    ];
    setLiveActivities(activities);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Redesigned */}
      <div className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-1/4 animate-float">
          <Flame className="w-16 h-16 text-white/20" />
        </div>
        <div className="absolute bottom-20 right-1/4 animate-float-delayed">
          <TrendingUp className="w-20 h-20 text-white/10" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Live indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span className="text-sm font-medium">Live Updates • Real-time Trends</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Trending{' '}
              <span className="text-yellow-300">Now</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Discover what everyone's talking about right now. Updated in real-time based on customer activity.
            </p>

            {/* Time filter tabs - Enhanced */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {(['today', 'week', 'month'] as const).map((frame) => (
                <button
                  key={frame}
                  onClick={() => setTimeFrame(frame)}
                  className={`px-8 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                    timeFrame === frame
                      ? 'bg-white text-orange-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20'
                  }`}
                >
                  {frame.charAt(0).toUpperCase() + frame.slice(1)}
                </button>
              ))}
            </div>

            {/* Stats Cards - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Eye className="w-8 h-8 text-white mb-3" />
                <p className="text-3xl font-bold">2.5k+</p>
                <p className="text-sm text-white/80">Daily Views</p>
                <Badge className="mt-2 bg-green-500 text-white border-none">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +23%
                </Badge>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Flame className="w-8 h-8 text-white mb-3" />
                <p className="text-3xl font-bold">156</p>
                <p className="text-sm text-white/80">Trending Items</p>
                <Badge className="mt-2 bg-green-500 text-white border-none">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Users className="w-8 h-8 text-white mb-3" />
                <p className="text-3xl font-bold">892</p>
                <p className="text-sm text-white/80">Active Buyers</p>
                <Badge className="mt-2 bg-green-500 text-white border-none">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +45%
                </Badge>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <ShoppingBag className="w-8 h-8 text-white mb-3" />
                <p className="text-3xl font-bold">48</p>
                <p className="text-sm text-white/80">Orders/hr</p>
                <Badge className="mt-2 bg-green-500 text-white border-none">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  +8%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 100 1380 95L1440 90V120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Tabs Section - Redesigned */}
        <section className="relative">
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3 mb-10 p-1 bg-muted/50">
              <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                <Flame className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="most-viewed" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <Eye className="w-4 h-4" />
                Most Viewed
              </TabsTrigger>
              <TabsTrigger value="fastest" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Zap className="w-4 h-4" />
                Fastest Selling
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {trendingProducts.map((product, index) => (
                  <div key={product.id} className="relative group">
                    {/* Rank badge */}
                    <div className="absolute -top-3 -left-3 z-20">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                          'bg-gradient-to-r from-orange-500 to-red-500'
                        }`}>
                          #{index + 1}
                        </div>
                        {index < 3 && (
                          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-orange-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* Trending badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none gap-1 shadow-lg">
                        <Flame className="w-3 h-3" />
                        {index === 0 ? 'Hottest' : 'Trending'}
                      </Badge>
                    </div>

                    <ProductCard {...product} />
                    
                    {/* Trending indicator bar */}
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${100 - index * 8}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Link to="/products?sort=trending">
                  <Button variant="outline" size="lg" className="rounded-full group">
                    View All Trending Products
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="most-viewed">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mostViewed.map((product, index) => (
                  <div key={product.id} className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="secondary" className="bg-blue-500/90 text-white border-none gap-1 shadow-lg">
                        <Eye className="w-3 h-3" />
                        {Math.floor(Math.random() * 500) + 100} views
                      </Badge>
                    </div>
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fastest">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {fastestSelling.map((product) => (
                  <div key={product.id} className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none gap-1 shadow-lg">
                        <Zap className="w-3 h-3" />
                        {product.soldCount}+ sold
                      </Badge>
                    </div>
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Trending Categories - Redesigned */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">Trending Categories</h2>
                  <p className="text-sm text-muted-foreground">Fastest growing categories this week</p>
                </div>
              </div>
            </div>
            <Link to="/categories" className="group hidden sm:flex items-center text-primary hover:text-primary/80 transition-colors">
              View All Categories
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingCategories.map((cat: any, index) => (
              <Link
                key={cat.name}
                to={`/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
              >
                {/* Rank indicator */}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary/10 text-primary border-none">
                    #{index + 1}
                  </Badge>
                </div>

                {/* Icon background */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-primary" />
                </div>

                <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{cat.count} products</p>
                
                {/* Growth indicator */}
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  {cat.growth}% growth
                </div>

                {/* Progress bar */}
                <Progress value={cat.growth} className="mt-3 h-1.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* Real-time Activity Feed - Redesigned */}
        <section className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Live Activity</h2>
              <p className="text-sm text-muted-foreground">Real-time purchases and interactions</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span className="text-sm font-medium">Live now</span>
              </div>
              <Badge variant="outline">Updated just now</Badge>
            </div>
            
            <div className="divide-y divide-border">
              {liveActivities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                      {activity.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium text-primary">
                        {activity.item}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  
                  <Badge variant="secondary" className="animate-pulse">
                    <Zap className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-muted/50 border-t border-border text-center">
              <Link to="/activity" className="text-sm text-primary hover:underline">
                View all activity
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Searches - Redesigned */}
        <section className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Trending Searches</h2>
                <p className="text-sm text-muted-foreground">Most popular search terms</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {['Fresh Tomatoes', 'Basmati Rice', 'Cooking Oil', 'Farm Eggs', 'Whole Wheat Flour', 'Organic Honey', 'Fresh Milk', 'Vegetables', 'Fruits', 'Spices'].map((term, i) => (
              <Link
                key={term}
                to={`/products?search=${term}`}
                className="group"
              >
                <Badge 
                  variant="outline"
                  className="px-5 py-3 text-sm hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105 cursor-pointer border-2"
                >
                  {term}
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full group-hover:bg-primary-foreground group-hover:text-primary">
                    {Math.floor(Math.random() * 50) + 10}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-3xl p-8 md:p-12 border border-orange-500/20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Stay Ahead of Trends</h2>
            <p className="text-muted-foreground mb-8">
              Get daily trending updates and personalized recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-8 hover:shadow-lg hover:shadow-orange-500/25 transition-all">
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

export default TrendingPage;