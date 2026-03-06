import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Heart, Share2, Star,
  Clock, Truck, Shield, Award, Sparkles,
  Coffee, Sun, Moon, Leaf, Wheat, Apple,
  Egg, Milk, Croissant, Timer, AlertCircle,
  Users, Package, Droplets, CheckCircle,
  ChevronRight, Loader2, ShoppingCart, ThermometerSun,
  Sunrise, Sunset, Gauge, Zap, Calendar,
  Tag, BadgePercent, CircleCheck, Flame
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { serviceService } from '@/services/serviceService';
import type { DailyFreshProduct } from '@/types/service.types';

// Import product images (keep as fallback)
import vegetablesImg from '@/assets/products/vegetables.jpg';
import fruitsImg from '@/assets/products/fruits.jpg';
import breadImg from '@/assets/products/bread.jpg';
import eggsImg from '@/assets/products/eggs.jpg';
import milkImg from '@/assets/products/milk.jpg';
import tomatoesImg from '@/assets/products/tomatoes.jpg';

// API base URL for API calls (with /api)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Static files base URL (without /api) - for images
const STATIC_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// Map of fallback images by product name
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
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
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

const DailyFreshDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<DailyFreshProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

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
  }, []);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // Get all daily fresh products and find the one with matching ID
      const allProducts = await serviceService.getPublicDailyFresh();
      const found = allProducts.find(p => p.id === id);
      
      if (found) {
        console.log('Product found:', found);
        console.log('Raw image path:', found.image);
        
        const fullImageUrl = getFullImageUrl(found.image);
        console.log('Constructed image URL:', fullImageUrl);
        
        setProduct({
          ...found,
          image: fullImageUrl,
          // Ensure numeric fields are numbers
          price: typeof found.price === 'number' ? found.price : parseFloat(found.price) || 0,
          freshness: typeof found.freshness === 'number' ? found.freshness : parseInt(found.freshness) || 0,
          stock: typeof found.stock === 'number' ? found.stock : parseInt(found.stock) || 0,
          rating: typeof found.rating === 'number' ? found.rating : parseFloat(found.rating) || 0
        });
      } else {
        toast({
          title: 'Product not found',
          description: 'The requested product does not exist.',
          variant: 'destructive',
        });
        navigate('/daily-fresh');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock.`,
        variant: 'destructive',
      });
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit
      });
    }
    
    toast({
      title: 'Added to cart!',
      description: `${quantity} × ${product.name} added to your cart.`,
      duration: 3000,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleImageError = () => {
    console.error(`Image failed to load for product: ${product?.name} (ID: ${id})`);
    setImageError(true);
  };

  const getImageSource = () => {
    if (imageError || !product?.image) {
      return fallbackImages[product?.name || 'default'] || fallbackImages.default;
    }
    return product.image;
  };

  const getTimeIcon = (timeAvailable: string) => {
    switch(timeAvailable) {
      case 'morning': return <Coffee className="w-5 h-5" />;
      case 'afternoon': return <Sun className="w-5 h-5" />;
      case 'evening': return <Moon className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getTimeLabel = (timeAvailable: string) => {
    switch(timeAvailable) {
      case 'morning': return 'Morning (6AM - 11AM)';
      case 'afternoon': return 'Afternoon (11AM - 4PM)';
      case 'evening': return 'Evening (4PM - 8PM)';
      default: return 'Available All Day';
    }
  };

  const getFreshnessColor = (hours: number) => {
    if (hours <= 2) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950/30';
    if (hours <= 4) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/30';
    return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/30';
  };

  const getFreshnessLabel = (hours: number) => {
    if (hours <= 2) return 'Freshly Harvested';
    if (hours <= 4) return 'Still Fresh';
    return 'Best Soon';
  };

  const getFreshnessProgress = (hours: number) => {
    return Math.max(0, 100 - (hours / 12) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-display font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/daily-fresh')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Daily Fresh
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <Link to="/daily-fresh" className="text-muted-foreground hover:text-primary transition-colors">Daily Fresh</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium text-foreground truncate max-w-[300px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div>
            <div className="sticky top-[100px]">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border shadow-lg">
                <img
                  src={getImageSource()}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={handleImageError}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-lg px-3 py-1.5">
                    <Zap className="w-3 h-3 mr-1" />
                    Daily Fresh
                  </Badge>
                  {product.badge && (
                    <Badge className="bg-primary text-white border-none shadow-lg px-3 py-1.5">
                      {product.badge}
                    </Badge>
                  )}
                  {discount > 0 && (
                    <Badge className="bg-red-500 text-white border-none shadow-lg px-3 py-1.5">
                      <BadgePercent className="w-3 h-3 mr-1" />
                      {discount}% OFF
                    </Badge>
                  )}
                </div>

                {/* Time badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${
                    product.timeAvailable === 'morning' ? 'bg-amber-500' :
                    product.timeAvailable === 'afternoon' ? 'bg-orange-500' :
                    product.timeAvailable === 'evening' ? 'bg-purple-500' :
                    'bg-blue-500'
                  } text-white border-none shadow-lg px-3 py-1.5`}>
                    {getTimeIcon(product.timeAvailable)}
                    <span className="ml-1 text-sm capitalize">{product.timeAvailable}</span>
                  </Badge>
                </div>

                {/* Organic/Local badges */}
                {(product.organic || product.local) && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {product.organic && (
                      <Badge className="bg-green-600 text-white border-none shadow-lg px-3 py-1.5">
                        <Leaf className="w-3 h-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                    {product.local && (
                      <Badge className="bg-blue-600 text-white border-none shadow-lg px-3 py-1.5">
                        <Users className="w-3 h-3 mr-1" />
                        Local
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Title & Rating */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating?.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">(24 reviews)</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {product.limit && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Limit {product.limit} per customer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.description || `Fresh ${product.name} harvested and prepared daily. Sourced from local farms to ensure the highest quality and freshness for your table.`}
            </p>

            {/* Price */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-baseline justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-primary">
                        MK {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            MK {product.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-green-500 text-white border-none">
                            <Tag className="w-3 h-3 mr-1" />
                            Save MK {(product.originalPrice - product.price).toLocaleString()}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Freshness Indicator */}
            <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Freshness Meter</span>
                  </div>
                  <Badge className={getFreshnessColor(product.freshness)}>
                    {getFreshnessLabel(product.freshness)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harvested</span>
                    <span className="font-medium">{product.freshness} hours ago</span>
                  </div>
                  
                  <Progress 
                    value={getFreshnessProgress(product.freshness)} 
                    className="h-2.5 bg-gray-200 dark:bg-gray-700"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Just Picked</span>
                    <span>Best Within 12h</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Best consumed within 12 hours of harvest for optimal freshness and flavor
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Actions */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.limit || 99, quantity + 1))}
                    disabled={product.stock === 0 || (product.limit ? quantity >= product.limit : quantity >= product.stock)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {product.limit && (
                  <span className="text-xs text-muted-foreground">Max {product.limit} per order</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white h-12 text-base font-semibold rounded-xl gap-2 hover:shadow-lg transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  variant="outline"
                  className="flex-1 h-12 text-base rounded-xl gap-2 border-2 hover:bg-primary/5 transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </Button>
                <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl border-2 hover:bg-primary/5 transition-all">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Delivery & Restock Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium">Free Delivery</p>
                      <p className="text-xs text-muted-foreground">On orders over MK 50,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-medium">Next Restock</p>
                      <p className="text-xs font-bold">{timeRemaining.hours}h {timeRemaining.minutes}m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="storage">Storage Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description || `Experience the freshest ${product.name} available in Lilongwe. Harvested at peak ripeness and delivered to your door within hours.`}
                      </p>
                      
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <CircleCheck className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Farm fresh</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CircleCheck className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Quality checked</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CircleCheck className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Same day delivery</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Product Name</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline" className="capitalize">{product.category}</Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Unit</span>
                        <span className="font-medium">{product.unit}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Available Time</span>
                        <Badge className={`${
                          product.timeAvailable === 'morning' ? 'bg-amber-500' :
                          product.timeAvailable === 'afternoon' ? 'bg-orange-500' :
                          product.timeAvailable === 'evening' ? 'bg-purple-500' :
                          'bg-blue-500'
                        } text-white border-none`}>
                          {getTimeIcon(product.timeAvailable)}
                          <span className="ml-1">{getTimeLabel(product.timeAvailable)}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Freshness</span>
                        <span className="font-medium">{product.freshness} hours</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Stock Status</span>
                        {product.stock > 0 ? (
                          <Badge className="bg-green-500 text-white">{product.stock} available</Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>
                      {product.organic && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Organic</span>
                          <Badge className="bg-green-600 text-white">Certified Organic</Badge>
                        </div>
                      )}
                      {product.local && (
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Locally Sourced</span>
                          <Badge className="bg-blue-600 text-white">From Malawi Farms</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="storage" className="mt-4">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Storage Guidelines
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm">Keep refrigerated at 2-4°C (35-40°F) for optimal freshness</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm">Consume within {product.freshness > 2 ? '2-3' : '1-2'} days for best quality</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm">Store in original packaging or airtight container to maintain freshness</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm">Do not wash before storing - wash just before use to prevent spoilage</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm">Keep away from direct sunlight and heat sources</span>
                      </li>
                    </ul>
                    
                    <Separator className="my-4" />
                    
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Our freshness guarantee: If you're not satisfied with the quality, we'll replace it for free.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Share & Save */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Add to Wishlist
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
              <Badge variant="outline" className="px-3 py-1">
                <Award className="w-3 h-3 mr-1" />
                Freshness Guaranteed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DailyFreshDetailPage;