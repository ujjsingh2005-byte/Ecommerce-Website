import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye, Heart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const originalPrice = product.price || 0;
  const discount = product.discountPercentage || 0;
  const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isFavorited = isInWishlist(product._id);

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  // Category Color Badges
  const getCategoryStyles = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'electronics':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'audio':
      case 'gaming':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'fashion':
      case 'beauty':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'footwear':
      case 'sports':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const success = await addToCart(product._id, 1);
    if (success) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-brand-primary/50 dark:hover:border-brand-primary/50 hover:shadow-floating transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top Floating Badges */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
        {discount > 0 && (
          <span className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
            Featured
          </span>
        )}
      </div>

      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 shadow-sm transition-all hover:scale-110"
        title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image Container */}
      <Link
        to={`/products/${product._id}`}
        className="relative block w-full h-56 bg-slate-50 dark:bg-slate-800/50 overflow-hidden"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Subtle Dark Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Stock Badge Overlay */}
        {isOutOfStock ? (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md text-rose-300 text-[10px] font-bold py-1 px-2.5 rounded-xl text-center">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold py-0.5 px-2.5 rounded-xl">
            Only {product.stock} left in stock
          </div>
        ) : null}
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getCategoryStyles(
                product.category
              )}`}
            >
              {product.category}
            </span>

            <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
              <span className="text-slate-400 text-[10px] font-normal">({product.numReviews || 0})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/products/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-brand-primary dark:hover:text-brand-highlight transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Price Header */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Details
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                isOutOfStock
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white shadow-glow-success scale-95'
                  : 'bg-brand-primary hover:bg-brand-secondary text-white shadow-glow-primary active:scale-95'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-in zoom-in" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Sold' : 'Add'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
