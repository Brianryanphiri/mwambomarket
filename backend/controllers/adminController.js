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
};