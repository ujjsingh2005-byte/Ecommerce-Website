import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Printer,
  Ban,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { SteppedOrderTracker } from '../components/cart/SteppedOrderTracker';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const OrderDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        if (res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.put(`/orders/${id}/cancel`, {
        reason: 'Cancelled at customer request'
      });

      if (res.success && res.data) {
        setOrder(res.data);
        setCancelModalOpen(false);
        success('Order cancelled successfully. Stock has been restored.');
      }
    } catch (err) {
      showError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setDeleting(true);
      const res = await api.delete(`/orders/${id}`);
      if (res.success) {
        success(res.message || 'Order deleted successfully');
        navigate(user?.role === 'admin' ? '/admin/orders' : '/orders');
      }
    } catch (err) {
      showError(err.message || 'Failed to delete order');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in required"
        description="Please sign in to inspect your order details."
        actionLabel="Sign In"
        actionLink="/login"
      />
    );
  }

  if (loading) {
    return <Loader message="Loading shipment & order information..." />;
  }

  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="The requested order could not be located in our systems."
        actionLabel="Back to Orders"
        actionLink="/orders"
      />
    );
  }

  const canBeCancelled = ['Pending', 'Confirmed', 'Packed'].includes(order.orderStatus);
  const isAdmin = user?.role === 'admin';
  const canBeDeleted = isAdmin;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <Link
            to={isAdmin ? '/admin/orders' : '/orders'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Back to Admin Orders' : 'Back to All Orders'}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Order {order.orderNumber}
            </h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {canBeCancelled && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          {canBeDeleted && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors flex items-center gap-1.5"
              title="Delete Order Record"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Order</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Stepped Tracking Bar */}
      <SteppedOrderTracker
        currentStatus={order.orderStatus}
        timeline={order.timeline || []}
      />

      {/* Order Info & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Purchased Items List */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Purchased Line Items ({order.orderItems.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity} unit{item.quantity === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <span className="font-extrabold text-sm text-slate-900">
                  ₹{Math.round(item.subtotal).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Detailed Timeline Log */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Event Activity Log
              </h4>
              <div className="space-y-2">
                {order.timeline.map((event, i) => (
                  <div key={i} className="text-xs flex items-start gap-2 text-slate-600">
                    <span className="font-bold text-slate-800 min-w-[5rem]">{event.status}:</span>
                    <span className="flex-1">{event.note}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Shipping Address & Financial Summary */}
        <div className="space-y-6">
          
          {/* Shipping Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Delivery Destination</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
              <p className="font-bold text-slate-800 text-sm">{order.shippingAddress.fullName}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Payment & Invoice Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Payment & Summary</span>
            </h3>

            <div className="text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-800">{order.paymentMethod}</span>
              </div>
              {order.paymentResult?.id && (
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-slate-700">{order.paymentResult.id}</span>
                </div>
              )}
              <div className="border-t border-slate-100 my-2"></div>
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  ₹{order.pricing.itemsPrice.toLocaleString('en-IN')}
                </span>
              </div>
              {order.pricing.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discounts:</span>
                  <span className="font-bold">
                    -₹{order.pricing.discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-slate-800">
                  {order.pricing.shippingPrice === 0 ? 'FREE' : `₹${order.pricing.shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes:</span>
                <span className="font-semibold text-slate-800">
                  ₹{order.pricing.taxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-900 text-sm">Total Paid:</span>
                <span className="text-xl font-black text-blue-600">
                  ₹{order.pricing.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Cancel This Order"
        message="Are you sure you want to cancel this order? The inventory will be immediately restored to our catalog."
        confirmText="Yes, Cancel Order"
        isDestructive={true}
        loading={cancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOpen(false)}
      />

      {/* Delete Order Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Order Record"
        message={`Are you sure you want to permanently delete order "${order.orderNumber}"? This will permanently remove the record.`}
        confirmText="Delete Order"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
