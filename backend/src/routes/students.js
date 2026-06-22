const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/students/profile
 * Get the authenticated student's profile
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.name, u.role, u.created_at,
              sp.department, sp.year, sp.skills, sp.resume_url,
              sp.cgpa, sp.phone, sp.address, sp.linkedin_url
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    res.json({ profile: rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/students/profile
 * Update the authenticated student's profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, department, year, skills, resume_url, cgpa, phone, address, linkedin_url } = req.body;

    // Update user name
    if (name) {
      await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    }

    // Update or insert student profile
    const [existing] = await pool.execute(
      'SELECT id FROM student_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      await pool.execute(
        `UPDATE student_profiles SET
          department = COALESCE(?, department),
          year = COALESCE(?, year),
          skills = COALESCE(?, skills),
          resume_url = COALESCE(?, resume_url),
          cgpa = COALESCE(?, cgpa),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          linkedin_url = COALESCE(?, linkedin_url)
        WHERE user_id = ?`,
        [department, year, skills, resume_url, cgpa, phone, address, linkedin_url, req.user.id]
      );
    } else {
      await pool.execute(
        `INSERT INTO student_profiles (user_id, department, year, skills, resume_url, cgpa, phone, address, linkedin_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, department, year, skills, resume_url, cgpa, phone, address, linkedin_url]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
