const express = require('express');
const { pool } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/placements
 * Get all active placement notices
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { min_cgpa } = req.query;
    let query = `SELECT pn.*, u.name as posted_by
                 FROM placement_notices pn
                 LEFT JOIN users u ON pn.created_by = u.id
                 WHERE pn.is_active = TRUE`;
    const params = [];

    if (min_cgpa) {
      query += ' AND pn.min_cgpa <= ?';
      params.push(parseFloat(min_cgpa));
    }

    query += ' ORDER BY pn.deadline ASC';

    const [notices] = await pool.execute(query, params);
    res.json({ notices });
  } catch (err) {
    console.error('Get placements error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/placements/:id
 * Get a single placement notice
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT pn.*, u.name as posted_by
       FROM placement_notices pn
       LEFT JOIN users u ON pn.created_by = u.id
       WHERE pn.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Placement notice not found.' });
    }

    res.json({ notice: rows[0] });
  } catch (err) {
    console.error('Get placement notice error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/placements
 * Create a new placement notice (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { company_name, role, description, eligibility, min_cgpa, salary_package, location, apply_link, deadline } = req.body;

    if (!company_name || !role) {
      return res.status(400).json({ error: 'Company name and role are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO placement_notices (company_name, role, description, eligibility, min_cgpa, salary_package, location, apply_link, deadline, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, role, description, eligibility, min_cgpa || 0, salary_package, location, apply_link, deadline, req.user.id]
    );

    res.status(201).json({
      message: 'Placement notice created',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Create placement notice error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
