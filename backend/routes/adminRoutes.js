import express from 'express';
import pool from '../config/database.js';
import {
  login,
  register,
  getMe,
  getDashboardStats,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  getCustomers,
  getCustomerDetails,
  getAnalytics
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import adminProductRoutes from './adminProductRoutes.js'; // Import the new routes

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboardStats);
router.get('/dashboard/stats', protect, admin(), getDashboardStats);
router.get('/analytics', protect, admin(), getAnalytics);

// Super admin only routes - includes registration
router.post('/register', protect, admin('super_admin'), register);
router.get('/admins', protect, admin('super_admin'), getAllAdmins);
router.post('/admins', protect, admin('super_admin'), createAdmin);
router.put('/admins/:id', protect, admin('super_admin'), updateAdmin);

// Customer routes
router.get('/customers', protect, admin(), getCustomers);
router.get('/customers/:email', protect, admin(), getCustomerDetails);

// Mount product routes - these will be at /api/admin/products
router.use('/products', protect, adminProductRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Admin API is running'
  });
});

// Dashboard summary endpoint
router.get('/summary', protect, async (req, res) => {
  try {
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [customerCount] = await pool.query('SELECT COUNT(*) as count FROM customers');
    
    const [revenue] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total 
      FROM orders 
      WHERE payment_status = 'paid' AND status != 'cancelled'
    `);
    
    const [recentOrders] = await pool.query(`
      SELECT id, order_number, customer_name, total, status, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    const [lowStockProducts] = await pool.query(`
      SELECT id, name, sku, stock, low_stock_alert 
      FROM products 
      WHERE stock <= low_stock_alert AND stock > 0
      LIMIT 5
    `);
    
    res.json({
      counts: {
        products: productCount[0].count,
        orders: orderCount[0].count,
        customers: customerCount[0].count,
        revenue: revenue[0].total
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard summary',
      error: error.message 
    });
  }
});

export default router;