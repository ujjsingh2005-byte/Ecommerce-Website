import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Trash2
} from 'lucide-react';
import api from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/common/Loader';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Deletion modal state
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { success, error: showError } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { paymentStatus: paymentFilter }),
        ...(search.trim() && { search: search.trim() })
      }).toString();

      const res = await api.get(`/orders?${query}`);
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error loading admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
        note: `Order marked as ${newStatus} by administrator.`
      });

      if (res.success && res.data) {
        success(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      showError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/orders/${orderToDelete._id}`);
      if (res.success) {
        success(res.message || 'Order deleted successfully');
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

  return (
    <div className="space-y-6">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Order Fulfillment</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track, update statuses, and delete test or invalid customer shipments</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Order Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Order #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/30"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Payment Failed">Payment Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loader message="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No orders found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4">Order # & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Update Order Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => {
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">{order.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{order.user?.name || 'Customer'}</p>
                        <p className="text-[10px] text-slate-400">{order.user?.email}</p>
                      </td>

                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        ₹{order.pricing?.totalPrice?.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          disabled={updatingOrderId === order._id || order.orderStatus === 'Cancelled'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Payment Failed">Payment Failed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <Link
                          to={`/orders/${order._id}`}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg inline-flex items-center gap-1 font-bold"
                          title="Inspect Order"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setOrderToDelete(order);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg inline-flex items-center gap-1 font-bold transition-colors"
                          title="Delete Order (Admin Authority)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Admin: Delete Order Record"
        message={`Are you sure you want to permanently delete order "${orderToDelete?.orderNumber}"? This will delete the record from database and cannot be undone.`}
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
