const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Task 2: Add Product to Cart API
// POST /cart/:productId
const addToCart = async (req, res) => {
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

    // Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if product is already in the cart
    const cartItemIndex = customer.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (cartItemIndex === -1) {
      // Not in cart -> Add with quantity = 1
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Product is currently out of stock',
        });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    } else {
      // Already in cart -> Increment existing quantity by 1
      const newQuantity = customer.cart[cartItemIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Available stock is ${product.stock}`,
        });
      }
      customer.cart[cartItemIndex].quantity = newQuantity;
    }

    await customer.save();
    await customer.populate({
      path: 'cart.product',
      select: '_id name price image stock category',
    });

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: validCart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding to cart',
    });
  }
};

// Task 3: Get Current User Cart
// GET /cart
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: '_id name price image stock category',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cart',
    });
  }
};

// Task 4: Update Product Quantity
// PATCH /cart/:productId
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Validate quantity is a number and >= 1
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number and at least 1',
      });
    }

    // Check product in DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Find customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Find product entry in cart
    const cartItem = (customer.cart || []).find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    // Validate requested quantity does not exceed product stock
    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock})`,
      });
    }

    cartItem.quantity = numQty;
    await customer.save();
    await customer.populate({
      path: 'cart.product',
      select: '_id name price image stock category',
    });

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Quantity updated',
      cart: validCart,
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating quantity',
    });
  }
};

// Task 5: Remove Product from Cart
// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

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

    const index = (customer.cart || []).findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    customer.cart.splice(index, 1);
    await customer.save();
    await customer.populate({
      path: 'cart.product',
      select: '_id name price image stock category',
    });

    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: validCart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing from cart',
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
};
