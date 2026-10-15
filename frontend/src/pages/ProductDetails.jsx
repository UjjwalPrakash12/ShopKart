import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Tag, Package, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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

  // Fetch optional customer session for navbar
  useEffect(() => {
    getCustomerProfile()
      .then((data) => setCustomer(data))
      .catch(() => {});
  }, []);

  // Fetch single product by ID
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
      setCartMessage('Item added to your shopping cart!');
      setTimeout(() => setCartFeedback(false), 2500);
    } else {
      if (res.status === 401) {
        setCartMessage('Please login to add to cart');
      } else {
        setCartMessage(res.message);
      }
      setCartFeedback(true);
      setTimeout(() => setCartFeedback(false), 3000);
    }
    setAddingToCart(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
          <Link to="/home" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">
            {product?.name || 'Details'}
          </span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-slate-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                <div className="h-10 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-12 bg-slate-200 rounded w-1/3 mt-6"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center max-w-md mx-auto shadow-sm my-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Product Unavailable</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>Browse All Products</span>
            </Link>
          </div>
        )}

        {/* Product Details Display */}
        {!loading && !error && product && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 p-6 sm:p-10 lg:p-12">
              {/* Left Column: Large Product Image */}
              <div className="flex flex-col items-center">
                <div className="relative aspect-square w-full max-w-lg bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-200">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>{product.category}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Product Information & Add to Cart */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 text-xs font-medium text-slate-500 mb-2">
                    <span>Category:</span>
                    <span className="text-blue-600 font-semibold">{product.category}</span>
                    <span>•</span>
                    <span>ID: {product._id}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  <div className="mt-4 flex items-baseline space-x-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Inclusive of all taxes</span>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-6 flex items-center space-x-2">
                    {product.stock > 0 ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Package className="w-3.5 h-3.5" />
                        <span>In Stock ({product.stock} units available)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Currently Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Product Description
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Add to Cart Action */}
                <div className="mt-10 pt-6 border-t border-slate-100">
                  {cartFeedback && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-800 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{cartMessage || 'Item added to your shopping cart!'}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0 || addingToCart}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        {addingToCart
                          ? 'Adding to Cart...'
                          : product.stock > 0
                          ? 'Add to Cart'
                          : 'Out of Stock'}
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center sm:justify-start space-x-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>100% Genuine Product</span>
                    </div>
                    <span>•</span>
                    <span>7-Day Return Policy</span>
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
