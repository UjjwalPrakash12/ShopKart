const assert = require('assert');
const mongoose = require('mongoose');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');
const wishlistController = require('./controllers/wishlist.controller');

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

async function runWishlistTests() {
  console.log('\n--- 1. Testing Customer Wishlist Schema ---');

  it('Customer model schema contains wishlist array of ObjectIds', () => {
    const cust = new Customer({
      fullName: 'Test User',
      email: 'wishlist@test.com',
      password: 'password123',
      phone: '1234567890',
      wishlist: ['507f1f77bcf86cd799439011'],
    });

    assert.ok(Array.isArray(cust.wishlist));
    assert.strictEqual(cust.wishlist.length, 1);
    assert.ok(cust.wishlist[0] instanceof mongoose.Types.ObjectId);
  });

  console.log('\n--- 2. Testing Add to Wishlist Controller ---');

  await itAsync('addToWishlist rejects invalid product ID format with 400', async () => {
    const req = {
      user: { _id: '507f1f77bcf86cd799439099' },
      params: { productId: 'invalid-id' },
    };
    const res = createMockRes();
    await wishlistController.addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message, 'Invalid product ID');
  });

  await itAsync('addToWishlist returns 404 when product does not exist in DB', async () => {
    const origFindById = Product.findById;
    Product.findById = async () => null;

    const req = {
      user: { _id: '507f1f77bcf86cd799439099' },
      params: { productId: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();
    await wishlistController.addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.jsonData.message, 'Product not found');

    Product.findById = origFindById;
  });

  await itAsync('addToWishlist rejects duplicate product with 409 Conflict', async () => {
    const productId = '507f1f77bcf86cd799439011';
    const fakeProduct = { _id: productId, name: 'Sample Item' };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      wishlist: [new mongoose.Types.ObjectId(productId)],
      save: async () => true,
    };

    const origProdFind = Product.findById;
    const origCustFind = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await wishlistController.addToWishlist(req, res);

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.jsonData.message, 'Product already in wishlist');

    Product.findById = origProdFind;
    Customer.findById = origCustFind;
  });

  await itAsync('addToWishlist successfully adds product and returns 201', async () => {
    const productId = '507f1f77bcf86cd799439022';
    const fakeProduct = { _id: productId, name: 'Sample Item' };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      wishlist: [],
      save: async () => true,
    };

    const origProdFind = Product.findById;
    const origCustFind = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await wishlistController.addToWishlist(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.message, 'Product added to wishlist');
    assert.strictEqual(fakeCustomer.wishlist.length, 1);

    Product.findById = origProdFind;
    Customer.findById = origCustFind;
  });

  console.log('\n--- 3. Testing Get Current User Wishlist Controller ---');

  await itAsync('getWishlist populates product references and returns count', async () => {
    const populatedItems = [
      { _id: '1', name: 'Item 1', price: 100 },
      { _id: '2', name: 'Item 2', price: 200 },
    ];

    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      wishlist: populatedItems,
    };

    const origCustFind = Customer.findById;
    Customer.findById = (id) => ({
      populate: async () => fakeCustomer,
    });

    const req = { user: { _id: '507f1f77bcf86cd799439099' } };
    const res = createMockRes();
    await wishlistController.getWishlist(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.jsonData.count, 2);
    assert.strictEqual(res.jsonData.wishlist.length, 2);

    Customer.findById = origCustFind;
  });

  console.log('\n--- 4. Testing Remove from Wishlist Controller ---');

  await itAsync('removeFromWishlist returns 404 when product is not in wishlist', async () => {
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      wishlist: [new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')],
      save: async () => true,
    };

    const origCustFind = Customer.findById;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId: '507f1f77bcf86cd799439099' },
    };
    const res = createMockRes();
    await wishlistController.removeFromWishlist(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.jsonData.message, 'Product not in wishlist');

    Customer.findById = origCustFind;
  });

  await itAsync('removeFromWishlist removes product and returns 200', async () => {
    const targetId = '507f1f77bcf86cd799439011';
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      wishlist: [new mongoose.Types.ObjectId(targetId)],
      save: async () => true,
    };

    const origCustFind = Customer.findById;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId: targetId },
    };
    const res = createMockRes();
    await wishlistController.removeFromWishlist(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(fakeCustomer.wishlist.length, 0);

    Customer.findById = origCustFind;
  });

  console.log('\n--- 5. Testing Toggle Wishlist Controller (Bonus +10) ---');

  await itAsync('toggleWishlist removes if present and adds if absent', async () => {
    const targetId = '507f1f77bcf86cd799439011';
    const fakeProduct = { _id: targetId, name: 'Toggled Item' };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      wishlist: [],
      save: async () => true,
    };

    const origProdFind = Product.findById;
    const origCustFind = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId: targetId },
    };

    // 1st toggle: absent -> should add
    let res = createMockRes();
    await wishlistController.toggleWishlist(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.saved, true);
    assert.strictEqual(fakeCustomer.wishlist.length, 1);

    // 2nd toggle: present -> should remove
    res = createMockRes();
    await wishlistController.toggleWishlist(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.saved, false);
    assert.strictEqual(fakeCustomer.wishlist.length, 0);

    Product.findById = origProdFind;
    Customer.findById = origCustFind;
  });

  console.log(`\nResults: ${passed}/${total} wishlist tests passed!`);
  if (passed === total) {
    console.log('🎉 ALL WISHLIST CONTROLLER & RELATIONSHIP TESTS PASSED!\n');
  } else {
    process.exit(1);
  }
}

runWishlistTests();
