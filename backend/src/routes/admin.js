const express = require('express');
const { pool } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/students
 * Get all students with their profiles (admin only)
 */
router.get('/students', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { department, search } = req.query;

    let query = `SELECT u.id, u.email, u.name, u.created_at,
                        sp.department, sp.year, sp.skills, sp.cgpa, sp.phone
                 FROM users u
                 LEFT JOIN student_profiles sp ON u.id = sp.user_id
                 WHERE u.role = 'student'`;
    const params = [];

    if (department) {
      query += ' AND sp.department = ?';
      params.push(department);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.name ASC';

    const [students] = await pool.execute(query, params);
    res.json({ students });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/overview
 * Get admin system overview (admin only)
 */
router.get('/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [studentCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const [testCount] = await pool.execute('SELECT COUNT(*) as count FROM tests WHERE is_active = TRUE');
    const [placementCount] = await pool.execute('SELECT COUNT(*) as count FROM placement_notices WHERE is_active = TRUE');
    const [submissionCount] = await pool.execute('SELECT COUNT(*) as count FROM test_results');

    // Top performers
    const [topPerformers] = await pool.execute(
      `SELECT u.name, u.email, AVG(tr.percentage) as avg_score, COUNT(tr.id) as tests_taken
       FROM test_results tr
       JOIN users u ON tr.user_id = u.id
       GROUP BY tr.user_id
       ORDER BY avg_score DESC
       LIMIT 5`
    );

    res.json({
      overview: {
        totalStudents: studentCount[0].count,
        activeTests: testCount[0].count,
        activePlacements: placementCount[0].count,
        totalSubmissions: submissionCount[0].count,
      },
      topPerformers,
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
