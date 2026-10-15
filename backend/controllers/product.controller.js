const mongoose = require('mongoose');
const Product = require('../models/product.model');

// Task 2: Create Product API
// POST /products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Validation: Missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validation: Price must be greater than 0
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than 0',
      });
    }

    // Validation: Stock cannot be negative
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    await product.save();

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating product',
    });
  }
};

// Task 3 & 5: Get All Products API (with Search, Category Filtering, & Bonus Sorting)
// GET /products?search=...&category=...&sort=...
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    // Dynamically build MongoDB query
    const query = {};

    // Task 5: Case-insensitive search on product name
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Task 5: Category filtering
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all categories') {
      query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Bonus Challenge (+10 Marks): Sorting by price
    const sortOption = {};
    if (sort === 'price_asc') {
      sortOption.price = 1;
    } else if (sort === 'price_desc') {
      sortOption.price = -1;
    } else {
      sortOption.createdAt = -1; // Default: newest first
    }

    const products = await Product.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products',
    });
  }
};

// Task 4: Get Single Product API
// GET /products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Failure Case: Invalid product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    // Failure Case: Product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product',
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
