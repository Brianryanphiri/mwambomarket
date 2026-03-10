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
  getAnalytics,
  
  // Discount controllers
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscount,
  
  // Newsletter controllers
  getNewsletterSubscribers,
  addNewsletterSubscriber,
  updateNewsletterSubscriber,
  deleteNewsletterSubscriber,
  importNewsletterSubscribers,
  exportNewsletterSubscribers,
  getNewsletterStats,
  getCampaigns,
  createCampaign,
  getCampaignDetails,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  sendTestEmail,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  
  // Supplier controllers
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplier,
  
  // Brand controllers
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  
  // Delivery Zone controllers
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  toggleDeliveryZone,
  
  // Delivery Slot controllers
  getDeliverySlots,
  createDeliverySlot,
  updateDeliverySlot,
  deleteDeliverySlot,
  toggleDeliverySlot,

  // Content Management controllers
  getPages,
  createPage,
  updatePage,
  deletePage,
  togglePage,
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQ,
  reorderFAQ,

  // Settings controllers
  getSettings,
  updateSettings,
  getPaymentSettings,
  updatePaymentSettings,
  getShippingSettings,
  updateShippingSettings,
  getTaxSettings,
  updateTaxSettings,

  // User Management controllers
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUser,
  deleteAdminUser,

  // Permissions controllers
  getPermissions,
  updatePermissions,

  // Media Management controllers
  getMediaFiles,
  deleteMediaFile,
  uploadMediaFile,

  // Notification controllers
  getNotificationCount
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import adminProductRoutes from './adminProductRoutes.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// ============= PUBLIC ROUTES =============
router.post('/login', login);

// ============= PROTECTED ROUTES =============
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboardStats);
router.get('/dashboard/stats', protect, admin(), getDashboardStats);
router.get('/analytics', protect, admin(), getAnalytics);

// ============= NOTIFICATION ROUTES =============
router.get('/notifications/count', protect, getNotificationCount);

// ============= DISCOUNT ROUTES =============
router.get('/discounts', protect, admin(), getDiscounts);
router.post('/discounts', protect, admin(), createDiscount);
router.put('/discounts/:id', protect, admin(), updateDiscount);
router.delete('/discounts/:id', protect, admin(), deleteDiscount);
router.patch('/discounts/:id/toggle', protect, admin(), toggleDiscount);

// ============= NEWSLETTER ROUTES =============

// Subscriber management
router.get('/newsletter/subscribers', protect, admin(), getNewsletterSubscribers);
router.post('/newsletter/subscribers', protect, admin(), addNewsletterSubscriber);
router.put('/newsletter/subscribers/:id', protect, admin(), updateNewsletterSubscriber);
router.delete('/newsletter/subscribers/:id', protect, admin(), deleteNewsletterSubscriber);
router.post('/newsletter/subscribers/import', protect, admin(), importNewsletterSubscribers);
router.get('/newsletter/subscribers/export', protect, admin(), exportNewsletterSubscribers);
router.get('/newsletter/stats', protect, admin(), getNewsletterStats);

// Campaign management
router.get('/newsletter/campaigns', protect, admin(), getCampaigns);
router.post('/newsletter/campaigns', protect, admin(), createCampaign);
router.get('/newsletter/campaigns/:id', protect, admin(), getCampaignDetails);
router.put('/newsletter/campaigns/:id', protect, admin(), updateCampaign);
router.delete('/newsletter/campaigns/:id', protect, admin(), deleteCampaign);
router.post('/newsletter/campaigns/:id/send', protect, admin(), sendCampaign);
router.post('/newsletter/campaigns/:id/test', protect, admin(), sendTestEmail);

// Template management
router.get('/newsletter/templates', protect, admin(), getTemplates);
router.post('/newsletter/templates', protect, admin(), createTemplate);
router.put('/newsletter/templates/:id', protect, admin(), updateTemplate);
router.delete('/newsletter/templates/:id', protect, admin(), deleteTemplate);

// ============= SUPPLIER ROUTES =============
router.get('/suppliers', protect, admin(), getSuppliers);
router.post('/suppliers', protect, admin(), createSupplier);
router.put('/suppliers/:id', protect, admin(), updateSupplier);
router.delete('/suppliers/:id', protect, admin(), deleteSupplier);
router.patch('/suppliers/:id/toggle', protect, admin(), toggleSupplier);

// ============= BRAND ROUTES =============
router.get('/brands', protect, admin(), getBrands);
router.post('/brands', protect, admin(), createBrand);
router.put('/brands/:id', protect, admin(), updateBrand);
router.delete('/brands/:id', protect, admin(), deleteBrand);

// ============= DELIVERY ZONE ROUTES =============
router.get('/delivery-zones', protect, admin(), getDeliveryZones);
router.post('/delivery-zones', protect, admin(), createDeliveryZone);
router.put('/delivery-zones/:id', protect, admin(), updateDeliveryZone);
router.delete('/delivery-zones/:id', protect, admin(), deleteDeliveryZone);
router.patch('/delivery-zones/:id/toggle', protect, admin(), toggleDeliveryZone);

// ============= DELIVERY SLOT ROUTES =============
router.get('/delivery-slots', protect, admin(), getDeliverySlots);
router.post('/delivery-slots', protect, admin(), createDeliverySlot);
router.put('/delivery-slots/:id', protect, admin(), updateDeliverySlot);
router.delete('/delivery-slots/:id', protect, admin(), deleteDeliverySlot);
router.patch('/delivery-slots/:id/toggle', protect, admin(), toggleDeliverySlot);

// ============= CONTENT MANAGEMENT ROUTES =============

// Pages
router.get('/content/pages', protect, admin(), getPages);
router.post('/content/pages', protect, admin(), createPage);
router.put('/content/pages/:id', protect, admin(), updatePage);
router.delete('/content/pages/:id', protect, admin(), deletePage);
router.patch('/content/pages/:id/toggle', protect, admin(), togglePage);

// Blog
router.get('/content/blog', protect, admin(), getBlogPosts);
router.post('/content/blog', protect, admin(), createBlogPost);
router.put('/content/blog/:id', protect, admin(), updateBlogPost);
router.delete('/content/blog/:id', protect, admin(), deleteBlogPost);

// FAQ
router.get('/content/faqs', protect, admin(), getFAQs);
router.post('/content/faqs', protect, admin(), createFAQ);
router.put('/content/faqs/:id', protect, admin(), updateFAQ);
router.delete('/content/faqs/:id', protect, admin(), deleteFAQ);
router.patch('/content/faqs/:id/toggle', protect, admin(), toggleFAQ);
router.patch('/content/faqs/reorder', protect, admin(), reorderFAQ);

// ============= SETTINGS ROUTES =============
router.get('/settings', protect, admin('super_admin', 'admin'), getSettings);
router.put('/settings', protect, admin('super_admin', 'admin'), updateSettings);
router.get('/settings/payment', protect, admin('super_admin', 'admin'), getPaymentSettings);
router.put('/settings/payment', protect, admin('super_admin', 'admin'), updatePaymentSettings);
router.get('/settings/shipping', protect, admin('super_admin', 'admin'), getShippingSettings);
router.put('/settings/shipping', protect, admin('super_admin', 'admin'), updateShippingSettings);
router.get('/settings/tax', protect, admin('super_admin', 'admin'), getTaxSettings);
router.put('/settings/tax', protect, admin('super_admin', 'admin'), updateTaxSettings);

// ============= USER MANAGEMENT ROUTES =============
router.get('/users', protect, admin('super_admin'), getAdminUsers);
router.post('/users', protect, admin('super_admin'), createAdminUser);
router.put('/users/:id', protect, admin('super_admin'), updateAdminUser);
router.patch('/users/:id/toggle', protect, admin('super_admin'), toggleAdminUser);
router.delete('/users/:id', protect, admin('super_admin'), deleteAdminUser);

// ============= PERMISSIONS ROUTES =============
router.get('/permissions', protect, admin('super_admin'), getPermissions);
router.put('/permissions', protect, admin('super_admin'), updatePermissions);

// ============= SUPER ADMIN ONLY ROUTES =============
router.post('/register', protect, admin('super_admin'), register);
router.get('/admins', protect, admin('super_admin'), getAllAdmins);
router.post('/admins', protect, admin('super_admin'), createAdmin);
router.put('/admins/:id', protect, admin('super_admin'), updateAdmin);

// ============= CUSTOMER ROUTES =============
router.get('/customers', protect, admin(), getCustomers);
router.get('/customers/:email', protect, admin(), getCustomerDetails);

// ============= PRODUCT ROUTES =============
router.use('/products', protect, admin(), adminProductRoutes);

// ============= MEDIA MANAGEMENT ROUTES =============
router.get('/media', protect, admin(), getMediaFiles);
router.delete('/media/:filename', protect, admin(), deleteMediaFile);
router.post('/media/upload', protect, admin(), upload.single('image'), uploadMediaFile);

// ============= HEALTH CHECK =============
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Admin API is running'
  });
});

// ============= DASHBOARD SUMMARY =============
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