import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  ChevronRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deletion state
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/orders/${orderToDelete._id}`);
      if (res.success) {
        success(res.message || 'Order record deleted successfully');
        setOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id));
        setDeleteModalOpen(false);
        setOrderToDelete(null);
      }
    } catch (err) {
      showError(err.message || 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in required"
        description="Please sign in to view your past orders and shipment status."
        actionLabel="Sign In"
        actionLink="/login"
      />
    );
  }

  if (loading) {
    return <Loader message="Fetching your order history..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Found"
        description="You haven't placed any orders yet. Discover our catalog and place your first order."
        actionLabel="Start Shopping"
        actionLink="/products"
      />
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Packed':
      case 'Confirmed':
        return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Cancelled':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Payment Failed':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, manage, and view detailed invoices for your {orders.length} placed order{orders.length === 1 ? '' : 's'}
          </p>
        </div>
        {isAdmin && (
          <span className="hidden sm:inline-flex px-3 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Admin Authority: Order Deletion Enabled
          </span>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const canDelete = isAdmin;

          return (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all"
            >
              {/* Order Card Header */}
              <div className="bg-slate-50/80 dark:bg-slate-800/60 p-5 sm:px-8 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-[10px]">Order Reference</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">{order.orderNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-[10px]">Date Placed</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase text-[10px]">Total Amount</span>
                    <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                      ₹{order.pricing.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Status, Track Button & Delete Button */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>

                  <Link
                    to={`/orders/${order._id}`}
                    className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderToDelete(order);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors shadow-sm"
                      title="Delete Order Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-5 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Order Record"
        message={`Are you sure you want to permanently delete order reference "${orderToDelete?.orderNumber}"? This will remove the transaction record from the system.`}
        confirmText="Delete Order"
        isDestructive={true}
        loading={deleting}
        onConfirm={confirmDeleteOrder}
        onCancel={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
      />
    </div>
  );
};
