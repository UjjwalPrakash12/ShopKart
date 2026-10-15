# 🛒 ShopKart - Full-Stack E-Commerce Platform

A modern, full-stack e-commerce web application built with the MERN stack (MongoDB, Express.js, React, Node.js), Tailwind CSS, and Razorpay payment gateway integration.

---

## ✨ Features

- **User Authentication & Authorization**: Secure signup, login, logout, and profile management using JWT stored in `HttpOnly` cookies.
- **Product Catalog**: Browse and search products across categories with real-time stock updates.
- **Wishlist**: Toggle products in and out of a personalized customer wishlist.
- **Shopping Cart**: Add items, update quantities with dynamic stock limits, and remove items with real-time price calculations.
- **Checkout & Payment Gateway**:
  - Validated shipping address form.
  - Razorpay order creation on backend.
  - Interactive Razorpay checkout popup supporting cards, UPI, net banking, and wallets in test mode.
  - Cryptographic HMAC-SHA256 signature verification on backend to mark orders as `PAID` and auto-clear the cart.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Routing**: React Router v6
- **Icons**: Lucide React
- **HTTP Client**: Axios with credentials (`withCredentials: true`)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs
- **Payment Gateway**: Razorpay Node.js SDK
- **Security & Utilities**: `cookie-parser`, `cors`, `dotenv`, `express-async-handler`

---

## 📁 Project Structure

```text
shopkart/
├── backend/
│   ├── config/              # Database and Razorpay configuration
│   ├── controllers/         # Business logic (auth, cart, wishlist, products, orders)
│   ├── middlewares/         # JWT authentication middleware
│   ├── models/              # Mongoose schemas (Customer, Product, Order)
│   ├── routes/              # Express API route declarations
│   ├── utils/               # JWT token generation helper
│   ├── index.js             # Express app entrypoint
│   ├── seed.js              # Database seeder script
│   ├── .env.example         # Template for backend environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, CartItem, ProductCard, etc.)
│   │   ├── context/         # React Context (CartContext)
│   │   ├── pages/           # Page views (Home, Products, ProductDetails, Cart, Wishlist, Checkout, Login, Register)
│   │   ├── services/        # Axios API client & endpoints
│   │   ├── App.jsx          # Root application component & routes
│   │   └── main.jsx         # Application entry point
│   ├── .env.example         # Template for frontend environment variables
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)
- [Razorpay Account](https://razorpay.com/) (for test API keys)

---

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd shopkart
```

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual values:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/shopkart
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. (Optional) Seed the database with sample products:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend will be running at `http://localhost:5001`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual values:
   ```env
   VITE_API_BASE_URL=http://localhost:5001
   VITE_RAZORPAY_KEY=your_razorpay_key_id
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 💳 Razorpay Test Mode Instructions

When checking out on `http://localhost:5173/checkout`:
1. Fill in the required shipping details.
2. Click **Pay Now** to open the Razorpay modal.
3. Choose **Card** and use Razorpay's test credentials:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry Date**: Any future date (e.g., `12/28`)
   - **CVV**: `123`
4. Click **Pay** and select **Success** on the test simulation screen.
5. The payment will be verified, an order confirmation alert will show, and your cart will be reset.

---

## 🧪 Testing

To run backend test suites:
```bash
cd backend
npm test
```

---

## 🔒 Security & Best Practices

- Environment configuration files (`.env`, `*.env`) and secret keys are excluded from git version control via `.gitignore`.
- Password hashing is enforced using `bcryptjs`.
- User authentication tokens are stored securely in `HttpOnly` cookies to protect against XSS attacks.
- Razorpay payment verifications validate cryptographic HMAC-SHA256 signatures server-side.
