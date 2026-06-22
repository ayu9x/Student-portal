const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics based on user role
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin dashboard stats
      const [studentCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
      );
      const [testCount] = await pool.execute('SELECT COUNT(*) as count FROM tests');
      const [placementCount] = await pool.execute(
        'SELECT COUNT(*) as count FROM placement_notices WHERE is_active = TRUE'
      );
      const [materialCount] = await pool.execute('SELECT COUNT(*) as count FROM training_materials');
      const [resultCount] = await pool.execute('SELECT COUNT(*) as count FROM test_results');

      // Average performance across all students
      const [avgPerformance] = await pool.execute(
        'SELECT AVG(percentage) as avg_percentage FROM test_results'
      );

      // Recent test submissions
      const [recentResults] = await pool.execute(
        `SELECT tr.*, u.name as student_name, t.title as test_title
         FROM test_results tr
         JOIN users u ON tr.user_id = u.id
         JOIN tests t ON tr.test_id = t.id
         ORDER BY tr.submitted_at DESC
         LIMIT 10`
      );

      // Department-wise student distribution
      const [departments] = await pool.execute(
        `SELECT sp.department, COUNT(*) as count
         FROM student_profiles sp
         WHERE sp.department IS NOT NULL
         GROUP BY sp.department`
      );

      res.json({
        stats: {
          totalStudents: studentCount[0].count,
          totalTests: testCount[0].count,
          activePlacements: placementCount[0].count,
          trainingMaterials: materialCount[0].count,
          totalSubmissions: resultCount[0].count,
          averagePerformance: avgPerformance[0].avg_percentage
            ? parseFloat(avgPerformance[0].avg_percentage).toFixed(1)
            : 0,
        },
        recentResults,
        departments,
      });
    } else {
      // Student dashboard stats
      const [testsTaken] = await pool.execute(
        'SELECT COUNT(DISTINCT test_id) as count FROM test_results WHERE user_id = ?',
        [req.user.id]
      );

      const [avgScore] = await pool.execute(
        'SELECT AVG(percentage) as avg_percentage FROM test_results WHERE user_id = ?',
        [req.user.id]
      );

      const [recentResults] = await pool.execute(
        `SELECT tr.*, t.title as test_title, t.type as test_type
         FROM test_results tr
         JOIN tests t ON tr.test_id = t.id
         WHERE tr.user_id = ?
         ORDER BY tr.submitted_at DESC
         LIMIT 5`,
        [req.user.id]
      );

      const [upcomingPlacements] = await pool.execute(
        `SELECT * FROM placement_notices
         WHERE is_active = TRUE AND deadline >= CURDATE()
         ORDER BY deadline ASC
         LIMIT 5`
      );

      const [availableTests] = await pool.execute(
        `SELECT t.*, (SELECT COUNT(*) FROM test_questions WHERE test_id = t.id) as question_count
         FROM tests t
         WHERE t.is_active = TRUE
         AND t.id NOT IN (SELECT test_id FROM test_results WHERE user_id = ?)
         LIMIT 5`,
        [req.user.id]
      );

      // Performance by test type
      const [performanceByType] = await pool.execute(
        `SELECT t.type, AVG(tr.percentage) as avg_percentage, COUNT(*) as attempts
         FROM test_results tr
         JOIN tests t ON tr.test_id = t.id
         WHERE tr.user_id = ?
         GROUP BY t.type`,
        [req.user.id]
      );

      res.json({
        stats: {
          testsTaken: testsTaken[0].count,
          averageScore: avgScore[0].avg_percentage
            ? parseFloat(avgScore[0].avg_percentage).toFixed(1)
            : 0,
        },
        recentResults,
        upcomingPlacements,
        availableTests,
        performanceByType,
      });
    }
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
