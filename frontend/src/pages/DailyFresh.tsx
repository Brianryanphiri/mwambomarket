import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sun, Clock, Calendar, ChevronRight, Star,
  Coffee, Cloud, Droplets, Wind, Leaf,
  ShoppingBag, Heart, Truck, Shield, Award,
  Sparkles, Bell, RefreshCw, CheckCircle,
  Moon, Sunrise, Sunset, ThermometerSun,
  Wheat, Apple, Egg, Milk, Croissant,
  Timer, AlertCircle, TrendingUp, Users,
  Package, Zap, Gauge, Soup, Sandwich,
  Loader2, Eye, ShoppingCart, Filter
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { serviceService } from '@/services/serviceService';
import type { DailyFreshProduct } from '@/types/service.types';

// API base URL for images
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

// Image URL helper
const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath || imagePath === '/placeholder.svg') return '/placeholder.svg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  return `${STATIC_BASE_URL}/uploads/products/${filename}`;
};

// Skeleton loader
const ProductCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="aspect-square bg-muted" />
    <CardContent className="p-4">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-6 bg-muted rounded w-1/3" />
    </CardContent>
  </Card>
);

// Categories
const categories = [
  { id: 'all', name: 'All Items', icon: Package },
  { id: 'bakery', name: 'Bakery', icon: Croissant },
  { id: 'dairy', name: 'Dairy', icon: Milk },
  { id: 'vegetables', name: 'Vegetables', icon: Soup },
  { id: 'fruits', name: 'Fruits', icon: Apple }
];

// Get freshness color
const getFreshnessColor = (hours: number): string => {
  if (hours <= 2) return 'bg-green-500';
  if (hours <= 4) return 'bg-yellow-500';
  return 'bg-orange-500';
};

const DailyFresh = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<DailyFreshProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate time until next restock (6 AM)
  useEffect(() => {
    const now = new Date();
    const nextRestock = new Date();
    nextRestock.setHours(6, 0, 0, 0);
    if (now.getHours() >= 6) {
      nextRestock.setDate(nextRestock.getDate() + 1);
    }
    const diff = nextRestock.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeRemaining({ hours, minutes });
  }, [currentTime]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching daily fresh products...');
      const data = await serviceService.getPublicDailyFresh();
      console.log('Fetched products:', data);
      
      // Only show active products
      const activeProducts = data.filter(p => p.status === 'active');
      setProducts(activeProducts);
    } catch (error) {
      console.error('Error fetching daily fresh products:', error);
      setError('Failed to load daily fresh products');
      toast({
        title: 'Error',
        description: 'Failed to load daily fresh products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddToCart = (e: React.MouseEvent, product: DailyFreshProduct) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if in stock
    if (product.stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock.`,
        variant: 'destructive',
      });
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      image: product.image
    });
    
    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleViewDetails = (productId: string) => {
    navigate(`/daily-fresh/${productId}`);
  };

  // Filter by time and category
  const filteredProducts = products.filter(p => {
    const timeMatch = selectedTime === 'all' || p.timeAvailable === selectedTime;
    const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
    return timeMatch && categoryMatch;
  });

  // Get current time greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get time-based recommendation
  const getRecommendation = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return 'Fresh bread and eggs just arrived! Start your day right.';
    if (hour < 15) return 'Perfect time for a fresh salad. Our greens are at their best.';
    if (hour < 19) return 'Evening snack packs available. Great for dinner prep.';
    return 'Order now for tomorrow morning. Fresh stock arrives at 6 AM.';
  };

  // Get current time icon
  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return <Sunrise className="w-8 h-8 text-yellow-300" />;
    if (hour < 17) return <ThermometerSun className="w-8 h-8 text-orange-300" />;
    return <Sunset className="w-8 h-8 text-purple-300" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <Leaf className="w-24 h-24 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <Wheat className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Time-based animated elements */}
        <div className="absolute top-10 right-10">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              {getTimeIcon()}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-none px-4 py-2 text-base">
                <Clock className="w-4 h-4 mr-2" />
                {getGreeting()}
              </Badge>

              <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                Daily{' '}
                <span className="text-yellow-300">Fresh</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-lg">
                {getRecommendation()}
              </p>

              {/* Live freshness meter */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Timer className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Next restock in</p>
                      <p className="text-3xl font-bold">
                        {timeRemaining.hours}h {timeRemaining.minutes}m
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={((24 - (timeRemaining.hours + timeRemaining.minutes/60)) / 24) * 100} 
                    className="h-2 bg-white/20"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right content - Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Leaf className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-white/80">Fresh Items</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold">&lt; 6hrs</p>
                  <p className="text-sm text-white/80">From Harvest</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold">4x</p>
                  <p className="text-sm text-white/80">Daily Restocks</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <Truck className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold">Free</p>
                  <p className="text-sm text-white/80">Delivery</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 70C840 80 960 100 1080 105C1200 110 1320 100 1380 95L1440 90V120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchProducts}
                  className="ml-auto"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Button
            variant={selectedTime === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedTime('all')}
            className="rounded-full gap-2"
          >
            <Sun className="w-4 h-4" />
            All Day
          </Button>
          <Button
            variant={selectedTime === 'morning' ? 'default' : 'outline'}
            onClick={() => setSelectedTime('morning')}
            className="rounded-full gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
          >
            <Coffee className="w-4 h-4" />
            Morning (6AM - 11AM)
          </Button>
          <Button
            variant={selectedTime === 'afternoon' ? 'default' : 'outline'}
            onClick={() => setSelectedTime('afternoon')}
            className="rounded-full gap-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
          >
            <Sun className="w-4 h-4" />
            Afternoon (11AM - 4PM)
          </Button>
          <Button
            variant={selectedTime === 'evening' ? 'default' : 'outline'}
            onClick={() => setSelectedTime('evening')}
            className="rounded-full gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
          >
            <Moon className="w-4 h-4" />
            Evening (4PM - 8PM)
          </Button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={`px-4 py-2 cursor-pointer text-sm gap-2 ${
                  selectedCategory === cat.id ? 'bg-primary' : 'hover:bg-primary/10'
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </Badge>
            );
          })}
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} fresh items
          </p>
          <Badge variant="outline" className="px-3 py-1">
            <Gauge className="w-4 h-4 mr-1" />
            Freshness Guaranteed
          </Badge>
        </div>

        {/* All Daily Fresh Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
            <Button onClick={() => {
              setSelectedTime('all');
              setSelectedCategory('all');
            }} variant="outline" className="rounded-full">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => handleViewDetails(product.id)}
              >
                <div className="relative">
                  {/* Freshness indicator */}
                  <div className="absolute -top-2 -left-2 z-20">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${getFreshnessColor(product.freshness)}`}>
                      <Timer className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Time badge */}
                  <Badge 
                    className={`absolute top-2 right-2 z-10 border-none shadow-lg ${
                      product.timeAvailable === 'morning' ? 'bg-amber-500' :
                      product.timeAvailable === 'afternoon' ? 'bg-orange-500' :
                      product.timeAvailable === 'evening' ? 'bg-purple-500' :
                      'bg-blue-500'
                    } text-white`}
                  >
                    {product.timeAvailable === 'morning' && <Coffee className="w-3 h-3 mr-1" />}
                    {product.timeAvailable === 'afternoon' && <Sun className="w-3 h-3 mr-1" />}
                    {product.timeAvailable === 'evening' && <Moon className="w-3 h-3 mr-1" />}
                    {product.timeAvailable ? product.timeAvailable.split('-')[0] : 'All Day'}
                  </Badge>

                  {/* Organic/Local badges */}
                  <div className="absolute top-12 left-2 z-10 flex flex-col gap-1">
                    {product.organic && (
                      <Badge className="bg-green-600 text-white border-none text-xs">
                        <Leaf className="w-3 h-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                    {product.local && (
                      <Badge className="bg-blue-600 text-white border-none text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        Local
                      </Badge>
                    )}
                  </div>

                  {/* Limit badge */}
                  {product.limit && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Limit {product.limit}
                      </Badge>
                    </div>
                  )}

                  {/* Out of stock overlay */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-t-xl flex items-center justify-center z-30">
                      <Badge variant="destructive" className="text-sm">
                        Out of Stock
                      </Badge>
                    </div>
                  )}

                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">MK {product.price.toLocaleString()}</p>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DailyFresh;