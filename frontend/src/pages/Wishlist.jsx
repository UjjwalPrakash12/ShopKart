import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, RefreshCw, AlertTriangle, Compass } from 'lucide-react';
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
      .catch(() => {
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

  const handleRemoveItem = async (productId) => {
    await removeFromWishlist(productId);
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-6 mb-8 border-b border-slate-200/80 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
              <Heart className="w-4 h-4 fill-current" />
              <span>Saved Items</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Keep track of your favorite products and move them to your bag when you're ready.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 self-start shadow-sm flex items-center space-x-1.5">
            <span>{!loading ? `${wishlist.length} Items Saved` : 'Loading...'}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6 my-12 text-center">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading saved items...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse shadow-card">
                  <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-12 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Failed to Load Wishlist</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
            <button
              onClick={fetchWishlist}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 sm:p-16 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your wishlist is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
              Explore our collection and click the heart icon on any product to save it for later.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-950 dark:bg-white hover:bg-indigo-600 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Products</span>
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
