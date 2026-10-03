import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  MapPin,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingBag,
  Zap
} from 'lucide-react';
import api from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/common/EmptyState';

export const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError, info } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(2);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fallback / Simulation Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setShippingAddress({
        fullName: defaultAddr?.fullName || user.name || '',
        phone: defaultAddr?.phone || '',
        street: defaultAddr?.street || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || '',
        pincode: defaultAddr?.pincode || '',
        country: defaultAddr?.country || 'India'
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Authentication Required"
        description="Please sign in to proceed with secure checkout."
        actionLabel="Sign In"
        actionLink="/login"
      />
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your Cart is Empty"
        description="Add some products to your cart before proceeding to checkout."
        actionLabel="Browse Products"
        actionLink="/products"
      />
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Launch Razorpay Checkout Popup
  const launchRazorpayModal = async (order) => {
    try {
      const razorpayRes = await api.post(`/orders/${order._id}/create-razorpay-order`);
      if (!razorpayRes.success || !razorpayRes.data) {
        throw new Error('Failed to initialize Razorpay payment order');
      }

      const { razorpayOrderId, amount, currency, key } = razorpayRes.data;

      if (!window.Razorpay) {
        info('Razorpay SDK not loaded. Opening payment simulation portal.');
        setPendingOrder(order);
        setPaymentModalOpen(true);
        return;
      }

      const options = {
        key: key || 'rzp_test_TjTkHhhtzn6tnV',
        amount: amount,
        currency: currency || 'INR',
        name: 'NexStore Platform',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName || user.name,
          email: user.email,
          contact: shippingAddress.phone || '9876543210'
        },
        theme: {
          color: '#6366F1'
        },
        handler: async function (response) {
          try {
            setVerifyingPayment(true);
            const verifyRes = await api.post(`/orders/${order._id}/verify-razorpay-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              success('Payment verified via Razorpay! Your order is confirmed.');
              await fetchCart();
              navigate(`/orders/${order._id}`);
            }
          } catch (err) {
            showError(err.message || 'Razorpay payment signature verification failed');
            navigate(`/orders/${order._id}`);
          } finally {
            setVerifyingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            info('Razorpay payment modal closed. You can retry from your order dashboard.');
            setPendingOrder(order);
            setPaymentModalOpen(true);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showError(`Payment failed: ${response.error.description}`);
        setPendingOrder(order);
        setPaymentModalOpen(true);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay Launch Error:', err);
      // Fallback to simulator modal
      setPendingOrder(order);
      setPaymentModalOpen(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      showError('Please fill in all mandatory shipping address fields.');
      return;
    }

    try {
      setPlacingOrder(true);
      setCurrentStep(4);

      // Create pending order on backend with atomic stock checks
      const res = await api.post('/orders', {
        orderItems: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
        })),
        shippingAddress,
        paymentMethod
      });

      if (res.success && res.data) {
        const order = res.data;

        if (paymentMethod === 'COD') {
          success('Order placed successfully via Cash on Delivery!');
          await fetchCart();
          navigate(`/orders/${order._id}`);
        } else {
          // Launch official Razorpay payment flow
          await launchRazorpayModal(order);
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to place order. Please review stock or cart items.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSimulatePayment = async (status) => {
    if (!pendingOrder) return;

    try {
      setVerifyingPayment(true);
      const res = await api.post(`/orders/${pendingOrder._id}/verify-payment`, {
        paymentStatus: status,
        transactionId: `TXN-${Date.now()}`,
        paymentError: status === 'Failed' ? 'Payment rejected by test simulator' : null
      });

      if (res.success && res.data) {
        setPaymentModalOpen(false);
        await fetchCart();

        if (status === 'Paid') {
          success('Payment verified! Your order is confirmed.');
          navigate(`/orders/${pendingOrder._id}`);
        } else {
          showError('Payment failed. You can retry from your order details.');
          navigate(`/orders/${pendingOrder._id}`);
        }
      }
    } catch (err) {
      showError(err.message || 'Payment verification failed');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const steps = [
    { num: 1, title: 'Customer Info' },
    { num: 2, title: 'Shipping Address' },
    { num: 3, title: 'Order Summary' },
    { num: 4, title: 'Payment Method' },
    { num: 5, title: 'Confirmation' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 5-Step Visual Progress Indicator */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between relative max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 -z-0" />

          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-gradient-hero text-white shadow-glow-primary scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                </div>
                <span
                  className={`text-[10px] font-bold mt-2 hidden sm:block ${
                    isCurrent
                      ? 'text-brand-primary dark:text-brand-highlight'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Shipping & Payment Method Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="w-5 h-5 text-brand-primary" />
              <span>Shipping Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Recipient Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Street Address & Apartment *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Apt 4B, 128 Silicon Valley Avenue"
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Bangalore"
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  State / Province *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Karnataka"
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Postal Code / Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 560001"
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  placeholder="e.g. India"
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CreditCard className="w-5 h-5 text-brand-primary" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Razorpay', label: 'Razorpay Online Checkout (UPI / Cards / NetBanking)', desc: 'Official Razorpay Gateway (Test Key)', icon: Zap },
                { id: 'Card', label: 'Credit / Debit Card (Razorpay)', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
                { id: 'UPI', label: 'Instant UPI / QR Code', desc: 'GPay, PhonePe, Paytm, BHIM', icon: QrCode },
                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon package delivery', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <label
                    key={m.id}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={isSelected}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 text-brand-primary focus:ring-brand-primary"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <Icon className="w-4 h-4 text-brand-primary" />
                        <span>{m.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Order Summary Confirmation */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Order Review ({cart.totalCount} items)
          </h3>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 truncate max-w-[70%]">
                  <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="text-slate-400">×{item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{Math.round(item.subtotal).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {cart.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discounts</span>
                <span className="font-bold">-₹{cart.discountTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {cart.shippingFee === 0 ? 'FREE' : `₹${cart.shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (5%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{cart.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Payable Total</span>
              <span className="text-2xl font-black bg-gradient-hero bg-clip-text text-transparent">
                ₹{cart.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placingOrder}
            className="w-full py-4 bg-gradient-hero hover:opacity-95 text-white font-black rounded-2xl shadow-floating transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
          >
            <span>{placingOrder ? 'Initializing Payment...' : 'Proceed to Razorpay Checkout'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Fallback Simulation Modal */}
      {paymentModalOpen && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-hero text-white flex items-center justify-center font-black text-xs">
                  ₹
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Payment Verification</h3>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Order ID:</span>
                <span className="font-bold text-slate-900 dark:text-white">{pendingOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Amount:</span>
                <span className="font-black text-brand-primary dark:text-brand-highlight text-sm">
                  ₹{pendingOrder.pricing.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={verifyingPayment}
                onClick={() => handleSimulatePayment('Failed')}
                className="py-3 px-4 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-bold rounded-xl text-xs transition-colors border border-rose-200 dark:border-rose-800"
              >
                Simulate Payment Failure
              </button>

              <button
                type="button"
                disabled={verifyingPayment}
                onClick={() => handleSimulatePayment('Paid')}
                className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95"
              >
                {verifyingPayment ? 'Verifying...' : 'Authorize Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
