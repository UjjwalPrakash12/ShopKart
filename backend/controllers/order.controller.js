// backend/controllers/order.controller.js

const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const razorpay = require('../config/razorpay');

// @desc    Create payment order (ShopKart order + Razorpay order)
// @route   POST /orders/create-payment-order
// @access  Private
const createPaymentOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress } = req.body;

  // Validate shipping address fields (basic)
  const requiredFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of requiredFields) {
    if (!shippingAddress?.[field] || typeof shippingAddress[field] !== "string" || !shippingAddress[field].trim()) {
      return res.status(400).json({ success: false, message: `${field} is required` });
    }
  }
  if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
    return res.status(400).json({ success: false, message: "Pincode must be 6 digits" });
  }
  if (!/^[0-9]{10,15}$/.test(shippingAddress.phone)) {
    return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  // Load user with cart
  const user = await Customer.findById(userId).populate('cart.product');
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!user.cart?.length) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  // Re‑load latest product data and verify stock
  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of user.cart) {
    const product = await Product.findById(cartItem.product._id);
    if (!product) {
      return res.status(400).json({ success: false, message: `Product ${cartItem.product._id} no longer exists` });
    }
    if (product.stock < cartItem.quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }
    const itemTotal = product.price * cartItem.quantity;
    totalAmount += itemTotal;
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.image,
    });
  }

  // Create pending ShopKart order
  const shopOrder = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    totalAmount,
    paymentStatus: "PENDING",
    status: "PENDING_PAYMENT",
  });

  // Create Razorpay order (amount in paise)
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100), // paise
    currency: "INR",
    receipt: shopOrder._id.toString(),
  });

  // Save razorpayOrderId on ShopKart order
  shopOrder.razorpayOrderId = razorpayOrder.id;
  await shopOrder.save();

  res.json({
    success: true,
    shopKartOrderId: shopOrder._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment signature & finalize order
// @route   POST /orders/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment verification fields" });
  }

  const order = await Order.findById(shopKartOrderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Ensure the order belongs to the authenticated user
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  // Verify signature using stored razorpayOrderId
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    // Mark payment as failed but keep cart intact
    order.paymentStatus = "FAILED";
    order.status = "PENDING_PAYMENT";
    await order.save();
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  // Signature valid – mark order paid and clear cart
  order.paymentStatus = "PAID";
  order.status = "PLACED";
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  // Clear user cart
  const user = await Customer.findById(req.user._id);
  user.cart = [];
  await user.save();

  res.json({ success: true, message: "Payment verified and order placed", order });
});

// @desc    Get all orders for logged‑in user
// @route   GET /orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('items.product');
  res.json({ success: true, orders });
});

// @desc    Get single order (ownership enforced)
// @route   GET /orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  res.json({ success: true, order });
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};
