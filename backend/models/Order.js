import pool from '../config/database.js';
import crypto from 'crypto';

class Order {
  // Create new order (guest checkout)
  static async create(orderData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Generate order number and guest token
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const guestToken = crypto.randomBytes(20).toString('hex');
      
      // Insert order
      const [result] = await connection.query(`
        INSERT INTO orders (
          order_number, guest_token,
          customer_name, customer_email, customer_phone,
          delivery_area, delivery_landmark, delivery_instructions,
          delivery_method, delivery_fee,
          subtotal, total,
          payment_method, payment_status,
          customer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderNumber,
        guestToken,
        orderData.customer.name,
        orderData.customer.email,
        orderData.customer.phone,
        orderData.deliveryAddress.area,
        orderData.deliveryAddress.landmark || null,
        orderData.deliveryAddress.instructions || null,
        orderData.deliveryMethod || 'standard',
        orderData.deliveryFee || 0,
        orderData.subtotal,
        orderData.total,
        orderData.paymentMethod,
        orderData.paymentMethod === 'cash' ? 'pending' : 'paid',
        orderData.customerNotes || null
      ]);
      
      const orderId = result.insertId;
      
      // Insert order items
      for (const item of orderData.items) {
        await connection.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, quantity, price, unit, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          item.productId,
          item.name,
          item.quantity,
          item.price,
          item.unit,
          item.image || null
        ]);
        
        // Update product stock
        await connection.query(`
          UPDATE products 
          SET stock = stock - ?, sold_count = sold_count + ?
          WHERE id = ? AND stock >= ?
        `, [item.quantity, item.quantity, item.productId, item.quantity]);
      }
      
      // Insert initial status history
      await connection.query(`
        INSERT INTO order_status_history (order_id, status, note)
        VALUES (?, 'pending', 'Order placed')
      `, [orderId]);
      
      await connection.commit();
      
      return {
        orderId,
        orderNumber,
        guestToken
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Find order by guest token
  static async findByGuestToken(token) {
    const [orders] = await pool.query(`
      SELECT o.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'name', oi.product_name,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'unit', oi.unit,
                 'image', oi.image_url
               )
             ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.guest_token = ?
      GROUP BY o.id
    `, [token]);
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    order.items = order.items_json ? JSON.parse(`[${order.items_json}]`) : [];
    delete order.items_json;
    
    // Get status history
    const [history] = await pool.query(`
      SELECT * FROM order_status_history
      WHERE order_id = ?
      ORDER BY created_at DESC
    `, [order.id]);
    
    order.statusHistory = history;
    
    return order;
  }

  // Find order by order number and email (for guest lookup)
  static async findByOrderNumberAndEmail(orderNumber, email) {
    const [orders] = await pool.query(`
      SELECT * FROM orders
      WHERE order_number = ? AND customer_email = ?
    `, [orderNumber, email]);
    
    return orders[0] || null;
  }

  // Find orders by email (for guest lookup)
  static async findByEmail(email, limit = 50) {
    const [orders] = await pool.query(`
      SELECT o.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'name', oi.product_name,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'unit', oi.unit,
                 'image', oi.image_url
               )
             ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_email = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [email, limit]);
    
    // Parse items JSON for each order
    return orders.map(order => {
      order.items = order.items_json ? JSON.parse(`[${order.items_json}]`) : [];
      delete order.items_json;
      return order;
    });
  }

  // Get all unique customers from orders
  static async getAllCustomers() {
    const [rows] = await pool.query(`
      SELECT 
        customer_email as email,
        customer_name as name,
        customer_phone as phone,
        COUNT(*) as total_orders,
        SUM(total) as total_spent,
        MIN(created_at) as first_order_date,
        MAX(created_at) as last_order_date
      FROM orders
      GROUP BY customer_email, customer_name, customer_phone
      ORDER BY last_order_date DESC
    `);
    return rows;
  }

  // Get all orders for a specific customer by email
  static async getCustomerOrders(email) {
    const [rows] = await pool.query(`
      SELECT * FROM orders 
      WHERE customer_email = ? 
      ORDER BY created_at DESC
    `, [email]);
    return rows;
  }

  // Update order status
  static async updateStatus(orderId, status, note = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query(`
        UPDATE orders SET status = ? WHERE id = ?
      `, [status, orderId]);
      
      await connection.query(`
        INSERT INTO order_status_history (order_id, status, note)
        VALUES (?, ?, ?)
      `, [orderId, status, note || `Status updated to ${status}`]);
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all orders (admin)
  static async findAll(filters = {}, pagination = {}) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const values = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      values.push(filters.status);
    }
    
    if (filters.paymentStatus) {
      sql += ' AND payment_status = ?';
      values.push(filters.paymentStatus);
    }
    
    if (filters.startDate) {
      sql += ' AND created_at >= ?';
      values.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND created_at <= ?';
      values.push(filters.endDate);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    if (pagination.limit) {
      sql += ' LIMIT ? OFFSET ?';
      values.push(parseInt(pagination.limit), parseInt(pagination.offset) || 0);
    }
    
    const [rows] = await pool.query(sql, values);
    return rows;
  }

  // Count orders with filters (admin)
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const values = [];
    
    if (filters.status) {
      sql += ' AND status = ?';
      values.push(filters.status);
    }
    
    if (filters.paymentStatus) {
      sql += ' AND payment_status = ?';
      values.push(filters.paymentStatus);
    }
    
    if (filters.startDate) {
      sql += ' AND created_at >= ?';
      values.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND created_at <= ?';
      values.push(filters.endDate);
    }
    
    const [rows] = await pool.query(sql, values);
    return rows[0].total;
  }

  // Get order with items (admin)
  static async findById(id) {
    const [orders] = await pool.query(`
      SELECT o.*, 
             GROUP_CONCAT(
               JSON_OBJECT(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'name', oi.product_name,
                 'quantity', oi.quantity,
                 'price', oi.price,
                 'unit', oi.unit,
                 'image', oi.image_url
               )
             ) as items_json
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `, [id]);
    
    if (orders.length === 0) return null;
    
    const order = orders[0];
    order.items = order.items_json ? JSON.parse(`[${order.items_json}]`) : [];
    delete order.items_json;
    
    // Get status history
    const [history] = await pool.query(`
      SELECT * FROM order_status_history
      WHERE order_id = ?
      ORDER BY created_at DESC
    `, [order.id]);
    
    order.statusHistory = history;
    
    return order;
  }

  // Get dashboard stats - single efficient query
  static async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [stats] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = ?) as today_orders,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) >= ?) as week_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid') as total_revenue,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = ?) as today_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'processing') as processing_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'shipped') as shipped_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as delivered_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'cancelled') as cancelled_orders,
        (SELECT COUNT(DISTINCT customer_email) FROM orders) as total_customers,
        (SELECT COUNT(*) FROM products WHERE stock <= low_stock_alert) as low_stock_products,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM products WHERE stock = 0) as out_of_stock
    `, [today, weekAgo, today]);
    
    return stats[0];
  }

  // Get recent orders
  static async getRecentOrders(limit = 10) {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        order_number, 
        customer_name, 
        customer_email,
        total, 
        status, 
        payment_status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);
    
    return rows;
  }
}

export default Order;