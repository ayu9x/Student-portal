import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../services/api';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    fetchTest();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const fetchTest = async () => {
    try {
      const res = await testsAPI.getById(id);
      setTest(res.data.test);
      setQuestions(res.data.questions);
      setTimeLeft(res.data.test.duration_minutes * 60);
      startTimeRef.current = Date.now();

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Fetch test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    // Auto-submit when time runs out
    handleSubmit(true);
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return;
    }

    clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await testsAPI.submit(id, answers, timeTaken);
      setResult(res.data.result);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show result after submission
  if (result) {
    return (
      <div className="animate-fade-in-up" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card-static" style={{ padding: 'var(--space-3xl)' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: 'var(--space-lg)' }}>
            {result.percentage >= 70 ? '🎉' : result.percentage >= 40 ? '👍' : '💪'}
          </span>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-md)' }}>
            Test Complete!
          </h1>

          <div style={{
            fontSize: '4rem', fontWeight: 800, marginBottom: 'var(--space-md)',
            background: `linear-gradient(135deg, ${result.percentage >= 70 ? 'var(--color-success)' : result.percentage >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'}, var(--color-primary))`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {result.percentage}%
          </div>

          <p className="text-secondary" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
            Score: <strong>{result.score}</strong> / <strong>{result.total}</strong>
          </p>

          <div className="progress-bar mb-xl" style={{ height: 12 }}>
            <div
              className={`progress-fill progress-fill-${result.percentage >= 70 ? 'success' : result.percentage >= 40 ? 'warning' : 'danger'}`}
              style={{ width: `${result.percentage}%` }}
            ></div>
          </div>

          <div className="flex gap-md justify-center">
            <button className="btn btn-primary" onClick={() => navigate('/results')}>
              📊 View Detailed Results
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/tests')}>
              📝 More Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const answered = Object.keys(answers).length;
  const isUrgent = timeLeft <= 60;

  return (
    <div className="animate-fade-in">
      {/* Test Header */}
      <div className="glass-card-static mb-lg">
        <div className="flex justify-between items-center flex-wrap gap-md">
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{test?.title}</h2>
            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              Question {currentQ + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-lg">
            <div style={{ textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>Answered</span>
              <span className="text-primary" style={{ fontWeight: 600 }}>{answered}/{questions.length}</span>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: isUrgent ? 'var(--color-danger-glow)' : 'var(--color-bg-glass)',
              border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)'}`,
              animation: isUrgent ? 'pulse 1s infinite' : 'none',
            }}>
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>Time Left</span>
              <span className={isUrgent ? 'text-danger' : 'text-success'} style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar mt-md">
          <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card-static mb-lg animate-fade-in-up" style={{ minHeight: 300 }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="badge badge-primary mb-md">Question {currentQ + 1}</span>
          <h3 style={{ fontSize: 'var(--font-size-xl)', lineHeight: 1.6, marginTop: 'var(--space-md)' }}>
            {question?.question_text}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {question?.options?.map((option, idx) => {
            const isSelected = answers[question.id] === option;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  background: isSelected ? 'var(--color-primary-glow)' : 'var(--color-bg-glass)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-base)',
                  color: isSelected ? 'var(--color-primary-light)' : 'var(--color-text-primary)',
                  width: '100%',
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-full)',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--font-size-sm)', fontWeight: 600, flexShrink: 0,
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--color-text-muted)',
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          className="btn btn-secondary"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((p) => p - 1)}
        >
          ← Previous
        </button>

        <div className="flex gap-sm">
          {/* Question dots */}
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: i === currentQ
                  ? 'var(--color-primary)'
                  : answers[q.id]
                    ? 'var(--color-success)'
                    : 'var(--color-bg-tertiary)',
                transition: 'all 0.2s',
              }}
              title={`Question ${i + 1}`}
            />
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentQ((p) => p + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : '✅ Submit Test'}
          </button>
        )}
      </div>
    </div>
  );
}
