const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let userOrAdmin;
    if (decoded.role === 'admin') {
      userOrAdmin = await require('../models/Admin').findById(decoded.id).select('-password');
    } else {
      userOrAdmin = await User.findById(decoded.userId || decoded.id).select('-password');
    }
    if (!userOrAdmin) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = userOrAdmin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin only middleware
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { auth, adminAuth };
