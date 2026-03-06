import express from 'express';
import {
  createOrder,
  trackOrder,
  lookupOrders,
  cancelOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (guest checkout)
router.post('/', createOrder);
router.get('/track/:token', trackOrder);
router.post('/lookup', lookupOrders);
router.post('/:orderNumber/cancel', cancelOrder);

// Admin routes (protected)
router.get('/admin', protect, admin, getAllOrders);
router.get('/admin/dashboard', protect, admin, getDashboardStats);
router.get('/admin/:id', protect, admin, getOrder);
router.patch('/admin/:id/status', protect, admin, updateOrderStatus);

export default router;