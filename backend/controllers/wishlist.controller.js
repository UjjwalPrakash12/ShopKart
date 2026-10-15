const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Task 2: Add Product to Wishlist API
// POST /wishlist/:productId
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Verify Product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find authenticated customer from JWT session
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Ensure wishlist array exists
    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Duplicate Prevention (Task 2 & Rubric)
    const alreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    // Add product reference to customer wishlist
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding to wishlist',
    });
  }
};

// Task 3: Get Current User's Wishlist (with populate)
// GET /wishlist
const getWishlist = async (req, res) => {
  try {
    // Find authenticated user and populate product references
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: '_id name price category image stock description',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Filter out any null entries in case a referenced product was deleted from DB
    const validProducts = (customer.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validProducts.length,
      wishlist: validProducts,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching wishlist',
    });
  }
};

// Task 4: Remove Product from Wishlist
// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check if product is present in wishlist
    const index = (customer.wishlist || []).findIndex(
      (id) => id && id.toString() === productId.toString()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    // Remove reference from array
    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing from wishlist',
    });
  }
};

// Bonus Challenge (+10 Marks): Wishlist Toggle API
// PATCH /wishlist/:productId/toggle
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    const index = customer.wishlist.findIndex(
      (id) => id && id.toString() === productId.toString()
    );

    if (index !== -1) {
      // Product exists -> remove
      customer.wishlist.splice(index, 1);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
      });
    } else {
      // Product does not exist -> add
      customer.wishlist.push(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: 'Product added to wishlist',
      });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while toggling wishlist',
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
