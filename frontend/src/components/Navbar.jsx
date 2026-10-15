import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User, Heart, Sparkles, Compass, Sun, Moon, Package } from 'lucide-react';
import { logoutCustomer, getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ customer: propCustomer, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnits } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const { customer: authCustomer, logout: authLogout } = useAuth();
  const customer = propCustomer || authCustomer;
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getWishlist()
      .then((data) => {
        if (isMounted && data && Array.isArray(data.wishlist)) {
          setWishlistCount(data.wishlist.length);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [location.pathname, customer]);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  const isHome = location.pathname === '/home' || location.pathname === '/';
  const isProducts = location.pathname.startsWith('/products');
  const isWishlist = location.pathname.startsWith('/wishlist');
  const isOrders = location.pathname.startsWith('/orders');
  const isCart = location.pathname.startsWith('/cart');
  const isCheckout = location.pathname.startsWith('/checkout');

  return (
    <header className="sticky top-0 z-50 transition-colors duration-300">
      {/* Top Ambient Micro Announcement Bar */}
      <div className="bg-slate-950 dark:bg-black text-white text-[11px] font-medium tracking-wide py-1.5 px-4 border-b border-transparent dark:border-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 mx-auto sm:mx-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">Complimentary Insured Delivery on orders over ₹999</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">100% Cryptographically Verified Razorpay Checkout</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-slate-400">
            <span>24/7 Concierge Support</span>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Navbar */}
      <nav className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-[70px]">
            {/* Logo */}
            <div className="flex items-center space-x-8 sm:space-x-10">
              <Link to="/home" className="group flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-900 dark:from-indigo-950 dark:via-slate-900 dark:to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-950/20 group-hover:scale-105 transition-all duration-200">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    SHOP<span className="text-indigo-600 dark:text-indigo-400">KART</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500 -mt-1">
                    Curated Living
                  </span>
                </div>
              </Link>

              {/* Navigation Links (Desktop) */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  to="/home"
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isHome
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
                  }`}
                >
                  Discover
                </Link>

                <Link
                  to="/products"
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isProducts
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Collection</span>
                </Link>

                <Link
                  to="/wishlist"
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isWishlist
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlist ? 'fill-current text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {customer && (
                  <Link
                    to="/orders"
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isOrders
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Orders</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Actions: Theme Toggle, Cart, Profile, Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Dark / Light Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
                aria-label="Toggle theme"
                className="p-2 sm:px-2.5 sm:py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-800 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 flex items-center space-x-1.5"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span className="hidden lg:inline text-[11px] font-bold">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden lg:inline text-[11px] font-bold">Dark</span>
                  </>
                )}
              </button>

              {/* Cart Button */}
              <Link
                to="/cart"
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isCart || isCheckout
                    ? 'bg-indigo-600 text-white shadow-glow-sm'
                    : 'bg-slate-100/90 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Bag</span>
                {totalUnits > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                      isCart || isCheckout
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    {totalUnits}
                  </span>
                )}
              </Link>

              {/* Customer Avatar & Status */}
              {customer ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 pl-2 pr-3 py-1.5 rounded-full transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                      {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                      {customer.fullName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-full shadow-sm transition-colors"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
