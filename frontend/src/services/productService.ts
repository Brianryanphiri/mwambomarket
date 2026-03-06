import api from './api';
import { Product, ProductFilters, ProductsResponse } from '@/types/product.types';

class ProductService {
  private readonly baseUrl = '/admin/products';
  private readonly publicBaseUrl = '/products';

  // Helper to ensure image URLs are properly formatted
  private formatImageUrl(url: string): string {
    if (!url) return '/placeholder.svg';
    
    // If it's already a full URL (including localhost), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a data URL or blob URL, return as is
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // If it's a relative path starting with /uploads, ensure it has the full URL
    if (url.startsWith('/uploads')) {
      // In development, add localhost base
      if (process.env.NODE_ENV === 'development') {
        return `http://localhost:5001${url}`;
      }
      return url;
    }
    
    // If it's just a filename, add the uploads path and base URL
    if (!url.startsWith('/')) {
      const path = `/uploads/products/${url}`;
      if (process.env.NODE_ENV === 'development') {
        return `http://localhost:5001${path}`;
      }
      return path;
    }
    
    return url;
  }

  // Helper to get base URL for images
  private getBaseUrl(): string {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5001' 
      : '';
  }

  // Helper to process product images
  private processProductImages(product: any): Product {
    if (!product) return product;

    // Process images array
    if (product.images && Array.isArray(product.images)) {
      product.images = product.images.map((img: any) => {
        if (typeof img === 'string') {
          return this.formatImageUrl(img);
        } else if (img && typeof img === 'object' && img.url) {
          return {
            ...img,
            url: this.formatImageUrl(img.url)
          };
        }
        return img;
      });
    }

    // Handle legacy image field
    if (product.image && typeof product.image === 'string') {
      product.image = this.formatImageUrl(product.image);
    }

    return product;
  }

  // Helper to process array of products
  private processProducts(products: any[]): Product[] {
    return (products || []).map(product => this.processProductImages(product));
  }

  // ============= ADMIN METHODS =============
  
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      
      // Process the response
      const products = this.processProducts(response.data.products || []);
      
      return {
        products: products,
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.pages || 1
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 1
      };
    }
  }

  async getCategories(): Promise<{name: string, count: number}[]> {
    try {
      const response = await api.get(`${this.baseUrl}/categories`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Extract unique categories from products as fallback
      try {
        const productsResponse = await this.getProducts({ limit: 100 });
        const categories = new Map();
        productsResponse.products.forEach(product => {
          if (product.category) {
            categories.set(product.category, (categories.get(product.category) || 0) + 1);
          }
        });
        return Array.from(categories.entries()).map(([name, count]) => ({ name, count }));
      } catch (fallbackError) {
        return [];
      }
    }
  }

  async getStats(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data || {
        total: 0,
        active: 0,
        lowStock: 0,
        outOfStock: 0
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Calculate stats from products as fallback
      try {
        const productsResponse = await this.getProducts({ limit: 100 });
        const products = productsResponse.products;
        return {
          total: products.length,
          active: products.filter(p => p.stock > 0).length,
          lowStock: products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_alert || 10)).length,
          outOfStock: products.filter(p => p.stock <= 0).length
        };
      } catch (fallbackError) {
        return {
          total: 0,
          active: 0,
          lowStock: 0,
          outOfStock: 0
        };
      }
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return this.processProductImages(response.data);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async createProduct(productData: any): Promise<Product> {
    try {
      // Ensure images are properly formatted before sending
      const dataToSend = { ...productData };
      
      // Log what we're sending
      console.log('Creating product with data:', dataToSend);
      
      // If there are images, make sure they're just the URLs (no blob URLs)
      if (dataToSend.images && Array.isArray(dataToSend.images)) {
        dataToSend.images = dataToSend.images
          .map((img: any) => {
            if (typeof img === 'string') {
              // Remove any blob URLs (they're only for preview)
              if (img.startsWith('blob:')) {
                return null;
              }
              // If it's a full URL from our server, extract just the path
              if (img.includes('/uploads/')) {
                const match = img.match(/\/uploads\/[^?]+/);
                return match ? match[0] : img;
              }
              return img;
            } else if (img && img.url) {
              // If it's an object with url property
              if (img.url.startsWith('blob:')) {
                return null;
              }
              if (img.url.includes('/uploads/')) {
                const match = img.url.match(/\/uploads\/[^?]+/);
                return match ? match[0] : img.url;
              }
              return img.url;
            }
            return null;
          })
          .filter(Boolean);
      }

      const response = await api.post(this.baseUrl, dataToSend);
      return this.processProductImages(response.data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    try {
      // Ensure images are properly formatted before sending
      const dataToSend = { ...productData };
      
      // Log what we're sending
      console.log('Updating product with data:', dataToSend);
      
      // If there are images, make sure they're just the URLs (no blob URLs)
      if (dataToSend.images && Array.isArray(dataToSend.images)) {
        dataToSend.images = dataToSend.images
          .map((img: any) => {
            if (typeof img === 'string') {
              // Remove any blob URLs (they're only for preview)
              if (img.startsWith('blob:')) {
                return null;
              }
              // If it's a full URL from our server, extract just the path
              if (img.includes('/uploads/')) {
                const match = img.match(/\/uploads\/[^?]+/);
                return match ? match[0] : img;
              }
              return img;
            } else if (img && img.url) {
              // If it's an object with url property
              if (img.url.startsWith('blob:')) {
                return null;
              }
              if (img.url.includes('/uploads/')) {
                const match = img.url.match(/\/uploads\/[^?]+/);
                return match ? match[0] : img.url;
              }
              return img.url;
            }
            return null;
          })
          .filter(Boolean);
      }

      const response = await api.put(`${this.baseUrl}/${id}`, dataToSend);
      return this.processProductImages(response.data);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  async bulkDeleteProducts(ids: string[]): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/bulk-delete`, { ids });
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  }

  async duplicateProduct(id: string): Promise<Product> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/duplicate`);
      return this.processProductImages(response.data);
    } catch (error) {
      console.error(`Error duplicating product ${id}:`, error);
      throw error;
    }
  }

  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      console.log('Uploading images:', files.length);
      
      const response = await api.post(`${this.baseUrl}/upload/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      // The backend returns full URLs
      const urls = response.data.urls || [];
      
      // In development, ensure URLs are properly formatted
      if (process.env.NODE_ENV === 'development') {
        return urls.map((url: string) => {
          // If it's a relative path, make it absolute for preview
          if (url.startsWith('/uploads')) {
            return `http://localhost:5001${url}`;
          }
          return url;
        });
      }
      
      return urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      // Return blob URLs as fallback for development
      return files.map(file => URL.createObjectURL(file));
    }
  }

  async checkSkuUnique(sku: string, productId?: string): Promise<boolean> {
    try {
      const response = await api.get(`${this.baseUrl}/check-sku`, {
        params: { sku, productId }
      });
      return response.data.isUnique ?? true;
    } catch (error) {
      console.error('Error checking SKU:', error);
      return true;
    }
  }

  // ============= PUBLIC METHODS =============

  async getPublicProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await api.get(`${this.publicBaseUrl}?${params.toString()}`);
      
      // Handle response - might be array or paginated
      if (Array.isArray(response.data)) {
        const products = this.processProducts(response.data);
        return {
          products: products,
          total: products.length,
          page: 1,
          totalPages: 1
        };
      }
      
      const products = this.processProducts(response.data.products || response.data.data || []);
      
      return {
        products: products,
        total: response.data.total || 0,
        page: response.data.page || 1,
        totalPages: response.data.pages || 1
      };
    } catch (error) {
      console.error('Error fetching public products:', error);
      return {
        products: [],
        total: 0,
        page: 1,
        totalPages: 1
      };
    }
  }

  async getPublicProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/${id}`);
      return this.processProductImages(response.data.data || response.data);
    } catch (error) {
      console.error(`Error fetching public product ${id}:`, error);
      throw error;
    }
  }

  async getPublicCategories(): Promise<any[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/categories`);
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching public categories:', error);
      return [];
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/featured`);
      const products = this.processProducts(response.data.data || response.data || []);
      return products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  async getBestSellers(): Promise<Product[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/best-sellers`);
      const products = this.processProducts(response.data.data || response.data || []);
      return products;
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      return [];
    }
  }

  // Helper method to test image accessibility
  async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const productService = new ProductService();