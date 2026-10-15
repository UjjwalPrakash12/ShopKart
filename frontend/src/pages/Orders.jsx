import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  ShoppingBag, 
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getMyOrders } from '../services/api';

const ORDER_STEPS = [
  { key: 'PLACED', label: 'Order Placed', desc: 'Received & logged' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Payment verified' },
  { key: 'SHIPPED', label: 'In Transit', desc: 'Handed to courier' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Package arrived' },
];

const getStepIndex = (status) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 0;
    case 'PLACED':
      return 1;
    case 'CONFIRMED':
      return 2;
    case 'SHIPPED':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 1;
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchParams] = useSearchParams();

  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyOrders();
        if (data && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Unable to load your orders. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-6">
          <Link to="/home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-bold">My Orders & Tracking</span>
        </div>

        {/* Celebratory Banner on Successful Payment */}
        {isSuccess && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 backdrop-blur-sm relative overflow-hidden animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-100">
                    Payment Verified & Order Confirmed!
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-700/80 dark:text-emerald-300/80">
                    Your transaction was successfully processed by Razorpay. Track live shipping status below.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Instant Confirmation
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-slate-200/80 dark:border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-3 border border-indigo-100 dark:border-indigo-900/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Purchase History</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Orders & Tracking
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time fulfillment tracking and itemized receipts for your purchases.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-semibold text-slate-400">Loading your orders & live tracking...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-200 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-card max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              No orders placed yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              When you order curated items through ShopKart, you can track their fulfillment and delivery right here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-md"
            >
              <span>Explore Collection</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStepIndex = getStepIndex(order.status);
              const orderIdShort = order._id ? order._id.slice(-8).toUpperCase() : 'N/A';

              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Order Placed
                        </span>
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      <div className="border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Order Number
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            #{orderIdShort}
                          </span>
                          <button
                            onClick={() => handleCopy(order._id, order._id)}
                            title="Copy Full Order ID"
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            {copiedId === order._id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Total Amount
                        </span>
                        <span className="font-display text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Payment Badge */}
                    <div className="flex items-center space-x-2">
                      {order.paymentStatus === 'PAID' ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Paid with Razorpay</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{order.paymentStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Tracking Stepper */}
                  <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            Shipment Progress
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Estimated delivery: 3-5 business days from payment
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Status: <strong className="text-indigo-600 dark:text-indigo-400">{order.status || 'PLACED'}</strong>
                      </span>
                    </div>

                    {/* Stepper Graphic */}
                    <div className="relative mt-4">
                      {/* Progress Line */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-800 -z-0">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((currentStepIndex) / (ORDER_STEPS.length - 1)) * 100))}%`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-4 relative z-10">
                        {ORDER_STEPS.map((step, idx) => {
                          const isComplete = currentStepIndex >= idx + 1;
                          const isCurrent = currentStepIndex === idx || (currentStepIndex === 1 && idx === 0);

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                  isComplete
                                    ? 'bg-indigo-600 text-white shadow-glow-sm'
                                    : isCurrent
                                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}
                              >
                                {isComplete ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-xs font-bold mt-2.5 ${isComplete || isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {step.label}
                              </span>
                              <span className="hidden sm:inline text-[10px] text-slate-400 mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Details: Items & Delivery Address */}
                  <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items Purchased (2 Cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Items in this Shipment ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80"
                          >
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Quantity: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.quantity}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                ₹{item.price?.toLocaleString('en-IN')} each
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address & Razorpay Verification (1 Col) */}
                    <div className="space-y-6 lg:border-l lg:border-slate-100 lg:dark:border-slate-800 lg:pl-8">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Delivery Address</span>
                        </h4>
                        {order.shippingAddress ? (
                          <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {order.shippingAddress.fullName}
                            </p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                              <span className="font-semibold">{order.shippingAddress.pincode}</span>
                            </p>
                            <p className="text-slate-400 pt-1">
                              Phone: <span className="font-semibold">{order.shippingAddress.phone}</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Standard Address</p>
                        )}
                      </div>

                      {/* Razorpay Meta Information */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Payment Verification</span>
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Method</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Razorpay Secure</span>
                          </div>
                          {order.razorpayPaymentId && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Payment ID</span>
                              <span className="font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                                {order.razorpayPaymentId}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Delivery Method</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Express Courier</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
