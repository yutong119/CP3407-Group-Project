const express = require('express');

const router = express.Router();

// Get all case categories
router.get('/', async (req, res) => {
  try {
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [categories] = await connection.query(
      'SELECT * FROM case_categories ORDER BY category_name'
    );

    connection.release();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:category_id', async (req, res) => {
  try {
    const { category_id } = req.params;
    const pool = req.pool;
    const connection = await pool.getConnection();

    const [categories] = await connection.query(
      'SELECT * FROM case_categories WHERE category_id = ?',
      [category_id]
    );

    connection.release();

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      category: categories[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
