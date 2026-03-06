// src/pages/CategoryPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Filter, Grid3x3, LayoutList, ChevronDown, 
  Star, TrendingUp, Clock, Package, Truck, Shield, 
  ChevronRight, X, SlidersHorizontal
} from 'lucide-react';
import { getCategoryBySlug, getAllCategories } from '@/data/categories';
import { Product } from '@/types/product';
import ProductCard from '@/components/store/ProductCard';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

// Mock product data
const allProducts: Product[] = [
  { id: 'p1', name: 'Fresh Tomatoes', price: 2500, unit: '1 kg', image: tomatoesImg, rating: 5, badge: 'Popular', category: 'fresh-produce' },
  { id: 'p2', name: 'Red Onions', price: 1800, unit: '1 kg', image: onionsImg, rating: 4, category: 'fresh-produce' },
  { id: 'p3', name: 'White Rice', price: 8500, originalPrice: 9500, unit: '5 kg bag', image: riceImg, badge: 'Sale', category: 'pantry-essentials' },
  { id: 'p4', name: 'Cooking Oil', price: 4500, unit: '2 Litres', image: cookingOilImg, rating: 5, category: 'pantry-essentials' },
  { id: 'p5', name: 'Farm Eggs', price: 6000, unit: 'Tray of 30', image: eggsImg, rating: 5, badge: 'Best Seller', category: 'dairy-eggs' },
  { id: 'p6', name: 'White Sugar', price: 3200, unit: '2 kg', image: sugarImg, rating: 4, category: 'pantry-essentials' },
  { id: 'p7', name: 'Maize Flour', price: 5500, originalPrice: 6200, unit: '5 kg', image: maizeFlourImg, badge: 'Sale', category: 'pantry-essentials' },
  { id: 'p8', name: 'Fresh Milk', price: 2800, unit: '2 Litres', image: milkImg, rating: 4, category: 'dairy-eggs' },
  { id: 'p9', name: 'White Bread', price: 1500, unit: '1 loaf', image: breadImg, rating: 4, category: 'daily-fresh' },
  { id: 'p10', name: 'Green Vegetables', price: 800, unit: 'Bundle', image: vegetablesImg, category: 'fresh-produce' },
  { id: 'p11', name: 'Kidney Beans', price: 3500, unit: '2 kg', image: beansImg, rating: 4, category: 'pantry-essentials' },
  { id: 'p12', name: 'Fresh Fruits', price: 3000, unit: 'Mixed Pack', image: fruitsImg, rating: 5, badge: 'New', category: 'fruits' },
];

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState(getCategoryBySlug(slug || ''));
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    setCategory(getCategoryBySlug(slug || ''));
    
    // Filter products by category
    let filtered = allProducts.filter(p => p.category === slug);
    
    // Apply sorting
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    // 'popular' - keep original order
    
    setProducts(filtered);
  }, [slug, sortBy]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-store-green-light/30 flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Category Not Found</h2>
            <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist or has been moved.</p>
            <Link to="/">
              <Button className="store-gradient text-primary-foreground h-12 px-8 rounded-xl">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const CategoryIcon = category.icon;

  // Mock brands for filter
  const brands = ['Local Farm', 'Imported', 'Organic', 'Premium', 'Budget'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium text-foreground">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Category Banner */}
      <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl ${category.color} flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
              <CategoryIcon className="w-14 h-14 md:w-20 md:h-20" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-4 bg-primary/10 text-primary border-none px-4 py-1.5 text-sm inline-flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                {products.length} Products Available
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-3">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
                {category.desc}. Discover our wide selection of high-quality products at the best prices.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-sm">Free delivery over MK 50,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm">100% Quality Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm">Same-day delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className={`hidden lg:block w-64 flex-shrink-0 transition-all duration-300 ${showFilters ? 'block' : ''}`}>
            <div className="sticky top-[140px] space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg">Filters</h3>
                <button className="text-sm text-primary hover:underline">Clear all</button>
              </div>

              {/* Price Range Filter */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Price Range
                </h4>
                <div className="space-y-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    className="w-full accent-primary"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>MK 0</span>
                    <span className="font-medium">MK {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Brands Filter */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h4 className="font-medium mb-4">Brands</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <h4 className="font-medium mb-4">Customer Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < rating ? 'fill-store-amber text-store-amber' : 'text-border'}`} 
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <Button className="w-full store-gradient text-primary-foreground rounded-xl">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-card rounded-xl p-4 mb-6 border border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                <span className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{products.length}</span> products
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-card border border-border rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-card shadow-xl animate-slide-in-right">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-semibold text-xl">Filters</h3>
                      <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-muted rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Mobile Filter Content - Same as desktop but with close button */}
                    <div className="space-y-6">
                      {/* Price Range */}
                      <div>
                        <h4 className="font-medium mb-4">Price Range</h4>
                        <input type="range" min="0" max="10000" className="w-full accent-primary" />
                        <div className="flex justify-between mt-2 text-sm">
                          <span>MK 0</span>
                          <span className="font-medium">MK 10,000</span>
                        </div>
                      </div>

                      {/* Brands */}
                      <div>
                        <h4 className="font-medium mb-4">Brands</h4>
                        {brands.map(brand => (
                          <label key={brand} className="flex items-center gap-2 mb-2">
                            <input type="checkbox" className="rounded border-border" />
                            <span className="text-sm">{brand}</span>
                          </label>
                        ))}
                      </div>

                      {/* Apply Button */}
                      <Button className="w-full store-gradient text-primary-foreground rounded-xl">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <div className={`w-24 h-24 rounded-3xl ${category.color} flex items-center justify-center mx-auto mb-4`}>
                  <CategoryIcon className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-display font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-6">We're stocking this category. Check back soon!</p>
                <Link to="/">
                  <Button variant="outline" className="rounded-xl">
                    Browse Other Categories
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                }>
                  {products.map(product => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
                
                {/* Load More */}
                {products.length > 8 && (
                  <div className="text-center mt-10">
                    <Button variant="outline" className="px-8 h-12 rounded-xl border-2 hover:border-primary transition-colors">
                      Load More Products
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Related Categories */}
      <section className="py-12 bg-muted/30 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8 text-center">
            Explore Related Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {getAllCategories()
              .filter(cat => cat.slug !== slug)
              .slice(0, 6)
              .map(relCat => {
                const RelIcon = relCat.icon;
                return (
                  <Link
                    key={relCat.id}
                    to={`/category/${relCat.slug}`}
                    className="group bg-card rounded-xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1 border border-border"
                  >
                    <div className={`w-12 h-12 rounded-xl ${relCat.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <RelIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-sm">{relCat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{relCat.desc}</p>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-b from-transparent to-store-green-light/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-store-green-light/30 flex items-center justify-center mx-auto mb-3">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">Free Delivery</h4>
              <p className="text-xs text-muted-foreground">On orders over MK 50,000</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-store-amber-light/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-store-amber" />
              </div>
              <h4 className="font-semibold text-sm">Quality Guarantee</h4>
              <p className="text-xs text-muted-foreground">100% fresh products</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-store-warm-light/30 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-store-warm" />
              </div>
              <h4 className="font-semibold text-sm">Same-Day Delivery</h4>
              <p className="text-xs text-muted-foreground">Order before 2 PM</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-store-green-light/30 flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-sm">Family Packages</h4>
              <p className="text-xs text-muted-foreground">Save more with bundles</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;