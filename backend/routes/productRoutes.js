import express from 'express';
import pool from '../config/database.js';
import { protect, admin } from '../middleware/auth.js';
import {
  getProducts,
  getProduct,
  getBestSellers,
  getNewArrivals,
  getDeals,
  getTrending,
  getByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getInventorySummary,
  getLowStockProducts,
  getOutOfStockProducts,
  // Category management functions
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/productController.js';

const router = express.Router();

// ============= PUBLIC ROUTES (No auth required) =============

// @route   GET /api/products
// @desc    Get all products for public view with pagination and filters
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.id, p.name, p.price, p.original_price as original_price,
        p.unit, p.category, p.rating, p.is_featured,
        p.is_best_seller, p.is_on_sale, p.is_new, p.stock
      FROM products p
      WHERE p.status = 'active' AND (p.is_featured = 1 OR p.is_best_seller = 1)
      ORDER BY p.sold_count DESC
      LIMIT 12
    `);

    // Get images for each product
    for (let product of products) {
      const [images] = await pool.query(
        'SELECT image_url as url FROM product_images WHERE product_id = ? LIMIT 1',
        [product.id]
      );
      product.images = images.map(img => {
        if (!img.url) return null;
        return img.url.split('/').pop();
      });
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      message: 'Error fetching featured products', 
      error: error.message 
    });
  }
});

// @route   GET /api/products/best-sellers
// @desc    Get best selling products
// @access  Public
router.get('/best-sellers', getBestSellers);

// @route   GET /api/products/new-arrivals
// @desc    Get new arrivals
// @access  Public
router.get('/new-arrivals', getNewArrivals);

// @route   GET /api/products/deals
// @desc    Get deals
// @access  Public
router.get('/deals', getDeals);

// @route   GET /api/products/trending
// @desc    Get trending products
// @access  Public
router.get('/trending', getTrending);

// @route   GET /api/products/categories
// @desc    Get all categories with product counts
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/products/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/categories/:id', getCategory);

// @route   GET /api/products/category/:category
// @desc    Get products by category (using category name)
// @access  Public
router.get('/category/:category', getByCategory);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', getProduct);

// ============= ADMIN ROUTES (Protected) =============

// @route   GET /api/admin/products/inventory/summary
// @desc    Get inventory summary
// @access  Private (Admin)
router.get('/inventory/summary', protect, admin(), getInventorySummary);

// @route   GET /api/admin/products/inventory/low-stock
// @desc    Get low stock products
// @access  Private (Admin)
router.get('/inventory/low-stock', protect, admin(), getLowStockProducts);

// @route   GET /api/admin/products/inventory/out-of-stock
// @desc    Get out of stock products
// @access  Private (Admin)
router.get('/inventory/out-of-stock', protect, admin(), getOutOfStockProducts);

// @route   POST /api/admin/products/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/categories', protect, admin(), createCategory);

// @route   PUT /api/admin/products/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/categories/:id', protect, admin(), updateCategory);

// @route   DELETE /api/admin/products/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/categories/:id', protect, admin(), deleteCategory);

// @route   PATCH /api/admin/products/categories/:id/toggle
// @desc    Toggle category status
// @access  Private (Admin)
router.patch('/categories/:id/toggle', protect, admin(), toggleCategoryStatus);

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Private (Admin)
router.post('/', protect, admin(), createProduct);

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Private (Admin)
router.put('/:id', protect, admin(), updateProduct);

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private (Admin)
router.delete('/:id', protect, admin(), deleteProduct);

// @route   PATCH /api/admin/products/:id/stock
// @desc    Update product stock
// @access  Private (Admin)
router.patch('/:id/stock', protect, admin(), updateStock);

export default router;