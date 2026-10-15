const assert = require('assert');
const mongoose = require('mongoose');
const Product = require('./models/product.model');
const productController = require('./controllers/product.controller');

let passed = 0;
let total = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
  }
}

async function itAsync(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}:`, err.message);
  }
}

function createMockRes() {
  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

async function runProductTests() {
  console.log('\n--- 1. Testing Product Model Validation ---');

  it('Product model rejects missing fields', () => {
    const p = new Product({});
    const err = p.validateSync();
    assert.ok(err, 'Validation error expected');
    assert.ok(err.errors.name);
    assert.ok(err.errors.description);
    assert.ok(err.errors.price);
    assert.ok(err.errors.category);
    assert.ok(err.errors.image);
    assert.ok(err.errors.stock);
  });

  it('Product model rejects price <= 0 and negative stock', () => {
    const p = new Product({
      name: 'Test',
      description: 'Desc',
      price: 0,
      category: 'Electronics',
      image: 'test.jpg',
      stock: -5,
    });
    const err = p.validateSync();
    assert.ok(err);
    assert.ok(err.errors.price);
    assert.ok(err.errors.stock);
  });

  it('Product model accepts valid data with automatic createdAt', () => {
    const p = new Product({
      name: 'Noise Cancelling Headphones',
      description: 'Wireless over-ear headphones with ANC',
      price: 4999,
      category: 'Electronics',
      image: 'https://example.com/headphones.jpg',
      stock: 25,
    });
    const err = p.validateSync();
    assert.strictEqual(err, undefined);
    assert.ok(p.createdAt instanceof Date);
  });

  console.log('\n--- 2. Testing Create Product Controller ---');

  await itAsync('createProduct rejects missing fields with 400', async () => {
    const req = { body: { name: 'Keyboard' } };
    const res = createMockRes();
    await productController.createProduct(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
  });

  await itAsync('createProduct rejects invalid price with 400', async () => {
    const req = {
      body: {
        name: 'Keyboard',
        description: 'RGB',
        price: -100,
        category: 'Electronics',
        image: 'img.jpg',
        stock: 5,
      },
    };
    const res = createMockRes();
    await productController.createProduct(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('Price'));
  });

  await itAsync('createProduct rejects negative stock with 400', async () => {
    const req = {
      body: {
        name: 'Keyboard',
        description: 'RGB',
        price: 2999,
        category: 'Electronics',
        image: 'img.jpg',
        stock: -1,
      },
    };
    const res = createMockRes();
    await productController.createProduct(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('Stock'));
  });

  console.log('\n--- 3. Testing Get Single Product by ID Controller ---');

  await itAsync('getProductById rejects invalid ObjectId with 400', async () => {
    const req = { params: { id: 'invalid-id-123' } };
    const res = createMockRes();
    await productController.getProductById(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message, 'Invalid product ID');
  });

  await itAsync('getProductById returns 404 when product is not found', async () => {
    const origFindById = Product.findById;
    Product.findById = async () => null;

    const req = { params: { id: '507f1f77bcf86cd799439011' } };
    const res = createMockRes();
    await productController.getProductById(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.jsonData.message, 'Product not found');

    Product.findById = origFindById;
  });

  await itAsync('getProductById returns 200 and product when found', async () => {
    const mockProduct = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Mechanical Keyboard',
      price: 2999,
    };
    const origFindById = Product.findById;
    Product.findById = async () => mockProduct;

    const req = { params: { id: '507f1f77bcf86cd799439011' } };
    const res = createMockRes();
    await productController.getProductById(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.name, 'Mechanical Keyboard');

    Product.findById = origFindById;
  });

  console.log('\n--- 4. Testing Get Products (Filter & Sort) Controller ---');

  await itAsync('getProducts queries with search, category, and sort params', async () => {
    let capturedQuery = null;
    let capturedSort = null;

    const origFind = Product.find;
    Product.find = (q) => {
      capturedQuery = q;
      return {
        sort: (s) => {
          capturedSort = s;
          return Promise.resolve([
            { _id: '1', name: 'Mechanical Keyboard', price: 2999, category: 'Electronics' },
          ]);
        },
      };
    };

    const req = {
      query: {
        search: 'keyboard',
        category: 'Electronics',
        sort: 'price_asc',
      },
    };
    const res = createMockRes();
    await productController.getProducts(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.count, 1);
    assert.ok(capturedQuery.name.$regex);
    assert.ok(capturedQuery.category.$regex);
    assert.strictEqual(capturedSort.price, 1);

    Product.find = origFind;
  });

  console.log(`\nResults: ${passed}/${total} product tests passed!`);
  if (passed === total) {
    console.log('🎉 ALL PRODUCT CONTROLLER & SCHEMA TESTS PASSED!\n');
  } else {
    process.exit(1);
  }
}

runProductTests();
