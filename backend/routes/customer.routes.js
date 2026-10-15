const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', customerController.register);
router.post('/login', customerController.login);

// Protected routes
router.get('/me', protectRoute, customerController.getProfile);
router.post('/logout', protectRoute, customerController.logout);

// Bonus challenge (+10 marks): Change Password
router.patch('/change-password', protectRoute, customerController.changePassword);

module.exports = router;
