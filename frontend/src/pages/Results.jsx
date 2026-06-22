import { useState, useEffect } from 'react';
import { resultsAPI } from '../services/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [detailData, setDetailData] = useState({});

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await resultsAPI.getAll();
      setResults(res.data.results);
    } catch (err) {
      console.error('Results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (testId) => {
    if (detailData[testId]) return;
    try {
      const res = await resultsAPI.getByTestId(testId);
      setDetailData((prev) => ({ ...prev, [testId]: res.data }));
    } catch (err) {
      console.error('Detail error:', err);
    }
  };

  const toggleExpand = (result) => {
    if (expandedId === result.id) {
      setExpandedId(null);
    } else {
      setExpandedId(result.id);
      fetchDetail(result.test_id);
    }
  };

  const getScoreColor = (pct) => {
    if (pct >= 70) return 'success';
    if (pct >= 40) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>My Results 📈</h1>
        <p>Review your test performance and learn from your answers</p>
      </div>

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="grid-3 mb-xl">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">📝</div>
            <div className="stat-info">
              <h3>{results.length}</h3>
              <p>Tests Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">📈</div>
            <div className="stat-info">
              <h3>{(results.reduce((s, r) => s + parseFloat(r.percentage), 0) / results.length).toFixed(1)}%</h3>
              <p>Average Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">🏆</div>
            <div className="stat-info">
              <h3>{Math.max(...results.map((r) => parseFloat(r.percentage))).toFixed(1)}%</h3>
              <p>Best Score</p>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {results.map((result, i) => {
            const color = getScoreColor(result.percentage);
            const detail = detailData[result.test_id];

            return (
              <div
                key={result.id}
                className="glass-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                onClick={() => toggleExpand(result)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-md">
                    <div style={{
                      width: 56, height: 56, borderRadius: 'var(--radius-md)',
                      background: `var(--color-${color}-glow)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 700, color: `var(--color-${color})`,
                    }}>
                      {result.percentage}%
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                        {result.test_title}
                      </h3>
                      <div className="flex gap-sm items-center mt-sm">
                        <span className={`badge badge-${result.test_type === 'aptitude' ? 'primary' : result.test_type === 'psychometric' ? 'info' : 'warning'}`}>
                          {result.test_type}
                        </span>
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                          {new Date(result.submitted_at).toLocaleDateString()} at{' '}
                          {new Date(result.submitted_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-lg">
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>Score</span>
                      <span style={{ fontWeight: 600 }}>{result.score}/{result.total}</span>
                    </div>
                    <span style={{ fontSize: '1.25rem', transition: 'transform 0.2s', transform: expandedId === result.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                      ▾
                    </span>
                  </div>
                </div>

                <div className="progress-bar mt-md">
                  <div className={`progress-fill progress-fill-${color}`} style={{ width: `${result.percentage}%` }}></div>
                </div>

                {/* Expanded detail */}
                {expandedId === result.id && detail && (
                  <div style={{
                    marginTop: 'var(--space-lg)',
                    paddingTop: 'var(--space-lg)',
                    borderTop: '1px solid var(--color-border)',
                  }}>
                    <h4 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      Answer Review
                    </h4>
                    {detail.questions?.map((q, qi) => {
                      const userAnswer = detail.result?.answers?.[q.id.toString()];
                      const isCorrect = userAnswer === q.correct_answer;
                      return (
                        <div key={q.id} style={{
                          padding: 'var(--space-md)',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : userAnswer ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-bg-glass)',
                          border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : userAnswer ? 'rgba(239, 68, 68, 0.2)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-md)',
                          marginBottom: 'var(--space-sm)',
                        }}>
                          <div className="flex items-center gap-sm mb-sm">
                            <span>{isCorrect ? '✅' : userAnswer ? '❌' : '⏭️'}</span>
                            <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>Q{qi + 1}: {q.question_text}</span>
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', marginLeft: 'var(--space-xl)' }}>
                            {userAnswer && !isCorrect && (
                              <p className="text-danger">Your answer: {userAnswer}</p>
                            )}
                            <p className="text-success">Correct answer: {q.correct_answer}</p>
                            {q.explanation && (
                              <p className="text-muted mt-sm">💡 {q.explanation}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon">📈</div>
          <h3>No results yet</h3>
          <p>Complete your first test to see results here</p>
        </div>
      )}
    </div>
  );
}
