<<<<<<< HEAD
import Admin from '../models/Admin.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import pool from '../config/database.js';

// Email validation function
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation function
const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return {
    valid: true,
    message: 'Password is strong'
  };
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const admin = await Admin.authenticate(email, password);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = Admin.generateToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        last_login: admin.last_login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
};

// Register new admin (protected - super_admin only)
export const register = async (req, res) => {
  try {
    console.log('Registration request received from super_admin:', req.admin.email);
    console.log('Registration data:', { ...req.body, password: '[REDACTED]' });
    
    const { name, email, password, role: requestedRole, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email and password are required' 
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false,
        message: passwordValidation.message 
      });
    }

    // Check if email exists
    const exists = await Admin.emailExists(email);
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Determine role - enforce super_admin only by existing super_admin
    let role = requestedRole || 'staff';
    
    // If trying to create a super_admin, verify the creator is also super_admin
    if (role === 'super_admin' && req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only super admins can create other super admins' 
      });
    }

    // Create admin with determined role
    const adminId = await Admin.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role,
      permissions: permissions || []
    });

    console.log(`✅ New admin registered by ${req.admin.email}: ${email} with role: ${role}, ID: ${adminId}`);

    res.status(201).json({
      success: true,
      message: `Admin created successfully with role: ${role}`,
      adminId: adminId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
};

// Get current admin
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }
    
    res.json({
      success: true,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      last_login: admin.last_login
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get admin info' 
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get stats from Order model
    const stats = await Order.getDashboardStats();
    
    // Get recent orders
    const recentOrders = await Order.getRecentOrders(10);
    
    // Calculate growth percentages (comparing with previous period)
    // This is a simplified version - you could enhance with actual historical data
    const revenueGrowth = stats.today_revenue > 0 ? 12.5 : 0; // Placeholder - implement real calculation if needed
    const ordersGrowth = stats.today_orders > 0 ? 8.2 : 0; // Placeholder
    const customersGrowth = stats.total_customers > 0 ? 15.3 : 0; // Placeholder
    
    // Calculate average order value
    const averageOrderValue = stats.total_orders > 0 
      ? stats.total_revenue / stats.total_orders 
      : 0;
    
    // Calculate conversion rate (simplified - you'd need visitor data for real calculation)
    const conversionRate = 3.2; // Placeholder

    res.json({
      success: true,
      stats: {
        totalRevenue: stats.total_revenue,
        totalOrders: stats.total_orders,
        totalCustomers: stats.total_customers,
        totalProducts: stats.total_products,
        todayOrders: stats.today_orders,
        pendingOrders: stats.pending_orders,
        processingOrders: stats.processing_orders,
        shippedOrders: stats.shipped_orders,
        deliveredOrders: stats.delivered_orders,
        cancelledOrders: stats.cancelled_orders,
        lowStock: stats.low_stock_products,
        outOfStock: stats.out_of_stock,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        averageOrderValue,
        conversionRate
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.customer_name,
        customerEmail: order.customer_email,
        amount: order.total,
        status: order.status,
        paymentStatus: order.payment_status,
        items: 0, // You could join with order_items if needed
        date: new Date(order.created_at).toLocaleDateString('en-MW')
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get dashboard stats' 
    });
  }
};

// Get all admins (super admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get admins' 
    });
  }
};

// Create admin (super admin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role: requestedRole, permissions } = req.body;

    // Check if email exists
    const exists = await Admin.emailExists(email);
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Determine role - enforce super_admin only by existing super_admin
    let role = requestedRole || 'staff';
    
    // If trying to create a super_admin, verify the creator is also super_admin
    if (role === 'super_admin' && req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only super admins can create other super admins' 
      });
    }

    const adminId = await Admin.create({
      name,
      email,
      password,
      role,
      permissions
    });

    res.status(201).json({
      success: true,
      id: adminId,
      message: `Admin created successfully with role: ${role}`
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create admin' 
    });
  }
};

// Update admin (super admin only)
export const updateAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    
    // If trying to update to super_admin, verify the updater is also super_admin
    if (role === 'super_admin' && req.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only super admins can assign the super_admin role' 
      });
    }

    await Admin.update(req.params.id, req.body);
    res.json({ 
      success: true,
      message: 'Admin updated successfully' 
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update admin' 
    });
  }
};

// Get all customers (from orders)
export const getCustomers = async (req, res) => {
  try {
    const customers = await Order.getAllCustomers();
    
    res.json({
      success: true,
      customers: customers.map(customer => ({
        id: customer.email, // Use email as unique identifier
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders: parseInt(customer.total_orders),
        totalSpent: parseFloat(customer.total_spent),
        firstOrder: customer.first_order_date,
        lastOrder: customer.last_order_date
      }))
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get customers' 
    });
  }
};

// Get customer details by email
export const getCustomerDetails = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Get all orders for this customer
    const orders = await Order.getCustomerOrders(email);

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Customer not found or has no orders' 
      });
    }

    // Calculate customer summary
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const firstOrder = orders[orders.length - 1]; // Oldest first (since we order DESC)
    const lastOrder = orders[0]; // Most recent

    // Get customer info from the most recent order
    const customerInfo = {
      name: lastOrder.customer_name,
      email: lastOrder.customer_email,
      phone: lastOrder.customer_phone
    };

    res.json({
      success: true,
      customer: customerInfo,
      summary: {
        totalOrders,
        totalSpent,
        firstOrderDate: firstOrder.created_at,
        lastOrderDate: lastOrder.created_at,
        averageOrderValue: totalSpent / totalOrders
      },
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at,
        total: order.total,
        status: order.status,
        paymentStatus: order.payment_status,
        itemCount: 0 // You could join with order_items if needed
      }))
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get customer details' 
    });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date();
    let interval = 'DAY';
    let dateFormat = '%Y-%m-%d';
    
    switch(period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        interval = 'DAY';
        dateFormat = '%Y-%m-%d';
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        interval = 'DAY';
        dateFormat = '%Y-%m-%d';
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        interval = 'WEEK';
        dateFormat = '%Y-%u'; // Week number
        break;
      case '12months':
        startDate.setMonth(startDate.getMonth() - 12);
        interval = 'MONTH';
        dateFormat = '%Y-%m';
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Revenue by day/week/month
    const [revenueByDay] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, ?) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE DATE(created_at) >= ? AND status != 'cancelled'
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY date ASC
    `, [dateFormat, startDateStr, dateFormat]);
    
    // Revenue by payment method
    const [revenueByPaymentMethod] = await pool.query(`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE DATE(created_at) >= ? AND status != 'cancelled'
      GROUP BY payment_method
      ORDER BY total DESC
    `, [startDateStr]);
    
    // Revenue by delivery area
    const [revenueByDeliveryArea] = await pool.query(`
      SELECT 
        delivery_area as area,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM orders
      WHERE DATE(created_at) >= ? AND status != 'cancelled'
      GROUP BY delivery_area
      ORDER BY total DESC
      LIMIT 10
    `, [startDateStr]);
    
    // Top products
    const [topProducts] = await pool.query(`
      SELECT 
        oi.product_name as name,
        SUM(oi.quantity) as quantity_sold,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) >= ? AND o.status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY quantity_sold DESC
      LIMIT 5
    `, [startDateStr]);
    
    // Orders by status
    const [ordersByStatus] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      WHERE DATE(created_at) >= ?
      GROUP BY status
      ORDER BY count DESC
    `, [startDateStr]);
    
    // Summary stats
    const [summary] = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as total_revenue,
        COUNT(*) as total_orders,
        COALESCE(AVG(CASE WHEN status != 'cancelled' THEN total ELSE NULL END), 0) as average_order_value,
        COUNT(DISTINCT customer_email) as total_customers,
        (
          SELECT COUNT(DISTINCT customer_email)
          FROM orders
          WHERE DATE(created_at) >= ? 
            AND customer_email IN (
              SELECT customer_email 
              FROM orders 
              GROUP BY customer_email 
              HAVING MIN(DATE(created_at)) >= ?
            )
        ) as new_customers
      FROM orders
      WHERE DATE(created_at) >= ?
    `, [startDateStr, startDateStr, startDateStr]);
    
    res.json({
      success: true,
      data: {
        revenueByDay,
        revenueByPaymentMethod,
        revenueByDeliveryArea,
        topProducts,
        ordersByStatus,
        summary: {
          totalRevenue: summary[0].total_revenue,
          totalOrders: summary[0].total_orders,
          averageOrderValue: summary[0].average_order_value,
          totalCustomers: summary[0].total_customers,
          newCustomers: summary[0].new_customers
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get analytics data' 
    });
  }
=======
import Admin from '../models/Admin.js';
import Order from '../models/Order.js';

// Email validation function
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation function
const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return {
    valid: true,
    message: 'Password is strong'
  };
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const admin = await Admin.authenticate(email, password);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = Admin.generateToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        last_login: admin.last_login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed' 
    });
  }
};

// Register new admin
export const register = async (req, res) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '[REDACTED]' });
    
    const { name, email, password, role, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email and password are required' 
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false,
        message: passwordValidation.message 
      });
    }

    // Check if email exists
    const exists = await Admin.emailExists(email);
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Create admin (default role to 'staff' for security)
    const adminId = await Admin.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'staff',
      permissions: permissions || []
    });

    console.log(`✅ New admin registered: ${email} with ID: ${adminId}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      adminId: adminId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
};

// Get current admin
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }
    
    res.json({
      success: true,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      last_login: admin.last_login
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get admin info' 
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Order.getDashboardStats();
    const recentOrders = await Order.getRecentOrders(10);
    
    res.json({
      success: true,
      stats,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get dashboard stats' 
    });
  }
};

// Get all admins (super admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get admins' 
    });
  }
};

// Create admin (super admin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if email exists
    const exists = await Admin.emailExists(email);
    if (exists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    const adminId = await Admin.create({
      name,
      email,
      password,
      role,
      permissions
    });

    res.status(201).json({
      success: true,
      id: adminId,
      message: 'Admin created successfully'
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create admin' 
    });
  }
};

// Update admin (super admin only)
export const updateAdmin = async (req, res) => {
  try {
    await Admin.update(req.params.id, req.body);
    res.json({ 
      success: true,
      message: 'Admin updated successfully' 
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update admin' 
    });
  }
>>>>>>> 3143af0e69b764942ae4e67b67f5fb252f67c462
};