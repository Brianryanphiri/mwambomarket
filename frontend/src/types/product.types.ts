export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  comparePrice?: number;
  unit: string;
  category: string;
  subcategory?: string;
  stock: number;
  sku: string;
  barcode?: string;
  low_stock_alert?: number;
  weight?: number;
  is_taxable?: boolean;
  tax_rate?: string;
  is_physical?: boolean;
  requires_shipping?: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_on_sale?: boolean;
  is_new?: boolean;
  organic?: boolean;
  local_product?: boolean;
  rating?: number;
  num_reviews?: number;
  images?: string[] | { url: string; alt?: string; is_primary?: boolean }[];
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  
  // For frontend display
  badge?: string;
  inStock?: boolean;
  categoryName?: string;
  originalPrice?: number;
}

export interface ProductFilters {
  category?: string;
  status?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_on_sale?: boolean;
  organic?: boolean;
  local_product?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice?: string;
  unit: string;
  category: string;
  subcategory?: string;
  stock: string;
  sku: string;
  barcode?: string;
  lowStockAlert?: string;
  weight?: string;
  isTaxable?: boolean;
  taxRate?: string;
  isPhysical?: boolean;
  requiresShipping?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  organic?: boolean;
  localProduct?: boolean;
  tags?: string;
  images?: any[];
  variants?: any[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished?: boolean;
  status?: string;
}