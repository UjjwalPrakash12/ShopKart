const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Task 2: Create Product
router.post('/', productController.createProduct);

// Task 3 & 5: Get All Products (supports ?search=..., ?category=..., ?sort=...)
router.get('/', productController.getProducts);

// Task 4: Get Single Product by ID
router.get('/:id', productController.getProductById);

module.exports = router;
