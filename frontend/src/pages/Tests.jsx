import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testsAPI } from '../services/api';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, [typeFilter]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await testsAPI.getAll(typeFilter || undefined);
      setTests(res.data.tests);
    } catch (err) {
      console.error('Tests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'aptitude': return '🧮';
      case 'psychometric': return '🧠';
      case 'mock-interview': return '🎤';
      case 'technical': return '💻';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'aptitude': return 'primary';
      case 'psychometric': return 'info';
      case 'mock-interview': return 'warning';
      case 'technical': return 'success';
      default: return 'primary';
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Tests & Assessments 📝</h1>
        <p>Take aptitude, psychometric, and mock tests to track your readiness</p>
      </div>

      {/* Type Filter */}
      <div className="flex gap-sm flex-wrap mb-xl">
        {[
          { value: '', label: 'All Tests' },
          { value: 'aptitude', label: 'Aptitude' },
          { value: 'psychometric', label: 'Psychometric' },
          { value: 'technical', label: 'Technical' },
          { value: 'mock-interview', label: 'Mock Interview' },
        ].map((t) => (
          <button
            key={t.value}
            className={`btn ${typeFilter === t.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setTypeFilter(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : tests.length > 0 ? (
        <div className="grid-2">
          {tests.map((test, i) => (
            <div key={test.id} className="glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-md mb-md">
                <span style={{ fontSize: '2.5rem' }}>{getTypeIcon(test.type)}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{test.title}</h3>
                  <span className={`badge badge-${getTypeColor(test.type)}`} style={{ marginTop: '4px' }}>
                    {test.type.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {test.description && (
                <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                  {test.description}
                </p>
              )}

              <div className="flex gap-lg mb-lg" style={{ fontSize: 'var(--font-size-sm)' }}>
                <div>
                  <span className="text-muted">⏱️ Duration</span>
                  <p style={{ fontWeight: 500 }}>{test.duration_minutes} min</p>
                </div>
                <div>
                  <span className="text-muted">❓ Questions</span>
                  <p style={{ fontWeight: 500 }}>{test.question_count}</p>
                </div>
                <div>
                  <span className="text-muted">📊 Total Marks</span>
                  <p style={{ fontWeight: 500 }}>{test.total_marks}</p>
                </div>
              </div>

              {test.lastAttempt ? (
                <div style={{
                  background: 'var(--color-bg-glass)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md)',
                  marginBottom: 'var(--space-md)',
                }}>
                  <div className="flex justify-between items-center">
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>Last Attempt</span>
                    <span className={`text-${test.lastAttempt.percentage >= 70 ? 'success' : test.lastAttempt.percentage >= 40 ? 'warning' : 'danger'}`}
                      style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                      {test.lastAttempt.percentage}%
                    </span>
                  </div>
                  <div className="progress-bar mt-sm">
                    <div
                      className={`progress-fill progress-fill-${test.lastAttempt.percentage >= 70 ? 'success' : test.lastAttempt.percentage >= 40 ? 'warning' : 'danger'}`}
                      style={{ width: `${test.lastAttempt.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-sm">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => navigate(`/tests/${test.id}`)}
                >
                  {test.lastAttempt ? '🔄 Retake Test' : '▶️ Start Test'}
                </button>
                {test.lastAttempt && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate('/results')}
                  >
                    📊 Results
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon">📝</div>
          <h3>No tests available</h3>
          <p>Check back later for new assessments</p>
        </div>
      )}
    </div>
  );
}
