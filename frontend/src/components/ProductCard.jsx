import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Package, AlertCircle, Heart, Loader2, ShoppingCart, Check } from 'lucide-react';
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
        setErrorMessage('Please login to save to wishlist');
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
        setErrorMessage('Please login to add to cart');
      } else {
        setErrorMessage(res.message);
      }
      setTimeout(() => setErrorMessage(''), 3000);
    }

    setAddingToCart(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group relative">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-200/50">
            <Tag className="w-3 h-3 text-blue-600" />
            <span>{product.category}</span>
          </span>
        </div>

        {/* Quick Wishlist Icon Button */}
        <div className="absolute top-3 right-3 flex items-center space-x-1">
          <button
            onClick={handleWishlistToggle}
            disabled={savingWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm flex items-center justify-center cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white border border-slate-200/50'
            }`}
          >
            {savingWishlist ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            )}
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner if Error */}
      {errorMessage && (
        <div className="absolute top-14 left-2 right-2 z-20 p-2 rounded-lg bg-rose-600 text-white text-xs font-medium text-center shadow-lg animate-shake">
          {errorMessage}
        </div>
      )}

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Out of stock</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600">
                <Package className="w-3.5 h-3.5" />
                <span>{product.stock} units left</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Task 7: Product Card Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                cartSuccess
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : cartSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
