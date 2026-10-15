import React from 'react';
import { Search, ArrowUpDown, X, Sparkles } from 'lucide-react';

const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const sortOptions = [
  { value: '', label: 'Featured Sorting' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const SearchBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    searchTerm !== '' ||
    (selectedCategory !== '' && selectedCategory !== 'All Categories') ||
    selectedSort !== '';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card p-5 sm:p-6 mb-8 space-y-4 transition-colors">
      {/* Search Input & Sorters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search our catalog by name or description..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-10 pr-9 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="md:col-span-2 flex items-center justify-end">
          {hasActiveFilters ? (
            <button
              onClick={onClearFilters}
              title="Reset all filters"
              className="w-full py-3 px-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          ) : (
            <div className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>All items</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex-shrink-0">
          Categories:
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
