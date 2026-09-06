import express from 'express';
import multer from 'multer';
import { uploadFile } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer with memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, SVG, GIF and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Max File Size
  fileFilter,
});

// @desc    Upload Single Image (Avatar, Banner, Icon)
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'nexus-commerce/images';
    const result = await uploadFile(req.file.buffer, req.file.originalname, folder);

    res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.public_id,
      format: result.format,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('[Upload Single Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'File upload failed' });
  }
});

// @desc    Upload Multiple Images (Product Gallery)
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const folder = req.body.folder || 'nexus-commerce/products';
    const uploadPromises = req.files.map((file) =>
      uploadFile(file.buffer, file.originalname, folder)
    );

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.url);

    res.status(200).json({
      success: true,
      urls,
      files: results,
      message: `${results.length} files uploaded successfully`,
    });
  } catch (error) {
    console.error('[Upload Multiple Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Multiple file upload failed' });
  }
});

// @desc    Upload Document (KYC Driving License / RC PDF or Image)
// @route   POST /api/upload/document
// @access  Private
router.post('/document', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document uploaded' });
    }

    const folder = req.body.folder || 'nexus-commerce/kyc-documents';
    const result = await uploadFile(req.file.buffer, req.file.originalname, folder);

    res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.public_id,
      format: result.format,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('[Upload Document Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Document upload failed' });
  }
});

export default router;
