import express from 'express';
const router = express.Router();
import {
  getPublicPlans,
  getPlanDetails,
  createSubscription,
  getSubscriptionByToken,
  findSubscription,
  getSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getDeliveryHistory,
  sendManagementLink,
  getSubscriptionStats,
  recordDelivery
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateSubscription } from '../middleware/validateSubscription.js';

// ============= PUBLIC ROUTES (no auth required) =============

// Get all active subscription plans
router.get('/subscriptions/plans', getPublicPlans);

// Get single plan details
router.get('/subscriptions/plans/:id', getPlanDetails);

// Create new subscription (no account required)
router.post('/subscriptions', validateSubscription, createSubscription);

// Get subscription by token (for management)
router.get('/subscriptions/manage', getSubscriptionByToken);

// Find subscription by number + email/phone
router.post('/subscriptions/find', findSubscription);

// Send management link
router.post('/subscriptions/send-link', sendManagementLink);

// ============= PROTECTED ROUTES (require token) =============

// Get subscription details
router.get('/subscriptions/:id', getSubscription);

// Update subscription
router.put('/subscriptions/:id', updateSubscription);

// Pause subscription
router.post('/subscriptions/:id/pause', pauseSubscription);

// Resume subscription
router.post('/subscriptions/:id/resume', resumeSubscription);

// Cancel subscription
router.post('/subscriptions/:id/cancel', cancelSubscription);

// Get delivery history
router.get('/subscriptions/:id/deliveries', getDeliveryHistory);

// ============= ADMIN ROUTES =============

// Get subscription stats
router.get('/admin/subscriptions/stats', protect, authorize(['admin', 'super_admin']), getSubscriptionStats);

// Record delivery (admin only)
router.post('/admin/subscriptions/:id/deliveries', protect, authorize(['admin', 'manager']), recordDelivery);

export default router;