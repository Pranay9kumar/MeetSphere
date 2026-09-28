import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/authMiddleware.js';
import { uploadDocument, getUserDocuments, deleteDocument } from '../controllers/documentController.js';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

// Accept common file types; limit to 50 MB per file
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|docx?|pptx?|xlsx?|txt|md|png|jpg|jpeg|gif|svg|fig|zip/i;
    const ext = path.extname(file.originalname).replace('.', '');
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error(`File type .${ext} is not permitted`));
  }
});

const router = Router();

router.get('/', protect, getUserDocuments);
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.delete('/:id', protect, deleteDocument);

export default router;
