const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protectRoute } = require('../middlewares/auth.middleware');

// All Wishlist endpoints are protected
router.use(protectRoute);

// Task 2: Add Product to Wishlist
router.post('/:productId', wishlistController.addToWishlist);

// Task 3: Get Current User's Wishlist
router.get('/', wishlistController.getWishlist);

// Task 4: Remove Product from Wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

// Bonus Challenge (+10 Marks): Wishlist Toggle API
router.patch('/:productId/toggle', wishlistController.toggleWishlist);

module.exports = router;
