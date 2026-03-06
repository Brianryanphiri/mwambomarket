import { useState, useEffect } from 'react';
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
  AlertCircle
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
import { useProducts } from '@/hooks/useProducts';
import { productService } from '@/services/productService';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product.types';

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
  { value: 'tray', label: 'Tray' }
];

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
  
  // If it's a blob URL (preview), return as is
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // For development, add the base URL - IMPORTANT: no /products in the path
  return `http://localhost:5001/uploads/${filename}`;
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
  const [variants, setVariants] = useState([
    { id: '1', name: '1 kg', price: 0, stock: 0 }
  ]);
  const [skuChecking, setSkuChecking] = useState(false);
  const [skuUnique, setSkuUnique] = useState<boolean | null>(null);

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
    weight: '',
    unit: 'kg',
    isTaxable: true,
    taxRate: '16',
    isPhysical: true,
    requiresShipping: true,
    isPublished: true,
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
    tags: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });

  // Load product data if editing
  useEffect(() => {
    const loadProduct = async () => {
      if (isEditing && id) {
        setFormLoading(true);
        try {
          const product = await productService.getProduct(id);
          console.log('Loaded product:', product);
          
          // Handle tags - convert array to comma-separated string
          const tagsString = product.tags ? product.tags.join(', ') : '';
          
          setFormData({
            name: product.name || '',
            description: product.description || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            brand: product.brand || '',
            price: product.price?.toString() || '',
            comparePrice: product.comparePrice?.toString() || '',
            costPrice: product.costPrice?.toString() || '',
            sku: product.sku || '',
            barcode: product.barcode || '',
            stock: product.stock?.toString() || '',
            lowStockAlert: product.lowStockAlert?.toString() || '10',
            weight: product.weight?.toString() || '',
            unit: product.unit || 'kg',
            isTaxable: product.isTaxable ?? true,
            taxRate: product.taxRate || '16',
            isPhysical: product.isPhysical ?? true,
            requiresShipping: product.requiresShipping ?? true,
            isPublished: product.status === 'active',
            isFeatured: product.isFeatured || false,
            isNew: product.isNew || false,
            isBestSeller: product.isBestSeller || false,
            tags: tagsString,
            metaTitle: product.seoTitle || '',
            metaDescription: product.seoDescription || '',
            metaKeywords: product.seoKeywords || ''
          });
          
          // Handle existing images - store only filenames
          if (product.images && product.images.length > 0) {
            const imageFilenames = product.images.map(img => {
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
          
          // Handle variants
          if (product.variants && product.variants.length > 0) {
            setVariants(product.variants);
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
    };

    loadProduct();
  }, [isEditing, id, toast]);

  // Check SKU uniqueness
  useEffect(() => {
    const checkSku = async () => {
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
    };

    const timeoutId = setTimeout(checkSku, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.sku, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs for new images
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImagePreviews(prev => {
      // Revoke the blob URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', price: 0, stock: 0 }
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const processFormData = () => {
    // Process tags - convert comma-separated string to array
    const tagsArray = formData.tags
      ? formData.tags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
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
      weight: formData.weight ? parseFloat(formData.weight) : null,
      isTaxable: formData.isTaxable,
      taxRate: formData.isTaxable ? formData.taxRate : null,
      isPhysical: formData.isPhysical,
      requiresShipping: formData.requiresShipping,
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isOnSale: !!formData.comparePrice,
      isNew: formData.isNew,
      organic: false,
      localProduct: false,
      minOrder: 1,
      maxOrder: null,
      seoTitle: formData.metaTitle || null,
      seoDescription: formData.metaDescription || null,
      seoKeywords: formData.metaKeywords || null,
      status: formData.isPublished ? 'active' : 'draft',
      tags: tagsArray,
      variants: variants.filter(v => v.name.trim() !== '').map(v => ({
        name: v.name,
        price: v.price,
        stock: v.stock,
        sku: null
      }))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Valid price is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Category is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.unit) {
      toast({
        title: 'Validation Error',
        description: 'Unit is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate SKU uniqueness
    if (skuUnique === false) {
      toast({
        title: 'Validation Error',
        description: 'SKU must be unique. This SKU is already in use.',
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
      const allImages = [
        ...existingImages, // Existing images from database (filenames only)
        ...uploadedImageUrls // Newly uploaded images (filenames only)
      ];
      
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
      
      // Navigate back to products list
      navigate('/admin/products');
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
  // For existing images, convert filename to full URL
  // For new previews, they are already blob URLs
  const allDisplayImages = [
    ...existingImages.map(filename => getImageUrl(filename)),
    ...newImagePreviews
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {skuUnique === false && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>SKU Already Exists</AlertTitle>
          <AlertDescription>
            This SKU is already in use. Please choose a different SKU.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fresh Tomatoes"
                      required
                    />
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
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="sku">SKU *</Label>
                      <div className="relative">
                        <Input
                          id="sku"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          placeholder="e.g., TOM-001"
                          required
                          className={skuUnique === false ? 'border-red-500 pr-10' : ''}
                        />
                        {skuChecking && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                        {!skuChecking && skuUnique === true && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                        {!skuChecking && skuUnique === false && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
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
                      <Label htmlFor="unit">Unit *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => handleSelectChange('unit', value)}
                      >
                        <SelectTrigger>
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Product Tags</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Enter tags separated by commas"
                    />
                    <p className="text-xs text-muted-foreground">
                      e.g., organic, fresh, local, seasonal
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.split(',').filter(t => t.trim()).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {allDisplayImages.map((image, index) => {
                      // Determine if this is an existing image or new preview
                      const isExisting = index < existingImages.length;
                      
                      return (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border"
                            onError={(e) => {
                              console.error('Image failed to load:', image);
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => isExisting ? removeExistingImage(index) : removeNewImage(index - existingImages.length)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {isExisting && (
                            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                              Saved
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
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
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    Upload up to 10 images. First image will be used as the main product image.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Existing images: {existingImages.length} | New images: {newImageFiles.length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => handleCheckboxChange('isPublished', checked as boolean)}
                    />
                    <Label htmlFor="isPublished">Published</Label>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => handleCheckboxChange('isFeatured', checked as boolean)}
                      />
                      <Label htmlFor="isFeatured">Feature this product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isNew"
                        checked={formData.isNew}
                        onCheckedChange={(checked) => handleCheckboxChange('isNew', checked as boolean)}
                      />
                      <Label htmlFor="isNew">Mark as New Arrival</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isBestSeller"
                        checked={formData.isBestSeller}
                        onCheckedChange={(checked) => handleCheckboxChange('isBestSeller', checked as boolean)}
                      />
                      <Label htmlFor="isBestSeller">Mark as Best Seller</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price (MK) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
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
                  />
                  <p className="text-xs text-muted-foreground">
                    Original price shown with strikethrough
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (MK)</Label>
                  <Input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTaxable"
                    checked={formData.isTaxable}
                    onCheckedChange={(checked) => handleCheckboxChange('isTaxable', checked as boolean)}
                  />
                  <Label htmlFor="isTaxable">Charge tax on this product</Label>
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

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
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

              <Separator />

              <div className="space-y-4">
                <Label>Product Variants (Optional)</Label>
                {variants.map((variant, index) => (
                  <div key={variant.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Variant name (e.g., 1kg)"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].name = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].price = Number(e.target.value);
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].stock = Number(e.target.value);
                          setVariants(newVariants);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(variant.id)}
                      disabled={variants.length === 1}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPhysical"
                    checked={formData.isPhysical}
                    onCheckedChange={(checked) => handleCheckboxChange('isPhysical', checked as boolean)}
                  />
                  <Label htmlFor="isPhysical">This is a physical product</Label>
                </div>

                {formData.isPhysical && (
                  <>
                    <div className="flex items-center space-x-2 pl-6">
                      <Checkbox
                        id="requiresShipping"
                        checked={formData.requiresShipping}
                        onCheckedChange={(checked) => handleCheckboxChange('requiresShipping', checked as boolean)}
                      />
                      <Label htmlFor="requiresShipping">Requires shipping</Label>
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

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO title"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO description"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 150-160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  name="metaKeywords"
                  value={formData.metaKeywords}
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