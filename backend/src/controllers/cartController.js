import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

// Helper to format cart response with computed totals
const formatCartResponse = (cart) => {
  if (!cart || !cart.items) {
    return {
      items: [],
      subtotal: 0,
      discountTotal: 0,
      shippingFee: 0,
      tax: 0,
      total: 0,
      totalCount: 0
    };
  }

  let subtotal = 0;
  let discountTotal = 0;
  let totalCount = 0;

  const validItems = cart.items
    .filter(item => item.product != null)
    .map(item => {
      const prod = item.product;
      const originalPrice = prod.price || 0;
      const discount = prod.discountPercentage || 0;
      const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
      const itemSubtotal = finalPrice * item.quantity;
      const itemDiscount = (originalPrice - finalPrice) * item.quantity;

      subtotal += originalPrice * item.quantity;
      discountTotal += itemDiscount;
      totalCount += item.quantity;

      return {
        _id: item._id,
        productId: prod._id,
        name: prod.name,
        image: prod.images && prod.images.length > 0 ? prod.images[0] : '',
        originalPrice,
        price: finalPrice,
        discountPercentage: discount,
        quantity: item.quantity,
        stock: prod.stock,
        subtotal: itemSubtotal
      };
    });

  const netItemsPrice = subtotal - discountTotal;
  const shippingFee = netItemsPrice > 999 || netItemsPrice === 0 ? 0 : 50; // Free shipping above 999
  const tax = Math.round(netItemsPrice * 0.05 * 100) / 100; // 5% GST/Tax
  const total = Math.max(0, Math.round((netItemsPrice + shippingFee + tax) * 100) / 100);

  return {
    items: validItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    shippingFee,
    tax,
    total,
    totalCount
  };
};

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Clean up any items where the product was deleted
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product !== null);
    if (cart.items.length !== originalLength) {
      await cart.save();
    }

    res.json({
      success: true,
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (!productId || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + qty;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items are available in stock. You already have ${cart.items[existingItemIndex].quantity} in your cart.`
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items are available in stock.`
        });
      }
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available in stock.`
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      success: true,
      message: 'Cart updated',
      data: formatCartResponse(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: formatCartResponse(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: formatCartResponse({ items: [] })
    });
  } catch (error) {
    next(error);
  }
};
