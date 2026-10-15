import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  Compass, 
  Star,
  ChevronRight,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getCustomerProfile, getProducts, getWishlist } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const profile = await getCustomerProfile().catch(() => null);
        if (isMounted) setCustomer(profile);

        if (profile) {
          const wl = await getWishlist().catch(() => null);
          if (isMounted && wl && Array.isArray(wl.wishlist)) {
            setWishlistIds(new Set(wl.wishlist.map((item) => item._id)));
          }
        }

        const prodData = await getProducts({}).catch(() => null);
        if (isMounted && prodData && Array.isArray(prodData.products)) {
          setFeaturedProducts(prodData.products.slice(0, 8));
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none"></div>
          <div className="absolute -top-24 right-10 w-96 h-96 bg-blue-500/15 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative max-w-7xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Spring / Summer 2026 Collection</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                  Curated Essentials. <br />
                  <span className="bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
                    Engineered for Living.
                  </span>
                </h1>

                <p className="text-slate-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                  Discover a minimalist curation of premium tech, accessories, and daily companions. Verified checkout powered by Razorpay with nationwide express delivery.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-full bg-white text-slate-950 text-sm font-bold hover:bg-slate-100 hover:shadow-glow-sm transition-all duration-200"
                  >
                    <span>Explore Products</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </Link>

                  <Link
                    to="/cart"
                    className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white text-sm font-semibold transition-all duration-200"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Shopping Bag</span>
                  </Link>
                </div>

                <div className="pt-8 border-t border-white/10 flex items-center space-x-8 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold text-slate-200">4.9/5 Rating</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-white/20"></div>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">100% Secure Checkout</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl p-3 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl border border-white/15 shadow-2xl">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&q=80"
                      alt="Featured Headphones"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-5 inset-x-5 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                          Featured of the Week
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">Studio Hi-Fi Wireless</h3>
                        <p className="text-xs text-slate-300">Active Noise Cancellation & Spatial Audio</p>
                      </div>
                      <Link
                        to="/products"
                        className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-950 text-xs font-bold shadow-md transition-transform active:scale-95"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGGED IN MEMBER BANNER (if authenticated) */}
        {customer && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {customer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Welcome, {customer.fullName}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Active Member
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{customer.email} • Verified Account</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs w-full sm:w-auto">
                <Link
                  to="/products"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-semibold transition-colors shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Browse Catalog</span>
                </Link>
                <Link
                  to="/cart"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>My Cart</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* VALUE PROPOSITIONS STRIP */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-start space-x-4 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Express Delivery</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Complimentary tracked shipping on all orders exceeding ₹999.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-start space-x-4 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Razorpay Verified</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Military-grade 256-bit SSL encrypted payments via Cards, UPI, & NetBanking.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-start space-x-4 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Free Returns</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Not 100% satisfied? Return hassle-free with instant pickup from your doorstep.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm flex items-start space-x-4 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Authentic Guarantee</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Every product is 100% genuine, backed by full manufacturer warranty.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED / TRENDING PRODUCTS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Right Now</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white tracking-tight">
                Featured Selection
              </h2>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors self-start"
            >
              <span>View all products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 animate-pulse bg-white dark:bg-slate-900">
                  <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialWishlisted={wishlistIds.has(product._id)}
                  onWishlistChange={(prodId, isSaved) => {
                    setWishlistIds((prev) => {
                      const updated = new Set(prev);
                      if (isSaved) updated.add(prodId);
                      else updated.delete(prodId);
                      return updated;
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No products available at the moment.</p>
            </div>
          )}
        </section>

        {/* EDITORIAL CALLOUT SECTION */}
        <section className="bg-slate-900 dark:bg-slate-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Exclusive Member Experience
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Seamless Checkout with Razorpay
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enjoy instant payment authorization across Credit/Debit cards, UPI (Google Pay, PhonePe, Paytm), and NetBanking. With automated HMAC-SHA256 signature verification, your transactions are instant, safe, and verifiable.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-glow-sm transition-all"
              >
                Start Shopping Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-slate-900 dark:text-white tracking-tight text-base">
              SHOP<span className="text-indigo-600 dark:text-indigo-400">KART</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="text-slate-500 dark:text-slate-400">© 2026 ShopKart Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
            <Link to="/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">Catalog</Link>
            <Link to="/cart" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cart</Link>
            <Link to="/wishlist" className="hover:text-slate-900 dark:hover:text-white transition-colors">Wishlist</Link>
            <Link to="/checkout" className="hover:text-slate-900 dark:hover:text-white transition-colors">Checkout</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
