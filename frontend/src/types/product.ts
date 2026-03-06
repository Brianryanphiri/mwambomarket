// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  images?: string[]; // For multiple product images
  rating?: number;
  badge?: string;
  category?: string;
  description?: string;
  inStock?: boolean;
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbs?: string;
  };
  seller?: string;
  origin?: string;
  expiryInfo?: string;
}