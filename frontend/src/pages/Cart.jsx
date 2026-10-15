import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { getCustomerProfile } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const { cartItems, loading, error, subtotal, totalUnits, itemCount, fetchCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  // Authenticate session for cart view
  useEffect(() => {
    getCustomerProfile()
      .then((data) => setCustomer(data))
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const handleProceedToCheckout = async () => {
    // Navigate to the Checkout page where the payment flow will be handled
    // In a full implementation you would gather shipping details and call the backend
    // createPaymentOrder API, then invoke Razorpay checkout.
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
          <Link to="/home" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Shopping Cart</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Cart
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Review your items, adjust quantities, and proceed to checkout
            </p>
          </div>

          <div className="mt-4 sm:mt-0 text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 self-start shadow-sm flex items-center space-x-1.5">
            <span>{totalUnits} items in cart</span>
          </div>
        </div>

        {/* 1. Loading State (Task 17) */}
        {loading && (
          <div className="space-y-6 my-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading your cart...</span>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-48"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Error State (Task 17) */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center max-w-md mx-auto shadow-sm my-12">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Unable to load your cart.</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. Empty State (Task 17 & Specifications) */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Your cart is empty 🛒
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like you haven't added anything yet. Explore our product catalog and find something you love.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4. Cart Content & Order Summary (Task 8) */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}

              <div className="pt-2 flex justify-between items-center">
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary (Task 15 Derived Values) */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Unique Items</span>
                  <span className="font-semibold text-slate-800">{itemCount}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Total Units</span>
                  <span className="font-semibold text-slate-800">{totalUnits}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-blue-600">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Action */}
              <div className="mt-8">
                <button
                  onClick={handleProceedToCheckout}
                  disabled={checkingOut}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <span>{checkingOut ? 'Preparing Order...' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted & Secure 256-Bit Checkout</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
