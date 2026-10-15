# ShopKart Lab 01 — TA Viva Preparation Guide

Here are concise, high-scoring answers to the 5 TA Viva Questions for Lab 01.

---

### 1. Why do we use **bcrypt** instead of encrypting passwords?
- **One-Way Function (Hashing vs. Encryption):** Encryption is two-way (ciphertext can be decrypted back to plaintext if the key is compromised). Hashing is irreversible.
- **Salt Generation:** bcrypt automatically adds a cryptographic salt (e.g. 10 salt rounds) before hashing, protecting against Rainbow Table attacks and ensuring identical passwords yield completely different hashes.
- **Adaptive Work Factor (Key Stretching):** bcrypt uses the Eksblowfish key schedule and is intentionally computationally expensive. The cost factor can be increased over time, defending against brute-force and GPU-accelerated cracking attacks.

---

### 2. What information is typically stored inside a JWT payload?
- **Identity Identifiers (Subject / Claims):** Non-sensitive identification data such as the user's MongoDB ID (`id` or `_id`) and roles/permissions (`role: 'customer'`).
- **Standard Claims (Metadata):** Token issued-at timestamp (`iat`) and expiration time (`exp`).
- **What should NEVER be in a JWT payload:** Sensitive data like raw or hashed passwords, credit card numbers, or personally identifiable information (PII), because JWT payloads are base64url-encoded and can be read by anyone who inspects the token.

---

### 3. Why is the **HttpOnly** flag important for cookies?
- **XSS Protection:** An `HttpOnly` cookie cannot be accessed, read, or modified by client-side JavaScript (e.g., `document.cookie`).
- **Mitigates Token Theft:** If an attacker succeeds in injecting a malicious script via Cross-Site Scripting (XSS), they cannot exfiltrate the authentication token stored in an `HttpOnly` cookie.

---

### 4. Why should passwords never be returned to the frontend?
- **Zero Exposure Principle:** Even hashed passwords (bcrypt hashes) should never leave the server. If exposed to the frontend, hashes can be intercepted over the network, logged in browser console/history, stored in frontend state/cache, or subjected to offline brute-force cracking.
- **Information Leakage:** Sending password fields back confirms internal data structures and provides attack surfaces.

---

### 5. What is the purpose of authentication middleware?
- **Separation of Concerns:** It acts as a gatekeeper between the incoming HTTP request and the controller logic.
- **Access Control & Verification:** It inspects request headers/cookies, verifies the validity and signature of the JWT, and checks if the user exists in the database.
- **Request Enrichment:** If valid, it attaches the authenticated customer object to `req.user` and calls `next()`. If invalid or expired, it immediately aborts the request and responds with a `401 Unauthorized` without executing downstream business logic.
