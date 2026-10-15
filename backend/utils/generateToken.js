const jwt = require('jsonwebtoken');

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'shopkart_secret_jwt_key_fallback',
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (mitigates XSS)
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    sameSite: 'strict', // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

module.exports = generateTokenAndSetCookie;
