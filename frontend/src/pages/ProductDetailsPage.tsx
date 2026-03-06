import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, ShoppingCart, Heart, Share2, 
  Truck, Shield, Clock, Package, ChevronRight, 
  Minus, Plus, Check, Leaf, Droplets, Scale,
  Facebook, Twitter, Mail, Copy, Loader2
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/components/store/CartProvider';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product.types';

// Helper to extract filename from URL or path
const extractFilename = (url: string): string => {
  if (!url) return '';
  // If it's a full URL, extract the filename
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

// Helper to get full image URL for display
const getImageUrl = (filename: string): string => {
  if (!filename) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If it's a blob URL (shouldn't happen in product details), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // For development, add the base URL - IMPORTANT: no /products in the path
  return `http://localhost:5001/uploads/${filename}`;
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

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const { addItem } = useCart();

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch product details
      const productData = await productService.getPublicProduct(productId);
      console.log('Product details:', productData);
      setProduct(productData);
      
      // Fetch related products (same category)
      if (productData.category) {
        try {
          const response = await productService.getPublicProducts({ 
            category: productData.category,
            limit: 4
          });
          // Filter out current product
          const related = response.products.filter(p => p.id.toString() !== productId);
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

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({ 
        id: product.id.toString(), 
        name: product.name, 
        price: parseNumeric(product.price), 
        unit: product.unit 
      });
    }
    
    toast({
      title: 'Added to Cart',
      description: `${quantity} × ${product.name} added to your cart`,
    });
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

  // Safe number formatting
  const formatPrice = (price: any): string => {
    const num = parseNumeric(price);
    return num.toLocaleString();
  };

  // Safe rating display
  const getRatingValue = (): number => {
    if (!product || !product.rating) return 0;
    return parseNumeric(product.rating);
  };

  // Safe stock display
  const getStockValue = (): number => {
    if (!product) return 0;
    return parseNumeric(product.stock);
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
            <div className="w-24 h-24 rounded-full bg-store-green-light/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-8">
              {error || "The product you're looking for doesn't exist or has been removed."}
            </p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white h-12 px-8 rounded-xl">
                Return to Home
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Link 
              to={`/products?category=${encodeURIComponent(product.category)}`} 
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
              {/* Main Image */}
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

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
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

              {/* Share Buttons */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="h-4 w-px bg-border mx-1" />
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Facebook className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Twitter className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
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

                {/* In Stock Status */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

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
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                    disabled={stock === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                    disabled={stock === 0 || quantity >= stock}
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
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <Truck className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">Free Delivery</p>
                <p className="text-[10px] text-muted-foreground">Over MK 50,000</p>
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
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'description' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'details' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Details
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'description' && (
                  <div>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description || 'No description available for this product.'}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
                      {product.organic && (
                        <div className="flex items-center gap-1.5">
                          <Leaf className="w-4 h-4 text-green-600" />
                          <span>Organic</span>
                        </div>
                      )}
                      {product.local_product && (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Local Product</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
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
                    {product.sku && (
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      #{tag}
                    </Badge>
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
                <Link to={`/product/${product.id}`} key={product.id}>
                  <ProductCard {...product} />
                </Link>
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