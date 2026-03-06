import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { protect, admin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fix the path - save to backend/uploads/products
    const uploadDir = path.join(__dirname, '../uploads/products');
    console.log('Saving files to:', uploadDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created upload directory:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Apply authentication to all routes
router.use(protect);
router.use(admin('super_admin', 'admin'));

// Helper function to extract filename from URL or path
const getFilenameFromUrl = (url) => {
  if (!url) return null;
  // If it's a full URL, extract the filename
  if (url.includes('/')) {
    return url.split('/').pop();
  }
  return url;
};

// Helper function to format image URL for response
const formatImageUrl = (filename) => {
  if (!filename) return null;
  // Return just the filename - frontend will add the base URL
  return filename;
};

// @route   GET /api/admin/products
// @desc    Get all products with pagination and filters
// @access  Private (Admin only)
router.get('/', async (req, res) => {
  try {
    // Base query without JSON functions
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.original_price as comparePrice,
        p.unit, 
        p.category, 
        p.subcategory, 
        p.stock, 
        p.sku, 
        p.barcode,
        p.low_stock_alert as lowStockAlert, 
        p.weight, 
        p.is_taxable as isTaxable,
        p.tax_rate as taxRate, 
        p.is_physical as isPhysical,
        p.requires_shipping as requiresShipping, 
        p.status,
        p.is_featured as isFeatured, 
        p.is_best_seller as isBestSeller,
        p.is_on_sale as isOnSale, 
        p.is_new as isNew,
        p.organic, 
        p.local_product as localProduct,
        p.rating, 
        p.num_reviews as numReviews,
        p.sold_count as soldCount,
        p.seo_title as seoTitle,
        p.seo_description as seoDescription,
        p.seo_keywords as seoKeywords,
        p.created_at as createdAt, 
        p.updated_at as updatedAt
      FROM products p
      WHERE 1=1
    `;
    
    const params = [];
    const conditions = [];

    // Apply search filter
    if (req.query.search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Apply category filter
    if (req.query.category && req.query.category !== 'all') {
      conditions.push('p.category = ?');
      params.push(req.query.category);
    }

    // Apply status filter
    if (req.query.status && req.query.status !== 'all') {
      if (req.query.status === 'inStock') {
        conditions.push('p.stock > 0');
      } else if (req.query.status === 'lowStock') {
        conditions.push('p.stock > 0 AND p.stock <= p.low_stock_alert');
      } else if (req.query.status === 'outOfStock') {
        conditions.push('p.stock <= 0');
      }
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }

    // Add sorting
    const sortField = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortField} ${sortOrder}`;

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute queries
    const [products] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));

    // For each product, get images separately
    for (let product of products) {
      const [images] = await pool.query(
        'SELECT image_url as url, alt, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order',
        [product.id]
      );
      
      // Format image URLs - return just the filename
      product.images = images.map(img => ({
        ...img,
        url: formatImageUrl(img.url)
      }));

      const [tags] = await pool.query(
        'SELECT tag FROM product_tags WHERE product_id = ? ORDER BY tag',
        [product.id]
      );
      product.tags = tags.map(t => t.tag);
    }

    res.json({
      products: products,
      page: page,
      pages: Math.ceil(countResult[0].total / limit),
      total: countResult[0].total
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/products/categories
// @desc    Get all categories with product counts
// @access  Private (Admin only)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT 
        category as name,
        COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY category
    `);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/products/stats
// @desc    Get product statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM products');
    const [active] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock > 0');
    const [lowStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= low_stock_alert');
    const [outOfStock] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock <= 0');
    
    res.json({
      total: total[0].count,
      active: active[0].count,
      lowStock: lowStock[0].count,
      outOfStock: outOfStock[0].count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/products/check-sku
// @desc    Check if SKU is unique
// @access  Private (Admin only)
router.get('/check-sku', async (req, res) => {
  try {
    const { sku, productId } = req.query;
    
    if (!sku) {
      return res.status(400).json({ message: 'SKU is required' });
    }

    let query = 'SELECT id FROM products WHERE sku = ?';
    const params = [sku];
    
    if (productId) {
      query += ' AND id != ?';
      params.push(productId);
    }
    
    const [existing] = await pool.query(query, params);
    
    res.json({
      isUnique: existing.length === 0
    });
  } catch (error) {
    console.error('Error checking SKU:', error);
    res.status(500).json({ 
      message: 'Error checking SKU', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get single product by ID
// @access  Private (Admin only)
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.*,
        p.original_price as comparePrice,
        p.low_stock_alert as lowStockAlert,
        p.is_taxable as isTaxable,
        p.tax_rate as taxRate,
        p.is_physical as isPhysical,
        p.requires_shipping as requiresShipping,
        p.is_featured as isFeatured,
        p.is_best_seller as isBestSeller,
        p.is_on_sale as isOnSale,
        p.is_new as isNew,
        p.local_product as localProduct,
        p.sold_count as soldCount,
        p.num_reviews as numReviews,
        p.seo_title as seoTitle,
        p.seo_description as seoDescription,
        p.seo_keywords as seoKeywords,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM products p
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    const product = products[0];

    // Get images
    const [images] = await pool.query(
      'SELECT image_url as url, alt, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    );
    
    // Format image URLs - return just the filename
    product.images = images.map(img => ({
      ...img,
      url: formatImageUrl(img.url)
    }));

    // Get tags
    const [tags] = await pool.query(
      'SELECT tag FROM product_tags WHERE product_id = ? ORDER BY tag',
      [product.id]
    );
    product.tags = tags.map(t => t.tag);

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Error fetching product', 
      error: error.message 
    });
  }
});

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      name, description, price, comparePrice, unit, category,
      subcategory, stock, sku, barcode, lowStockAlert, weight,
      isTaxable, taxRate, isPhysical, requiresShipping,
      isFeatured, isBestSeller, isOnSale, isNew, organic,
      localProduct, minOrder, maxOrder, saleEnds,
      seoTitle, seoDescription, seoKeywords,
      status, tags, images
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const [existing] = await connection.query(
        'SELECT id FROM products WHERE sku = ?',
        [sku]
      );

      if (existing.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Insert product
    const [result] = await connection.query(
      `INSERT INTO products (
        name, description, price, original_price, unit, category,
        subcategory, stock, sku, barcode, low_stock_alert, weight,
        is_taxable, tax_rate, is_physical, requires_shipping,
        is_featured, is_best_seller, is_on_sale, is_new, organic,
        local_product, min_order, max_order, sale_ends,
        seo_title, seo_description, seo_keywords, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, price, comparePrice || null, unit, category,
        subcategory || null, stock || 0, sku || null, barcode || null, lowStockAlert || 10, weight || null,
        isTaxable !== false ? 1 : 0, taxRate || null, isPhysical !== false ? 1 : 0, requiresShipping !== false ? 1 : 0,
        isFeatured ? 1 : 0, isBestSeller ? 1 : 0, isOnSale ? 1 : 0, isNew ? 1 : 0,
        organic ? 1 : 0, localProduct ? 1 : 0, minOrder || 1, maxOrder || null,
        saleEnds || null, seoTitle || null, seoDescription || null, seoKeywords || null, status || 'active'
      ]
    );

    const productId = result.insertId;

    // Insert images - store only the filename
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        // Extract just the filename if it's a full URL
        const filename = getFilenameFromUrl(imageUrl);
        
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, alt, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, filename, name || '', i === 0 ? 1 : 0, i]
        );
      }
    }

    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await connection.query(
          'INSERT INTO product_tags (product_id, tag) VALUES (?, ?)',
          [productId, tag]
        );
      }
    }

    await connection.commit();

    res.status(201).json({ 
      message: 'Product created successfully',
      id: productId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Error creating product', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const productId = req.params.id;
    const {
      name, description, price, comparePrice, unit, category,
      subcategory, stock, sku, barcode, lowStockAlert, weight,
      isTaxable, taxRate, isPhysical, requiresShipping,
      isFeatured, isBestSeller, isOnSale, isNew,
      status, tags, images
    } = req.body;

    console.log('Updating product with images:', images);

    // Check if product exists
    const [existing] = await connection.query(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Check if SKU is unique (excluding current product)
    if (sku) {
      const [skuCheck] = await connection.query(
        'SELECT id FROM products WHERE sku = ? AND id != ?',
        [sku, productId]
      );

      if (skuCheck.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Update product
    await connection.query(
      `UPDATE products SET
        name = ?, description = ?, price = ?, original_price = ?,
        unit = ?, category = ?, subcategory = ?, stock = ?,
        sku = ?, barcode = ?, low_stock_alert = ?, weight = ?,
        is_taxable = ?, tax_rate = ?, is_physical = ?, requires_shipping = ?,
        is_featured = ?, is_best_seller = ?, is_on_sale = ?, is_new = ?,
        status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name, description, price, comparePrice || null, unit, category,
        subcategory || null, stock || 0, sku || null, barcode || null, lowStockAlert || 10, weight || null,
        isTaxable ? 1 : 0, taxRate || null, isPhysical ? 1 : 0, requiresShipping ? 1 : 0,
        isFeatured ? 1 : 0, isBestSeller ? 1 : 0, isOnSale ? 1 : 0, isNew ? 1 : 0,
        status || 'active', productId
      ]
    );

    // Delete existing images
    await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

    // Insert new images - store only the filename
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        // Extract just the filename if it's a full URL
        const filename = getFilenameFromUrl(imageUrl);
        
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, alt, is_primary, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, filename, name || '', i === 0 ? 1 : 0, i]
        );
      }
    }

    // Delete existing tags
    await connection.query('DELETE FROM product_tags WHERE product_id = ?', [productId]);
    
    // Insert new tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await connection.query(
          'INSERT INTO product_tags (product_id, tag) VALUES (?, ?)',
          [productId, tag]
        );
      }
    }

    await connection.commit();

    // Fetch updated product to return
    const [updatedProduct] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    // Get images for the updated product
    const [productImages] = await connection.query(
      'SELECT image_url as url FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [productId]
    );

    // Get tags for the updated product
    const [productTags] = await connection.query(
      'SELECT tag FROM product_tags WHERE product_id = ?',
      [productId]
    );

    const responseProduct = {
      ...updatedProduct[0],
      images: productImages.map(img => ({
        url: formatImageUrl(img.url)
      })),
      tags: productTags.map(t => t.tag)
    };

    res.json({ 
      message: 'Product updated successfully',
      product: responseProduct
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Error updating product', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // First, get images to delete from filesystem
    const [images] = await connection.query(
      'SELECT image_url FROM product_images WHERE product_id = ?',
      [req.params.id]
    );

    // Delete product (cascades to images and tags)
    const [result] = await connection.query(
      'DELETE FROM products WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    await connection.commit();

    // Delete image files from filesystem
    for (const image of images) {
      if (image.image_url) {
        const filename = getFilenameFromUrl(image.image_url);
        const filePath = path.join(__dirname, '../uploads/products', filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Deleted image file:', filePath);
        }
      }
    }

    res.json({ 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Error deleting product', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// @route   POST /api/admin/products/bulk-delete
// @desc    Bulk delete products
// @access  Private (Admin only)
router.post('/bulk-delete', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'No product IDs provided'
      });
    }

    // Get all images to delete
    const placeholders = ids.map(() => '?').join(',');
    const [images] = await connection.query(
      `SELECT image_url FROM product_images WHERE product_id IN (${placeholders})`,
      ids
    );

    // Delete products
    const [result] = await connection.query(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      ids
    );

    await connection.commit();

    // Delete image files from filesystem
    for (const image of images) {
      if (image.image_url) {
        const filename = getFilenameFromUrl(image.image_url);
        const filePath = path.join(__dirname, '../uploads/products', filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    res.json({ 
      message: `${result.affectedRows} products deleted successfully` 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ 
      message: 'Error bulk deleting products', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// @route   POST /api/admin/products/:id/duplicate
// @desc    Duplicate product
// @access  Private (Admin only)
router.post('/:id/duplicate', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const productId = req.params.id;

    // Get original product
    const [products] = await connection.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const product = products[0];

    // Generate new SKU
    const newSku = product.sku ? `${product.sku}-COPY-${Date.now()}` : null;

    // Create duplicate with new SKU
    const [result] = await connection.query(
      `INSERT INTO products (
        name, description, price, original_price, unit, category,
        subcategory, stock, sku, barcode, low_stock_alert, weight,
        is_taxable, tax_rate, is_physical, requires_shipping,
        is_featured, is_best_seller, is_on_sale, is_new, organic,
        local_product, min_order, max_order, sale_ends,
        seo_title, seo_description, seo_keywords, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${product.name} (Copy)`, product.description, product.price, product.original_price,
        product.unit, product.category, product.subcategory, product.stock,
        newSku, product.barcode, product.low_stock_alert, product.weight,
        product.is_taxable, product.tax_rate, product.is_physical, product.requires_shipping,
        product.is_featured, product.is_best_seller, product.is_on_sale, product.is_new,
        product.organic, product.local_product, product.min_order, product.max_order,
        product.sale_ends, product.seo_title, product.seo_description, product.seo_keywords,
        'draft'
      ]
    );

    const newProductId = result.insertId;

    // Copy tags
    const [tags] = await connection.query(
      'SELECT tag FROM product_tags WHERE product_id = ?',
      [productId]
    );

    for (const tag of tags) {
      await connection.query(
        'INSERT INTO product_tags (product_id, tag) VALUES (?, ?)',
        [newProductId, tag.tag]
      );
    }

    // Copy images - store only the filename
    const [images] = await connection.query(
      'SELECT image_url, alt, is_primary, sort_order FROM product_images WHERE product_id = ?',
      [productId]
    );

    for (const image of images) {
      const filename = getFilenameFromUrl(image.image_url);
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, alt, is_primary, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [newProductId, filename, image.alt, image.is_primary, image.sort_order]
      );
    }

    await connection.commit();

    res.status(201).json({ 
      message: 'Product duplicated successfully',
      id: newProductId 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error duplicating product:', error);
    res.status(500).json({ 
      message: 'Error duplicating product', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// @route   POST /api/admin/products/upload/images
// @desc    Upload product images
// @access  Private (Admin only)
router.post('/upload/images', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        message: 'No files uploaded' 
      });
    }

    // Log the actual save path of each file for debugging
    files.forEach(file => {
      console.log('File saved to:', file.path);
      console.log('File exists check:', fs.existsSync(file.path));
    });

    // Return just the filenames - frontend will add the base URL
    const filenames = files.map(file => file.filename);

    console.log('Uploaded images filenames:', filenames);

    res.json({
      urls: filenames
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ 
      message: 'Error uploading images', 
      error: error.message 
    });
  }
});

export default router;