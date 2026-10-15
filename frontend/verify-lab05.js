import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n--- 1. Verifying Lab 05 Required Files ---');

const requiredFiles = [
  'src/pages/Cart.jsx',
  'src/components/CartItem.jsx',
  'src/context/CartContext.jsx',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(__dirname, relPath);
  assert.ok(fs.existsSync(fullPath), `Missing file: ${relPath}`);
  console.log(`  ✅ Found ${relPath}`);
}

console.log('\n--- 2. Verifying Cart API Methods ---');
const apiCode = fs.readFileSync(path.join(__dirname, 'src/services/api.js'), 'utf8');
assert.ok(apiCode.includes('getCart'), 'api.js must export getCart');
assert.ok(apiCode.includes('addToCart'), 'api.js must export addToCart');
assert.ok(apiCode.includes('updateCartQuantity'), 'api.js must export updateCartQuantity');
assert.ok(apiCode.includes('removeFromCart'), 'api.js must export removeFromCart');
console.log('  ✅ api.js contains getCart, addToCart, updateCartQuantity, removeFromCart');

console.log('\n--- 3. Verifying CartContext & Derived State ---');
const contextCode = fs.readFileSync(path.join(__dirname, 'src/context/CartContext.jsx'), 'utf8');
assert.ok(contextCode.includes('totalUnits'), 'CartContext must calculate derived totalUnits');
assert.ok(contextCode.includes('subtotal'), 'CartContext must calculate derived subtotal');
assert.ok(contextCode.includes('useCart'), 'CartContext must export useCart hook');
assert.ok(contextCode.includes('CartProvider'), 'CartContext must export CartProvider');
console.log('  ✅ CartContext exports CartProvider, useCart, and calculates derived totals');

console.log('\n--- 4. Verifying Cart Page & 3 UI States ---');
const cartPageCode = fs.readFileSync(path.join(__dirname, 'src/pages/Cart.jsx'), 'utf8');
assert.ok(cartPageCode.includes('Loading your cart'), 'Cart.jsx must handle Loading state');
assert.ok(cartPageCode.includes('Your cart is empty'), 'Cart.jsx must handle Empty state');
assert.ok(cartPageCode.includes('Unable to load your cart'), 'Cart.jsx must handle Error state');
assert.ok(cartPageCode.includes('Order Summary'), 'Cart.jsx must include Order Summary');
assert.ok(cartPageCode.includes('Proceed to Checkout'), 'Cart.jsx must include Proceed to Checkout action');
console.log('  ✅ Cart.jsx implements Order Summary and all 3 UI states');

console.log('\n--- 5. Verifying CartItem Quantity Controls ---');
const itemCode = fs.readFileSync(path.join(__dirname, 'src/components/CartItem.jsx'), 'utf8');
assert.ok(itemCode.includes('handleIncrement'), 'CartItem must handle quantity increment');
assert.ok(itemCode.includes('handleDecrement'), 'CartItem must handle quantity decrement');
assert.ok(itemCode.includes('handleRemove'), 'CartItem must handle remove action');
console.log('  ✅ CartItem provides quantity controls [-] N [+] and remove action');

console.log('\n--- 6. Verifying ProductCard Cart Integration ---');
const cardCode = fs.readFileSync(path.join(__dirname, 'src/components/ProductCard.jsx'), 'utf8');
assert.ok(cardCode.includes('Add to Cart'), 'ProductCard must have Add to Cart action');
assert.ok(cardCode.includes('useCart'), 'ProductCard must consume useCart');
console.log('  ✅ ProductCard integrates Add to Cart connected to global cart state');

console.log('\n--- 7. Verifying Navbar Dynamic Cart Count ---');
const navCode = fs.readFileSync(path.join(__dirname, 'src/components/Navbar.jsx'), 'utf8');
assert.ok(navCode.includes('useCart'), 'Navbar must consume useCart');
assert.ok(navCode.includes('/cart'), 'Navbar must route to /cart');
assert.ok(navCode.includes('totalUnits'), 'Navbar must display dynamic totalUnits');
console.log('  ✅ Navbar dynamically displays synchronized totalUnits cart count');

console.log('\n--- 8. Verifying App.jsx CartProvider & Route ---');
const appCode = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
assert.ok(appCode.includes('CartProvider'), 'App.jsx must wrap application with CartProvider');
assert.ok(appCode.includes('path="/cart"'), 'App.jsx must register /cart route');
console.log('  ✅ App.jsx wraps with CartProvider and registers /cart route');

console.log('\n🎉 ALL FRONTEND LAB 05 VERIFICATION CHECKS PASSED!\n');
