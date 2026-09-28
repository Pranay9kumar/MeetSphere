import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document.js';

/**
 * POST /api/documents/upload
 * Upload a document file (multipart/form-data). Requires multer middleware.
 * The file is stored on disk inside /uploads and a Document record is saved to MongoDB.
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { originalname, mimetype, size, filename } = req.file;
    const ext = path.extname(originalname).replace('.', '').toLowerCase() || 'file';

    const doc = await Document.create({
      name: originalname,
      fileType: ext,
      sizeBytes: size,
      owner: req.user._id,
      url: `/uploads/${filename}`,
      associatedMeeting: req.body.meetingId || null
    });

    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    console.error('[DocumentController] uploadDocument error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

/**
 * GET /api/documents
 * Fetch all documents owned by the authenticated user.
 */
export const getUserDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error('[DocumentController] getUserDocuments error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

/**
 * DELETE /api/documents/:id
 * Delete a document by ID (only the owner can delete).
 * Also removes the file from disk.
 */
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (doc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to delete this document' });
    }

    // Remove the physical file if it exists on disk
    const filePath = path.join(process.cwd(), doc.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    console.error('[DocumentController] deleteDocument error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

export default { uploadDocument, getUserDocuments, deleteDocument };
