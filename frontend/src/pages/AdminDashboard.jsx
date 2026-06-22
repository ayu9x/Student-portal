import { useState, useEffect } from 'react';
import { dashboardAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, overviewRes] = await Promise.all([
        dashboardAPI.getStats(),
        adminAPI.getOverview(),
      ]);
      setStats(dashRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Admin dashboard error:', err);
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

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Admin Dashboard 🛡️</h1>
        <p>Welcome back, {user?.name}. Here's your system overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-xl">
        <div className="stat-card animate-fade-in-up delay-1">
          <div className="stat-icon stat-icon-primary">👥</div>
          <div className="stat-info">
            <h3>{stats?.stats?.totalStudents || 0}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-2">
          <div className="stat-icon stat-icon-success">📝</div>
          <div className="stat-info">
            <h3>{stats?.stats?.totalTests || 0}</h3>
            <p>Total Tests</p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-3">
          <div className="stat-icon stat-icon-warning">💼</div>
          <div className="stat-info">
            <h3>{stats?.stats?.activePlacements || 0}</h3>
            <p>Active Placements</p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-4">
          <div className="stat-icon stat-icon-danger">📊</div>
          <div className="stat-info">
            <h3>{stats?.stats?.averagePerformance || 0}%</h3>
            <p>Avg Performance</p>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-xl">
        {/* Top Performers */}
        <div className="glass-card-static animate-fade-in-up delay-2">
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
            🏆 Top Performers
          </h2>
          {overview?.topPerformers?.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Avg Score</th>
                    <th>Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.topPerformers.map((p, i) => (
                    <tr key={p.email}>
                      <td>
                        <span style={{ fontSize: '1.2rem' }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 500 }}>{p.name}</p>
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{p.email}</span>
                      </td>
                      <td>
                        <span className={`text-${parseFloat(p.avg_score) >= 70 ? 'success' : 'warning'}`} style={{ fontWeight: 600 }}>
                          {parseFloat(p.avg_score).toFixed(1)}%
                        </span>
                      </td>
                      <td>{p.tests_taken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h3>No data yet</h3>
              <p>Results will appear once students take tests</p>
            </div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="glass-card-static animate-fade-in-up delay-3">
          <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
            🏛️ Department Distribution
          </h2>
          {stats?.departments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {stats.departments.map((dept) => {
                const total = stats.departments.reduce((sum, d) => sum + d.count, 0);
                const pct = ((dept.count / total) * 100).toFixed(0);
                return (
                  <div key={dept.department}>
                    <div className="flex justify-between items-center mb-sm">
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>{dept.department}</span>
                      <span className="text-primary" style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                        {dept.count} student{dept.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏛️</div>
              <h3>No departments</h3>
              <p>Student profiles will populate department data</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Test Submissions */}
      <div className="glass-card-static animate-fade-in-up delay-4">
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
          📋 Recent Test Submissions
        </h2>
        {stats?.recentResults?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentResults.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                    <td>{r.test_title}</td>
                    <td>{r.score}/{r.total}</td>
                    <td>
                      <span className={`badge badge-${r.percentage >= 70 ? 'success' : r.percentage >= 40 ? 'warning' : 'danger'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No submissions yet</h3>
            <p>Test results will appear here as students complete tests</p>
          </div>
        )}
      </div>
    </div>
  );
}
