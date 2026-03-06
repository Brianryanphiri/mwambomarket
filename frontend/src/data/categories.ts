// src/data/categories.ts
import { FC } from 'react';
import { 
  Leaf, Drumstick, Egg, Warehouse, SprayCan, Users, Sun, CalendarClock,
  Apple, Fish, Coffee, Wine, Baby, Pill, Scissors, Dog,
  Sparkles, Flame, Sandwich, Candy, Droplets, Shirt, Lightbulb,
  LucideIcon
} from 'lucide-react';

export interface Category {
  id: string;
  icon: LucideIcon; // Use LucideIcon type instead of any
  name: string;
  desc: string;
  color: string;
  slug: string;
}

export const mainCategories: Category[] = [
  { 
    id: 'fresh-produce',
    icon: Leaf, 
    name: 'Fresh Produce', 
    desc: 'Fruits & Vegetables', 
    color: 'bg-store-green-light text-primary',
    slug: 'fresh-produce'
  },
  { 
    id: 'meat-chicken',
    icon: Drumstick, 
    name: 'Meat & Chicken', 
    desc: 'Fresh & Frozen', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'meat-chicken'
  },
  { 
    id: 'dairy-eggs',
    icon: Egg, 
    name: 'Dairy & Eggs', 
    desc: 'Milk, Cheese, Eggs', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'dairy-eggs'
  },
  { 
    id: 'pantry-essentials',
    icon: Warehouse, 
    name: 'Pantry Essentials', 
    desc: 'Rice, Flour, Oil', 
    color: 'bg-store-green-light text-primary',
    slug: 'pantry-essentials'
  },
  { 
    id: 'household-items',
    icon: SprayCan, 
    name: 'Household Items', 
    desc: 'Cleaning & Care', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'household-items'
  },
  { 
    id: 'family-packages',
    icon: Users, 
    name: 'Family Packages', 
    desc: 'Ready-made Bundles', 
    color: 'bg-store-green-light text-primary',
    slug: 'family-packages'
  },
  { 
    id: 'daily-fresh',
    icon: Sun, 
    name: 'Daily Fresh', 
    desc: 'Order or Subscribe', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'daily-fresh'
  },
  { 
    id: 'subscriptions',
    icon: CalendarClock, 
    name: 'Subscriptions', 
    desc: 'Weekly & Monthly', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'subscriptions'
  },
];

export const moreCategories: Category[] = [
  { 
    id: 'fruits',
    icon: Apple, 
    name: 'Fruits', 
    desc: 'Fresh & Seasonal', 
    color: 'bg-store-green-light text-primary',
    slug: 'fruits'
  },
  { 
    id: 'fish-seafood',
    icon: Fish, 
    name: 'Fish & Seafood', 
    desc: 'Fresh & Dried', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'fish-seafood'
  },
  { 
    id: 'tea-coffee',
    icon: Coffee, 
    name: 'Tea & Coffee', 
    desc: 'Hot Beverages', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'tea-coffee'
  },
  { 
    id: 'beverages',
    icon: Wine, 
    name: 'Beverages', 
    desc: 'Juices & Drinks', 
    color: 'bg-store-green-light text-primary',
    slug: 'beverages'
  },
  { 
    id: 'baby-care',
    icon: Baby, 
    name: 'Baby Care', 
    desc: 'Diapers & Food', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'baby-care'
  },
  { 
    id: 'health-wellness',
    icon: Pill, 
    name: 'Health & Wellness', 
    desc: 'Vitamins & First Aid', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'health-wellness'
  },
  { 
    id: 'personal-care',
    icon: Scissors, 
    name: 'Personal Care', 
    desc: 'Hygiene & Beauty', 
    color: 'bg-store-green-light text-primary',
    slug: 'personal-care'
  },
  { 
    id: 'pet-supplies',
    icon: Dog, 
    name: 'Pet Supplies', 
    desc: 'Food & Accessories', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'pet-supplies'
  },
  { 
    id: 'laundry',
    icon: Sparkles, 
    name: 'Laundry', 
    desc: 'Detergent & Softener', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'laundry'
  },
  { 
    id: 'cooking-gas',
    icon: Flame, 
    name: 'Cooking Gas', 
    desc: 'Refills & Cylinders', 
    color: 'bg-store-green-light text-primary',
    slug: 'cooking-gas'
  },
  { 
    id: 'snacks',
    icon: Sandwich, 
    name: 'Snacks', 
    desc: 'Chips & Biscuits', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'snacks'
  },
  { 
    id: 'sweets-treats',
    icon: Candy, 
    name: 'Sweets & Treats', 
    desc: 'Chocolate & Candy', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'sweets-treats'
  },
  { 
    id: 'water-ice',
    icon: Droplets, 
    name: 'Water & Ice', 
    desc: 'Bottled & Dispensers', 
    color: 'bg-store-green-light text-primary',
    slug: 'water-ice'
  },
  { 
    id: 'home-textiles',
    icon: Shirt, 
    name: 'Home Textiles', 
    desc: 'Towels & Bedding', 
    color: 'bg-store-amber-light text-store-amber',
    slug: 'home-textiles'
  },
  { 
    id: 'home-essentials',
    icon: Lightbulb, 
    name: 'Home Essentials', 
    desc: 'Bulbs, Batteries & More', 
    color: 'bg-store-warm-light text-store-warm',
    slug: 'home-essentials'
  },
];

export const getAllCategories = (): Category[] => [...mainCategories, ...moreCategories];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return getAllCategories().find(cat => cat.slug === slug);
};