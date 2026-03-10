import express from 'express';
const router = express.Router();
import {
  // Public routes
  getPublicPlans,
  getPlanDetails,
  createSubscription,
  getSubscriptionByToken,
  findSubscription,
  sendManagementLink,
  
  // Protected routes
  getSubscription,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getDeliveryHistory,
  
  // Admin routes
  getSubscriptionStats,
  getAllSubscriptions,
  getSubscriptionDeliveries,
  getSubscriptionInvoices,
  getSubscriptionOrders,
  recordDelivery,
  updateDeliveryStatus,
  markInvoiceAsPaid,
  updateOrderStatus,
  logSubscriptionCall,
  
  // Rider management routes
  getAdminRiders,
  createRider,
  updateRider,
  deleteRider,
  toggleRiderStatus,
  getRiderStats,
  
  // Subscriber detail routes
  getSubscriberById,
  getSubscriberDeliveries,
  getSubscriberInvoices,
  generateInvoice,
  markInvoicePaid,
  getSubscriberNotes,
  addSubscriberNote,
  deleteSubscriberNote,
  updateAdminNotes,
  
  // Pending calls routes
  getPendingCalls,
  updateCallStatus,
  
  // Reminders routes
  getReminders,
  createReminder,
  markReminderSent,
  deleteReminder
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
router.get('/subscriptions/:id', protect, getSubscription);

// Update subscription
router.put('/subscriptions/:id', protect, updateSubscription);

// Pause subscription
router.post('/subscriptions/:id/pause', protect, pauseSubscription);

// Resume subscription
router.post('/subscriptions/:id/resume', protect, resumeSubscription);

// Cancel subscription
router.post('/subscriptions/:id/cancel', protect, cancelSubscription);

// Get delivery history
router.get('/subscriptions/:id/deliveries', protect, getDeliveryHistory);

// ============= ADMIN ROUTES =============
// IMPORTANT: Specific named routes must come BEFORE parameterized routes

// Get all subscriptions with filters
router.get('/admin/subscriptions', protect, authorize(['admin', 'super_admin', 'manager']), getAllSubscriptions);

// Get subscription stats
router.get('/admin/subscriptions/stats', protect, authorize(['admin', 'super_admin']), getSubscriptionStats);

// Get subscription deliveries with filters
router.get('/admin/subscriptions/deliveries', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriptionDeliveries);

// Get subscription invoices
router.get('/admin/subscriptions/invoices', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriptionInvoices);

// Get subscription orders
router.get('/admin/subscriptions/orders', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriptionOrders);

// PENDING CALLS ROUTES - Specific routes first
router.get('/admin/subscriptions/pending-calls', protect, authorize(['admin', 'super_admin', 'manager']), getPendingCalls);

// REMINDERS ROUTES - Specific routes first
router.get('/admin/subscriptions/reminders', protect, authorize(['admin', 'super_admin', 'manager']), getReminders);
router.post('/admin/subscriptions/reminders', protect, authorize(['admin', 'manager']), createReminder);
router.patch('/admin/subscriptions/reminders/:id/sent', protect, authorize(['admin', 'manager']), markReminderSent);
router.delete('/admin/subscriptions/reminders/:id', protect, authorize(['admin', 'manager']), deleteReminder);

// ============= PARAMETERIZED ADMIN ROUTES (must come AFTER specific routes) =============

// Get single subscriber with plan details
router.get('/admin/subscriptions/:id', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriberById);

// Update call status for a subscription
router.patch('/admin/subscriptions/:id/call-status', protect, authorize(['admin', 'manager']), updateCallStatus);

// Log call for subscription
router.post('/admin/subscriptions/:id/call', protect, authorize(['admin', 'manager']), logSubscriptionCall);

// Get subscriber deliveries
router.get('/admin/subscriptions/:id/deliveries', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriberDeliveries);

// Add delivery for subscriber - Using recordDelivery instead of addSubscriberDelivery
router.post('/admin/subscriptions/:id/deliveries', protect, authorize(['admin', 'manager']), recordDelivery);

// Get subscriber invoices
router.get('/admin/subscriptions/:id/invoices', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriberInvoices);

// Generate invoice for subscriber
router.post('/admin/subscriptions/:id/invoices', protect, authorize(['admin', 'manager']), generateInvoice);

// Mark invoice as paid
router.patch('/admin/subscriptions/:id/invoices/:invoiceId/paid', protect, authorize(['admin']), markInvoicePaid);

// Get subscriber notes
router.get('/admin/subscriptions/:id/notes', protect, authorize(['admin', 'super_admin', 'manager']), getSubscriberNotes);

// Add note for subscriber
router.post('/admin/subscriptions/:id/notes', protect, authorize(['admin', 'manager']), addSubscriberNote);

// Delete note
router.delete('/admin/subscriptions/:id/notes/:noteId', protect, authorize(['admin', 'manager']), deleteSubscriberNote);

// Update admin notes (the editable notes field in customer_subscriptions)
router.patch('/admin/subscriptions/:id/admin-notes', protect, authorize(['admin', 'manager']), updateAdminNotes);

// Record delivery (admin only) - Alternative route to avoid conflict
router.post('/admin/subscriptions/:id/record-delivery', protect, authorize(['admin', 'manager']), recordDelivery);

// Update delivery status
router.patch('/admin/subscriptions/deliveries/:deliveryId', protect, authorize(['admin', 'manager']), updateDeliveryStatus);

// Update order status
router.patch('/admin/subscriptions/orders/:orderId', protect, authorize(['admin', 'manager']), updateOrderStatus);

// Mark invoice as paid (alternative route)
router.patch('/admin/subscriptions/invoices/:invoiceId/paid', protect, authorize(['admin']), markInvoiceAsPaid);

// ============= RIDER MANAGEMENT ROUTES =============

// Get all riders with pagination and search
router.get('/admin/riders', protect, authorize(['admin', 'super_admin', 'manager']), getAdminRiders);

// Get rider statistics
router.get('/admin/riders/stats', protect, authorize(['admin', 'super_admin', 'manager']), getRiderStats);

// Create new rider
router.post('/admin/riders', protect, authorize(['admin', 'super_admin']), createRider);

// Update rider
router.put('/admin/riders/:id', protect, authorize(['admin', 'super_admin']), updateRider);

// Delete rider
router.delete('/admin/riders/:id', protect, authorize(['admin', 'super_admin']), deleteRider);

// Toggle rider status (cycles through active → on_delivery → inactive → active)
router.patch('/admin/riders/:id/toggle', protect, authorize(['admin', 'super_admin', 'manager']), toggleRiderStatus);

export default router;