import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Sun,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Coffee,
  Moon,
  Cloud,
  Save,
  ArrowLeft,
  X,
  Leaf,
  Users,
  Tag,
  AlertTriangle,
  Camera,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
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
import { useToast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { productService } from '@/services/productService';
import type { DailyFreshProduct } from '@/types/service.types';

// API base URL for API calls (from .env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Static files base URL (remove /api from API_BASE_URL)
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

// Get the service ID for daily fresh
const DAILY_SERVICE_ID = '2'; // From your database, daily service has id=2

const timeOptions = [
  { value: 'morning', label: 'Morning (6AM - 11AM)', icon: Coffee },
  { value: 'afternoon', label: 'Afternoon (11AM - 4PM)', icon: Sun },
  { value: 'evening', label: 'Evening (4PM - 8PM)', icon: Moon },
  { value: 'all-day', label: 'All Day', icon: Clock }
];

const categoryOptions = [
  { value: 'bakery', label: 'Bakery' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'meat', label: 'Meat' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'ready-to-eat', label: 'Ready to Eat' }
];

// Helper function to get full image URL for display
const getFullImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath || imagePath === '/placeholder.svg' || imagePath.includes('placeholder')) {
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a blob URL (preview), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Extract just the filename if it's a full path
  let filename = imagePath;
  if (imagePath.includes('/')) {
    filename = imagePath.split('/').pop() || '';
  }
  
  // Use STATIC_BASE_URL for images (without /api)
  return `${STATIC_BASE_URL}/uploads/products/${filename}`;
};

// Helper function to extract filename from URL or path
const extractFilename = (url: string): string => {
  if (!url) return '';
  // If it's a full URL, extract the filename
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

const DailyFresh = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<DailyFreshProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DailyFreshProduct | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkFreshness, setBulkFreshness] = useState(1);

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: '',
    image: '',
    badge: '',
    category: 'bakery',
    timeAvailable: 'morning',
    freshness: '1',
    stock: '',
    limit: '',
    organic: false,
    local: false,
    status: 'active'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getDailyFreshProducts(DAILY_SERVICE_ID);
      console.log('Fetched daily fresh products:', data);
      
      // Debug: Check what image URLs look like
      if (data.length > 0) {
        console.log('Raw image from API:', data[0].image);
        console.log('Processed image URL:', getFullImageUrl(data[0].image));
        console.log('STATIC_BASE_URL:', STATIC_BASE_URL);
      }
      
      setProducts(data);
    } catch (error) {
      console.error('Error fetching daily fresh products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: DailyFreshProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      image: product.image || '',
      badge: product.badge || '',
      category: product.category,
      timeAvailable: product.timeAvailable,
      freshness: product.freshness.toString(),
      stock: product.stock.toString(),
      limit: product.limit?.toString() || '',
      organic: product.organic || false,
      local: product.local || false,
      status: product.status
    });

    // Set image preview if exists - convert filename to full URL for preview
    if (product.image && product.image !== '/placeholder.svg') {
      setImagePreview(getFullImageUrl(product.image));
    }

    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await serviceService.deleteDailyFreshProduct(DAILY_SERVICE_ID, productToDelete);
      
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true);
    
    try {
      let imageUrl = formData.image;

      // Upload image if a new file was selected
      if (imageFile) {
        try {
          const uploadedUrls = await productService.uploadImages([imageFile]);
          imageUrl = uploadedUrls[0]; // This returns just the filename
          console.log('Image uploaded, filename:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: 'Warning',
            description: 'Image upload failed, but product will be saved without image.',
            variant: 'default',
          });
        }
      }

      const productData: any = {
        serviceId: DAILY_SERVICE_ID,
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: null, // Daily fresh products typically don't have original price
        unit: formData.unit,
        image: imageUrl || '/placeholder.svg',
        badge: formData.badge || undefined,
        category: formData.category,
        timeAvailable: formData.timeAvailable as 'morning' | 'afternoon' | 'evening' | 'all-day',
        freshness: parseInt(formData.freshness),
        stock: parseInt(formData.stock),
        limit: formData.limit ? parseInt(formData.limit) : undefined,
        organic: formData.organic,
        local: formData.local,
        status: formData.status as 'active' | 'inactive'
      };

      if (editingProduct) {
        // Update existing product
        await serviceService.updateDailyFreshProduct(DAILY_SERVICE_ID, editingProduct.id, productData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        // Create new product
        await serviceService.createDailyFreshProduct(DAILY_SERVICE_ID, productData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }

      // Refresh the list
      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBulkFreshnessUpdate = async () => {
    try {
      for (const productId of selectedProducts) {
        await serviceService.updateFreshness(DAILY_SERVICE_ID, productId, bulkFreshness);
      }
      
      setProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) 
          ? { ...p, freshness: bulkFreshness, updatedAt: new Date().toISOString() }
          : p
      ));
      
      toast({
        title: 'Success',
        description: `Updated freshness for ${selectedProducts.length} products`,
      });
      
      setBulkUpdateDialog(false);
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error updating freshness:', error);
      toast({
        title: 'Error',
        description: 'Failed to update freshness',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      unit: '',
      image: '',
      badge: '',
      category: 'bakery',
      timeAvailable: 'morning',
      freshness: '1',
      stock: '',
      limit: '',
      organic: false,
      local: false,
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleDuplicate = async (product: DailyFreshProduct) => {
    try {
      const { id, createdAt, updatedAt, ...productData } = product;
      await serviceService.createDailyFreshProduct(DAILY_SERVICE_ID, {
        ...productData,
        name: `${product.name} (Copy)`,
      });
      
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

  const getTimeIcon = (time: string) => {
    switch(time) {
      case 'morning': return <Coffee className="w-4 h-4" />;
      case 'afternoon': return <Sun className="w-4 h-4" />;
      case 'evening': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTimeBadge = (time: string) => {
    switch(time) {
      case 'morning':
        return <Badge className="bg-amber-500 text-white gap-1"><Coffee className="w-3 h-3" /> Morning</Badge>;
      case 'afternoon':
        return <Badge className="bg-orange-500 text-white gap-1"><Sun className="w-3 h-3" /> Afternoon</Badge>;
      case 'evening':
        return <Badge className="bg-purple-500 text-white gap-1"><Moon className="w-3 h-3" /> Evening</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> All Day</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFreshnessColor = (hours: number) => {
    if (hours <= 2) return 'text-green-600 bg-green-100';
    if (hours <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTime = selectedTime === 'all' || product.timeAvailable === selectedTime;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesTime && matchesCategory && matchesStatus;
  });

  if (loading) {
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
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/services')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Daily Fresh</h1>
            <p className="text-muted-foreground mt-1">
              Manage your daily fresh products
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {selectedProducts.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setBulkUpdateDialog(true)}
            >
              <Timer className="w-4 h-4 mr-2" />
              Update Freshness ({selectedProducts.length})
            </Button>
          )}
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-xl font-bold">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-xl font-bold">{products.filter(p => p.stock > 0).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-xl font-bold">{products.filter(p => p.stock < 10).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organic</p>
              <p className="text-xl font-bold">{products.filter(p => p.organic).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Local</p>
              <p className="text-xl font-bold">{products.filter(p => p.local).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                {timeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Freshness</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or add a new product
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                          <img 
                            src={getFullImageUrl(product.image)} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', e.currentTarget.src);
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.unit}</p>
                          {product.badge && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTimeBadge(product.timeAvailable)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">MK {product.price.toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <span className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>
                        {product.stock}
                      </span>
                      {product.limit && (
                        <p className="text-xs text-muted-foreground">Limit: {product.limit}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getFreshnessColor(product.freshness)}`}>
                          <Timer className="w-3 h-3 inline mr-1" />
                          {product.freshness}h
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h2 className="text-2xl font-display font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Fresh Bread"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (MK) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit *</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          placeholder="e.g., 1 loaf"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stock">Stock Quantity *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="limit">Purchase Limit</Label>
                        <Input
                          id="limit"
                          type="number"
                          value={formData.limit}
                          onChange={(e) => setFormData({...formData, limit: e.target.value})}
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({...formData, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timeAvailable">Time Available *</Label>
                      <Select 
                        value={formData.timeAvailable} 
                        onValueChange={(value) => setFormData({...formData, timeAvailable: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <Label>Product Image</Label>
                      <div className="mt-2">
                        {imagePreview ? (
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                            <input
                              type="file"
                              id="image-upload"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <Camera className="w-8 h-8 text-muted-foreground" />
                              <span className="text-sm font-medium">Click to upload image</span>
                              <span className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP up to 5MB
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="badge">Badge</Label>
                      <Input
                        id="badge"
                        value={formData.badge}
                        onChange={(e) => setFormData({...formData, badge: e.target.value})}
                        placeholder="e.g., Freshly Baked"
                      />
                    </div>

                    <div>
                      <Label htmlFor="freshness">Freshness (hours) *</Label>
                      <div className="space-y-3">
                        <Slider
                          value={[parseInt(formData.freshness)]}
                          onValueChange={(value) => setFormData({...formData, freshness: value[0].toString()})}
                          max={12}
                          step={1}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Fresh (0-2h)</span>
                          <span>Good (2-4h)</span>
                          <span>Soon (4h+)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="organic"
                          checked={formData.organic}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, organic: checked as boolean})
                          }
                        />
                        <Label htmlFor="organic">Organic Product</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="local"
                          checked={formData.local}
                          onCheckedChange={(checked) => 
                            setFormData({...formData, local: checked as boolean})
                          }
                        />
                        <Label htmlFor="local">Locally Sourced</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Freshness Update Dialog */}
      <AlertDialog open={bulkUpdateDialog} onOpenChange={setBulkUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Freshness</AlertDialogTitle>
            <AlertDialogDescription>
              Set freshness hours for {selectedProducts.length} selected products
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="bulkFreshness">Freshness (hours)</Label>
            <div className="space-y-3">
              <Slider
                value={[bulkFreshness]}
                onValueChange={(value) => setBulkFreshness(value[0])}
                max={12}
                step={1}
                className="py-4"
              />
              <div className="text-center font-medium">{bulkFreshness} hours</div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkFreshnessUpdate}>
              Update {selectedProducts.length} Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
};

export default DailyFresh;