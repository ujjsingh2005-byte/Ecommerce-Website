import express from 'express';
import {
  createOrder,
  verifyPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayKey,
  getMyOrders,
  getOrderById,
  cancelOrder,
  deleteOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.get('/my-orders', protect, getMyOrders);
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/razorpay-key', protect, getRazorpayKey);

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, deleteOrder);

router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/verify-payment', protect, verifyPayment);
router.post('/:id/create-razorpay-order', protect, createRazorpayOrder);
router.post('/:id/verify-razorpay-payment', protect, verifyRazorpayPayment);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
