import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingCart,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Heart,
  Check
} from 'lucide-react';
import api from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(res.data.images?.[0] || '');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <Loader message="Fetching product details..." />;
  }

  if (!product) {
    return (
      <EmptyState
        title="Product Not Found"
        description="The product you are looking for has either been removed or does not exist."
        actionLabel="Back to Catalog"
        actionLink="/products"
      />
    );
  }

  const originalPrice = product.price || 0;
  const discount = product.discountPercentage || 0;
  const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isFavorited = isInWishlist(product._id);

  const handleQuantityIncrease = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      showError(`Only ${product.stock} items available in stock.`);
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    const added = await addToCart(product._id, quantity, product);
    if (added) {
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(product._id, quantity, product);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('Please sign in to submit a review.');
      return;
    }
    if (!reviewComment.trim()) {
      showError('Please enter your review feedback.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.success && res.data) {
        setProduct(res.data);
        setReviewComment('');
        success('Thank you! Your review has been published.');
      }
    } catch (err) {
      showError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Top Breadcrumb & Wishlist */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-highlight transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </Link>

        <button
          onClick={() => toggleWishlist(product)}
          className={`p-2.5 rounded-full border transition-all flex items-center gap-1.5 text-xs font-bold ${
            isFavorited
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span className="hidden sm:inline">{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
        </button>
      </div>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-soft relative">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                {discount}% DISCOUNT
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-brand-primary ring-2 ring-brand-primary/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Information & Purchase Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-brand-primary dark:text-brand-highlight uppercase tracking-wider mb-2">
              <span>{product.brand}</span>
              <span>•</span>
              <span>{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-3 mt-3 text-sm">
              <div className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                Based on {product.numReviews || product.reviews?.length || 0} customer reviews
              </span>
            </div>
          </div>

          {/* Price Header */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-baseline gap-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <>
                <span className="text-base text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                  You Save ₹{((originalPrice - finalPrice)).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          {/* Stock Availability Indicator */}
          <div>
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/30 px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Currently Out of Stock</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 rounded-2xl border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Only {product.stock} units remaining in stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>In Stock ({product.stock} available ready to dispatch)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity & Buy Actions */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
                  <button
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                    className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= product.stock}
                    className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 py-3.5 px-6 font-bold rounded-2xl shadow-md transition-all active:scale-98 text-xs uppercase tracking-wider ${
                    addedAnimation
                      ? 'bg-emerald-600 text-white shadow-glow-success scale-95'
                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-hero hover:opacity-95 text-white font-black rounded-2xl shadow-floating transition-all hover:scale-[1.02] active:scale-98 text-xs uppercase tracking-wider"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>
            </div>
          )}

          {/* Guarantees & Perks */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <Truck className="w-5 h-5 text-brand-highlight mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Fast Dispatch</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">1-Year Warranty</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <RotateCcw className="w-5 h-5 text-brand-secondary mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-12 border-t border-slate-200 dark:border-slate-800 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Customer Reviews</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified community ratings and experiences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Write a Review Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
              <span>Leave a Review</span>
            </h3>

            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-current text-amber-500' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">{reviewRating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Your Review Feedback
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full p-3 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-2xl focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-gradient-hero hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-primary/20 transition-all disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Please sign in to write a review for this product.</p>
                <Link
                  to="/login"
                  className="inline-block px-5 py-2 text-xs font-bold bg-brand-primary text-white rounded-xl shadow-sm"
                >
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {(!product.reviews || product.reviews.length === 0) ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No reviews yet for this product.</p>
                <p className="text-xs text-slate-400 mt-1">Be the first to share your experience!</p>
              </div>
            ) : (
              product.reviews.map((rev, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rev.userName}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(rev.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
