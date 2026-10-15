# LAB 05 — Shopping Cart: TA Viva Preparation

> **ShopKart Engineering Lab 05**
> Topic: Cart State + Derived Data + Persistent APIs

---

## State Management Questions (1–5)

### Q1. Why did you use a global cart state (Context API) instead of local component state?

The cart must be visible and consistent **across multiple unrelated components at the same time**:
- `Navbar` — displays the live cart item count badge.
- `Products` / `ProductDetails` pages — "Add to Cart" buttons need to know whether an item is already being added.
- `Cart` page — shows all items, quantities and the order summary.

If cart state lived locally in each component, they would all have their own copies that quickly get out of sync. A single `CartContext` (global singleton) makes every consumer see the same truth with zero prop-drilling.

---

### Q2. What is the difference between server state and UI state? Give an example from your cart implementation.

| | Server State | UI State |
|---|---|---|
| **Lives in** | MongoDB / backend | React component memory |
| **Persists across** | Browser refresh, devices | Current render only |
| **Example (cart)** | `cart` array on the `Customer` document | `isAdding` / `isSuccess` button feedback flag on `ProductCard` |

`cartItems` (fetched from `GET /cart`) is server state — managed in `CartContext` and synced with the DB on every mutation. `isAdding` is pure UI state — it exists only so the button shows `"Adding…"` while the request is in flight and `"Added!"` for 1 second after.

---

### Q3. What are "derived values" and why don't you store them in the database?

Derived values are quantities that can be **calculated** from existing data rather than being stored separately.

In our cart:
```
subtotal   = Σ (item.product.price × item.quantity)
totalUnits = Σ item.quantity
itemCount  = cartItems.length
```

We compute these in `CartContext` using `useMemo`. They are **not stored in MongoDB** because:
1. **No duplication risk** — the single source of truth is `quantity` and `price`; derived numbers automatically stay correct.
2. **No update anomalies** — if price changed, a stored subtotal would be stale until manually refreshed.
3. **Storage efficiency** — why persist what you can compute instantly?

---

### Q4. What is `useMemo` and why did you use it for derived cart totals?

`useMemo` memoises (caches) a computed value and only recomputes it when its listed **dependencies** change.

```jsx
const subtotal = useMemo(
  () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [cartItems]
);
```

Without `useMemo`, `subtotal` would be recalculated on **every React render** — including unrelated renders caused by unrelated state changes. Since `cartItems` can be a large array, memoisation avoids redundant work and keeps the UI snappy.

---

### Q5. Why did you wrap the entire app in `<CartProvider>` instead of just the Cart page?

The `Navbar` component (which renders on every page) displays the live cart count. If `CartProvider` only wrapped `/cart`, the Navbar would be outside the context and couldn't access `totalUnits`.

By wrapping at the `App` root, **every component in the tree** can call `useCart()` without any extra props.

---

## Backend Questions (6–10)

### Q6. How is storing cart quantity different from storing a wishlist?

| | Wishlist | Cart |
|---|---|---|
| **Schema** | `wishlist: [ObjectId]` (just a reference) | `cart: [{ product: ObjectId, quantity: Number }]` (reference + data) |
| **Reason** | Binary — item is either saved or not | Needs a count: customer wants 3 of this item |
| **Duplicate rule** | 409 Conflict — no duplicates | Increment quantity if product already in cart |

---

### Q7. Should the product price be stored in the cart document? Why or why not?

**No — and we deliberately do not store it.**

We store only `{ product: ObjectId, quantity }` and call `.populate('product')` when fetching the cart. This means the price displayed is always the **current price** from the `Product` collection.

**Trade-off acknowledged**: In real e-commerce (Amazon, Flipkart), the price is often snapshotted at "add to cart" time so it doesn't change while the customer is browsing. For this lab scope (no checkout flow yet) populating live price is the correct design.

---

### Q8. How does stock validation work in your cart controller?

**On `addToCart`:**
- If `product.stock < 1` → 409 "Out of stock"
- If existing cart item → increment quantity only if newQty <= product.stock
- Else push new cart item with quantity 1

**On `updateQuantity`:**
- If `newQty < 1` → 400 "Quantity must be at least 1"
- If `newQty > product.stock` → 400 "Exceeds available stock"
- Else set `item.quantity = newQty`

Stock is validated **on every mutation**, not just at the first add. This prevents race conditions where stock drops between the time a user adds an item and when they increase quantity.

---

### Q9. What happens if the same product is added to the cart twice?

The `addToCart` controller checks whether the `product` ObjectId already exists in the customer's `cart` array:

```js
const existingItem = customer.cart.find(
  item => item.product.toString() === productId
);
if (existingItem) {
  existingItem.quantity += 1;   // increment, not duplicate
} else {
  customer.cart.push({ product: productId, quantity: 1 });
}
```

Result: **one row** in the cart with `quantity = 2`, not two rows.

---

### Q10. Why is the user's identity taken from `req.user` (JWT) and not from the request body?

Security. If identity came from the request body (`req.body.userId`), **any client could pass any user ID** and manipulate another user's cart.

The `protectRoute` middleware verifies the JWT from the HttpOnly cookie, extracts the authentic user ID from its payload, and attaches it as `req.user`. Since the client cannot read or forge HttpOnly cookies, the identity is guaranteed to be the logged-in user's — not spoofable.

---

## React Questions (11–14)

### Q11. How does the Navbar cart count update without a page refresh?

`Navbar` calls `useCart()` and reads `totalUnits` — a **derived value memoised in CartContext**.

Whenever a cart mutation (add / update / remove) completes, `CartContext` calls `fetchCart()` which sets `cartItems` via `setCartItems`. React sees `cartItems` changed → recomputes `totalUnits` via `useMemo` → re-renders every subscriber, including `Navbar`. All of this happens in memory with no page refresh.

---

### Q12. How did you implement per-item loading state without a global spinner?

Each `CartItem` component manages its own `isUpdating` and `isRemoving` boolean states:

```jsx
const [isUpdating, setIsUpdating] = useState(false);
const handleQuantityChange = async (newQty) => {
  setIsUpdating(true);
  await updateQuantity(item.product._id, newQty);
  setIsUpdating(false);
};
```

Only that specific row's controls are disabled during its own API call. Other rows remain interactive. This is the correct pattern for lists — global spinners would block the entire UI unnecessarily.

---

### Q13. What happens if an API call to update the cart quantity fails?

The `updateQuantity` function in `CartContext` wraps the call in `try/catch`. On failure, it sets `error` state and **does not update `cartItems`**. The UI reverts to showing the old quantity because `cartItems` hasn't changed. The `Cart` page reads `error` from `useCart()` and displays an inline error message.

---

### Q14. Explain "single source of truth" in the context of your cart implementation.

**Single Source of Truth (SSOT)** means cart data lives in exactly **one canonical location**; everything else derives from it.

In our app:
- **Server SSOT**: The `cart` array on the `Customer` MongoDB document. Any API mutation writes here.
- **Frontend SSOT**: `cartItems` in `CartContext`. This is a local mirror, refreshed after every mutation by calling `fetchCart()`.

Components (`Cart.jsx`, `Navbar`, `ProductCard`) **read from `CartContext`**, never maintain their own copy of cart data. This means:
- No stale data in sub-components.
- No "my count says 3, the page says 4" inconsistencies.
- One `fetchCart()` call updates the whole UI simultaneously.

---

*Good luck in the viva! 🚀*
