import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { User } from '../models/User.js';

// Initialize Razorpay SDK instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TjTkHhhtzn6tnV',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'u5VpbA8r3NaieowoFE61bdGh'
  });
};

// Helper to generate readable Order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
};

// @desc    Get Razorpay Public Key
// @route   GET /api/orders/razorpay-key
// @access  Private
export const getRazorpayKey = async (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TjTkHhhtzn6tnV'
  });
};

// @desc    Create new order (with atomic stock validation and backend recalculation)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Please provide a complete shipping address' });
    }

    let itemsPrice = 0;
    let discountAmount = 0;
    const validatedOrderItems = [];

    // Atomically verify and check stock for each item from MongoDB
    for (const item of orderItems) {
      const product = await Product.findById(item.productId || item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found or has been removed from catalog.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Only ${product.stock} left in stock.`
        });
      }

      const originalPrice = product.price;
      const discount = product.discountPercentage || 0;
      const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
      const lineSubtotal = finalPrice * item.quantity;
      const lineDiscount = (originalPrice - finalPrice) * item.quantity;

      itemsPrice += originalPrice * item.quantity;
      discountAmount += lineDiscount;

      validatedOrderItems.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        price: finalPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal
      });
    }

    const netItemsPrice = itemsPrice - discountAmount;
    const shippingPrice = netItemsPrice > 999 || netItemsPrice === 0 ? 0 : 50;
    const taxPrice = Math.round(netItemsPrice * 0.05 * 100) / 100;
    const totalPrice = Math.round((netItemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const initialStatus = paymentMethod === 'COD' ? 'Confirmed' : 'Pending';
    const initialPaymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Pending';

    // Atomically decrement stock
    for (const item of validatedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const orderNumber = generateOrderNumber();

    const order = new Order({
      orderNumber,
      user: req.user._id,
      orderItems: validatedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Razorpay',
      paymentStatus: initialPaymentStatus,
      pricing: {
        itemsPrice: Math.round(itemsPrice * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        shippingPrice,
        taxPrice,
        totalPrice
      },
      orderStatus: initialStatus,
      timeline: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: `Order ${orderNumber} placed successfully.`
        }
      ]
    });

    if (paymentMethod === 'COD') {
      order.timeline.push({
        status: 'Confirmed',
        timestamp: new Date(),
        note: 'Order confirmed with Cash on Delivery payment.'
      });
    }

    const createdOrder = await order.save();

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/:id/create-razorpay-order
// @access  Private
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(order.pricing.totalPrice * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber.substring(0, 40),
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        orderNumber: order.orderNumber
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TjTkHhhtzn6tnV',
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/orders/:id/verify-razorpay-payment
// @access  Private
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'u5VpbA8r3NaieowoFE61bdGh';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.paymentMethod = 'Razorpay';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'CAPTURED',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };

      order.timeline.push({
        status: 'Confirmed',
        timestamp: new Date(),
        note: `Payment verified successfully via Razorpay. Payment ID: ${razorpay_payment_id}`
      });

      const updatedOrder = await order.save();

      return res.json({
        success: true,
        message: 'Payment verified and order confirmed successfully',
        data: updatedOrder
      });
    } else {
      order.paymentStatus = 'Failed';
      order.orderStatus = 'Payment Failed';
      order.timeline.push({
        status: 'Payment Failed',
        timestamp: new Date(),
        note: 'Razorpay payment signature mismatch or cancelled.'
      });

      // Restore product stock on payment failure
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification signature failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify generic/demo payment and confirm order
// @route   POST /api/orders/:id/verify-payment
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentStatus, transactionId, paymentError } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (paymentStatus === 'Paid') {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.paymentResult = {
        id: transactionId || `TXN-${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };
      order.timeline.push({
        status: 'Confirmed',
        timestamp: new Date(),
        note: `Payment verified via ${order.paymentMethod}. Transaction ID: ${order.paymentResult.id}`
      });
    } else {
      order.paymentStatus = 'Failed';
      order.orderStatus = 'Payment Failed';
      order.timeline.push({
        status: 'Payment Failed',
        timestamp: new Date(),
        note: paymentError || 'Payment verification failed or was cancelled by user.'
      });

      // Restore product stock on payment failure
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: paymentStatus === 'Paid' ? 'Payment confirmed' : 'Payment failed',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID (with authorization check)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization: must be the owner or an admin
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.orderStatus}`
      });
    }

    order.orderStatus = 'Cancelled';
    order.timeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: req.body.reason || `Order cancelled by ${req.user.role === 'admin' ? 'Administrator' : 'Customer'}`
    });

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order (Admin authority to delete any; customers can delete failed/cancelled)
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = order.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this order' });
    }

    if (!isAdmin && !['Payment Failed', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Customers can only delete cancelled or payment failed orders'
      });
    }

    // Restore stock if deleting an active pending order
    if (['Pending', 'Confirmed', 'Packed'].includes(order.orderStatus) && order.paymentStatus !== 'Failed') {
      for (const item of order.orderItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Order ${order.orderNumber} deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, paymentStatus, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    if (search && search.trim() !== '') {
      query.orderNumber = { $regex: search.trim(), $options: 'i' };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        orders,
        page,
        pages: Math.ceil(total / limit) || 1,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: '${status}'` });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'COD') {
        order.paymentStatus = 'Paid';
      }
    }

    order.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status} by administrator.`
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Pending', 'Confirmed', 'Packed'] }
    });

    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Cancelled', 'Payment Failed'] },
          $or: [{ paymentStatus: 'Paid' }, { paymentMethod: 'COD' }]
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalPrice' }
        }
      }
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockProducts,
        pendingOrders,
        deliveredOrders,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};
