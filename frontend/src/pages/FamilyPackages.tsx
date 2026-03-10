import { useState, useEffect, useCallback } from 'react';
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
const PackageCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="h-56 bg-muted" />
    <CardContent className="p-4">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-6 bg-muted rounded w-1/3 mb-4" />
      <div className="h-10 bg-muted rounded" />
    </CardContent>
  </Card>
);

// Family size icons mapping
const getFamilyIcon = (size: string) => {
  switch(size) {
    case 'small': return <User className="w-4 h-4" />;
    case 'medium': return <Users className="w-4 h-4" />;
    case 'large': return <UsersRound className="w-4 h-4" />;
    default: return <Users className="w-4 h-4" />;
  }
};

const FamilyPackages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [packages, setPackages] = useState<FamilyPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    fetchPackages();
  }, []);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching family packages...');
      const data = await serviceService.getPublicFamilyPackages();
      console.log('Fetched packages:', data);
      
      // Only show active packages
      const activePackages = data.filter(p => p.status === 'active');
      setPackages(activePackages);
    } catch (error) {
      console.error('Error fetching family packages:', error);
      setError('Failed to load family packages. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load family packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddToCart = (e: React.MouseEvent, pkg: FamilyPackage) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  // Filter packages
  const filteredPackages = packages.filter(p => 
    selectedSize === 'all' || p.familySize === selectedSize
  );

  // Sort packages
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'savings') return (b.savings || 0) - (a.savings || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    // popular - prioritize items with popular tag
    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
  });

  const savingsTotal = packages.reduce((sum, p) => sum + (p.savings || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-float">
            <UsersRound className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-10 right-10 animate-float-delayed">
            <Users className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
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
                  onClick={fetchPackages}
                  className="ml-auto"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Section */}
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

        {/* Empty State */}
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
                className={`group overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in relative cursor-pointer ${
                  pkg.bestValue ? 'border-2 border-yellow-400' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleViewDetails(pkg.id)}
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
                    src={getImageUrl(pkg.image)}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {pkg.tags && pkg.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} className="bg-primary/90 text-white border-none shadow-lg">
                        {tag === 'Best Value' && <Award className="w-3 h-3 mr-1" />}
                        {tag === 'Most Popular' && <ThumbsUp className="w-3 h-3 mr-1" />}
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Savings Badge */}
                  {pkg.savings && pkg.savings > 0 && (
                    <div className="absolute bottom-4 right-4">
                      <Badge className="bg-green-500 text-white border-none text-sm px-4 py-2 shadow-lg">
                        <Percent className="w-4 h-4 mr-1" />
                        Save MK {pkg.savings.toLocaleString()}
                      </Badge>
                    </div>
                  )}

                  {/* Family Size Indicator */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-none gap-2 px-4 py-2">
                      {getFamilyIcon(pkg.familySize)}
                      <span className="capitalize">{pkg.familySize} Family</span>
                    </Badge>
                  </div>
                </div>

                {/* Package Details */}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-display font-semibold mb-1">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                    </div>
                    {pkg.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {pkg.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items Count */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      {pkg.items} items included
                    </p>
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
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                        View Details
                      </Button>
                    </div>
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