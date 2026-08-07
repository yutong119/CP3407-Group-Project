const express = require('express');
const { verifyToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT user_id, full_name, email, preferred_language, created_at FROM users WHERE user_id = ?',
      [user_id]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { full_name, preferred_language } = req.body;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const updateFields = [];
    const updateValues = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (preferred_language !== undefined) {
      updateFields.push('preferred_language = ?');
      updateValues.push(preferred_language);
    }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateValues.push(user_id);

    await connection.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    connection.release();

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.user;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }

    const pool = req.pool;
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [user_id]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(old_password, users[0].password_hash);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await connection.query(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, user_id]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
