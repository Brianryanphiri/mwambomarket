// src/pages/admin/Categories/CategoryForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Tag,
  Save,
  ArrowLeft,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface CategoryFormData {
  name: string;
  description: string;
  parent_id: string;
  sort_order: number;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
}

const CategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slug, setSlug] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      parent_id: 'none', // Changed from '' to 'none'
      sort_order: 0,
      is_active: true,
    }
  });

  const watchName = watch('name');

  // Generate slug from name
  useEffect(() => {
    if (watchName) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      setSlug(generatedSlug);
    } else {
      setSlug('');
    }
  }, [watchName]);

  // Fetch categories for parent dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/products/categories`);
        if (response.data.success) {
          // Filter out current category in edit mode
          let categoryList = response.data.categories || [];
          if (isEditMode && id) {
            categoryList = categoryList.filter((cat: Category) => cat.id !== parseInt(id));
          }
          setCategories(categoryList);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, [isEditMode, id]);

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE}/products/categories/${id}`);
          
          if (response.data.success && response.data.category) {
            const category = response.data.category;
            setValue('name', category.name);
            setValue('description', category.description || '');
            // Convert null parent_id to 'none' for the select component
            setValue('parent_id', category.parent_id ? category.parent_id.toString() : 'none');
            setValue('sort_order', category.sort_order || 0);
            setValue('is_active', category.is_active);
            setSlug(category.slug);
          } else {
            setError('Category not found');
          }
        } catch (err: any) {
          console.error('Error fetching category:', err);
          setError(err.response?.data?.message || 'Failed to load category');
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    }
  }, [isEditMode, id, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        ...data,
        // Convert 'none' back to null for the API
        parent_id: data.parent_id === 'none' ? null : parseInt(data.parent_id),
      };

      if (isEditMode) {
        await axios.put(
          `${API_BASE}/products/categories/${id}`,
          payload,
          { headers }
        );
      } else {
        await axios.post(
          `${API_BASE}/products/categories`,
          payload,
          { headers }
        );
      }

      // Navigate back to categories list
      navigate('/admin/categories');
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/categories')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="required">
                Category Name
              </Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Category name is required' 
                })}
                placeholder="e.g., Fresh Produce"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Slug Preview */}
            <div className="space-y-2">
              <Label>Slug (auto-generated)</Label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-gray-600 dark:text-gray-400">
                {slug || '—'}
              </div>
              <p className="text-xs text-gray-500">
                URL-friendly version of the category name. Auto-generated from the name field.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Category</Label>
              <Select
                onValueChange={(value) => setValue('parent_id', value)}
                value={watch('parent_id')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {/* Changed from value="" to value="none" */}
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Leave empty to create a top-level category
              </p>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Sort order must be 0 or greater' }
                })}
                min="0"
                className="w-32"
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first (default: 0)
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Active Status</Label>
                <p className="text-xs text-gray-500">
                  Inactive categories are hidden from the store
                </p>
              </div>
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/categories')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CategoryForm;