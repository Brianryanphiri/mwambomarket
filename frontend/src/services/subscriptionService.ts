import api from './api';

export interface CreateSubscriptionData {
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  deliveryDay: string;
  deliveryTime?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: 'cash' | 'airtel_money' | 'tnm_mpamba' | 'card';
  paymentReference?: string;
  totalPaid: number;
}

export interface SubscriptionResponse {
  message: string;
  subscription: {
    id: string;
    subscriptionNumber: string;
    planName: string;
    customerName: string;
    startDate: string;
    nextDeliveryDate: string;
    totalPaid: number;
    managementLink: string;
  };
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  planId: string;
  planName: string;
  planPrice: number;
  planInterval: string;
  planCategory: string;
  planItems: number;
  planFeatures: string[];
  planColor: string;
  planBgColor: string;
  planIcon: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  nextDeliveryDate: string;
  deliveryDay: string;
  deliveryTime?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentReference?: string;
  totalPaid: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  pauseUntil?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  id: string;
  subscriptionId: string;
  deliveryDate: string;
  status: 'scheduled' | 'processing' | 'out_for_delivery' | 'delivered' | 'failed' | 'skipped';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagementLinkResponse {
  message: string;
  count: number;
  links: {
    subscriptionNumber: string;
    planName: string;
    status: string;
    managementLink: string;
  }[];
}

class SubscriptionService {
  private readonly baseUrl = '/subscriptions';

  // Get all active plans
  async getPublicPlans() {
    try {
      const response = await api.get(`${this.baseUrl}/plans`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get single plan details
  async getPlanDetails(planId: string) {
    try {
      const response = await api.get(`${this.baseUrl}/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan details:', error);
      throw error;
    }
  }

  // Create new subscription (no account required)
  async createSubscription(data: CreateSubscriptionData): Promise<SubscriptionResponse> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Get subscription by token (from email link)
  async getSubscriptionByToken(token: string, email: string): Promise<Subscription> {
    try {
      const response = await api.get(`${this.baseUrl}/manage?token=${token}&email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription by token:', error);
      throw error;
    }
  }

  // Find subscription by number and email/phone
  async findSubscription(data: { subscriptionNumber: string; email?: string; phone?: string }): Promise<Subscription> {
    try {
      const response = await api.post(`${this.baseUrl}/find`, data);
      return response.data;
    } catch (error) {
      console.error('Error finding subscription:', error);
      throw error;
    }
  }

  // Send management link to email/phone
  async sendManagementLink(data: { email?: string; phone?: string }): Promise<ManagementLinkResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/send-link`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending management link:', error);
      throw error;
    }
  }

  // Get subscription details
  async getSubscription(id: string): Promise<Subscription> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(id: string, data: {
    deliveryDay?: string;
    deliveryTime?: string;
    deliveryAddress?: string;
    deliveryInstructions?: string;
  }): Promise<Subscription> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Pause subscription
  async pauseSubscription(id: string, untilDate: string): Promise<Subscription> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/pause`, { untilDate });
      return response.data;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  // Resume subscription
  async resumeSubscription(id: string): Promise<Subscription> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/resume`);
      return response.data;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(id: string, reason?: string): Promise<Subscription> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Get delivery history
  async getDeliveryHistory(id: string): Promise<DeliveryRecord[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/deliveries`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      throw error;
    }
  }

  // Check if subscription exists (helper method)
  async checkSubscriptionExists(subscriptionNumber: string, email: string): Promise<boolean> {
    try {
      await this.findSubscription({ subscriptionNumber, email });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get subscription stats (admin only)
  async getSubscriptionStats(planId?: string) {
    try {
      const url = planId ? `/admin/subscriptions/stats?planId=${planId}` : '/admin/subscriptions/stats';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();