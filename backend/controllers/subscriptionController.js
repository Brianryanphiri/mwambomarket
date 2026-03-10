import db from '../config/database.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import CustomerSubscription from '../models/CustomerSubscription.js';
import { 
  generateAccessToken, 
  calculateNextDeliveryDate, 
  validateDeliveryDay,
  formatPhoneNumber 
} from '../utils/subscriptionHelpers.js';
import { sendSubscriptionConfirmationEmail, sendManagementEmail } from '../utils/emailService.js';

const SUBSCRIPTION_SERVICE_ID = '3';

// ============= PUBLIC PLAN ROUTES =============

export const getPublicPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll(SUBSCRIPTION_SERVICE_ID);
    const activePlans = plans
      .filter(p => p.status === 'active')
      .map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        originalPrice: plan.originalPrice,
        interval: plan.interval,
        category: plan.category,
        items: plan.items,
        popularity: plan.popularity,
        savings: plan.savings,
        discount: plan.discount,
        features: plan.features,
        color: plan.color,
        bgColor: plan.bgColor,
        icon: plan.icon,
        minimumCommitment: plan.minimumCommitment,
        trialDays: plan.trialDays,
        setupFee: plan.setupFee,
        popular: plan.popular,
        bestValue: plan.bestValue
      }));
    
    res.json(activePlans);
  } catch (error) {
    console.error('Error fetching public plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPlanDetails = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan || plan.status !== 'active') {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= SUBSCRIPTION CREATION =============

export const createSubscription = async (req, res) => {
  try {
    const {
      planId,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      deliveryDay,
      deliveryTime,
      deliveryAddress,
      deliveryInstructions,
      paymentMethod,
      paymentReference,
      totalPaid
    } = req.body;

    if (!planId || !customerName || !customerEmail || !customerPhone || 
        !startDate || !deliveryDay || !deliveryAddress || !paymentMethod || !totalPaid) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missing: {
          planId: !planId,
          customerName: !customerName,
          customerEmail: !customerEmail,
          customerPhone: !customerPhone,
          startDate: !startDate,
          deliveryDay: !deliveryDay,
          deliveryAddress: !deliveryAddress,
          paymentMethod: !paymentMethod,
          totalPaid: !totalPaid
        }
      });
    }

    if (!validateDeliveryDay(deliveryDay)) {
      return res.status(400).json({ message: 'Invalid delivery day. Must be Monday-Sunday' });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    if (plan.status !== 'active') {
      return res.status(400).json({ message: 'Plan is not active' });
    }

    const formattedPhone = formatPhoneNumber(customerPhone);
    const nextDeliveryDate = calculateNextDeliveryDate(startDate, plan.interval, deliveryDay);
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 30);

    const subscriptionData = {
      planId,
      customerName,
      customerEmail,
      customerPhone: formattedPhone,
      startDate,
      nextDeliveryDate,
      deliveryDay,
      deliveryTime: deliveryTime || null,
      deliveryAddress,
      deliveryInstructions: deliveryInstructions || null,
      paymentMethod,
      paymentReference: paymentReference || null,
      totalPaid: parseFloat(totalPaid),
      status: 'active',
      call_status: 'pending',
      reminder_sent: 0
    };

    const result = await CustomerSubscription.create(subscriptionData);

    await db.query(
      'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
      [accessToken, tokenExpires, result.id]
    );

    const subscription = await CustomerSubscription.findById(result.id);
    const managementLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/manage-subscription?token=${accessToken}&email=${encodeURIComponent(customerEmail)}`;
    
    await sendSubscriptionConfirmationEmail(customerEmail, {
      subscriptionNumber: subscription.subscriptionNumber,
      customerName: subscription.customerName,
      planName: subscription.planName,
      startDate: subscription.startDate,
      nextDeliveryDate: subscription.nextDeliveryDate,
      totalPaid: subscription.totalPaid,
      managementLink
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        subscriptionNumber: subscription.subscriptionNumber,
        planName: subscription.planName,
        customerName: subscription.customerName,
        startDate: subscription.startDate,
        nextDeliveryDate: subscription.nextDeliveryDate,
        totalPaid: subscription.totalPaid,
        managementLink
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ============= SUBSCRIPTION MANAGEMENT =============

export const getSubscriptionByToken = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email required' });
    }

    const [rows] = await db.query(
      'SELECT id FROM customer_subscriptions WHERE access_token = ? AND customer_email = ? AND token_expires > NOW()',
      [token, email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Subscription not found or token expired' });
    }

    const subscription = await CustomerSubscription.findById(rows[0].id);
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription by token:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const findSubscription = async (req, res) => {
  try {
    const { subscriptionNumber, email, phone } = req.body;

    if (!subscriptionNumber || (!email && !phone)) {
      return res.status(400).json({ 
        message: 'Subscription number and either email or phone required' 
      });
    }

    let subscriptions = [];
    if (email) {
      subscriptions = await CustomerSubscription.findByEmail(email);
    } else if (phone) {
      const formattedPhone = formatPhoneNumber(phone);
      subscriptions = await CustomerSubscription.findByPhone(formattedPhone);
    }

    const subscription = subscriptions.find(s => s.subscriptionNumber === subscriptionNumber);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 1);

    await db.query(
      'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
      [accessToken, tokenExpires, subscription.id]
    );

    const { ...safeSubscription } = subscription;

    res.json({
      ...safeSubscription,
      accessToken,
      managementLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/manage-subscription?token=${accessToken}&email=${encodeURIComponent(subscription.customerEmail)}`
    });
  } catch (error) {
    console.error('Error finding subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const subscription = await CustomerSubscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nextDeliveryDate,
      deliveryDay,
      deliveryTime,
      deliveryAddress,
      deliveryInstructions
    } = req.body;

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update cancelled subscription' });
    }

    if (deliveryDay && !validateDeliveryDay(deliveryDay)) {
      return res.status(400).json({ message: 'Invalid delivery day' });
    }

    const updated = await CustomerSubscription.update(id, {
      nextDeliveryDate,
      deliveryDay,
      deliveryTime,
      deliveryAddress,
      deliveryInstructions
    });

    if (!updated) {
      return res.status(400).json({ message: 'Update failed' });
    }

    const updatedSubscription = await CustomerSubscription.findById(id);
    res.json({
      message: 'Subscription updated successfully',
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { untilDate } = req.body;

    if (!untilDate) {
      return res.status(400).json({ message: 'Pause until date required' });
    }

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Only active subscriptions can be paused' });
    }

    const pauseDate = new Date(untilDate);
    const today = new Date();
    if (pauseDate <= today) {
      return res.status(400).json({ message: 'Pause until date must be in the future' });
    }

    const paused = await CustomerSubscription.pause(id, untilDate);
    if (!paused) {
      return res.status(400).json({ message: 'Pause failed' });
    }

    res.json({
      message: 'Subscription paused successfully',
      pauseUntil: untilDate
    });
  } catch (error) {
    console.error('Error pausing subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({ message: 'Only paused subscriptions can be resumed' });
    }

    const resumed = await CustomerSubscription.resume(id);
    if (!resumed) {
      return res.status(400).json({ message: 'Resume failed' });
    }

    const plan = await SubscriptionPlan.findById(subscription.planId);
    const nextDeliveryDate = calculateNextDeliveryDate(
      new Date().toISOString().split('T')[0],
      plan.interval,
      subscription.deliveryDay
    );

    await CustomerSubscription.update(id, { nextDeliveryDate });

    res.json({
      message: 'Subscription resumed successfully',
      nextDeliveryDate
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Subscription already cancelled' });
    }

    const cancelled = await CustomerSubscription.cancel(id, reason);
    if (!cancelled) {
      return res.status(400).json({ message: 'Cancellation failed' });
    }

    res.json({
      message: 'Subscription cancelled successfully',
      cancelledAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= DELIVERY MANAGEMENT =============

export const getDeliveryHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const deliveries = await CustomerSubscription.getDeliveries(id);
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const recordDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryDate, status, trackingNumber, notes } = req.body;

    if (!deliveryDate || !status) {
      return res.status(400).json({ message: 'Delivery date and status required' });
    }

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const deliveryId = await CustomerSubscription.recordDelivery(id, deliveryDate, status, trackingNumber, notes);

    if (status === 'delivered') {
      const plan = await SubscriptionPlan.findById(subscription.planId);
      const nextDeliveryDate = calculateNextDeliveryDate(
        deliveryDate,
        plan.interval,
        subscription.deliveryDay
      );

      await CustomerSubscription.update(id, { nextDeliveryDate });
    }

    res.status(201).json({
      message: 'Delivery recorded successfully',
      deliveryId
    });
  } catch (error) {
    console.error('Error recording delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= MANAGEMENT LINK =============

export const sendManagementLink = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone required' });
    }

    let subscriptions = [];
    if (email) {
      subscriptions = await CustomerSubscription.findByEmail(email);
    } else if (phone) {
      const formattedPhone = formatPhoneNumber(phone);
      subscriptions = await CustomerSubscription.findByPhone(formattedPhone);
    }

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No subscriptions found' });
    }

    const links = [];
    for (const sub of subscriptions) {
      if (sub.status === 'active' || sub.status === 'paused') {
        const accessToken = generateAccessToken();
        const tokenExpires = new Date();
        tokenExpires.setDate(tokenExpires.getDate() + 1);

        await db.query(
          'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
          [accessToken, tokenExpires, sub.id]
        );

        links.push({
          subscriptionNumber: sub.subscriptionNumber,
          planName: sub.planName,
          status: sub.status,
          managementLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/manage-subscription?token=${accessToken}&email=${encodeURIComponent(sub.customerEmail)}`
        });
      }
    }

    if (email && links.length > 0) {
      await sendManagementEmail(email, links);
    }

    res.json({
      message: 'Management links generated and sent',
      count: links.length,
      links: links.map(l => ({
        subscriptionNumber: l.subscriptionNumber,
        planName: l.planName,
        status: l.status,
        managementLink: l.managementLink
      }))
    });
  } catch (error) {
    console.error('Error sending management link:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= ADMIN STATS =============

export const getSubscriptionStats = async (req, res) => {
  try {
    // Get total subscribers count
    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM customer_subscriptions');
    const total = totalRows[0].total;

    // Get active subscribers count
    const [activeRows] = await db.query('SELECT COUNT(*) as active FROM customer_subscriptions WHERE status = ?', ['active']);
    const active = activeRows[0].active;

    // Get paused subscribers count
    const [pausedRows] = await db.query('SELECT COUNT(*) as paused FROM customer_subscriptions WHERE status = ?', ['paused']);
    const paused = pausedRows[0].paused;

    // Get cancelled subscribers count
    const [cancelledRows] = await db.query('SELECT COUNT(*) as cancelled FROM customer_subscriptions WHERE status = ?', ['cancelled']);
    const cancelled = cancelledRows[0].cancelled;

    // Get total revenue (sum of total_paid)
    const [revenueRows] = await db.query('SELECT SUM(total_paid) as total_revenue FROM customer_subscriptions');
    const totalRevenue = revenueRows[0].total_revenue || 0;

    // Get upcoming deliveries this week (next_delivery_date within 7 days)
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    const [upcomingRows] = await db.query(
      'SELECT COUNT(*) as upcoming FROM customer_subscriptions WHERE status = ? AND next_delivery_date BETWEEN ? AND ?',
      ['active', today, nextWeekStr]
    );
    const upcomingDeliveries = upcomingRows[0].upcoming;

    // Get MRR (Monthly Recurring Revenue) - sum of plan prices for active subscribers
    const [mrrRows] = await db.query(`
      SELECT SUM(sp.price) as mrr 
      FROM customer_subscriptions cs
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE cs.status = ?
    `, ['active']);
    const mrr = mrrRows[0].mrr || 0;

    // Get plan breakdown
    const [planBreakdown] = await db.query(`
      SELECT 
        sp.id,
        sp.name,
        COUNT(cs.id) as subscribers,
        SUM(cs.total_paid) as revenue
      FROM subscription_plans sp
      LEFT JOIN customer_subscriptions cs ON sp.id = cs.plan_id
      WHERE sp.service_id = ? AND sp.status = 'active'
      GROUP BY sp.id, sp.name
    `, [SUBSCRIPTION_SERVICE_ID]);

    // Get monthly trends (last 6 months)
    const [monthlyTrends] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as new_subscribers,
        SUM(total_paid) as revenue
      FROM customer_subscriptions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      overview: {
        total,
        active,
        paused,
        cancelled,
        totalRevenue,
        mrr,
        upcomingDeliveries
      },
      plans: planBreakdown,
      trends: monthlyTrends
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= ADMIN SUBSCRIPTION MANAGEMENT =============

export const getAllSubscriptions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      planId, 
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        cs.*,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.interval_type as plan_interval
      FROM customer_subscriptions cs
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (status && status !== 'all') {
      query += ' AND cs.status = ?';
      queryParams.push(status);
    }
    
    if (planId && planId !== 'all') {
      query += ' AND cs.plan_id = ?';
      queryParams.push(planId);
    }
    
    if (search) {
      query += ` AND (cs.customer_name LIKE ? OR cs.customer_email LIKE ? OR cs.customer_phone LIKE ? OR cs.subscription_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM customer_subscriptions cs
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE 1=1` + 
       (status && status !== 'all' ? ' AND cs.status = ?' : '') +
       (planId && planId !== 'all' ? ' AND cs.plan_id = ?' : '') +
       (search ? ' AND (cs.customer_name LIKE ? OR cs.customer_email LIKE ? OR cs.customer_phone LIKE ? OR cs.subscription_number LIKE ?)' : ''),
      queryParams
    );
    const total = countRows[0].total;
    
    // Add pagination to main query
    query += ' ORDER BY cs.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [subscriptions] = await db.query(query, queryParams);
    
    res.json({
      subscriptions,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= FIXED: getSubscriptionDeliveries =============
export const getSubscriptionDeliveries = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      date,
      startDate,
      endDate,
      riderId,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];
    const countParams = [];
    
    if (status && status !== 'all') {
      whereConditions.push('sd.status = ?');
      queryParams.push(status);
      countParams.push(status);
    }
    
    if (search) {
      whereConditions.push(`(cs.customer_name LIKE ? OR cs.customer_phone LIKE ? OR cs.subscription_number LIKE ?)`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (date && date !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      if (date === 'today') {
        whereConditions.push('DATE(sd.delivery_date) = ?');
        queryParams.push(today);
        countParams.push(today);
      } else if (date === 'tomorrow') {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        whereConditions.push('DATE(sd.delivery_date) = ?');
        queryParams.push(tomorrow);
        countParams.push(tomorrow);
      } else if (date === 'week') {
        whereConditions.push('WEEK(sd.delivery_date) = WEEK(CURDATE()) AND YEAR(sd.delivery_date) = YEAR(CURDATE())');
      }
    }
    
    if (startDate && endDate) {
      whereConditions.push('DATE(sd.delivery_date) BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
      countParams.push(startDate, endDate);
    }
    
    if (riderId && riderId !== 'all') {
      whereConditions.push('sd.rider_id = ?');
      queryParams.push(riderId);
      countParams.push(riderId);
    }
    
    const whereClause = whereConditions.length > 0 ? ' AND ' + whereConditions.join(' AND ') : '';
    
    // FIXED: COUNT query with proper syntax
    const countSql = `
      SELECT COUNT(*) as total 
      FROM subscription_deliveries sd
      JOIN customer_subscriptions cs ON sd.subscription_id = cs.id
      WHERE 1=1 ${whereClause}
    `;
    
    const [countRows] = await db.query(countSql, countParams);
    const total = countRows[0].total;
    
    // Main data query
    const dataSql = `
      SELECT 
        sd.*,
        cs.customer_name,
        cs.customer_phone,
        cs.delivery_address,
        cs.delivery_instructions,
        cs.subscription_number,
        sp.name as plan_name,
        sp.price as plan_price
      FROM subscription_deliveries sd
      JOIN customer_subscriptions cs ON sd.subscription_id = cs.id
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE 1=1 ${whereClause}
      ORDER BY sd.delivery_date ASC, sd.created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    const [deliveries] = await db.query(dataSql, queryParams);
    
    // Add delivery number (format: DEL-YYYYMM-XXXX)
    const deliveriesWithNumber = deliveries.map((delivery, index) => ({
      ...delivery,
      delivery_number: `DEL-${new Date(delivery.delivery_date).getFullYear()}${String(new Date(delivery.delivery_date).getMonth() + 1).padStart(2, '0')}-${String(offset + index + 1).padStart(4, '0')}`
    }));
    
    res.json({
      deliveries: deliveriesWithNumber,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching subscription deliveries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubscriptionInvoices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        si.*,
        cs.customer_name,
        cs.customer_email,
        cs.customer_phone,
        cs.subscription_number,
        sp.name as plan_name
      FROM subscription_invoices si
      JOIN customer_subscriptions cs ON si.subscription_id = cs.id
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (status && status !== 'all') {
      query += ' AND si.status = ?';
      queryParams.push(status);
    }
    
    if (search) {
      query += ` AND (cs.customer_name LIKE ? OR cs.customer_email LIKE ? OR cs.subscription_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (startDate && endDate) {
      query += ' AND DATE(si.issue_date) BETWEEN ? AND ?';
      queryParams.push(startDate, endDate);
    }
    
    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM subscription_invoices si
       JOIN customer_subscriptions cs ON si.subscription_id = cs.id
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE 1=1` +
       (status && status !== 'all' ? ' AND si.status = ?' : '') +
       (search ? ' AND (cs.customer_name LIKE ? OR cs.customer_email LIKE ? OR cs.subscription_number LIKE ?)' : '') +
       (startDate && endDate ? ' AND DATE(si.issue_date) BETWEEN ? AND ?' : ''),
      queryParams
    );
    const total = countRows[0].total;
    
    // Add pagination
    query += ' ORDER BY si.issue_date DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [invoices] = await db.query(query, queryParams);
    
    // Add invoice number (format: INV-YYYYMM-XXXX)
    const invoicesWithNumber = invoices.map((invoice, index) => ({
      ...invoice,
      invoice_number: `INV-${new Date(invoice.issue_date).getFullYear()}${String(new Date(invoice.issue_date).getMonth() + 1).padStart(2, '0')}-${String(offset + index + 1).padStart(4, '0')}`,
      balance_due: invoice.total && invoice.amount_paid ? invoice.total - invoice.amount_paid : invoice.total || 0
    }));
    
    res.json({
      invoices: invoicesWithNumber,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching subscription invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, notes, riderId, actualDeliveryTime } = req.body;

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Update delivery status
      const [result] = await db.query(
        `UPDATE subscription_deliveries 
         SET status = ?, notes = ?, rider_id = ?, actual_delivery_time = ?, updated_at = NOW()
         WHERE id = ?`,
        [status, notes, riderId, actualDeliveryTime || null, deliveryId]
      );

      if (result.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Delivery not found' });
      }

      // If delivered, record delivery time and update subscription's next delivery date
      if (status === 'delivered') {
        const [delivery] = await db.query(
          'SELECT subscription_id, delivery_date FROM subscription_deliveries WHERE id = ?',
          [deliveryId]
        );
        
        if (delivery.length > 0) {
          // Get subscription to calculate next delivery date
          const [subscription] = await db.query(
            `SELECT cs.*, sp.interval_type 
             FROM customer_subscriptions cs
             JOIN subscription_plans sp ON cs.plan_id = sp.id
             WHERE cs.id = ?`,
            [delivery[0].subscription_id]
          );
          
          if (subscription.length > 0) {
            const nextDeliveryDate = calculateNextDeliveryDate(
              delivery[0].delivery_date,
              subscription[0].interval_type,
              subscription[0].delivery_day
            );
            
            await db.query(
              'UPDATE customer_subscriptions SET next_delivery_date = ? WHERE id = ?',
              [nextDeliveryDate, delivery[0].subscription_id]
            );
          }
        }
      }

      await db.query('COMMIT');
      res.json({ message: 'Delivery status updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markInvoiceAsPaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethod, paymentReference, notes, amount } = req.body;

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Get current invoice
      const [invoice] = await db.query(
        'SELECT * FROM subscription_invoices WHERE id = ?',
        [invoiceId]
      );

      if (invoice.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const paymentAmount = amount || invoice[0].total;
      const newAmountPaid = (invoice[0].amount_paid || 0) + paymentAmount;
      const newStatus = newAmountPaid >= invoice[0].total ? 'paid' : 'partial';

      // Update invoice
      const [result] = await db.query(
        `UPDATE subscription_invoices 
         SET status = ?,
             amount_paid = ?,
             payment_method = ?,
             payment_reference = ?,
             paid_date = NOW(),
             notes = CONCAT(IFNULL(notes, ''), '\n', ?),
             updated_at = NOW()
         WHERE id = ?`,
        [newStatus, newAmountPaid, paymentMethod, paymentReference, notes || '', invoiceId]
      );

      if (result.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // Record payment transaction if the table exists
      try {
        await db.query(
          `INSERT INTO payment_transactions (invoice_id, amount, payment_method, payment_reference, notes, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [invoiceId, paymentAmount, paymentMethod, paymentReference, notes]
        );
      } catch (err) {
        // Table might not exist, just log and continue
        console.log('Payment transactions table may not exist:', err.message);
      }

      await db.query('COMMIT');
      res.json({ 
        message: 'Invoice marked as paid successfully',
        status: newStatus,
        amountPaid: newAmountPaid
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= RIDER MANAGEMENT =============

// FIXED: getAdminRiders - removed dz.coverage completely
export const getAdminRiders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        r.*,
        dz.name as zone_name,
        0 as completed_deliveries,
        0 as active_deliveries
      FROM riders r
      LEFT JOIN delivery_zones dz ON r.zone_id = dz.id
      WHERE 1=1
    `;
    
    let countQuery = 'SELECT COUNT(*) as total FROM riders WHERE 1=1';
    const queryParams = [];
    const countParams = [];

    if (search) {
      query += ' AND (r.name LIKE ? OR r.phone LIKE ? OR r.email LIKE ?)';
      countQuery += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countRows] = await db.query(countQuery, countParams);
    const total = countRows[0].total;

    // Add pagination
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [riders] = await db.query(query, queryParams);

    res.json({
      riders,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new rider
export const createRider = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      national_id,
      vehicle_type = 'motorcycle',
      vehicle_plate,
      zone_id,
      status = 'active',
      notes
    } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ 
        message: 'Name and phone are required' 
      });
    }

    // Check if phone already exists
    const [existing] = await db.query(
      'SELECT id FROM riders WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Rider with this phone number already exists' });
    }

    const [result] = await db.query(
      `INSERT INTO riders 
       (name, phone, email, national_id, vehicle_type, vehicle_plate, zone_id, status, notes, total_deliveries, rating, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0.00, NOW(), NOW())`,
      [
        name,
        phone,
        email || null,
        national_id || null,
        vehicle_type,
        vehicle_plate || null,
        zone_id || null,
        status,
        notes || null
      ]
    );

    const [newRider] = await db.query(
      `SELECT 
        r.*,
        dz.name as zone_name
      FROM riders r
      LEFT JOIN delivery_zones dz ON r.zone_id = dz.id
      WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRider[0]);
  } catch (error) {
    console.error('Error creating rider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update rider
export const updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      national_id,
      vehicle_type,
      vehicle_plate,
      zone_id,
      status,
      notes
    } = req.body;

    // Check if rider exists
    const [rider] = await db.query(
      'SELECT * FROM riders WHERE id = ?',
      [id]
    );

    if (rider.length === 0) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // If phone is being changed, check if new phone already exists
    if (phone && phone !== rider[0].phone) {
      const [existing] = await db.query(
        'SELECT id FROM riders WHERE phone = ? AND id != ?',
        [phone, id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Rider with this phone number already exists' });
      }
    }

    await db.query(
      `UPDATE riders 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           email = ?,
           national_id = ?,
           vehicle_type = COALESCE(?, vehicle_type),
           vehicle_plate = ?,
           zone_id = ?,
           status = COALESCE(?, status),
           notes = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        name || rider[0].name,
        phone || rider[0].phone,
        email !== undefined ? email : rider[0].email,
        national_id !== undefined ? national_id : rider[0].national_id,
        vehicle_type || rider[0].vehicle_type,
        vehicle_plate !== undefined ? vehicle_plate : rider[0].vehicle_plate,
        zone_id !== undefined ? zone_id : rider[0].zone_id,
        status || rider[0].status,
        notes !== undefined ? notes : rider[0].notes,
        id
      ]
    );

    const [updatedRider] = await db.query(
      `SELECT 
        r.*,
        dz.name as zone_name
      FROM riders r
      LEFT JOIN delivery_zones dz ON r.zone_id = dz.id
      WHERE r.id = ?`,
      [id]
    );

    res.json(updatedRider[0]);
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete rider
export const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if rider has active deliveries
    const [deliveries] = await db.query(
      'SELECT COUNT(*) as count FROM subscription_deliveries WHERE rider_id = ? AND status IN ("processing", "out_for_delivery")',
      [id]
    );

    if (deliveries[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete rider with active deliveries. Please reassign deliveries first.' 
      });
    }

    const [result] = await db.query(
      'DELETE FROM riders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    res.json({ message: 'Rider deleted successfully' });
  } catch (error) {
    console.error('Error deleting rider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle rider status (cycles through: active → on_delivery → inactive → active)
export const toggleRiderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [rider] = await db.query(
      'SELECT status FROM riders WHERE id = ?',
      [id]
    );

    if (rider.length === 0) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    let newStatus;
    switch(rider[0].status) {
      case 'active':
        newStatus = 'on_delivery';
        break;
      case 'on_delivery':
        newStatus = 'inactive';
        break;
      case 'inactive':
        newStatus = 'active';
        break;
      default:
        newStatus = 'active';
    }

    await db.query(
      'UPDATE riders SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    res.json({ 
      message: `Rider status changed to ${newStatus}`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling rider status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get rider statistics
export const getRiderStats = async (req, res) => {
  try {
    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM riders');
    const [activeRows] = await db.query('SELECT COUNT(*) as active FROM riders WHERE status = "active"');
    const [onDeliveryRows] = await db.query('SELECT COUNT(*) as on_delivery FROM riders WHERE status = "on_delivery"');
    const [avgRatingRows] = await db.query('SELECT AVG(rating) as avg_rating FROM riders WHERE rating > 0');
    
    const [topRiders] = await db.query(`
      SELECT 
        r.id,
        r.name,
        r.phone,
        r.total_deliveries,
        r.rating
      FROM riders r
      ORDER BY r.total_deliveries DESC
      LIMIT 5
    `);

    res.json({
      total: totalRows[0].total,
      active: activeRows[0].active,
      on_delivery: onDeliveryRows[0].on_delivery,
      avg_rating: avgRatingRows[0].avg_rating || 0,
      topRiders
    });
  } catch (error) {
    console.error('Error fetching rider stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= SUBSCRIPTION ORDERS =============

export const getSubscriptionOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus,
      search,
      startDate,
      endDate 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        so.*,
        cs.customer_name,
        cs.customer_email,
        cs.customer_phone,
        cs.subscription_number,
        sp.name as plan_name
      FROM subscription_orders so
      JOIN customer_subscriptions cs ON so.subscription_id = cs.id
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (status && status !== 'all') {
      query += ' AND so.order_status = ?';
      queryParams.push(status);
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      query += ' AND so.payment_status = ?';
      queryParams.push(paymentStatus);
    }
    
    if (search) {
      query += ` AND (cs.customer_name LIKE ? OR cs.customer_email LIKE ? OR cs.subscription_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (startDate && endDate) {
      query += ' AND DATE(so.created_at) BETWEEN ? AND ?';
      queryParams.push(startDate, endDate);
    }
    
    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM subscription_orders so
       JOIN customer_subscriptions cs ON so.subscription_id = cs.id
       JOIN subscription_plans sp ON cs.plan_id = sp.id
       WHERE 1=1` +
       (status && status !== 'all' ? ' AND so.order_status = ?' : '') +
       (paymentStatus && paymentStatus !== 'all' ? ' AND so.payment_status = ?' : '') +
       (search ? ' AND (cs.customer_name LIKE ? OR cs.customer_email LIKE ? OR cs.subscription_number LIKE ?)' : '') +
       (startDate && endDate ? ' AND DATE(so.created_at) BETWEEN ? AND ?' : ''),
      queryParams
    );
    const total = countRows[0].total;
    
    // Add pagination
    query += ' ORDER BY so.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [orders] = await db.query(query, queryParams);
    
    // Add order number
    const ordersWithNumber = orders.map((order, index) => ({
      ...order,
      order_number: `ORD-${new Date(order.created_at).getFullYear()}${String(new Date(order.created_at).getMonth() + 1).padStart(2, '0')}-${String(offset + index + 1).padStart(4, '0')}`
    }));
    
    res.json({
      orders: ordersWithNumber,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching subscription orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const [result] = await db.query(
      `UPDATE subscription_orders 
       SET order_status = ?, notes = CONCAT(IFNULL(notes, ''), '\n', ?), updated_at = NOW()
       WHERE id = ?`,
      [status, notes || '', orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= CALL LOGGING =============

export const logSubscriptionCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, callLaterDate } = req.body;

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await db.query(
      `UPDATE customer_subscriptions 
       SET call_status = ?, call_notes = CONCAT(IFNULL(call_notes, ''), '\n', ?), last_call_date = NOW(), next_reminder_date = ?
       WHERE id = ?`,
      [status, notes, callLaterDate || null, id]
    );

    // Log the call in a separate table if it exists
    try {
      await db.query(
        `INSERT INTO subscription_calls (subscription_id, status, notes, created_at)
         VALUES (?, ?, ?, NOW())`,
        [id, status, notes]
      );
    } catch (err) {
      // Table might not exist, just log and continue
      console.log('Subscription calls table may not exist:', err.message);
    }

    res.json({ message: 'Call logged successfully' });
  } catch (error) {
    console.error('Error logging subscription call:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= NEW: SUBSCRIBER DETAIL FUNCTIONS =============

// Get single subscriber with plan details
export const getSubscriberById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        cs.*,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.interval_type as plan_interval,
        sp.description as plan_description,
        sp.features as plan_features
      FROM customer_subscriptions cs
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE cs.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    const subscriber = rows[0];
    
    // Parse JSON fields
    if (subscriber.plan_features) {
      try {
        subscriber.plan_features = JSON.parse(subscriber.plan_features);
      } catch (e) {
        subscriber.plan_features = [];
      }
    }

    // Get tags if they exist
    const [tags] = await db.query(
      'SELECT tag FROM subscription_tags WHERE subscription_id = ?',
      [id]
    );
    subscriber.tags = tags.map(t => t.tag);

    res.json(subscriber);
  } catch (error) {
    console.error('Error fetching subscriber by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscriber deliveries
export const getSubscriberDeliveries = async (req, res) => {
  try {
    const { id } = req.params;

    const [deliveries] = await db.query(`
      SELECT 
        sd.*,
        r.name as rider_name
      FROM subscription_deliveries sd
      LEFT JOIN riders r ON sd.rider_id = r.id
      WHERE sd.subscription_id = ?
      ORDER BY sd.delivery_date DESC
    `, [id]);

    // Add delivery numbers
    const deliveriesWithNumbers = deliveries.map((delivery, index) => ({
      ...delivery,
      delivery_number: `DEL-${new Date(delivery.delivery_date).getFullYear()}${String(new Date(delivery.delivery_date).getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`
    }));

    res.json(deliveriesWithNumbers);
  } catch (error) {
    console.error('Error fetching subscriber deliveries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add delivery for subscriber
export const addSubscriberDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_date, status, tracking_number, notes, rider_id, delivery_time } = req.body;

    if (!delivery_date || !status) {
      return res.status(400).json({ message: 'Delivery date and status are required' });
    }

    const [result] = await db.query(
      `INSERT INTO subscription_deliveries 
       (subscription_id, delivery_date, delivery_time, status, tracking_number, notes, rider_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, delivery_date, delivery_time || null, status, tracking_number || null, notes || null, rider_id || null]
    );

    // If delivered, update next delivery date
    if (status === 'delivered') {
      const [subscription] = await db.query(
        `SELECT cs.*, sp.interval_type 
         FROM customer_subscriptions cs
         JOIN subscription_plans sp ON cs.plan_id = sp.id
         WHERE cs.id = ?`,
        [id]
      );

      if (subscription.length > 0) {
        const nextDeliveryDate = calculateNextDeliveryDate(
          delivery_date,
          subscription[0].interval_type,
          subscription[0].delivery_day
        );

        await db.query(
          'UPDATE customer_subscriptions SET next_delivery_date = ? WHERE id = ?',
          [nextDeliveryDate, id]
        );
      }
    }

    res.status(201).json({
      message: 'Delivery added successfully',
      delivery_id: result.insertId
    });
  } catch (error) {
    console.error('Error adding subscriber delivery:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscriber invoices
export const getSubscriberInvoices = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoices] = await db.query(
      'SELECT * FROM subscription_invoices WHERE subscription_id = ? ORDER BY issue_date DESC',
      [id]
    );

    // Add invoice numbers
    const invoicesWithNumbers = invoices.map((invoice, index) => ({
      ...invoice,
      invoice_number: `INV-${new Date(invoice.issue_date).getFullYear()}${String(new Date(invoice.issue_date).getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}`
    }));

    res.json(invoicesWithNumbers);
  } catch (error) {
    console.error('Error fetching subscriber invoices:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate invoice for subscriber
export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, due_date, notes } = req.body;

    if (!amount || !due_date) {
      return res.status(400).json({ message: 'Amount and due date are required' });
    }

    const [result] = await db.query(
      `INSERT INTO subscription_invoices 
       (subscription_id, total, amount_paid, status, issue_date, due_date, notes, created_at, updated_at)
       VALUES (?, ?, 0, 'sent', CURDATE(), ?, ?, NOW(), NOW())`,
      [id, amount, due_date, notes || null]
    );

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoice_id: result.insertId
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark invoice as paid (for subscriber detail page)
export const markInvoicePaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { payment_method, payment_reference, notes } = req.body;

    const [result] = await db.query(
      `UPDATE subscription_invoices 
       SET status = 'paid', 
           amount_paid = total, 
           payment_method = ?, 
           payment_reference = ?, 
           paid_date = NOW(),
           notes = CONCAT(IFNULL(notes, ''), '\n', ?),
           updated_at = NOW()
       WHERE id = ?`,
      [payment_method || null, payment_reference || null, notes || '', invoiceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice marked as paid successfully' });
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscriber notes
export const getSubscriberNotes = async (req, res) => {
  try {
    const { id } = req.params;

    const [notes] = await db.query(
      `SELECT * FROM subscription_notes 
       WHERE subscription_id = ? 
       ORDER BY created_at DESC`,
      [id]
    );

    res.json(notes);
  } catch (error) {
    console.error('Error fetching subscriber notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add note for subscriber
export const addSubscriberNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;
    const userId = req.user?.id || 1; // Fallback for demo
    const userName = req.user?.name || 'Admin User';

    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const [result] = await db.query(
      `INSERT INTO subscription_notes 
       (subscription_id, content, type, created_by, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, content, type || 'general', userName, userId]
    );

    const [newNote] = await db.query(
      'SELECT * FROM subscription_notes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newNote[0]);
  } catch (error) {
    console.error('Error adding subscriber note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete note
export const deleteSubscriberNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const [result] = await db.query(
      'DELETE FROM subscription_notes WHERE id = ?',
      [noteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin notes (the editable notes field in customer_subscriptions)
export const updateAdminNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const [result] = await db.query(
      'UPDATE customer_subscriptions SET admin_notes = ?, updated_at = NOW() WHERE id = ?',
      [admin_notes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Admin notes updated successfully' });
  } catch (error) {
    console.error('Error updating admin notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= NEW: PENDING CALLS FUNCTIONS =============

// Get all pending calls
export const getPendingCalls = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        cs.id,
        cs.subscription_number,
        cs.customer_name,
        cs.customer_email,
        cs.customer_phone,
        cs.call_status,
        cs.call_notes,
        cs.next_reminder_date,
        cs.created_at,
        sp.name as plan_name
      FROM customer_subscriptions cs
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE cs.call_status IN ('pending', 'no_answer', 'call_later')
    `;
    
    const queryParams = [];
    
    if (status && status !== 'all') {
      query += ' AND cs.call_status = ?';
      queryParams.push(status);
    }
    
    if (search) {
      query += ` AND (cs.customer_name LIKE ? OR cs.customer_phone LIKE ? OR cs.customer_email LIKE ? OR cs.subscription_number LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total 
       FROM customer_subscriptions 
       WHERE call_status IN ('pending', 'no_answer', 'call_later')` +
       (status && status !== 'all' ? ' AND call_status = ?' : '') +
       (search ? ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ? OR subscription_number LIKE ?)' : ''),
      queryParams
    );
    const total = countRows[0].total;
    
    // Add pagination
    query += ' ORDER BY cs.next_reminder_date ASC, cs.created_at ASC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [calls] = await db.query(query, queryParams);
    
    // Get stats
    const [statsRows] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN call_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN call_status = 'no_answer' THEN 1 ELSE 0 END) as no_answer,
        SUM(CASE WHEN call_status = 'call_later' THEN 1 ELSE 0 END) as call_later,
        SUM(CASE WHEN DATE(last_call_date) = CURDATE() THEN 1 ELSE 0 END) as called_today
      FROM customer_subscriptions
      WHERE call_status IN ('pending', 'no_answer', 'call_later')
    `);
    
    res.json({
      calls,
      stats: statsRows[0],
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching pending calls:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update call status for a subscription
export const updateCallStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { call_status, call_notes, next_reminder_date } = req.body;

    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    let query = 'UPDATE customer_subscriptions SET call_status = ?, last_call_date = NOW()';
    const params = [call_status];

    if (call_notes !== undefined) {
      query += ', call_notes = CONCAT(IFNULL(call_notes, \'\'), \'\n\', ?)';
      params.push(call_notes);
    }

    if (next_reminder_date !== undefined) {
      query += ', next_reminder_date = ?';
      params.push(next_reminder_date || null);
    }

    query += ', updated_at = NOW() WHERE id = ?';
    params.push(id);

    await db.query(query, params);

    // Log the call in subscription_calls table if it exists
    try {
      await db.query(
        `INSERT INTO subscription_calls (subscription_id, status, notes, created_at)
         VALUES (?, ?, ?, NOW())`,
        [id, call_status, call_notes || '']
      );
    } catch (err) {
      // Table might not exist, just log and continue
      console.log('Subscription calls table may not exist:', err.message);
    }

    res.json({ message: 'Call status updated successfully' });
  } catch (error) {
    console.error('Error updating call status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= NEW: REMINDERS FUNCTIONS =============

// Get all reminders
export const getReminders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = 'all',
      status = 'all',
      search 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        sr.*,
        cs.customer_name,
        cs.customer_email,
        cs.customer_phone,
        cs.subscription_number,
        sp.name as plan_name
      FROM subscription_reminders sr
      JOIN customer_subscriptions cs ON sr.subscription_id = cs.id
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (type && type !== 'all') {
      query += ' AND sr.reminder_type = ?';
      queryParams.push(type);
    }
    
    if (status && status !== 'all') {
      if (status === 'sent') {
        query += ' AND sr.sent = 1';
      } else if (status === 'pending') {
        query += ' AND sr.sent = 0 AND sr.scheduled_date >= CURDATE()';
      }
    }
    
    if (search) {
      query += ` AND (cs.customer_name LIKE ? OR cs.subscription_number LIKE ? OR sr.message LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM subscription_reminders sr
      JOIN customer_subscriptions cs ON sr.subscription_id = cs.id
      WHERE 1=1
    `;
    
    if (type && type !== 'all') {
      countQuery += ' AND sr.reminder_type = ?';
    }
    
    if (status && status !== 'all') {
      if (status === 'sent') {
        countQuery += ' AND sr.sent = 1';
      } else if (status === 'pending') {
        countQuery += ' AND sr.sent = 0 AND sr.scheduled_date >= CURDATE()';
      }
    }
    
    if (search) {
      countQuery += ' AND (cs.customer_name LIKE ? OR cs.subscription_number LIKE ? OR sr.message LIKE ?)';
    }
    
    const [countRows] = await db.query(countQuery, queryParams);
    const total = countRows[0].total;
    
    // Add pagination
    query += ' ORDER BY sr.scheduled_date ASC, sr.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);
    
    const [reminders] = await db.query(query, queryParams);
    
    // Get stats
    const [statsRows] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sent = 1 THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN sent = 0 AND scheduled_date >= CURDATE() THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN DATE(sent_at) = CURDATE() THEN 1 ELSE 0 END) as sent_today
      FROM subscription_reminders
    `);
    
    res.json({
      reminders,
      stats: statsRows[0],
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new reminder
export const createReminder = async (req, res) => {
  try {
    const { 
      subscription_id, 
      reminder_type, 
      message, 
      scheduled_date,
      priority = 'medium'
    } = req.body;

    if (!subscription_id || !reminder_type || !message || !scheduled_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if subscription exists
    const subscription = await CustomerSubscription.findById(subscription_id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const [result] = await db.query(
      `INSERT INTO subscription_reminders 
       (subscription_id, reminder_type, message, scheduled_date, priority, sent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [subscription_id, reminder_type, message, scheduled_date, priority]
    );

    const [newReminder] = await db.query(
      `SELECT 
        sr.*,
        cs.customer_name,
        cs.customer_email,
        cs.subscription_number,
        sp.name as plan_name
      FROM subscription_reminders sr
      JOIN customer_subscriptions cs ON sr.subscription_id = cs.id
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE sr.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newReminder[0]);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark reminder as sent
export const markReminderSent = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE subscription_reminders SET sent = 1, sent_at = NOW(), updated_at = NOW() WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder marked as sent' });
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM subscription_reminders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};