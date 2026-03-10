import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, Coffee, Clock, Calendar,
  ShoppingBag, Truck, Award, Sparkles, ChevronRight,
  CheckCircle, Percent, Heart, Star, Zap,
  Laptop, PenTool, Mail, Phone, Users,
  CreditCard, RefreshCw, Pizza, Dumbbell,
  Headphones, Globe, Moon, Sun, Backpack,
  Wallet, GraduationCap as GradIcon, BookMarked,
  Library, Notebook, Pen, Pencil, Eraser,
  Ruler, Scissors, Paperclip, Folder,
  FileText, ClipboardList, ClipboardCheck,
  Target, Trophy, Medal, Crown, Gem,
  Clock3, Timer, AlarmClock, Hourglass,
  ChefHat, Sandwich, Apple, Milk, Egg,
  Beef, Fish, Salad, Wheat, Droplets,
  Wifi, Tv, Speaker, Gamepad2, Music,
  Smartphone, Tablet, Laptop2, Monitor,
  PartyPopper, Cake, Gift, Candy,
  Copy, Tag, Package, Loader2, AlertCircle,
  Eye
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { serviceService } from '@/services/serviceService';
import type { StudentPack } from '@/types/service.types';

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

// Lifestyle icons mapping
const lifestyleIcons = {
  budget: Backpack,
  standard: BookOpen,
  premium: Crown,
  international: Globe
};

const StudentPacks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [packs, setPacks] = useState<StudentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLifestyle, setSelectedLifestyle] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [studentId, setStudentId] = useState('');
  const [verified, setVerified] = useState(false);
  const [showPartyMode, setShowPartyMode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if student is verified
    const saved = localStorage.getItem('student_verified');
    if (saved) setVerified(true);
    fetchPacks();
  }, []);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching student packs...');
      const data = await serviceService.getPublicStudentPacks();
      console.log('Fetched packs:', data);
      
      // Only show active packs
      const activePacks = data.filter(p => p.status === 'active');
      setPacks(activePacks);
    } catch (error) {
      console.error('Error fetching student packs:', error);
      setError('Failed to load student packs');
      toast({
        title: 'Error',
        description: 'Failed to load student packs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddToCart = (e: React.MouseEvent, pack: StudentPack) => {
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
    navigate(`/student-packs/${packId}`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: 'Copied!',
      description: 'Discount code copied to clipboard',
      duration: 2000,
    });
  };

  // Filter packs
  const filteredPacks = packs.filter(pack => {
    const lifestyleMatch = selectedLifestyle === 'all' || pack.lifestyle === selectedLifestyle;
    const durationMatch = selectedDuration === 'all' || pack.duration === selectedDuration;
    return lifestyleMatch && durationMatch;
  });

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 overflow-hidden">
        {/* Animated student icons */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <GraduationCap className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <BookOpen className="w-24 h-24 text-white" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-float-slow">
            <Laptop className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Party mode toggle */}
        <button
          onClick={() => setShowPartyMode(!showPartyMode)}
          className="absolute top-20 right-4 z-20 bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors border border-white/30"
        >
          {showPartyMode ? (
            <PartyPopper className="w-6 h-6 text-yellow-300" />
          ) : (
            <GraduationCap className="w-6 h-6 text-white" />
          )}
        </button>

        <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Student ID verification */}
            <div className="mb-8 max-w-md mx-auto">
              {!verified ? (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter student ID to verify"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/70"
                  />
                  <Button
                    onClick={() => {
                      if (studentId.length > 3) {
                        setVerified(true);
                        localStorage.setItem('student_verified', 'true');
                        toast({
                          title: 'Verified!',
                          description: 'Student ID verified successfully',
                          duration: 3000,
                        });
                      }
                    }}
                    className="bg-white text-purple-600 hover:bg-white/90"
                  >
                    Verify
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4" />
                  <span>Student Verified!</span>
                  <GraduationCap className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="relative mb-8">
              <div className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 ${
                showPartyMode ? 'animate-bounce' : ''
              }`}>
                {showPartyMode ? (
                  <>
                    <PartyPopper className="w-6 h-6" />
                    <span className="text-lg font-medium">Party Mode ON!</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-6 h-6" />
                    <span className="text-lg font-medium">Student Deals</span>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Student{' '}
              <span className="text-yellow-300">Packs</span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Fuel your studies without breaking the bank. Curated packs for students, by students.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Package className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">{packs.length}</p>
                <p className="text-sm text-white/80">Student Packs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Users className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">5000+</p>
                <p className="text-sm text-white/80">Happy Students</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Percent className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">MK 100k+</p>
                <p className="text-sm text-white/80">Avg. Savings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Truck className="w-8 h-8 text-white mb-3 mx-auto" />
                <p className="text-2xl font-bold">Free</p>
                <p className="text-sm text-white/80">Campus Delivery</p>
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

        {/* Student Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Percent className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-semibold">Student Discounts</p>
              <p className="text-xs text-muted-foreground mt-1">Up to 30% off</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-blue-600" />
              </div>
              <p className="font-semibold">Campus Delivery</p>
              <p className="text-xs text-muted-foreground mt-1">Free to dorms</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <p className="font-semibold">Flexible Schedule</p>
              <p className="text-xs text-muted-foreground mt-1">Around your classes</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <p className="font-semibold">Group Orders</p>
              <p className="text-xs text-muted-foreground mt-1">Share with roommates</p>
            </CardContent>
          </Card>
        </div>

        {/* Lifestyle Tabs */}
        <Tabs defaultValue="all" className="w-full mb-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <Backpack className="w-4 h-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="standard" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Standard
            </TabsTrigger>
            <TabsTrigger value="premium" className="gap-2">
              <Crown className="w-4 h-4" />
              Premium
            </TabsTrigger>
            <TabsTrigger value="international" className="gap-2">
              <Globe className="w-4 h-4" />
              International
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Duration Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            variant={selectedDuration === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedDuration('all')}
            className="rounded-full gap-2"
          >
            <Calendar className="w-4 h-4" />
            All Durations
          </Button>
          <Button
            variant={selectedDuration === 'weekly' ? 'default' : 'outline'}
            onClick={() => setSelectedDuration('weekly')}
            className="rounded-full gap-2"
          >
            <Clock className="w-4 h-4" />
            Weekly
          </Button>
          <Button
            variant={selectedDuration === 'monthly' ? 'default' : 'outline'}
            onClick={() => setSelectedDuration('monthly')}
            className="rounded-full gap-2"
          >
            <Calendar className="w-4 h-4" />
            Monthly
          </Button>
          <Button
            variant={selectedDuration === 'semester' ? 'default' : 'outline'}
            onClick={() => setSelectedDuration('semester')}
            className="rounded-full gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Semester
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center mb-6">
          Showing {filteredPacks.length} student packs
        </p>

        {/* Student Packs Grid */}
        {filteredPacks.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border-2 border-dashed border-border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No packs found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
            <Button onClick={() => {
              setSelectedLifestyle('all');
              setSelectedDuration('all');
            }} variant="outline" className="rounded-full">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPacks.map((pack, index) => {
              const Icon = lifestyleIcons[pack.lifestyle as keyof typeof lifestyleIcons] || Package;
              return (
                <Card
                  key={pack.id}
                  className={`relative group hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in overflow-hidden cursor-pointer ${
                    pack.recommended ? 'border-2 border-purple-500' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleViewDetails(pack.id)}
                >
                  {/* Student exclusive badge */}
                  {pack.studentType === 'international' && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none shadow-lg">
                        <Globe className="w-3 h-3 mr-1" />
                        International
                      </Badge>
                    </div>
                  )}

                  {/* Popularity badge */}
                  {pack.popularity && pack.popularity > 95 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-lg">
                        <Zap className="w-3 h-3 mr-1" />
                        Student Favorite
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
                      <div className={`w-14 h-14 rounded-xl ${
                        pack.lifestyle === 'budget' ? 'bg-green-50 dark:bg-green-950/30' :
                        pack.lifestyle === 'standard' ? 'bg-blue-50 dark:bg-blue-950/30' :
                        pack.lifestyle === 'premium' ? 'bg-purple-50 dark:bg-purple-950/30' :
                        'bg-amber-50 dark:bg-amber-950/30'
                      } flex items-center justify-center shrink-0`}>
                        <Icon className={`w-7 h-7 ${
                          pack.lifestyle === 'budget' ? 'text-green-600' :
                          pack.lifestyle === 'standard' ? 'text-blue-600' :
                          pack.lifestyle === 'premium' ? 'text-purple-600' :
                          'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{pack.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{pack.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-primary">
                        MK {pack.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{pack.duration === 'semester' ? 'semester' : pack.duration}
                      </span>
                      {pack.originalPrice && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            MK {pack.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-green-500 text-white border-none">
                            <Percent className="w-3 h-3 mr-1" />
                            Save {pack.discount}%
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Items count */}
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-lg">
                      <Package className="w-4 h-4 text-primary" />
                      <span>{pack.items} items included</span>
                    </div>

                    {/* What's included preview */}
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        Popular items:
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

                  <CardFooter onClick={(e) => e.stopPropagation()}>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white h-11 gap-2"
                      onClick={(e) => handleAddToCart(e, pack)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {verified ? 'Get Student Price' : 'Verify to Unlock Price'}
                    </Button>
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

export default StudentPacks;