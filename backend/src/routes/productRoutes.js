import express from 'express';
import {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadProductImage } from '../middleware/upload.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, uploadProductImage.array('images', 5), createProduct);

router.get('/categories', getCategories);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, uploadProductImage.array('images', 5), updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

export default router;
