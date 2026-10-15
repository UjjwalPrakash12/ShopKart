import React, { useState, useEffect } from 'react';
import { PackageSearch, AlertTriangle, RefreshCw, ShoppingCart } from 'lucide-react';
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
      .catch(() => {
        // Unauthenticated access can still view products
      });
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar customer={customer} onLogout={() => setCustomer(null)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Product Catalogue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore authentic products curated for your everyday needs
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 self-start shadow-sm">
            <span>Showing {!loading ? products.length : '...'} products</span>
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
          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading products...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                  <div className="aspect-square bg-slate-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center max-w-md mx-auto shadow-sm my-8">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to Load Products</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm my-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No products found.</h3>
            <p className="text-sm text-slate-500 mb-6">
              No products match your current search or category filter. Try clearing filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* 4. Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(product._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
