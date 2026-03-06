// src/components/store/DailyEssentials.tsx
import { useState } from 'react';
import { 
  Sun, Clock, ShoppingCart, RefreshCw, 
  CheckCircle, Bell, Truck, Calendar,
  Leaf, Droplets, Sparkles, Heart,
  Package, Coffee, Milk, Apple, Egg,
  Timer, AlertCircle, Percent, Star,
  ChevronRight
} from 'lucide-react';
import { useCart } from './CartProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

import tomatoesImg from '@/assets/products/tomatoes.jpg';
import onionsImg from '@/assets/products/onions.jpg';
import vegetablesImg from '@/assets/products/vegetables.jpg';
import breadImg from '@/assets/products/bread.jpg';
import milkImg from '@/assets/products/milk.jpg';
import fruitsImg from '@/assets/products/fruits.jpg';
import { Separator } from '@radix-ui/react-separator';

interface DailyItem {
  id: string;
  name: string;
  price: number;
  freq: string;
  image: string;
  category: string;
  freshness: number;
  organic?: boolean;
  local?: boolean;
  unit: string;
}

const dailyItems: DailyItem[] = [
  { 
    id: 'daily-1', 
    name: 'Fresh Tomato Pack', 
    price: 1500, 
    freq: 'Daily / Every 2 days', 
    image: tomatoesImg,
    category: 'vegetables',
    freshness: 2,
    organic: true,
    unit: '1 kg'
  },
  { 
    id: 'daily-2', 
    name: 'Onion & Garlic Bundle', 
    price: 1200, 
    freq: 'Every 3 days', 
    image: onionsImg,
    category: 'vegetables',
    freshness: 3,
    local: true,
    unit: '500 g'
  },
  { 
    id: 'daily-3', 
    name: 'Green Vegetables Mix', 
    price: 800, 
    freq: 'Daily', 
    image: vegetablesImg,
    category: 'vegetables',
    freshness: 1,
    organic: true,
    unit: '300 g'
  },
  { 
    id: 'daily-4', 
    name: 'Fresh Bread Loaf', 
    price: 1500, 
    freq: 'Daily / Every 2 days', 
    image: breadImg,
    category: 'bakery',
    freshness: 1,
    local: true,
    unit: '1 loaf'
  },
  { 
    id: 'daily-5', 
    name: 'Fresh Milk (1L)', 
    price: 1400, 
    freq: 'Daily', 
    image: milkImg,
    category: 'dairy',
    freshness: 2,
    unit: '1 litre'
  },
  { 
    id: 'daily-6', 
    name: 'Fruit Pack (Mixed)', 
    price: 3500, 
    freq: 'Every 3 days', 
    image: fruitsImg,
    category: 'fruits',
    freshness: 2,
    organic: true,
    unit: '1 kg'
  },
];

const DailyEssentials = () => {
  const { addItem } = useCart();
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleAddToCart = (item: DailyItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
      duration: 3000,
    });
  };

  const handleSubscribe = (item: DailyItem) => {
    if (!subscribed.includes(item.id)) {
      setSubscribed([...subscribed, item.id]);
      
      toast({
        title: "Subscribed!",
        description: `You'll receive ${item.name} ${item.freq.toLowerCase()}`,
        duration: 5000,
        action: (
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>We'll remind you</span>
          </div>
        ),
      });
    }
  };

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'vegetables': return Leaf;
      case 'fruits': return Apple;
      case 'dairy': return Milk;
      case 'bakery': return Coffee;
      default: return Package;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background via-orange-50/5 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-4">
            <Sun className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wider">DAILY FRESH</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Daily Essentials
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Order once or subscribe for automatic delivery every morning. 
            Always fresh, always on time.
          </p>

          {/* Features badges */}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Badge variant="outline" className="px-3 py-1.5 gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Free delivery on orders over MK 15,000
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Delivery before 7 AM
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Skip or pause anytime
            </Badge>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {dailyItems.map((item) => {
            const CategoryIcon = getCategoryIcon(item.category);
            const isSubscribed = subscribed.includes(item.id);
            
            return (
              <Card 
                key={item.id}
                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Freshness indicator */}
                <div className="absolute top-3 left-3 z-10">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    item.freshness === 1 ? 'bg-green-500 text-white' :
                    item.freshness === 2 ? 'bg-yellow-500 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    <Timer className="w-3 h-3" />
                    <span>{item.freshness}h old</span>
                  </div>
                </div>

                {/* Organic/Local badges */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                  {item.organic && (
                    <Badge className="bg-green-600 text-white border-none">
                      <Leaf className="w-3 h-3 mr-1" />
                      Organic
                    </Badge>
                  )}
                  {item.local && (
                    <Badge className="bg-blue-600 text-white border-none">
                      <Heart className="w-3 h-3 mr-1" />
                      Local
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Image with category icon overlay */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Category icon on hover */}
                      <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CategoryIcon className="w-3 h-3 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base mb-1">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{item.freq}</p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">{item.unit}</p>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-foreground text-lg">
                          MK {item.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">/unit</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all active:scale-95 group/btn"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      </button>
                      
                      <button
                        onClick={() => handleSubscribe(item)}
                        disabled={isSubscribed}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 group/btn ${
                          isSubscribed 
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:scale-105'
                        }`}
                        title={isSubscribed ? 'Subscribed' : 'Subscribe'}
                      >
                        {isSubscribed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Subscription badge when hovered */}
                  {hoveredItem === item.id && !isSubscribed && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs py-1.5 px-3 text-center animate-slide-up">
                      <span className="flex items-center justify-center gap-1">
                        <Bell className="w-3 h-3" />
                        Subscribe to save 15%
                      </span>
                    </div>
                  )}

                  {/* Subscribed badge */}
                  {isSubscribed && (
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs py-1.5 px-3 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active subscription • Next delivery tomorrow
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">First subscription order gets 20% off</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="link" className="text-primary gap-1">
              Learn more
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default DailyEssentials;