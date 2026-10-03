import { User } from '../models/User.js';
import fs from 'fs';
import path from 'path';

// Helper to remove local file safely
const removeLocalFile = (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.join(process.cwd(), 'backend', relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
        resume: updatedUser.resume,
        addresses: updatedUser.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove old photo if exists
    if (user.profilePhoto && user.profilePhoto.startsWith('/uploads/')) {
      removeLocalFile(user.profilePhoto);
    }

    user.profilePhoto = `/uploads/photos/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/users/profile/photo
// @access  Private
export const removeProfilePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.profilePhoto && user.profilePhoto.startsWith('/uploads/')) {
      removeLocalFile(user.profilePhoto);
    }

    user.profilePhoto = '';
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo removed successfully',
      data: {
        profilePhoto: ''
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/users/profile/resume
// @access  Private
export const uploadUserResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a resume file (.pdf, .doc, .docx) to upload' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove old resume file if present
    if (user.resume && user.resume.url && user.resume.url.startsWith('/uploads/')) {
      removeLocalFile(user.resume.url);
    }

    user.resume = {
      url: `/uploads/resumes/${req.file.filename}`,
      originalName: req.file.originalname,
      uploadedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume: user.resume
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove resume
// @route   DELETE /api/users/profile/resume
// @access  Private
export const removeUserResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resume && user.resume.url && user.resume.url.startsWith('/uploads/')) {
      removeLocalFile(user.resume.url);
    }

    user.resume = {
      url: '',
      originalName: '',
      uploadedAt: null
    };

    await user.save();

    res.json({
      success: true,
      message: 'Resume removed successfully',
      data: {
        resume: user.resume
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        users,
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role / status (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.role) {
      user.role = req.body.role;
    }
    if (req.body.name) {
      user.name = req.body.name;
    }

    const updated = await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role
      }
    });
  } catch (error) {
    next(error);
  }
};
