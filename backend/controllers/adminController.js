import Order from '../models/Order.js';
import Product from '../models/Product.js';
import pool from '../config/database.js';
import { sendOrderConfirmation } from '../utils/emailService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads/products');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// ============= AUTH CONTROLLERS =============

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [admins] = await pool.query(
      'SELECT id, name, email, password_hash, role, is_active FROM admins WHERE email = ? AND is_active = 1',
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const admin = admins[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get permissions
    const [permissions] = await pool.query(
      'SELECT permission FROM admin_permissions WHERE admin_id = ?',
      [admin.id]
    );

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Update last login
    await pool.query(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: permissions.map(p => p.permission)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'staff', permissions = [] } = req.body;

    // Check if admin exists
    const [existing] = await pool.query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert admin
      const [result] = await connection.query(
        'INSERT INTO admins (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
        [name, email, hashedPassword, role]
      );

      // Insert permissions
      for (const permission of permissions) {
        await connection.query(
          'INSERT INTO admin_permissions (admin_id, permission) VALUES (?, ?)',
          [result.insertId, permission]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        adminId: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const [admins] = await pool.query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const [permissions] = await pool.query(
      'SELECT permission FROM admin_permissions WHERE admin_id = ?',
      [req.admin.id]
    );

    res.json({
      success: true,
      ...admins[0],
      permissions: permissions.map(p => p.permission)
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============= DISCOUNT CONTROLLERS =============

export const getDiscounts = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    let query = 'SELECT * FROM discounts WHERE 1=1';
    const queryParams = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      queryParams.push(type);
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        query += ' AND is_active = 1 AND (end_date IS NULL OR end_date > NOW())';
      } else if (status === 'inactive') {
        query += ' AND is_active = 0';
      } else if (status === 'expired') {
        query += ' AND end_date <= NOW()';
      }
    }

    if (search) {
      query += ' AND code LIKE ?';
      queryParams.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [discounts] = await pool.query(query, queryParams);

    // Add computed fields
    const discountsWithMeta = discounts.map(discount => ({
      ...discount,
      is_expired: discount.end_date && new Date(discount.end_date) <= new Date(),
      usage_percentage: discount.usage_limit > 0
        ? (discount.used_count / discount.usage_limit) * 100
        : 0
    }));

    res.json(discountsWithMeta);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDiscount = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      min_order,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!code || !type || !value || !start_date) {
      return res.status(400).json({
        message: 'Missing required fields: code, type, value, start_date are required'
      });
    }

    // Check if code already exists
    const [existing] = await pool.query(
      'SELECT id FROM discounts WHERE code = ?',
      [code]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO discounts 
       (code, type, value, min_order, max_discount, start_date, end_date, usage_limit, used_count, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())`,
      [
        code,
        type,
        value,
        min_order || null,
        max_discount || null,
        start_date,
        end_date || null,
        usage_limit || null,
        is_active ? 1 : 0
      ]
    );

    const [newDiscount] = await pool.query(
      'SELECT * FROM discounts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newDiscount[0]);
  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      min_order,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active
    } = req.body;

    // Check if discount exists
    const [discount] = await pool.query(
      'SELECT * FROM discounts WHERE id = ?',
      [id]
    );

    if (discount.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    // If code is being changed, check if new code already exists
    if (code && code !== discount[0].code) {
      const [existing] = await pool.query(
        'SELECT id FROM discounts WHERE code = ? AND id != ?',
        [code, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Discount code already exists' });
      }
    }

    await pool.query(
      `UPDATE discounts 
       SET code = ?, type = ?, value = ?, min_order = ?, max_discount = ?, 
           start_date = ?, end_date = ?, usage_limit = ?, is_active = ?
       WHERE id = ?`,
      [
        code || discount[0].code,
        type || discount[0].type,
        value || discount[0].value,
        min_order !== undefined ? min_order : discount[0].min_order,
        max_discount !== undefined ? max_discount : discount[0].max_discount,
        start_date || discount[0].start_date,
        end_date !== undefined ? end_date : discount[0].end_date,
        usage_limit !== undefined ? usage_limit : discount[0].usage_limit,
        is_active !== undefined ? (is_active ? 1 : 0) : discount[0].is_active,
        id
      ]
    );

    const [updatedDiscount] = await pool.query(
      'SELECT * FROM discounts WHERE id = ?',
      [id]
    );

    res.json(updatedDiscount[0]);
  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM discounts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const [discount] = await pool.query(
      'SELECT is_active FROM discounts WHERE id = ?',
      [id]
    );

    if (discount.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }

    const newStatus = discount[0].is_active ? 0 : 1;

    await pool.query(
      'UPDATE discounts SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `Discount ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus === 1
    });
  } catch (error) {
    console.error('Error toggling discount:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= DASHBOARD STATS =============

export const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel for better performance
    const [
      todayStats,
      weekStats,
      totalStats,
      orderStatusStats,
      stockStats,
      subscriptionStats,
      recentOrders,
      topProducts,
      revenueChartData
    ] = await Promise.all([
      // Today's stats
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as revenue
          FROM orders 
          WHERE DATE(created_at) = CURDATE()
        `);
        return rows[0];
      })(),

      // This week's stats (last 7 days)
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as revenue
          FROM orders 
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        return rows[0];
      })(),

      // Total stats
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM orders) as total_orders,
            (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid') as total_revenue,
            (SELECT COUNT(*) FROM customers) as total_customers,
            (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products
        `);
        return rows[0];
      })(),

      // Order status counts
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
            SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
          FROM orders
        `);
        return rows[0];
      })(),

      // Stock stats
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            SUM(CASE WHEN stock > 0 AND stock <= low_stock_alert THEN 1 ELSE 0 END) as low_stock_products,
            SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock_products
          FROM products
          WHERE is_active = 1
        `);
        return rows[0];
      })(),

      // Subscription stats
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_subscriptions,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_subscriptions
          FROM customer_subscriptions
        `);
        return rows[0];
      })(),

      // Recent orders
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            id,
            order_number,
            customer_name,
            total,
            status,
            created_at
          FROM orders 
          ORDER BY created_at DESC 
          LIMIT 10
        `);
        return rows;
      })(),

      // Top products by quantity sold
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            p.id,
            p.name,
            SUM(oi.quantity) as sold_count,
            SUM(oi.price * oi.quantity) as revenue
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.status != 'cancelled'
          GROUP BY p.id, p.name
          ORDER BY sold_count DESC
          LIMIT 5
        `);
        return rows;
      })(),

      // Revenue chart data (last 7 days)
      (async () => {
        const [rows] = await pool.query(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            COALESCE(SUM(total), 0) as revenue
          FROM orders
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `);

        // Fill in missing dates
        const chartData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          const existing = rows.find(r => r.date.toISOString().split('T')[0] === dateStr);
          chartData.push({
            date: dateStr,
            revenue: existing ? parseFloat(existing.revenue) : 0,
            orders: existing ? existing.orders : 0
          });
        }
        return chartData;
      })()
    ]);

    res.json({
      today: {
        orders: todayStats.orders || 0,
        revenue: parseFloat(todayStats.revenue) || 0
      },
      week: {
        orders: weekStats.orders || 0,
        revenue: parseFloat(weekStats.revenue) || 0
      },
      total: {
        orders: totalStats.total_orders || 0,
        revenue: parseFloat(totalStats.total_revenue) || 0,
        customers: totalStats.total_customers || 0,
        products: totalStats.total_products || 0
      },
      orders: {
        pending: orderStatusStats.pending_orders || 0,
        processing: orderStatusStats.processing_orders || 0,
        shipped: orderStatusStats.shipped_orders || 0,
        delivered: orderStatusStats.delivered_orders || 0,
        cancelled: orderStatusStats.cancelled_orders || 0
      },
      stock: {
        low: stockStats.low_stock_products || 0,
        outOfStock: stockStats.out_of_stock_products || 0
      },
      subscriptions: {
        active: subscriptionStats.active_subscriptions || 0,
        pending: subscriptionStats.pending_subscriptions || 0
      },
      recentOrders,
      topProducts,
      revenueChart: revenueChartData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

// Get notification counts for header
export const getNotificationCount = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM products WHERE stock > 0 AND stock <= low_stock_alert AND is_active = 1) as low_stock,
        (SELECT COUNT(*) FROM customer_subscriptions WHERE call_status IN ('pending', 'no_answer', 'call_later')) as pending_calls,
        (
          (SELECT COUNT(*) FROM orders WHERE status = 'pending') +
          (SELECT COUNT(*) FROM products WHERE stock > 0 AND stock <= low_stock_alert AND is_active = 1) +
          (SELECT COUNT(*) FROM customer_subscriptions WHERE call_status IN ('pending', 'no_answer', 'call_later'))
        ) as total
    `);

    res.json({
      pending_orders: rows[0].pending_orders || 0,
      low_stock: rows[0].low_stock || 0,
      pending_calls: rows[0].pending_calls || 0,
      total: rows[0].total || 0
    });
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ message: 'Failed to fetch notification counts' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Get sales overview
    const [sales] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get top products
    const [topProducts] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(oi.quantity) as quantity_sold,
        SUM(oi.price * oi.quantity) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY p.id, p.name, p.sku
      ORDER BY quantity_sold DESC
      LIMIT 10
    `);

    // Get payment methods breakdown
    const [paymentMethods] = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY payment_method
    `);

    // Get order status breakdown
    const [orderStatus] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY status
    `);

    res.json({
      sales,
      topProducts,
      paymentMethods,
      orderStatus,
      period
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

// ============= ADMIN MANAGEMENT =============

export const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(`
      SELECT id, name, email, role, is_active, last_login, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `);

    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'staff', permissions = [] } = req.body;

    // Check if admin exists
    const [existing] = await pool.query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        'INSERT INTO admins (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
        [name, email, hashedPassword, role]
      );

      for (const permission of permissions) {
        await connection.query(
          'INSERT INTO admin_permissions (admin_id, permission) VALUES (?, ?)',
          [result.insertId, permission]
        );
      }

      await connection.commit();

      res.status(201).json({
        message: 'Admin created successfully',
        adminId: result.insertId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, is_active, permissions, password } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query(
          'UPDATE admins SET password_hash = ? WHERE id = ?',
          [hashedPassword, id]
        );
      }

      if (name || role || is_active !== undefined) {
        await connection.query(
          'UPDATE admins SET name = COALESCE(?, name), role = COALESCE(?, role), is_active = COALESCE(?, is_active) WHERE id = ?',
          [name, role, is_active, id]
        );
      }

      if (permissions) {
        await connection.query('DELETE FROM admin_permissions WHERE admin_id = ?', [id]);

        for (const permission of permissions) {
          await connection.query(
            'INSERT INTO admin_permissions (admin_id, permission) VALUES (?, ?)',
            [id, permission]
          );
        }
      }

      await connection.commit();

      res.json({ message: 'Admin updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= CUSTOMER MANAGEMENT =============

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM customers WHERE 1=1';
    const countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [customers] = await pool.query(query, queryParams);
    const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;

    // Get order counts for each customer
    for (let customer of customers) {
      const [orders] = await pool.query(
        'SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as total_spent FROM orders WHERE customer_email = ?',
        [customer.email]
      );
      customer.order_count = orders[0].order_count;
      customer.total_spent = orders[0].total_spent;
    }

    res.json({
      customers,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerDetails = async (req, res) => {
  try {
    const { email } = req.params;

    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = customers[0];

    // Get orders
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
      [email]
    );

    // Get subscriptions
    const [subscriptions] = await pool.query(
      'SELECT * FROM customer_subscriptions WHERE customer_email = ? ORDER BY created_at DESC',
      [email]
    );

    res.json({
      ...customer,
      orders,
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= ORDER CONTROLLERS =============

export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      deliveryAddress,
      deliveryMethod,
      items,
      paymentMethod,
      customerNotes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          message: `Product ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      subtotal += product.price * item.quantity;
    }

    // Calculate delivery fee
    const deliveryFee = deliveryMethod === 'express' ? 5000 :
      subtotal > 15000 ? 0 : 2500;

    const total = subtotal + deliveryFee;

    // Create order
    const orderData = {
      customer,
      deliveryAddress,
      deliveryMethod,
      deliveryFee,
      items,
      paymentMethod,
      customerNotes,
      subtotal,
      total
    };

    const result = await Order.create(orderData);

    // Send confirmation email (don't wait for it)
    sendOrderConfirmation({
      orderNumber: result.orderNumber,
      customer,
      items,
      total,
      guestToken: result.guestToken
    }).catch(err => console.error('Email error:', err));

    res.status(201).json({
      message: 'Order created successfully',
      orderNumber: result.orderNumber,
      guestToken: result.guestToken
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { token } = req.params;

    const order = await Order.findByGuestToken(token);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return limited information for tracking
    res.json({
      orderNumber: order.order_number,
      status: order.status,
      estimatedDelivery: order.estimated_delivery,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total,
      statusHistory: order.statusHistory
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Failed to track order' });
  }
};

export const lookupOrders = async (req, res) => {
  try {
    const { email, orderNumber } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let orders;
    if (orderNumber) {
      // Find specific order
      const order = await Order.findByOrderNumberAndEmail(orderNumber, email);
      orders = order ? [order] : [];
    } else {
      // Find all orders for email
      orders = await Order.findByEmail(email);
    }

    res.json(orders.map(order => ({
      orderNumber: order.order_number,
      date: order.created_at,
      total: order.total,
      status: order.status,
      items: order.items?.length || 0
    })));
  } catch (error) {
    console.error('Lookup orders error:', error);
    res.status(500).json({ message: 'Failed to lookup orders' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { guestToken } = req.body;

    const order = await Order.findByGuestToken(guestToken);

    if (!order || order.order_number !== orderNumber) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled at this stage'
      });
    }

    await Order.updateStatus(order.id, 'cancelled', 'Cancelled by customer');

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filters = { status, paymentStatus, startDate, endDate };
    const pagination = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const orders = await Order.findAll(filters, pagination);
    const total = await Order.count(filters);

    res.json({
      orders,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    await Order.updateStatus(req.params.id, status, note);

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// ============= NEWSLETTER CONTROLLERS =============

// Get all newsletter subscribers
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      startDate,
      endDate
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM newsletter_subscribers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM newsletter_subscribers WHERE 1=1';
    const queryParams = [];
    const countParams = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    if (search) {
      query += ' AND (email LIKE ? OR name LIKE ?)';
      countQuery += ' AND (email LIKE ? OR name LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (startDate && endDate) {
      query += ' AND DATE(subscribed_at) BETWEEN ? AND ?';
      countQuery += ' AND DATE(subscribed_at) BETWEEN ? AND ?';
      queryParams.push(startDate, endDate);
      countParams.push(startDate, endDate);
    }

    // Get total count
    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0].total;

    // Add pagination
    query += ' ORDER BY subscribed_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [subscribers] = await pool.query(query, queryParams);

    res.json({
      subscribers,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add subscriber (manual or from checkout)
export const addNewsletterSubscriber = async (req, res) => {
  try {
    const { email, name, source = 'admin' } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if subscriber already exists
    const [existing] = await pool.query(
      'SELECT id, status FROM newsletter_subscribers WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      if (existing[0].status === 'unsubscribed') {
        // Reactivate unsubscribed user
        await pool.query(
          'UPDATE newsletter_subscribers SET status = ?, unsubscribed_at = NULL, source = ? WHERE id = ?',
          ['active', source, existing[0].id]
        );
        return res.json({ message: 'Subscriber reactivated successfully' });
      }
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    // Add new subscriber
    const [result] = await pool.query(
      `INSERT INTO newsletter_subscribers (email, name, status, source, ip_address, user_agent) 
       VALUES (?, ?, 'active', ?, ?, ?)`,
      [email, name || null, source, req.ip, req.headers['user-agent']]
    );

    res.status(201).json({
      message: 'Subscriber added successfully',
      subscriberId: result.insertId
    });
  } catch (error) {
    console.error('Error adding newsletter subscriber:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update subscriber
export const updateNewsletterSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const [result] = await pool.query(
      `UPDATE newsletter_subscribers 
       SET name = COALESCE(?, name), 
           status = COALESCE(?, status),
           unsubscribed_at = CASE WHEN ? = 'unsubscribed' THEN NOW() ELSE unsubscribed_at END
       WHERE id = ?`,
      [name, status, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber updated successfully' });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete subscriber
export const deleteNewsletterSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM newsletter_subscribers WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Import subscribers (bulk upload)
export const importNewsletterSubscribers = async (req, res) => {
  try {
    const { subscribers } = req.body; // Array of {email, name}

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers to import' });
    }

    const results = {
      added: 0,
      skipped: 0,
      errors: []
    };

    for (const sub of subscribers) {
      try {
        if (!sub.email) {
          results.errors.push({ email: 'missing', reason: 'Email required' });
          continue;
        }

        // Check if exists
        const [existing] = await pool.query(
          'SELECT id FROM newsletter_subscribers WHERE email = ?',
          [sub.email]
        );

        if (existing.length > 0) {
          results.skipped++;
          continue;
        }

        // Add new subscriber
        await pool.query(
          `INSERT INTO newsletter_subscribers (email, name, status, source) 
           VALUES (?, ?, 'active', 'import')`,
          [sub.email, sub.name || null]
        );
        results.added++;
      } catch (err) {
        results.errors.push({ email: sub.email, reason: err.message });
      }
    }

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Error importing subscribers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export subscribers
export const exportNewsletterSubscribers = async (req, res) => {
  try {
    const { format = 'csv', status = 'active' } = req.query;

    const [subscribers] = await pool.query(
      'SELECT email, name, status, subscribed_at FROM newsletter_subscribers WHERE status = ? ORDER BY subscribed_at DESC',
      [status]
    );

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        ['Email', 'Name', 'Status', 'Subscribed Date'].join(','),
        ...subscribers.map(s =>
          [s.email, s.name || '', s.status, s.subscribed_at].join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=newsletter-subscribers.csv');
      return res.send(csv);
    }

    res.json(subscribers);
  } catch (error) {
    console.error('Error exporting subscribers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get newsletter statistics
export const getNewsletterStats = async (req, res) => {
  try {
    // Total subscribers by status
    const [statusCounts] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM newsletter_subscribers
      GROUP BY status
    `);

    // Recent signups (last 30 days)
    const [recentSignups] = await pool.query(`
      SELECT 
        DATE(subscribed_at) as date,
        COUNT(*) as count
      FROM newsletter_subscribers
      WHERE subscribed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(subscribed_at)
      ORDER BY date DESC
    `);

    // Campaign stats
    const [campaignStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_campaigns,
        AVG(opened_count / NULLIF(recipient_count, 0)) * 100 as avg_open_rate,
        AVG(clicked_count / NULLIF(recipient_count, 0)) * 100 as avg_click_rate
      FROM newsletter_campaigns
    `);

    // Top sources
    const [topSources] = await pool.query(`
      SELECT 
        source,
        COUNT(*) as count
      FROM newsletter_subscribers
      GROUP BY source
      ORDER BY count DESC
    `);

    res.json({
      total: statusCounts.reduce((acc, curr) => acc + curr.count, 0),
      byStatus: statusCounts,
      recentSignups,
      campaigns: campaignStats[0] || { total_campaigns: 0, sent_campaigns: 0, avg_open_rate: 0, avg_click_rate: 0 },
      topSources
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= NEWSLETTER CAMPAIGN CONTROLLERS =============

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT nc.*, a.name as created_by_name,
             (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = nc.id) as recipient_count
      FROM newsletter_campaigns nc
      LEFT JOIN admins a ON nc.created_by = a.id
      WHERE 1=1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM newsletter_campaigns WHERE 1=1';
    const queryParams = [];
    const countParams = [];

    if (status && status !== 'all') {
      query += ' AND nc.status = ?';
      countQuery += ' AND status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    if (search) {
      query += ' AND (nc.title LIKE ? OR nc.subject LIKE ?)';
      countQuery += ' AND (title LIKE ? OR subject LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0].total;

    // Add pagination
    query += ' ORDER BY nc.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [campaigns] = await pool.query(query, queryParams);

    res.json({
      campaigns,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create campaign
export const createCampaign = async (req, res) => {
  try {
    const { title, subject, preview_text, content, scheduled_for } = req.body;
    const adminId = req.admin.id;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const status = scheduled_for ? 'scheduled' : 'draft';

    const [result] = await pool.query(
      `INSERT INTO newsletter_campaigns 
       (title, subject, preview_text, content, status, scheduled_for, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, subject, preview_text || null, content, status, scheduled_for || null, adminId]
    );

    const [campaign] = await pool.query(
      'SELECT * FROM newsletter_campaigns WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(campaign[0]);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, preview_text, content, scheduled_for, status } = req.body;

    const [campaign] = await pool.query(
      'SELECT * FROM newsletter_campaigns WHERE id = ?',
      [id]
    );

    if (campaign.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Can't update sent campaigns
    if (campaign[0].status === 'sent') {
      return res.status(400).json({ message: 'Cannot update sent campaign' });
    }

    await pool.query(
      `UPDATE newsletter_campaigns 
       SET title = COALESCE(?, title),
           subject = COALESCE(?, subject),
           preview_text = COALESCE(?, preview_text),
           content = COALESCE(?, content),
           scheduled_for = COALESCE(?, scheduled_for),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [title, subject, preview_text, content, scheduled_for, status, id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM newsletter_campaigns WHERE id = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete campaign
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const [campaign] = await pool.query(
      'SELECT status FROM newsletter_campaigns WHERE id = ?',
      [id]
    );

    if (campaign.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Can't delete sent campaigns
    if (campaign[0].status === 'sent') {
      return res.status(400).json({ message: 'Cannot delete sent campaign' });
    }

    await pool.query('DELETE FROM newsletter_campaigns WHERE id = ?', [id]);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send test email
export const sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { testEmail } = req.body;

    const [campaign] = await pool.query(
      'SELECT * FROM newsletter_campaigns WHERE id = ?',
      [id]
    );

    if (campaign.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Here you would integrate with your email service
    // For now, just simulate success
    console.log(`Sending test email to ${testEmail} for campaign ${campaign[0].title}`);

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send campaign to all subscribers
export const sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const [campaign] = await pool.query(
      'SELECT * FROM newsletter_campaigns WHERE id = ?',
      [id]
    );

    if (campaign.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get all active subscribers
    const [subscribers] = await pool.query(
      'SELECT id, email, name FROM newsletter_subscribers WHERE status = "active"'
    );

    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No active subscribers' });
    }

    // Insert recipients
    for (const sub of subscribers) {
      await pool.query(
        `INSERT INTO newsletter_campaign_recipients (campaign_id, subscriber_id, email) 
         VALUES (?, ?, ?)`,
        [id, sub.id, sub.email]
      );
    }

    // Update campaign status
    await pool.query(
      `UPDATE newsletter_campaigns 
       SET status = 'sending', recipient_count = ? WHERE id = ?`,
      [subscribers.length, id]
    );

    // Here you would trigger your email sending queue
    // For now, just mark as sent after a delay
    setTimeout(async () => {
      await pool.query(
        `UPDATE newsletter_campaigns 
         SET status = 'sent', sent_at = NOW() WHERE id = ?`,
        [id]
      );
    }, 5000);

    res.json({
      message: 'Campaign sending started',
      recipientCount: subscribers.length
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get campaign details with stats
export const getCampaignDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [campaigns] = await pool.query(`
      SELECT nc.*, a.name as created_by_name,
             (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = nc.id) as total_recipients,
             (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = nc.id AND opened_at IS NOT NULL) as opened_count,
             (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = nc.id AND clicked_at IS NOT NULL) as clicked_count,
             (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = nc.id AND bounced_at IS NOT NULL) as bounced_count,
             (SELECT COUNT(*) FROM newsletter_campaign_recipients WHERE campaign_id = nc.id AND unsubscribed_at IS NOT NULL) as unsubscribed_count
      FROM newsletter_campaigns nc
      LEFT JOIN admins a ON nc.created_by = a.id
      WHERE nc.id = ?
    `, [id]);

    if (campaigns.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get recent activity
    const [recentActivity] = await pool.query(`
      SELECT 
        email,
        opened_at,
        clicked_at,
        unsubscribed_at
      FROM newsletter_campaign_recipients
      WHERE campaign_id = ? AND (opened_at IS NOT NULL OR clicked_at IS NOT NULL OR unsubscribed_at IS NOT NULL)
      ORDER BY COALESCE(opened_at, clicked_at, unsubscribed_at) DESC
      LIMIT 20
    `, [id]);

    res.json({
      ...campaigns[0],
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= NEWSLETTER TEMPLATE CONTROLLERS =============

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const [templates] = await pool.query(`
      SELECT nt.*, a.name as created_by_name
      FROM newsletter_templates nt
      LEFT JOIN admins a ON nt.created_by = a.id
      ORDER BY nt.is_default DESC, nt.created_at DESC
    `);

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create template
export const createTemplate = async (req, res) => {
  try {
    const { name, subject, content, is_default } = req.body;
    const adminId = req.admin.id;

    if (!name || !subject || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // If this is default, unset other defaults
    if (is_default) {
      await pool.query('UPDATE newsletter_templates SET is_default = FALSE');
    }

    const [result] = await pool.query(
      `INSERT INTO newsletter_templates (name, subject, content, is_default, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, subject, content, is_default || false, adminId]
    );

    const [template] = await pool.query(
      'SELECT * FROM newsletter_templates WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(template[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, content, is_default } = req.body;

    // If setting as default, unset others
    if (is_default) {
      await pool.query('UPDATE newsletter_templates SET is_default = FALSE');
    }

    const [result] = await pool.query(
      `UPDATE newsletter_templates 
       SET name = COALESCE(?, name),
           subject = COALESCE(?, subject),
           content = COALESCE(?, content),
           is_default = COALESCE(?, is_default)
       WHERE id = ?`,
      [name, subject, content, is_default, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const [template] = await pool.query(
      'SELECT * FROM newsletter_templates WHERE id = ?',
      [id]
    );

    res.json(template[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const [template] = await pool.query(
      'SELECT is_default FROM newsletter_templates WHERE id = ?',
      [id]
    );

    if (template.length === 0) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Can't delete default template
    if (template[0].is_default) {
      return res.status(400).json({ message: 'Cannot delete default template' });
    }

    await pool.query('DELETE FROM newsletter_templates WHERE id = ?', [id]);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= SUPPLIER CONTROLLERS =============

// Get all suppliers
export const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [suppliers] = await pool.query(query, queryParams);

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create supplier
export const createSupplier = async (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      payment_terms,
      tax_id,
      is_active = true
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers 
       (name, contact_person, email, phone, address, city, payment_terms, tax_id, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        contact_person || null,
        email || null,
        phone || null,
        address || null,
        city || null,
        payment_terms || null,
        tax_id || null,
        is_active ? 1 : 0
      ]
    );

    const [newSupplier] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newSupplier[0]);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      city,
      payment_terms,
      tax_id,
      is_active
    } = req.body;

    // Check if supplier exists
    const [supplier] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    if (supplier.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await pool.query(
      `UPDATE suppliers 
       SET name = COALESCE(?, name),
           contact_person = ?,
           email = ?,
           phone = ?,
           address = ?,
           city = ?,
           payment_terms = ?,
           tax_id = ?,
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [
        name || supplier[0].name,
        contact_person !== undefined ? contact_person : supplier[0].contact_person,
        email !== undefined ? email : supplier[0].email,
        phone !== undefined ? phone : supplier[0].phone,
        address !== undefined ? address : supplier[0].address,
        city !== undefined ? city : supplier[0].city,
        payment_terms !== undefined ? payment_terms : supplier[0].payment_terms,
        tax_id !== undefined ? tax_id : supplier[0].tax_id,
        is_active !== undefined ? (is_active ? 1 : 0) : supplier[0].is_active,
        id
      ]
    );

    const [updatedSupplier] = await pool.query(
      'SELECT * FROM suppliers WHERE id = ?',
      [id]
    );

    res.json(updatedSupplier[0]);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM suppliers WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle supplier status
export const toggleSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const [supplier] = await pool.query(
      'SELECT is_active FROM suppliers WHERE id = ?',
      [id]
    );

    if (supplier.length === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const newStatus = supplier[0].is_active ? 0 : 1;

    await pool.query(
      'UPDATE suppliers SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `Supplier ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus === 1
    });
  } catch (error) {
    console.error('Error toggling supplier:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= BRAND CONTROLLERS =============

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM brands WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (name LIKE ? OR slug LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';

    const [brands] = await pool.query(query, queryParams);

    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create brand
export const createBrand = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      logo,
      is_active = true
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Generate slug if not provided
    const brandSlug = slug || generateSlug(name);

    // Check if slug already exists
    const [existing] = await pool.query(
      'SELECT id FROM brands WHERE slug = ?',
      [brandSlug]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Brand with this slug already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO brands (name, slug, description, logo, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        brandSlug,
        description || null,
        logo || null,
        is_active ? 1 : 0
      ]
    );

    const [newBrand] = await pool.query(
      'SELECT * FROM brands WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newBrand[0]);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      logo,
      is_active
    } = req.body;

    // Check if brand exists
    const [brand] = await pool.query(
      'SELECT * FROM brands WHERE id = ?',
      [id]
    );

    if (brand.length === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Generate new slug if name changed and slug not provided
    let brandSlug = slug;
    if (name && name !== brand[0].name && !slug) {
      brandSlug = generateSlug(name);
    }

    // If slug is being changed, check if new slug already exists
    if (brandSlug && brandSlug !== brand[0].slug) {
      const [existing] = await pool.query(
        'SELECT id FROM brands WHERE slug = ? AND id != ?',
        [brandSlug, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Brand with this slug already exists' });
      }
    }

    await pool.query(
      `UPDATE brands 
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = ?,
           logo = ?,
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [
        name || brand[0].name,
        brandSlug || brand[0].slug,
        description !== undefined ? description : brand[0].description,
        logo !== undefined ? logo : brand[0].logo,
        is_active !== undefined ? (is_active ? 1 : 0) : brand[0].is_active,
        id
      ]
    );

    const [updatedBrand] = await pool.query(
      'SELECT * FROM brands WHERE id = ?',
      [id]
    );

    res.json(updatedBrand[0]);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM brands WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= DELIVERY ZONE CONTROLLERS (UPDATED) =============

// Get all delivery zones
export const getDeliveryZones = async (req, res) => {
  try {
    const [zones] = await pool.query(
      'SELECT id, name, price_km, min_delivery_time, max_delivery_time, is_active, coverage, created_at FROM delivery_zones ORDER BY created_at DESC'
    );
    res.json(zones);
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create delivery zone
export const createDeliveryZone = async (req, res) => {
  try {
    const {
      name,
      price_km = 0,
      min_delivery_time,
      max_delivery_time,
      is_active = 1,
      coverage = 'full'
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Zone name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO delivery_zones 
       (name, price_km, min_delivery_time, max_delivery_time, is_active, coverage, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        price_km,
        min_delivery_time || null,
        max_delivery_time || null,
        is_active ? 1 : 0,
        coverage
      ]
    );

    const [newZone] = await pool.query(
      'SELECT id, name, price_km, min_delivery_time, max_delivery_time, is_active, coverage, created_at FROM delivery_zones WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newZone[0]);
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery zone
export const updateDeliveryZone = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price_km,
      min_delivery_time,
      max_delivery_time,
      is_active,
      coverage
    } = req.body;

    // Check if zone exists
    const [zone] = await pool.query(
      'SELECT * FROM delivery_zones WHERE id = ?',
      [id]
    );

    if (zone.length === 0) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }

    await pool.query(
      `UPDATE delivery_zones 
       SET name = COALESCE(?, name),
           price_km = COALESCE(?, price_km),
           min_delivery_time = ?,
           max_delivery_time = ?,
           is_active = COALESCE(?, is_active),
           coverage = COALESCE(?, coverage),
           updated_at = NOW()
       WHERE id = ?`,
      [
        name || zone[0].name,
        price_km !== undefined ? price_km : zone[0].price_km,
        min_delivery_time !== undefined ? min_delivery_time : zone[0].min_delivery_time,
        max_delivery_time !== undefined ? max_delivery_time : zone[0].max_delivery_time,
        is_active !== undefined ? (is_active ? 1 : 0) : zone[0].is_active,
        coverage || zone[0].coverage,
        id
      ]
    );

    const [updatedZone] = await pool.query(
      'SELECT id, name, price_km, min_delivery_time, max_delivery_time, is_active, coverage, created_at FROM delivery_zones WHERE id = ?',
      [id]
    );

    res.json(updatedZone[0]);
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete delivery zone
export const deleteDeliveryZone = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM delivery_zones WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }

    res.json({ message: 'Delivery zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle delivery zone active status
export const toggleDeliveryZone = async (req, res) => {
  try {
    const { id } = req.params;

    const [zone] = await pool.query(
      'SELECT is_active FROM delivery_zones WHERE id = ?',
      [id]
    );

    if (zone.length === 0) {
      return res.status(404).json({ message: 'Delivery zone not found' });
    }

    // Toggle is_active (1 becomes 0, 0 becomes 1)
    await pool.query(
      'UPDATE delivery_zones SET is_active = 1 - is_active, updated_at = NOW() WHERE id = ?',
      [id]
    );

    const [updatedZone] = await pool.query(
      'SELECT is_active FROM delivery_zones WHERE id = ?',
      [id]
    );

    res.json({
      message: `Delivery zone ${updatedZone[0].is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: updatedZone[0].is_active === 1
    });
  } catch (error) {
    console.error('Error toggling delivery zone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= DELIVERY SLOT CONTROLLERS (UPDATED) =============

// Get all delivery slots
export const getDeliverySlots = async (req, res) => {
  try {
    const [slots] = await pool.query(
      'SELECT * FROM delivery_slots ORDER BY created_at DESC'
    );
    res.json(slots);
  } catch (error) {
    console.error('Error fetching delivery slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create delivery slot
export const createDeliverySlot = async (req, res) => {
  try {
    const {
      service_id = 1,
      time_description,
      available = 1,
      price = 0,
      estimated_time,
      icon,
      max_orders,
      status = 'active'
    } = req.body;

    if (!time_description) {
      return res.status(400).json({ message: 'Time description is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO delivery_slots 
       (service_id, time_description, available, price, estimated_time, icon, max_orders, current_orders, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NOW(), NOW())`,
      [
        service_id,
        time_description,
        available ? 1 : 0,
        price,
        estimated_time || null,
        icon || null,
        max_orders || null,
        status
      ]
    );

    const [newSlot] = await pool.query(
      'SELECT * FROM delivery_slots WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newSlot[0]);
  } catch (error) {
    console.error('Error creating delivery slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery slot
export const updateDeliverySlot = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      service_id,
      time_description,
      available,
      price,
      estimated_time,
      icon,
      max_orders,
      current_orders,
      status
    } = req.body;

    // Check if slot exists
    const [slot] = await pool.query(
      'SELECT * FROM delivery_slots WHERE id = ?',
      [id]
    );

    if (slot.length === 0) {
      return res.status(404).json({ message: 'Delivery slot not found' });
    }

    await pool.query(
      `UPDATE delivery_slots 
       SET service_id = COALESCE(?, service_id),
           time_description = COALESCE(?, time_description),
           available = COALESCE(?, available),
           price = COALESCE(?, price),
           estimated_time = ?,
           icon = ?,
           max_orders = ?,
           current_orders = COALESCE(?, current_orders),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [
        service_id || slot[0].service_id,
        time_description || slot[0].time_description,
        available !== undefined ? (available ? 1 : 0) : slot[0].available,
        price !== undefined ? price : slot[0].price,
        estimated_time !== undefined ? estimated_time : slot[0].estimated_time,
        icon !== undefined ? icon : slot[0].icon,
        max_orders !== undefined ? max_orders : slot[0].max_orders,
        current_orders !== undefined ? current_orders : slot[0].current_orders,
        status || slot[0].status,
        id
      ]
    );

    const [updatedSlot] = await pool.query(
      'SELECT * FROM delivery_slots WHERE id = ?',
      [id]
    );

    res.json(updatedSlot[0]);
  } catch (error) {
    console.error('Error updating delivery slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete delivery slot
export const deleteDeliverySlot = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM delivery_slots WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery slot not found' });
    }

    res.json({ message: 'Delivery slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle delivery slot status
export const toggleDeliverySlot = async (req, res) => {
  try {
    const { id } = req.params;

    const [slot] = await pool.query(
      'SELECT status FROM delivery_slots WHERE id = ?',
      [id]
    );

    if (slot.length === 0) {
      return res.status(404).json({ message: 'Delivery slot not found' });
    }

    const newStatus = slot[0].status === 'active' ? 'inactive' : 'active';

    await pool.query(
      'UPDATE delivery_slots SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `Delivery slot ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling delivery slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= PAGE CONTROLLERS =============

// Get all pages
export const getPages = async (req, res) => {
  try {
    const { search } = req.query;

    let query = 'SELECT * FROM pages WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (title LIKE ? OR slug LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [pages] = await pool.query(query, queryParams);

    // Get counts for stats
    const [countResult] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts
      FROM pages
    `);

    res.json({
      pages,
      stats: {
        total: countResult[0].total || 0,
        published: countResult[0].published || 0,
        drafts: countResult[0].drafts || 0
      }
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create page
export const createPage = async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      meta_description,
      status = 'draft'
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Page title is required' });
    }

    // Generate slug if not provided
    const pageSlug = slug || generateSlug(title);

    // Check if slug already exists
    const [existing] = await pool.query(
      'SELECT id FROM pages WHERE slug = ?',
      [pageSlug]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Page with this slug already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO pages (title, slug, content, meta_description, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        pageSlug,
        content || null,
        meta_description || null,
        status
      ]
    );

    const [newPage] = await pool.query(
      'SELECT * FROM pages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newPage[0]);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update page
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      meta_description,
      status
    } = req.body;

    // Check if page exists
    const [page] = await pool.query(
      'SELECT * FROM pages WHERE id = ?',
      [id]
    );

    if (page.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Generate new slug if title changed and slug not provided
    let pageSlug = slug;
    if (title && title !== page[0].title && !slug) {
      pageSlug = generateSlug(title);
    }

    // If slug is being changed, check if new slug already exists
    if (pageSlug && pageSlug !== page[0].slug) {
      const [existing] = await pool.query(
        'SELECT id FROM pages WHERE slug = ? AND id != ?',
        [pageSlug, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Page with this slug already exists' });
      }
    }

    await pool.query(
      `UPDATE pages 
       SET title = COALESCE(?, title),
           slug = COALESCE(?, slug),
           content = COALESCE(?, content),
           meta_description = COALESCE(?, meta_description),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [
        title || page[0].title,
        pageSlug || page[0].slug,
        content !== undefined ? content : page[0].content,
        meta_description !== undefined ? meta_description : page[0].meta_description,
        status || page[0].status,
        id
      ]
    );

    const [updatedPage] = await pool.query(
      'SELECT * FROM pages WHERE id = ?',
      [id]
    );

    res.json(updatedPage[0]);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete page
export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM pages WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle page status
export const togglePage = async (req, res) => {
  try {
    const { id } = req.params;

    const [page] = await pool.query(
      'SELECT status FROM pages WHERE id = ?',
      [id]
    );

    if (page.length === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const newStatus = page[0].status === 'published' ? 'draft' : 'published';

    await pool.query(
      'UPDATE pages SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `Page ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= BLOG CONTROLLERS =============

// Get all blog posts
export const getBlogPosts = async (req, res) => {
  try {
    const { search, status, category } = req.query;

    let query = 'SELECT * FROM blog_posts WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (title LIKE ? OR excerpt LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      queryParams.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [posts] = await pool.query(query, queryParams);

    // Get counts for stats
    const [countResult] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        COALESCE(SUM(views), 0) as total_views
      FROM blog_posts
    `);

    // Get unique categories for filter
    const [categories] = await pool.query(`
      SELECT DISTINCT category FROM blog_posts WHERE category IS NOT NULL ORDER BY category
    `);

    res.json({
      posts,
      stats: {
        total: countResult[0].total || 0,
        published: countResult[0].published || 0,
        drafts: countResult[0].drafts || 0,
        total_views: countResult[0].total_views || 0
      },
      categories: categories.map(c => c.category).filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create blog post
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      author,
      category,
      tags,
      status = 'draft'
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Blog post title is required' });
    }

    // Generate slug if not provided
    const postSlug = slug || generateSlug(title);

    // Check if slug already exists
    const [existing] = await pool.query(
      'SELECT id FROM blog_posts WHERE slug = ?',
      [postSlug]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Blog post with this slug already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO blog_posts 
       (title, slug, excerpt, content, featured_image, author, category, tags, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        postSlug,
        excerpt || null,
        content || null,
        featured_image || null,
        author || 'Admin',
        category || null,
        tags || null,
        status
      ]
    );

    const [newPost] = await pool.query(
      'SELECT * FROM blog_posts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update blog post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      author,
      category,
      tags,
      status
    } = req.body;

    // Check if post exists
    const [post] = await pool.query(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Generate new slug if title changed and slug not provided
    let postSlug = slug;
    if (title && title !== post[0].title && !slug) {
      postSlug = generateSlug(title);
    }

    // If slug is being changed, check if new slug already exists
    if (postSlug && postSlug !== post[0].slug) {
      const [existing] = await pool.query(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
        [postSlug, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Blog post with this slug already exists' });
      }
    }

    await pool.query(
      `UPDATE blog_posts 
       SET title = COALESCE(?, title),
           slug = COALESCE(?, slug),
           excerpt = COALESCE(?, excerpt),
           content = COALESCE(?, content),
           featured_image = COALESCE(?, featured_image),
           author = COALESCE(?, author),
           category = COALESCE(?, category),
           tags = COALESCE(?, tags),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [
        title || post[0].title,
        postSlug || post[0].slug,
        excerpt !== undefined ? excerpt : post[0].excerpt,
        content !== undefined ? content : post[0].content,
        featured_image !== undefined ? featured_image : post[0].featured_image,
        author || post[0].author,
        category !== undefined ? category : post[0].category,
        tags !== undefined ? tags : post[0].tags,
        status || post[0].status,
        id
      ]
    );

    const [updatedPost] = await pool.query(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );

    res.json(updatedPost[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM blog_posts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= FAQ CONTROLLERS =============

// Get all FAQs
export const getFAQs = async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = 'SELECT * FROM faqs WHERE 1=1';
    const queryParams = [];

    if (search) {
      query += ' AND (question LIKE ? OR answer LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      queryParams.push(category);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';

    const [faqs] = await pool.query(query, queryParams);

    // Get unique categories for filter
    const [categories] = await pool.query(`
      SELECT DISTINCT category FROM faqs WHERE category IS NOT NULL ORDER BY category
    `);

    // Get counts for stats
    const [countResult] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM faqs
    `);

    // Group FAQs by category for accordion view
    const groupedByCategory = {};
    faqs.forEach(faq => {
      const cat = faq.category || 'Uncategorized';
      if (!groupedByCategory[cat]) {
        groupedByCategory[cat] = [];
      }
      groupedByCategory[cat].push(faq);
    });

    res.json({
      faqs,
      grouped: groupedByCategory,
      categories: categories.map(c => c.category).filter(Boolean),
      stats: {
        total: countResult[0].total || 0,
        active: countResult[0].active || 0,
        inactive: (countResult[0].total || 0) - (countResult[0].active || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create FAQ
export const createFAQ = async (req, res) => {
  try {
    const {
      question,
      answer,
      category,
      sort_order = 0,
      is_active = 1
    } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO faqs (question, answer, category, sort_order, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        question,
        answer,
        category || null,
        sort_order,
        is_active ? 1 : 0
      ]
    );

    const [newFAQ] = await pool.query(
      'SELECT * FROM faqs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newFAQ[0]);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      answer,
      category,
      sort_order,
      is_active
    } = req.body;

    // Check if FAQ exists
    const [faq] = await pool.query(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );

    if (faq.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await pool.query(
      `UPDATE faqs 
       SET question = COALESCE(?, question),
           answer = COALESCE(?, answer),
           category = ?,
           sort_order = COALESCE(?, sort_order),
           is_active = COALESCE(?, is_active),
           updated_at = NOW()
       WHERE id = ?`,
      [
        question || faq[0].question,
        answer || faq[0].answer,
        category !== undefined ? category : faq[0].category,
        sort_order !== undefined ? sort_order : faq[0].sort_order,
        is_active !== undefined ? (is_active ? 1 : 0) : faq[0].is_active,
        id
      ]
    );

    const [updatedFAQ] = await pool.query(
      'SELECT * FROM faqs WHERE id = ?',
      [id]
    );

    res.json(updatedFAQ[0]);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM faqs WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle FAQ active status
export const toggleFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const [faq] = await pool.query(
      'SELECT is_active FROM faqs WHERE id = ?',
      [id]
    );

    if (faq.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    const newStatus = faq[0].is_active ? 0 : 1;

    await pool.query(
      'UPDATE faqs SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `FAQ ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus === 1
    });
  } catch (error) {
    console.error('Error toggling FAQ:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reorder FAQs
export const reorderFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body; // 'up' or 'down'

    // Get current FAQ
    const [faq] = await pool.query(
      'SELECT id, sort_order, category FROM faqs WHERE id = ?',
      [id]
    );

    if (faq.length === 0) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Get neighbor FAQ in same category
    let neighborQuery;
    if (direction === 'up') {
      neighborQuery = 'SELECT id, sort_order FROM faqs WHERE category <=> ? AND sort_order < ? ORDER BY sort_order DESC LIMIT 1';
    } else {
      neighborQuery = 'SELECT id, sort_order FROM faqs WHERE category <=> ? AND sort_order > ? ORDER BY sort_order ASC LIMIT 1';
    }

    const [neighbor] = await pool.query(neighborQuery, [faq[0].category, faq[0].sort_order]);

    if (neighbor.length === 0) {
      return res.status(400).json({ message: `Cannot move ${direction}` });
    }

    // Swap sort orders
    await pool.query(
      'UPDATE faqs SET sort_order = ? WHERE id = ?',
      [neighbor[0].sort_order, id]
    );

    await pool.query(
      'UPDATE faqs SET sort_order = ? WHERE id = ?',
      [faq[0].sort_order, neighbor[0].id]
    );

    res.json({ message: 'FAQ reordered successfully' });
  } catch (error) {
    console.error('Error reordering FAQ:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= SETTINGS CONTROLLERS =============

// Ensure store_settings table exists
const ensureSettingsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      \`key\` VARCHAR(100) UNIQUE NOT NULL,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_key (\`key\`)
    )
  `);
};

// Get general settings
export const getSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const [settings] = await pool.query('SELECT * FROM store_settings WHERE `key` LIKE "store_%"');

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Default values
    const defaultSettings = {
      store_name: 'Mwambo Store',
      store_email: 'info@mwambostore.com',
      store_phone: '+265 999 123 456',
      store_address: '',
      store_city: 'Lilongwe',
      store_country: 'Malawi',
      store_currency: 'MWK',
      store_timezone: 'Africa/Blantyre'
    };

    res.json({
      ...defaultSettings,
      ...settingsObj
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update general settings
export const updateSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const settings = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const [key, value] of Object.entries(settings)) {
        if (key.startsWith('store_')) {
          await connection.query(
            `INSERT INTO store_settings (\`key\`, value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE value = ?`,
            [key, value, value]
          );
        }
      }

      await connection.commit();
      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment settings
export const getPaymentSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const [settings] = await pool.query('SELECT * FROM store_settings WHERE `key` LIKE "payment_%"');

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Default payment settings
    const defaultSettings = {
      payment_cod_enabled: 'true',
      payment_airtel_enabled: 'true',
      payment_airtel_number: '0999123456',
      payment_tnm_enabled: 'true',
      payment_tnm_number: '0888123456',
      payment_bank_enabled: 'false',
      payment_bank_details: 'Bank: NBS Bank\nAccount: 1234567890\nBranch: City Centre'
    };

    res.json({
      ...defaultSettings,
      ...settingsObj
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment settings
export const updatePaymentSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const settings = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const [key, value] of Object.entries(settings)) {
        if (key.startsWith('payment_')) {
          await connection.query(
            `INSERT INTO store_settings (\`key\`, value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE value = ?`,
            [key, value, value]
          );
        }
      }

      await connection.commit();
      res.json({ message: 'Payment settings updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get shipping settings
export const getShippingSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const [settings] = await pool.query('SELECT * FROM store_settings WHERE `key` LIKE "shipping_%"');

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Default shipping settings
    const defaultSettings = {
      shipping_default_fee: '2500',
      shipping_free_threshold: '15000',
      shipping_estimated_time: '1-3 business days',
      shipping_cutoff_time: '15:00',
      shipping_free_enabled: 'true',
      shipping_same_day_enabled: 'false'
    };

    res.json({
      ...defaultSettings,
      ...settingsObj
    });
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update shipping settings
export const updateShippingSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const settings = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const [key, value] of Object.entries(settings)) {
        if (key.startsWith('shipping_')) {
          await connection.query(
            `INSERT INTO store_settings (\`key\`, value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE value = ?`,
            [key, value, value]
          );
        }
      }

      await connection.commit();
      res.json({ message: 'Shipping settings updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tax settings
export const getTaxSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const [settings] = await pool.query('SELECT * FROM store_settings WHERE `key` LIKE "tax_%"');

    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Default tax settings (Malawi VAT is 16.5%)
    const defaultSettings = {
      tax_enabled: 'true',
      tax_rate: '16.5',
      tax_name: 'VAT',
      tax_tpin: '',
      tax_show_on_invoice: 'true',
      tax_prices_include: 'false'
    };

    res.json({
      ...defaultSettings,
      ...settingsObj
    });
  } catch (error) {
    console.error('Error fetching tax settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update tax settings
export const updateTaxSettings = async (req, res) => {
  try {
    await ensureSettingsTable();

    const settings = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const [key, value] of Object.entries(settings)) {
        if (key.startsWith('tax_')) {
          await connection.query(
            `INSERT INTO store_settings (\`key\`, value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE value = ?`,
            [key, value, value]
          );
        }
      }

      await connection.commit();
      res.json({ message: 'Tax settings updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating tax settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= USER MANAGEMENT CONTROLLERS =============

// Get all admin users (excluding password_hash)
export const getAdminUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, role, is_active, last_login, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new admin user
export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role = 'staff' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO admins (name, email, password_hash, role, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [name, email, hashedPassword, role]
    );

    // Return created user (without password)
    const [newUser] = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM admins WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin user (name and role only)
export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    // Check if user exists
    const [user] = await pool.query(
      'SELECT id FROM admins WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    await pool.query(
      `UPDATE admins 
       SET name = COALESCE(?, name), 
           role = COALESCE(?, role), 
           updated_at = NOW() 
       WHERE id = ?`,
      [name, role, id]
    );

    // Return updated user
    const [updatedUser] = await pool.query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM admins WHERE id = ?',
      [id]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle admin user active status
export const toggleAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is trying to toggle themselves
    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    // Get current status
    const [user] = await pool.query(
      'SELECT is_active FROM admins WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle status
    const newStatus = user[0].is_active ? 0 : 1;

    await pool.query(
      'UPDATE admins SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus === 1
    });
  } catch (error) {
    console.error('Error toggling admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete admin user
export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is trying to delete themselves
    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const [result] = await pool.query(
      'DELETE FROM admins WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= PERMISSIONS CONTROLLERS =============

// Define available permissions
const AVAILABLE_PERMISSIONS = [
  'view_orders',
  'manage_orders',
  'manage_products',
  'manage_inventory',
  'view_analytics',
  'manage_settings',
  'manage_subscriptions',
  'manage_marketing',
  'manage_content',
  'manage_users'
];

// Define role hierarchy
const ROLE_HIERARCHY = {
  'super_admin': AVAILABLE_PERMISSIONS,
  'admin': [
    'view_orders',
    'manage_orders',
    'manage_products',
    'manage_inventory',
    'view_analytics',
    'manage_settings',
    'manage_subscriptions',
    'manage_marketing',
    'manage_content'
  ],
  'manager': [
    'view_orders',
    'manage_orders',
    'manage_products',
    'manage_inventory',
    'view_analytics',
    'manage_content'
  ],
  'staff': [
    'view_orders',
    'manage_orders'
  ]
};

// Get permissions matrix
export const getPermissions = async (req, res) => {
  try {
    // Get all permissions from database
    const [permissions] = await pool.query(`
      SELECT ap.*, a.role 
      FROM admin_permissions ap
      JOIN admins a ON ap.admin_id = a.id
    `);

    // Build permissions matrix
    const matrix = {
      staff: {},
      manager: {},
      admin: {},
      super_admin: {}
    };

    // Initialize with false
    AVAILABLE_PERMISSIONS.forEach(perm => {
      matrix.staff[perm] = false;
      matrix.manager[perm] = false;
      matrix.admin[perm] = false;
      matrix.super_admin[perm] = true; // Super admin always has all
    });

    // Fill in permissions from database
    permissions.forEach(p => {
      if (matrix[p.role] && p.permission) {
        matrix[p.role][p.permission] = true;
      }
    });

    res.json({
      permissions: AVAILABLE_PERMISSIONS,
      matrix,
      roleHierarchy: ROLE_HIERARCHY
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update permissions
export const updatePermissions = async (req, res) => {
  try {
    const { matrix } = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get all admin users by role
      const [admins] = await connection.query('SELECT id, role FROM admins WHERE role != "super_admin"');

      // Delete existing permissions for non-super_admin users
      await connection.query('DELETE FROM admin_permissions WHERE admin_id IN (SELECT id FROM admins WHERE role != "super_admin")');

      // Insert new permissions based on matrix
      for (const admin of admins) {
        const role = admin.role;
        if (matrix[role]) {
          for (const [permission, enabled] of Object.entries(matrix[role])) {
            if (enabled) {
              await connection.query(
                'INSERT INTO admin_permissions (admin_id, permission) VALUES (?, ?)',
                [admin.id, permission]
              );
            }
          }
        }
      }

      await connection.commit();
      res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= MEDIA MANAGEMENT CONTROLLERS =============

// Get all media files
export const getMediaFiles = async (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);

    const mediaFiles = files
      .filter(file => {
        // Filter for image files
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .map(filename => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);

        // Get the base URL without /api
        const baseUrl = process.env.API_URL?.replace('/api', '') || 'http://localhost:5001';

        return {
          filename,
          url: `${baseUrl}/uploads/products/${filename}`,
          size: stats.size,
          uploadedAt: stats.mtime,
          type: path.extname(filename).substring(1)
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)); // Sort by most recent

    res.json(mediaFiles);
  } catch (error) {
    console.error('Error reading media files:', error);
    res.status(500).json({ message: 'Failed to read media files' });
  }
};

// Delete media file
export const deleteMediaFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

// Upload media file (using existing multer middleware)
export const uploadMediaFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const baseUrl = process.env.API_URL?.replace('/api', '') || 'http://localhost:5001';

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        url: `${baseUrl}/uploads/products/${req.file.filename}`,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
};