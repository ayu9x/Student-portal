const express = require('express');
const { pool } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/training
 * Get all training materials (with optional category filter)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT tm.*, u.name as author_name FROM training_materials tm LEFT JOIN users u ON tm.created_by = u.id';
    const params = [];

    if (category) {
      query += ' WHERE tm.category = ?';
      params.push(category);
    }

    query += ' ORDER BY tm.created_at DESC';

    const [materials] = await pool.execute(query, params);
    res.json({ materials });
  } catch (err) {
    console.error('Get training materials error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/training/:id
 * Get a single training material
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT tm.*, u.name as author_name FROM training_materials tm LEFT JOIN users u ON tm.created_by = u.id WHERE tm.id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Training material not found.' });
    }

    res.json({ material: rows[0] });
  } catch (err) {
    console.error('Get training material error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/training
 * Create a new training material (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, category, content_type, file_url, content } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO training_materials (title, description, category, content_type, file_url, content, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, content_type || 'article', file_url, content, req.user.id]
    );

    res.status(201).json({
      message: 'Training material created',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Create training material error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
