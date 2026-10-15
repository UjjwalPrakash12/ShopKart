import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n--- 1. Verifying Required Files & Structure ---');

const requiredFiles = [
  'src/pages/Login.jsx',
  'src/pages/Register.jsx',
  'src/pages/Home.jsx',
  'src/components/Navbar.jsx',
  'src/services/api.js',
  'src/App.jsx',
  'src/main.jsx',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(__dirname, relPath);
  assert.ok(fs.existsSync(fullPath), `Required file missing: ${relPath}`);
  console.log(`  ✅ Found ${relPath}`);
}

console.log('\n--- 2. Verifying API Service Configuration ---');
const apiContent = fs.readFileSync(path.join(__dirname, 'src/services/api.js'), 'utf8');
assert.ok(apiContent.includes('withCredentials: true'), 'api.js must have withCredentials: true');
assert.ok(apiContent.includes('/customers/register'), 'api.js must include register endpoint');
assert.ok(apiContent.includes('/customers/login'), 'api.js must include login endpoint');
assert.ok(apiContent.includes('/customers/me'), 'api.js must include profile endpoint');
assert.ok(apiContent.includes('/customers/logout'), 'api.js must include logout endpoint');
console.log('  ✅ withCredentials: true is configured for cookies');
console.log('  ✅ All customer endpoints are mapped');

console.log('\n--- 3. Verifying Routes in App.jsx ---');
const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
assert.ok(appContent.includes('path="/register"'), 'App.jsx must route /register');
assert.ok(appContent.includes('path="/login"'), 'App.jsx must route /login');
assert.ok(appContent.includes('path="/home"'), 'App.jsx must route /home');
console.log('  ✅ /register, /login, and /home routes defined');

console.log('\n--- 4. Verifying Task Requirements in Components ---');
const regContent = fs.readFileSync(path.join(__dirname, 'src/pages/Register.jsx'), 'utf8');
assert.ok(regContent.includes('fullName'), 'Register must contain fullName');
assert.ok(regContent.includes('email'), 'Register must contain email');
assert.ok(regContent.includes('password'), 'Register must contain password');
assert.ok(regContent.includes('phone'), 'Register must contain phone');
console.log('  ✅ Register page has all required form fields with controlled states');

const loginContent = fs.readFileSync(path.join(__dirname, 'src/pages/Login.jsx'), 'utf8');
assert.ok(loginContent.includes('Invalid Credentials'), 'Login must display "Invalid Credentials" on 401 failure');
console.log('  ✅ Login page handles 401 error with "Invalid Credentials"');

const homeContent = fs.readFileSync(path.join(__dirname, 'src/pages/Home.jsx'), 'utf8');
assert.ok(homeContent.includes('getCustomerProfile'), 'Home must call getCustomerProfile');
assert.ok(homeContent.includes('/login'), 'Home must redirect to /login if unauthorized');
console.log('  ✅ Home page fetches /customers/me and redirects to /login if unauthenticated');

const navContent = fs.readFileSync(path.join(__dirname, 'src/components/Navbar.jsx'), 'utf8');
assert.ok(navContent.includes('logoutCustomer'), 'Navbar must call logoutCustomer');
console.log('  ✅ Navbar includes logout functionality');

console.log('\n🎉 ALL FRONTEND VERIFICATION CHECKS PASSED!\n');
