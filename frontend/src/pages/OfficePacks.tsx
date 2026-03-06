// src/pages/OfficePacks.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Gem, Crown, Medal, Trophy, Rocket
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

interface OfficePack {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  interval: 'one-time' | 'weekly' | 'monthly';
  size: 'small' | 'medium' | 'large' | 'enterprise';
  teamSize: string;
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
  discount?: number;
  minQuantity?: number;
}

interface OfficeSupply {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  popular: boolean;
  icon: any;
}

const OfficePacks = () => {
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedInterval, setSelectedInterval] = useState<string>('all');
  const [showBulkDiscount, setShowBulkDiscount] = useState(false);
  const [companySize, setCompanySize] = useState<string>('');
  const [employeeCount, setEmployeeCount] = useState<number>(10);

  useEffect(() => {
    // Check if company size is saved
    const saved = localStorage.getItem('company_size');
    if (saved) setCompanySize(saved);
  }, []);

  // Office packs data with professional icons
  const officePacks: OfficePack[] = [
    {
      id: 'op1',
      name: 'Startup Essentials',
      description: 'Perfect for small teams and startups',
      price: 45000,
      originalPrice: 55000,
      interval: 'one-time',
      size: 'small',
      teamSize: '1-5 people',
      items: 25,
      popularity: 95,
      savings: 10000,
      discount: 18,
      features: [
        'Free delivery',
        '30-day guarantee',
        'Bulk pricing',
        'Reorder anytime',
        'Business receipt'
      ],
      includes: [
        'Coffee & tea (50 packs)',
        'Sugar & creamer',
        'Printer paper (5 reams)',
        'Pens (2 dozen)',
        'Notebooks (10)',
        'Paper clips',
        'Stapler & staples',
        'Sticky notes'
      ],
      image: '🚀',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      icon: Rocket,
      recommended: true
    },
    {
      id: 'op2',
      name: 'Growth Pack',
      description: 'For growing teams and departments',
      price: 95000,
      originalPrice: 115000,
      interval: 'monthly',
      size: 'medium',
      teamSize: '6-15 people',
      items: 45,
      popularity: 88,
      savings: 20000,
      discount: 17,
      features: [
        'Free delivery',
        'Monthly restock',
        'Flexible schedule',
        'Dedicated support',
        'Expense tracking'
      ],
      includes: [
        'Coffee & tea (100 packs)',
        'Sugar & creamer',
        'Printer paper (10 reams)',
        'Pens (4 dozen)',
        'Notebooks (20)',
        'Binders (10)',
        'File folders (50)',
        'Whiteboard markers',
        'Desk organizers',
        'Hand sanitizer'
      ],
      image: '📈',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      icon: TrendingUp
    },
    {
      id: 'op3',
      name: 'Enterprise Bundle',
      description: 'Complete office solution for large teams',
      price: 195000,
      originalPrice: 250000,
      interval: 'monthly',
      size: 'large',
      teamSize: '16-30 people',
      items: 75,
      popularity: 92,
      savings: 55000,
      discount: 22,
      features: [
        'Free delivery',
        'Weekly restock option',
        'Account manager',
        'Custom branding',
        'Priority support',
        'Inventory management'
      ],
      includes: [
        'Coffee & tea (200 packs)',
        'Sugar & creamer bulk',
        'Printer paper (20 reams)',
        'Pens (8 dozen)',
        'Notebooks (40)',
        'Professional binders',
        'File folders (100)',
        'Presentation materials',
        'Breakroom supplies',
        'Cleaning supplies',
        'First aid kit',
        'Customizable'
      ],
      image: '🏢',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      icon: Building
    },
    {
      id: 'op4',
      name: 'Corporate Plus',
      description: 'Custom solutions for large corporations',
      price: 350000,
      interval: 'monthly',
      size: 'enterprise',
      teamSize: '30+ people',
      items: 150,
      popularity: 85,
      savings: 85000,
      discount: 24,
      features: [
        'Custom quotes',
        'Dedicated account manager',
        'Branded supplies',
        'Weekly deliveries',
        'Inventory management',
        'Custom reporting',
        'API integration'
      ],
      includes: [
        'Fully customizable',
        'All office essentials',
        'Breakroom fully stocked',
        'Cleaning service supplies',
        'Custom branding available',
        'Bulk pricing',
        'Consolidated billing'
      ],
      image: '🏛️',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      icon: Building2
    },
    {
      id: 'op5',
      name: 'Breakroom Refill',
      description: 'Keep your breakroom stocked',
      price: 35000,
      originalPrice: 42000,
      interval: 'weekly',
      size: 'medium',
      teamSize: 'Any size',
      items: 20,
      popularity: 90,
      savings: 7000,
      discount: 17,
      features: [
        'Weekly delivery',
        'Flexible quantities',
        'Popular items',
        'Skip anytime',
        'Custom selections'
      ],
      includes: [
        'Coffee (2 packs)',
        'Tea assortment',
        'Sugar & sweeteners',
        'Coffee creamer',
        'Snacks (10 packs)',
        'Paper cups',
        'Stirrers',
        'Napkins'
      ],
      image: '☕',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      icon: Coffee
    },
    {
      id: 'op6',
      name: 'Print & Paper Pack',
      description: 'All your printing needs',
      price: 25000,
      originalPrice: 30000,
      interval: 'one-time',
      size: 'small',
      teamSize: '1-10 people',
      items: 15,
      popularity: 87,
      savings: 5000,
      discount: 17,
      features: [
        'Bulk paper pricing',
        'Toner compatible',
        'Free delivery',
        'Recycled options',
        'Eco-friendly'
      ],
      includes: [
        'Printer paper (5 reams)',
        'Premium paper (2 reams)',
        'Envelopes (50)',
        'Shipping labels',
        'Printer toner',
        'File folders',
        'Binders'
      ],
      image: '🖨️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      icon: Printer
    }
  ];

  // Individual office supplies with icons
  const popularSupplies: OfficeSupply[] = [
    { id: 'os1', name: 'Printer Paper A4', price: 4500, unit: 'Ream (500 sheets)', image: '📄', category: 'paper', popular: true, icon: FileText },
    { id: 'os2', name: 'Ballpoint Pens', price: 2500, unit: 'Box of 12', image: '✒️', category: 'writing', popular: true, icon: Pen },
    { id: 'os3', name: 'Coffee (500g)', price: 8500, unit: 'Bag', image: '☕', category: 'breakroom', popular: true, icon: Coffee },
    { id: 'os4', name: 'Sticky Notes', price: 1200, unit: 'Pack of 5', image: '📝', category: 'supplies', popular: true, icon: FileStack },
    { id: 'os5', name: 'File Folders', price: 3500, unit: 'Pack of 25', image: '📁', category: 'organization', popular: true, icon: Folder },
    { id: 'os6', name: 'Whiteboard Markers', price: 2800, unit: 'Set of 4', image: '🖍️', category: 'supplies', popular: true, icon: Highlighter }
  ];

  // Filter packs
  const filteredPacks = officePacks.filter(pack => {
    const sizeMatch = selectedSize === 'all' || pack.size === selectedSize;
    const intervalMatch = selectedInterval === 'all' || pack.interval === selectedInterval;
    return sizeMatch && intervalMatch;
  });

  // Calculate total savings
  const totalSavings = officePacks.reduce((sum, pack) => sum + (pack.savings || 0), 0);

  // Size icons mapping
  const sizeIcons = {
    small: UserPlus,
    medium: Users,
    large: Users2,
    enterprise: Building
  };

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
                <p className="text-2xl font-bold">{officePacks.length}</p>
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

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Benefits Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </section>

        {/* Filters */}
        <section>
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
        </section>

        {/* Office Packs Grid */}
        <section>
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
                const Icon = pack.icon;
                return (
                  <Card
                    key={pack.id}
                    className={`relative group hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in overflow-hidden ${
                      pack.recommended ? 'border-2 border-blue-500' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Recommended badge */}
                    {pack.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none px-4 py-1 shadow-lg">
                          <Crown className="w-3 h-3 mr-1" />
                          Recommended for Startups
                        </Badge>
                      </div>
                    )}

                    {/* Popularity badge */}
                    {pack.popularity > 90 && !pack.recommended && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-lg">
                          <Zap className="w-3 h-3 mr-1" />
                          Popular
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
                          <CardTitle className="text-xl flex items-center gap-2">
                            {pack.name}
                          </CardTitle>
                          <CardDescription>{pack.description}</CardDescription>
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

                      {/* What's included */}
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4" />
                          Includes:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {pack.includes.slice(0, 6).map((item, i) => {
                            const ItemIcon = 
                              item.includes('Coffee') ? Coffee :
                              item.includes('Paper') ? FileText :
                              item.includes('Pens') ? Pen :
                              item.includes('Folder') ? Folder :
                              FileStack;
                            return (
                              <Badge key={i} variant="outline" className="bg-muted/30 text-xs gap-1">
                                <ItemIcon className="w-3 h-3" />
                                {item}
                              </Badge>
                            );
                          })}
                          {pack.includes.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{pack.includes.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2">
                        {pack.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-11 gap-2">
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
        </section>

        {/* Popular Individual Supplies */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">Popular Individual Supplies</h2>
                <p className="text-sm text-muted-foreground">Frequently ordered items</p>
              </div>
            </div>
            <Link to="/products" className="group hidden sm:flex items-center text-primary hover:text-primary/80 transition-colors">
              View All
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {popularSupplies.map((item) => {
                const Icon = item.icon;
                return (
                  <CarouselItem key={item.id} className="basis-1/2 md:basis-1/3 lg:basis-1/6">
                    <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{item.unit}</p>
                        <p className="font-bold text-primary">MK {item.price.toLocaleString()}</p>
                        <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          Add
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

          {/* Mobile view all link */}
          <div className="flex sm:hidden justify-center mt-4">
            <Link to="/products">
              <Button variant="outline" size="sm" className="rounded-full">
                View All Supplies
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Bulk Discount Calculator */}
        <section className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-4">
                Bulk Discount Calculator
              </h2>
              <p className="text-muted-foreground mb-6">
                See how much you can save with our volume pricing. The more you order, the more you save.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Number of employees: {employeeCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={employeeCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEmployeeCount(val);
                      setShowBulkDiscount(val > 10);
                    }}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
                
                {showBulkDiscount && (
                  <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                          <Percent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-400">
                            You qualify for 15% bulk discount!
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                            Estimated yearly savings: MK 125,000
                          </p>
                          <Button size="sm" variant="link" className="text-green-700 dark:text-green-400 p-0 h-auto mt-2">
                            Apply discount
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[5, 10, 15, 20].map((percent) => (
                <Card key={percent} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-white">{percent}%</span>
                    </div>
                    <p className="font-semibold">{percent}+ employees</p>
                    <p className="text-xs text-muted-foreground mt-1">Volume discount</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Office Packs */}
        <section>
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Why Companies Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Save Time',
                desc: 'No more running out of supplies. We handle reordering automatically so you can focus on your business.'
              },
              {
                icon: TrendingUp,
                title: 'Save Money',
                desc: 'Bulk pricing and subscriptions save up to 30% compared to retail. Volume discounts for larger teams.'
              },
              {
                icon: Shield,
                title: 'Quality Guarantee',
                desc: 'All products are office-grade quality. 100% satisfaction guaranteed or your money back.'
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="text-center hover:shadow-lg transition-all">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Corporate Accounts */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Need a Corporate Account?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Get consolidated billing, dedicated account manager, custom reporting, and API access for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 h-12 px-8 gap-2 text-base">
                <Phone className="w-5 h-5" />
                Talk to Sales
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 h-12 px-8 gap-2 text-base">
                <Mail className="w-5 h-5" />
                Request Info
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/20">
              {['Net 30 Terms', 'Bulk Pricing', 'Dedicated Support', 'Custom Reports'].map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Get Office Supply Updates
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to receive exclusive business offers and bulk pricing updates
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Work email"
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-8 gap-2">
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

export default OfficePacks;