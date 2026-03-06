<<<<<<< HEAD
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmation } from '../utils/emailService.js';

// Create new order (guest checkout)
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

// Track order by guest token
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

// Cancel order (guest)
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

// Admin: Get all orders
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

// Admin: Get single order
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

// Admin: Update order status
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

// Admin: Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Order.getDashboardStats();
    const recentOrders = await Order.getRecentOrders(10);
    
    res.json({
      stats,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
=======
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmation } from '../utils/emailService.js';

// Create new order (guest checkout)
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

// Track order by guest token
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

// Cancel order (guest)
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

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const filters = { status, paymentStatus, startDate, endDate };
    const pagination = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const orders = await Order.findAll(filters, pagination);
    
    res.json({
      orders,
      page: parseInt(page),
      total: orders.length // You might want to get total count separately
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Admin: Get single order
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

// Admin: Update order status
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

// Admin: Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Order.getDashboardStats();
    const recentOrders = await Order.getRecentOrders(10);
    
    res.json({
      stats,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
>>>>>>> 3143af0e69b764942ae4e67b67f5fb252f67c462
};