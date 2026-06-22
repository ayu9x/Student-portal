const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/results
 * Get all test results for the authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const [results] = await pool.execute(
      `SELECT tr.*, t.title as test_title, t.type as test_type, t.total_marks
       FROM test_results tr
       JOIN tests t ON tr.test_id = t.id
       WHERE tr.user_id = ?
       ORDER BY tr.submitted_at DESC`,
      [req.user.id]
    );

    res.json({ results });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/results/:testId
 * Get detailed result for a specific test attempt
 */
router.get('/:testId', authenticate, async (req, res) => {
  try {
    // Get the latest result for this test
    const [results] = await pool.execute(
      `SELECT tr.*, t.title as test_title, t.type as test_type
       FROM test_results tr
       JOIN tests t ON tr.test_id = t.id
       WHERE tr.user_id = ? AND tr.test_id = ?
       ORDER BY tr.submitted_at DESC
       LIMIT 1`,
      [req.user.id, req.params.testId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'No result found for this test.' });
    }

    // Get questions with correct answers for review
    const [questions] = await pool.execute(
      'SELECT id, question_text, options, correct_answer, marks, explanation FROM test_questions WHERE test_id = ?',
      [req.params.testId]
    );

    const parsedQuestions = questions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));

    const result = results[0];
    result.answers = typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers;

    res.json({
      result,
      questions: parsedQuestions,
    });
  } catch (err) {
    console.error('Get test result error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
