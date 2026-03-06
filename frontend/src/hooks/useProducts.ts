import { useState, useCallback } from 'react';
import { productService } from '@/services/productService';
import { Product, ProductFilters, ProductsResponse, ProductFormData } from '@/types/product.types';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  
  const { toast } = useToast();

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.products);
      setPagination({
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError('Failed to fetch products');
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createProduct = useCallback(async (data: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await productService.createProduct(data);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      return newProduct;
    } catch (err) {
      setError('Failed to create product');
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProduct = useCallback(async (id: string, data: ProductFormData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProduct = await productService.updateProduct(id, data);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      return updatedProduct;
    } catch (err) {
      setError('Failed to update product');
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (err) {
      setError('Failed to delete product');
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadImages = useCallback(async (files: File[]) => {
    try {
      const urls = await productService.uploadImages(files);
      return urls;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
  };
};