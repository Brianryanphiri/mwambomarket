import express from 'express';
import {
  createOrder,
  trackOrder,
  lookupOrders,
  cancelOrder,
  validateCoupon,
  getPublicDeliveryZones,
  getPublicDeliverySlots,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ============= PUBLIC ROUTES (no auth required) =============
// IMPORTANT: These must be registered FIRST before any protected routes

// Validate coupon
router.post('/validate-coupon', validateCoupon);

// Get public delivery data
router.get('/delivery-zones', getPublicDeliveryZones);
router.get('/delivery-slots', getPublicDeliverySlots);

// Create order (guest checkout)
router.post('/', createOrder);

// Track order (public)
router.get('/track', trackOrder);

// Lookup orders by email
router.post('/lookup', lookupOrders);

// Cancel order (guest)
router.post('/:orderNumber/cancel', cancelOrder);

// ============= ADMIN ROUTES (protected) =============
// Using '/admin' prefix for all admin routes

// Dashboard stats
router.get('/admin/dashboard', protect, admin('super_admin', 'admin', 'manager'), getDashboardStats);

// Get all orders with filters
router.get('/admin', protect, admin('super_admin', 'admin', 'manager'), getAllOrders);

// Get single order
router.get('/admin/:id', protect, admin('super_admin', 'admin', 'manager'), getOrder);

// Update order status
router.patch('/admin/:id/status', protect, admin('super_admin', 'admin'), updateOrderStatus);

export default router;