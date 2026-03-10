import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Star, ShoppingCart, Heart, Share2, 
  Truck, Shield, Clock, Package, ChevronRight, 
  Minus, Plus, Check, Leaf, Loader2,
  Facebook, Twitter, Mail, Copy
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/components/store/CartProvider';
import type { Product } from '@/types/product.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// FIXED: Helper function to get correct image URL with /products/ subfolder
const STATIC_BASE_URL = API_URL.replace('/api', '');
const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath || imagePath === '/placeholder.svg') return '/placeholder.svg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('blob:')) return imagePath;
  // Extract just filename if full path given
  const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  return `${STATIC_BASE_URL}/uploads/products/${filename}`;
};

// Helper to extract filename from URL or path
const extractFilename = (url: string): string => {
  if (!url) return '';
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

// Helper to parse numeric values safely
const parseNumeric = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Review type
interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
      fetchReviews(id);
    }
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch product details
      const response = await fetch(`${API_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const productData = await response.json();
      console.log('Product details:', productData);
      setProduct(productData);
      
      // Fetch related products (same category)
      if (productData.category) {
        try {
          const params = new URLSearchParams({
            category: productData.category,
            limit: '4',
            status: 'active'
          });
          const relatedResponse = await fetch(`${API_URL}/products?${params.toString()}`);
          const relatedData = await relatedResponse.json();
          // Filter out current product
          const related = (relatedData.products || []).filter((p: Product) => p.id.toString() !== productId);
          setRelatedProducts(related);
        } catch (relatedError) {
          console.error('Error fetching related products:', relatedError);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
      toast({
        title: 'Error',
        description: 'Failed to load product details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      // This would be a real API call - for now, use mock data
      // const response = await fetch(`${API_URL}/products/${productId}/reviews`);
      // const data = await response.json();
      // setReviews(data.reviews || []);
      
      // Mock reviews for demonstration
      setReviews([
        {
          id: 1,
          user_name: 'Chisomo Banda',
          rating: 5,
          comment: 'Excellent quality! Fresh and delicious. Will definitely buy again.',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          user_name: 'Tawonga Phiri',
          rating: 4,
          comment: 'Good product, delivery was fast. A bit pricey but worth it.',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const stock = parseNumeric(product.stock);
    if (stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock',
        variant: 'destructive',
      });
      return;
    }

    const maxOrder = parseNumeric(product.max_order_qty);
    if (maxOrder > 0 && quantity > maxOrder) {
      toast({
        title: 'Maximum Order Exceeded',
        description: `You can only order up to ${maxOrder} units of this product`,
        variant: 'destructive',
      });
      return;
    }

    const minOrder = parseNumeric(product.min_order_qty) || 1;
    if (quantity < minOrder) {
      toast({
        title: 'Minimum Order Required',
        description: `Minimum order quantity is ${minOrder}`,
        variant: 'destructive',
      });
      return;
    }
    
    // Get product image
    let imageUrl = '';
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        imageUrl = extractFilename(firstImage);
      } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
        imageUrl = extractFilename(firstImage.url);
      }
    }

    addItem({
      productId: product.id.toString(),
      name: product.name,
      price: parseNumeric(product.price),
      image: imageUrl,
      unit: product.unit,
      quantity: quantity,
      maxOrder: maxOrder || undefined,
      stock: stock
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmittingReview(true);
    try {
      // This would be a real API call
      // await fetch(`${API_URL}/products/${product.id}/reviews`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: reviewName,
      //     rating: reviewRating,
      //     comment: reviewComment
      //   })
      // });

      // Mock success
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });

      // Reset form
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');

      // Refresh reviews
      fetchReviews(product.id.toString());
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Product link copied to clipboard',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getProductImages = (): string[] => {
    if (!product) return [];
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => {
        let filename = '';
        
        if (typeof img === 'string') {
          filename = extractFilename(img);
        } else if (img && typeof img === 'object' && 'url' in img) {
          filename = extractFilename(img.url);
        }
        
        // FIXED: Use getImageUrl helper
        return getImageUrl(filename);
      });
    }
    
    return ['/placeholder.svg'];
  };

  const getCategoryName = (category: string): string => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPrice = (price: any): string => {
    const num = parseNumeric(price);
    return num.toLocaleString();
  };

  const getRatingValue = (): number => {
    if (!product || !product.rating) return 0;
    return parseNumeric(product.rating);
  };

  const getStockValue = (): number => {
    if (!product) return 0;
    return parseNumeric(product.stock);
  };

  const getStockStatus = (): { label: string; color: string; badge: string } => {
    const stock = getStockValue();
    const lowStockAlert = parseNumeric(product?.low_stock_alert) || 10;
    
    if (stock <= 0) {
      return { label: 'Out of Stock', color: 'bg-red-500', badge: 'destructive' };
    } else if (stock <= lowStockAlert) {
      return { label: 'Low Stock', color: 'bg-yellow-500', badge: 'warning' };
    } else {
      return { label: 'In Stock', color: 'bg-green-500', badge: 'success' };
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-8">
              {error || "The product you're looking for doesn't exist or has been removed."}
            </p>
            <Link to="/shop">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-12 px-8 rounded-xl">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getProductImages();
  const productPrice = parseNumeric(product.price);
  const productOriginalPrice = parseNumeric(product.original_price);
  const discount = productOriginalPrice > productPrice
    ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
    : 0;
  const rating = getRatingValue();
  const stock = getStockValue();
  const stockStatus = getStockStatus();
  const minOrder = parseNumeric(product.min_order_qty) || 1;
  const maxOrder = parseNumeric(product.max_order_qty) || 999;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Link 
              to={`/shop?category=${encodeURIComponent(product.category)}`} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {getCategoryName(product.category)}
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div>
            <div className="bg-card rounded-2xl p-4 border border-border sticky top-[140px]">
              {/* Main Image - FIXED: Added onError handler */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 mb-4">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', images[selectedImage]);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {product.is_new && (
                  <Badge className="absolute top-4 left-4 bg-blue-500 text-white border-none px-3 py-1.5 text-sm">
                    New
                  </Badge>
                )}
                {product.is_best_seller && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 text-white border-none px-3 py-1.5 text-sm">
                    Best Seller
                  </Badge>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white border-none px-3 py-1.5 text-sm">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Images - FIXED: Added onError handlers */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Share Button */}
              <div className="flex items-center justify-end mt-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Title & Rating */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                {/* Rating */}
                {rating > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const filled = i < Math.floor(rating);
                        const halfFilled = !filled && i < rating;
                        return (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              filled 
                                ? 'fill-amber-400 text-amber-400' 
                                : halfFilled
                                ? 'fill-amber-400 text-amber-400 opacity-50'
                                : 'text-gray-300'
                            }`} 
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)} ({product.num_reviews || 0} reviews)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">No reviews yet</span>
                  </div>
                )}

                {/* Stock Status */}
                <Badge variant={stockStatus.badge as any}>
                  {stockStatus.label}
                </Badge>

                {/* SKU */}
                {product.sku && (
                  <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-card rounded-xl p-6 border border-border mb-6">
              <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                <span className="text-3xl font-bold text-foreground">
                  MK {formatPrice(productPrice)}
                </span>
                {productOriginalPrice > productPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      MK {formatPrice(productOriginalPrice)}
                    </span>
                    <Badge className="bg-green-500 text-white border-none">
                      Save MK {(productOriginalPrice - productPrice).toLocaleString()}
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Price per {product.unit}</p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="bg-card rounded-xl p-6 border border-border mb-6">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(minOrder, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                    disabled={stock === 0 || quantity <= minOrder}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxOrder, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                    disabled={stock === 0 || quantity >= Math.min(stock, maxOrder)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.unit} ({stock} available)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white h-12 text-base font-semibold rounded-xl gap-2 hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 text-base rounded-xl gap-2"
                  disabled={stock === 0}
                >
                  <Heart className="w-4 h-4" />
                  Wishlist
                </Button>
              </div>

              {/* Order Limits Info */}
              {(minOrder > 1 || maxOrder < 999) && (
                <div className="mt-3 text-xs text-muted-foreground">
                  {minOrder > 1 && <span>Minimum order: {minOrder} • </span>}
                  {maxOrder < 999 && <span>Maximum order: {maxOrder}</span>}
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <Truck className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Free Delivery</p>
                <p className="text-[10px] text-muted-foreground">Over MK 10,000</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Quality Check</p>
                <p className="text-[10px] text-muted-foreground">100% Guarantee</p>
              </div>
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Same Day</p>
                <p className="text-[10px] text-muted-foreground">Order before 2PM</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description || 'No description available for this product.'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="space-y-3">
                    {product.category && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{getCategoryName(product.category)}</span>
                      </div>
                    )}
                    {product.subcategory && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Subcategory</span>
                        <span className="font-medium">{product.subcategory}</span>
                      </div>
                    )}
                    {product.brand && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Brand</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Unit</span>
                      <span className="font-medium">{product.unit}</span>
                    </div>
                    {product.weight && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">{parseNumeric(product.weight)} kg</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Organic</span>
                      <span>{product.organic ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Local Product</span>
                      <span>{product.local_product ? 'Yes' : 'No'}</span>
                    </div>
                    {product.sku && (
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="bg-card rounded-xl p-6 border border-border">
                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {review.user_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{review.user_name}</p>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-3 h-3 ${
                                        i < review.rating 
                                          ? 'fill-amber-400 text-amber-400' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No reviews yet. Be the first to review this product!
                    </p>
                  )}

                  {/* Add Review Form */}
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <h4 className="font-medium">Write a Review</h4>
                    
                    <div>
                      <Label htmlFor="review-name">Your Name</Label>
                      <Input
                        id="review-name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="review-rating">Rating</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= reviewRating 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-comment">Your Review</Label>
                      <Textarea
                        id="review-comment"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={submittingReview}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Link key={index} to={`/shop?search=${encodeURIComponent(tag)}`}>
                      <Badge variant="outline" className="px-3 py-1 hover:bg-muted cursor-pointer">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
              You might also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.map(product => (
                // FIX: ProductCard will handle its own image URL construction
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;