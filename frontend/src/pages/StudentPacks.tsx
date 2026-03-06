// src/pages/StudentPacks.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Copy,
  Tag,
  Package
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

interface StudentPack {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: 'weekly' | 'monthly' | 'semester';
  lifestyle: 'budget' | 'standard' | 'premium' | 'international';
  items: number;
  popularity: number;
  savings: number;
  features: string[];
  includes: string[];
  image: string;
  color: string;
  bgColor: string;
  icon: any;
  recommended?: boolean;
  studentType: 'local' | 'international' | 'all';
  discount?: number;
}

interface StudentDeal {
  id: string;
  name: string;
  discount: number;
  code: string;
  expiry: string;
  image: string;
  icon: any;
  used: number;
  limit: number;
}

const StudentPacks = () => {
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
  }, []);

  // Student packs data with professional icons
  const studentPacks: StudentPack[] = [
    {
      id: 'sp1',
      name: 'Budget Student Starter',
      description: 'Everything you need for the semester on a budget',
      price: 25000,
      originalPrice: 32000,
      duration: 'monthly',
      lifestyle: 'budget',
      items: 15,
      popularity: 98,
      savings: 7000,
      discount: 22,
      features: [
        'Free delivery to campus',
        'Flexible pause anytime',
        'Student budget friendly',
        'No commitment',
        'Easy cancellation'
      ],
      includes: [
        'Instant noodles (10 packs)',
        'Rice (2kg)',
        'Cooking oil (1L)',
        'Eggs (15pcs)',
        'Bread (2 loaves)',
        'Milk (2L)',
        'Sugar (1kg)',
        'Tea/Coffee',
        'Snacks (5 packs)'
      ],
      image: '🎒',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      icon: Backpack,
      recommended: true,
      studentType: 'all'
    },
    {
      id: 'sp2',
      name: 'Standard Student Living',
      description: 'Balanced meals and study essentials',
      price: 45000,
      originalPrice: 55000,
      duration: 'monthly',
      lifestyle: 'standard',
      items: 25,
      popularity: 95,
      savings: 10000,
      discount: 18,
      features: [
        'Free campus delivery',
        'Study snacks included',
        'Weekly fresh items',
        'Priority support',
        'Meal planning guide'
      ],
      includes: [
        'Rice (5kg)',
        'Cooking oil (2L)',
        'Eggs (30pcs)',
        'Fresh vegetables',
        'Fruits',
        'Bread (4 loaves)',
        'Milk (4L)',
        'Sugar (2kg)',
        'Pasta & sauces',
        'Study snacks',
        'Instant coffee',
        'Cereal'
      ],
      image: '📚',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      icon: BookOpen,
      studentType: 'all'
    },
    {
      id: 'sp3',
      name: 'Premium Student Package',
      description: 'For students who want the best',
      price: 75000,
      originalPrice: 92000,
      duration: 'monthly',
      lifestyle: 'premium',
      items: 35,
      popularity: 88,
      savings: 17000,
      discount: 18,
      features: [
        'Free express delivery',
        'Premium study snacks',
        'Energy drinks included',
        'Late night study pack',
        'Priority support',
        'Health tracking'
      ],
      includes: [
        'Premium rice (5kg)',
        'Olive oil (1L)',
        'Free-range eggs (30pcs)',
        'Organic vegetables',
        'Premium fruits',
        'Artisan bread',
        'Organic milk',
        'Specialty coffee',
        'Energy drinks (6 cans)',
        'Protein bars',
        'Healthy snacks',
        'Nuts & dried fruits',
        'Smoothie pack'
      ],
      image: '🌟',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      icon: Crown,
      studentType: 'all'
    },
    {
      id: 'sp4',
      name: 'International Student Pack',
      description: 'Familiar foods for international students',
      price: 65000,
      originalPrice: 80000,
      duration: 'monthly',
      lifestyle: 'international',
      items: 30,
      popularity: 92,
      savings: 15000,
      discount: 19,
      features: [
        'International foods',
        'Halal options available',
        'Vegetarian options',
        'Cultural snacks',
        'English instructions',
        'Recipe cards'
      ],
      includes: [
        'Rice (5kg)',
        'Cooking oil',
        'Halal chicken',
        'International spices',
        'Pasta & sauces',
        'Canned goods',
        'Breakfast cereals',
        'Snacks from home',
        'Tea/coffee',
        'Biscuits',
        'Instant meals'
      ],
      image: '🌍',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      icon: Globe,
      studentType: 'international'
    },
    {
      id: 'sp5',
      name: 'Exam Cram Survival Kit',
      description: 'Stay fueled during exam week',
      price: 18000,
      originalPrice: 23000,
      duration: 'weekly',
      lifestyle: 'standard',
      items: 12,
      popularity: 99,
      savings: 5000,
      discount: 22,
      features: [
        'Next-day delivery',
        'Exam week special',
        'Energy boosters',
        'Late night study',
        'Brain foods included'
      ],
      includes: [
        'Energy drinks (6 cans)',
        'Coffee (premium)',
        'Study snacks (10 packs)',
        'Instant noodles',
        'Protein bars',
        'Chocolate',
        'Nuts',
        'Fruit juice',
        'Biscuits',
        'Gum/mints'
      ],
      image: '📝',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      icon: Target,
      studentType: 'all'
    },
    {
      id: 'sp6',
      name: 'Semester Meal Plan',
      description: 'Full semester covered, maximum savings',
      price: 180000,
      originalPrice: 240000,
      duration: 'semester',
      lifestyle: 'standard',
      items: 120,
      popularity: 94,
      savings: 60000,
      discount: 25,
      features: [
        'Biggest savings',
        'Semester-long supply',
        'Monthly deliveries',
        'Adjustable quantities',
        'Free storage containers',
        'Meal planning app'
      ],
      includes: [
        'Rice (20kg)',
        'Cooking oil (5L)',
        'Eggs (120pcs)',
        'Monthly vegetables',
        'Monthly fruits',
        'Flour (5kg)',
        'Sugar (5kg)',
        'Pasta (5kg)',
        'Canned goods bulk',
        'Snacks bulk',
        'Cleaning supplies',
        'Storage containers'
      ],
      image: '📅',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      icon: Calendar,
      studentType: 'all'
    }
  ];

  // Student exclusive deals with icons
  const studentDeals: StudentDeal[] = [
    {
      id: 'sd1',
      name: 'First Order Discount',
      discount: 20,
      code: 'STUDENT20',
      expiry: '2025-03-30',
      image: '🎓',
      icon: GraduationCap,
      used: 1234,
      limit: 2000
    },
    {
      id: 'sd2',
      name: 'Refer a Friend',
      discount: 15,
      code: 'FRIEND15',
      expiry: '2025-04-15',
      image: '👥',
      icon: Users,
      used: 567,
      limit: 1000
    },
    {
      id: 'sd3',
      name: 'Exam Week Special',
      discount: 25,
      code: 'EXAM25',
      expiry: '2025-05-10',
      image: '📚',
      icon: BookOpen,
      used: 892,
      limit: 1500
    },
    {
      id: 'sd4',
      name: 'Group Booking',
      discount: 30,
      code: 'GROUP30',
      expiry: '2025-06-01',
      image: '🏠',
      icon: Users,
      used: 234,
      limit: 500
    }
  ];

  // Filter packs
  const filteredPacks = studentPacks.filter(pack => {
    const lifestyleMatch = selectedLifestyle === 'all' || pack.lifestyle === selectedLifestyle;
    const durationMatch = selectedDuration === 'all' || pack.duration === selectedDuration;
    return lifestyleMatch && durationMatch;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
      <Header />
      
      {/* Hero Section with Student Vibes */}
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
                <p className="text-2xl font-bold">{studentPacks.length}</p>
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

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Student Benefits Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </section>

        {/* Lifestyle Tabs */}
        <section>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-8">
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

            {['all', 'budget', 'standard', 'premium', 'international'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Card className="border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                        {tab === 'budget' && <Backpack className="w-6 h-6 text-green-600" />}
                        {tab === 'standard' && <BookOpen className="w-6 h-6 text-blue-600" />}
                        {tab === 'premium' && <Crown className="w-6 h-6 text-purple-600" />}
                        {tab === 'international' && <Globe className="w-6 h-6 text-amber-600" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-semibold capitalize">{tab === 'all' ? 'Featured' : tab} Packs</h3>
                        <p className="text-sm text-muted-foreground">
                          {tab === 'budget' && 'Best value for money'}
                          {tab === 'standard' && 'Balanced and popular'}
                          {tab === 'premium' && 'Top quality essentials'}
                          {tab === 'international' && 'Foods from home'}
                          {tab === 'all' && 'Most popular student packs'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {studentPacks
                        .filter(p => tab === 'all' || p.lifestyle === tab)
                        .slice(0, 4)
                        .map(pack => {
                          const Icon = pack.icon;
                          return (
                            <Card key={pack.id} className="relative hover:shadow-lg transition-all">
                              <CardContent className="p-4">
                                <Badge className="absolute top-2 right-2 bg-primary text-white border-none">
                                  {pack.popularity}%
                                </Badge>
                                <div className={`w-12 h-12 rounded-full ${pack.bgColor} flex items-center justify-center mb-3`}>
                                  <Icon className={`w-6 h-6 ${pack.color}`} />
                                </div>
                                <h4 className="font-semibold text-sm mb-1">{pack.name}</h4>
                                <p className="text-xs text-muted-foreground mb-2">{pack.items} items</p>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-lg font-bold">MK {pack.price.toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground">/{pack.duration}</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Duration Filters */}
        <section>
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
        </section>

        {/* Student Packs Grid */}
        <section>
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
                const Icon = pack.icon;
                return (
                  <Card
                    key={pack.id}
                    className={`relative group hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in overflow-hidden ${
                      pack.recommended ? 'border-2 border-purple-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
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
                    {pack.popularity > 95 && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-lg">
                          <Zap className="w-3 h-3 mr-1" />
                          Student Favorite
                        </Badge>
                      </div>
                    )}

                    {/* Background pattern */}
                    <div className={`absolute inset-0 opacity-5 ${pack.bgColor}`}>
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, ${pack.color.replace('text-', '')} 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                      }} />
                    </div>

                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className={`w-14 h-14 rounded-xl ${pack.bgColor} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-7 h-7 ${pack.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{pack.name}</CardTitle>
                          <CardDescription>{pack.description}</CardDescription>
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
                          {pack.includes.slice(0, 4).map((item, i) => {
                            const ItemIcon = 
                              item.includes('Rice') ? Wheat :
                              item.includes('Eggs') ? Egg :
                              item.includes('Milk') ? Milk :
                              item.includes('Bread') ? Sandwich :
                              item.includes('Coffee') ? Coffee :
                              FileText;
                            return (
                              <Badge key={i} variant="outline" className="bg-muted/30 text-xs gap-1">
                                <ItemIcon className="w-3 h-3" />
                                {item}
                              </Badge>
                            );
                          })}
                          {pack.includes.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{pack.includes.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2">
                        {pack.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white h-11 gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        {verified ? 'Get Student Price' : 'Verify to Unlock Price'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Student Exclusive Deals Carousel */}
        <section>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Student Exclusive Deals
          </h2>

          <Carousel className="w-full">
            <CarouselContent>
              {studentDeals.map((deal) => {
                const Icon = deal.icon;
                const percentUsed = (deal.used / deal.limit) * 100;
                
                return (
                  <CarouselItem key={deal.id} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>
                          <Badge className="bg-yellow-400 text-purple-900 border-none">
                            {deal.discount}% OFF
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold mb-2">{deal.name}</h3>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="w-4 h-4" />
                            <span className="font-mono bg-white/20 px-2 py-1 rounded">{deal.code}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {new Date(deal.expiry).toLocaleDateString()}</span>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>{deal.used} used</span>
                              <span>{deal.limit} limit</span>
                            </div>
                            <Progress value={percentUsed} className="h-1.5 bg-white/20" />
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-white text-purple-600 hover:bg-white/90 gap-2"
                          onClick={() => handleCopyCode(deal.code)}
                        >
                          {copiedCode === deal.code ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </>
                          )}
                        </Button>
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

        {/* Student Life Tips */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-green-600" />
                Meal Prep Tips for Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Cook in bulk on Sundays for the week ahead</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Freeze portions for busy exam days</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Share packs with roommates to save more</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>Label everything with dates to avoid waste</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-orange-600" />
                Late Night Study Essentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Energy drinks (but don't overdo it!)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Healthy snacks for sustained energy</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Water bottle to stay hydrated</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>Take 5-minute breaks every hour</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Group Order Banner */}
        <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Order with Roommates, Save More!
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Combine orders with friends and unlock additional group discounts. Perfect for shared accommodation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 h-12 px-8 gap-2 text-base">
                <Users className="w-5 h-5" />
                Start Group Order
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 h-12 px-8 gap-2 text-base">
                <Phone className="w-5 h-5" />
                Learn More
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/20">
              {['10% extra off', 'Free delivery', 'Flexible split', 'Dedicated support'].map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Get Student Exclusive Offers
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to receive special deals, exam week specials, and student discounts
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="University email"
              className="rounded-full"
            />
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-8 gap-2">
              <Mail className="w-4 h-4" />
              Subscribe
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