import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Store, Home as HomeIcon, Heart } from 'lucide-react';
import { logoutCustomer, getWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ customer, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalUnits } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch Wishlist Count from Backend (Lab 04)
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

  const isHome = location.pathname === '/home';
  const isProducts = location.pathname.startsWith('/products');
  const isWishlist = location.pathname.startsWith('/wishlist');
  const isCart = location.pathname.startsWith('/cart');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link to="/home" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ShopKart
              </span>
            </Link>

            {/* Nav Links: Home | Products | Wishlist | Cart */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/home"
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isHome
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                to="/products"
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isProducts
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Products</span>
              </Link>

              <Link
                to="/wishlist"
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isWishlist
                    ? 'bg-rose-50 text-rose-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current text-rose-600' : 'text-slate-500'}`} />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Task 16: Dynamic Navbar Cart Count from CartContext */}
              <Link
                to="/cart"
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCart
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {totalUnits > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                    {totalUnits}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* User Status, Mobile Links & Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mobile Nav Icons */}
            <div className="flex md:hidden items-center space-x-1">
              <Link
                to="/products"
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg"
                title="Products"
              >
                <Store className="w-5 h-5" />
              </Link>
              <Link
                to="/wishlist"
                className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded-lg"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </Link>
              <Link
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalUnits > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalUnits}
                  </span>
                )}
              </Link>
            </div>

            {customer && (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                  {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[120px] truncate">{customer.fullName}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
