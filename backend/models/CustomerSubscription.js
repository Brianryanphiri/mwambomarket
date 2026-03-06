import db from '../config/database.js';
import { generateSubscriptionNumber } from '../utils/subscriptionHelpers.js';

class CustomerSubscription {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM customer_subscriptions WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.planId) {
      query += ' AND plan_id = ?';
      params.push(filters.planId);
    }
    if (filters.email) {
      query += ' AND customer_email = ?';
      params.push(filters.email);
    }
    if (filters.phone) {
      query += ' AND customer_phone = ?';
      params.push(filters.phone);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    return rows.map(row => this.formatSubscription(row));
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT cs.*, sp.name as plan_name, sp.price, sp.interval_type, sp.category, sp.items, sp.features, sp.color, sp.bg_color, sp.icon FROM customer_subscriptions cs JOIN subscription_plans sp ON cs.plan_id = sp.id WHERE cs.id = ?',
      [id]
    );
    return rows[0] ? this.formatSubscription(rows[0]) : null;
  }

  static async findBySubscriptionNumber(subscriptionNumber) {
    const [rows] = await db.query(
      'SELECT cs.*, sp.name as plan_name, sp.price, sp.interval_type, sp.category, sp.items, sp.features, sp.color, sp.bg_color, sp.icon FROM customer_subscriptions cs JOIN subscription_plans sp ON cs.plan_id = sp.id WHERE cs.subscription_number = ?',
      [subscriptionNumber]
    );
    return rows[0] ? this.formatSubscription(rows[0]) : null;
  }

  static async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT cs.*, sp.name as plan_name, sp.price, sp.interval_type, sp.category, sp.items, sp.features, sp.color, sp.bg_color, sp.icon FROM customer_subscriptions cs JOIN subscription_plans sp ON cs.plan_id = sp.id WHERE cs.customer_email = ? ORDER BY cs.created_at DESC',
      [email]
    );
    return rows.map(row => this.formatSubscription(row));
  }

  static async findByPhone(phone) {
    const [rows] = await db.query(
      'SELECT cs.*, sp.name as plan_name, sp.price, sp.interval_type, sp.category, sp.items, sp.features, sp.color, sp.bg_color, sp.icon FROM customer_subscriptions cs JOIN subscription_plans sp ON cs.plan_id = sp.id WHERE cs.customer_phone = ? ORDER BY cs.created_at DESC',
      [phone]
    );
    return rows.map(row => this.formatSubscription(row));
  }

  static async create(subscriptionData) {
    const {
      planId, customerName, customerEmail, customerPhone,
      startDate, nextDeliveryDate, deliveryDay, deliveryTime,
      deliveryAddress, deliveryInstructions, paymentMethod,
      paymentReference, totalPaid, status = 'active'
    } = subscriptionData;

    const subscriptionNumber = generateSubscriptionNumber();

    const [result] = await db.query(
      `INSERT INTO customer_subscriptions 
       (subscription_number, plan_id, customer_name, customer_email, customer_phone,
        start_date, next_delivery_date, delivery_day, delivery_time,
        delivery_address, delivery_instructions, payment_method,
        payment_reference, total_paid, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [subscriptionNumber, planId, customerName, customerEmail, customerPhone,
       startDate, nextDeliveryDate, deliveryDay, deliveryTime,
       deliveryAddress, deliveryInstructions, paymentMethod,
       paymentReference, totalPaid, status]
    );
    
    return {
      id: result.insertId,
      subscriptionNumber
    };
  }

  static async update(id, subscriptionData) {
    const {
      nextDeliveryDate, deliveryDay, deliveryTime, deliveryAddress,
      deliveryInstructions, status, pauseUntil
    } = subscriptionData;

    const [result] = await db.query(
      `UPDATE customer_subscriptions SET 
       next_delivery_date = COALESCE(?, next_delivery_date),
       delivery_day = COALESCE(?, delivery_day),
       delivery_time = COALESCE(?, delivery_time),
       delivery_address = COALESCE(?, delivery_address),
       delivery_instructions = COALESCE(?, delivery_instructions),
       status = COALESCE(?, status),
       pause_until = COALESCE(?, pause_until),
       updated_at = NOW()
       WHERE id = ?`,
      [nextDeliveryDate, deliveryDay, deliveryTime, deliveryAddress,
       deliveryInstructions, status, pauseUntil, id]
    );
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE customer_subscriptions SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async pause(id, untilDate) {
    const [result] = await db.query(
      'UPDATE customer_subscriptions SET status = ?, pause_until = ?, updated_at = NOW() WHERE id = ?',
      ['paused', untilDate, id]
    );
    return result.affectedRows > 0;
  }

  static async resume(id) {
    const [result] = await db.query(
      'UPDATE customer_subscriptions SET status = ?, pause_until = NULL, updated_at = NOW() WHERE id = ?',
      ['active', id]
    );
    return result.affectedRows > 0;
  }

  static async cancel(id, reason = null) {
    const [result] = await db.query(
      'UPDATE customer_subscriptions SET status = ?, cancellation_reason = ?, cancelled_at = NOW(), updated_at = NOW() WHERE id = ?',
      ['cancelled', reason, id]
    );
    return result.affectedRows > 0;
  }

  static async recordDelivery(subscriptionId, deliveryDate, status = 'delivered') {
    const [result] = await db.query(
      `INSERT INTO subscription_deliveries 
       (subscription_id, delivery_date, status, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [subscriptionId, deliveryDate, status]
    );
    return result.insertId;
  }

  static async getDeliveries(subscriptionId) {
    const [rows] = await db.query(
      'SELECT * FROM subscription_deliveries WHERE subscription_id = ? ORDER BY delivery_date DESC',
      [subscriptionId]
    );
    return rows;
  }

  static async getStats(planId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
        SUM(total_paid) as total_revenue,
        AVG(total_paid) as average_order_value
      FROM customer_subscriptions
    `;
    
    const params = [];
    if (planId) {
      query += ' WHERE plan_id = ?';
      params.push(planId);
    }

    const [rows] = await db.query(query, params);
    const stats = rows[0] || {};

    return {
      totalSubscriptions: parseInt(stats.total_subscriptions) || 0,
      activeSubscriptions: parseInt(stats.active_subscriptions) || 0,
      pausedSubscriptions: parseInt(stats.paused_subscriptions) || 0,
      cancelledSubscriptions: parseInt(stats.cancelled_subscriptions) || 0,
      totalRevenue: parseFloat(stats.total_revenue) || 0,
      averageOrderValue: parseFloat(stats.average_order_value) || 0
    };
  }

  static formatSubscription(row) {
    return {
      id: row.id.toString(),
      subscriptionNumber: row.subscription_number,
      planId: row.plan_id.toString(),
      planName: row.plan_name,
      planPrice: parseFloat(row.price),
      planInterval: row.interval_type,
      planCategory: row.category,
      planItems: row.items,
      planFeatures: row.features ? JSON.parse(row.features) : [],
      planColor: row.color,
      planBgColor: row.bg_color,
      planIcon: row.icon,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      startDate: row.start_date,
      nextDeliveryDate: row.next_delivery_date,
      deliveryDay: row.delivery_day,
      deliveryTime: row.delivery_time,
      deliveryAddress: row.delivery_address,
      deliveryInstructions: row.delivery_instructions,
      paymentMethod: row.payment_method,
      paymentReference: row.payment_reference,
      totalPaid: parseFloat(row.total_paid),
      status: row.status,
      pauseUntil: row.pause_until,
      cancellationReason: row.cancellation_reason,
      cancelledAt: row.cancelled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default CustomerSubscription;