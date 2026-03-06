// src/pages/Wishlist.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Trash2, Share2, Gift,
  ArrowLeft, ChevronRight, Sparkles, AlertCircle,
  Bell, Percent, Star, Clock, Users, Tag,
  ShoppingBag, X, Check, Copy, Facebook,
  Twitter, Mail, MoreHorizontal, Plus,
  Grid, List, MessageCircle, Eye,
  Calendar, Award, TrendingUp, Package,
  CheckCircle, Circle, CircleDot, CircleCheck,
  Download, Upload, Printer, Settings,
  Filter, SortAsc, SortDesc, SlidersHorizontal,
  Grid2x2, ListChecks, RefreshCw, Truck,
  CreditCard, Shield, HeartHandshake,
  HeartOff, HeartCrack, Flame, Zap,
  BadgeCheck, BadgePercent, BadgeMinus,
  BadgePlus, BadgeX, BadgeAlert,
  Search,
  TrendingDown
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/components/store/CartProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

// Import product images
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

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  rating: number;
  inStock: boolean;
  dateAdded: string;
  category: string;
  brand?: string;
  popularity?: number;
  discount?: number;
  quantity?: number;
  notes?: string;
}

interface WishlistStats {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  mostExpensive: number;
  leastExpensive: number;
  categories: { [key: string]: number };
  inStock: number;
  outOfStock: number;
  onSale: number;
}

const Wishlist = () => {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name' | 'popularity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<WishlistStats>({
    totalItems: 0,
    totalValue: 0,
    averagePrice: 0,
    mostExpensive: 0,
    leastExpensive: 0,
    categories: {},
    inStock: 0,
    outOfStock: 0,
    onSale: 0
  });

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    } else {
      // Sample data for demo
      const sampleWishlist: WishlistItem[] = [
        {
          id: 'p1',
          name: 'Fresh Tomatoes',
          price: 2500,
          unit: '1 kg',
          image: tomatoesImg,
          rating: 5,
          inStock: true,
          dateAdded: new Date().toISOString(),
          category: 'Vegetables',
          brand: 'Local Farm',
          popularity: 95,
          quantity: 1
        },
        {
          id: 'p5',
          name: 'Farm Eggs',
          price: 6000,
          originalPrice: 6500,
          unit: 'Tray of 30',
          image: eggsImg,
          rating: 5,
          inStock: true,
          dateAdded: new Date(Date.now() - 86400000).toISOString(),
          category: 'Dairy',
          brand: 'Happy Hens',
          popularity: 98,
          discount: 8,
          quantity: 2
        },
        {
          id: 'p3',
          name: 'White Rice',
          price: 8500,
          originalPrice: 9500,
          unit: '5 kg bag',
          image: riceImg,
          rating: 4,
          inStock: true,
          dateAdded: new Date(Date.now() - 172800000).toISOString(),
          category: 'Pantry',
          brand: 'Premium Grains',
          popularity: 87,
          discount: 11,
          quantity: 1
        },
        {
          id: 'p8',
          name: 'Fresh Milk',
          price: 2800,
          unit: '2 Litres',
          image: milkImg,
          rating: 4,
          inStock: false,
          dateAdded: new Date(Date.now() - 259200000).toISOString(),
          category: 'Dairy',
          brand: 'Dairy Fresh',
          popularity: 82,
          quantity: 3
        },
        {
          id: 'p12',
          name: 'Fresh Fruits',
          price: 3000,
          unit: 'Mixed Pack',
          image: fruitsImg,
          rating: 5,
          inStock: true,
          dateAdded: new Date(Date.now() - 345600000).toISOString(),
          category: 'Fruits',
          brand: 'Seasonal Harvest',
          popularity: 91,
          quantity: 1
        }
      ];
      setWishlist(sampleWishlist);
      localStorage.setItem('wishlist', JSON.stringify(sampleWishlist));
    }
  }, []);

  // Calculate stats whenever wishlist changes
  useEffect(() => {
    const categories: { [key: string]: number } = {};
    let totalValue = 0;
    let inStock = 0;
    let outOfStock = 0;
    let onSale = 0;
    let maxPrice = 0;
    let minPrice = Infinity;

    wishlist.forEach(item => {
      // Categories
      categories[item.category] = (categories[item.category] || 0) + 1;
      
      // Values
      totalValue += item.price;
      maxPrice = Math.max(maxPrice, item.price);
      minPrice = Math.min(minPrice, item.price);
      
      // Stock status
      if (item.inStock) inStock++; else outOfStock++;
      
      // Sale items
      if (item.originalPrice) onSale++;
    });

    setStats({
      totalItems: wishlist.length,
      totalValue,
      averagePrice: wishlist.length > 0 ? totalValue / wishlist.length : 0,
      mostExpensive: maxPrice,
      leastExpensive: minPrice === Infinity ? 0 : minPrice,
      categories,
      inStock,
      outOfStock,
      onSale
    });
  }, [wishlist]);

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
      duration: 3000,
    });
  };

  const removeSelected = () => {
    setWishlist(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    
    toast({
      title: "Items removed",
      description: `${selectedItems.length} items removed from wishlist`,
      duration: 3000,
    });
  };

  const addToCart = (item: WishlistItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      quantity: 1,
      image: item.image
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
      duration: 3000,
    });
  };

  const addAllToCart = () => {
    const itemsToAdd = wishlist.filter(item => item.inStock);
    itemsToAdd.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: 1,
        image: item.image
      });
    });
    
    toast({
      title: "Items added to cart",
      description: `${itemsToAdd.length} items added to your cart`,
      duration: 3000,
    });
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map(item => item.id));
    }
  };

  const shareWishlist = () => {
    const shareUrl = `${window.location.origin}/shared-wishlist/${btoa(JSON.stringify(wishlist.map(i => i.id)))}`;
    return shareUrl;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareWishlist());
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Check out my wishlist from Mwambo Store! ${shareWishlist()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareWishlist())}`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = 'My grocery wishlist from Mwambo Store';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareWishlist())}`, '_blank');
  };

  const shareByEmail = () => {
    const subject = 'My Wishlist from Mwambo Store';
    const body = `Check out my wishlist: ${shareWishlist()}`;
    window.location.href = `mailto:${shareEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShareDialogOpen(false);
  };

  // Filter and sort wishlist
  const filteredWishlist = wishlist
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedWishlist = [...filteredWishlist].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'price') {
      comparison = a.price - b.price;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'popularity') {
      comparison = (a.popularity || 0) - (b.popularity || 0);
    } else {
      comparison = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const uniqueCategories = Array.from(new Set(wishlist.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 dark:from-pink-950/20 dark:via-background dark:to-rose-950/20">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-600 via-rose-500 to-red-500 overflow-hidden">
        {/* Floating hearts animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <Heart className="w-20 h-20 text-white" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <HeartHandshake className="w-24 h-24 text-white" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-float-slow">
            <Heart className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-beat">
                  <Heart className="w-12 h-12 text-white fill-white" />
                </div>
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-black border-none text-lg w-10 h-10 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    {wishlist.length}
                  </Badge>
                )}
              </div>
              
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                  My Wishlist
                </h1>
                <p className="text-white/90 text-lg">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
                </p>
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

      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inStock}</p>
                <p className="text-xs text-muted-foreground">In Stock</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">MK {stats.totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onSale}</p>
                <p className="text-xs text-muted-foreground">On Sale</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.averagePrice)}</p>
                <p className="text-xs text-muted-foreground">Avg Price</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.categories).length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-40 h-40 mx-auto mb-8">
              <Heart className="w-40 h-40 text-muted-foreground/20" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-pink-500" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-3">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Start adding items you love. Click the heart icon on any product to save it here.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 text-white gap-2 px-8">
                  <ShoppingBag className="w-5 h-5" />
                  Browse Products
                </Button>
              </Link>
              <Link to="/deals">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <Percent className="w-5 h-5" />
                  View Deals
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search wishlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      {filterCategory === 'all' ? 'All Categories' : filterCategory}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                      <Circle className="w-4 h-4 mr-2" />
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {uniqueCategories.map(cat => (
                      <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                        <CircleDot className="w-4 h-4 mr-2" />
                        {cat} ({stats.categories[cat]})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                      Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Recently Added
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('desc'); }}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('asc'); }}>
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                      <SortAsc className="w-4 h-4 mr-2" />
                      Name: A to Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('popularity'); setSortOrder('desc'); }}>
                      <Flame className="w-4 h-4 mr-2" />
                      Popularity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 transition-colors ${
                            viewMode === 'grid' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-card hover:bg-muted'
                          }`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Grid view</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 transition-colors ${
                            viewMode === 'list' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-card hover:bg-muted'
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>List view</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Share Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={copyShareLink}>
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnWhatsApp}>
                      <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                      WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnFacebook}>
                      <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                      Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareOnTwitter}>
                      <Twitter className="w-4 h-4 mr-2 text-sky-500" />
                      Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Selection Toolbar */}
            <div className="flex flex-wrap items-center gap-4 py-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="gap-2"
                >
                  {selectedItems.length === wishlist.length ? (
                    <>
                      <CircleCheck className="w-4 h-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      Select All
                    </>
                  )}
                </Button>
                
                {selectedItems.length > 0 && (
                  <>
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedItems.length} selected
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeSelected}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Selected
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => {
                        selectedItems.forEach(id => {
                          const item = wishlist.find(i => i.id === id);
                          if (item) addToCart(item);
                        });
                      }}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 text-white gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </>
                )}
              </div>

              {searchTerm && (
                <Badge variant="outline" className="gap-2 px-3 py-1">
                  <Search className="w-3 h-3" />
                  "{searchTerm}" ({filteredWishlist.length} results)
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredWishlist.length} of {wishlist.length} items
            </p>

            {/* Wishlist Items */}
            {filteredWishlist.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No matching items</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "space-y-4"
              }>
                {sortedWishlist.map((item) => {
                  const discount = item.originalPrice 
                    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
                    : 0;

                  return (
                    <Card
                      key={item.id}
                      className={`group relative overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 ${
                        selectedItems.includes(item.id) 
                          ? 'border-2 border-pink-500 ring-2 ring-pink-500/20' 
                          : ''
                      }`}
                    >
                      {/* Select checkbox */}
                      <div className="absolute top-2 left-2 z-20">
                        <button
                          onClick={() => toggleSelectItem(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedItems.includes(item.id)
                              ? 'bg-pink-500 border-pink-500 text-white'
                              : 'border-muted-foreground/30 hover:border-pink-500 bg-background'
                          }`}
                        >
                          {selectedItems.includes(item.id) && <Check className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Actions dropdown */}
                      <div className="absolute top-2 right-2 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => addToCart(item)}>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => removeFromWishlist(item.id)} 
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Sale badge */}
                      {discount > 0 && (
                        <div className="absolute top-2 left-8 z-10">
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none shadow-lg">
                            <BadgePercent className="w-3 h-3 mr-1" />
                            {discount}% OFF
                          </Badge>
                        </div>
                      )}

                      {/* Popularity badge */}
                      {item.popularity && item.popularity > 90 && (
                        <div className="absolute top-2 right-8 z-10">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-lg">
                            <Flame className="w-3 h-3 mr-1" />
                            Hot
                          </Badge>
                        </div>
                      )}

                      {/* Out of stock overlay */}
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                          <Badge variant="outline" className="bg-card text-muted-foreground border-destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </Badge>
                        </div>
                      )}

                      {viewMode === 'grid' ? (
                        // Grid View
                        <div className="p-3">
                          <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          
                          <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                          
                          <p className="text-xs text-muted-foreground mb-2">{item.unit}</p>
                          
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < item.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-muted-foreground/20'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.rating})
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm">MK {item.price.toLocaleString()}</span>
                              {item.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through block">
                                  MK {item.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
                              disabled={!item.inStock}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>

                          {/* Added date tooltip */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm">
                                    <Clock className="w-2 h-2 mr-1" />
                                    {new Date(item.dateAdded).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Added on {new Date(item.dateAdded).toLocaleDateString()}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        // List View
                        <div className="p-4 flex gap-4">
                          <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold mb-1">{item.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {item.unit} • {item.category}
                                  {item.brand && ` • ${item.brand}`}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xl font-bold text-primary">
                                  MK {item.price.toLocaleString()}
                                </p>
                                {item.originalPrice && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    MK {item.originalPrice.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < item.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground/20'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              <Badge className={item.inStock ? 'bg-green-500' : 'bg-red-500'}>
                                {item.inStock ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                              
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Added {new Date(item.dateAdded).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() => addToCart(item)}
                                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
                                disabled={!item.inStock}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add to Cart
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromWishlist(item.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap gap-4 justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
                    setWishlist([]);
                    toast({
                      title: "Wishlist cleared",
                      description: "All items have been removed from your wishlist",
                      duration: 3000,
                    });
                  }
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Wishlist
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={addAllToCart}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white gap-2"
                  disabled={stats.inStock === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add All to Cart (MK {stats.totalValue.toLocaleString()})
                </Button>

                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Gift className="w-4 h-4" />
                      Share Wishlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Your Wishlist</DialogTitle>
                      <DialogDescription>
                        Share your wishlist with friends and family via email or social media
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Share link */}
                      <div className="flex gap-2">
                        <Input
                          value={shareWishlist()}
                          readOnly
                          className="flex-1 font-mono text-sm"
                        />
                        <Button onClick={copyShareLink} variant="outline" className="gap-2">
                          {copied ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>

                      <Separator />

                      {/* Email share */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Share via Email</h4>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                          />
                          <Button onClick={shareByEmail} disabled={!shareEmail}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Social share */}
                      <div>
                        <h4 className="font-medium mb-3">Share on Social Media</h4>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={shareOnWhatsApp}
                            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          >
                            <MessageCircle className="w-6 h-6" />
                          </button>
                          <button
                            onClick={shareOnFacebook}
                            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          >
                            <Facebook className="w-6 h-6" />
                          </button>
                          <button
                            onClick={shareOnTwitter}
                            className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                          >
                            <Twitter className="w-6 h-6" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-center text-muted-foreground">
                        Anyone with this link can view your wishlist items
                      </p>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </>
        )}

        {/* Recommendations */}
        {wishlist.length > 0 && (
          <section className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                You Might Also Like
              </h2>
              <Link to="/products" className="text-sm text-primary hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  id: 'rec1',
                  name: 'Organic Bananas',
                  price: 2500,
                  unit: '1 bunch',
                  image: fruitsImg,
                  rating: 5
                },
                {
                  id: 'rec2',
                  name: 'Whole Chicken',
                  price: 8500,
                  unit: '1.5-2 kg',
                  image: eggsImg,
                  rating: 4
                },
                {
                  id: 'rec3',
                  name: 'Potatoes',
                  price: 2000,
                  unit: '2 kg',
                  image: vegetablesImg,
                  rating: 4
                },
                {
                  id: 'rec4',
                  name: 'Orange Juice',
                  price: 3200,
                  unit: '1L',
                  image: fruitsImg,
                  rating: 5
                }
              ].map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all group">
                  <CardContent className="p-3">
                    <div className="aspect-square rounded-lg bg-muted mb-2 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{item.unit}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < item.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">MK {item.price.toLocaleString()}</span>
                      <Button
                        size="sm"
                        onClick={() => addItem(item)}
                        className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Price Drop Alerts */}
        <section className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Price Drop Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when items in your wishlist go on sale
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Enable Alerts
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
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-beat {
          animation: beat 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;