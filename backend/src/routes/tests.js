const express = require('express');
const { pool } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/tests
 * Get all available tests
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { type } = req.query;
    let query = `SELECT t.*, u.name as creator_name,
                   (SELECT COUNT(*) FROM test_questions WHERE test_id = t.id) as question_count
                 FROM tests t
                 LEFT JOIN users u ON t.created_by = u.id
                 WHERE t.is_active = TRUE`;
    const params = [];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tests] = await pool.execute(query, params);

    // For each test, check if the current user has already taken it
    for (const test of tests) {
      const [results] = await pool.execute(
        'SELECT id, score, total, percentage, submitted_at FROM test_results WHERE user_id = ? AND test_id = ? ORDER BY submitted_at DESC LIMIT 1',
        [req.user.id, test.id]
      );
      test.lastAttempt = results.length > 0 ? results[0] : null;
    }

    res.json({ tests });
  } catch (err) {
    console.error('Get tests error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/tests/:id
 * Get test details with questions (for taking the test)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [tests] = await pool.execute('SELECT * FROM tests WHERE id = ? AND is_active = TRUE', [req.params.id]);

    if (tests.length === 0) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    const [questions] = await pool.execute(
      'SELECT id, question_text, options, marks FROM test_questions WHERE test_id = ? ORDER BY id',
      [req.params.id]
    );

    // Parse JSON options
    const parsedQuestions = questions.map((q) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));

    res.json({
      test: tests[0],
      questions: parsedQuestions,
    });
  } catch (err) {
    console.error('Get test details error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tests/:id/submit
 * Submit test answers and get results
 */
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const testId = req.params.id;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers are required.' });
    }

    // Get test info
    const [tests] = await pool.execute('SELECT * FROM tests WHERE id = ?', [testId]);
    if (tests.length === 0) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    // Get questions with correct answers
    const [questions] = await pool.execute(
      'SELECT id, correct_answer, marks FROM test_questions WHERE test_id = ?',
      [testId]
    );

    // Calculate score
    let score = 0;
    const total = questions.reduce((sum, q) => sum + q.marks, 0);

    for (const question of questions) {
      const userAnswer = answers[question.id.toString()];
      if (userAnswer && userAnswer === question.correct_answer) {
        score += question.marks;
      }
    }

    const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : 0;

    // Save result
    const [result] = await pool.execute(
      `INSERT INTO test_results (user_id, test_id, score, total, percentage, answers, time_taken_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, testId, score, total, percentage, JSON.stringify(answers), timeTaken || null]
    );

    res.json({
      message: 'Test submitted successfully',
      result: {
        id: result.insertId,
        score,
        total,
        percentage: parseFloat(percentage),
        timeTaken,
      },
    });
  } catch (err) {
    console.error('Submit test error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tests
 * Create a new test (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, type, duration_minutes, total_marks, questions } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO tests (title, description, type, duration_minutes, total_marks, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, type, duration_minutes || 30, total_marks || 100, req.user.id]
    );

    // Insert questions if provided
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        await pool.execute(
          `INSERT INTO test_questions (test_id, question_text, options, correct_answer, marks, explanation)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [result.insertId, q.question_text, JSON.stringify(q.options), q.correct_answer, q.marks || 1, q.explanation]
        );
      }
    }

    res.status(201).json({
      message: 'Test created successfully',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Create test error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
