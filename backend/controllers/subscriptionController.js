<<<<<<< HEAD
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

const SUBSCRIPTION_SERVICE_ID = '3'; // Match your service ID

// ============= PUBLIC PLAN ROUTES =============

// Get all active subscription plans for customers
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

// Get single plan details
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

// Create new subscription
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

    // Validate required fields
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

    // Validate delivery day
    if (!validateDeliveryDay(deliveryDay)) {
      return res.status(400).json({ message: 'Invalid delivery day. Must be Monday-Sunday' });
    }

    // Get plan details
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    if (plan.status !== 'active') {
      return res.status(400).json({ message: 'Plan is not active' });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(customerPhone);

    // Calculate next delivery date
    const nextDeliveryDate = calculateNextDeliveryDate(startDate, plan.interval, deliveryDay);

    // Generate access token for management
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 30); // Token valid for 30 days

    // Create subscription
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
      status: 'active'
    };

    const result = await CustomerSubscription.create(subscriptionData);

    // Store access token
    await db.query(
      'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
      [accessToken, tokenExpires, result.id]
    );

    // Get the created subscription
    const subscription = await CustomerSubscription.findById(result.id);

    // Send confirmation email
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

// Get subscription by token (for management)
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

// Find subscription by number and email/phone
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

    // Generate new token for management
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 1); // 24 hour token

    await db.query(
      'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
      [accessToken, tokenExpires, subscription.id]
    );

    // Remove sensitive data
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

// Get subscription by ID
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

// Update subscription
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

    // Verify subscription exists
    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription can be modified
    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update cancelled subscription' });
    }

    // Validate delivery day if provided
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

// Pause subscription
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

// Resume subscription
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

    // Calculate next delivery date
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

// Cancel subscription
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

// Get delivery history
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

// Record a delivery (admin only)
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

    // Update next delivery date if delivered
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

// Send management link via email/SMS
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

    // Generate tokens for each subscription
    const links = [];
    for (const sub of subscriptions) {
      // Only generate links for active subscriptions
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

    // Send email if email was provided
    if (email && links.length > 0) {
      await sendManagementEmail(email, links);
    }

    // Here you would implement SMS sending if needed
    // if (phone && links.length > 0) {
    //   await sendManagementSMS(phone, links);
    // }

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

// Get subscription stats (admin only)
export const getSubscriptionStats = async (req, res) => {
  try {
    const { planId } = req.query;
    
    // Get basic stats
    const stats = await CustomerSubscription.getStats(planId);
    
    // Get popular plans
    const [popularPlans] = await db.query(`
      SELECT 
        sp.id, 
        sp.name, 
        sp.category,
        sp.price,
        sp.interval_type,
        COUNT(cs.id) as subscriber_count,
        SUM(CASE WHEN cs.status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM subscription_plans sp
      LEFT JOIN customer_subscriptions cs ON sp.id = cs.plan_id
      WHERE sp.service_id = ? AND sp.status = 'active'
      GROUP BY sp.id
      ORDER BY subscriber_count DESC
      LIMIT 5
    `, [SUBSCRIPTION_SERVICE_ID]);

    // Get monthly revenue
    const [monthlyRevenue] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total_paid) as revenue,
        COUNT(*) as subscriptions
      FROM customer_subscriptions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Get status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_paid) as revenue
      FROM customer_subscriptions
      GROUP BY status
    `);

    res.json({
      ...stats,
      popularPlans,
      monthlyRevenue,
      statusBreakdown
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= NOTE: DO NOT ADD ANOTHER EXPORT OBJECT =============
// All functions are already exported with 'export' keyword above
=======
import db from '../config/database.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import CustomerSubscription from '../models/CustomerSubscription.js';
import { 
  generateAccessToken, 
  calculateNextDeliveryDate, 
  validateDeliveryDay,
  formatPhoneNumber 
} from '../utils/subscriptionHelpers.js';

const SUBSCRIPTION_SERVICE_ID = '3'; // Match your service ID

// ============= PUBLIC PLAN ROUTES =============

// Get all active subscription plans for customers
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

// Get single plan details
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

// Create new subscription
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

    // Validate required fields
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

    // Validate delivery day
    if (!validateDeliveryDay(deliveryDay)) {
      return res.status(400).json({ message: 'Invalid delivery day. Must be Monday-Sunday' });
    }

    // Get plan details
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    if (plan.status !== 'active') {
      return res.status(400).json({ message: 'Plan is not active' });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(customerPhone);

    // Calculate next delivery date
    const nextDeliveryDate = calculateNextDeliveryDate(startDate, plan.interval, deliveryDay);

    // Generate access token for management
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 30); // Token valid for 30 days

    // Create subscription
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
      status: 'active'
    };

    const result = await CustomerSubscription.create(subscriptionData);

    // Store access token
    await db.query(
      'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
      [accessToken, tokenExpires, result.id]
    );

    // Get the created subscription
    const subscription = await CustomerSubscription.findById(result.id);

    // Here you would implement email sending
    // await sendSubscriptionConfirmationEmail(subscription.customerEmail, {
    //   subscriptionNumber: subscription.subscriptionNumber,
    //   customerName: subscription.customerName,
    //   planName: subscription.planName,
    //   startDate: subscription.startDate,
    //   nextDeliveryDate: subscription.nextDeliveryDate,
    //   totalPaid: subscription.totalPaid,
    //   managementLink: `${process.env.FRONTEND_URL}/manage-subscription?token=${accessToken}&email=${encodeURIComponent(customerEmail)}`
    // });

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
        managementLink: `/manage-subscription?token=${accessToken}&email=${encodeURIComponent(customerEmail)}`
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// ============= SUBSCRIPTION MANAGEMENT =============

// Get subscription by token (for management)
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

// Find subscription by number and email/phone
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

    // Generate new token for management
    const accessToken = generateAccessToken();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 1); // 24 hour token

    await db.query(
      'UPDATE customer_subscriptions SET access_token = ?, token_expires = ? WHERE id = ?',
      [accessToken, tokenExpires, subscription.id]
    );

    // Remove sensitive data
    const { ...safeSubscription } = subscription;

    res.json({
      ...safeSubscription,
      accessToken,
      managementLink: `/manage-subscription?token=${accessToken}&email=${encodeURIComponent(subscription.customerEmail)}`
    });
  } catch (error) {
    console.error('Error finding subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get subscription by ID
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

// Update subscription
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

    // Verify subscription exists
    const subscription = await CustomerSubscription.findById(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription can be modified
    if (subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot update cancelled subscription' });
    }

    // Validate delivery day if provided
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

// Pause subscription
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

// Resume subscription
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

    // Calculate next delivery date
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

// Cancel subscription
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

// Get delivery history
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

// Record a delivery (admin only)
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

    // Update next delivery date if delivered
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

// Send management link via email/SMS
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

    // Generate tokens for each subscription
    const links = [];
    for (const sub of subscriptions) {
      // Only generate links for active subscriptions
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

    // Here you would implement email/SMS sending
    // if (email) {
    //   await sendManagementEmail(email, links);
    // } else if (phone) {
    //   await sendManagementSMS(phone, links);
    // }

    res.json({
      message: 'Management links generated',
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

// Get subscription stats (admin only)
export const getSubscriptionStats = async (req, res) => {
  try {
    const { planId } = req.query;
    
    // Get basic stats
    const stats = await CustomerSubscription.getStats(planId);
    
    // Get popular plans
    const [popularPlans] = await db.query(`
      SELECT 
        sp.id, 
        sp.name, 
        sp.category,
        sp.price,
        sp.interval_type,
        COUNT(cs.id) as subscriber_count,
        SUM(CASE WHEN cs.status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM subscription_plans sp
      LEFT JOIN customer_subscriptions cs ON sp.id = cs.plan_id
      WHERE sp.service_id = ? AND sp.status = 'active'
      GROUP BY sp.id
      ORDER BY subscriber_count DESC
      LIMIT 5
    `, [SUBSCRIPTION_SERVICE_ID]);

    // Get monthly revenue
    const [monthlyRevenue] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(total_paid) as revenue,
        COUNT(*) as subscriptions
      FROM customer_subscriptions
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Get status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_paid) as revenue
      FROM customer_subscriptions
      GROUP BY status
    `);

    res.json({
      ...stats,
      popularPlans,
      monthlyRevenue,
      statusBreakdown
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============= UTILITY FUNCTIONS (for internal use) =============

// Helper function to send confirmation email (implement with your email service)
const sendSubscriptionConfirmationEmail = async (email, data) => {
  // TODO: Implement with your email service (nodemailer, sendgrid, etc.)
  console.log(`Sending confirmation email to ${email}`, data);
};

// Helper function to send management email
const sendManagementEmail = async (email, links) => {
  // TODO: Implement with your email service
  console.log(`Sending management links to ${email}`, links);
};

// Helper function to send SMS
const sendManagementSMS = async (phone, links) => {
  // TODO: Implement with your SMS service
  console.log(`Sending management links to ${phone}`, links);
};

// ============= NOTE: DO NOT ADD ANOTHER EXPORT OBJECT =============
// All functions are already exported with 'export' keyword above
>>>>>>> 3143af0e69b764942ae4e67b67f5fb252f67c462
// Adding another export object will cause duplicate export errors