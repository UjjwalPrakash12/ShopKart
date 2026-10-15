const Customer = require('../models/customer.model');
const generateTokenAndSetCookie = require('../utils/generateToken');

// Task 1: Register a Customer
// POST /customers/register
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validation: All fields are mandatory
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory (fullName, email, password, phone)',
      });
    }

    // Validation: Password length must be at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    // Validation: Email must be unique
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Create new customer (password hashed automatically by pre-save hook)
    const newCustomer = new Customer({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
    });

    await newCustomer.save();

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    console.error('Error in customer register:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Task 2: Customer Login
// POST /customers/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      // Do not reveal whether the email or password was incorrect
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify password using bcrypt
    const isPasswordCorrect = await customer.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT and store in HttpOnly cookie
    generateTokenAndSetCookie(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in customer login:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Task 3: My Profile
// GET /customers/me
const getProfile = async (req, res) => {
  try {
    // req.user is attached by auth.middleware.js
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    });
  } catch (error) {
    console.error('Error in getProfile:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Task 4: Logout
// POST /customers/logout
const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error in logout:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Bonus Challenge: Change Password (+10 Marks)
// PATCH /customers/change-password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Retrieve customer including password field for verification
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const isMatch = await customer.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    // Update password (pre-save hook will hash the new password)
    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error in changePassword:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  changePassword,
};
