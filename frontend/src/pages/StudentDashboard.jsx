import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  const getPerformanceColor = (pct) => {
    if (pct >= 80) return 'success';
    if (pct >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your training & placement progress overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-xl">
        <div className="stat-card animate-fade-in-up delay-1">
          <div className="stat-icon stat-icon-primary">📝</div>
          <div className="stat-info">
            <h3>{data?.stats?.testsTaken || 0}</h3>
            <p>Tests Taken</p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-2">
          <div className="stat-icon stat-icon-success">📈</div>
          <div className="stat-info">
            <h3>{data?.stats?.averageScore || 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-3">
          <div className="stat-icon stat-icon-warning">💼</div>
          <div className="stat-info">
            <h3>{data?.upcomingPlacements?.length || 0}</h3>
            <p>Active Placements</p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-4">
          <div className="stat-icon stat-icon-danger">🎯</div>
          <div className="stat-info">
            <h3>{data?.availableTests?.length || 0}</h3>
            <p>Pending Tests</p>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-xl">
        {/* Performance by Category */}
        <div className="glass-card-static animate-fade-in-up delay-2">
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
            📊 Performance by Category
          </h2>
          {data?.performanceByType?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {data.performanceByType.map((perf) => {
                const pct = parseFloat(perf.avg_percentage).toFixed(0);
                const color = getPerformanceColor(pct);
                return (
                  <div key={perf.type}>
                    <div className="flex justify-between items-center mb-sm">
                      <span style={{ fontSize: 'var(--font-size-sm)', textTransform: 'capitalize' }}>
                        {perf.type.replace('-', ' ')}
                      </span>
                      <span className={`text-${color}`} style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill progress-fill-${color}`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {perf.attempts} attempt{perf.attempts > 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No tests taken yet</h3>
              <p>Take your first test to see performance stats</p>
              <button className="btn btn-primary btn-sm mt-md" onClick={() => navigate('/tests')}>
                Browse Tests
              </button>
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="glass-card-static animate-fade-in-up delay-3">
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
            🏆 Recent Results
          </h2>
          {data?.recentResults?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {data.recentResults.map((result) => (
                <div
                  key={result.id}
                  className="glass-card"
                  style={{ padding: 'var(--space-md)', cursor: 'pointer' }}
                  onClick={() => navigate(`/results`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                        {result.test_title}
                      </p>
                      <span className={`badge badge-${result.test_type === 'aptitude' ? 'primary' : result.test_type === 'psychometric' ? 'info' : 'warning'}`}>
                        {result.test_type}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className={`text-${getPerformanceColor(result.percentage)}`} style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                        {result.percentage}%
                      </p>
                      <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                        {result.score}/{result.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h3>No results yet</h3>
              <p>Complete tests to see your results here</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Available Tests & Upcoming Placements */}
      <div className="grid-2">
        {/* Available Tests */}
        <div className="glass-card-static animate-fade-in-up delay-4">
          <div className="flex justify-between items-center mb-lg">
            <h2 style={{ fontSize: 'var(--font-size-lg)' }}>📝 Available Tests</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tests')}>View All →</button>
          </div>
          {data?.availableTests?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {data.availableTests.map((test) => (
                <div key={test.id} className="glass-card" style={{ padding: 'var(--space-md)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{test.title}</p>
                      <div className="flex gap-sm mt-sm">
                        <span className="badge badge-primary">{test.type}</span>
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                          {test.duration_minutes} min • {test.question_count} questions
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/tests')}>
                      Take
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>All caught up!</h3>
              <p>You've completed all available tests</p>
            </div>
          )}
        </div>

        {/* Upcoming Placements */}
        <div className="glass-card-static animate-fade-in-up delay-5">
          <div className="flex justify-between items-center mb-lg">
            <h2 style={{ fontSize: 'var(--font-size-lg)' }}>💼 Upcoming Placements</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/placements')}>View All →</button>
          </div>
          {data?.upcomingPlacements?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {data.upcomingPlacements.map((p) => (
                <div key={p.id} className="glass-card" style={{ padding: 'var(--space-md)' }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{p.company_name}</p>
                  <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
                    {p.role}
                  </p>
                  <div className="flex justify-between items-center mt-sm">
                    <span className="badge badge-success">{p.salary_package}</span>
                    <span className="text-warning" style={{ fontSize: 'var(--font-size-xs)' }}>
                      Deadline: {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <h3>No upcoming placements</h3>
              <p>Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
