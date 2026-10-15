// backend/routes/order.routes.js

const express = require('express');
const { createPaymentOrder, verifyPayment, getMyOrders, getOrderById } = require('../controllers/order.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create-payment-order', protectRoute, createPaymentOrder);
router.post('/verify-payment', protectRoute, verifyPayment);
router.get('/', protectRoute, getMyOrders);
router.get('/:id', protectRoute, getOrderById);

module.exports = router;
