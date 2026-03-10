import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from './CartProvider';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/product.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ProductCardProps {
  product: Product;
  // Allow spreading props as fallback
  id?: number;
  name?: string;
  price?: number;
  original_price?: number;
  unit?: string;
  images?: any[];
  stock?: number;
  rating?: number;
  num_reviews?: number;
  is_new?: boolean;
  is_best_seller?: boolean;
  organic?: boolean;
  local_product?: boolean;
  category?: string;
}

// Helper to extract filename from URL or path
const extractFilename = (url: string): string => {
  if (!url) return '';
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

// Helper to get full image URL for display
const getImageUrl = (filename: string): string => {
  if (!filename) return '/placeholder.svg';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  if (filename.startsWith('blob:')) {
    return filename;
  }
  return `${API_URL.replace('/api', '')}/uploads/${filename}`;
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

const ProductCard = (props: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  // Handle both prop patterns: either a product object or spread props
  const product = props.product || props;
  
  // Safely extract values with fallbacks
  const id = product?.id || props.id;
  const name = product?.name || props.name || 'Product';
  const price = parseNumeric(product?.price || props.price);
  const originalPrice = parseNumeric(product?.original_price || props.original_price);
  const unit = product?.unit || props.unit || 'piece';
  const images = product?.images || props.images || [];
  const stock = parseNumeric(product?.stock || props.stock);
  const rating = parseNumeric(product?.rating || props.rating);
  const numReviews = product?.num_reviews || props.num_reviews || 0;
  const isNew = product?.is_new || props.is_new || false;
  const isBestSeller = product?.is_best_seller || props.is_best_seller || false;
  const organic = product?.organic || props.organic || false;
  const localProduct = product?.local_product || props.local_product || false;

  // Validate required fields
  if (!id) {
    console.error('ProductCard: Missing product ID', props);
    return null;
  }

  const isOnSale = originalPrice > price;
  const discount = isOnSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Get product image
  const getProductImage = (): string => {
    try {
      if (images && Array.isArray(images) && images.length > 0) {
        const firstImage = images[0];
        let filename = '';
        
        if (typeof firstImage === 'string') {
          filename = extractFilename(firstImage);
        } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
          filename = extractFilename(firstImage.url);
        }
        
        return getImageUrl(filename);
      }
    } catch (error) {
      console.error('Error getting product image:', error);
    }
    
    return '/placeholder.svg';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();

    if (stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock',
        variant: 'destructive',
      });
      return;
    }

    addItem({
      productId: id.toString(),
      name: name,
      price: price,
      image: extractFilename(getProductImage()),
      unit: unit,
      quantity: 1,
      stock: stock
    });
  };

  const imageUrl = getProductImage();

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-muted/30">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isNew && (
              <Badge className="bg-blue-500 text-white border-none text-xs">
                New
              </Badge>
            )}
            {isBestSeller && (
              <Badge className="bg-amber-500 text-white border-none text-xs">
                Best Seller
              </Badge>
            )}
            {organic && (
              <Badge className="bg-green-500 text-white border-none text-xs">
                Organic
              </Badge>
            )}
            {localProduct && (
              <Badge className="bg-purple-500 text-white border-none text-xs">
                Local
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-red-500 text-white border-none text-xs">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button 
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast({
                title: 'Wishlist',
                description: 'Feature coming soon!',
              });
            }}
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>

          {/* Out of Stock Overlay */}
          {stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-red-500 text-white border-none px-3 py-1.5">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < Math.floor(rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : i < rating
                        ? 'fill-amber-400 text-amber-400 opacity-50'
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({numReviews})
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-medium text-sm md:text-base mb-1 line-clamp-2 min-h-[40px]">
            {name}
          </h3>

          {/* Unit */}
          <p className="text-xs text-muted-foreground mb-2">
            {unit}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-bold text-lg text-foreground">
              MK {price.toLocaleString()}
            </span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">
                MK {originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white h-9 text-sm gap-2"
            size="sm"
          >
            <ShoppingCart className="w-3 h-3" />
            {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;