import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      .then((data) => setCustomer(data))
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
  };

  const handlePay = async () => {
    // Basic validation
    if (
      !shipping.fullName ||
      !shipping.phone ||
      !shipping.addressLine1 ||
      !shipping.city ||
      !shipping.state ||
      !shipping.pincode
    ) {
      setError('Please fill all shipping details');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Create order on backend
      const orderPayload = {
        amount: subtotal,
        currency: 'INR',
        shippingAddress: shipping,
      };
      const orderData = await createPaymentOrder(orderPayload);

      console.log('Razorpay order data:', orderData);

      // Guard against zero/invalid amount
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
        description: 'Order Checkout',
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          // Verify payment on backend
          const verifyPayload = {
            shopKartOrderId: orderData.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            shippingAddress: shipping,
          };
          try {
            await verifyPayment(verifyPayload);
            // Clear cart and navigate to success/home
            await fetchCart();
            alert('Payment successful! Order placed.');
            navigate('/');
          } catch (verErr) {
            console.error('Verification failed', verErr);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: shipping.fullName,
          contact: shipping.phone,
        },
        theme: {
          color: '#2563eb',
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
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Checkout</h2>
        {cartItems.length === 0 ? (
          <p className="text-slate-700">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {/* Cart Summary */}
            <div className="border p-4 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <ul>
                {cartItems.map((item) => (
                  <li key={item._id} className="flex justify-between py-1">
                    <span>{item.product?.name || 'Item'}</span>
                    <span>₹{item.product?.price?.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold mt-4">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Shipping Form */}
            <div className="border p-4 rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-2">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={shipping.fullName}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={shipping.phone}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Address Line 1"
                  value={shipping.addressLine1}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 md:col-span-2"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shipping.city}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={shipping.state}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={shipping.pincode}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Checkout;
