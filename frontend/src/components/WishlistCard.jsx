import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Trash2, Tag, ShoppingBag, Loader2, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const WishlistCard = ({ product, onRemove }) => {
  const { addToCart } = useCart();
  const [removing, setRemoving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product._id);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setRemoving(false);
    }
  };

  const handleAddToCart = async () => {
    if (addingToCart || isOutOfStock) return;
    setAddingToCart(true);
    const res = await addToCart(product._id);
    if (res.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2000);
    }
    setAddingToCart(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] w-full bg-slate-50 overflow-hidden flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-slate-100">
            {product.category}
          </span>
        </div>

        {/* Remove Wishlist Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleRemove}
            disabled={removing}
            title="Remove from wishlist"
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white transition-all shadow-sm cursor-pointer active:scale-95"
          >
            {removing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <Link
            to={`/products/${product._id}`}
            className="text-sm sm:text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 block"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Price</span>
            <span className="font-display text-lg font-bold text-slate-950">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                cartSuccess
                  ? 'bg-emerald-600 text-white'
                  : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-950 hover:bg-indigo-600 text-white active:scale-95'
              }`}
            >
              {addingToCart ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : cartSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
