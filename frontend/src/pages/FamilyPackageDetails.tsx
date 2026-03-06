import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Heart, Share2, Star,
  Package, CheckCircle, Clock, Truck, Shield,
  Users, Calendar, Award, Percent, Coffee,
  Apple, Beef, Fish, Milk, Egg, Wheat,
  Salad, Droplets, Leaf, ThumbsUp, Sparkles,
  ChevronRight, Loader2, ShoppingCart, Flame,
  Utensils
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/components/store/CartProvider';
import { serviceService } from '@/services/serviceService';
import type { FamilyPackage } from '@/types/service.types';

// Import product images (keep as fallback for images)
import vegetablesImg from '@/assets/products/vegetables.jpg';
import fruitsImg from '@/assets/products/fruits.jpg';
import riceImg from '@/assets/products/rice.jpg';
import breadImg from '@/assets/products/bread.jpg';

// API base URL for images
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Map of fallback images by package name
const fallbackImages: Record<string, string> = {
  'Starter Family Pack': vegetablesImg,
  'Medium Family Feast': riceImg,
  'Large Family Bundle': fruitsImg,
  'Vegetarian Family Pack': vegetablesImg,
  'Breakfast Special Pack': breadImg,
  'Monthly Mega Pack': riceImg,
  'default': vegetablesImg
};

interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

const FamilyPackageDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [pkg, setPkg] = useState<FamilyPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('items');
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  const getFullImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath || imagePath === '/placeholder.svg' || imagePath.includes('placeholder')) {
      return '';
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    return `${API_BASE_URL}/uploads/products/${imagePath}`;
  };

  const fetchPackageDetails = async () => {
    setLoading(true);
    try {
      // First try to get from public API
      const allPackages = await serviceService.getPublicFamilyPackages();
      const found = allPackages.find(p => p.id === id);
      
      if (found) {
        const fullImageUrl = getFullImageUrl(found.image);
        setPkg({
          ...found,
          image: fullImageUrl || (fallbackImages[found.name] || fallbackImages.default),
          tags: Array.isArray(found.tags) ? found.tags : [],
          includes: Array.isArray(found.includes) ? found.includes : []
        });
        
        // Set nutrition if available
        if (found.nutrition) {
          setNutrition(found.nutrition as NutritionInfo);
        }
      } else {
        // If not found in public API, try admin API (if logged in)
        try {
          const adminPackage = await serviceService.getFamilyPackage('1', id!);
          if (adminPackage) {
            const fullImageUrl = getFullImageUrl(adminPackage.image);
            setPkg({
              ...adminPackage,
              image: fullImageUrl || (fallbackImages[adminPackage.name] || fallbackImages.default),
              tags: Array.isArray(adminPackage.tags) ? adminPackage.tags : [],
              includes: Array.isArray(adminPackage.includes) ? adminPackage.includes : []
            });
            
            // Set nutrition if available
            if (adminPackage.nutrition) {
              setNutrition(adminPackage.nutrition as NutritionInfo);
            }
          }
        } catch (adminError) {
          console.error('Package not found in admin API:', adminError);
          toast({
            title: 'Package not found',
            description: 'The requested package does not exist.',
            variant: 'destructive',
          });
          navigate('/family-packages');
        }
      }
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load package details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!pkg) return;
    
    addItem({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      unit: 'package',
      image: typeof pkg.image === 'string' ? pkg.image : undefined
    });
    
    toast({
      title: 'Added to cart!',
      description: `${pkg.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const getFamilyIcon = (size: string) => {
    switch(size) {
      case 'small': return <Users className="w-5 h-5" />;
      case 'medium': return <Users className="w-5 h-5" />;
      case 'large': return <Users className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getItemIcon = (item: string) => {
    if (item.includes('Rice')) return <Wheat className="w-4 h-4" />;
    if (item.includes('Eggs')) return <Egg className="w-4 h-4" />;
    if (item.includes('Milk')) return <Milk className="w-4 h-4" />;
    if (item.includes('Vegetables')) return <Salad className="w-4 h-4" />;
    if (item.includes('Fruits')) return <Apple className="w-4 h-4" />;
    if (item.includes('Meat')) return <Beef className="w-4 h-4" />;
    if (item.includes('Fish')) return <Fish className="w-4 h-4" />;
    if (item.includes('Bread')) return <Coffee className="w-4 h-4" />;
    if (item.includes('Oil')) return <Droplets className="w-4 h-4" />;
    if (item.includes('Flour')) return <Wheat className="w-4 h-4" />;
    if (item.includes('Sugar')) return <Coffee className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const hasNutritionData = (): boolean => {
    if (!nutrition) return false;
    return Object.values(nutrition).some(val => val !== undefined && val > 0);
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

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-display font-bold mb-4">Package Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The package you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/family-packages')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Family Packages
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = pkg.originalPrice && pkg.originalPrice > pkg.price
    ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <Link to="/family-packages" className="text-muted-foreground hover:text-primary">Family Packages</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium text-foreground">{pkg.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div>
            <div className="sticky top-[100px]">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImages[pkg.name] || vegetablesImg;
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {pkg.popular && (
                    <Badge className="bg-yellow-500 text-white border-none px-3 py-1.5">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {pkg.bestValue && (
                    <Badge className="bg-green-500 text-white border-none px-3 py-1.5">
                      <Award className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                  )}
                </div>
                
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white border-none px-3 py-1.5">
                      <Percent className="w-3 h-3 mr-1" />
                      {discount}% OFF
                    </Badge>
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
                {pkg.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{pkg.rating?.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">(120 reviews)</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{pkg.items} items</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {getFamilyIcon(pkg.familySize)}
                  <span className="text-sm text-muted-foreground capitalize">
                    {pkg.familySize} family
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">
              {pkg.description}
            </p>

            {/* Price & Savings */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-baseline justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-primary">
                        MK {pkg.price.toLocaleString()}
                      </span>
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <>
                          <span className="text-lg text-muted-foreground line-through">
                            MK {pkg.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-green-500 text-white">
                            Save MK {(pkg.originalPrice - pkg.price).toLocaleString()}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      MK {pkg.savings.toLocaleString()}
                    </p>
                  </div>
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
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white h-12 text-base font-semibold rounded-xl gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  variant="outline"
                  className="flex-1 h-12 text-base rounded-xl gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </Button>
                <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card>
                <CardContent className="p-3 text-center">
                  <Truck className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium">Free Delivery</p>
                  <p className="text-[10px] text-muted-foreground">On all packages</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium">Scheduled</p>
                  <p className="text-[10px] text-muted-foreground">Choose your day</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium">Guaranteed</p>
                  <p className="text-[10px] text-muted-foreground">Fresh promise</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="items">Items Included</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">What's in this package:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {pkg.includes && pkg.includes.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {getItemIcon(item)}
                          </div>
                          <span className="text-sm">{item}</span>
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Package Name</span>
                        <span className="font-medium">{pkg.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Family Size</span>
                        <span className="font-medium capitalize">{pkg.familySize}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Total Items</span>
                        <span className="font-medium">{pkg.items}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Savings</span>
                        <span className="font-medium text-green-600">MK {pkg.savings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Rating</span>
                        <span className="font-medium">{pkg.rating?.toFixed(1)} / 5</span>
                      </div>
                      {pkg.tags && pkg.tags.length > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Tags</span>
                          <div className="flex gap-1">
                            {pkg.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="nutrition" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    {hasNutritionData() ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Utensils className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">Nutrition Information (per serving)</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {nutrition?.calories && nutrition.calories > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.calories}</div>
                              <div className="text-xs text-muted-foreground">Calories</div>
                            </div>
                          )}
                          {nutrition?.protein && nutrition.protein > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Beef className="w-5 h-5 text-red-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.protein}g</div>
                              <div className="text-xs text-muted-foreground">Protein</div>
                            </div>
                          )}
                          {nutrition?.carbs && nutrition.carbs > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.carbs}g</div>
                              <div className="text-xs text-muted-foreground">Carbs</div>
                            </div>
                          )}
                          {nutrition?.fat && nutrition.fat > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Droplets className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.fat}g</div>
                              <div className="text-xs text-muted-foreground">Fat</div>
                            </div>
                          )}
                          {nutrition?.fiber && nutrition.fiber > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Leaf className="w-5 h-5 text-green-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.fiber}g</div>
                              <div className="text-xs text-muted-foreground">Fiber</div>
                            </div>
                          )}
                          {nutrition?.sugar && nutrition.sugar > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Coffee className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.sugar}g</div>
                              <div className="text-xs text-muted-foreground">Sugar</div>
                            </div>
                          )}
                          {nutrition?.sodium && nutrition.sodium > 0 && (
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                              <div className="text-xl font-bold text-primary">{nutrition.sodium}mg</div>
                              <div className="text-xs text-muted-foreground">Sodium</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          Nutrition information is not available for this package.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FamilyPackageDetails;