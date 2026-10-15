import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, ArrowLeft, Truck, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { getCustomerProfile } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const { cartItems, loading, error, subtotal, totalUnits, itemCount, fetchCart } = useCart();

  // Authenticate session for cart view
  useEffect(() => {
    getCustomerProfile()
      .then((data) => setCustomer(data))
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const freeDeliveryThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Link to="/home" className="hover:text-slate-900 transition-colors">
            Discover
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-slate-900 transition-colors">
            Collection
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Shopping Bag</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200/80 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                  Review & Checkout
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  Shopping Bag
                </h1>
              </div>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-full border border-slate-200 self-start shadow-sm flex items-center space-x-1.5">
            <span>{totalUnits} items in bag</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6 my-12 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-indigo-600 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating your shopping bag...</span>
            </div>
            <div className="space-y-4 max-w-3xl mx-auto">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-48"></div>
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded w-28"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Unable to load shopping bag</h3>
            <p className="text-xs text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Retry Load
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">Your bag is empty</h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Discover our curated collection today.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-950 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Cart Content: Items List + Order Summary */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <div className="flex items-center space-x-1.5 text-slate-800">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    {amountNeeded === 0 ? (
                      <span className="text-emerald-600 font-bold">✨ You unlocked Free Express Delivery!</span>
                    ) : (
                      <span>Add <strong className="text-indigo-600">₹{amountNeeded.toLocaleString('en-IN')}</strong> more for Free Delivery</span>
                    )}
                  </div>
                  <span className="text-slate-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Sticky Summary Column */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-card">
                <h3 className="font-display text-lg font-bold text-slate-950 pb-4 border-b border-slate-100">
                  Order Summary
                </h3>

                <div className="py-4 space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalUnits} items)</span>
                    <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Estimated Shipping</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                      {subtotal >= 999 ? 'FREE' : '₹99'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span className="text-slate-500">Calculated at checkout</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="font-display font-bold text-base text-slate-950">Estimated Total</span>
                    <div className="text-right">
                      <span className="font-display text-2xl font-black text-slate-950 tracking-tight">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">INR</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full mt-4 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-glow-sm hover:shadow-glow transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secured with 256-bit Razorpay encryption</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
