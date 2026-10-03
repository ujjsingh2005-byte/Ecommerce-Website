import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Trust & Guarantee Badges */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Free Express Delivery</h4>
                <p className="text-xs text-slate-400">On all qualifying orders above ₹999</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">100% Authentic Products</h4>
                <p className="text-xs text-slate-400">Verified manufacturer warranty</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl text-indigo-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Easy 7-Day Returns</h4>
                <p className="text-xs text-slate-400">Hassle-free replacement policy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl text-amber-400">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">24/7 Dedicated Support</h4>
                <p className="text-xs text-slate-400">Instant customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NexStore</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engineered for seamless digital commerce. Explore high-performance electronics, audio equipment, wearables, and lifestyle essentials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-blue-400 transition-colors">Product Catalog</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-400 transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-blue-400 transition-colors">Order Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Account & Help</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/profile" className="hover:text-blue-400 transition-colors">My Profile & Docs</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition-colors">Create Account</Link>
              </li>
              <li>
                <span className="text-slate-500">Security & Privacy Policy</span>
              </li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">Platform Security</h4>
            <p className="text-sm text-slate-400 mb-3">
              Protected by end-to-end token encryption, atomic database inventory locks, and strict RBAC authorization.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>All Microservices Operational</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NexStore Platform Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Production Full-Stack Architecture</p>
        </div>
      </div>
    </footer>
  );
};
