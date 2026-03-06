import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from './CartProvider';
import type { Product } from '@/types/product.types';

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  original_price?: number;
  unit: string;
  images?: string[] | { url: string }[];
  rating?: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_on_sale?: boolean;
  is_new?: boolean;
  stock?: number;
  badge?: string;
  image?: string; // Add this for direct image prop (used by DailyFresh)
  onAddToCart?: (e: React.MouseEvent) => void;
  onViewDetails?: () => void;
  onImageError?: () => void; // Add this for handling image errors
}

const ProductCard = (props: ProductCardProps) => {
  const {
    id,
    name,
    price,
    original_price,
    unit,
    images,
    rating,
    is_featured,
    is_best_seller,
    is_on_sale,
    is_new,
    stock,
    badge: propBadge,
    image: directImage, // Direct image prop (for DailyFresh)
    onAddToCart: customAddToCart,
    onViewDetails,
    onImageError
  } = props;

  const { addItem } = useCart();
  
  // Determine badge
  let badge = propBadge;
  if (!badge) {
    if (is_new) badge = 'New';
    else if (is_best_seller) badge = 'Best Seller';
    else if (is_on_sale) badge = 'Sale';
    else if (is_featured) badge = 'Featured';
  }

  const discount = original_price && original_price > price
    ? Math.round(((original_price - price) / original_price) * 100)
    : 0;

  const inStock = (stock ?? 0) > 0;

  // Get image URL - support both images array and direct image prop
  const getImageUrl = () => {
    // If direct image prop is provided (from DailyFresh), use it
    if (directImage) {
      return directImage;
    }
    
    // Otherwise use the images array
    if (!images || images.length === 0) return '/placeholder.svg';
    const firstImage = images[0];
    if (typeof firstImage === 'string') return firstImage;
    return firstImage.url || '/placeholder.svg';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use custom handler if provided, otherwise use default cart
    if (customAddToCart) {
      customAddToCart(e);
    } else {
      addItem({ id: id.toString(), name, price, unit });
    }
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Image failed to load for product: ${name} (ID: ${id})`);
    console.error('Failed URL:', e.currentTarget.src);
    
    // Call the onImageError prop if provided
    if (onImageError) {
      onImageError();
    } else {
      // Fallback to placeholder if no error handler provided
      (e.target as HTMLImageElement).src = '/placeholder.svg';
    }
  };

  return (
    <div 
      className="group cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img 
            src={getImageUrl()}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badge && (
              <Badge className="bg-store-badge text-primary-foreground border-none">
                {badge}
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-store-amber text-primary-foreground border-none">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button 
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-900"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle wishlist functionality here
              console.log('Add to wishlist:', id);
            }}
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          {rating && rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < Math.floor(rating) 
                        ? 'fill-store-amber text-store-amber' 
                        : i < rating
                        ? 'fill-store-amber/50 text-store-amber/50'
                        : 'text-border'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-medium text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          {/* Unit */}
          <p className="text-xs text-muted-foreground mb-3">{unit}</p>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-foreground">
                MK {price.toLocaleString()}
              </span>
              {original_price && original_price > price && (
                <p className="text-xs text-muted-foreground line-through">
                  MK {original_price.toLocaleString()}
                </p>
              )}
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;