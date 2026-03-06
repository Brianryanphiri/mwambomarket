import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
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
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Percent,
  ShoppingBag,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  X,
  Camera,
  Trash,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Flame,
  Utensils
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
import type { FamilyPackage } from '@/types/service.types';

const familySizeOptions = [
  { value: 'small', label: 'Small (2-3 people)' },
  { value: 'medium', label: 'Medium (4-5 people)' },
  { value: 'large', label: 'Large (6+ people)' }
];

interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

const FamilyPackages = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [packages, setPackages] = useState<FamilyPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<FamilyPackage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Nutrition info state
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });

  // Get the service ID for family packages
  const FAMILY_SERVICE_ID = '1'; // From your database, family service has id=1

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    items: '',
    familySize: 'small',
    savings: '',
    tags: '',
    includes: '',
    popular: false,
    bestValue: false,
    status: 'active'
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      // Fetch from database using the service
      const data = await serviceService.getFamilyPackages(FAMILY_SERVICE_ID);
      console.log('Fetched family packages:', data);
      setPackages(data);
    } catch (error) {
      console.error('Error fetching family packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: FamilyPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice?.toString() || '',
      image: pkg.image || '',
      items: pkg.items.toString(),
      familySize: pkg.familySize,
      savings: pkg.savings.toString(),
      tags: pkg.tags?.join(', ') || '',
      includes: pkg.includes?.join(', ') || '',
      popular: pkg.popular || false,
      bestValue: pkg.bestValue || false,
      status: pkg.status
    });

    // Set image preview if exists
    if (pkg.image && pkg.image !== '/placeholder.svg') {
      setImagePreview(pkg.image);
    }

    // Parse nutrition info if exists
    if (pkg.nutrition) {
      try {
        const nutrition = typeof pkg.nutrition === 'string' 
          ? JSON.parse(pkg.nutrition) 
          : pkg.nutrition;
        setNutritionInfo(nutrition);
      } catch (e) {
        console.error('Error parsing nutrition info:', e);
      }
    }

    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPackageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;
    
    try {
      await serviceService.deleteFamilyPackage(FAMILY_SERVICE_ID, packageToDelete);
      
      setPackages(prev => prev.filter(p => p.id !== packageToDelete));
      toast({
        title: 'Success',
        description: 'Family package deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete package',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
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
          imageUrl = uploadedUrls[0];
          console.log('Image uploaded:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: 'Warning',
            description: 'Image upload failed, but package will be saved without image.',
            variant: 'default',
          });
        }
      }

      const packageData: any = {
        serviceId: FAMILY_SERVICE_ID,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        image: imageUrl || '/placeholder.svg',
        items: parseInt(formData.items),
        familySize: formData.familySize as 'small' | 'medium' | 'large',
        savings: parseFloat(formData.savings),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        includes: formData.includes.split(',').map(i => i.trim()).filter(Boolean),
        popular: formData.popular,
        bestValue: formData.bestValue,
        status: formData.status as 'active' | 'inactive',
        nutrition: nutritionInfo
      };

      if (editingPackage) {
        // Update existing package
        await serviceService.updateFamilyPackage(FAMILY_SERVICE_ID, editingPackage.id, packageData);
        toast({
          title: 'Success',
          description: 'Family package updated successfully',
        });
      } else {
        // Create new package
        await serviceService.createFamilyPackage(FAMILY_SERVICE_ID, packageData);
        toast({
          title: 'Success',
          description: 'Family package created successfully',
        });
      }

      // Refresh the list
      fetchPackages();
      setShowForm(false);
      setEditingPackage(null);
      resetForm();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: 'Error',
        description: 'Failed to save package',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      items: '',
      familySize: 'small',
      savings: '',
      tags: '',
      includes: '',
      popular: false,
      bestValue: false,
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
    setNutritionInfo({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });
  };

  const handleDuplicate = async (pkg: FamilyPackage) => {
    try {
      const { id, createdAt, updatedAt, ...packageData } = pkg;
      await serviceService.createFamilyPackage(FAMILY_SERVICE_ID, {
        ...packageData,
        name: `${pkg.name} (Copy)`,
      });
      
      toast({
        title: 'Success',
        description: 'Package duplicated successfully',
      });
      
      fetchPackages();
    } catch (error) {
      console.error('Error duplicating package:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate package',
        variant: 'destructive',
      });
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

  const getFamilySizeBadge = (size: string) => {
    switch(size) {
      case 'small':
        return <Badge className="bg-blue-500 text-white">Small</Badge>;
      case 'medium':
        return <Badge className="bg-purple-500 text-white">Medium</Badge>;
      case 'large':
        return <Badge className="bg-orange-500 text-white">Large</Badge>;
      default:
        return <Badge variant="outline">{size}</Badge>;
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = selectedSize === 'all' || pkg.familySize === selectedSize;
    const matchesStatus = selectedStatus === 'all' || pkg.status === selectedStatus;
    return matchesSearch && matchesSize && matchesStatus;
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
            <h1 className="text-3xl font-display font-bold">Family Packages</h1>
            <p className="text-muted-foreground mt-1">
              Manage your family package offerings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPackages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
            onClick={() => {
              setEditingPackage(null);
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Packages</p>
              <p className="text-xl font-bold">{packages.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{packages.filter(p => p.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
              <p className="text-xl font-bold">
                {(packages.reduce((sum, p) => sum + (p.rating || 0), 0) / (packages.length || 1)).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Savings</p>
              <p className="text-xl font-bold">
                MK {packages.reduce((sum, p) => sum + (p.savings || 0), 0).toLocaleString()}
              </p>
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
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Family Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small (2-3)</SelectItem>
                <SelectItem value="medium">Medium (4-5)</SelectItem>
                <SelectItem value="large">Large (6+)</SelectItem>
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

      {/* Packages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Family Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-lg font-medium">No packages found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your filters or add a new package
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                          <img 
                            src={pkg.image || '/placeholder.svg'} 
                            alt={pkg.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{pkg.description}</p>
                          {pkg.popular && (
                            <Badge className="mt-1 bg-yellow-500 text-white text-xs">Popular</Badge>
                          )}
                          {pkg.bestValue && (
                            <Badge className="mt-1 bg-green-500 text-white text-xs ml-1">Best Value</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getFamilySizeBadge(pkg.familySize)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">MK {pkg.price?.toLocaleString()}</p>
                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            MK {pkg.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pkg.items} items</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white">
                        MK {pkg.savings?.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{pkg.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(pkg)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(pkg)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(pkg.id)}
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
                  {editingPackage ? 'Edit Package' : 'Add New Package'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Package Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g., Starter Family Pack"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Package description..."
                          rows={3}
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
                          <Label htmlFor="originalPrice">Original Price (MK)</Label>
                          <Input
                            id="originalPrice"
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="items">Number of Items *</Label>
                          <Input
                            id="items"
                            type="number"
                            value={formData.items}
                            onChange={(e) => setFormData({...formData, items: e.target.value})}
                            placeholder="0"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="savings">Savings (MK) *</Label>
                          <Input
                            id="savings"
                            type="number"
                            value={formData.savings}
                            onChange={(e) => setFormData({...formData, savings: e.target.value})}
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="familySize">Family Size *</Label>
                        <Select 
                          value={formData.familySize} 
                          onValueChange={(value) => setFormData({...formData, familySize: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select family size" />
                          </SelectTrigger>
                          <SelectContent>
                            {familySizeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Image Upload */}
                      <div>
                        <Label>Package Image</Label>
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
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                          placeholder="e.g., Popular, Best Value, New"
                        />
                      </div>

                      <div>
                        <Label htmlFor="includes">Includes (comma separated) *</Label>
                        <Textarea
                          id="includes"
                          value={formData.includes}
                          onChange={(e) => setFormData({...formData, includes: e.target.value})}
                          placeholder="e.g., Vegetables, Fruits, Rice 2kg"
                          rows={3}
                          required
                        />
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
                            id="popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => 
                              setFormData({...formData, popular: checked as boolean})
                            }
                          />
                          <Label htmlFor="popular">Mark as Popular</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="bestValue"
                            checked={formData.bestValue}
                            onCheckedChange={(checked) => 
                              setFormData({...formData, bestValue: checked as boolean})
                            }
                          />
                          <Label htmlFor="bestValue">Mark as Best Value</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Nutrition Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    Nutrition Information (per serving)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <div className="relative">
                        <Input
                          id="calories"
                          type="number"
                          value={nutritionInfo.calories || ''}
                          onChange={(e) => setNutritionInfo({
                            ...nutritionInfo,
                            calories: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Flame className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <div className="relative">
                        <Input
                          id="protein"
                          type="number"
                          value={nutritionInfo.protein || ''}
                          onChange={(e) => setNutritionInfo({
                            ...nutritionInfo,
                            protein: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Beef className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <div className="relative">
                        <Input
                          id="carbs"
                          type="number"
                          value={nutritionInfo.carbs || ''}
                          onChange={(e) => setNutritionInfo({
                            ...nutritionInfo,
                            carbs: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Wheat className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <div className="relative">
                        <Input
                          id="fat"
                          type="number"
                          value={nutritionInfo.fat || ''}
                          onChange={(e) => setNutritionInfo({
                            ...nutritionInfo,
                            fat: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                          className="pl-8"
                        />
                        <Droplets className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fiber">Fiber (g)</Label>
                      <Input
                        id="fiber"
                        type="number"
                        value={nutritionInfo.fiber || ''}
                        onChange={(e) => setNutritionInfo({
                          ...nutritionInfo,
                          fiber: parseInt(e.target.value) || 0
                        })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sugar">Sugar (g)</Label>
                      <Input
                        id="sugar"
                        type="number"
                        value={nutritionInfo.sugar || ''}
                        onChange={(e) => setNutritionInfo({
                          ...nutritionInfo,
                          sugar: parseInt(e.target.value) || 0
                        })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sodium">Sodium (mg)</Label>
                      <Input
                        id="sodium"
                        type="number"
                        value={nutritionInfo.sodium || ''}
                        onChange={(e) => setNutritionInfo({
                          ...nutritionInfo,
                          sodium: parseInt(e.target.value) || 0
                        })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Leave empty if nutrition information is not available
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPackage(null);
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
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this family package? This action cannot be undone.
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

export default FamilyPackages;