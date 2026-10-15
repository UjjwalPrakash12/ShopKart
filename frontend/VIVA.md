# ShopKart Lab 02 — Frontend TA Viva Preparation Guide

Here are concise, high-scoring answers to the 5 Frontend TA Viva Questions for Lab 02.

---

### 1. Why do we use `withCredentials: true`?
- **Cross-Origin Cookie Inclusion:** By default, browsers block sending and receiving cookies in cross-origin XMLHttpRequests or Axios/fetch calls for security reasons (CORS policy).
- **Session Continuity:** Setting `withCredentials: true` explicitly instructs the browser to include credentials (such as our backend's `HttpOnly` JWT cookie) with every request to the backend and to accept incoming `Set-Cookie` headers from the backend.

---

### 2. Why can't JavaScript read an HttpOnly cookie?
- **Browser-Level Enforcement:** The `HttpOnly` attribute is a security directive sent in the `Set-Cookie` HTTP header. The browser's cookie jar strictly isolates this cookie from the DOM document object (`document.cookie`).
- **Mitigating Cross-Site Scripting (XSS):** If an attacker injects a malicious script via XSS, they cannot access or exfiltrate the JWT authentication token because JavaScript runtime has no API or capability to read `HttpOnly` cookies.

---

### 3. Why is `/home` called a protected route?
- **Access Control Restriction:** Unlike `/login` or `/register` which are open to everyone, `/home` requires a verified, active user session.
- **Client & Server Guarding:** If an unauthenticated user or someone without a valid session cookie tries to visit `/home`, the application detects the unauthorized state (via `GET /customers/me` returning `401 Unauthorized`) and automatically redirects them to `/login`.

---

### 4. Why do we fetch `/customers/me` instead of storing the user manually?
- **Single Source of Truth:** Storing user information in `localStorage` or `sessionStorage` can become stale, manipulated by client-side code, or vulnerable to XSS.
- **Real-Time Session Verification:** Calling `GET /customers/me` directly verifies that the server-side JWT cookie is still valid and unexpired, and retrieves the most up-to-date customer data directly from MongoDB.
- **Security:** Since the authentication token is stored inside an HttpOnly cookie that JavaScript cannot inspect, the frontend cannot decode the token itself—it relies on `/customers/me` to safely receive the customer profile.

---

### 5. What is the difference between authentication and authorization?
- **Authentication (AuthN) — "Who are you?":**
  - Verifying the identity of the user (e.g. entering email and password, validating credentials, checking JWT signature).
  - *Example:* Logging into ShopKart successfully.
- **Authorization (AuthZ) — "What are you allowed to do?":**
  - Determining whether an authenticated user has permission to access specific resources or perform specific actions.
  - *Example:* A standard customer viewing their own profile vs. an admin accessing an admin panel to delete products or manage all customers.
