const assert = require('assert');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Customer = require('./models/customer.model');
const generateTokenAndSetCookie = require('./utils/generateToken');
const { protectRoute } = require('./middlewares/auth.middleware');
const customerController = require('./controllers/customer.controller');

process.env.JWT_SECRET = 'test_jwt_secret_12345';
process.env.NODE_ENV = 'development';

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

// Mock Express response helper
function createMockRes() {
  const res = {
    statusCode: 200,
    cookies: {},
    clearedCookies: [],
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    cookie(name, val, options) {
      this.cookies[name] = { val, options };
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log('\n--- 1. Testing Customer Model & Security ---');

  await itAsync('Model hashes password on save and compares correctly', async () => {
    const cust = new Customer({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'plainpassword123',
      phone: '1234567890',
    });

    await new Promise((resolve, reject) => {
      Customer.schema.s.hooks.execPre('save', cust, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    assert.notStrictEqual(cust.password, 'plainpassword123');
    assert.ok(cust.password.startsWith('$2'));

    const match = await cust.comparePassword('plainpassword123');
    assert.strictEqual(match, true);

    const wrongMatch = await cust.comparePassword('wrongpassword');
    assert.strictEqual(wrongMatch, false);
  });

  it('Model toJSON strips password and __v', () => {
    const cust = new Customer({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secretpassword',
      phone: '9876543210',
    });
    const json = cust.toJSON();
    assert.strictEqual(json.password, undefined);
    assert.strictEqual(json.__v, undefined);
    assert.strictEqual(json.fullName, 'Jane Doe');
  });

  console.log('\n--- 2. Testing JWT & Cookie Generation ---');

  it('generateTokenAndSetCookie creates valid JWT with HttpOnly flag', () => {
    const res = createMockRes();
    const customerId = '654321654321654321654321';
    const token = generateTokenAndSetCookie(res, customerId);

    assert.ok(token, 'Token must be returned');
    assert.ok(res.cookies.token, 'Cookie "token" must be set');
    assert.strictEqual(res.cookies.token.options.httpOnly, true);
    assert.strictEqual(res.cookies.token.options.sameSite, 'strict');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, customerId);
  });

  console.log('\n--- 3. Testing Authentication Middleware ---');

  await itAsync('protectRoute rejects request without token with 401', async () => {
    const req = { cookies: {} };
    const res = createMockRes();
    let nextCalled = false;
    await protectRoute(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
  });

  await itAsync('protectRoute rejects invalid token with 401', async () => {
    const req = { cookies: { token: 'invalid.jwt.token' } };
    const res = createMockRes();
    let nextCalled = false;
    await protectRoute(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
  });

  console.log('\n--- 4. Testing Customer Registration Controller ---');

  await itAsync('Register rejects missing fields with 400', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = createMockRes();
    await customerController.register(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
  });

  await itAsync('Register rejects password shorter than 6 characters with 400', async () => {
    const req = {
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: '123',
        phone: '9999999999',
      },
    };
    const res = createMockRes();
    await customerController.register(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.jsonData.message.includes('6 characters'));
  });

  console.log('\n--- 5. Testing Customer Login Controller ---');

  await itAsync('Login rejects missing email or password with 400', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = createMockRes();
    await customerController.login(req, res);

    assert.strictEqual(res.statusCode, 400);
  });

  console.log('\n--- 6. Testing Profile, Logout, & Change Password ---');

  it('getProfile returns sanitized user details', async () => {
    const req = {
      user: {
        _id: 'cust123',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      },
    };
    const res = createMockRes();
    await customerController.getProfile(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.fullName, 'John Doe');
    assert.strictEqual(res.jsonData.password, undefined);
  });

  it('logout clears authentication cookie and returns 200', async () => {
    const req = {};
    const res = createMockRes();
    await customerController.logout(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.success, true);
    assert.strictEqual(res.clearedCookies[0].name, 'token');
  });

  await itAsync('changePassword rejects missing passwords with 400', async () => {
    const req = {
      user: { _id: 'cust123' },
      body: { oldPassword: 'old' },
    };
    const res = createMockRes();
    await customerController.changePassword(req, res);

    assert.strictEqual(res.statusCode, 400);
  });

  await itAsync('changePassword rejects new password shorter than 6 chars with 400', async () => {
    const req = {
      user: { _id: 'cust123' },
      body: { oldPassword: 'oldpassword123', newPassword: '123' },
    };
    const res = createMockRes();
    await customerController.changePassword(req, res);

    assert.strictEqual(res.statusCode, 400);
  });

  console.log(`\nResults: ${passed}/${total} tests passed!`);
  if (passed === total) {
    console.log('🎉 All authentication and security unit tests PASSED successfully!\n');
  } else {
    process.exit(1);
  }
}

runTests();
