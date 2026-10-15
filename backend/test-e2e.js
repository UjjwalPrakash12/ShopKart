const assert = require('assert');
const http = require('http');
const Customer = require('./models/customer.model');
const app = require('./index');

let server;
let baseUrl;

async function runE2ETests() {
  console.log('\n--- End-to-End HTTP Routes & Cookie Verification ---');

  // Start app on ephemeral port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.status, 'Healthy');
    console.log('  ✅ GET / returns 200 Healthy');

    // 2. POST /customers/register - missing fields
    const regFailRes = await fetch(`${baseUrl}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad@test.com' }),
    });
    assert.strictEqual(regFailRes.status, 400);
    const regFailJson = await regFailRes.json();
    assert.strictEqual(regFailJson.success, false);
    console.log('  ✅ POST /customers/register returns 400 on missing fields');

    // 3. POST /customers/register - short password
    const regShortPassRes = await fetch(`${baseUrl}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        password: '123',
        phone: '9876543210',
      }),
    });
    assert.strictEqual(regShortPassRes.status, 400);
    console.log('  ✅ POST /customers/register returns 400 on short password');

    // 4. POST /customers/login - invalid credentials
    // Mock Customer.findOne to return null
    const origFindOne = Customer.findOne;
    Customer.findOne = async () => null;

    const loginFailRes = await fetch(`${baseUrl}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      }),
    });
    assert.strictEqual(loginFailRes.status, 401);
    const loginFailJson = await loginFailRes.json();
    assert.strictEqual(loginFailJson.message, 'Invalid credentials');
    console.log('  ✅ POST /customers/login returns 401 with generic "Invalid credentials"');

    // 5. POST /customers/login - successful login sets HttpOnly cookie
    const fakeCustomer = new Customer({
      _id: '507f1f77bcf86cd799439011',
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'plainpassword123',
      phone: '9876543210',
    });
    // simulate password hashing
    fakeCustomer.password = '$2b$10$wK1m...'; // fake hash
    fakeCustomer.comparePassword = async (pwd) => pwd === 'plainpassword123';

    Customer.findOne = async () => fakeCustomer;

    const loginSuccessRes = await fetch(`${baseUrl}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'plainpassword123',
      }),
    });
    assert.strictEqual(loginSuccessRes.status, 200);
    const cookieHeader = loginSuccessRes.headers.get('set-cookie');
    assert.ok(cookieHeader, 'Set-Cookie header must be present');
    assert.ok(cookieHeader.includes('token='), 'Token cookie must be set');
    assert.ok(cookieHeader.toLowerCase().includes('httponly'), 'Cookie must be HttpOnly');
    console.log('  ✅ POST /customers/login returns 200 and sets HttpOnly cookie');

    // Extract cookie for authenticated requests
    const cookieToken = cookieHeader.split(';')[0];

    // 6. GET /customers/me - Unauthorized without cookie
    const meNoAuthRes = await fetch(`${baseUrl}/customers/me`);
    assert.strictEqual(meNoAuthRes.status, 401);
    console.log('  ✅ GET /customers/me returns 401 without cookie');

    // 7. GET /customers/me - Authorized with cookie
    const origFindById = Customer.findById;
    const mockQuery = (val) => ({
      select: () => Promise.resolve(val),
      then: (resolve, reject) => Promise.resolve(val).then(resolve, reject),
    });

    Customer.findById = (id) => mockQuery(fakeCustomer);

    const meAuthRes = await fetch(`${baseUrl}/customers/me`, {
      headers: { Cookie: cookieToken },
    });
    assert.strictEqual(meAuthRes.status, 200);
    const meJson = await meAuthRes.json();
    assert.strictEqual(meJson.fullName, 'John Doe');
    assert.strictEqual(meJson.password, undefined);
    console.log('  ✅ GET /customers/me returns 200 with customer profile (password hidden)');

    // 8. PATCH /customers/change-password - bonus challenge
    fakeCustomer.save = async () => true;
    fakeCustomer.comparePassword = async (pwd) => pwd === 'oldpassword123';
    Customer.findById = () => mockQuery(fakeCustomer);

    const changePassRes = await fetch(`${baseUrl}/customers/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieToken,
      },
      body: JSON.stringify({
        oldPassword: 'oldpassword123',
        newPassword: 'newsecurepassword456',
      }),
    });
    assert.strictEqual(changePassRes.status, 200);
    const changePassJson = await changePassRes.json();
    assert.strictEqual(changePassJson.success, true);
    assert.strictEqual(changePassJson.message, 'Password changed successfully');
    console.log('  ✅ PATCH /customers/change-password returns 200 (Bonus challenge)');

    // 9. POST /customers/logout - clears cookie
    const logoutRes = await fetch(`${baseUrl}/customers/logout`, {
      method: 'POST',
      headers: { Cookie: cookieToken },
    });
    assert.strictEqual(logoutRes.status, 200);
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert.ok(logoutCookie.includes('token=;') || logoutCookie.includes('Expires='), 'Cookie must be cleared');
    console.log('  ✅ POST /customers/logout returns 200 and clears token cookie');

    // Restore Customer methods
    Customer.findOne = origFindOne;
    Customer.findById = origFindById;

    console.log('\n🎉 ALL END-TO-END HTTP TESTS PASSED PERFECTLY!\n');
  } finally {
    server.close();
  }
}

runE2ETests().catch((err) => {
  console.error('E2E test failed:', err);
  if (server) server.close();
  process.exit(1);
});
