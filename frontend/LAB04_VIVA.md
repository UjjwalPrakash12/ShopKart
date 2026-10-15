# ShopKart Lab 04 — TA Viva Preparation Guide

Comprehensive, high-scoring answers to all 12 Viva questions for Lab 04: ShopKart Wishlist.

---

### Database Questions

#### 1. Why are we storing ObjectIds instead of Product objects?
- **Source of Truth (Data Normalization):** The `Product` collection is the master source of truth. If a product's price, stock, title, or image changes, storing only the `ObjectId` reference guarantees that the wishlist always presents real-time, accurate product information without needing to update duplicate records across thousands of user documents.
- **Storage Efficiency:** An `ObjectId` takes only 12 bytes of storage in BSON, compared to storing an entire embedded product document repeatedly for every user who wishlists it.

#### 2. What does `ref: "Product"` do?
- In Mongoose schema definition, `ref: 'Product'` registers metadata informing Mongoose which model/collection the `ObjectId` points to.
- It enables Mongoose's `.populate()` method to automatically cross-reference and substitute the `ObjectId` with the actual document from the `Product` collection when queried.

#### 3. What is the difference between embedding and referencing?
- **Embedding (Denormalization):** Nested subdocuments stored directly inside the parent document (e.g. `address: { street, city }`). Best for 1-to-few relationships where data is exclusively owned by the parent and accessed together.
- **Referencing (Normalization):** Storing only the unique identifier (`_id`) pointing to a separate document in another collection. Best for M:N (many-to-many) or 1:N relationships where the referenced entity has an independent lifecycle (like products in an e-commerce store).

#### 4. Why do we use `populate()`?
- MongoDB is a non-relational database without native SQL `JOIN` commands.
- Mongoose's `.populate()` method automates relational lookups on the application tier. It inspects the `ref` metadata, gathers all referenced `ObjectId`s, issues a targeted query to the referenced collection (`Product.find({ _id: { $in: [...] } })`), and replaces the raw IDs with the populated product objects.

---

### Backend Questions

#### 5. Why should wishlist endpoints be protected?
- A customer's wishlist is private, user-specific data. Unauthenticated guests must not be allowed to manipulate or inspect user wishlists.
- Protecting endpoints ensures only logged-in users with a valid session cookie/JWT can add, view, or remove wishlist items.

#### 6. Why should the server get the user ID from the JWT?
- **Tamper-Proof Authenticity:** The JWT is cryptographically signed by the server using `process.env.JWT_SECRET`. The user cannot tamper with the encoded user ID payload without invalidating the cryptographic signature.
- **Stateless Verification:** The server decodes the verified token from incoming HTTP cookies, securely establishing identity without asking the client to pass manual IDs.

#### 7. Why should we not accept `userId` from the client?
- **Critical IDOR Vulnerability:** Accepting `userId` in `req.body` or URL parameters allows an attacker to perform an Insecure Direct Object Reference (IDOR) attack—simply changing the `userId` in the payload to spy on, modify, or erase another customer's wishlist.
- The server must always extract the user identity exclusively from the verified session context (`req.user._id`).

#### 8. How are duplicate wishlist entries prevented?
- In `addToWishlist`, before modifying the array, the controller checks:
  ```javascript
  const alreadyWishlisted = customer.wishlist.some(
    (id) => id.toString() === productId.toString()
  );
  if (alreadyWishlisted) return res.status(409)...;
  ```
- This prevents a user from having multiple duplicate cards for the exact same product.

#### 9. What HTTP status should be returned for a duplicate wishlist request?
- **`409 Conflict`:** The HTTP standard defines `409 Conflict` specifically for requests that cannot be completed due to a conflict with the current state of the resource (in this case, the item already exists in the wishlist).

---

### Frontend Questions

#### 10. Why should the Wishlist page fetch from the backend?
- **Persistence Across Sessions & Devices:** If a user logs into their ShopKart account on a phone and later logs in on a laptop, their saved items are retrieved from MongoDB.
- Storing items only in local browser memory (like `localStorage` or memory state) would lose the wishlist on page refresh, device change, or cache clear.

#### 11. Why do we need loading, error and empty states?
- **Loading State:** Informs the user that their data is being loaded over the network, preventing accidental multi-clicks or assumptions that the app is frozen.
- **Empty State:** Normalizes the scenario where a user has 0 saved items, giving clear feedback and a Call to Action (`[ Browse Products ]`) to guide them back into the shopping journey.
- **Error State:** Gracefully handles network failures, server downtime, or expired sessions with an explicit message and a `[ Try Again ]` button instead of a broken, empty screen.

#### 12. Why should the wishlist survive a page refresh?
- A wishlist represents user intent and emotional investment in products. If refreshing the page or restarting the browser erased the saved list, it would lead to a frustrating customer experience and lost sales conversions.
- By persisting the relationship in MongoDB and re-fetching via `GET /wishlist` on mount, the wishlist remains completely durable.
