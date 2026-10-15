import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  Navigation, 
  Hash, 
  CheckCircle2, 
  ArrowLeft,
  Truck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCustomerProfile, createPaymentOrder, verifyPayment } from '../services/api';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, fetchCart } = useCart();
  const [customer, setCustomer] = useState(null);

  // Shipping form state
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ensure user is logged in; otherwise redirect to login
  useEffect(() => {
    getCustomerProfile()
      .then((data) => {
        setCustomer(data);
        if (data) {
          setShipping((prev) => ({
            ...prev,
            fullName: data.fullName || '',
            phone: data.phone || '',
          }));
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  // Load Razorpay script once
  useEffect(() => {
    const scriptId = 'razorpay-script';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (
      !shipping.fullName.trim() ||
      !shipping.phone.trim() ||
      !shipping.addressLine1.trim() ||
      !shipping.city.trim() ||
      !shipping.state.trim() ||
      !shipping.pincode.trim()
    ) {
      setError('Please provide all shipping address details.');
      return;
    }

    if (!/^[0-9]{6}$/.test(shipping.pincode.trim())) {
      setError('Pincode must be a 6-digit number.');
      return;
    }

    if (!/^[0-9]{10,15}$/.test(shipping.phone.trim())) {
      setError('Please provide a valid 10-digit phone number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const orderPayload = {
        amount: subtotal,
        currency: 'INR',
        shippingAddress: shipping,
      };
      const orderData = await createPaymentOrder(orderPayload);

      console.log('Razorpay order data:', orderData);

      if (!orderData.amount || orderData.amount <= 0) {
        setError('Invalid order amount. Please add items to cart.');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_Qb9FJurfVY6ULB',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopKart',
        description: `Order Checkout (${cartItems.length} items)`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          const verifyPayload = {
            shopKartOrderId: orderData.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            shippingAddress: shipping,
          };
          try {
            await verifyPayment(verifyPayload);
            await fetchCart();
            alert('🎉 Payment verified! Your order has been placed successfully.');
            navigate('/home');
          } catch (verErr) {
            console.error('Verification failed', verErr);
            setError('Payment verification failed on the server. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: shipping.fullName,
          contact: shipping.phone,
          email: customer?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        setError(response.error?.description || 'Payment was unsuccessful. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step Indicator Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to="/cart"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
              title="Back to Cart"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 block">
                Express Checkout
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Shipping & Payment
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="flex items-center space-x-1 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Bag</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-[11px] shadow-sm">
              Shipping & Pay
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-400">Confirmation</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your shopping bag is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
              Add some items from our catalog to proceed with checkout.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-950 dark:bg-white hover:bg-indigo-600 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Shipping Form & Customer Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Customer Account Strip */}
              {customer && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card flex items-center justify-between transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {customer.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{customer.fullName}</h4>
                    </div>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
              )}

              {/* Shipping Address Inputs */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-card space-y-5 transition-colors">
                <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Delivery Address</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Ujjwal Prakash"
                        value={shipping.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="9876543210"
                        value={shipping.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Street Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="addressLine1"
                        placeholder="Flat / House No., Apartment, Street"
                        value={shipping.addressLine1}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="city"
                        placeholder="Bengaluru"
                        value={shipping.city}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">State / Province</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="state"
                        placeholder="Karnataka"
                        value={shipping.state}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">6-Digit Pincode</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="560001"
                        maxLength={6}
                        value={shipping.pincode}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Guarantee Badge */}
              <div className="bg-gradient-to-r from-slate-950 to-indigo-950 text-white rounded-2xl p-5 shadow-card flex items-center justify-between border border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Encrypted Razorpay Gateway</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Cards, UPI (GPay/PhonePe), NetBanking, Wallets</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-white/10 px-3 py-1 rounded-full">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit SSL</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Order Summary & Pay Action */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-card transition-colors">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white">Order Summary</h3>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{cartItems.length} items</span>
                </div>

                {/* Items List */}
                <div className="py-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{item.product?.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white flex-shrink-0">
                        ₹{(Number(item.product?.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Totals */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Express Delivery</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[11px]">
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable Taxes</span>
                    <span className="text-slate-500 dark:text-slate-400">Included</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="font-display font-bold text-base text-slate-950 dark:text-white">Total Amount</span>
                    <div className="text-right">
                      <span className="font-display text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Includes all taxes</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-glow-sm hover:shadow-glow transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{subtotal.toLocaleString('en-IN')} with Razorpay</span>
                    </>
                  )}
                </button>

                {/* Trust Seal */}
                <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Razorpay HMAC-SHA256 signature security</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Checkout;
