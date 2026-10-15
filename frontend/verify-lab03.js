import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n--- 1. Verifying Lab 03 Required Files ---');

const requiredFiles = [
  'src/pages/Products.jsx',
  'src/pages/ProductDetails.jsx',
  'src/components/ProductCard.jsx',
  'src/components/SearchBar.jsx',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(__dirname, relPath);
  assert.ok(fs.existsSync(fullPath), `Missing file: ${relPath}`);
  console.log(`  ✅ Found ${relPath}`);
}

console.log('\n--- 2. Verifying Product Discovery API Methods ---');
const apiCode = fs.readFileSync(path.join(__dirname, 'src/services/api.js'), 'utf8');
assert.ok(apiCode.includes('getProducts'), 'api.js must export getProducts');
assert.ok(apiCode.includes('getProductById'), 'api.js must export getProductById');
assert.ok(apiCode.includes('createProduct'), 'api.js must export createProduct');
console.log('  ✅ api.js contains getProducts, getProductById, createProduct');

console.log('\n--- 3. Verifying Routes in App.jsx ---');
const appCode = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
assert.ok(appCode.includes('path="/products"'), 'App.jsx must route /products');
assert.ok(appCode.includes('path="/products/:id"'), 'App.jsx must route /products/:id');
console.log('  ✅ App.jsx contains /products and dynamic /products/:id');

console.log('\n--- 4. Verifying SearchBar Categories & Sorting ---');
const searchCode = fs.readFileSync(path.join(__dirname, 'src/components/SearchBar.jsx'), 'utf8');
assert.ok(searchCode.includes('Electronics'), 'SearchBar must include Electronics category');
assert.ok(searchCode.includes('Fashion'), 'SearchBar must include Fashion category');
assert.ok(searchCode.includes('Books'), 'SearchBar must include Books category');
assert.ok(searchCode.includes('Home'), 'SearchBar must include Home category');
assert.ok(searchCode.includes('price_asc'), 'SearchBar must include price_asc sort (Bonus)');
assert.ok(searchCode.includes('price_desc'), 'SearchBar must include price_desc sort (Bonus)');
console.log('  ✅ SearchBar has all categories and bonus price sorting options');

console.log('\n--- 5. Verifying Product Listing & States ---');
const productsCode = fs.readFileSync(path.join(__dirname, 'src/pages/Products.jsx'), 'utf8');
assert.ok(productsCode.includes('.map('), 'Products.jsx must dynamically render with .map()');
assert.ok(productsCode.includes('Loading products'), 'Products.jsx must handle loading state');
assert.ok(productsCode.includes('Something went wrong'), 'Products.jsx must handle error state');
assert.ok(productsCode.includes('No products found'), 'Products.jsx must handle empty state');
console.log('  ✅ Products.jsx implements .map() list rendering and all 3 UI states');

console.log('\n--- 6. Verifying Product Details Page ---');
const detailsCode = fs.readFileSync(path.join(__dirname, 'src/pages/ProductDetails.jsx'), 'utf8');
assert.ok(detailsCode.includes('useParams'), 'ProductDetails must use useParams()');
assert.ok(detailsCode.includes('Add to Cart'), 'ProductDetails must have Add to Cart button');
assert.ok(detailsCode.includes('Back to Products'), 'ProductDetails must have Back to Products navigation');
console.log('  ✅ ProductDetails handles dynamic ID, product rendering, and Add to Cart action');

console.log('\n🎉 ALL FRONTEND LAB 03 VERIFICATION CHECKS PASSED!\n');
