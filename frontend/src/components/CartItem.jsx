import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Tag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { product, quantity } = item;
  if (!product) return null;

  const itemTotal = (product.price || 0) * (quantity || 1);
  const isMaxStock = quantity >= (product.stock || 1);
  const isMinQuantity = quantity <= 1;

  const handleIncrement = async () => {
    if (isMaxStock || updating) return;
    setUpdating(true);
    setErrorMessage('');
    const res = await updateQuantity(product._id, quantity + 1);
    if (!res.success) {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
    setUpdating(false);
  };

  const handleDecrement = async () => {
    if (isMinQuantity || updating) return;
    setUpdating(true);
    setErrorMessage('');
    const res = await updateQuantity(product._id, quantity - 1);
    if (!res.success) {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
    setUpdating(false);
  };

  const handleRemove = async () => {
    if (updating) return;
    setUpdating(true);
    await removeFromCart(product._id);
    setUpdating(false);
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Product Image & Details */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 dark:bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-800 p-1"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
            }}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {product.category}
            </span>
            {product.stock <= 5 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Only {product.stock} left
              </span>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 mt-1 block"
          >
            {product.name}
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unit Price: <span className="font-semibold text-slate-800 dark:text-slate-200">₹{Number(product.price).toLocaleString('en-IN')}</span>
          </p>

          {errorMessage && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 animate-fade-in">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Stepper, Total & Remove */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Quantity Stepper */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-1">
          <button
            onClick={handleDecrement}
            disabled={isMinQuantity || updating}
            title={isMinQuantity ? 'Minimum quantity is 1' : 'Decrease quantity'}
            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-slate-500" /> : quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isMaxStock || updating}
            title={isMaxStock ? `Max stock (${product.stock}) reached` : 'Increase quantity'}
            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[90px]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">Total</span>
          <span className="font-display text-base sm:text-lg font-bold text-slate-950 dark:text-white">
            ₹{itemTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={updating}
          title="Remove from bag"
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
