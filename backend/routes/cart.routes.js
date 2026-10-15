const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// All Cart routes require authentication
router.use(protectRoute);

// Task 2: Add Product to Cart
router.post('/:productId', cartController.addToCart);

// Task 3: Get Current User Cart
router.get('/', cartController.getCart);

// Task 4: Update Product Quantity
router.patch('/:productId', cartController.updateQuantity);

// Task 5: Remove Product from Cart
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
