import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, Filter, Grid3x3, LayoutList, ChevronDown, 
  X, SlidersHorizontal, Star, TrendingUp, Package,
  ChevronLeft, ChevronRight, Leaf, Drumstick, Egg,
  Warehouse, SprayCan, Users, Sun, Sparkles,
  Loader2, Sliders, Check, ShoppingCart
} from 'lucide-react';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@/types/product.types';

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

// Skeleton loader for product cards
const ProductCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
    <div className="aspect-square bg-muted" />
    <div className="p-4">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-6 bg-muted rounded w-1/3" />
    </div>
  </div>
);

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Best Sellers' },
  { value: 'rating', label: 'Top Rated' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  // Filters from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? searchParams.get('category')!.split(',') : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('on_sale') === 'true');
  const [organicOnly, setOrganicOnly] = useState(searchParams.get('organic') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
    updateUrlParams();
  }, [
    currentPage, searchQuery, selectedCategories, 
    priceRange, inStockOnly, onSaleOnly, organicOnly, sortBy
  ]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', productsPerPage.toString());
      params.append('status', 'active');

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
      if (priceRange[1] < 50000) params.append('max_price', priceRange[1].toString());
      if (inStockOnly) params.append('in_stock', 'true');
      if (onSaleOnly) params.append('on_sale', 'true');
      if (organicOnly) params.append('organic', 'true');

      // Add sorting
      switch (sortBy) {
        case 'price_asc':
          params.append('sortBy', 'price');
          params.append('sortOrder', 'asc');
          break;
        case 'price_desc':
          params.append('sortBy', 'price');
          params.append('sortOrder', 'desc');
          break;
        case 'popular':
          params.append('sortBy', 'sold_count');
          params.append('sortOrder', 'desc');
          break;
        case 'rating':
          params.append('sortBy', 'rating');
          params.append('sortOrder', 'desc');
          break;
        case 'newest':
        default:
          params.append('sortBy', 'created_at');
          params.append('sortOrder', 'desc');
          break;
      }

      const response = await fetch(`${API_URL}/products?${params.toString()}`);
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (priceRange[1] < 50000) params.set('max_price', priceRange[1].toString());
    if (inStockOnly) params.set('in_stock', 'true');
    if (onSaleOnly) params.set('on_sale', 'true');
    if (organicOnly) params.set('organic', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryName]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== categoryName));
    }
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([0, value[0]]);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setOrganicOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedCategories.length > 0 || 
    priceRange[1] < 50000 || 
    inStockOnly || 
    onSaleOnly || 
    organicOnly;

  // Filter UI component (used in both desktop sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h4 className="font-medium mb-3">Search</h4>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </form>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category.name, checked as boolean)
                }
              />
              <Label 
                htmlFor={`cat-${category.id}`}
                className="text-sm cursor-pointer flex-1"
              >
                {category.name}
              </Label>
              <span className="text-xs text-muted-foreground">
                ({category.product_count || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range (MK)</h4>
        <div className="space-y-3">
          <Slider
            min={0}
            max={50000}
            step={1000}
            value={[priceRange[1]]}
            onValueChange={handlePriceRangeChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>MK 0</span>
            <span className="font-medium">MK {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <div>
        <h4 className="font-medium mb-3">Filters</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStockOnly}
              onCheckedChange={(checked) => {
                setInStockOnly(checked as boolean);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={onSaleOnly}
              onCheckedChange={(checked) => {
                setOnSaleOnly(checked as boolean);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer">
              On Sale Only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="organic"
              checked={organicOnly}
              onCheckedChange={(checked) => {
                setOrganicOnly(checked as boolean);
                setCurrentPage(1);
              }}
            />
            <Label htmlFor="organic" className="text-sm cursor-pointer">
              Organic Only
            </Label>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Shop All Products
          </h1>
          <p className="text-muted-foreground">
            Discover our wide selection of fresh groceries and household essentials
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Bar */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sliders className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-1 bg-primary text-primary-foreground">!</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border border-border rounded-lg overflow-hidden">
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
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-[140px] space-y-6 bg-card rounded-2xl border border-border p-6">
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">
                  {products.length > 0 ? ((currentPage - 1) * productsPerPage) + 1 : 0}
                </span> -{' '}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>{' '}
                of <span className="font-medium text-foreground">{totalProducts}</span> products
              </p>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
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
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    : "space-y-4"
                }>
                  {products.map(product => (
                    // FIX: ProductCard will handle its own image URL construction
                    <ProductCard key={product.id} product={product} />
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

      <Footer />
    </div>
  );
};

export default ProductsPage;