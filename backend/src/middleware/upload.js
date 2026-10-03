import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = (folderName) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'backend', 'uploads', folderName);
    createDirIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Photo filter
const imageFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  const mimetype = allowedExtensions.test(file.mimetype);

  if (mimetype && allowedExtensions.test(ext)) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are permitted!'), false);
};

// Document filter (for resume)
const documentFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase().substring(1);

  if (allowedExtensions.test(ext)) {
    return cb(null, true);
  }
  cb(new Error('Only document files (.pdf, .doc, .docx) are permitted for resume!'), false);
};

export const uploadPhoto = multer({
  storage: storage('photos'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

export const uploadResume = multer({
  storage: storage('resumes'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter
});

export const uploadProductImage = multer({
  storage: storage('products'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});
