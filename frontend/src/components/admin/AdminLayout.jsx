import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Overview & KPIs', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Manage Products', icon: Package },
    { to: '/admin/products/new', label: 'Add New Product', icon: PlusCircle },
    { to: '/admin/orders', label: 'Manage Orders', icon: ShoppingCart },
    { to: '/admin/users', label: 'Platform Users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Store Management Console
          </h1>
        </div>

        <Link
          to="/"
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-xs transition-all flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          <span>Switch to Public Storefront</span>
        </Link>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-8 border-b border-slate-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Child Admin Pages */}
      <Outlet />
    </div>
  );
};
