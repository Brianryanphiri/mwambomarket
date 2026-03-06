import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Grid3x3, LayoutList, ChevronDown, 
  X, SlidersHorizontal, Star, TrendingUp, Package,
  ChevronLeft, ChevronRight, Leaf, Drumstick, Egg,
  Warehouse, SprayCan, Users, Sun, CalendarClock,
  Sparkles, Flame, ShoppingCart, Truck, Loader2
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product.types';

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
  
  // If it's a blob URL (shouldn't happen in products page), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // For development, add the base URL - IMPORTANT: no /products in the path
  return `http://localhost:5001/uploads/${filename}`;
};

// Helper function to process product images
const processProductImages = (product: Product): Product => {
  if (!product) return product;

  // Create a copy to avoid mutating the original
  const processedProduct = { ...product };

  // Process images array
  if (processedProduct.images && Array.isArray(processedProduct.images)) {
    processedProduct.images = processedProduct.images.map(img => {
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

  return processedProduct;
};

// Categories with icons
const categories = [
  { id: 'all', name: 'All Products', icon: Package },
  { id: 'Fresh Produce', name: 'Fresh Produce', icon: Leaf },
  { id: 'Meat & Chicken', name: 'Meat & Chicken', icon: Drumstick },
  { id: 'Dairy & Eggs', name: 'Dairy & Eggs', icon: Egg },
  { id: 'Pantry Essentials', name: 'Pantry Essentials', icon: Warehouse },
  { id: 'Household', name: 'Household', icon: SprayCan },
  { id: 'Bakery', name: 'Bakery', icon: Sun },
  { id: 'Beverages', name: 'Beverages', icon: Sparkles },
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const ProductsPage = () => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const productsPerPage = 12;

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, selectedCategory, searchQuery, inStockOnly, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filters: any = {
        page: currentPage,
        limit: productsPerPage,
        sortBy: sortBy === 'price-low' ? 'price' : 
                sortBy === 'price-high' ? 'price' : 
                sortBy === 'newest' ? 'created_at' : 'sold_count',
        sortOrder: sortBy === 'price-low' ? 'asc' : 
                   sortBy === 'price-high' ? 'desc' : 'desc'
      };

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      if (inStockOnly) {
        filters.in_stock = 'true';
      }

      if (priceRange[1] < 50000) {
        filters.max_price = priceRange[1];
      }

      const response = await productService.getPublicProducts(filters);
      
      // Process images for each product
      const processedProducts = response.products.map(processProductImages);
      
      setProducts(processedProducts);
      setFilteredProducts(processedProducts);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
      
      console.log('Fetched products:', processedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply local filters (ones that can't be done server-side)
  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      // Apply local filters if needed
      // Most filtering is done server-side now

      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory, searchQuery, inStockOnly, priceRange]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange([0, 50000]);
    setInStockOnly(false);
    setSortBy('popular');
    setCurrentPage(1);
    fetchProducts();
  };

  if (loading && products.length === 0) {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              All Products
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Discover our wide selection of fresh groceries, household essentials, and family packages
            </p>
            <div className="flex items-center gap-4">
              <Badge className="bg-primary/10 text-primary px-4 py-2">
                {totalProducts} Products Available
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                Free delivery over MK 50,000
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Filter Toggle (Mobile) */}
          <Button
            variant="outline"
            className="lg:hidden h-12"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {(selectedCategory !== 'all' || inStockOnly) && (
              <Badge className="ml-2 bg-primary text-primary-foreground">!</Badge>
            )}
          </Button>

          {/* Sort Dropdown */}
          <div className="relative min-w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-border bg-background appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="hidden lg:flex items-center border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`
            lg:w-64 flex-shrink-0
            ${showFilters ? 'block' : 'hidden lg:block'}
          `}>
            <div className="sticky top-[140px] space-y-6 bg-card rounded-2xl border border-border p-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setCurrentPage(1);
                          fetchProducts();
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{cat.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3">Max Price</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>MK 0</span>
                    <span className="font-medium">MK {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Availability */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                      fetchProducts();
                    }}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">
                  {((currentPage - 1) * productsPerPage) + 1}
                </span> -{' '}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>{' '}
                of <span className="font-medium text-foreground">{totalProducts}</span> products
              </p>
              
              {/* Mobile View Toggle */}
              <div className="flex lg:hidden items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                }>
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 ${
                            currentPage === pageNum ? 'bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-muted/30 py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">100+ Products</h4>
              <p className="text-xs text-muted-foreground">Wide selection</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-sm">Family Packages</h4>
              <p className="text-xs text-muted-foreground">Save more</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-sm">Free Delivery</h4>
              <p className="text-xs text-muted-foreground">Over MK 50,000</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">Fresh Daily</h4>
              <p className="text-xs text-muted-foreground">Quality guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductsPage;