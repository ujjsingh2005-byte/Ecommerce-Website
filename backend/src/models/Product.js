import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative'],
    index: true
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: String,
    required: [true, 'Please enter product category'],
    index: true
  },
  brand: {
    type: String,
    default: 'Generic'
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
    index: true
  },
  images: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
    index: true
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

export const Product = mongoose.model('Product', productSchema);
