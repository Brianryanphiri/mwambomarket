// src/components/store/BrandPartners.tsx
import { useState } from 'react';
import { 
  // Existing icons
  Award, Star, Truck, Shield, Heart, Handshake,
  ChevronRight, Sparkles, Users,
  ThumbsUp, Clock, Leaf, Droplets, Wheat,
  Coffee, Milk, Egg, Beef, Apple,
  MapPin, Package, Box, Navigation, Warehouse,
  // New professional icons
  Building2, Factory, Tractor, Refrigerator,
  Bot, ShieldCheck, Gem, Crown,
  BadgeCheck, Medal, Trophy, Rocket,
  Globe2, Trees, Recycle, Wind, Sun,
  ChefHat, Utensils, Cake, Cookie,
  Phone, Mail, Linkedin, Twitter,
  FileText, ClipboardCheck, Scale,
  BarChart3, TrendingUp, Target,
  // Additional professional icons
  Sprout, WheatIcon, Grape, Citrus, Banana,
  Fish, Shell, Thermometer, Snowflake,
  Container, TruckIcon, Bike, Plane,
  HardHat, Wrench, Settings2, Cpu,
  CreditCard, Wallet, Lock, Key,
  Store, ShoppingBag, Gift, GemIcon,
  ThumbsUpIcon, CheckCircle, XCircle,
  Calendar, Clock4, Timer, Hourglass,
  Building, Home, Landmark, TreePine,
  Flower2, SunMedium, CloudSun, Moon,
  Smartphone,
  Cloud,
  Bird,
  Mountain,
  Droplet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Partner {
  id: string;
  name: string;
  icon: any;
  description: string;
  since: string;
  products?: string[];
  services?: string[];
  location: string;
  certification?: string[];
  featured: boolean;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  category: 'farm' | 'dairy' | 'poultry' | 'milling' | 'beverage' | 'meat' | 'oil' | 'fruit' | 'packaging' | 'logistics' | 'warehousing' | 'technology';
  color: string;
  bgColor: string;
  website?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
}

const BrandPartners = () => {
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const partners: Partner[] = [
    // 🌾 FARMERS & PRODUCERS
    {
      id: 'farmer-1',
      name: 'Dedza Farmers Co-op',
      icon: Sprout,
      description: 'Fresh vegetables and grains from local farmers',
      since: '2020',
      products: ['Tomatoes', 'Onions', 'Maize', 'Beans'],
      location: 'Dedza, Malawi',
      certification: ['Organic Certified', 'Fair Trade'],
      featured: true,
      tier: 'gold',
      category: 'farm',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      website: 'https://dedzafarmers.coop',
      contact: {
        phone: '+265 999 123 001',
        email: 'info@dedzafarmers.coop'
      }
    },
    {
      id: 'farmer-2',
      name: 'Thyolo Tea Estate',
      icon: Flower2,
      description: 'Premium tea and herbs from Thyolo highlands',
      since: '2015',
      products: ['Black Tea', 'Green Tea', 'Herbal Tea', 'Honey'],
      location: 'Thyolo, Malawi',
      certification: ['Rainforest Alliance', 'UTZ Certified'],
      featured: true,
      tier: 'platinum',
      category: 'farm',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'farmer-3',
      name: 'Mulanje Mountain Farmers',
      icon: Mountain,
      description: 'High-altitude vegetables and herbs',
      since: '2018',
      products: ['Potatoes', 'Cabbages', 'Herbs', 'Strawberries'],
      location: 'Mulanje, Malawi',
      certification: ['Mountain Grown'],
      featured: false,
      tier: 'silver',
      category: 'farm',
      color: 'text-lime-600',
      bgColor: 'bg-lime-50'
    },

    // 🥛 DAIRY
    {
      id: 'dairy-1',
      name: 'Lilongwe Dairy',
      icon: Milk,
      description: 'Fresh milk, yogurt, and cheese products',
      since: '2019',
      products: ['Fresh Milk', 'Yogurt', 'Cheese', 'Cream'],
      location: 'Lilongwe, Malawi',
      certification: ['ISO 22000', 'HACCP'],
      featured: true,
      tier: 'gold',
      category: 'dairy',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'dairy-2',
      name: 'Mzuzu Creamery',
      icon: ChefHat,
      description: 'Artisanal cheeses and dairy products',
      since: '2021',
      products: ['Aged Cheese', 'Butter', 'Cream Cheese', 'Ghee'],
      location: 'Mzuzu, Malawi',
      certification: ['Artisanal Producer'],
      featured: false,
      tier: 'silver',
      category: 'dairy',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },

    // 🥚 POULTRY
    {
      id: 'poultry-1',
      name: 'Zomba Free Range',
      icon: Egg,
      description: 'Free-range eggs and chicken',
      since: '2021',
      products: ['Farm Eggs', 'Whole Chicken', 'Chicken Pieces'],
      location: 'Zomba, Malawi',
      certification: ['Free Range Certified', 'Animal Welfare Approved'],
      featured: true,
      tier: 'gold',
      category: 'poultry',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'poultry-2',
      name: 'Central Poultry Farms',
      icon: Bird,
      description: 'Broiler chickens and processed poultry',
      since: '2017',
      products: ['Broilers', 'Chicken Livers', 'Chicken Feet'],
      location: 'Lilongwe, Malawi',
      certification: ['HACCP Certified'],
      featured: false,
      tier: 'silver',
      category: 'poultry',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },

    // 🌾 MILLING
    {
      id: 'milling-1',
      name: 'Sidik Milling',
      icon: Factory,
      description: 'Quality maize flour and rice',
      since: '2018',
      products: ['Maize Flour', 'Rice', 'Flour Mixes'],
      location: 'Lilongwe, Malawi',
      certification: ['ISO 9001'],
      featured: false,
      tier: 'silver',
      category: 'milling',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'milling-2',
      name: 'Grain Processors Ltd',
      icon: Wheat,
      description: 'Bulk grain milling and processing',
      since: '2015',
      products: ['Wheat Flour', 'Semolina', 'Bran'],
      location: 'Blantyre, Malawi',
      certification: ['ISO 22000'],
      featured: false,
      tier: 'bronze',
      category: 'milling',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },

    // ☕ BEVERAGE
    {
      id: 'beverage-1',
      name: 'Malawi Tea Co.',
      icon: Coffee,
      description: 'Premium teas and coffee',
      since: '2020',
      products: ['Black Tea', 'Green Tea', 'Coffee Beans'],
      location: 'Mulanje, Malawi',
      certification: ['Rainforest Alliance', 'Organic'],
      featured: true,
      tier: 'platinum',
      category: 'beverage',
      color: 'text-amber-800',
      bgColor: 'bg-amber-100'
    },
    {
      id: 'beverage-2',
      name: 'Thirst Quenchers',
      icon: Droplet,
      description: 'Soft drinks and bottled water',
      since: '2019',
      products: ['Sodas', 'Juices', 'Bottled Water'],
      location: 'Blantyre, Malawi',
      certification: ['FDA Approved'],
      featured: false,
      tier: 'silver',
      category: 'beverage',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },

    // 🥩 MEAT
    {
      id: 'meat-1',
      name: 'Malawi Meat Processors',
      icon: Beef,
      description: 'Quality beef and pork products',
      since: '2019',
      products: ['Beef Cuts', 'Pork', 'Sausages', 'Mince'],
      location: 'Lilongwe, Malawi',
      certification: ['HACCP', 'Halal Certified'],
      featured: true,
      tier: 'gold',
      category: 'meat',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'meat-2',
      name: 'Butchery Direct',
      icon: Utensils,
      description: 'Fresh and processed meats',
      since: '2020',
      products: ['Steaks', 'Chops', 'Mince', 'Burgers'],
      location: 'Mzuzu, Malawi',
      featured: false,
      tier: 'bronze',
      category: 'meat',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },

    // 🫒 OIL
    {
      id: 'oil-1',
      name: 'Sunfoil Malawi',
      icon: Droplets,
      description: 'Cooking oils and fats',
      since: '2017',
      products: ['Cooking Oil', 'Margarine', 'Shortening'],
      location: 'Blantyre, Malawi',
      certification: ['ISO 22000'],
      featured: false,
      tier: 'silver',
      category: 'oil',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },

    // 🍎 FRUIT
    {
      id: 'fruit-1',
      name: 'Thyolo Fruits',
      icon: Apple,
      description: 'Fresh fruits from Thyolo',
      since: '2021',
      products: ['Bananas', 'Oranges', 'Avocados', 'Pineapples'],
      location: 'Thyolo, Malawi',
      certification: ['Local Grower', 'GAP Certified'],
      featured: false,
      tier: 'bronze',
      category: 'fruit',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 'fruit-2',
      name: 'Citrus Growers Association',
      icon: Citrus,
      description: 'Premium citrus fruits',
      since: '2016',
      products: ['Oranges', 'Lemons', 'Grapefruit', 'Tangerines'],
      location: 'Salima, Malawi',
      certification: ['Export Quality'],
      featured: true,
      tier: 'gold',
      category: 'fruit',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },

    // 📦 PACKAGING PARTNERS
    {
      id: 'packaging-1',
      name: 'EcoPack Malawi',
      icon: Recycle,
      description: 'Sustainable packaging solutions',
      since: '2019',
      services: ['Biodegradable boxes', 'Paper bags', 'Compostable containers'],
      location: 'Lilongwe, Malawi',
      certification: ['FSC Certified', 'Zero Waste'],
      featured: true,
      tier: 'gold',
      category: 'packaging',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'packaging-2',
      name: 'PlastiCorp Ltd',
      icon: Package,
      description: 'Food-grade plastic containers',
      since: '2016',
      services: ['Plastic containers', 'Bottles', 'Food trays'],
      location: 'Blantyre, Malawi',
      certification: ['Food Grade Certified'],
      featured: false,
      tier: 'silver',
      category: 'packaging',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'packaging-3',
      name: 'Cardboard Box Company',
      icon: Box,
      description: 'Corrugated boxes and packaging materials',
      since: '2018',
      services: ['Shipping boxes', 'Cardboard sheets', 'Custom printing'],
      location: 'Lilongwe, Malawi',
      featured: false,
      tier: 'bronze',
      category: 'packaging',
      color: 'text-brown-600',
      bgColor: 'bg-amber-100'
    },

    // 🚚 LOGISTICS PARTNERS
    {
      id: 'logistics-1',
      name: 'Swift Logistics',
      icon: Truck,
      description: 'Fast and reliable delivery service',
      since: '2018',
      services: ['Last-mile delivery', 'Fleet management', 'Route optimization'],
      location: 'Lilongwe, Malawi',
      certification: ['ISO 9001', 'Safety Standard'],
      featured: true,
      tier: 'platinum',
      category: 'logistics',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'logistics-2',
      name: 'Cold Chain Solutions',
      icon: Snowflake,
      description: 'Temperature-controlled transport',
      since: '2020',
      services: ['Refrigerated trucks', 'Cold storage', 'Temperature monitoring'],
      location: 'Blantyre, Malawi',
      certification: ['GDP Certified'],
      featured: true,
      tier: 'gold',
      category: 'logistics',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'logistics-3',
      name: 'Express Couriers',
      icon: Bike,
      description: 'Same-day delivery service',
      since: '2021',
      services: ['Express delivery', 'Bike couriers', 'Real-time tracking'],
      location: 'Lilongwe, Malawi',
      featured: false,
      tier: 'silver',
      category: 'logistics',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'logistics-4',
      name: 'Freight Masters',
      icon: Plane,
      description: 'Inter-city freight and cargo',
      since: '2015',
      services: ['Bulk transport', 'Freight forwarding', 'Warehousing'],
      location: 'Lilongwe, Malawi',
      featured: false,
      tier: 'bronze',
      category: 'logistics',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },

    // 🏭 WAREHOUSING
    {
      id: 'warehouse-1',
      name: 'Central Storage',
      icon: Warehouse,
      description: 'Modern warehousing facilities',
      since: '2017',
      services: ['Storage', 'Inventory management', 'Order fulfillment'],
      location: 'Lilongwe, Malawi',
      certification: ['ISO 22000', 'Safety Certified'],
      featured: true,
      tier: 'platinum',
      category: 'warehousing',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'warehouse-2',
      name: 'Blantyre Cold Storage',
      icon: Thermometer,
      description: 'Cold storage and frozen goods',
      since: '2019',
      services: ['Freezer storage', 'Cold rooms', 'Temperature control'],
      location: 'Blantyre, Malawi',
      certification: ['HACCP Certified'],
      featured: false,
      tier: 'gold',
      category: 'warehousing',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'warehouse-3',
      name: 'Dry Storage Solutions',
      icon: Container,
      description: 'Dry goods warehousing',
      since: '2018',
      services: ['Dry storage', 'Stock management', 'Cross-docking'],
      location: 'Lilongwe, Malawi',
      featured: false,
      tier: 'silver',
      category: 'warehousing',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },

    // 🤖 TECHNOLOGY PARTNERS
    {
      id: 'tech-1',
      name: 'Digital Malawi',
      icon: Cpu,
      description: 'E-commerce platform and payment solutions',
      since: '2022',
      services: ['Payment gateway', 'Mobile app', 'Cloud hosting'],
      location: 'Lilongwe, Malawi',
      featured: true,
      tier: 'platinum',
      category: 'technology',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'tech-2',
      name: 'SecurePay',
      icon: Lock,
      description: 'Secure payment processing',
      since: '2021',
      services: ['Payment gateway', 'Fraud protection', 'Mobile money'],
      location: 'South Africa',
      certification: ['PCI DSS Compliant'],
      featured: false,
      tier: 'gold',
      category: 'technology',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'tech-3',
      name: 'DataCloud Malawi',
      icon: Cloud,
      description: 'Cloud hosting and data services',
      since: '2020',
      services: ['Cloud storage', 'Backup solutions', 'IT consulting'],
      location: 'Lilongwe, Malawi',
      featured: false,
      tier: 'silver',
      category: 'technology',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    {
      id: 'tech-4',
      name: 'Mobile Money Solutions',
      icon: Smartphone,
      description: 'Mobile payment integration',
      since: '2021',
      services: ['Airtel Money', 'TNM Mpamba', 'Payment APIs'],
      location: 'Lilongwe, Malawi',
      featured: true,
      tier: 'gold',
      category: 'technology',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },

    // 🛠️ EQUIPMENT & MAINTENANCE
    {
      id: 'equip-1',
      name: 'Industrial Equipment Ltd',
      icon: Wrench,
      description: 'Commercial kitchen and refrigeration equipment',
      since: '2014',
      services: ['Equipment supply', 'Installation', 'Maintenance'],
      location: 'Blantyre, Malawi',
      featured: false,
      tier: 'silver',
      category: 'technology',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  // Get unique categories
  const categories = [
    { id: 'all', name: 'All Partners', icon: Handshake },
    { id: 'farm', name: 'Farmers', icon: Sprout },
    { id: 'dairy', name: 'Dairy', icon: Milk },
    { id: 'poultry', name: 'Poultry', icon: Egg },
    { id: 'milling', name: 'Milling', icon: Factory },
    { id: 'beverage', name: 'Beverages', icon: Coffee },
    { id: 'meat', name: 'Meat', icon: Beef },
    { id: 'oil', name: 'Oils', icon: Droplets },
    { id: 'fruit', name: 'Fruits', icon: Apple },
    { id: 'packaging', name: 'Packaging', icon: Package },
    { id: 'logistics', name: 'Logistics', icon: Truck },
    { id: 'warehousing', name: 'Warehousing', icon: Warehouse },
    { id: 'technology', name: 'Technology', icon: Cpu }
  ];

  // Filter by category
  const filteredPartners = selectedCategory === 'all' 
    ? partners 
    : partners.filter(p => p.category === selectedCategory);

  const displayedPartners = showAll ? filteredPartners : filteredPartners.slice(0, 6);
  const featuredPartners = partners.filter(p => p.featured);

  // Tier badges
  const getTierBadge = (tier: string) => {
    switch(tier) {
      case 'platinum':
        return { icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Platinum Partner' };
      case 'gold':
        return { icon: Medal, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Gold Partner' };
      case 'silver':
        return { icon: Award, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Silver Partner' };
      case 'bronze':
        return { icon: Gem, color: 'text-amber-700', bg: 'bg-amber-100', label: 'Bronze Partner' };
      default:
        return { icon: Star, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Partner' };
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-40 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 left-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-none px-4 py-1.5">
            <Handshake className="w-3.5 h-3.5 mr-1 inline" />
            Our Ecosystem
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Trusted <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Partner Network</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From farm to doorstep — we collaborate with the best in every field 
            to bring you quality, freshness, and reliability.
          </p>
        </div>

        {/* Category Filter Carousel */}
        <div className="mb-8">
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <CarouselItem key={cat.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full p-3 rounded-xl transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Featured Partners Banner */}
        <div className="mb-12 bg-gradient-to-r from-primary/10 via-orange-500/10 to-pink-500/10 rounded-2xl p-6 border border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Trophy className="w-10 h-10 text-primary" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Featured Partners</h3>
                <p className="text-sm text-muted-foreground">Our most trusted collaborators</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {featuredPartners.slice(0, 5).map(partner => (
                <Badge key={partner.id} className={`${partner.bgColor} ${partner.color} border-none px-3 py-1.5 text-sm`}>
                  {partner.name}
                </Badge>
              ))}
              {featuredPartners.length > 5 && (
                <Badge className="bg-muted text-muted-foreground border-none px-3 py-1.5">
                  +{featuredPartners.length - 5}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPartners.map((partner, index) => {
            const Icon = partner.icon;
            const TierIcon = getTierBadge(partner.tier).icon;
            
            return (
              <div
                key={partner.id}
                className="group bg-card rounded-2xl border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header with logo */}
                <div className={`relative h-28 ${partner.bgColor} flex items-center justify-center`}>
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                    backgroundSize: '20px 20px',
                    color: partner.color.replace('text-', '')
                  }} />
                  
                  <div className="relative flex items-center gap-4">
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-12 h-12 ${partner.color}`} />
                    </div>
                    
                    {/* Tier Badge */}
                    <div className={`${getTierBadge(partner.tier).bg} rounded-lg p-2`}>
                      <TierIcon className={`w-5 h-5 ${getTierBadge(partner.tier).color}`} />
                    </div>
                  </div>

                  {/* Since badge */}
                  <Badge className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm border-none text-xs">
                    Est. {partner.since}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-semibold text-lg">{partner.name}</h3>
                    
                    {partner.featured && (
                      <Badge className="bg-yellow-400 text-black border-none text-xs">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {partner.description}
                  </p>

                  {/* Location */}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {partner.location}
                  </p>

                  {/* Products or Services */}
                  {partner.products && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-2">Products:</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.products.map(item => (
                          <Badge key={item} variant="outline" className="text-xs bg-muted/30">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {partner.services && (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-2">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.services.map(service => (
                          <Badge key={service} variant="outline" className="text-xs bg-muted/30">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {partner.certification && partner.certification.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {partner.certification.map(cert => (
                        <div key={cert} className="flex items-center gap-1 text-xs text-green-600">
                          <BadgeCheck className="w-3 h-3" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trust badges */}
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" />
                      <span>Trusted</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Since {partner.since}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe2 className="w-3 h-3" />
                      <span>Local</span>
                    </div>
                  </div>

                  {/* Contact Info (if available) */}
                  {partner.contact && (
                    <div className="mt-3 pt-3 border-t border-border flex gap-3">
                      {partner.contact.phone && (
                        <a href={`tel:${partner.contact.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                      )}
                      {partner.contact.email && (
                        <a href={`mailto:${partner.contact.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </a>
                      )}
                      {partner.website && (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                          <Globe2 className="w-3 h-3" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Toggle */}
        {filteredPartners.length > 6 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2 px-6 py-5"
            >
              {showAll ? 'Show Less' : `View All ${filteredPartners.length} Partners`}
              <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { icon: Handshake, label: 'Total Partners', value: partners.length + '+' },
            { icon: Sprout, label: 'Local Farmers', value: partners.filter(p => p.category === 'farm').length + '+' },
            { icon: Truck, label: 'Logistics Partners', value: partners.filter(p => p.category === 'logistics').length },
            { icon: Package, label: 'Packaging Partners', value: partners.filter(p => p.category === 'packaging').length },
            { icon: Warehouse, label: 'Warehousing', value: partners.filter(p => p.category === 'warehousing').length },
            { icon: Cpu, label: 'Tech Partners', value: partners.filter(p => p.category === 'technology').length },
            { icon: Leaf, label: 'Organic Certified', value: partners.filter(p => p.certification?.some(c => c.includes('Organic'))).length },
            { icon: Crown, label: 'Platinum Partners', value: partners.filter(p => p.tier === 'platinum').length }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Partner Categories Summary */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.filter(c => c.id !== 'all').map(cat => {
            const Icon = cat.icon;
            const count = partners.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{count} partners</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Become a Partner CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/5 to-orange-500/5 rounded-2xl p-8 text-center border border-border">
          <h3 className="text-2xl font-display font-semibold mb-2">
            Join Our Partner Network
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Whether you're a farmer, manufacturer, or service provider, 
            let's grow together.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact">
              <Button className="store-gradient text-primary-foreground gap-2 px-6 py-5">
                <Handshake className="w-4 h-4" />
                Become a Partner
              </Button>
            </Link>
            <Button variant="outline" className="gap-2 px-6 py-5">
              <FileText className="w-4 h-4" />
              Download Partnership Brochure
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .group {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default BrandPartners;