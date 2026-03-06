export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'family' | 'daily' | 'subscription' | 'office' | 'student' | 'express';
  status: 'active' | 'inactive' | 'maintenance';
  featured: boolean;
  order: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyPackage {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  items: number;
  familySize: 'small' | 'medium' | 'large';
  savings: number;
  rating: number;
  tags: string[];
  includes: string[];
  popular?: boolean;
  bestValue?: boolean;
  status: 'active' | 'inactive';
  // Nutrition information
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DailyFreshProduct {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  rating: number;
  badge?: string;
  category: string;
  timeAvailable: 'morning' | 'afternoon' | 'evening' | 'all-day';
  freshness: number;
  stock: number;
  limit?: number;
  organic?: boolean;
  local?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  interval: 'weekly' | 'biweekly' | 'monthly';
  category: 'vegetables' | 'dairy' | 'bread' | 'mixed' | 'family';
  items: number;
  popularity: number;
  savings: number;
  features: string[];
  image?: string;
  color: string;
  bgColor: string;
  icon: string;
  discount?: number;
  minimumCommitment?: number;
  trialDays?: number;
  setupFee?: number;
  cancellationFee?: number;
  popular?: boolean;
  bestValue?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface OfficePack {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  interval: 'one-time' | 'weekly' | 'monthly';
  size: 'small' | 'medium' | 'large' | 'enterprise';
  teamSize: string;
  items: number;
  popularity: number;
  savings: number;
  features: string[];
  includes: string[];
  image: string;
  color: string;
  bgColor: string;
  icon: string;
  recommended?: boolean;
  discount?: number;
  minQuantity?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface StudentPack {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: 'weekly' | 'monthly' | 'semester';
  lifestyle: 'budget' | 'standard' | 'premium' | 'international';
  items: number;
  popularity: number;
  savings: number;
  features: string[];
  includes: string[];
  image: string;
  color: string;
  bgColor: string;
  icon: string;
  recommended?: boolean;
  studentType: 'local' | 'international' | 'all';
  discount?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface StudentDeal {
  id: string;
  serviceId: string;
  name: string;
  discount: number;
  code: string;
  expiry: string;
  image: string;
  icon: string;
  used: number;
  limit: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  serviceId: string;
  name: string;
  coverage: 'full' | 'partial' | 'coming';
  time: string;
  fee: number;
  minOrder: number;
  icon: string;
  riders: number;
  status: 'active' | 'inactive';
  coordinates?: {
    lat: number;
    lng: number;
    radius: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySlot {
  id: string;
  serviceId: string;
  time: string;
  available: boolean;
  price: number;
  estimated: string;
  icon: string;
  maxOrders?: number;
  currentOrders?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStats {
  totalPackages: number;
  activePackages: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  popularItems: {
    id: string;
    name: string;
    orders: number;
  }[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  icon: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  featured: boolean;
  order: number;
  metadata?: Record<string, any>;
}

// Input types for creating/updating services (omit auto-generated fields)
export type CreateFamilyPackageInput = Omit<FamilyPackage, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;
export type UpdateFamilyPackageInput = Partial<CreateFamilyPackageInput>;

export type CreateDailyFreshProductInput = Omit<DailyFreshProduct, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;
export type UpdateDailyFreshProductInput = Partial<CreateDailyFreshProductInput>;

export type CreateSubscriptionPlanInput = Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSubscriptionPlanInput = Partial<CreateSubscriptionPlanInput>;

export type CreateOfficePackInput = Omit<OfficePack, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOfficePackInput = Partial<CreateOfficePackInput>;

export type CreateStudentPackInput = Omit<StudentPack, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStudentPackInput = Partial<CreateStudentPackInput>;

export type CreateStudentDealInput = Omit<StudentDeal, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStudentDealInput = Partial<CreateStudentDealInput>;

export type CreateDeliveryZoneInput = Omit<DeliveryZone, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDeliveryZoneInput = Partial<CreateDeliveryZoneInput>;

export type CreateDeliverySlotInput = Omit<DeliverySlot, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDeliverySlotInput = Partial<CreateDeliverySlotInput>;

// Filter types for queries
export interface ServiceFilters {
  type?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  featured?: boolean;
  search?: string;
}

export interface FamilyPackageFilters {
  familySize?: 'small' | 'medium' | 'large';
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  minSavings?: number;
  popular?: boolean;
  bestValue?: boolean;
  search?: string;
}

export interface DailyFreshFilters {
  timeAvailable?: 'morning' | 'afternoon' | 'evening' | 'all-day';
  category?: string;
  status?: 'active' | 'inactive';
  minFreshness?: number;
  maxFreshness?: number;
  organic?: boolean;
  local?: boolean;
  inStock?: boolean;
  search?: string;
}

export interface SubscriptionFilters {
  interval?: 'weekly' | 'biweekly' | 'monthly';
  category?: 'vegetables' | 'dairy' | 'bread' | 'mixed' | 'family';
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  minPopularity?: number;
  search?: string;
}

export interface OfficePackFilters {
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  interval?: 'one-time' | 'weekly' | 'monthly';
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  minPopularity?: number;
  recommended?: boolean;
  search?: string;
}

export interface StudentPackFilters {
  lifestyle?: 'budget' | 'standard' | 'premium' | 'international';
  duration?: 'weekly' | 'monthly' | 'semester';
  studentType?: 'local' | 'international' | 'all';
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  minPopularity?: number;
  search?: string;
}

export interface StudentDealFilters {
  status?: 'active' | 'expired' | 'disabled';
  minDiscount?: number;
  maxDiscount?: number;
  search?: string;
}

export interface DeliveryZoneFilters {
  coverage?: 'full' | 'partial' | 'coming';
  status?: 'active' | 'inactive';
  minRiders?: number;
  search?: string;
}

export interface DeliverySlotFilters {
  available?: boolean;
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Response types for paginated results
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard stats
export interface DashboardStats {
  totalServices: number;
  activeServices: number;
  totalPackages: number;
  activePackages: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  popularPackages: {
    id: string;
    name: string;
    type: string;
    orders: number;
  }[];
}