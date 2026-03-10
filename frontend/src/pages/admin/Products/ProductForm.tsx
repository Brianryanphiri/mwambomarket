import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Star,
  Sparkles,
  Flame,
  Leaf,
  Home,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import type { ProductFormData, Category } from '@/types/product.types';

// Define categories based on your database
const categories = [
  { value: 'Fresh Produce', label: 'Fresh Produce' },
  { value: 'Dairy & Eggs', label: 'Dairy & Eggs' },
  { value: 'Meat & Chicken', label: 'Meat & Chicken' },
  { value: 'Pantry Essentials', label: 'Pantry Essentials' },
  { value: 'Bakery', label: 'Bakery' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Household', label: 'Household' }
];

const units = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'tray', label: 'Tray' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'head', label: 'Head' }
];

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'inactive', label: 'Inactive' }
];

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

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { createProduct, updateProduct, loading } = useProducts();
  const { toast } = useToast();
  
  const [formLoading, setFormLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]); // Images already in database (filenames only)
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // New images to upload
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]); // Previews for new images (blob URLs)
  const [uploadingImages, setUploadingImages] = useState(false);
  const [skuChecking, setSkuChecking] = useState(false);
  const [skuUnique, setSkuUnique] = useState<boolean | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [saveMode, setSaveMode] = useState<'save' | 'save_continue'>('save');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    stock: '',
    lowStockAlert: '10',
    minOrderQty: '1',
    maxOrderQty: '',
    weight: '',
    unit: 'piece',
    isTaxable: true,
    taxRate: '16',
    isPhysical: true,
    requiresShipping: true,
    status: 'draft',
    isFeatured: false,
    isBestSeller: false,
    isOnSale: false,
    isNew: false,
    organic: false,
    localProduct: false,
    saleEndDate: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  // FIX: Use useCallback for loadProduct to stabilize the function reference
  const loadProduct = useCallback(async () => {
    if (isEditing && id) {
      setFormLoading(true);
      try {
        const product = await productService.getProduct(id);
        console.log('Loaded product:', product);
        
        // Handle tags - convert array to comma-separated string
        const tagsString = product.tags ? 
          (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : '';
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          brand: product.brand || '',
          price: product.price?.toString() || '',
          comparePrice: product.comparePrice?.toString() || product.original_price?.toString() || '',
          costPrice: product.costPrice?.toString() || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          stock: product.stock?.toString() || '',
          lowStockAlert: product.lowStockAlert?.toString() || product.low_stock_alert?.toString() || '10',
          minOrderQty: product.minOrderQty?.toString() || product.min_order_qty?.toString() || '1',
          maxOrderQty: product.maxOrderQty?.toString() || product.max_order_qty?.toString() || '',
          weight: product.weight?.toString() || '',
          unit: product.unit || 'piece',
          isTaxable: product.isTaxable ?? product.is_taxable ?? true,
          taxRate: product.taxRate || product.tax_rate || '16',
          isPhysical: product.isPhysical ?? product.is_physical ?? true,
          requiresShipping: product.requiresShipping ?? product.requires_shipping ?? true,
          status: product.status || 'draft',
          isFeatured: product.isFeatured || product.is_featured || false,
          isBestSeller: product.isBestSeller || product.is_best_seller || false,
          isOnSale: product.isOnSale || product.is_on_sale || !!product.comparePrice || !!product.original_price,
          isNew: product.isNew || product.is_new || false,
          organic: product.organic || false,
          localProduct: product.localProduct || product.local_product || false,
          saleEndDate: product.saleEndDate || product.sale_end_date || '',
          tags: tagsString,
          seoTitle: product.seoTitle || product.seo_title || '',
          seoDescription: product.seoDescription || product.seo_description || '',
          seoKeywords: product.seoKeywords || product.seo_keywords || ''
        });

        // Set isOnSale based on comparePrice
        if (product.comparePrice || product.original_price) {
          setFormData(prev => ({ ...prev, isOnSale: true }));
        }
        
        // Handle existing images - store only filenames
        if (product.images && product.images.length > 0) {
          const imageFilenames = product.images.map((img: any) => {
            if (typeof img === 'string') {
              return extractFilename(img);
            } else if (img && typeof img === 'object' && 'url' in img) {
              return extractFilename(img.url);
            }
            return '';
          }).filter(Boolean);
          
          setExistingImages(imageFilenames);
          console.log('Loaded existing image filenames:', imageFilenames);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product data',
          variant: 'destructive',
        });
      } finally {
        setFormLoading(false);
      }
    }
  }, [isEditing, id, toast]); // FIX: Added proper dependencies

  // Load product data if editing
  useEffect(() => {
    loadProduct();
  }, [loadProduct]); // FIX: Now depends on stable loadProduct function

  // Load categories - FIX: use useCallback to stabilize
  const loadCategories = useCallback(async () => {
    try {
      const response = await productService.getCategories();
      setCategoriesList(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]); // FIX: Now depends on stable loadCategories function

  // Check SKU uniqueness with debounce - FIX: use useCallback
  const checkSku = useCallback(async () => {
    if (formData.sku && formData.sku.length > 3) {
      setSkuChecking(true);
      try {
        const isUnique = await productService.checkSkuUnique(formData.sku, id);
        setSkuUnique(isUnique);
      } catch (error) {
        console.error('Error checking SKU:', error);
        setSkuUnique(null);
      } finally {
        setSkuChecking(false);
      }
    } else {
      setSkuUnique(null);
    }
  }, [formData.sku, id]);

  useEffect(() => {
    const timeoutId = setTimeout(checkSku, 500);
    return () => clearTimeout(timeoutId);
  }, [checkSku]); // FIX: Now depends on stable checkSku function

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.unit) {
      errors.unit = 'Unit is required';
    }

    if (skuUnique === false) {
      errors.sku = 'SKU must be unique';
    }

    if (formData.isOnSale && formData.comparePrice && parseFloat(formData.comparePrice) <= parseFloat(formData.price)) {
      errors.comparePrice = 'Compare price must be higher than regular price';
    }

    if (formData.isOnSale && !formData.saleEndDate) {
      errors.saleEndDate = 'Sale end date is required when product is on sale';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const generateSku = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const newSku = `${prefix}-${random}`;
    setFormData(prev => ({ ...prev, sku: newSku }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      
      // Limit to 10 images total
      if (existingImages.length + newImageFiles.length + newFiles.length > 10) {
        toast({
          title: 'Too many images',
          description: 'Maximum 10 images allowed',
          variant: 'destructive',
        });
        return;
      }

      setNewImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs for new images
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    // Adjust primary image index if needed
    if (primaryImageIndex >= existingImages.length - 1) {
      setPrimaryImageIndex(Math.max(0, existingImages.length - 2));
    }
  };

  const removeNewImage = (index: number) => {
    setNewImagePreviews(prev => {
      // Revoke the blob URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    // Adjust primary image index if needed
    const totalImages = existingImages.length + newImageFiles.length - 1;
    if (primaryImageIndex >= existingImages.length + index) {
      setPrimaryImageIndex(Math.max(0, totalImages - 1));
    }
  };

  const setAsPrimary = (index: number) => {
    setPrimaryImageIndex(index);
  };

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      setFormData(prev => ({ ...prev, tags: currentTags.join(', ') }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
  };

  const processFormData = () => {
    // Process tags - convert comma-separated string to array
    const tagsArray = formData.tags
      ? formData.tags.split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
      : [];

    return {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
      unit: formData.unit,
      category: formData.category,
      subcategory: formData.subcategory || null,
      brand: formData.brand || null,
      sku: formData.sku || null,
      barcode: formData.barcode || null,
      stock: parseInt(formData.stock) || 0,
      lowStockAlert: parseInt(formData.lowStockAlert) || 10,
      minOrderQty: parseInt(formData.minOrderQty) || 1,
      maxOrderQty: formData.maxOrderQty ? parseInt(formData.maxOrderQty) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      isTaxable: formData.isTaxable,
      taxRate: formData.isTaxable ? formData.taxRate : null,
      isPhysical: formData.isPhysical,
      requiresShipping: formData.requiresShipping,
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isOnSale: formData.isOnSale,
      isNew: formData.isNew,
      organic: formData.organic,
      localProduct: formData.localProduct,
      status: formData.status,
      tags: tagsArray,
      seoTitle: formData.seoTitle || null,
      seoDescription: formData.seoDescription || null,
      seoKeywords: formData.seoKeywords || null,
      saleEndDate: formData.saleEndDate || null,
      images: []
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImages(true);
    
    try {
      let uploadedImageUrls: string[] = [];
      
      // Upload new images if any
      if (newImageFiles.length > 0) {
        try {
          console.log('Uploading new images:', newImageFiles.length);
          uploadedImageUrls = await productService.uploadImages(newImageFiles);
          console.log('Uploaded image URLs (filenames):', uploadedImageUrls);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast({
            title: 'Warning',
            description: 'Images could not be uploaded, but product will be saved without them.',
            variant: 'default',
          });
        }
      }

      // Prepare final product data with all image filenames
      const productData = processFormData();
      
      // Combine existing images (already filenames) and newly uploaded images (filenames)
      // Reorder images so primary is first
      let allImages = [
        ...existingImages, // Existing images from database (filenames only)
        ...uploadedImageUrls // Newly uploaded images (filenames only)
      ];

      // Reorder based on primary image index
      if (primaryImageIndex > 0 && primaryImageIndex < allImages.length) {
        const primary = allImages[primaryImageIndex];
        allImages = [primary, ...allImages.filter((_, i) => i !== primaryImageIndex)];
      }
      
      console.log('All images to save (filenames):', allImages);
      
      // Add images to the data
      const submitData = {
        ...productData,
        images: allImages
      };

      console.log('Submitting product data:', submitData);

      let result;
      if (isEditing && id) {
        result = await updateProduct(id, submitData);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      } else {
        result = await createProduct(submitData);
        toast({
          title: 'Success',
          description: 'Product created successfully',
        });
      }
      
      console.log('Save result:', result);
      
      // Navigate based on save mode
      if (saveMode === 'save') {
        navigate('/admin/products');
      } else {
        // Save & Continue - stay on the form
        if (!isEditing && result?.id) {
          // If it's a new product, navigate to edit mode
          navigate(`/admin/products/${result.id}/edit`, { replace: true });
        } else {
          // Refresh data
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  if (formLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Combine all images for display (existing filenames + new previews)
  const allDisplayImages = [
    ...existingImages.map(filename => getImageUrl(filename)),
    ...newImagePreviews
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/products')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? 'Update your product details' : 'Create a new product in your catalog'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            onClick={() => setSaveMode('save_continue')}
            disabled={loading || uploadingImages}
          >
            {loading || uploadingImages ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
          <Button 
            type="submit"
            onClick={() => setSaveMode('save')}
            disabled={loading || uploadingImages}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
          >
            {loading || uploadingImages ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadingImages ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Product' : 'Save Product'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Please fix the following errors:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {Object.entries(validationErrors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* SKU Warning */}
      {skuUnique === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>SKU Already Exists</AlertTitle>
          <AlertDescription>
            This SKU is already in use. Please choose a different SKU.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ============= GENERAL TAB ============= */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fresh Tomatoes"
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-xs text-red-500">{validationErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Product description..."
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="flex items-center gap-1">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesList.length > 0 
                            ? categoriesList.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            : categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))
                          }
                        </SelectContent>
                      </Select>
                      {validationErrors.category && (
                        <p className="text-xs text-red-500">{validationErrors.category}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        placeholder="e.g., Vegetables"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="e.g., Dedza Farmers"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            placeholder="e.g., TOM-001"
                            className={validationErrors.sku ? 'border-red-500 pr-10' : 'pr-10'}
                          />
                          {skuChecking && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                          {!skuChecking && skuUnique === true && formData.sku && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                          )}
                          {!skuChecking && skuUnique === false && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generateSku}
                          title="Generate SKU"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      {validationErrors.sku && (
                        <p className="text-xs text-red-500">{validationErrors.sku}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode (ISBN, UPC, etc.)</Label>
                      <Input
                        id="barcode"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleInputChange}
                        placeholder="e.g., 123456789012"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Product Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Enter a tag and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            handleAddTag(input.value);
                            input.value = '';
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter to add a tag. e.g., organic, fresh, local, seasonal
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.split(',').filter(t => t.trim()).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                          {tag.trim()}
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-destructive" 
                            onClick={() => handleRemoveTag(tag.trim())}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {allDisplayImages.map((image, index) => {
                      const isExisting = index < existingImages.length;
                      const isPrimary = index === primaryImageIndex;
                      
                      return (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className={`w-full h-full object-cover rounded-lg border-2 transition-all ${
                              isPrimary ? 'border-orange-500' : 'border-border'
                            }`}
                            onError={(e) => {
                              console.error('Image failed to load:', image);
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => setAsPrimary(index)}
                                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
                                title="Set as primary"
                              >
                                <Star className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => isExisting ? removeExistingImage(index) : removeNewImage(index - existingImages.length)}
                              className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {isPrimary && (
                            <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">
                              Primary
                            </div>
                          )}
                          {isExisting && !isPrimary && (
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                              Saved
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {allDisplayImages.length < 10 && (
                      <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-2">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    Upload up to 10 images. Click the star icon to set as primary image.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Existing: {existingImages.length} | New: {newImageFiles.length} | Total: {allDisplayImages.length}/10
                  </p>
                </CardContent>
              </Card>

              {/* Product Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleSwitchChange('isFeatured', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <Label htmlFor="isBestSeller">Best Seller</Label>
                    </div>
                    <Switch
                      id="isBestSeller"
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => handleSwitchChange('isBestSeller', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <Label htmlFor="isNew">New Arrival</Label>
                    </div>
                    <Switch
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => handleSwitchChange('isNew', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <Label htmlFor="organic">Organic</Label>
                    </div>
                    <Switch
                      id="organic"
                      checked={formData.organic}
                      onCheckedChange={(checked) => handleSwitchChange('organic', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-500" />
                      <Label htmlFor="localProduct">Local Product</Label>
                    </div>
                    <Switch
                      id="localProduct"
                      checked={formData.localProduct}
                      onCheckedChange={(checked) => handleSwitchChange('localProduct', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============= PRICING TAB ============= */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-1">
                    Regular Price (MK) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={validationErrors.price ? 'border-red-500' : ''}
                  />
                  {validationErrors.price && (
                    <p className="text-xs text-red-500">{validationErrors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare at Price (MK)</Label>
                  <Input
                    id="comparePrice"
                    name="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={validationErrors.comparePrice ? 'border-red-500' : ''}
                  />
                  {validationErrors.comparePrice && (
                    <p className="text-xs text-red-500">{validationErrors.comparePrice}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Original price shown with strikethrough
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="flex items-center gap-1">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleSelectChange('unit', value)}
                  >
                    <SelectTrigger className={validationErrors.unit ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.unit && (
                    <p className="text-xs text-red-500">{validationErrors.unit}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Sale Toggle */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isOnSale">On Sale</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable to show discount pricing
                    </p>
                  </div>
                  <Switch
                    id="isOnSale"
                    checked={formData.isOnSale}
                    onCheckedChange={(checked) => handleSwitchChange('isOnSale', checked)}
                  />
                </div>

                {formData.isOnSale && (
                  <div className="pl-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="saleEndDate">Sale End Date</Label>
                      <Input
                        id="saleEndDate"
                        name="saleEndDate"
                        type="date"
                        value={formData.saleEndDate}
                        onChange={handleInputChange}
                        className={validationErrors.saleEndDate ? 'border-red-500' : ''}
                      />
                      {validationErrors.saleEndDate && (
                        <p className="text-xs text-red-500">{validationErrors.saleEndDate}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Tax Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isTaxable">Charge Tax</Label>
                    <p className="text-xs text-muted-foreground">
                      Apply VAT to this product
                    </p>
                  </div>
                  <Switch
                    id="isTaxable"
                    checked={formData.isTaxable}
                    onCheckedChange={(checked) => handleSwitchChange('isTaxable', checked)}
                  />
                </div>

                {formData.isTaxable && (
                  <div className="pl-6">
                    <Select
                      value={formData.taxRate}
                      onValueChange={(value) => handleSelectChange('taxRate', value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select tax rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">16% VAT</SelectItem>
                        <SelectItem value="0">Zero rated</SelectItem>
                        <SelectItem value="exempt">Tax exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= INVENTORY TAB ============= */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                  <Input
                    id="lowStockAlert"
                    name="lowStockAlert"
                    type="number"
                    min="0"
                    value={formData.lowStockAlert}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderQty">Min Order Quantity</Label>
                  <Input
                    id="minOrderQty"
                    name="minOrderQty"
                    type="number"
                    min="1"
                    value={formData.minOrderQty}
                    onChange={handleInputChange}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOrderQty">Max Order Quantity</Label>
                  <Input
                    id="maxOrderQty"
                    name="maxOrderQty"
                    type="number"
                    min="0"
                    value={formData.maxOrderQty}
                    onChange={handleInputChange}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= SHIPPING TAB ============= */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isPhysical">Physical Product</Label>
                    <p className="text-xs text-muted-foreground">
                      Is this a physical item that needs shipping?
                    </p>
                  </div>
                  <Switch
                    id="isPhysical"
                    checked={formData.isPhysical}
                    onCheckedChange={(checked) => handleSwitchChange('isPhysical', checked)}
                  />
                </div>

                {formData.isPhysical && (
                  <>
                    <div className="flex items-center justify-between pl-6">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="requiresShipping">Requires Shipping</Label>
                        <p className="text-xs text-muted-foreground">
                          Does this item need to be shipped?
                        </p>
                      </div>
                      <Switch
                        id="requiresShipping"
                        checked={formData.requiresShipping}
                        onCheckedChange={(checked) => handleSwitchChange('requiresShipping', checked)}
                      />
                    </div>

                    <div className="pl-6">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-[200px]"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= SEO TAB ============= */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  placeholder="SEO title"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  placeholder="SEO description"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 150-160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleInputChange}
                  placeholder="Comma separated keywords"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
};

export default ProductForm;