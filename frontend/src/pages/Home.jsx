import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Headphones,
  Laptop,
  Watch,
  Footprints,
  Sparkles,
  Gamepad2,
  Shirt,
  Home as HomeIcon,
  ShoppingBag,
  Star,
  CheckCircle2
} from 'lucide-react';
import api from '../api/apiClient';
import { ProductCard } from '../components/product/ProductCard';
import { SkeletonCard } from '../components/common/Loader';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?featured=true&limit=8');
        if (res.success && res.data) {
          setFeaturedProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error loading featured products:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', icon: Laptop, color: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', desc: 'Laptops & Keyboards' },
    { name: 'Audio', icon: Headphones, color: 'from-purple-500 to-indigo-600', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', desc: 'Studio Acoustics' },
    { name: 'Wearables', icon: Watch, color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', desc: 'Smartwatches' },
    { name: 'Footwear', icon: Footprints, color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', desc: 'Sneakers & Shoes' },
    { name: 'Gaming', icon: Gamepad2, color: 'from-violet-500 to-fuchsia-600', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', desc: 'Keyboards & Gear' },
    { name: 'Accessories', icon: ShoppingBag, color: 'from-blue-500 to-indigo-600', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', desc: 'Bags & EDC Items' },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 p-8 sm:p-14 lg:p-20 bg-gradient-hero text-white shadow-floating">
        {/* Abstract Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-black tracking-wider uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SHOP SMART. LIVE BETTER.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Discover Products <br />
              <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
                You'll Love at Prices
              </span> <br />
              You'll Appreciate.
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Explore cutting-edge consumer technology, high-fidelity acoustics, and precision apparel backed by verified stock availability and rapid express dispatch.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/products"
                className="px-8 py-4 bg-white text-brand-primary font-black rounded-2xl shadow-xl shadow-black/10 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/products?featured=true"
                className="px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-black rounded-2xl backdrop-blur-md border border-white/20 transition-all text-xs uppercase tracking-wider hover:scale-105 active:scale-95"
              >
                Explore Collection
              </Link>
            </div>
          </div>

          {/* Right Hero: Floating Interactive Showcase Card */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                  alt="Flagship Headphone"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white font-black text-[10px] rounded-full uppercase tracking-wider shadow">
                  15% Off Flagship
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>4.8 Rating</span>
                  </div>
                  <span className="text-white/70">124 Verified Reviews</span>
                </div>
                <h3 className="text-base font-bold text-white">Sony WH-1000XM5 Wireless Headphones</h3>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black text-white">₹29,749</span>
                  <span className="text-xs text-white/50 line-through">₹34,999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colorful Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Curated Categories</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore specialized collections with instant availability</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-primary dark:text-brand-highlight hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/40 dark:hover:border-brand-primary/40 hover:shadow-floating transition-all duration-300 text-center flex flex-col items-center justify-center space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs group-hover:text-brand-primary dark:group-hover:text-brand-highlight transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-brand-primary dark:text-brand-highlight uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending Highlights</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Featured Products</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-primary dark:text-brand-highlight hover:underline flex items-center gap-1"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promo Gradient Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-secondary text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-left">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
              Exclusive Member Perk
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Enjoy Flat ₹500 Cashback + Free Express Delivery
            </h3>
            <p className="text-white/80 text-xs sm:text-sm">
              Instant verification on all UPI and Card transactions with verified 7-day hassle-free replacement warranties.
            </p>
          </div>
          <Link
            to="/products"
            className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-lg hover:scale-105 text-xs uppercase tracking-wider flex-shrink-0"
          >
            Shop The Deals
          </Link>
        </div>
      </section>
    </div>
  );
};
