import { useState, useEffect } from 'react';
import { placementsAPI } from '../services/api';

export default function PlacementNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await placementsAPI.getAll();
      setNotices(res.data.notices);
    } catch (err) {
      console.error('Placements error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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
        <h1>Placement Notices 💼</h1>
        <p>Browse current placement opportunities and apply before the deadline</p>
      </div>

      {notices.length > 0 ? (
        <div className="grid-2">
          {notices.map((notice, i) => {
            const daysLeft = getDaysLeft(notice.deadline);
            const isUrgent = daysLeft <= 7 && daysLeft > 0;
            const isExpired = daysLeft <= 0;

            return (
              <div
                key={notice.id}
                className="glass-card animate-fade-in-up"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  borderColor: isUrgent ? 'rgba(245, 158, 11, 0.3)' : isExpired ? 'rgba(239, 68, 68, 0.2)' : undefined,
                }}
              >
                {/* Company Header */}
                <div className="flex items-center gap-md mb-md">
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--color-primary-glow), var(--color-bg-tertiary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary-light)',
                    border: '1px solid var(--color-border)',
                  }}>
                    {notice.company_name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{notice.company_name}</h3>
                    <p className="text-primary" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                      {notice.role}
                    </p>
                  </div>
                  {isExpired ? (
                    <span className="badge badge-danger">Expired</span>
                  ) : isUrgent ? (
                    <span className="badge badge-warning" style={{ animation: 'pulse 2s infinite' }}>
                      {daysLeft}d left
                    </span>
                  ) : (
                    <span className="badge badge-success">{daysLeft}d left</span>
                  )}
                </div>

                {/* Description */}
                {notice.description && (
                  <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                    {notice.description}
                  </p>
                )}

                {/* Details Grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)',
                  padding: 'var(--space-md)', background: 'var(--color-bg-glass)',
                  borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>💰 Package</span>
                    <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                      {notice.salary_package || 'Not disclosed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>📍 Location</span>
                    <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                      {notice.location || 'Multiple'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>🎯 Min CGPA</span>
                    <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                      {notice.min_cgpa || 'No requirement'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block' }}>📅 Deadline</span>
                    <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                      {new Date(notice.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Eligibility */}
                {notice.eligibility && (
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: '4px' }}>
                      📋 Eligibility
                    </span>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {notice.eligibility}
                    </p>
                  </div>
                )}

                {/* Apply Button */}
                {!isExpired && (
                  <button
                    className="btn btn-primary btn-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (notice.apply_link) {
                        window.open(notice.apply_link, '_blank');
                      } else {
                        alert('Application link will be shared by the placement cell.');
                      }
                    }}
                  >
                    🚀 Apply Now
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon">💼</div>
          <h3>No placement notices</h3>
          <p>New placement opportunities will be posted here</p>
        </div>
      )}
    </div>
  );
}
