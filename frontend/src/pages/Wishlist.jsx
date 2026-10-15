import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, RefreshCw, AlertTriangle, ArrowRight, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist, removeFromWishlist, getCustomerProfile } from '../services/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch authenticated customer session
  useEffect(() => {
    getCustomerProfile()
      .then((data) => setCustomer(data))
      .catch((err) => {
        // Unauthenticated users are redirected to login
        navigate('/login');
      });
  }, [navigate]);

  // Fetch wishlist products
  const fetchWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error('Error loading wishlist:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError("We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Handle removing product from wishlist without page refresh
  const handleRemoveItem = async (productId) => {
    await removeFromWishlist(productId);
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Wishlist
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Products you have saved to purchase later
            </p>
          </div>

          <div className="mt-4 sm:mt-0 text-xs font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 self-start shadow-sm">
            <span>{!loading ? `${wishlist.length} products saved` : 'Loading...'}</span>
          </div>
        </div>

        {/* 1. Loading State (Task 7) */}
        {loading && (
          <div className="space-y-6 my-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading your wishlist...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Error State (Task 7) */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center max-w-md mx-auto shadow-sm my-12">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Something went wrong.</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchWishlist}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. Empty Wishlist State (Task 7 & Specification) */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Heart className="w-8 h-8 fill-current text-rose-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
              Save products you love while browsing and find them here later when you are ready to shop.
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

        {/* 4. Wishlist Grid (Task 6) */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
