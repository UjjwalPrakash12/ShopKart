import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Tag, AlertCircle } from 'lucide-react';
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
    <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
      {/* Product Image & Info */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
            }}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              <Tag className="w-3 h-3" />
              <span>{product.category}</span>
            </span>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 mt-1 block"
          >
            {product.name}
          </Link>

          <p className="text-xs text-slate-500 mt-0.5">
            Unit Price: <span className="font-semibold text-slate-800">₹{Number(product.price).toLocaleString('en-IN')}</span>
          </p>

          {errorMessage && (
            <p className="text-xs text-rose-600 font-medium mt-1 animate-shake">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Quantity Controls & Totals */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Quantity Controls: [-] N [+] */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
          <button
            onClick={handleDecrement}
            disabled={isMinQuantity || updating}
            title={isMinQuantity ? 'Minimum quantity is 1' : 'Decrease quantity'}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-8 text-center text-sm font-bold text-slate-800">
            {quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isMaxStock || updating}
            title={isMaxStock ? `Max stock (${product.stock}) reached` : 'Increase quantity'}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="text-right min-w-[90px]">
          <span className="text-xs text-slate-400 block font-medium">Total</span>
          <span className="text-lg font-extrabold text-slate-900">
            ₹{itemTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={updating}
          title="Remove item"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
