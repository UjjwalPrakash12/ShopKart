const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies ? req.cookies.token : null;

    // Support Bearer token header for cross-domain environments (e.g. Vercel -> Render)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'shopkart_secret_jwt_key_fallback'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid or expired token',
      });
    }

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Customer not found',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  protectRoute,
};
