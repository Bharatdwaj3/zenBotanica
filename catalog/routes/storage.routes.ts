import { Router } from 'express';
import multer from 'multer';
import { authUser } from '../middleware/auth.middleware.ts';
import checkPermission from '../middleware/permission.middleware.ts';
import {
  uploadFile,
  getFileUrl,
  deleteFile,
  listFiles,
  extractPdf,
} from '../controller/storage.controller.ts';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB limit
  },
});

// Upload file (protected)
router.post('/upload', authUser, upload.single('file'), uploadFile);

// Get file URL (public)
router.get('/file/:fileName', getFileUrl);

// List all files (public)
router.get('/files', listFiles);

// Delete file (protected)
router.delete('/file/:fileName', authUser, deleteFile);

// Extract metadata + suggested cover from PDF (admin only)
router.post('/extract', authUser, checkPermission('addBook'), upload.single('file'), extractPdf);

export default router;