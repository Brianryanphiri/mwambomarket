import pool, { withTransaction } from '../config/database.js';

class Product {
  // Count products with filters
  static async count(filters = {}) {
    try {
      let sql = 'SELECT COUNT(*) as total FROM products p WHERE 1=1';
      const values = [];

      if (filters.status) {
        sql += ' AND p.status = ?';
        values.push(filters.status);
      }
      if (filters.category) {
        sql += ' AND (p.category = ? OR p.category_id IN (SELECT id FROM product_categories WHERE slug = ? OR name = ?))';
        values.push(filters.category, filters.category, filters.category);
      }
      if (filters.search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }
      if (filters.min_price) {
        sql += ' AND p.price >= ?';
        values.push(parseFloat(filters.min_price));
      }
      if (filters.max_price) {
        sql += ' AND p.price <= ?';
        values.push(parseFloat(filters.max_price));
      }
      if (filters.in_stock === 'true') {
        sql += ' AND p.stock > 0';
      }
      if (filters.is_featured === 'true') {
        sql += ' AND p.is_featured = true';
      }
      if (filters.is_best_seller === 'true') {
        sql += ' AND p.is_best_seller = true';
      }
      if (filters.is_on_sale === 'true') {
        sql += ' AND p.is_on_sale = true';
      }
      if (filters.organic === 'true') {
        sql += ' AND p.organic = true';
      }
      if (filters.local_product === 'true') {
        sql += ' AND p.local_product = true';
      }

      const [rows] = await pool.query(sql, values);
      return rows[0].total;
    } catch (error) {
      console.error('Error in count:', error);
      throw error;
    }
  }

  // Find all products with filters
  static async findAll(filters = {}) {
    try {
      // Step 1: Build and execute main products query
      let query = `
        SELECT p.*, 
          c.name as category_name,
          c.slug as category_slug
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      
      const values = [];
      const conditions = [];

      // Apply filters
      if (filters.category) {
        conditions.push('(p.category = ? OR p.category_id IN (SELECT id FROM product_categories WHERE slug = ? OR name = ?))');
        values.push(filters.category, filters.category, filters.category);
      }

      if (filters.status) {
        conditions.push('p.status = ?');
        values.push(filters.status);
      }

      if (filters.search) {
        conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      if (filters.min_price) {
        conditions.push('p.price >= ?');
        values.push(parseFloat(filters.min_price));
      }

      if (filters.max_price) {
        conditions.push('p.price <= ?');
        values.push(parseFloat(filters.max_price));
      }

      if (filters.in_stock === 'true') {
        conditions.push('p.stock > 0');
      }

      if (filters.is_featured === 'true') {
        conditions.push('p.is_featured = true');
      }

      if (filters.is_best_seller === 'true') {
        conditions.push('p.is_best_seller = true');
      }

      if (filters.is_on_sale === 'true') {
        conditions.push('p.is_on_sale = true');
      }

      if (filters.organic === 'true') {
        conditions.push('p.organic = true');
      }

      if (filters.local_product === 'true') {
        conditions.push('p.local_product = true');
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      // Get total count first (before pagination)
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM products p 
        WHERE 1=1
      `;
      
      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
      }

      const [countResult] = await pool.query(countQuery, values);
      const total = countResult[0].total;

      // Add sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;

      // Add pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 50;
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      
      // Clone values for pagination query
      const paginatedValues = [...values];
      paginatedValues.push(limit, offset);

      // Execute main products query
      const [products] = await pool.query(query, paginatedValues);

      if (products.length === 0) {
        return {
          products: [],
          total,
          page,
          totalPages: Math.ceil(total / limit)
        };
      }

      // Step 2: Get product IDs for fetching related data
      const productIds = products.map(p => p.id);
      const placeholders = productIds.map(() => '?').join(',');

      // Fetch images
      const [images] = await pool.query(
        `SELECT * FROM product_images 
         WHERE product_id IN (${placeholders}) 
         ORDER BY sort_order ASC`,
        productIds
      );

      // Fetch tags
      const [tags] = await pool.query(
        `SELECT * FROM product_tags 
         WHERE product_id IN (${placeholders})`,
        productIds
      );

      // Fetch variants
      const [variants] = await pool.query(
        `SELECT * FROM product_variants 
         WHERE product_id IN (${placeholders})`,
        productIds
      );

      // Step 3: Merge data in JavaScript
      const productsWithData = products.map(product => ({
        ...product,
        images: images.filter(img => img.product_id === product.id),
        tags: tags.filter(tag => tag.product_id === product.id).map(t => t.tag),
        variants: variants.filter(v => v.product_id === product.id)
      }));

      return {
        products: productsWithData,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Find product by ID
  static async findById(id) {
    try {
      // Step 1: Fetch main product
      const query = `
        SELECT p.*, 
          c.name as category_name,
          c.slug as category_slug
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.id = ?
      `;

      const [products] = await pool.query(query, [id]);
      
      if (products.length === 0) {
        return null;
      }

      const product = products[0];

      // Step 2: Fetch related data
      const [images] = await pool.query(
        `SELECT * FROM product_images 
         WHERE product_id = ? 
         ORDER BY sort_order ASC`,
        [id]
      );

      const [tags] = await pool.query(
        `SELECT * FROM product_tags 
         WHERE product_id = ?`,
        [id]
      );

      const [variants] = await pool.query(
        `SELECT * FROM product_variants 
         WHERE product_id = ?`,
        [id]
      );

      const [reviews] = await pool.query(
        `SELECT * FROM product_reviews 
         WHERE product_id = ? AND is_approved = true 
         ORDER BY created_at DESC`,
        [id]
      );

      // Step 3: Merge data
      return {
        ...product,
        images: images,
        tags: tags.map(t => t.tag),
        variants: variants,
        reviews: reviews
      };
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Find product by SKU
  static async findBySku(sku, excludeId = null) {
    try {
      let query = 'SELECT id, sku FROM products WHERE sku = ?';
      const params = [sku];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }

      const [products] = await pool.query(query, params);
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error('Error in findBySku:', error);
      throw error;
    }
  }

  // Get category by ID
  static async getCategoryById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM product_categories WHERE id = ?', 
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw error;
    }
  }

  // Create new product
  static async create(productData, userId = null) {
    return withTransaction(async (connection) => {
      try {
        const {
          name, description, price, original_price, unit, category,
          subcategory, stock, sku, barcode, low_stock_alert, weight,
          is_taxable, tax_rate, is_physical, requires_shipping,
          is_featured, is_best_seller, is_on_sale, is_new, organic,
          local_product, min_order, max_order, sale_ends,
          seo_title, seo_description, seo_keywords,
          images = [], variants = [], tags = []
        } = productData;

        // Get or create category
        let categoryId = null;
        if (category) {
          const [categories] = await connection.query(
            'SELECT id FROM product_categories WHERE name = ? OR slug = ?',
            [category, category.toLowerCase().replace(/\s+/g, '-')]
          );
          
          if (categories.length > 0) {
            categoryId = categories[0].id;
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
            seo_title, seo_description, seo_keywords,
            category_id, created_by, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name, description, price, original_price, unit, category,
            subcategory, stock, sku, barcode, low_stock_alert || 10, weight,
            is_taxable !== false, tax_rate, is_physical !== false, requires_shipping !== false,
            is_featured || false, is_best_seller || false, is_on_sale || false, is_new || false,
            organic || false, local_product || false, min_order || 1, max_order,
            sale_ends, seo_title, seo_description, seo_keywords,
            categoryId, userId, productData.status || 'active'
          ]
        );

        const productId = result.insertId;

        // Insert images
        if (images && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            await connection.query(
              `INSERT INTO product_images (product_id, image_url, alt, is_primary, sort_order)
               VALUES (?, ?, ?, ?, ?)`,
              [productId, image.url || image, image.alt || '', image.is_primary || i === 0, i]
            );
          }
        }

        // Insert variants
        if (variants && variants.length > 0) {
          for (const variant of variants) {
            await connection.query(
              `INSERT INTO product_variants (product_id, name, price, stock, sku)
               VALUES (?, ?, ?, ?, ?)`,
              [productId, variant.name, variant.price, variant.stock, variant.sku || null]
            );
          }
        }

        // Insert tags
        if (tags && tags.length > 0) {
          for (const tag of tags) {
            await connection.query(
              `INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`,
              [productId, tag]
            );
          }
        }

        // Log inventory
        await connection.query(
          `INSERT INTO inventory_log (product_id, previous_stock, new_stock, change_amount, change_type, created_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, 0, stock, stock, 'restock', userId]
        );

        return await this.findById(productId);
      } catch (error) {
        console.error('Error in create:', error);
        throw error;
      }
    });
  }

  // Update product
  static async update(id, productData, userId = null) {
    return withTransaction(async (connection) => {
      try {
        // Get current product to check stock change
        const [currentProducts] = await connection.query(
          'SELECT stock FROM products WHERE id = ?',
          [id]
        );
        
        const currentStock = currentProducts[0]?.stock || 0;
        const newStock = parseInt(productData.stock) || 0;

        const {
          name, description, price, original_price, unit, category,
          subcategory, stock, sku, barcode, low_stock_alert, weight,
          is_taxable, tax_rate, is_physical, requires_shipping,
          is_featured, is_best_seller, is_on_sale, is_new, organic,
          local_product, min_order, max_order, sale_ends,
          seo_title, seo_description, seo_keywords,
          images = [], variants = [], tags = []
        } = productData;

        // Get or create category
        let categoryId = null;
        if (category) {
          const [categories] = await connection.query(
            'SELECT id FROM product_categories WHERE name = ? OR slug = ?',
            [category, category.toLowerCase().replace(/\s+/g, '-')]
          );
          
          if (categories.length > 0) {
            categoryId = categories[0].id;
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
            organic = ?, local_product = ?, min_order = ?, max_order = ?,
            sale_ends = ?, seo_title = ?, seo_description = ?, seo_keywords = ?,
            category_id = ?, updated_by = ?, status = ?
          WHERE id = ?`,
          [
            name, description, price, original_price, unit, category,
            subcategory, stock, sku, barcode, low_stock_alert, weight,
            is_taxable !== false, tax_rate, is_physical !== false, requires_shipping !== false,
            is_featured || false, is_best_seller || false, is_on_sale || false, is_new || false,
            organic || false, local_product || false, min_order || 1, max_order,
            sale_ends, seo_title, seo_description, seo_keywords,
            categoryId, userId, productData.status || 'active', id
          ]
        );

        // Log stock change if different
        if (currentStock !== newStock) {
          await connection.query(
            `INSERT INTO inventory_log (product_id, previous_stock, new_stock, change_amount, change_type, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, currentStock, newStock, newStock - currentStock, 'adjustment', userId]
          );
        }

        // Update images (delete existing, insert new)
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        
        if (images && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            await connection.query(
              `INSERT INTO product_images (product_id, image_url, alt, is_primary, sort_order)
               VALUES (?, ?, ?, ?, ?)`,
              [id, image.url || image, image.alt || '', image.is_primary || i === 0, i]
            );
          }
        }

        // Update variants
        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
        
        if (variants && variants.length > 0) {
          for (const variant of variants) {
            await connection.query(
              `INSERT INTO product_variants (product_id, name, price, stock, sku)
               VALUES (?, ?, ?, ?, ?)`,
              [id, variant.name, variant.price, variant.stock, variant.sku || null]
            );
          }
        }

        // Update tags
        await connection.query('DELETE FROM product_tags WHERE product_id = ?', [id]);
        
        if (tags && tags.length > 0) {
          for (const tag of tags) {
            await connection.query(
              `INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`,
              [id, tag]
            );
          }
        }

        return await this.findById(id);
      } catch (error) {
        console.error('Error in update:', error);
        throw error;
      }
    });
  }

  // Delete product
  static async delete(id) {
    return withTransaction(async (connection) => {
      try {
        // Get images to delete from filesystem
        const [images] = await connection.query(
          'SELECT image_url FROM product_images WHERE product_id = ?',
          [id]
        );
        
        // Delete product (cascades to images, variants, tags)
        const [result] = await connection.query('DELETE FROM products WHERE id = ?', [id]);
        
        return {
          success: result.affectedRows > 0,
          images: images.map(img => img.image_url)
        };
      } catch (error) {
        console.error('Error in delete:', error);
        throw error;
      }
    });
  }

  // Bulk delete
  static async bulkDelete(ids) {
    if (!ids || ids.length === 0) return 0;
    
    return withTransaction(async (connection) => {
      try {
        const placeholders = ids.map(() => '?').join(',');
        const [result] = await connection.query(
          `DELETE FROM products WHERE id IN (${placeholders})`,
          ids
        );
        return result.affectedRows;
      } catch (error) {
        console.error('Error in bulkDelete:', error);
        throw error;
      }
    });
  }

  // Update product status
  static async updateStatus(id, status) {
    try {
      await pool.query(
        'UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      return await this.findById(id);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  // Duplicate product
  static async duplicate(id, userId = null) {
    return withTransaction(async (connection) => {
      try {
        const product = await this.findById(id);
        if (!product) return null;

        const duplicateData = {
          ...product,
          name: `${product.name} (Copy)`,
          sku: product.sku ? `${product.sku}-COPY-${Date.now()}` : null,
          status: 'draft'
        };

        delete duplicateData.id;
        delete duplicateData.created_at;
        delete duplicateData.updated_at;

        return await this.create(duplicateData, userId);
      } catch (error) {
        console.error('Error in duplicate:', error);
        throw error;
      }
    });
  }

  // Get product statistics
  static async getStats() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM products',
        active: 'SELECT COUNT(*) as count FROM products WHERE status = "active"',
        draft: 'SELECT COUNT(*) as count FROM products WHERE status = "draft"',
        outOfStock: 'SELECT COUNT(*) as count FROM products WHERE stock <= 0',
        lowStock: 'SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= low_stock_alert',
        totalValue: 'SELECT COALESCE(SUM(price * stock), 0) as total FROM products WHERE status = "active"',
        byCategory: `
          SELECT c.name as category, COUNT(p.id) as count, COALESCE(SUM(p.stock), 0) as total_stock
          FROM product_categories c
          LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
          GROUP BY c.id, c.name
        `,
        recentProducts: `
          SELECT id, name, price, stock, status, created_at 
          FROM products 
          ORDER BY created_at DESC 
          LIMIT 10
        `,
        topSellers: `
          SELECT p.id, p.name, p.price, p.sold_count
          FROM products p
          WHERE p.status = 'active'
          ORDER BY p.sold_count DESC
          LIMIT 10
        `,
        topRated: `
          SELECT p.id, p.name, p.rating, p.num_reviews
          FROM products p
          WHERE p.status = 'active' AND p.num_reviews > 0
          ORDER BY p.rating DESC
          LIMIT 10
        `
      };

      const results = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const [rows] = await pool.query(query);
        results[key] = rows;
      }

      return results;
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }

  // Get low stock products
  static async getLowStock() {
    try {
      const [products] = await pool.query(`
        SELECT 
          p.*,
          c.name as category_name
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.stock <= p.low_stock_alert AND p.stock > 0
        ORDER BY p.stock ASC
      `);
      return products;
    } catch (error) {
      console.error('Error in getLowStock:', error);
      throw error;
    }
  }

  // Get out of stock products
  static async getOutOfStock() {
    try {
      const [products] = await pool.query(`
        SELECT 
          p.*,
          c.name as category_name
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE p.stock = 0
        ORDER BY p.name ASC
      `);
      return products;
    } catch (error) {
      console.error('Error in getOutOfStock:', error);
      throw error;
    }
  }

  // Get inventory summary
  static async getInventorySummary() {
    try {
      const [result] = await pool.query(`
        SELECT
          COUNT(*) as total_products,
          SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock,
          SUM(CASE WHEN stock > 0 AND stock <= low_stock_alert THEN 1 ELSE 0 END) as low_stock,
          SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
          COALESCE(SUM(price * stock), 0) as total_stock_value
        FROM products
        WHERE status = 'active'
      `);
      
      return result[0];
    } catch (error) {
      console.error('Error in getInventorySummary:', error);
      throw error;
    }
  }

  // Add product review
  static async addReview(productId, reviewData) {
    try {
      const {
        customer_name, customer_email, rating, title, comment,
        is_verified_purchase = false
      } = reviewData;

      const [result] = await pool.query(
        `INSERT INTO product_reviews 
         (product_id, customer_name, customer_email, rating, title, comment, is_verified_purchase)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [productId, customer_name, customer_email, rating, title, comment, is_verified_purchase]
      );

      // Update product rating
      const [avgResult] = await pool.query(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
         FROM product_reviews
         WHERE product_id = ? AND is_approved = true`,
        [productId]
      );

      await pool.query(
        'UPDATE products SET rating = ?, num_reviews = ? WHERE id = ?',
        [avgResult[0].avg_rating || 0, avgResult[0].review_count, productId]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error in addReview:', error);
      throw error;
    }
  }

  // Get all categories
  static async getCategories() {
    try {
      const [categories] = await pool.query(`
        SELECT c.*, COUNT(p.id) as product_count
        FROM product_categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
        GROUP BY c.id
        ORDER BY c.sort_order, c.name
      `);
      return categories;
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  // Get inventory logs
  static async getInventoryLogs(productId = null, limit = 100) {
    try {
      let query = `
        SELECT l.*, p.name as product_name, a.name as created_by_name
        FROM inventory_log l
        LEFT JOIN products p ON l.product_id = p.id
        LEFT JOIN admins a ON l.created_by = a.id
      `;
      const params = [];
      
      if (productId) {
        query += ' WHERE l.product_id = ?';
        params.push(productId);
      }
      
      query += ' ORDER BY l.created_at DESC LIMIT ?';
      params.push(limit);
      
      const [logs] = await pool.query(query, params);
      return logs;
    } catch (error) {
      console.error('Error in getInventoryLogs:', error);
      throw error;
    }
  }
}

export default Product;