const assert = require('assert');
const mongoose = require('mongoose');
const Customer = require('./models/customer.model');
const Product = require('./models/product.model');
const cartController = require('./controllers/cart.controller');

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

async function runCartTests() {
  console.log('\n--- 1. Testing Customer Cart Schema ---');

  it('Customer model schema contains cart array with product and quantity', () => {
    const cust = new Customer({
      fullName: 'Cart Tester',
      email: 'cart@test.com',
      password: 'password123',
      phone: '9999999999',
      cart: [
        {
          product: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          quantity: 2,
        },
      ],
    });

    assert.ok(Array.isArray(cust.cart));
    assert.strictEqual(cust.cart.length, 1);
    assert.strictEqual(cust.cart[0].quantity, 2);
    assert.ok(cust.cart[0].product instanceof mongoose.Types.ObjectId);
  });

  console.log('\n--- 2. Testing Add to Cart Controller ---');

  await itAsync('addToCart rejects invalid product ID with 400', async () => {
    const req = {
      user: { _id: '507f1f77bcf86cd799439099' },
      params: { productId: 'invalid-id' },
    };
    const res = createMockRes();
    await cartController.addToCart(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.message, 'Invalid product ID');
  });

  await itAsync('addToCart returns 404 when product is missing', async () => {
    const origProdFind = Product.findById;
    Product.findById = async () => null;

    const req = {
      user: { _id: '507f1f77bcf86cd799439099' },
      params: { productId: '507f1f77bcf86cd799439011' },
    };
    const res = createMockRes();
    await cartController.addToCart(req, res);
    assert.strictEqual(res.statusCode, 404);

    Product.findById = origProdFind;
  });

  await itAsync('addToCart rejects out-of-stock product with 400', async () => {
    const productId = '507f1f77bcf86cd799439011';
    const fakeProduct = { _id: productId, name: 'Out Item', stock: 0 };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [],
      save: async () => true,
      populate: async () => true,
    };

    const origProd = Product.findById;
    const origCust = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await cartController.addToCart(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('out of stock'));

    Product.findById = origProd;
    Customer.findById = origCust;
  });

  await itAsync('addToCart adds new product with quantity = 1', async () => {
    const productId = '507f1f77bcf86cd799439022';
    const fakeProduct = { _id: productId, name: 'Stock Item', stock: 5 };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [],
      save: async () => true,
      populate: async function () {
        this.cart = [{ product: fakeProduct, quantity: 1 }];
      },
    };

    const origProd = Product.findById;
    const origCust = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await cartController.addToCart(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);

    Product.findById = origProd;
    Customer.findById = origCust;
  });

  await itAsync('addToCart increments quantity when item already in cart', async () => {
    const productId = '507f1f77bcf86cd799439022';
    const fakeProduct = { _id: productId, name: 'Stock Item', stock: 5 };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [{ product: new mongoose.Types.ObjectId(productId), quantity: 1 }],
      save: async () => true,
      populate: async function () {
        this.cart = [{ product: fakeProduct, quantity: 2 }];
      },
    };

    const origProd = Product.findById;
    const origCust = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await cartController.addToCart(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fakeCustomer.cart[0].quantity, 2);

    Product.findById = origProd;
    Customer.findById = origCust;
  });

  await itAsync('addToCart rejects if incrementing exceeds product stock', async () => {
    const productId = '507f1f77bcf86cd799439022';
    const fakeProduct = { _id: productId, name: 'Low Stock Item', stock: 2 };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [{ product: new mongoose.Types.ObjectId(productId), quantity: 2 }],
      save: async () => true,
      populate: async () => true,
    };

    const origProd = Product.findById;
    const origCust = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await cartController.addToCart(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('Available stock'));

    Product.findById = origProd;
    Customer.findById = origCust;
  });

  console.log('\n--- 3. Testing Update Quantity Controller ---');

  await itAsync('updateQuantity rejects quantity < 1 with 400', async () => {
    const req = {
      user: { _id: '507f1f77bcf86cd799439099' },
      params: { productId: '507f1f77bcf86cd799439011' },
      body: { quantity: 0 },
    };
    const res = createMockRes();
    await cartController.updateQuantity(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('at least 1'));
  });

  await itAsync('updateQuantity rejects quantity exceeding stock with 400', async () => {
    const productId = '507f1f77bcf86cd799439011';
    const fakeProduct = { _id: productId, stock: 3 };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [{ product: new mongoose.Types.ObjectId(productId), quantity: 1 }],
      save: async () => true,
      populate: async () => true,
    };

    const origProd = Product.findById;
    const origCust = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
      body: { quantity: 5 },
    };
    const res = createMockRes();
    await cartController.updateQuantity(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('exceeds available stock'));

    Product.findById = origProd;
    Customer.findById = origCust;
  });

  await itAsync('updateQuantity successfully updates quantity within stock', async () => {
    const productId = '507f1f77bcf86cd799439011';
    const fakeProduct = { _id: productId, stock: 10 };
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [{ product: new mongoose.Types.ObjectId(productId), quantity: 1 }],
      save: async () => true,
      populate: async () => true,
    };

    const origProd = Product.findById;
    const origCust = Customer.findById;
    Product.findById = async () => fakeProduct;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
      body: { quantity: 3 },
    };
    const res = createMockRes();
    await cartController.updateQuantity(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fakeCustomer.cart[0].quantity, 3);

    Product.findById = origProd;
    Customer.findById = origCust;
  });

  console.log('\n--- 4. Testing Remove from Cart Controller ---');

  await itAsync('removeFromCart removes product and returns 200', async () => {
    const productId = '507f1f77bcf86cd799439011';
    const fakeCustomer = {
      _id: '507f1f77bcf86cd799439099',
      cart: [{ product: new mongoose.Types.ObjectId(productId), quantity: 2 }],
      save: async () => true,
      populate: async () => true,
    };

    const origCust = Customer.findById;
    Customer.findById = async () => fakeCustomer;

    const req = {
      user: { _id: fakeCustomer._id },
      params: { productId },
    };
    const res = createMockRes();
    await cartController.removeFromCart(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fakeCustomer.cart.length, 0);

    Customer.findById = origCust;
  });

  console.log(`\nResults: ${passed}/${total} cart tests passed!`);
  if (passed === total) {
    console.log('🎉 ALL CART CONTROLLER & STOCK TESTS PASSED!\n');
  } else {
    process.exit(1);
  }
}

runCartTests();
