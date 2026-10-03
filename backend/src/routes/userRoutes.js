import express from 'express';
import {
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  uploadUserResume,
  removeUserResume,
  getAllUsers,
  getUserById,
  updateUserRole
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import { uploadPhoto, uploadResume } from '../middleware/upload.js';

const router = express.Router();

// User profile self-service
router.route('/profile')
  .put(protect, updateProfile);

router.route('/profile/photo')
  .post(protect, uploadPhoto.single('photo'), uploadProfilePhoto)
  .delete(protect, removeProfilePhoto);

router.route('/profile/resume')
  .post(protect, uploadResume.single('resume'), uploadUserResume)
  .delete(protect, removeUserResume);

// Admin user management
router.route('/')
  .get(protect, admin, getAllUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUserRole);

export default router;
