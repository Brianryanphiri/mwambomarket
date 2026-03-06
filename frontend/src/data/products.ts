// src/data/products.ts
import tomatoesImg from '@/assets/products/tomatoes.jpg';
import onionsImg from '@/assets/products/onions.jpg';
import riceImg from '@/assets/products/rice.jpg';
import cookingOilImg from '@/assets/products/cooking-oil.jpg';
import eggsImg from '@/assets/products/eggs.jpg';
import sugarImg from '@/assets/products/sugar.jpg';
import maizeFlourImg from '@/assets/products/maize-flour.jpg';
import milkImg from '@/assets/products/milk.jpg';
import breadImg from '@/assets/products/bread.jpg';
import vegetablesImg from '@/assets/products/vegetables.jpg';
import beansImg from '@/assets/products/beans.jpg';
import fruitsImg from '@/assets/products/fruits.jpg';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  rating?: number;
  badge?: string;
  category: string;
  categoryName: string;
  inStock: boolean;
  tags?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  saleEnds?: string;
  createdAt: string;
  soldCount: number;
  stock: number;  // Single stock property - numeric
  description?: string; // Added for completeness
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Fresh Tomatoes',
    price: 2500,
    unit: '1 kg',
    image: tomatoesImg,
    rating: 5,
    badge: 'Popular',
    category: 'fresh-produce',
    categoryName: 'Fresh Produce',
    inStock: true,
    tags: ['vegetable', 'fresh', 'local'],
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    createdAt: '2025-01-15',
    soldCount: 1250,
    stock: 150,
    description: 'Fresh, ripe tomatoes perfect for salads, cooking, and sauces. Sourced directly from local farmers in Dedza.'
  },
  {
    id: 'p2',
    name: 'Red Onions',
    price: 1800,
    unit: '1 kg',
    image: onionsImg,
    rating: 4,
    category: 'fresh-produce',
    categoryName: 'Fresh Produce',
    inStock: true,
    tags: ['vegetable', 'fresh'],
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-01-10',
    soldCount: 980,
    stock: 200,
    description: 'High-quality red onions, perfect for everyday cooking. Grown in Malawi.'
  },
  {
    id: 'p3',
    name: 'White Rice',
    price: 8500,
    originalPrice: 9500,
    unit: '5 kg bag',
    image: riceImg,
    badge: 'Sale',
    category: 'pantry-essentials',
    categoryName: 'Pantry Essentials',
    inStock: true,
    tags: ['staple', 'grain'],
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    saleEnds: '2025-03-30',
    createdAt: '2025-01-05',
    soldCount: 2100,
    stock: 85,
    description: 'Premium quality white rice, perfect for daily meals. 5kg bag.'
  },
  {
    id: 'p4',
    name: 'Cooking Oil',
    price: 4500,
    unit: '2 Litres',
    image: cookingOilImg,
    rating: 5,
    category: 'pantry-essentials',
    categoryName: 'Pantry Essentials',
    inStock: true,
    tags: ['cooking', 'essential'],
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    createdAt: '2025-01-12',
    soldCount: 1850,
    stock: 60,
    description: 'Pure vegetable cooking oil, ideal for all types of cooking. 2 litre bottle.'
  },
  {
    id: 'p5',
    name: 'Farm Eggs',
    price: 6000,
    unit: 'Tray of 30',
    image: eggsImg,
    rating: 5,
    badge: 'Best Seller',
    category: 'dairy-eggs',
    categoryName: 'Dairy & Eggs',
    inStock: true,
    tags: ['protein', 'fresh'],
    isNew: false,
    isBestSeller: true,
    isOnSale: false,
    createdAt: '2025-01-14',
    soldCount: 3200,
    stock: 45,
    description: 'Fresh farm eggs from free-range chickens. Tray of 30 eggs.'
  },
  {
    id: 'p6',
    name: 'White Sugar',
    price: 3200,
    unit: '2 kg',
    image: sugarImg,
    rating: 4,
    category: 'pantry-essentials',
    categoryName: 'Pantry Essentials',
    inStock: true,
    tags: ['sweetener', 'baking'],
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-01-08',
    soldCount: 760,
    stock: 120,
    description: 'Refined white sugar, perfect for beverages and baking. 2kg pack.'
  },
  {
    id: 'p7',
    name: 'Maize Flour',
    price: 5500,
    originalPrice: 6200,
    unit: '5 kg',
    image: maizeFlourImg,
    badge: 'Sale',
    category: 'pantry-essentials',
    categoryName: 'Pantry Essentials',
    inStock: true,
    tags: ['staple', 'nsima'],
    isNew: false,
    isBestSeller: true,
    isOnSale: true,
    saleEnds: '2025-03-25',
    createdAt: '2025-01-03',
    soldCount: 2800,
    stock: 92,
    description: 'Premium maize flour, perfect for making nsima. 5kg bag.'
  },
  {
    id: 'p8',
    name: 'Fresh Milk',
    price: 2800,
    unit: '2 Litres',
    image: milkImg,
    rating: 4,
    category: 'dairy-eggs',
    categoryName: 'Dairy & Eggs',
    inStock: true,
    tags: ['dairy', 'fresh'],
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-01-11',
    soldCount: 890,
    stock: 40,
    description: 'Fresh pasteurized milk. 2 litre bottle.'
  },
  {
    id: 'p9',
    name: 'White Bread',
    price: 1500,
    unit: '1 loaf',
    image: breadImg,
    rating: 4,
    category: 'daily-fresh',
    categoryName: 'Daily Fresh',
    inStock: true,
    tags: ['bakery', 'fresh'],
    isNew: true,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-02-20',
    soldCount: 450,
    stock: 25,
    description: 'Freshly baked white bread. Perfect for breakfast sandwiches.'
  },
  {
    id: 'p10',
    name: 'Green Vegetables',
    price: 800,
    unit: 'Bundle',
    image: vegetablesImg,
    category: 'fresh-produce',
    categoryName: 'Fresh Produce',
    inStock: true,
    tags: ['vegetable', 'greens'],
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-01-16',
    soldCount: 620,
    stock: 80,
    description: 'Fresh mixed green vegetables, perfect for relish. Bundle includes various greens.'
  },
  {
    id: 'p11',
    name: 'Kidney Beans',
    price: 3500,
    unit: '2 kg',
    image: beansImg,
    rating: 4,
    category: 'pantry-essentials',
    categoryName: 'Pantry Essentials',
    inStock: true,
    tags: ['legume', 'protein'],
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-01-09',
    soldCount: 540,
    stock: 110,
    description: 'Premium kidney beans, perfect for relish and stews. 2kg pack.'
  },
  {
    id: 'p12',
    name: 'Fresh Fruits',
    price: 3000,
    unit: 'Mixed Pack',
    image: fruitsImg,
    rating: 5,
    badge: 'New',
    category: 'fruits',
    categoryName: 'Fruits',
    inStock: true,
    tags: ['fruit', 'fresh'],
    isNew: true,
    isBestSeller: false,
    isOnSale: false,
    createdAt: '2025-02-18',
    soldCount: 380,
    stock: 35,
    description: 'Assorted fresh fruits including apples, bananas, and oranges. Perfect for healthy snacking.'
  },
];

// Helper function to get products by category
export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};

// Helper function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

// Helper function to get featured products
export const getFeaturedProducts = (limit: number = 6): Product[] => {
  return products
    .filter(product => product.isBestSeller || product.isNew || product.badge)
    .slice(0, limit);
};

// Helper function to get best sellers
export const getBestSellers = (limit: number = 6): Product[] => {
  return products
    .filter(product => product.isBestSeller)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
};

// Helper function to get new arrivals
export const getNewArrivals = (limit: number = 6): Product[] => {
  return products
    .filter(product => product.isNew)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

// Helper function to get products on sale
export const getProductsOnSale = (limit: number = 6): Product[] => {
  return products
    .filter(product => product.isOnSale)
    .slice(0, limit);
};

// Helper function to search products
export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.categoryName.toLowerCase().includes(searchTerm) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// Helper function to get related products (same category, excluding current)
export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];
  
  return products
    .filter(product => 
      product.id !== productId && 
      product.category === currentProduct.category
    )
    .slice(0, limit);
};

// Helper function to check if product is in stock
export const isProductInStock = (productId: string): boolean => {
  const product = getProductById(productId);
  return product ? product.stock > 0 : false;
};

// Helper function to get product stock level
export const getProductStock = (productId: string): number => {
  const product = getProductById(productId);
  return product?.stock || 0;
};

// Export categories list for filtering
export const categories = [
  { id: 'fresh-produce', name: 'Fresh Produce', count: products.filter(p => p.category === 'fresh-produce').length },
  { id: 'dairy-eggs', name: 'Dairy & Eggs', count: products.filter(p => p.category === 'dairy-eggs').length },
  { id: 'pantry-essentials', name: 'Pantry Essentials', count: products.filter(p => p.category === 'pantry-essentials').length },
  { id: 'daily-fresh', name: 'Daily Fresh', count: products.filter(p => p.category === 'daily-fresh').length },
  { id: 'fruits', name: 'Fruits', count: products.filter(p => p.category === 'fruits').length },
];

export default products;