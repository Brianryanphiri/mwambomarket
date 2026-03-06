<<<<<<< HEAD
import pool from '../config/database.js';
import Product from '../models/Product.js';

// Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20,
      featured,
      bestSeller,
      onSale
    } = req.query;

    const filters = {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      featured: featured === 'true',
      bestSeller: bestSeller === 'true',
      onSale: onSale === 'true'
    };

    const pagination = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const products = await Product.findAll(filters, pagination);
    const total = await Product.count(filters);

    res.json({
      products,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.getBestSellers(20);
    res.json(products);
  } catch (error) {
    console.error('Get best sellers error:', error);
    res.status(500).json({ message: 'Failed to fetch best sellers' });
  }
};

// Get new arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.getNewArrivals(20);
    res.json(products);
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Failed to fetch new arrivals' });
  }
};

// Get deals
export const getDeals = async (req, res) => {
  try {
    const products = await Product.getDeals(20);
    res.json(products);
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
};

// Get trending
export const getTrending = async (req, res) => {
  try {
    const products = await Product.findAll(
      { sort: 'popular' },
      { limit: 20 }
    );
    res.json(products);
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ message: 'Failed to fetch trending products' });
  }
};

// Get by category
export const getByCategory = async (req, res) => {
  try {
    const products = await Product.findAll(
      { category: req.params.category },
      { limit: 50 }
    );
    res.json(products);
  } catch (error) {
    console.error('Get by category error:', error);
    res.status(500).json({ message: 'Failed to fetch category products' });
  }
};

// ============= CATEGORY MANAGEMENT FUNCTIONS =============

// Get all categories with product counts - SAFE PATTERN FOR MARIADB 10.4
export const getCategories = async (req, res) => {
  try {
    // Step 1: Get all categories
    const [categories] = await pool.query(`
      SELECT * FROM product_categories 
      ORDER BY sort_order ASC, name ASC
    `);

    // Step 2: Get product counts separately
    const [counts] = await pool.query(`
      SELECT category_id, COUNT(*) as product_count 
      FROM products 
      WHERE status = 'active' AND category_id IS NOT NULL
      GROUP BY category_id
    `);

    // Step 3: Merge in JavaScript
    const countMap = {};
    counts.forEach(c => { countMap[c.category_id] = c.product_count; });

    const result = categories.map(cat => ({
      ...cat,
      product_count: countMap[cat.id] || 0
    }));

    res.json({ 
      success: true, 
      categories: result 
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories',
      error: error.message 
    });
  }
};

// Get single category by ID
export const getCategory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM product_categories WHERE id = ?',
      [req.params.id]
    );
    
    const category = rows[0] || null;
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Get product count for this category
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as product_count FROM products WHERE category_id = ? AND status = "active"',
      [category.id]
    );
    
    category.product_count = countResult[0].product_count;

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent_id, sort_order, is_active } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: 'Category name is required' 
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    // Check if slug already exists
    const [existing] = await pool.query(
      'SELECT id FROM product_categories WHERE slug = ?',
      [slug]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'A category with this name already exists' 
      });
    }

    // Insert new category
    const [result] = await pool.query(
      `INSERT INTO product_categories 
       (name, slug, description, parent_id, sort_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, slug, description || null, parent_id || null, sort_order || 0, is_active !== false]
    );

    // Fetch the newly created category
    const [newCategoryRows] = await pool.query(
      'SELECT * FROM product_categories WHERE id = ?',
      [result.insertId]
    );
    
    const newCategory = newCategoryRows[0];

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_id, sort_order, is_active } = req.body;

    // Check if category exists
    const [existingRows] = await pool.query(
      'SELECT * FROM product_categories WHERE id = ?',
      [id]
    );
    
    const existingCategory = existingRows[0];
    
    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();

      // Check if new slug already exists (excluding current category)
      const [slugCheck] = await pool.query(
        'SELECT id FROM product_categories WHERE slug = ? AND id != ?',
        [slug, id]
      );

      if (slugCheck.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'A category with this name already exists' 
        });
      }
    }

    // Prevent setting parent_id to itself
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Category cannot be its own parent' 
      });
    }

    // Update category
    await pool.query(
      `UPDATE product_categories 
       SET name = ?, slug = ?, description = ?, parent_id = ?, 
           sort_order = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name || existingCategory.name,
        slug,
        description !== undefined ? description : existingCategory.description,
        parent_id !== undefined ? parent_id : existingCategory.parent_id,
        sort_order !== undefined ? sort_order : existingCategory.sort_order,
        is_active !== undefined ? is_active : existingCategory.is_active,
        id
      ]
    );

    // Fetch the updated category
    const [updatedRows] = await pool.query(
      'SELECT * FROM product_categories WHERE id = ?',
      [id]
    );
    
    const updatedCategory = updatedRows[0];

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existingRows] = await pool.query(
      'SELECT * FROM product_categories WHERE id = ?',
      [id]
    );
    
    const existingCategory = existingRows[0];
    
    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Check if any products are linked to this category
    const [products] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete category: ${products[0].count} product(s) are linked to it` 
      });
    }

    // Check if any child categories exist
    const [children] = await pool.query(
      'SELECT COUNT(*) as count FROM product_categories WHERE parent_id = ?',
      [id]
    );

    if (children[0].count > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete category: ${children[0].count} sub-category(ies) are linked to it` 
      });
    }

    // Delete the category
    await pool.query('DELETE FROM product_categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

// Toggle category status
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existingRows] = await pool.query(
      'SELECT is_active FROM product_categories WHERE id = ?',
      [id]
    );
    
    const existingCategory = existingRows[0];
    
    if (!existingCategory) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Toggle the is_active status
    const newStatus = !existingCategory.is_active;

    await pool.query(
      'UPDATE product_categories SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Category ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to toggle category status',
      error: error.message
    });
  }
};

// ============= END CATEGORY MANAGEMENT FUNCTIONS =============

// Create product (admin)
export const createProduct = async (req, res) => {
  try {
    const productId = await Product.create(req.body);
    const product = await Product.findById(productId);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product (admin)
export const updateProduct = async (req, res) => {
  try {
    await Product.update(req.params.id, req.body);
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Update stock (admin)
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    await Product.update(req.params.id, { stock });
    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
};

// Get inventory summary
export const getInventorySummary = async (req, res) => {
  try {
    const summary = await Product.getInventorySummary();
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get inventory summary' 
    });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.getLowStock();
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get low stock products' 
    });
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.getOutOfStock();
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get out of stock products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get out of stock products' 
    });
  }
=======
import Product from '../models/Product.js';

// Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20,
      featured,
      bestSeller,
      onSale
    } = req.query;

    const filters = {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      featured: featured === 'true',
      bestSeller: bestSeller === 'true',
      onSale: onSale === 'true'
    };

    const pagination = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const products = await Product.findAll(filters, pagination);
    const total = await Product.count(filters);

    res.json({
      products,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.getBestSellers(20);
    res.json(products);
  } catch (error) {
    console.error('Get best sellers error:', error);
    res.status(500).json({ message: 'Failed to fetch best sellers' });
  }
};

// Get new arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.getNewArrivals(20);
    res.json(products);
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Failed to fetch new arrivals' });
  }
};

// Get deals
export const getDeals = async (req, res) => {
  try {
    const products = await Product.getDeals(20);
    res.json(products);
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
};

// Get trending
export const getTrending = async (req, res) => {
  try {
    const products = await Product.findAll(
      { sort: 'popular' },
      { limit: 20 }
    );
    res.json(products);
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ message: 'Failed to fetch trending products' });
  }
};

// Get by category
export const getByCategory = async (req, res) => {
  try {
    const products = await Product.findAll(
      { category: req.params.category },
      { limit: 50 }
    );
    res.json(products);
  } catch (error) {
    console.error('Get by category error:', error);
    res.status(500).json({ message: 'Failed to fetch category products' });
  }
};

// Create product (admin)
export const createProduct = async (req, res) => {
  try {
    const productId = await Product.create(req.body);
    const product = await Product.findById(productId);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product (admin)
export const updateProduct = async (req, res) => {
  try {
    await Product.update(req.params.id, req.body);
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Update stock (admin)
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    await Product.update(req.params.id, { stock });
    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
>>>>>>> 3143af0e69b764942ae4e67b67f5fb252f67c462
};