import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Copy,
  Download,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product.types';

// Helper function to extract filename from URL or path
const extractFilename = (url: string): string => {
  if (!url) return '';
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

// Helper function to get full image URL for display - FIXED: Added /products/ subfolder
const getImageUrl = (filename: string): string => {
  if (!filename) return '/placeholder.svg';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  if (filename.startsWith('blob:')) {
    return filename;
  }
  // FIXED: Added /products/ subfolder in the path
  return `http://localhost:5001/uploads/products/${filename}`;
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'inactive':
      return <Badge variant="destructive">Inactive</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Stock badge component
const StockBadge = ({ stock, lowStockAlert }: { stock: number; lowStockAlert?: number }) => {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  } else if (stock <= (lowStockAlert || 10)) {
    return <Badge className="bg-yellow-500">Low Stock ({stock})</Badge>;
  } else {
    return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock ({stock})</Badge>;
  }
};

const ProductList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Categories
  const [categories, setCategories] = useState<string[]>([]);
  
  // Selection
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  
  // Bulk status dialog
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatusAction, setBulkStatusAction] = useState<'active' | 'draft' | 'inactive'>('active');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  // FIX: Create a stable filters object using useMemo
  const filters = useMemo(() => ({
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy,
    page: currentPage,
    limit: itemsPerPage
  }), [searchTerm, categoryFilter, statusFilter, sortBy, currentPage]);

  // FIX: Use useCallback for fetchProducts to stabilize the function
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      
      // Map sortBy to backend sort parameter
      if (filters.sortBy === 'newest') params.sortBy = 'newest';
      else if (filters.sortBy === 'oldest') params.sortBy = 'oldest';
      else if (filters.sortBy === 'price_low') params.sortBy = 'price_asc';
      else if (filters.sortBy === 'price_high') params.sortBy = 'price_desc';
      else if (filters.sortBy === 'name_asc') params.sortBy = 'name_asc';
      else if (filters.sortBy === 'name_desc') params.sortBy = 'name_desc';
      else if (filters.sortBy === 'stock_low') params.sortBy = 'stock_asc';
      
      const response = await productService.getProducts(params);
      console.log('Fetched products:', response.products);
      setProducts(response.products || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.total || 0);
      
      // Calculate stats from response
      const activeCount = (response.products || []).filter(p => p.status === 'active').length;
      const outOfStockCount = (response.products || []).filter(p => p.stock <= 0).length;
      const lowStockCount = (response.products || []).filter(p => 
        p.stock > 0 && p.stock <= (p.low_stock_alert || 10)
      ).length;
      
      setStats({
        total: response.total || 0,
        active: activeCount,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]); // FIX: Depends on stable filters object

  // FIX: Use useCallback for fetchCategories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.categories?.map((c: any) => c.name) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // FIX: Fetch products only when filters change, with proper dependencies
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // FIX: Depends on stable fetchProducts function

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // FIX: Depends on stable fetchCategories function

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  }, [selectAll, products]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    // fetchProducts will be called automatically via useEffect due to filters change
  }, []);

  const handleRefresh = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    setSelectedProducts([]);
    setSelectAll(false);
    fetchCategories();
    // fetchProducts will be called automatically via useEffect due to filters change
  }, [fetchCategories]);

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productService.deleteProduct(productToDelete.toString());
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      await productService.bulkDeleteProducts(selectedProducts);
      toast({
        title: 'Success',
        description: `${selectedProducts.length} product(s) deleted successfully`,
      });
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete products',
        variant: 'destructive',
      });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      await productService.bulkUpdateStatus(selectedProducts, bulkStatusAction);
      toast({
        title: 'Success',
        description: `${selectedProducts.length} product(s) updated to ${bulkStatusAction}`,
      });
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product status',
        variant: 'destructive',
      });
    } finally {
      setBulkStatusDialogOpen(false);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await productService.duplicateProduct(id.toString());
      toast({
        title: 'Success',
        description: 'Product duplicated successfully',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate product',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await productService.exportProducts('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Products exported successfully',
      });
    } catch (error) {
      console.error('Error exporting products:', error);
      toast({
        title: 'Error',
        description: 'Failed to export products',
        variant: 'destructive',
      });
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const getProductImage = (product: Product): string => {
    try {
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
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

  // Stats cards - memoized to prevent unnecessary re-renders
  const statCards = useMemo(() => [
    {
      title: 'Total Products',
      value: stats.total,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Low Stock',
      value: stats.lowStock,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
  ], [stats]);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link to="/admin/products/new">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProducts} className="ml-auto">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name A-Z</SelectItem>
                  <SelectItem value="name_desc">Name Z-A</SelectItem>
                  <SelectItem value="price_low">Price Low-High</SelectItem>
                  <SelectItem value="price_high">Price High-Low</SelectItem>
                  <SelectItem value="stock_low">Stock Low-High</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleSearch}>
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <span className="font-medium">{selectedProducts.length} products selected</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  setBulkStatusAction('active');
                  setBulkStatusDialogOpen(true);
                }}>
                  Set Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setBulkStatusAction('draft');
                  setBulkStatusDialogOpen(true);
                }}>
                  Set Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setBulkStatusAction('inactive');
                  setBulkStatusDialogOpen(true);
                }}>
                  Set Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedProducts([]);
                setSelectAll(false);
              }}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first product'}
              </p>
              <Link to="/admin/products/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={(checked) => setSelectAll(checked as boolean)}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price (MK)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const imageUrl = getProductImage(product);
                    const isSelected = selectedProducts.includes(product.id);
                    
                    return (
                      <TableRow key={product.id} className={isSelected ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 rounded-lg">
                              <AvatarImage 
                                src={imageUrl} 
                                alt={product.name}
                                onError={(e) => {
                                  console.error('Image failed to load:', imageUrl);
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                              <AvatarFallback className="rounded-lg">
                                {product.name?.charAt(0) || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {product.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {product.sku || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              MK {Number(product.price || 0).toLocaleString()}
                            </p>
                            {product.original_price && 
                             Number(product.original_price) > Number(product.price) && (
                              <p className="text-xs text-muted-foreground line-through">
                                MK {Number(product.original_price).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StockBadge stock={product.stock || 0} lowStockAlert={product.low_stock_alert} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={product.status || 'draft'} />
                        </TableCell>
                        <TableCell>
                          {product.is_featured ? (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => navigate(`/product/${product.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDuplicate(product.id)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
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
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? 'bg-orange-500 hover:bg-orange-600' : ''}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProducts.length} selected products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">
              Delete {selectedProducts.length} Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Update Dialog */}
      <AlertDialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Product Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set {selectedProducts.length} selected products to {bulkStatusAction}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkStatusUpdate} className="bg-orange-500 hover:bg-orange-600">
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductList;