import { useState, useEffect } from 'react';
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
  Loader2, Eye, ShoppingCart
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
import ProductCard from '@/components/store/ProductCard';

// Import product images (keep as fallback)
import tomatoesImg from '@/assets/products/tomatoes.jpg';
import onionsImg from '@/assets/products/onions.jpg';
import riceImg from '@/assets/products/rice.jpg';
import cookingOilImg from '@/assets/products/cooking-oil.jpg';
import eggsImg from '@/assets/products/eggs.jpg';
import sugarImg from '@/assets/products/sugar.jpg';
import maizeFlourImg from '@/assets/products/maize-flour.jpg';
import milkImg from '@/assets/products/milk.jpg';
import breadImg from '@/assets/products/bread.jpg';
import vegetablesImg from '@/assets/products/vegetables.jpg';
import beansImg from '@/assets/products/beans.jpg';
import fruitsImg from '@/assets/products/fruits.jpg';

// API base URL for API calls (with /api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Static files base URL (without /api) - for images
const STATIC_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// Map of fallback images by product name or category
const fallbackImages: Record<string, string> = {
  'Fresh Bread': breadImg,
  'Fresh Bread (Morning Batch)': breadImg,
  'Farm Fresh Eggs': eggsImg,
  'Morning Milk': milkImg,
  'Sun-ripened Tomatoes': tomatoesImg,
  'Evening Salad Pack': vegetablesImg,
  'Fresh Fruits Mix': fruitsImg,
  'Morning Pastries': breadImg,
  'Fresh Greens Bundle': vegetablesImg,
  'Artisan Sourdough': breadImg,
  'Afternoon Buns': breadImg,
  'default': vegetablesImg
};

// Helper function to get full image URL for display
const getFullImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath || imagePath === '/placeholder.svg' || imagePath.includes('placeholder')) {
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a blob URL (preview), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // If it's already a full path starting with /uploads, just add the base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${STATIC_BASE_URL}${imagePath}`;
  }
  
  // Extract just the filename if it's a full path
  let filename = imagePath;
  if (imagePath.includes('/')) {
    filename = imagePath.split('/').pop() || '';
  }
  
  // Construct the correct URL - matches backend static file serving
  return `${STATIC_BASE_URL}/uploads/products/${filename}`;
};

const DailyFresh = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<DailyFreshProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

    // Celebrate at restock time
    if (hours === 0 && minutes === 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 10000);
    }
  }, [currentTime]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Debug image URLs
  useEffect(() => {
    if (products.length > 0) {
      console.log('📦 Products loaded:', products.length);
      products.forEach(p => {
        const imageUrl = getFullImageUrl(p.image);
        console.log(`🖼️ Product: ${p.name}`);
        console.log(`   Raw image: ${p.image}`);
        console.log(`   Full URL: ${imageUrl}`);
        console.log(`   STATIC_BASE_URL: ${STATIC_BASE_URL}`);
      });
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      console.log('Fetching daily fresh products...');
      const data = await serviceService.getPublicDailyFresh();
      console.log('Raw API response:', data);
      
      // Only show active products
      const activeProducts = data.filter(p => p.status === 'active');
      console.log('Active products:', activeProducts);
      
      // Enhance products with proper image URLs and fallbacks
      const enhancedProducts = activeProducts.map(product => {
        const fullImageUrl = getFullImageUrl(product.image);
        
        return {
          ...product,
          // Use the full image URL from backend if available, otherwise use fallback
          image: fullImageUrl || (fallbackImages[product.name] || fallbackImages.default),
          // Ensure numeric fields are numbers
          price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
          freshness: typeof product.freshness === 'number' ? product.freshness : parseInt(product.freshness) || 0,
          stock: typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0,
          rating: typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0,
          // Ensure timeAvailable has a default
          timeAvailable: product.timeAvailable || 'all-day'
        };
      });
      
      console.log('Enhanced products:', enhancedProducts);
      setProducts(enhancedProducts);
    } catch (error) {
      console.error('Error fetching daily fresh products:', error);
      // If backend fails, use mock data as fallback
      console.log('Using mock data as fallback');
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (productId: string, productName: string) => {
    console.error(`Image failed to load for product: ${productName} (ID: ${productId})`);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

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
      unit: product.unit
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

  // Mock data as fallback
  const mockProducts: DailyFreshProduct[] = [
    {
      id: 'df1',
      serviceId: 'daily-1',
      name: 'Fresh Bread (Morning Batch)',
      price: 1500,
      unit: '1 loaf',
      image: breadImg,
      rating: 5,
      badge: 'Freshly Baked',
      category: 'bakery',
      timeAvailable: 'morning',
      freshness: 1,
      stock: 45,
      limit: 10,
      organic: false,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df2',
      serviceId: 'daily-1',
      name: 'Farm Fresh Eggs',
      price: 6000,
      unit: 'Tray of 30',
      image: eggsImg,
      rating: 5,
      badge: 'Today\'s Harvest',
      category: 'dairy',
      timeAvailable: 'all-day',
      freshness: 4,
      stock: 120,
      organic: true,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df3',
      serviceId: 'daily-1',
      name: 'Morning Milk',
      price: 2800,
      unit: '2 Litres',
      image: milkImg,
      rating: 4,
      badge: 'Fresh',
      category: 'dairy',
      timeAvailable: 'morning',
      freshness: 2,
      stock: 80,
      limit: 2,
      organic: false,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df4',
      serviceId: 'daily-1',
      name: 'Sun-ripened Tomatoes',
      price: 2500,
      unit: '1 kg',
      image: tomatoesImg,
      rating: 5,
      badge: 'Farm Fresh',
      category: 'vegetables',
      timeAvailable: 'morning',
      freshness: 3,
      stock: 150,
      organic: true,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df5',
      serviceId: 'daily-1',
      name: 'Afternoon Buns',
      price: 800,
      unit: '4 pieces',
      image: breadImg,
      rating: 4,
      badge: 'Fresh Batch',
      category: 'bakery',
      timeAvailable: 'afternoon',
      freshness: 1,
      stock: 60,
      organic: false,
      local: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df6',
      serviceId: 'daily-1',
      name: 'Evening Salad Pack',
      price: 3500,
      unit: '500g',
      image: vegetablesImg,
      rating: 5,
      badge: 'Prepped Fresh',
      category: 'vegetables',
      timeAvailable: 'evening',
      freshness: 2,
      stock: 40,
      organic: true,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df7',
      serviceId: 'daily-1',
      name: 'Fresh Fruits Mix',
      price: 3000,
      unit: 'Mixed Pack',
      image: fruitsImg,
      rating: 5,
      badge: 'Seasonal',
      category: 'fruits',
      timeAvailable: 'all-day',
      freshness: 5,
      stock: 95,
      organic: true,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df8',
      serviceId: 'daily-1',
      name: 'Morning Pastries',
      price: 2000,
      unit: 'Box of 6',
      image: breadImg,
      rating: 5,
      badge: 'Fresh',
      category: 'bakery',
      timeAvailable: 'morning',
      freshness: 1,
      stock: 35,
      limit: 3,
      organic: false,
      local: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df9',
      serviceId: 'daily-1',
      name: 'Fresh Greens Bundle',
      price: 4000,
      unit: 'Mixed Greens',
      image: vegetablesImg,
      rating: 5,
      badge: 'Organic',
      category: 'vegetables',
      timeAvailable: 'morning',
      freshness: 2,
      stock: 50,
      organic: true,
      local: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'df10',
      serviceId: 'daily-1',
      name: 'Artisan Sourdough',
      price: 2500,
      unit: '1 loaf',
      image: breadImg,
      rating: 5,
      badge: 'Fresh Daily',
      category: 'bakery',
      timeAvailable: 'afternoon',
      freshness: 2,
      stock: 25,
      limit: 2,
      organic: false,
      local: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
      <Header />
      
      {/* Restock Celebration */}
      {showCelebration && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Fresh Stock Just Arrived!</span>
          </div>
        </div>
      )}

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
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-white/80">Fresh Daily</p>
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
                  <Package className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold">{products.length}+</p>
                  <p className="text-sm text-white/80">Daily Items</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-2xl font-bold">4x</p>
                  <p className="text-sm text-white/80">Daily Restocks</p>
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

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Time filters */}
        <section>
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
        </section>

        {/* Time-based specials carousel */}
        <section>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500" />
            Time-Based Specials
          </h2>

          <Carousel className="w-full">
            <CarouselContent>
              {['morning', 'afternoon', 'evening'].map((time) => {
                const timeProducts = products.filter(p => p.timeAvailable === time);
                if (timeProducts.length === 0) return null;
                
                return (
                  <CarouselItem key={time} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full">
                      <CardHeader className={`bg-gradient-to-r ${
                        time === 'morning' ? 'from-amber-500 to-orange-500' :
                        time === 'afternoon' ? 'from-orange-500 to-red-500' :
                        'from-purple-500 to-pink-500'
                      } text-white rounded-t-lg`}>
                        <CardTitle className="flex items-center gap-2">
                          {time === 'morning' && <Coffee className="w-5 h-5" />}
                          {time === 'afternoon' && <Sun className="w-5 h-5" />}
                          {time === 'evening' && <Moon className="w-5 h-5" />}
                          <span className="capitalize">{time} Specials</span>
                        </CardTitle>
                        <CardDescription className="text-white/80">
                          {time === 'morning' && 'Fresh bread, eggs, and milk'}
                          {time === 'afternoon' && 'Salads, fruits, and snacks'}
                          {time === 'evening' && 'Dinner prep essentials'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {timeProducts.slice(0, 3).map(product => (
                            <div 
                              key={product.id} 
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => handleViewDetails(product.id)}
                            >
                              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                                <img 
                                  src={imageErrors[product.id] ? fallbackImages[product.name] || fallbackImages.default : getFullImageUrl(product.image)} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(product.id, product.name)}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.unit}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">MK {product.price.toLocaleString()}</p>
                                <Badge variant="outline" className="text-xs">
                                  {product.freshness}h fresh
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {timeProducts.length > 3 && (
                            <Button variant="link" className="w-full text-sm">
                              View all {timeProducts.length} items
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* All Daily Fresh Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Today's Fresh Picks</h2>
                <p className="text-sm text-muted-foreground">Harvested and prepared daily</p>
              </div>
            </div>
          </div>

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
                <div key={product.id} className="relative group">
                  {/* Freshness indicator */}
                  <div className="absolute -top-2 -left-2 z-20">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${getFreshnessColor(product.freshness)}`}>
                        <Timer className="w-4 h-4" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
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
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-30">
                      <Badge variant="destructive" className="text-sm">
                        Out of Stock
                      </Badge>
                    </div>
                  )}

                  <ProductCard 
                    {...product} 
                    image={imageErrors[product.id] ? fallbackImages[product.name] || fallbackImages.default : getFullImageUrl(product.image)}
                    onAddToCart={(e) => handleAddToCart(e, product)}
                    onViewDetails={() => handleViewDetails(product.id)}
                    onImageError={() => handleImageError(product.id, product.name)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Restock Schedule */}
        <section className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold mb-3">Daily Restock Schedule</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We restock 4 times daily to ensure you always get the freshest products
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { time: '6:00 AM', icon: Sunrise, items: 'Bread, Eggs, Milk', desc: 'Breakfast essentials', color: 'amber' },
              { time: '11:00 AM', icon: Sun, items: 'Vegetables, Fruits', desc: 'Lunch prep', color: 'orange' },
              { time: '4:00 PM', icon: Cloud, items: 'Snacks, Salads', desc: 'Evening fresh', color: 'sky' },
              { time: '8:00 PM', icon: Sunset, items: 'Dinner items', desc: 'Next day prep', color: 'purple' }
            ].map((slot, i) => {
              const Icon = slot.icon;
              const colorClasses = {
                amber: 'from-amber-500 to-orange-500',
                orange: 'from-orange-500 to-red-500',
                sky: 'from-sky-500 to-blue-500',
                purple: 'from-purple-500 to-pink-500'
              }[slot.color];

              return (
                <Card key={i} className="text-center hover:shadow-xl transition-all group">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colorClasses} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-primary">{slot.time}</p>
                    <p className="font-semibold mt-2">{slot.items}</p>
                    <p className="text-xs text-muted-foreground mt-1">{slot.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Freshness guarantee */}
          <div className="mt-8 bg-card rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Freshness Guarantee</h3>
                <p className="text-sm text-muted-foreground">Not satisfied? We'll replace it for free</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-8">
              Learn More
            </Button>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Never Miss Fresh Arrivals</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Get notified when fresh stock arrives and receive exclusive morning deals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full px-8 gap-2">
              <Bell className="w-4 h-4" />
              Notify Me
            </Button>
          </div>
        </section>
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