import React, { useState, useEffect } from 'react';
import { PackageSearch, AlertTriangle, RefreshCw, Compass, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts, getCustomerProfile, getWishlist } from '../services/api';

const Products = () => {
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('');

  // Fetch logged in customer info and initial wishlist IDs
  useEffect(() => {
    getCustomerProfile()
      .then((data) => {
        setCustomer(data);
        return getWishlist();
      })
      .then((wishlistData) => {
        if (wishlistData && Array.isArray(wishlistData.wishlist)) {
          setWishlistIds(new Set(wishlistData.wishlist.map((item) => item._id)));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch products whenever filters or search terms change
  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.category = selectedCategory;
      }
      if (selectedSort) {
        params.sort = selectedSort;
      }

      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedSort]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedSort('');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-6 mb-4 gap-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>Full Collection</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Curated Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Authentic essentials engineered for performance, durability, and daily elegance.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 self-start shadow-sm flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{!loading ? `${products.length} Items Available` : 'Syncing collection...'}</span>
          </div>
        </div>

        {/* Search, Category Filter, and Price Sort */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          onClearFilters={handleClearFilters}
        />

        {/* 1. Loading State */}
        {loading && (
          <div className="space-y-6 my-12">
            <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading curated products...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse shadow-card">
                  <div className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-12 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to Load Products</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 sm:p-16 text-center max-w-md mx-auto shadow-card my-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">No products found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
              No products match your current search query or category filter. Try clearing or relaxing your search terms.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-slate-950 dark:bg-white hover:bg-indigo-600 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* 4. Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
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
        )}
      </main>
    </div>
  );
};

export default Products;
