import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product.types';
import { Button } from '../ui/button';

// Helper function to extract filename from URL or path
const extractFilename = (url: string): string => {
  if (!url) return '';
  // If it's a full URL, extract the filename
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

// Helper function to get full image URL for display
const getImageUrl = (filename: string): string => {
  if (!filename) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If it's a blob URL (shouldn't happen in featured products), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // For development, add the base URL - IMPORTANT: no /products in the path
  return `http://localhost:5001/uploads/${filename}`;
};

// Helper function to process product images
const processProductImages = (product: Product): Product => {
  if (!product) return product;

  // Process images array
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(img => {
      let filename = '';
      
      if (typeof img === 'string') {
        filename = extractFilename(img);
        return getImageUrl(filename);
      } else if (img && typeof img === 'object' && 'url' in img) {
        filename = extractFilename(img.url);
        return {
          ...img,
          url: getImageUrl(filename)
        };
      }
      return img;
    });
  }

  return product;
};

// Fallback empty array to prevent errors
const fallbackProducts: Product[] = [];

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get featured products first
      let featuredProducts = await productService.getFeaturedProducts();
      
      if (featuredProducts && featuredProducts.length > 0) {
        // Process images for each product
        const processedProducts = featuredProducts.map(processProductImages);
        setProducts(processedProducts.slice(0, 12));
        setLoading(false);
        return;
      }
      
      // If no featured products, try best sellers
      try {
        const bestSellers = await productService.getBestSellers();
        if (bestSellers && bestSellers.length > 0) {
          // Process images for each product
          const processedProducts = bestSellers.map(processProductImages);
          setProducts(processedProducts.slice(0, 12));
          setLoading(false);
          return;
        }
      } catch (bestSellerError) {
        console.error('Error fetching best sellers:', bestSellerError);
      }
      
      // If still no products, get regular products
      try {
        const response = await productService.getPublicProducts({ limit: 12 });
        if (response.products && response.products.length > 0) {
          // Process images for each product
          const processedProducts = response.products.map(processProductImages);
          setProducts(processedProducts);
        } else {
          // If no products from API, use empty array
          setProducts([]);
        }
      } catch (publicError) {
        console.error('Error fetching public products:', publicError);
        setProducts([]);
      }
      
    } catch (error) {
      console.error('Error in fetchFeaturedProducts:', error);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-store-green-light/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-store-green-light/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Trending Now</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Popular Products
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Our customers' favorites — fresh, affordable, and delivered to your door
            </p>
          </div>
          
          <Link 
            to="/products" 
            className="group hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid or Loading/Error State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchFeaturedProducts} variant="outline">
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {products.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="text-center mt-8 sm:hidden">
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Quick Stats - Always show */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-primary">100+</div>
            <p className="text-xs text-muted-foreground">Products</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-primary">24h</div>
            <p className="text-xs text-muted-foreground">Delivery</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-primary">Fresh</div>
            <p className="text-xs text-muted-foreground">Daily Supply</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-primary">5k+</div>
            <p className="text-xs text-muted-foreground">Happy Customers</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;