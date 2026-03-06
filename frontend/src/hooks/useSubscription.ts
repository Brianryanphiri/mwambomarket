import { useState } from 'react';
import { subscriptionService, CreateSubscriptionData } from '@/services/subscriptionService';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  subscriptionNumber: string;
  planName: string;
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
  totalPaid: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  pauseUntil?: string;
  cancelledAt?: string;
  planId: string;
  planPrice: number;
  planInterval: string;
  planCategory: string;
  planItems: number;
  planFeatures: string[];
  planColor: string;
  planBgColor: string;
  planIcon: string;
  createdAt: string;
  updatedAt: string;
}

interface ManagementLinkResponse {
  message: string;
  count: number;
  links: {
    subscriptionNumber: string;
    planName: string;
    status: string;
    managementLink: string;
  }[];
}

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  const createSubscription = async (data: CreateSubscriptionData) => {
    setLoading(true);
    try {
      const result = await subscriptionService.createSubscription(data);
      
      localStorage.setItem('last_subscription', JSON.stringify({
        id: result.subscription.id,
        number: result.subscription.subscriptionNumber,
        email: data.customerEmail
      }));

      toast({
        title: '🎉 Subscription Created!',
        description: `Your subscription #${result.subscription.subscriptionNumber} has been created. Check your email for the management link.`,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create subscription';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const findSubscription = async (subscriptionNumber: string, email?: string, phone?: string) => {
    setLoading(true);
    try {
      const result = await subscriptionService.findSubscription({ subscriptionNumber, email, phone });
      setSubscription(result);
      
      toast({
        title: 'Subscription Found',
        description: `Managing subscription #${result.subscriptionNumber}`,
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Subscription Not Found',
        description: error.response?.data?.message || 'Could not find subscription',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionByToken = async (token: string, email: string) => {
    setLoading(true);
    try {
      const result = await subscriptionService.getSubscriptionByToken(token, email);
      setSubscription(result);
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load subscription',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, data: {
    deliveryDay?: string;
    deliveryTime?: string;
    deliveryAddress?: string;
    deliveryInstructions?: string;
  }) => {
    setLoading(true);
    try {
      const result = await subscriptionService.updateSubscription(id, data);
      setSubscription(result);
      
      toast({
        title: 'Success',
        description: 'Your subscription has been updated successfully',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update subscription',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const pauseSubscription = async (id: string, untilDate: string) => {
    setLoading(true);
    try {
      const result = await subscriptionService.pauseSubscription(id, untilDate);
      setSubscription(result);
      
      const pauseDate = new Date(untilDate).toLocaleDateString();
      
      toast({
        title: '⏸️ Subscription Paused',
        description: `Your subscription is paused until ${pauseDate}`,
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to pause subscription',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resumeSubscription = async (id: string) => {
    setLoading(true);
    try {
      const result = await subscriptionService.resumeSubscription(id);
      setSubscription(result);
      
      toast({
        title: '▶️ Subscription Resumed',
        description: 'Your subscription is now active again',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resume subscription',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (id: string, reason?: string) => {
    setLoading(true);
    try {
      const result = await subscriptionService.cancelSubscription(id, reason);
      setSubscription(result);
      
      toast({
        title: '✕ Subscription Cancelled',
        description: reason ? `Cancelled: ${reason}` : 'Your subscription has been cancelled successfully',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel subscription',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendManagementLink = async (email?: string, phone?: string) => {
    setLoading(true);
    try {
      const result = await subscriptionService.sendManagementLink({ email, phone });
      
      const contactMethod = email ? `email ${email}` : `phone ${phone}`;
      toast({
        title: '📧 Link Sent!',
        description: `Management link sent to ${contactMethod}`,
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send management link',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryHistory = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const deliveries = await subscriptionService.getDeliveryHistory(subscriptionId);
      return deliveries;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load delivery history',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearSubscription = () => {
    setSubscription(null);
  };

  const getLastSubscription = () => {
    const stored = localStorage.getItem('last_subscription');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    loading,
    subscription,
    createSubscription,
    findSubscription,
    getSubscriptionByToken,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    sendManagementLink,
    getDeliveryHistory,
    clearSubscription,
    getLastSubscription,
  };
};