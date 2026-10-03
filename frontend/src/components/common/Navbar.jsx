import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Package,
  Sun,
  Moon,
  Heart,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../api/apiClient';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchContainerRef = useRef(null);

  // Debounced live search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (res.success && res.data) {
          setSuggestions(res.data.products);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Search suggestion error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 dark:border-slate-800/80 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo with Brand Gradient */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-hero flex items-center justify-center text-white shadow-md shadow-brand-primary/25 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-hero bg-clip-text text-transparent">
                NexStore
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold -mt-1">
                Premium Retail
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar with Live Debounced Suggestions */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative items-center">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search products, brands, tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-100/90 dark:bg-slate-800/90 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-2.5 pointer-events-none" />
            </form>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Instant Product Suggestions
                </div>
                {suggestions.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <img
                      src={p.images?.[0]}
                      alt=""
                      className="w-9 h-9 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                      <span className="text-[10px] text-brand-primary font-bold">
                        ₹{(p.discountPercentage > 0 ? Math.round(p.price * (1 - p.discountPercentage / 100)) : p.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-brand-primary dark:hover:text-brand-highlight transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-brand-primary dark:hover:text-brand-highlight transition-colors">
              All Products
            </Link>
            <Link
              to="/products?featured=true"
              className="hover:text-brand-primary dark:hover:text-brand-highlight transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Deals</span>
            </Link>
          </nav>

          {/* Right Action Icons (Theme Toggle, Wishlist, Cart, Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-highlight hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Wishlist Indicator */}
            <Link
              to="/products"
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon with Dynamic Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-hero text-white text-[11px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-brand-primary/30 animate-in zoom-in">
                  {cart.totalCount > 99 ? '99+' : cart.totalCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none ring-2 ring-brand-primary/20"
                >
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-hero text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    onClick={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-highlight">
                        {user?.role} Role
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile & Docs
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-primary transition-colors font-medium"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders & Tracking
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-brand-primary dark:text-brand-highlight bg-brand-primary/5 dark:bg-brand-primary/10 hover:bg-brand-primary/10 font-bold transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Command Center
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-hero hover:opacity-90 rounded-full shadow-md shadow-brand-primary/25 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-primary"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </form>

            <div className="flex flex-col gap-1 font-bold text-xs text-slate-700 dark:text-slate-200">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                All Products
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-highlight font-extrabold"
                >
                  Admin Command Center
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
