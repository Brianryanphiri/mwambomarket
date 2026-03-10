import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized - No token provided' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find admin by id using MySQL model (returns plain object, not Mongoose document)
      const admin = await Admin.findById(decoded.id);
      
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized - Admin not found' 
        });
      }

      // Check if admin is active (using is_active field from MySQL)
      if (!admin.is_active) {
        return res.status(401).json({ 
          success: false,
          message: 'Account is deactivated' 
        });
      }

      // Create a safe admin object without password
      const { password_hash, ...safeAdmin } = admin;
      
      // Attach admin to request object (without password)
      req.admin = {
        id: safeAdmin.id,
        name: safeAdmin.name,
        email: safeAdmin.email,
        role: safeAdmin.role,
        permissions: safeAdmin.permissions || []
      };
      
      next();
    } catch (jwtError) {
      console.error('JWT Error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized - Token expired' 
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized - Invalid token' 
        });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Not authorized' 
    });
  }
};

// Role-based authorization middleware
export const admin = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // SUPER ADMIN - has access to everything
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // If no roles specified, just check if authenticated
    if (allowedRoles.length === 0) {
      return next();
    }

    // Check if admin's role is allowed
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Alias for admin to match your route usage
export const authorize = admin;

// Permission-based authorization
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check if admin has the required permission
    const permissions = req.admin.permissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Generate JWT Token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};