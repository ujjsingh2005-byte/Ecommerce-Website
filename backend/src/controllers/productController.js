import { Product } from '../models/Product.js';

// @desc    Fetch all products with advanced search, filter, sort & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const { search, category, minPrice, maxPrice, minRating, sort, inStock, featured } = req.query;

    const query = {};

    // Keyword Search
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Category Filter
    if (category && category !== 'all' && category !== '') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating Filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // In Stock Filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured Filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default newest
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'oldest') sortOptions = { createdAt: 1 };
    else if (sort === 'popular') sortOptions = { numReviews: -1, rating: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        products,
        page,
        pages: Math.ceil(total / limit) || 1,
        total,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPercentage,
      category,
      brand,
      stock,
      isFeatured,
      images: bodyImages
    } = req.body;

    let images = [];

    // Check if files were uploaded via multer
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    } else if (bodyImages) {
      // Support string or array of URLs sent directly
      images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
    } else {
      images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const product = new Product({
      name,
      slug,
      description,
      price: Number(price),
      discountPercentage: Number(discountPercentage) || 0,
      category,
      brand: brand || 'Generic',
      stock: Number(stock) || 0,
      images,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      discountPercentage,
      category,
      brand,
      stock,
      isFeatured,
      images: bodyImages
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : product.discountPercentage;
    product.category = category !== undefined ? category : product.category;
    product.brand = brand !== undefined ? brand : product.brand;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : product.isFeatured;

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const uploadedPaths = req.files.map(file => `/uploads/products/${file.filename}`);
      product.images = uploadedPaths;
    } else if (bodyImages) {
      product.images = Array.isArray(bodyImages) ? bodyImages : [bodyImages];
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};
