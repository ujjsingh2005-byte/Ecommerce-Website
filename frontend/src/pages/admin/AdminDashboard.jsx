import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  PieChart,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Code2,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  BookOpen,
  Layers,
  Award
} from 'lucide-react';
import api from '../../api/apiClient';
import { Loader } from '../../components/common/Loader';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/admin/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Loader message="Compiling real-time store analytics..." />;
  }

  const kpis = [
    {
      label: 'Gross Store Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-emerald-500 text-white',
      accentBorder: 'border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'Total Orders Placed',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-pink-500 text-white',
      accentBorder: 'border-pink-500/20 bg-pink-50/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400'
    },
    {
      label: 'Active Customers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500 text-white',
      accentBorder: 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Live Catalog Items',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500 text-white',
      accentBorder: 'border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Pending Fulfillment',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-amber-500 text-white',
      accentBorder: 'border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
    },
    {
      label: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-rose-500 text-white',
      accentBorder: 'border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
    }
  ];

  // Category Distribution Mock Analytics for visualization
  const categoryAnalytics = [
    { name: 'Electronics', percentage: 40, color: 'bg-cyan-500' },
    { name: 'Audio', percentage: 25, color: 'bg-purple-500' },
    { name: 'Wearables', percentage: 18, color: 'bg-amber-500' },
    { name: 'Footwear', percentage: 12, color: 'bg-emerald-500' },
    { name: 'Accessories', percentage: 5, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-8">

      {/* Administrator Spotlight Banner (from Resume) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-glow-primary border-2 border-white/20">
              US
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Ujjwal Singh</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  Store Architect & Admin
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 font-medium flex items-center gap-1.5 flex-wrap">
                <GraduationCap className="w-4 h-4 text-indigo-300 flex-shrink-0" />
                <span>B.Tech CSE (2023 - 2027) • Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow</span>
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-300 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ujjsingh203@gmail.com</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+91 8604913255</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Lucknow & Sultanpur, UP, India</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:max-w-xs justify-start md:justify-end">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-white/10 text-white border border-white/10">React.js & Next.js</span>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-white/10 text-white border border-white/10">Node.js & Express</span>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-white/10 text-white border border-white/10">MongoDB & SQL</span>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-white/10 text-white border border-white/10">Python & FastAPI</span>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">10th: 88.8% | 12th: 81%</span>
          </div>
        </div>

        {/* Featured Projects from Resume */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                CourseHub Platform
              </span>
              <span className="text-[10px] text-indigo-300 font-semibold">1,000+ Users</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              Scalable online learning system with JWT RBAC, Cloudinary storage, and Razorpay payments.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-teal-400" />
                Bharat Sign AI 3
              </span>
              <span className="text-[10px] text-teal-300 font-semibold">MediaPipe AI</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              Multilingual Indian Sign Language translation with voice, text, OpenCV, and FastAPI.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Smart Parking System
              </span>
              <span className="text-[10px] text-amber-300 font-semibold">Full Stack</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              Real-time parking slot allocation, user booking workflows, and MERN backend services.
            </p>
          </div>
        </div>
      </div>
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`p-6 rounded-3xl border shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] ${kpi.accentBorder}`}
            >
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider block opacity-80">
                  {kpi.label}
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {kpi.value}
                </span>
              </div>
              <div className={`p-4 rounded-2xl ${kpi.color} shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Share Progress Bars */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-primary" />
              <span>Revenue by Category</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">All Time</span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryAnalytics.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{cat.name}</span>
                  <span>{cat.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-700`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Fulfillment Health */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              <span>Order Velocity & Dispatch Health</span>
            </h3>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>98.4% Fulfillment Rate</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 text-center">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Delivered</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats?.deliveredOrders || 0}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Processing</span>
              <span className="text-2xl font-black text-amber-500">
                {stats?.pendingOrders || 0}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Low Inventory</span>
              <span className="text-2xl font-black text-rose-500">
                {stats?.lowStockProducts || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live transaction stream across the storefront</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-brand-primary dark:text-brand-highlight hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{order.orderNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{order.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{order.user?.email}</p>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{order.orderItems?.length || 0} items</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                      ₹{order.pricing?.totalPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-brand-primary/10 text-brand-primary dark:text-brand-highlight">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-brand-primary dark:text-brand-highlight hover:underline font-bold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
