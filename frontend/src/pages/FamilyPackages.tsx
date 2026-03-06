import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, ShoppingBag, Heart, Clock, Truck, 
  Shield, Award, Sparkles, ChevronRight, Star,
  TrendingUp, Gift, Percent, Coffee, Utensils,
  Baby, Pizza, Salad, Wheat, Droplets,
  Package, ThumbsUp, Leaf, Sun, Moon,
  Apple, Beef, Fish, Milk, Egg,
  Home, Calendar, CreditCard, Zap,
  User, Smile, CheckCircle, Boxes,
  UsersRound, UserRound, UserRoundPlus,
  CircleCheck, CircleDollarSign, Clock3,
  ShoppingCart, Tag, BadgePercent, Loader2,
  Eye, Flame
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import type { FamilyPackage } from '@/types/service.types';

// Import product images (keep as fallback for images)
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

// API base URL for images
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Map of fallback images by package name or category
const fallbackImages: Record<string, string> = {
  'Starter Family Pack': vegetablesImg,
  'Medium Family Feast': riceImg,
  'Large Family Bundle': fruitsImg,
  'Vegetarian Family Pack': vegetablesImg,
  'Breakfast Special Pack': breadImg,
  'Monthly Mega Pack': riceImg,
  'default': vegetablesImg
};

// Nutrition info component for tooltips or quick view
const NutritionPreview = ({ nutrition }: { nutrition?: any }) => {
  if (!nutrition || Object.values(nutrition).every(v => !v)) return null;
  
  const hasValues = Object.entries(nutrition).filter(([_, v]) => v && v > 0);
  
  return (
    <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <p className="text-xs font-semibold flex items-center gap-1 mb-1">
        <Flame className="w-3 h-3 text-orange-500" />
        Nutrition (per serving)
      </p>
      <div className="flex flex-wrap gap-1">
        {nutrition.calories > 0 && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {nutrition.calories} cal
          </Badge>
        )}
        {nutrition.protein > 0 && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {nutrition.protein}g protein
          </Badge>
        )}
        {hasValues.length > 2 && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            +{hasValues.length - 2} more
          </Badge>
        )}
      </div>
    </div>
  );
};

const FamilyPackages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [packages, setPackages] = useState<FamilyPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    fetchPackages();
  }, []);

  const getFullImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath || imagePath === '/placeholder.svg' || imagePath.includes('placeholder')) {
      return '';
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /uploads, prepend the API base URL
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Otherwise, assume it's a filename and construct the full path
    return `${API_BASE_URL}/uploads/products/${imagePath}`;
  };

  const fetchPackages = async () => {
    try {
      console.log('Fetching family packages from API...');
      const data = await serviceService.getPublicFamilyPackages();
      console.log('Raw fetched data:', data);
      
      // Only show active packages
      const activePackages = data.filter(p => p.status === 'active');
      console.log('Active packages:', activePackages);
      
      // Enhance packages with proper image URLs and fallbacks
      const enhancedPackages = activePackages.map(pkg => {
        const fullImageUrl = getFullImageUrl(pkg.image);
        
        return {
          ...pkg,
          // Use the full image URL from backend if available, otherwise use fallback
          image: fullImageUrl || (fallbackImages[pkg.name] || fallbackImages.default),
          // Ensure tags is always an array
          tags: Array.isArray(pkg.tags) ? pkg.tags : [],
          // Ensure includes is always an array
          includes: Array.isArray(pkg.includes) ? pkg.includes : [],
          // Ensure nutrition is properly parsed
          nutrition: pkg.nutrition || null
        };
      });
      
      console.log('Enhanced packages:', enhancedPackages);
      setPackages(enhancedPackages);
    } catch (error) {
      console.error('Error fetching family packages:', error);
      // If backend fails, use mock data as fallback
      console.log('Using mock data as fallback');
      setPackages(mockPackages);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, pkg: FamilyPackage) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart logic
    addItem({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      quantity: 1,
      unit: 'package'
    });
    
    toast({
      title: 'Added to cart!',
      description: `${pkg.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleViewDetails = (pkgId: string) => {
    navigate(`/family-packages/${pkgId}`);
  };

  // Mock data as fallback (only used if backend fails)
  const mockPackages: FamilyPackage[] = [
    {
      id: 'fp1',
      serviceId: 'family-1',
      name: 'Starter Family Pack',
      description: 'Perfect for small families of 2-3. Includes all weekly essentials.',
      price: 45000,
      originalPrice: 52000,
      image: vegetablesImg,
      items: 15,
      familySize: 'small',
      savings: 7000,
      rating: 4.5,
      tags: ['Best Value', 'Popular'],
      popular: true,
      bestValue: false,
      includes: ['Vegetables', 'Fruits', 'Rice 2kg', 'Cooking Oil 1L', 'Eggs 15pcs', 'Sugar 1kg'],
      status: 'active',
      nutrition: {
        calories: 450,
        protein: 12,
        carbs: 65,
        fat: 15,
        fiber: 8,
        sugar: 10,
        sodium: 400
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fp2',
      serviceId: 'family-1',
      name: 'Medium Family Feast',
      description: 'Great for families of 4-5. Complete weekly groceries.',
      price: 75000,
      originalPrice: 89000,
      image: riceImg,
      items: 25,
      familySize: 'medium',
      savings: 14000,
      rating: 5,
      tags: ['Most Popular', 'Best Value'],
      popular: true,
      bestValue: true,
      includes: ['Vegetables', 'Fruits', 'Rice 5kg', 'Cooking Oil 2L', 'Eggs 30pcs', 'Sugar 2kg', 'Flour 2kg', 'Milk 2L'],
      status: 'active',
      nutrition: {
        calories: 650,
        protein: 25,
        carbs: 85,
        fat: 22,
        fiber: 12,
        sugar: 18,
        sodium: 650
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fp3',
      serviceId: 'family-1',
      name: 'Large Family Bundle',
      description: 'Everything a large family of 6+ needs for a week.',
      price: 120000,
      originalPrice: 145000,
      image: fruitsImg,
      items: 40,
      familySize: 'large',
      savings: 25000,
      rating: 5,
      tags: ['Best Savings'],
      popular: false,
      bestValue: false,
      includes: ['Vegetables', 'Fruits', 'Rice 10kg', 'Cooking Oil 3L', 'Eggs 30pcs', 'Sugar 3kg', 'Flour 5kg', 'Milk 4L', 'Meat Pack', 'Snacks'],
      status: 'active',
      nutrition: {
        calories: 850,
        protein: 35,
        carbs: 110,
        fat: 30,
        fiber: 15,
        sugar: 25,
        sodium: 900
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fp4',
      serviceId: 'family-1',
      name: 'Vegetarian Family Pack',
      description: 'All vegetarian essentials for the week.',
      price: 55000,
      originalPrice: 63000,
      image: vegetablesImg,
      items: 20,
      familySize: 'medium',
      savings: 8000,
      rating: 4.5,
      tags: ['Vegetarian'],
      popular: false,
      bestValue: false,
      includes: ['Vegetables', 'Fruits', 'Rice 5kg', 'Cooking Oil 2L', 'Eggs 30pcs', 'Beans 2kg', 'Lentils 1kg'],
      status: 'active',
      nutrition: {
        calories: 550,
        protein: 18,
        carbs: 75,
        fat: 12,
        fiber: 14,
        sugar: 12,
        sodium: 350
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fp5',
      serviceId: 'family-1',
      name: 'Breakfast Special Pack',
      description: 'Start your day right with breakfast essentials.',
      price: 35000,
      originalPrice: 40000,
      image: breadImg,
      items: 12,
      familySize: 'small',
      savings: 5000,
      rating: 4,
      tags: ['Breakfast'],
      popular: false,
      bestValue: false,
      includes: ['Bread', 'Eggs 15pcs', 'Milk 2L', 'Cereal', 'Coffee', 'Sugar 1kg', 'Butter'],
      status: 'active',
      nutrition: {
        calories: 380,
        protein: 15,
        carbs: 45,
        fat: 18,
        fiber: 4,
        sugar: 15,
        sodium: 320
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'fp6',
      serviceId: 'family-1',
      name: 'Monthly Mega Pack',
      description: 'Stock up for the whole month with maximum savings.',
      price: 280000,
      originalPrice: 350000,
      image: riceImg,
      items: 85,
      familySize: 'large',
      savings: 70000,
      rating: 5,
      tags: ['Mega Savings', 'Monthly'],
      popular: false,
      bestValue: false,
      includes: ['Vegetables', 'Fruits', 'Rice 20kg', 'Cooking Oil 5L', 'Eggs 60pcs', 'Sugar 5kg', 'Flour 10kg', 'Milk 8L', 'Meat Pack', 'Snacks', 'Cleaning Supplies'],
      status: 'active',
      nutrition: {
        calories: 1200,
        protein: 45,
        carbs: 150,
        fat: 40,
        fiber: 20,
        sugar: 30,
        sodium: 1200
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Filter packages
  const filteredPackages = packages.filter(p => 
    selectedSize === 'all' || p.familySize === selectedSize
  );

  // Sort packages
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'savings') return b.savings - a.savings;
    if (sortBy === 'rating') return b.rating - a.rating;
    // popular - prioritize items with popular tag
    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
  });

  const savingsTotal = packages.reduce((sum, p) => sum + p.savings, 0);

  // Family size icons mapping
  const getFamilyIcon = (size: string) => {
    switch(size) {
      case 'small': return <User className="w-4 h-4" />;
      case 'medium': return <Users className="w-4 h-4" />;
      case 'large': return <UsersRound className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Family Animation */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <UsersRound className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-10 right-10 animate-float-delayed">
            <Users className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-float-slow">
            <User className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Animated family icon */}
            <div className={`relative mb-8 transform transition-all duration-1000 ${showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Users className="w-6 h-6" />
                <span className="text-lg font-medium">Family Packages</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Save More,{' '}
              <span className="text-yellow-300">Together</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Specially curated packages designed for your family's needs. 
              Better value, less stress, more quality time together.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Package className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">{packages.length}</p>
                <p className="text-sm text-white/80">Curated Packages</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Percent className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">MK {savingsTotal.toLocaleString()}+</p>
                <p className="text-sm text-white/80">Total Savings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Heart className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-white/80">Happy Families</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Truck className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">Free</p>
                <p className="text-sm text-white/80">Delivery</p>
              </div>
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

      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* Features Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Percent className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold">Save up to 25%</p>
              <p className="text-xs text-muted-foreground mt-1">Vs. individual items</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-blue-600" />
              </div>
              <p className="font-semibold">Free Delivery</p>
              <p className="text-xs text-muted-foreground mt-1">On all packages</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <p className="font-semibold">Weekly Fresh</p>
              <p className="text-xs text-muted-foreground mt-1">New stock every Monday</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
              <p className="font-semibold">Quality Guarantee</p>
              <p className="text-xs text-muted-foreground mt-1">100% fresh promise</p>
            </CardContent>
          </Card>
        </section>

        {/* Filter Section */}
        <section>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Family Packages</h2>
                <p className="text-sm text-muted-foreground">Curated for every family size</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedSize === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSize('all')}
                className="rounded-full gap-2"
              >
                <Users className="w-4 h-4" />
                All
              </Button>
              <Button
                variant={selectedSize === 'small' ? 'default' : 'outline'}
                onClick={() => setSelectedSize('small')}
                className="rounded-full gap-2"
              >
                <User className="w-4 h-4" />
                Small (2-3)
              </Button>
              <Button
                variant={selectedSize === 'medium' ? 'default' : 'outline'}
                onClick={() => setSelectedSize('medium')}
                className="rounded-full gap-2"
              >
                <Users className="w-4 h-4" />
                Medium (4-5)
              </Button>
              <Button
                variant={selectedSize === 'large' ? 'default' : 'outline'}
                onClick={() => setSelectedSize('large')}
                className="rounded-full gap-2"
              >
                <UsersRound className="w-4 h-4" />
                Large (6+)
              </Button>
            </div>
          </div>

          {/* Sort and Filter Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <p className="text-sm text-muted-foreground">
              Showing {sortedPackages.length} packages
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Biggest Savings</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Packages Grid */}
          {sortedPackages.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No packages found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
              <Button onClick={() => setSelectedSize('all')} variant="outline" className="rounded-full">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedPackages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className={`group overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in relative ${
                    pkg.bestValue ? 'border-2 border-yellow-400' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Best Value Ribbon */}
                  {pkg.bestValue && (
                    <div className="absolute top-6 right-[-35px] z-20 transform rotate-45">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-12 py-1 rounded-none">
                        Best Value
                      </Badge>
                    </div>
                  )}

                  {/* Package Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        console.log('Image failed to load:', pkg.image);
                        (e.target as HTMLImageElement).src = fallbackImages[pkg.name] || vegetablesImg;
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {pkg.tags && pkg.tags.map(tag => (
                        <Badge key={tag} className="bg-primary/90 text-white border-none shadow-lg">
                          {tag === 'Best Value' && <Award className="w-3 h-3 mr-1" />}
                          {tag === 'Most Popular' && <ThumbsUp className="w-3 h-3 mr-1" />}
                          {tag === 'Vegetarian' && <Leaf className="w-3 h-3 mr-1" />}
                          {tag === 'Breakfast' && <Coffee className="w-3 h-3 mr-1" />}
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Savings Badge */}
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-green-500 text-white border-none text-sm px-4 py-2 shadow-lg">
                        <Percent className="w-4 h-4 mr-1" />
                        Save MK {pkg.savings.toLocaleString()}
                      </Badge>
                    </div>

                    {/* Family Size Indicator */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-none gap-2 px-4 py-2">
                        {getFamilyIcon(pkg.familySize)}
                        <span className="capitalize">{pkg.familySize} Family</span>
                      </Badge>
                    </div>

                    {/* Nutrition Preview (on hover) */}
                    {pkg.nutrition && <NutritionPreview nutrition={pkg.nutrition} />}
                  </div>

                  {/* Package Details */}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-display font-semibold mb-1">{pkg.name}</h3>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {typeof pkg.rating === 'number' ? pkg.rating.toFixed(1) : Number(pkg.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Items Included Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        {pkg.items} items included:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.includes && pkg.includes.slice(0, 4).map(item => (
                          <Badge key={item} variant="outline" className="bg-muted/30">
                            {item.includes('Eggs') && <Egg className="w-3 h-3 mr-1 inline" />}
                            {item.includes('Milk') && <Milk className="w-3 h-3 mr-1 inline" />}
                            {item.includes('Rice') && <Wheat className="w-3 h-3 mr-1 inline" />}
                            {item}
                          </Badge>
                        ))}
                        {pkg.includes && pkg.includes.length > 4 && (
                          <Badge variant="outline">+{pkg.includes.length - 4} more</Badge>
                        )}
                      </div>
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="space-y-3 mt-6 pt-4 border-t border-border">
                      {/* Price */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            MK {pkg.price.toLocaleString()}
                          </span>
                          {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              MK {pkg.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Free delivery
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl gap-2"
                          onClick={(e) => handleAddToCart(e, pkg)}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 rounded-xl gap-2"
                          onClick={() => handleViewDetails(pkg.id)}
                        >
                          <Eye className="w-4 h-4" />
                          View Full Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Why Choose Family Packages?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-background/50 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-float">
                  <Percent className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Save More</h3>
                <p className="text-muted-foreground">
                  Get up to 25% savings compared to buying items individually. More value for your money.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-background/50 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.2s' }}>
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Save Time</h3>
                <p className="text-muted-foreground">
                  No need to shop for each item individually. Everything your family needs in one package.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-background/50 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 animate-float" style={{ animationDelay: '0.4s' }}>
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Family Favorites</h3>
                <p className="text-muted-foreground">
                  Curated based on what families like yours love most. Tested and approved by parents.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            What Families Say
          </h2>

          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {[
                {
                  name: 'Chimwemwe Banda',
                  family: 'Family of 4',
                  comment: 'The Medium Family Feast is perfect for us. We save so much time and money!',
                  rating: 5,
                  icon: <Users className="w-5 h-5" />
                },
                {
                  name: 'Temwa Phiri',
                  family: 'Family of 6',
                  comment: 'Large Family Bundle lasts us a whole week. Fresh and affordable!',
                  rating: 5,
                  icon: <UsersRound className="w-5 h-5" />
                },
                {
                  name: 'Memory Mwale',
                  family: 'Family of 3',
                  comment: 'Starter pack is just right for our small family. Love the convenience!',
                  rating: 5,
                  icon: <User className="w-5 h-5" />
                },
                {
                  name: 'Kondwani Banda',
                  family: 'Family of 5',
                  comment: 'The vegetarian pack is amazing! Fresh produce and great variety.',
                  rating: 5,
                  icon: <Users className="w-5 h-5" />
                }
              ].map((testimonial, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-6 italic">
                        "{testimonial.comment}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {testimonial.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.family}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Get Family Deals First</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Subscribe to receive exclusive family package offers and weekly deals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8">
              Subscribe
            </Button>
          </div>
        </section>
      </div>

      <Footer />

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .animate-float-slow {
          animation: float 5s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FamilyPackages;