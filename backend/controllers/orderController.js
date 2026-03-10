import Order from '../models/Order.js';
import Product from '../models/Product.js';
import pool from '../config/database.js';
import { sendOrderConfirmation } from '../utils/emailService.js';

// Generate order number: MWS-YYYY-XXXXX
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `MWS-${year}-${random}`;
};

// Create new order (guest checkout)
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer,
      deliveryAddress,
      city,
      deliveryZoneId,
      deliverySlotId,
      deliveryInstructions,
      paymentMethod,
      paymentReference,
      couponCode,
      items
    } = req.body;

    // Validate required fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return res.status(400).json({ message: 'Customer information is required' });
    }
    if (!deliveryAddress || !city || !deliveryZoneId || !deliverySlotId) {
      return res.status(400).json({ message: 'Delivery details are required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        await connection.rollback();
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      
      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        image: product.images?.[0] || null
      });
    }

    // Get delivery zone price
    const [zoneRows] = await connection.query(
      'SELECT price FROM delivery_zones WHERE id = ? AND status = "active"',
      [deliveryZoneId]
    );
    const deliveryFee = zoneRows[0]?.price || 2500;

    // Apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const [couponRows] = await connection.query(
        `SELECT * FROM discounts 
         WHERE code = ? AND is_active = 1 
         AND (end_date IS NULL OR end_date > NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [couponCode]
      );
      
      if (couponRows[0]) {
        const coupon = couponRows[0];
        if (coupon.min_order && subtotal < coupon.min_order) {
          return res.status(400).json({ 
            message: `Minimum order of MK ${coupon.min_order.toLocaleString()} required for this coupon` 
          });
        }
        
        discountAmount = coupon.discount_type === 'percentage' 
          ? (subtotal * coupon.discount_value / 100)
          : coupon.discount_value;
        
        // Update coupon usage
        await connection.query(
          'UPDATE discounts SET used_count = used_count + 1 WHERE id = ?',
          [coupon.id]
        );
      }
    }

    const total = subtotal + deliveryFee - discountAmount;
    const orderNumber = generateOrderNumber();

    // Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        delivery_address, city, delivery_zone_id, delivery_slot_id,
        delivery_instructions, payment_method, payment_reference,
        subtotal, delivery_fee, discount_amount, coupon_code, total,
        status, payment_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', NOW(), NOW())`,
      [
        orderNumber, customer.name, customer.email, customer.phone,
        deliveryAddress, city, deliveryZoneId, deliverySlotId,
        deliveryInstructions || null, paymentMethod, paymentReference || null,
        subtotal, deliveryFee, discountAmount, couponCode || null, total
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, quantity, price, unit, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, item.productId, item.name, item.quantity,
          item.price, item.unit, item.image
        ]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Insert status history
    await connection.query(
      `INSERT INTO order_status_history (order_id, status, note, created_at)
       VALUES (?, 'pending', 'Order placed', NOW())`,
      [orderId]
    );

    await connection.commit();

    // Send confirmation email (don't wait for it)
    sendOrderConfirmation({
      orderNumber,
      customer,
      items: orderItems,
      total,
      estimatedDelivery: 'Today before 6PM'
    }).catch(err => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      orderNumber,
      orderId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  } finally {
    connection.release();
  }
};

// Track order by order number
export const trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.query;
    
    if (!orderNumber) {
      return res.status(400).json({ message: 'Order number is required' });
    }

    const [orderRows] = await pool.query(
      `SELECT o.*, 
        dz.name as delivery_zone_name,
        ds.day as delivery_slot_day, ds.time as delivery_slot_time
       FROM orders o
       LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
       LEFT JOIN delivery_slots ds ON o.delivery_slot_id = ds.id
       WHERE o.order_number = ?`,
      [orderNumber]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderRows[0];

    // Get order items
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    // Get status history
    const [statusHistory] = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
      [order.id]
    );

    // Calculate estimated delivery (same day if ordered before 2PM)
    const orderTime = new Date(order.created_at);
    const hours = orderTime.getHours();
    const estimatedDelivery = hours < 14 
      ? 'Today before 6PM' 
      : 'Tomorrow before 12PM';

    res.json({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      city: order.city,
      deliveryZone: order.delivery_zone_name,
      deliverySlot: `${order.delivery_slot_day} - ${order.delivery_slot_time}`,
      deliveryInstructions: order.delivery_instructions,
      paymentMethod: order.payment_method,
      paymentReference: order.payment_reference,
      items: items.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        image: item.image_url
      })),
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      discountAmount: order.discount_amount,
      total: order.total,
      status: order.status,
      estimatedDelivery,
      statusHistory,
      createdAt: order.created_at
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Failed to track order' });
  }
};

// Validate coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM discounts 
       WHERE code = ? AND is_active = 1 
       AND (end_date IS NULL OR end_date > NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code]
    );

    if (rows.length === 0) {
      return res.json({ 
        valid: false, 
        message: 'Invalid or expired coupon code' 
      });
    }

    const coupon = rows[0];

    // Check minimum order
    if (coupon.min_order && orderTotal < coupon.min_order) {
      return res.json({ 
        valid: false, 
        message: `Minimum order of MK ${coupon.min_order.toLocaleString()} required` 
      });
    }

    // Calculate discount amount
    const discountAmount = coupon.discount_type === 'percentage'
      ? (orderTotal * coupon.discount_value / 100)
      : coupon.discount_value;

    // Ensure discount doesn't exceed order total
    const finalDiscount = Math.min(discountAmount, orderTotal);

    res.json({
      valid: true,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: finalDiscount,
      message: `Coupon applied! You saved MK ${finalDiscount.toLocaleString()}`
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Failed to validate coupon' });
  }
};

// Get public delivery zones
export const getPublicDeliveryZones = async (req, res) => {
  try {
    const [zones] = await pool.query(
      'SELECT id, name, price, estimated_days FROM delivery_zones WHERE status = "active" ORDER BY price ASC'
    );
    res.json({ zones });
  } catch (error) {
    console.error('Get delivery zones error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery zones' });
  }
};

// Get public delivery slots
export const getPublicDeliverySlots = async (req, res) => {
  try {
    const [slots] = await pool.query(
      `SELECT id, day, time, max_orders, 
        (SELECT COUNT(*) FROM orders WHERE delivery_slot_id = delivery_slots.id AND DATE(created_at) = CURDATE()) as orders_today,
        CASE 
          WHEN (SELECT COUNT(*) FROM orders WHERE delivery_slot_id = delivery_slots.id AND DATE(created_at) = CURDATE()) >= max_orders THEN 0
          ELSE 1
        END as available
       FROM delivery_slots 
       WHERE status = "active" 
       ORDER BY 
         CASE day 
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END, time ASC`
    );
    res.json({ slots });
  } catch (error) {
    console.error('Get delivery slots error:', error);
    res.status(500).json({ message: 'Failed to fetch delivery slots' });
  }
};

// Lookup orders by email
export const lookupOrders = async (req, res) => {
  try {
    const { email, orderNumber } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let orders;
    if (orderNumber) {
      // Find specific order
      const [rows] = await pool.query(
        'SELECT order_number, created_at, total, status FROM orders WHERE order_number = ? AND customer_email = ?',
        [orderNumber, email]
      );
      orders = rows;
    } else {
      // Find all orders for email
      const [rows] = await pool.query(
        'SELECT order_number, created_at, total, status FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
        [email]
      );
      orders = rows;
    }

    res.json(orders.map(order => ({
      orderNumber: order.order_number,
      date: order.created_at,
      total: order.total,
      status: order.status,
      items: 0 // Would need to count items
    })));
  } catch (error) {
    console.error('Lookup orders error:', error);
    res.status(500).json({ message: 'Failed to lookup orders' });
  }
};

// Cancel order (guest)
export const cancelOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { guestToken } = req.body;

    // For now, just check if order exists
    const [rows] = await pool.query(
      'SELECT id, status FROM orders WHERE order_number = ?',
      [orderNumber]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = rows[0];

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    await pool.query(
      `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
      [order.id]
    );

    await pool.query(
      `INSERT INTO order_status_history (order_id, status, note, created_at)
       VALUES (?, 'cancelled', 'Cancelled by customer', NOW())`,
      [order.id]
    );

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (paymentStatus) {
      query += ' AND payment_status = ?';
      params.push(paymentStatus);
    }
    if (startDate) {
      query += ' AND DATE(created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(created_at) <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [orders] = await pool.query(query, params);

    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM orders'
    );

    res.json({
      orders,
      page: parseInt(page),
      limit: parseInt(limit),
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Admin: Get single order
export const getOrder = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    // Get status history
    const [statusHistory] = await pool.query(
      'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
      [order.id]
    );

    res.json({
      ...order,
      items,
      statusHistory
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const orderId = req.params.id;

    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );

    await pool.query(
      `INSERT INTO order_status_history (order_id, status, note, created_at)
       VALUES (?, ?, ?, NOW())`,
      [orderId, status, note || `Status updated to ${status}`]
    );

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Admin: Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // Today's stats
    const [todayOrders] = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE DATE(created_at) = CURDATE()`
    );

    // This month's stats
    const [monthOrders] = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
    );

    // Orders by status
    const [ordersByStatus] = await pool.query(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    );

    // Recent orders
    const [recentOrders] = await pool.query(
      `SELECT order_number, customer_name, total, status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 10`
    );

    res.json({
      stats: {
        today: {
          orders: todayOrders[0].count,
          revenue: todayOrders[0].revenue
        },
        month: {
          orders: monthOrders[0].count,
          revenue: monthOrders[0].revenue
        },
        ordersByStatus
      },
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};