const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all cases for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [cases] = await connection.query(
      `SELECT 
        sc.case_id, sc.case_title, sc.description, sc.location, 
        sc.case_status, sc.urgency_level, sc.detected_case, 
        sc.probability, sc.created_at, cc.category_name
       FROM student_cases sc
       LEFT JOIN case_categories cc ON sc.category_id = cc.category_id
       WHERE sc.user_id = ?
       ORDER BY sc.created_at DESC`,
      [user_id]
    );

    connection.release();

    res.json({
      success: true,
      cases
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single case
router.get('/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [cases] = await connection.query(
      `SELECT * FROM student_cases 
       WHERE case_id = ? AND user_id = ?`,
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Get evidence files
    const [evidence] = await connection.query(
      'SELECT * FROM evidence_files WHERE case_id = ?',
      [case_id]
    );

    // Get checklist items
    const [checklist] = await connection.query(
      'SELECT * FROM checklist_items WHERE case_id = ?',
      [case_id]
    );

    connection.release();

    res.json({
      success: true,
      case: cases[0],
      evidence,
      checklist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create case
router.post('/', verifyToken, [
  body('category_id').isInt(),
  body('case_title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('location').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { user_id } = req.user;
    const { category_id, case_title, description, location, urgency_level, detected_case, probability } = req.body;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO student_cases 
       (user_id, category_id, case_title, description, location, urgency_level, detected_case, probability)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, category_id, case_title, description, location, urgency_level, detected_case, probability]
    );

    connection.release();

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      case_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update case
router.put('/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const { case_status, urgency_level, detected_case, probability } = req.body;
    const pool = req.pool;
    const connection = await pool.getConnection();

    // Verify ownership
    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (case_status !== undefined) {
      updateFields.push('case_status = ?');
      updateValues.push(case_status);
    }
    if (urgency_level !== undefined) {
      updateFields.push('urgency_level = ?');
      updateValues.push(urgency_level);
    }
    if (detected_case !== undefined) {
      updateFields.push('detected_case = ?');
      updateValues.push(detected_case);
    }
    if (probability !== undefined) {
      updateFields.push('probability = ?');
      updateValues.push(probability);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(case_id);

    await connection.query(
      `UPDATE student_cases SET ${updateFields.join(', ')} WHERE case_id = ?`,
      updateValues
    );

    connection.release();

    res.json({
      success: true,
      message: 'Case updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete case
router.delete('/:case_id', verifyToken, async (req, res) => {
  try {
    const { case_id } = req.params;
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    // Verify ownership
    const [cases] = await connection.query(
      'SELECT * FROM student_cases WHERE case_id = ? AND user_id = ?',
      [case_id, user_id]
    );

    if (cases.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Delete related records
    await connection.query('DELETE FROM evidence_files WHERE case_id = ?', [case_id]);
    await connection.query('DELETE FROM checklist_items WHERE case_id = ?', [case_id]);
    await connection.query('DELETE FROM student_cases WHERE case_id = ?', [case_id]);

    connection.release();

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
