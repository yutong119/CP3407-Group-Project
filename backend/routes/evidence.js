const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload evidence file
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { case_id, description } = req.body;
    const { user_id } = req.user;
    const pool = req.pool;

    if (!case_id || !req.file) {
      return res.status(400).json({ success: false, message: 'case_id and file are required' });
    }

    const connection = await pool.getConnection();

    // Verify case ownership
    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Insert evidence file record
    const [result] = await connection.query(
      `INSERT INTO evidence_files 
       (case_id, file_name, file_type, file_path, description)
       VALUES (?, ?, ?, ?, ?)`,
      [case_id, req.file.originalname, req.file.mimetype, req.file.path, description || null]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      evidence_id: result.insertId,
      file: {
        file_name: req.file.originalname,
        file_path: req.file.path
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get evidence files for a case
router.get('/case/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    // Verify case ownership
    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const [evidence] = await connection.query(
      'SELECT * FROM evidence_files WHERE case_id = ? ORDER BY uploaded_at DESC',
      [case_id]
    );

    connection.release();

    res.json({
      success: true,
      evidence
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete evidence file
router.delete('/:evidence_id', verifyToken, async (req, res) => {
  try {
    const { evidence_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [evidence] = await connection.query(
      'SELECT ef.*, sc.user_id FROM evidence_files ef JOIN student_cases sc ON ef.case_id = sc.case_id WHERE ef.evidence_id = ?',
      [evidence_id]
    );

    if (evidence.length === 0 || evidence[0].user_id !== user_id) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    // Delete file from storage
    if (fs.existsSync(evidence[0].file_path)) {
      fs.unlinkSync(evidence[0].file_path);
    }

    // Delete database record
    await connection.query('DELETE FROM evidence_files WHERE evidence_id = ?', [evidence_id]);

    connection.release();

    res.json({
      success: true,
      message: 'Evidence deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
