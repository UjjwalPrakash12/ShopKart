import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Tag, Package, AlertCircle, CheckCircle, Truck, RotateCcw, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getProductById, getCustomerProfile } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [customer, setCustomer] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartFeedback, setCartFeedback] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    getCustomerProfile()
      .then((data) => setCustomer(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProductById(id);
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (isMounted) {
          if (err.response && err.response.status === 404) {
            setError('Product not found.');
          } else {
            setError('Something went wrong while loading the product.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || addingToCart) return;

    setAddingToCart(true);
    const res = await addToCart(product._id);
    if (res.success) {
      setCartFeedback(true);
      setCartMessage('Item successfully added to your shopping bag!');
      setTimeout(() => setCartFeedback(false), 2500);
    } else {
      if (res.status === 401) {
        setCartMessage('Please login to add items to your bag');
      } else {
        setCartMessage(res.message);
      }
      setCartFeedback(true);
      setTimeout(() => setCartFeedback(false), 3000);
    }
    setAddingToCart(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 truncate">
            <Link to="/home" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Discover
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Collection
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold truncate">
              {product?.name || 'Details'}
            </span>
          </div>

          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collection</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-card animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3"></div>
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mt-6"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-12 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1">Product Unavailable</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        )}

        {/* Product Details Display */}
        {!loading && !error && product && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 p-6 sm:p-10 lg:p-12 items-center">
              {/* Left Column: Image Stage */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="relative aspect-square w-full max-w-md bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 p-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/60 dark:border-slate-800">
                      <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{product.category}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Product Information */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
                    <span className="uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">{product.category}</span>
                    <span>•</span>
                    <span>SKU: {product._id?.slice(-8).toUpperCase()}</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  <div className="mt-4 flex items-baseline space-x-4">
                    <span className="font-display text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Inclusive of all taxes</span>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="mt-5">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Package className="w-3.5 h-3.5" />
                        <span>In Stock • {product.stock} units left</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Sold Out</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      About this item
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Add to Bag and Guarantees */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  {cartFeedback && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fade-in">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{cartMessage}</span>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || addingToCart}
                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-glow-sm hover:shadow-glow transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {addingToCart
                        ? 'Adding to Bag...'
                        : product.stock > 0
                        ? 'Add to Shopping Bag'
                        : 'Out of Stock'}
                    </span>
                  </button>

                  {/* Feature Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <Truck className="w-4 h-4 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Free Shipping</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">Orders over ₹999</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <RotateCcw className="w-4 h-4 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">7-Day Returns</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">Hassle-free</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <Lock className="w-4 h-4 mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Razorpay Safe</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">256-bit SSL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetails;
