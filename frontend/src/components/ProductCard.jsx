import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Loader2, ShoppingBag, Check } from 'lucide-react';
import { toggleWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, initialWishlisted = false, onWishlistChange }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isOutOfStock = product.stock <= 0;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (savingWishlist) return;

    setSavingWishlist(true);
    setErrorMessage('');

    try {
      const response = await toggleWishlist(product._id);
      setIsWishlisted(response.saved);
      if (onWishlistChange) {
        onWishlistChange(product._id, response.saved);
      }
    } catch (err) {
      console.error('Wishlist action failed:', err);
      if (err.response && err.response.status === 401) {
        setErrorMessage('Please login to save item');
      } else {
        setErrorMessage('Unable to save product');
      }
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart || isOutOfStock) return;

    setAddingToCart(true);
    setErrorMessage('');

    const res = await addToCart(product._id);
    if (res.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    } else {
      if (res.status === 401) {
        setErrorMessage('Please login to add to bag');
      } else {
        setErrorMessage(res.message);
      }
      setTimeout(() => setErrorMessage(''), 3000);
    }

    setAddingToCart(false);
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Stage */}
      <Link
        to={`/products/${product._id}`}
        className="relative aspect-[4/5] w-full bg-slate-50/80 dark:bg-slate-950/80 overflow-hidden flex items-center justify-center"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
          }}
        />

        {/* Ambient subtle vignette overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100/60 dark:border-slate-800">
            {product.category}
          </span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/90 backdrop-blur-md text-white shadow-sm">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white shadow-sm">
              Sold out
            </span>
          )}
        </div>

        {/* Floating Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleWishlistToggle}
            disabled={savingWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
              isWishlisted
                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 scale-105'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 hover:scale-105 border border-white/60 dark:border-slate-800'
            }`}
          >
            {savingWishlist ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-600 dark:text-rose-400' : ''}`} />
            )}
          </button>
        </div>

        {/* Quick View Pill (reveals on desktop hover) */}
        <div className="hidden sm:flex absolute bottom-3 inset-x-3 items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white text-xs font-semibold shadow-md border border-slate-200/50 dark:border-slate-800">
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Floating error toast if any */}
      {errorMessage && (
        <div className="absolute top-14 inset-x-3 z-20 p-2 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-[11px] font-medium text-center shadow-lg animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Card Info Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/products/${product._id}`}
              className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 block"
            >
              {product.name}
            </Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100/90 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">Price</span>
            <div className="font-display text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              cartSuccess
                ? 'bg-emerald-600 text-white shadow-sm'
                : isOutOfStock
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-slate-950 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-95 text-white dark:text-slate-950 hover:text-white shadow-sm'
            }`}
          >
            {addingToCart ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Adding</span>
              </>
            ) : cartSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
