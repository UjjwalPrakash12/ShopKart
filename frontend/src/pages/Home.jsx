import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ShieldCheck, ShoppingBag, Heart, Clock, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCustomerProfile } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getCustomerProfile();
        if (isMounted) {
          setCustomer(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch profile (unauthorized):', err);
        if (isMounted) {
          // If not logged in or session expired, redirect to /login
          navigate('/login');
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Verifying session & loading ShopKart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Global Navbar */}
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl shadow-xl text-white p-8 sm:p-10 mb-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Customer Authenticated</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {customer?.fullName}! 👋
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
              You are securely signed in. Explore your ShopKart dashboard, manage your profile, and browse upcoming items.
            </p>
          </div>
          {/* Subtle Decorative Background Rings */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none"></div>
          <div className="absolute right-20 -bottom-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
        </div>

        {/* Customer Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Profile Details (Task 3 core requirement) */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                  {customer?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{customer?.fullName}</h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Active Account
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                    <p className="text-slate-800 font-semibold truncate">{customer?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Phone Number</p>
                    <p className="text-slate-800 font-semibold">{customer?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Account ID</p>
                    <p className="text-slate-800 font-mono text-xs">{customer?._id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs text-slate-500 space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protected via HttpOnly Cookie Authentication</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Upcoming Labs Preview */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Link
              to="/products"
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Product Catalog
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Browse products, inspect categories, and check real-time stock availability.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-blue-600">
                <span>Browse Products Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Shopping Cart & Wishlist</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Save favorite items and manage your cart for seamless single-click checkouts.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
                <span>Coming in Lab 04</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Order History</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track ongoing shipments, review invoices, and manage past purchases.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>Coming in Lab 05</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Payments & Checkout</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Integrate online payment gateways and generate instant order confirmations.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>Coming in Lab 06</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Home;
