import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires Admin privileges',
    });
  }
};

export const admin = adminOnly;

export const deliveryOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'delivery' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires Delivery Partner credentials',
    });
  }
};

export const vendorOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    if (req.user.role === 'vendor' && req.user.vendorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Vendor account status is '${req.user.vendorStatus || 'pending'}'. Requires admin approval before performing catalog and order operations.`,
        vendorStatus: req.user.vendorStatus,
      });
    }
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires Vendor credentials',
    });
  }
};

export const vendorAnyStatus = (req, res, next) => {
  if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Requires Vendor account',
    });
  }
};

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2026',
    {
      expiresIn: '30d',
    }
  );
};
