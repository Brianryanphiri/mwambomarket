import api from './api';
import {
  Service,
  FamilyPackage,
  DailyFreshProduct,
  SubscriptionPlan,
  OfficePack,
  StudentPack,
  StudentDeal,
  DeliveryZone,
  DeliverySlot,
  ServiceStats,
  ServiceFormData,
  // Import input types from your types file
  CreateFamilyPackageInput,
  UpdateFamilyPackageInput,
  CreateDailyFreshProductInput,
  UpdateDailyFreshProductInput,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  CreateOfficePackInput,
  UpdateOfficePackInput,
  CreateStudentPackInput,
  UpdateStudentPackInput,
  CreateStudentDealInput,
  UpdateStudentDealInput,
  CreateDeliveryZoneInput,
  UpdateDeliveryZoneInput,
  CreateDeliverySlotInput,
  UpdateDeliverySlotInput
} from '@/types/service.types';

class ServiceService {
  // Remove /api from these URLs since api.ts already adds it
  private readonly baseUrl = '/admin/services';
  private readonly publicBaseUrl = '/services';

  // ============= SERVICE MANAGEMENT =============
  
  async getServices(): Promise<Service[]> {
    try {
      const response = await api.get(this.baseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getService(id: string): Promise<Service> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  }

  async createService(serviceData: ServiceFormData): Promise<Service> {
    try {
      const response = await api.post(this.baseUrl, serviceData);
      return response.data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: string, serviceData: Partial<ServiceFormData>): Promise<Service> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }

  async getServiceStats(id: string): Promise<ServiceStats> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for service ${id}:`, error);
      return {
        totalPackages: 0,
        activePackages: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        popularItems: []
      };
    }
  }

  // ============= FAMILY PACKAGES =============

  async getFamilyPackages(serviceId: string): Promise<FamilyPackage[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/family-packages`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching family packages:', error);
      throw error;
    }
  }

  async getFamilyPackage(serviceId: string, packageId: string): Promise<FamilyPackage> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/family-packages/${packageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching family package ${packageId}:`, error);
      throw error;
    }
  }

  async createFamilyPackage(serviceId: string, packageData: CreateFamilyPackageInput): Promise<FamilyPackage> {
    try {
      console.log('Creating family package with data:', packageData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/family-packages`, packageData);
      return response.data;
    } catch (error) {
      console.error('Error creating family package:', error);
      throw error;
    }
  }

  async updateFamilyPackage(serviceId: string, packageId: string, packageData: UpdateFamilyPackageInput): Promise<FamilyPackage> {
    try {
      console.log('Updating family package with data:', packageData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/family-packages/${packageId}`, packageData);
      return response.data;
    } catch (error) {
      console.error(`Error updating family package ${packageId}:`, error);
      throw error;
    }
  }

  async deleteFamilyPackage(serviceId: string, packageId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/family-packages/${packageId}`);
    } catch (error) {
      console.error(`Error deleting family package ${packageId}:`, error);
      throw error;
    }
  }

  // ============= DAILY FRESH PRODUCTS =============

  async getDailyFreshProducts(serviceId: string): Promise<DailyFreshProduct[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/daily-fresh`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching daily fresh products:', error);
      throw error;
    }
  }

  async getDailyFreshProduct(serviceId: string, productId: string): Promise<DailyFreshProduct> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/daily-fresh/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching daily fresh product ${productId}:`, error);
      throw error;
    }
  }

  async createDailyFreshProduct(serviceId: string, productData: CreateDailyFreshProductInput): Promise<DailyFreshProduct> {
    try {
      console.log('Creating daily fresh product with data:', productData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/daily-fresh`, productData);
      return response.data;
    } catch (error) {
      console.error('Error creating daily fresh product:', error);
      throw error;
    }
  }

  async updateDailyFreshProduct(serviceId: string, productId: string, productData: UpdateDailyFreshProductInput): Promise<DailyFreshProduct> {
    try {
      console.log('Updating daily fresh product with data:', productData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/daily-fresh/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating daily fresh product ${productId}:`, error);
      throw error;
    }
  }

  async deleteDailyFreshProduct(serviceId: string, productId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/daily-fresh/${productId}`);
    } catch (error) {
      console.error(`Error deleting daily fresh product ${productId}:`, error);
      throw error;
    }
  }

  async updateFreshness(serviceId: string, productId: string, freshness: number): Promise<DailyFreshProduct> {
    try {
      const response = await api.patch(`${this.baseUrl}/${serviceId}/daily-fresh/${productId}/freshness`, { freshness });
      return response.data;
    } catch (error) {
      console.error(`Error updating freshness for product ${productId}:`, error);
      throw error;
    }
  }

  // ============= SUBSCRIPTION PLANS =============

  async getSubscriptionPlans(serviceId: string): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/subscriptions`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  async getSubscriptionPlan(serviceId: string, planId: string): Promise<SubscriptionPlan> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/subscriptions/${planId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription plan ${planId}:`, error);
      throw error;
    }
  }

  async createSubscriptionPlan(serviceId: string, planData: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    try {
      console.log('Creating subscription plan with data:', planData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/subscriptions`, planData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  async updateSubscriptionPlan(serviceId: string, planId: string, planData: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
    try {
      console.log('Updating subscription plan with data:', planData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/subscriptions/${planId}`, planData);
      return response.data;
    } catch (error) {
      console.error(`Error updating subscription plan ${planId}:`, error);
      throw error;
    }
  }

  async deleteSubscriptionPlan(serviceId: string, planId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/subscriptions/${planId}`);
    } catch (error) {
      console.error(`Error deleting subscription plan ${planId}:`, error);
      throw error;
    }
  }

  async updatePopularity(serviceId: string, planId: string, popularity: number): Promise<SubscriptionPlan> {
    try {
      const response = await api.patch(`${this.baseUrl}/${serviceId}/subscriptions/${planId}/popularity`, { popularity });
      return response.data;
    } catch (error) {
      console.error(`Error updating popularity for plan ${planId}:`, error);
      throw error;
    }
  }

  // ============= OFFICE PACKS =============

  async getOfficePacks(serviceId: string): Promise<OfficePack[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/office-packs`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching office packs:', error);
      throw error;
    }
  }

  async getOfficePack(serviceId: string, packId: string): Promise<OfficePack> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/office-packs/${packId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching office pack ${packId}:`, error);
      throw error;
    }
  }

  async createOfficePack(serviceId: string, packData: CreateOfficePackInput): Promise<OfficePack> {
    try {
      console.log('Creating office pack with data:', packData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/office-packs`, packData);
      return response.data;
    } catch (error) {
      console.error('Error creating office pack:', error);
      throw error;
    }
  }

  async updateOfficePack(serviceId: string, packId: string, packData: UpdateOfficePackInput): Promise<OfficePack> {
    try {
      console.log('Updating office pack with data:', packData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/office-packs/${packId}`, packData);
      return response.data;
    } catch (error) {
      console.error(`Error updating office pack ${packId}:`, error);
      throw error;
    }
  }

  async deleteOfficePack(serviceId: string, packId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/office-packs/${packId}`);
    } catch (error) {
      console.error(`Error deleting office pack ${packId}:`, error);
      throw error;
    }
  }

  // ============= STUDENT PACKS =============

  async getStudentPacks(serviceId: string): Promise<StudentPack[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/student-packs`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching student packs:', error);
      throw error;
    }
  }

  async getStudentPack(serviceId: string, packId: string): Promise<StudentPack> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/student-packs/${packId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student pack ${packId}:`, error);
      throw error;
    }
  }

  async createStudentPack(serviceId: string, packData: CreateStudentPackInput): Promise<StudentPack> {
    try {
      console.log('Creating student pack with data:', packData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/student-packs`, packData);
      return response.data;
    } catch (error) {
      console.error('Error creating student pack:', error);
      throw error;
    }
  }

  async updateStudentPack(serviceId: string, packId: string, packData: UpdateStudentPackInput): Promise<StudentPack> {
    try {
      console.log('Updating student pack with data:', packData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/student-packs/${packId}`, packData);
      return response.data;
    } catch (error) {
      console.error(`Error updating student pack ${packId}:`, error);
      throw error;
    }
  }

  async deleteStudentPack(serviceId: string, packId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/student-packs/${packId}`);
    } catch (error) {
      console.error(`Error deleting student pack ${packId}:`, error);
      throw error;
    }
  }

  // ============= STUDENT DEALS =============

  async getStudentDeals(serviceId: string): Promise<StudentDeal[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/student-deals`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching student deals:', error);
      throw error;
    }
  }

  async getStudentDeal(serviceId: string, dealId: string): Promise<StudentDeal> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/student-deals/${dealId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student deal ${dealId}:`, error);
      throw error;
    }
  }

  async createStudentDeal(serviceId: string, dealData: CreateStudentDealInput): Promise<StudentDeal> {
    try {
      console.log('Creating student deal with data:', dealData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/student-deals`, dealData);
      return response.data;
    } catch (error) {
      console.error('Error creating student deal:', error);
      throw error;
    }
  }

  async updateStudentDeal(serviceId: string, dealId: string, dealData: UpdateStudentDealInput): Promise<StudentDeal> {
    try {
      console.log('Updating student deal with data:', dealData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/student-deals/${dealId}`, dealData);
      return response.data;
    } catch (error) {
      console.error(`Error updating student deal ${dealId}:`, error);
      throw error;
    }
  }

  async deleteStudentDeal(serviceId: string, dealId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/student-deals/${dealId}`);
    } catch (error) {
      console.error(`Error deleting student deal ${dealId}:`, error);
      throw error;
    }
  }

  async incrementDealUsage(serviceId: string, dealId: string): Promise<StudentDeal> {
    try {
      const response = await api.patch(`${this.baseUrl}/${serviceId}/student-deals/${dealId}/usage`);
      return response.data;
    } catch (error) {
      console.error(`Error incrementing usage for deal ${dealId}:`, error);
      throw error;
    }
  }

  // ============= DELIVERY ZONES =============

  async getDeliveryZones(serviceId: string): Promise<DeliveryZone[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/delivery-zones`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      throw error;
    }
  }

  async getDeliveryZone(serviceId: string, zoneId: string): Promise<DeliveryZone> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/delivery-zones/${zoneId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching delivery zone ${zoneId}:`, error);
      throw error;
    }
  }

  async createDeliveryZone(serviceId: string, zoneData: CreateDeliveryZoneInput): Promise<DeliveryZone> {
    try {
      console.log('Creating delivery zone with data:', zoneData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/delivery-zones`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      throw error;
    }
  }

  async updateDeliveryZone(serviceId: string, zoneId: string, zoneData: UpdateDeliveryZoneInput): Promise<DeliveryZone> {
    try {
      console.log('Updating delivery zone with data:', zoneData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/delivery-zones/${zoneId}`, zoneData);
      return response.data;
    } catch (error) {
      console.error(`Error updating delivery zone ${zoneId}:`, error);
      throw error;
    }
  }

  async deleteDeliveryZone(serviceId: string, zoneId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/delivery-zones/${zoneId}`);
    } catch (error) {
      console.error(`Error deleting delivery zone ${zoneId}:`, error);
      throw error;
    }
  }

  async updateZoneRiders(serviceId: string, zoneId: string, riders: number): Promise<DeliveryZone> {
    try {
      const response = await api.patch(`${this.baseUrl}/${serviceId}/delivery-zones/${zoneId}/riders`, { riders });
      return response.data;
    } catch (error) {
      console.error(`Error updating riders for zone ${zoneId}:`, error);
      throw error;
    }
  }

  // ============= DELIVERY SLOTS =============

  async getDeliverySlots(serviceId: string): Promise<DeliverySlot[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/delivery-slots`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      throw error;
    }
  }

  async getDeliverySlot(serviceId: string, slotId: string): Promise<DeliverySlot> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/delivery-slots/${slotId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching delivery slot ${slotId}:`, error);
      throw error;
    }
  }

  async createDeliverySlot(serviceId: string, slotData: CreateDeliverySlotInput): Promise<DeliverySlot> {
    try {
      console.log('Creating delivery slot with data:', slotData);
      const response = await api.post(`${this.baseUrl}/${serviceId}/delivery-slots`, slotData);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery slot:', error);
      throw error;
    }
  }

  async updateDeliverySlot(serviceId: string, slotId: string, slotData: UpdateDeliverySlotInput): Promise<DeliverySlot> {
    try {
      console.log('Updating delivery slot with data:', slotData);
      const response = await api.put(`${this.baseUrl}/${serviceId}/delivery-slots/${slotId}`, slotData);
      return response.data;
    } catch (error) {
      console.error(`Error updating delivery slot ${slotId}:`, error);
      throw error;
    }
  }

  async deleteDeliverySlot(serviceId: string, slotId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${serviceId}/delivery-slots/${slotId}`);
    } catch (error) {
      console.error(`Error deleting delivery slot ${slotId}:`, error);
      throw error;
    }
  }

  async updateSlotAvailability(serviceId: string, slotId: string, available: boolean): Promise<DeliverySlot> {
    try {
      const response = await api.patch(`${this.baseUrl}/${serviceId}/delivery-slots/${slotId}/availability`, { available });
      return response.data;
    } catch (error) {
      console.error(`Error updating availability for slot ${slotId}:`, error);
      throw error;
    }
  }

  // ============= BULK OPERATIONS =============

  async bulkUpdateStatus(serviceId: string, type: string, ids: string[], status: 'active' | 'inactive'): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${serviceId}/${type}/bulk-status`, { ids, status });
    } catch (error) {
      console.error('Error bulk updating status:', error);
      throw error;
    }
  }

  async bulkDelete(serviceId: string, type: string, ids: string[]): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/${serviceId}/${type}/bulk-delete`, { ids });
    } catch (error) {
      console.error('Error bulk deleting:', error);
      throw error;
    }
  }

  // ============= IMPORT/EXPORT =============

  async exportData(serviceId: string, type: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${serviceId}/${type}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(serviceId: string, type: string, file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`${this.baseUrl}/${serviceId}/${type}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // ============= PUBLIC METHODS =============

  async getPublicServices(): Promise<Service[]> {
    try {
      const response = await api.get(this.publicBaseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public services:', error);
      return [];
    }
  }

  async getPublicFamilyPackages(): Promise<FamilyPackage[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/family-packages`);
      console.log('Public family packages response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public family packages:', error);
      return [];
    }
  }

  async getPublicDailyFresh(): Promise<DailyFreshProduct[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/daily-fresh`);
      console.log('Public daily fresh response:', response);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public daily fresh:', error);
      return [];
    }
  }

  async getPublicSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/subscriptions`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public subscriptions:', error);
      return [];
    }
  }

  async getPublicOfficePacks(): Promise<OfficePack[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/office-packs`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public office packs:', error);
      return [];
    }
  }

  async getPublicStudentPacks(): Promise<StudentPack[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/student-packs`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public student packs:', error);
      return [];
    }
  }

  async getPublicStudentDeals(): Promise<StudentDeal[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/student-deals`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public student deals:', error);
      return [];
    }
  }

  async getPublicDeliveryZones(): Promise<DeliveryZone[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/delivery-zones`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public delivery zones:', error);
      return [];
    }
  }

  async getPublicDeliverySlots(): Promise<DeliverySlot[]> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/delivery-slots`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching public delivery slots:', error);
      return [];
    }
  }

  async checkDeliveryAvailability(zoneId: string): Promise<boolean> {
    try {
      const response = await api.get(`${this.publicBaseUrl}/delivery/check/${zoneId}`);
      return response.data.available || false;
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      return false;
    }
  }
}

export const serviceService = new ServiceService();