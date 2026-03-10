import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Users, Coffee, Clock, Calendar,
  ShoppingBag, Truck, Award, Sparkles, ChevronRight,
  CheckCircle, Percent, Heart, Shield, Star,
  Zap, Laptop, PenTool, Mail, Phone, Folder,
  CreditCard, RefreshCw, Thermometer, Wifi,
  Package, ClipboardList, TrendingUp, Printer,
  FileText, Pen, Paperclip, Scissors, Ruler,
  BookOpen, Copy, HardDrive, Monitor, Headphones,
  Battery, Cpu, Globe, Box, Boxes, Building2,
  Building, Store, Factory, Receipt, Calculator,
  Pencil, Highlighter, Eraser, Stamp, Tape,
  FolderOpen, FolderClosed, FileSpreadsheet,
  FileCog, FileCheck, FileWarning, FileStack,
  Presentation, Tablet, Smartphone, Speaker,
  Keyboard, Mouse, Settings, Wrench, Tool,
  Users2, UserCog, UserPlus, UserCheck,
  Banknote, CircleDollarSign, BadgePercent,
  Gem, Crown, Medal, Trophy, Rocket,
  Loader2, AlertCircle, Eye
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import type { OfficePack } from '@/types/service.types';

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
const PackCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="h-48 bg-muted" />
    <CardContent className="p-4">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-6 bg-muted rounded w-1/3 mb-4" />
      <div className="h-10 bg-muted rounded" />
    </CardContent>
  </Card>
);

// Size icons mapping
const sizeIcons = {
  small: UserPlus,
  medium: Users,
  large: Users2,
  enterprise: Building
};

const OfficePacks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [packs, setPacks] = useState<OfficePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedInterval, setSelectedInterval] = useState<string>('all');
  const [showBulkDiscount, setShowBulkDiscount] = useState(false);
  const [companySize, setCompanySize] = useState<string>('');
  const [employeeCount, setEmployeeCount] = useState<number>(10);

  useEffect(() => {
    // Check if company size is saved
    const saved = localStorage.getItem('company_size');
    if (saved) setCompanySize(saved);
    fetchPacks();
  }, []);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching office packs...');
      const data = await serviceService.getPublicOfficePacks();
      console.log('Fetched packs:', data);
      
      // Only show active packs
      const activePacks = data.filter(p => p.status === 'active');
      setPacks(activePacks);
    } catch (error) {
      console.error('Error fetching office packs:', error);
      setError('Failed to load office packs');
      toast({
        title: 'Error',
        description: 'Failed to load office packs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddToCart = (e: React.MouseEvent, pack: OfficePack) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: pack.id,
      name: pack.name,
      price: pack.price,
      quantity: 1,
      unit: 'pack',
      image: pack.image
    });
    
    toast({
      title: 'Added to cart!',
      description: `${pack.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleViewDetails = (packId: string) => {
    navigate(`/office-packs/${packId}`);
  };

  // Filter packs
  const filteredPacks = packs.filter(pack => {
    const sizeMatch = selectedSize === 'all' || pack.size === selectedSize;
    const intervalMatch = selectedInterval === 'all' || pack.interval === selectedInterval;
    return sizeMatch && intervalMatch;
  });

  // Calculate total savings
  const totalSavings = packs.reduce((sum, pack) => sum + (pack.savings || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PackCardSkeleton key={i} />
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
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Animated office elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <Briefcase className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <Building2 className="w-24 h-24 text-white" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float-slow">
            <Boxes className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Company size selector */}
            <div className="mb-8 max-w-md mx-auto">
              <div className="flex gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-none px-3 py-1">
                  <Users className="w-3 h-3 mr-1" />
                  For teams of all sizes
                </Badge>
              </div>
              <select
                value={companySize}
                onChange={(e) => {
                  setCompanySize(e.target.value);
                  localStorage.setItem('company_size', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="" className="bg-slate-700">Select your company size</option>
                <option value="1-5" className="bg-slate-700">1-5 employees</option>
                <option value="6-15" className="bg-slate-700">6-15 employees</option>
                <option value="16-30" className="bg-slate-700">16-30 employees</option>
                <option value="31-50" className="bg-slate-700">31-50 employees</option>
                <option value="50+" className="bg-slate-700">50+ employees</option>
              </select>
            </div>

            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Briefcase className="w-6 h-6" />
                <span className="text-lg font-medium">Office Solutions</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Office{' '}
              <span className="text-blue-300">Packs</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Streamline your office supplies. Save time and money with curated packs for teams of all sizes.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Package className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">{packs.length}</p>
                <p className="text-sm text-white/80">Curated Packs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Percent className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">MK {totalSavings.toLocaleString()}+</p>
                <p className="text-sm text-white/80">Potential Savings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Building className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-white/80">Companies Served</p>
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
                  onClick={fetchPacks}
                  className="ml-auto"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Percent className="w-7 h-7 text-blue-600" />
              </div>
              <p className="font-semibold">Bulk Savings</p>
              <p className="text-xs text-muted-foreground mt-1">Save up to 30%</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold">Free Delivery</p>
              <p className="text-xs text-muted-foreground mt-1">On all office packs</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-7 h-7 text-purple-600" />
              </div>
              <p className="font-semibold">Auto-Reorder</p>
              <p className="text-xs text-muted-foreground mt-1">Never run out</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-7 h-7 text-orange-600" />
              </div>
              <p className="font-semibold">Custom Quotes</p>
              <p className="text-xs text-muted-foreground mt-1">For large teams</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Office Packs</h2>
              <p className="text-sm text-muted-foreground">Curated for every team size</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedSize === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedSize('all')}
              className="rounded-full gap-2"
            >
              <Boxes className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={selectedSize === 'small' ? 'default' : 'outline'}
              onClick={() => setSelectedSize('small')}
              className="rounded-full gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Small (1-5)
            </Button>
            <Button
              variant={selectedSize === 'medium' ? 'default' : 'outline'}
              onClick={() => setSelectedSize('medium')}
              className="rounded-full gap-2"
            >
              <Users className="w-4 h-4" />
              Medium (6-15)
            </Button>
            <Button
              variant={selectedSize === 'large' ? 'default' : 'outline'}
              onClick={() => setSelectedSize('large')}
              className="rounded-full gap-2"
            >
              <Users2 className="w-4 h-4" />
              Large (16-30)
            </Button>
            <Button
              variant={selectedSize === 'enterprise' ? 'default' : 'outline'}
              onClick={() => setSelectedSize('enterprise')}
              className="rounded-full gap-2"
            >
              <Building className="w-4 h-4" />
              Enterprise (30+)
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-4 py-2 gap-2">
              <Calendar className="w-4 h-4" />
              Filter by interval:
            </Badge>
            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Intervals</option>
              <option value="one-time">One-Time</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredPacks.length} office packs
          </p>
        </div>

        {/* Office Packs Grid */}
        {filteredPacks.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No packs found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
            <Button onClick={() => {
              setSelectedSize('all');
              setSelectedInterval('all');
            }} variant="outline" className="rounded-full">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPacks.map((pack, index) => {
              const Icon = sizeIcons[pack.size as keyof typeof sizeIcons] || Package;
              return (
                <Card
                  key={pack.id}
                  className={`relative group hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in overflow-hidden cursor-pointer ${
                    pack.recommended ? 'border-2 border-blue-500' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleViewDetails(pack.id)}
                >
                  {/* Recommended badge */}
                  {pack.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none px-4 py-1 shadow-lg">
                        <Crown className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  )}

                  {/* Popularity badge */}
                  {pack.popularity && pack.popularity > 90 && !pack.recommended && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-lg">
                        <Zap className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  {/* Package Image */}
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={getImageUrl(pack.image)}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 text-blue-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {pack.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{pack.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Team size */}
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">Team size:</span>
                      <span>{pack.teamSize}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-primary">
                        MK {pack.price.toLocaleString()}
                      </span>
                      {pack.interval !== 'one-time' && (
                        <span className="text-sm text-muted-foreground">/{pack.interval}</span>
                      )}
                      {pack.originalPrice && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            MK {pack.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-green-500 text-white border-none">
                            <BadgePercent className="w-3 h-3 mr-1" />
                            Save {pack.discount}%
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Items count */}
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>{pack.items} items included</span>
                    </div>

                    {/* What's included preview */}
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        Includes:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {pack.includes && pack.includes.slice(0, 4).map((item, i) => (
                          <Badge key={i} variant="outline" className="bg-muted/30 text-xs">
                            {item}
                          </Badge>
                        ))}
                        {pack.includes && pack.includes.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{pack.includes.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {pack.features && pack.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-11 gap-2"
                      onClick={(e) => handleAddToCart(e, pack)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {pack.interval === 'one-time' ? 'Order Now' : 'Subscribe'}
                    </Button>
                    
                    {pack.size === 'enterprise' && (
                      <Button variant="outline" className="w-full gap-2">
                        <Mail className="w-4 h-4" />
                        Request Custom Quote
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
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
        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default OfficePacks;