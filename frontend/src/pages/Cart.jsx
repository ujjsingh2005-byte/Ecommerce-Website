import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [clearModalOpen, setClearModalOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Sign in to view your cart"
        description="Your cart items are securely saved across your devices when you sign in."
        actionLabel="Sign In Now"
        actionLink="/login"
      />
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Shopping Cart is Empty"
        description="Explore our wide range of products and discover great deals."
        actionLabel="Start Shopping"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-slate-500 mt-1">
            You have {cart.totalCount} item{cart.totalCount === 1 ? '' : 's'} in your cart
          </p>
        </div>

        <button
          onClick={() => setClearModalOpen(true)}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const isAtMaxStock = item.quantity >= item.stock;

            return (
              <div
                key={item._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-baseline gap-2 text-xs">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      {item.discountPercentage > 0 && (
                        <span className="text-slate-400 line-through">
                          ₹{item.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Stock Alert Warning */}
                    {isAtMaxStock && (
                      <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Only {item.stock} items available in stock.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Line Subtotal */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Subtotal */}
                  <div className="text-right min-w-[5rem]">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      ₹{Math.round(item.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Financial Ledger & Checkout CTA */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({cart.totalCount} items)</span>
              <span className="font-semibold text-slate-900">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>

            {cart.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Product Discounts</span>
                <span className="font-bold">-₹{cart.discountTotal.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-900">
                {cart.shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${cart.shippingFee}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated GST (5%)</span>
              <span className="font-semibold text-slate-900">₹{cart.tax.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-base font-extrabold text-slate-900 block">Final Total</span>
                <span className="text-[11px] text-slate-400">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl font-black text-blue-600">
                ₹{cart.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secure Guarantee */}
          <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Safe & Encrypted Checkout</span>
          </div>
        </div>
      </div>

      {/* Clear Cart Modal */}
      <ConfirmModal
        isOpen={clearModalOpen}
        title="Clear Shopping Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be reversed."
        confirmText="Clear Cart"
        isDestructive={true}
        onConfirm={async () => {
          await clearCart();
          setClearModalOpen(false);
        }}
        onCancel={() => setClearModalOpen(false)}
      />
    </div>
  );
};
