# ShopKart Lab 03 — TA Viva Preparation Guide

Complete, high-scoring answers to all 8 Viva questions for Lab 03: Product Catalog & Discovery.

---

### 1. Why should product data come from MongoDB instead of being hardcoded in React?
- **Dynamic Updates & Centralization:** Hardcoding data in React requires modifying frontend source code and redeploying the app every time a price changes, stock updates, or a product is added/removed.
- **Single Source of Truth:** Storing products in MongoDB allows multiple services (website, mobile app, inventory management, order processing) to query and update consistent, persistent, real-time data.
- **Scalability & Security:** MongoDB easily handles hundreds of thousands of items, indexing, and complex queries, which would severely bloat client-side bundle size and compromise sensitive data.

---

### 2. What is the difference between a URL parameter and a query parameter?
- **URL Parameter (Path Variable):**
  - Identifies a specific unique resource in the hierarchy.
  - Defined in routes using a colon (e.g. `/products/:id`).
  - Read in React via `useParams()`.
  - *Example:* `/products/66d123abc456` references one specific product.
- **Query Parameter:**
  - Used for sorting, filtering, searching, or paginating a collection of resources.
  - Appended after a `?` as key-value pairs (e.g. `/products?category=Electronics&search=phone`).
  - Read via `useSearchParams()` or Axios `{ params: ... }`.
  - *Example:* `/products?search=keyboard` filters the list of products without changing the core route.

---

### 3. When would you use `/products/:id` vs `/products?category=Electronics`?
- **`/products/:id`:** Use when you need to fetch and display the complete details of **one individual product** identified by its unique ID.
- **`/products?category=Electronics`:** Use when you need to query and filter **a collection/list of multiple products** based on a shared attribute (category).

---

### 4. How does `.map()` help us render products dynamically?
- `.map()` transforms an array of raw JavaScript data objects into an array of JSX elements:
  ```jsx
  {products.map((product) => (
    <ProductCard key={product._id} product={product} />
  ))}
  ```
- It enables declarative rendering: as products are fetched from the API or filtered, React re-executes `.map()`, dynamically reflecting the current state without manual DOM manipulation.
- Providing a unique `key` (e.g. `product._id`) helps React's virtual DOM reconciliation algorithm efficiently identify which items changed, added, or removed.

---

### 5. Why do we need loading and error states in a frontend application?
- **Loading State:** Network requests are asynchronous and take time. Showing a spinner or skeleton loaders informs the user that work is in progress, preventing confusion and accidental duplicate actions.
- **Error State:** Network requests can fail (server offline, 500 error, 404 not found, no internet). An error state gracefully informs the user with a helpful message and a retry button rather than leaving a broken, blank page.

---

### 6. What happens when the backend returns an empty array?
- If the backend returns `products: []` (e.g. when no products match the search query), `.map()` simply iterates zero times and renders nothing.
- Without an explicit **Empty State** check (`!loading && products.length === 0`), the user would see a confusing blank screen.
- An empty state lets us display a friendly message ("No products found") and a button to reset filters.

---

### 7. Why should search/filtering be handled by the backend instead of filtering a huge dataset only in React?
- **Bandwidth & Performance:** If an e-commerce store has 50,000 products, downloading all 50,000 items to the client browser would waste megabytes of bandwidth and cause browser memory lag.
- **Database Indexing:** MongoDB can utilize B-tree indexes, text indexes, and pagination (`limit`, `skip`) to filter millions of documents in milliseconds.
- **Freshness:** Backend filtering ensures users search against the most current stock and price records in MongoDB.

---

### 8. Why should API/service logic be separated from UI components?
- **Separation of Concerns:** UI components should focus strictly on presentation and user interactions, while API services (`services/api.js`) handle HTTP requests, headers, credentials, and error transformation.
- **Reusability & Maintainability:** If an endpoint URL changes or authentication headers need updating, you only edit `api.js` instead of hunting down duplicate `fetch`/`axios` calls across dozens of components.
- **Testability:** Decoupled service functions make it significantly easier to mock network calls in component unit tests.
