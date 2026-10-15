import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, Tag, Package, AlertCircle } from 'lucide-react';

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-200/50">
            <Tag className="w-3 h-3 text-blue-600" />
            <span>{product.category}</span>
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 backdrop-blur-md text-white shadow-sm">
              <AlertCircle className="w-3 h-3" />
              <span>Out of stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
              <Package className="w-3 h-3" />
              <span>{product.stock} left</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{removing ? 'Removing...' : 'Remove ♥'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
