import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n--- 1. Verifying Lab 04 Required Files ---');

const requiredFiles = [
  'src/pages/Wishlist.jsx',
  'src/components/WishlistCard.jsx',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(__dirname, relPath);
  assert.ok(fs.existsSync(fullPath), `Missing file: ${relPath}`);
  console.log(`  ✅ Found ${relPath}`);
}

console.log('\n--- 2. Verifying Wishlist API Methods ---');
const apiCode = fs.readFileSync(path.join(__dirname, 'src/services/api.js'), 'utf8');
assert.ok(apiCode.includes('getWishlist'), 'api.js must export getWishlist');
assert.ok(apiCode.includes('addToWishlist'), 'api.js must export addToWishlist');
assert.ok(apiCode.includes('removeFromWishlist'), 'api.js must export removeFromWishlist');
assert.ok(apiCode.includes('toggleWishlist'), 'api.js must export toggleWishlist');
console.log('  ✅ api.js contains getWishlist, addToWishlist, removeFromWishlist, toggleWishlist');

console.log('\n--- 3. Verifying Routes in App.jsx ---');
const appCode = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
assert.ok(appCode.includes('path="/wishlist"'), 'App.jsx must route /wishlist');
console.log('  ✅ App.jsx contains /wishlist route');

console.log('\n--- 4. Verifying ProductCard Wishlist Integration ---');
const cardCode = fs.readFileSync(path.join(__dirname, 'src/components/ProductCard.jsx'), 'utf8');
assert.ok(cardCode.includes('Saving...'), 'ProductCard must have Saving... state');
assert.ok(cardCode.includes('Wishlist') || cardCode.includes('Wishlisted'), 'ProductCard must have Wishlist button');
assert.ok(cardCode.includes('toggleWishlist'), 'ProductCard must call toggleWishlist/addToWishlist');
console.log('  ✅ ProductCard integrates Wishlist action with saving and toggle states');

console.log('\n--- 5. Verifying Wishlist Page & 3 UI States ---');
const wishlistCode = fs.readFileSync(path.join(__dirname, 'src/pages/Wishlist.jsx'), 'utf8');
assert.ok(wishlistCode.includes('Loading your wishlist'), 'Wishlist.jsx must handle Loading state');
assert.ok(wishlistCode.includes('Your wishlist is empty'), 'Wishlist.jsx must handle Empty state');
assert.ok(wishlistCode.includes('Browse Products'), 'Wishlist.jsx must have Browse Products action in empty state');
assert.ok(wishlistCode.includes('Something went wrong'), 'Wishlist.jsx must handle Error state');
assert.ok(wishlistCode.includes('removeFromWishlist'), 'Wishlist.jsx must handle remove item action');
console.log('  ✅ Wishlist.jsx implements dynamic list, remove handler, and all 3 UI states');

console.log('\n--- 6. Verifying WishlistCard Specification ---');
const wishCardCode = fs.readFileSync(path.join(__dirname, 'src/components/WishlistCard.jsx'), 'utf8');
assert.ok(wishCardCode.includes('product.image'), 'WishlistCard must render product.image');
assert.ok(wishCardCode.includes('product.name'), 'WishlistCard must render product.name');
assert.ok(wishCardCode.includes('product.price'), 'WishlistCard must render product.price');
assert.ok(wishCardCode.includes('View Details'), 'WishlistCard must have View Details');
assert.ok(wishCardCode.includes('Remove'), 'WishlistCard must have Remove button');
console.log('  ✅ WishlistCard fulfills all field specifications');

console.log('\n--- 7. Verifying Navbar Wishlist Link & Dynamic Count ---');
const navCode = fs.readFileSync(path.join(__dirname, 'src/components/Navbar.jsx'), 'utf8');
assert.ok(navCode.includes('/wishlist'), 'Navbar must link to /wishlist');
assert.ok(navCode.includes('wishlistCount'), 'Navbar must display dynamic wishlist count');
console.log('  ✅ Navbar integrates Wishlist link and dynamic count (Bonus +5)');

console.log('\n🎉 ALL FRONTEND LAB 04 VERIFICATION CHECKS PASSED!\n');
