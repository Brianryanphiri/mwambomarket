import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  maxOrder?: number;
  stock?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

const CART_STORAGE_KEY = 'mwambo_cart';
const FREE_DELIVERY_THRESHOLD = 10000; // MWK 10,000
const DELIVERY_FEE = 500; // MWK 500

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize from localStorage
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      const quantity = item.quantity || 1;
      
      // Check stock limits
      if (item.stock !== undefined && quantity > item.stock) {
        toast({
          title: 'Cannot Add to Cart',
          description: `Only ${item.stock} units available in stock`,
          variant: 'destructive',
        });
        return prev;
      }

      // Check max order limit
      if (item.maxOrder && quantity > item.maxOrder) {
        toast({
          title: 'Maximum Order Reached',
          description: `You can only order up to ${item.maxOrder} units of this product`,
          variant: 'destructive',
        });
        return prev;
      }

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        
        // Check stock limits for existing item
        if (item.stock !== undefined && newQuantity > item.stock) {
          toast({
            title: 'Cannot Add More',
            description: `Only ${item.stock - existing.quantity} more units available`,
            variant: 'destructive',
          });
          return prev;
        }

        // Check max order for existing item
        if (item.maxOrder && newQuantity > item.maxOrder) {
          toast({
            title: 'Maximum Order Reached',
            description: `You can only order up to ${item.maxOrder} units total`,
            variant: 'destructive',
          });
          return prev;
        }

        return prev.map(i => 
          i.productId === item.productId 
            ? { ...i, quantity: newQuantity } 
            : i
        );
      }

      return [...prev, { 
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        unit: item.unit,
        maxOrder: item.maxOrder,
        stock: item.stock,
        quantity 
      }];
    });

    // Show success toast
    toast({
      title: 'Added to Cart',
      description: `${item.name} added to your cart`,
    });
  }, [toast]);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.productId === productId);
      if (item) {
        toast({
          title: 'Removed from Cart',
          description: `${item.name} removed from your cart`,
        });
      }
      return prev.filter(i => i.productId !== productId);
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => {
        const item = prev.find(i => i.productId === productId);
        if (item) {
          toast({
            title: 'Removed from Cart',
            description: `${item.name} removed from your cart`,
          });
        }
        return prev.filter(i => i.productId !== productId);
      });
    } else {
      setItems(prev => {
        const item = prev.find(i => i.productId === productId);
        
        // Check stock limit
        if (item?.stock !== undefined && quantity > item.stock) {
          toast({
            title: 'Cannot Update Quantity',
            description: `Only ${item.stock} units available in stock`,
            variant: 'destructive',
          });
          return prev;
        }

        // Check max order limit
        if (item?.maxOrder && quantity > item.maxOrder) {
          toast({
            title: 'Maximum Order Reached',
            description: `You can only order up to ${item.maxOrder} units`,
            variant: 'destructive',
          });
          return prev;
        }

        return prev.map(i => i.productId === productId ? { ...i, quantity } : i);
      });
    }
  }, [toast]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart',
    });
  }, [toast]);

  const getCartCount = useCallback(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const getCartTotal = useCallback(() => {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [items]);

  const totalItems = getCartCount();
  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      subtotal,
      deliveryFee,
      grandTotal,
      isCartOpen, 
      setIsCartOpen,
      getCartCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};