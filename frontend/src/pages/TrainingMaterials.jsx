import { useState, useEffect } from 'react';
import { trainingAPI } from '../services/api';

const CATEGORIES = [
  { value: '', label: 'All Categories', icon: '📚' },
  { value: 'aptitude', label: 'Aptitude', icon: '🧮' },
  { value: 'technical', label: 'Technical', icon: '💻' },
  { value: 'soft-skills', label: 'Soft Skills', icon: '🤝' },
  { value: 'interview-prep', label: 'Interview Prep', icon: '🎤' },
  { value: 'resume-building', label: 'Resume Building', icon: '📄' },
];

export default function TrainingMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, [category]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await trainingAPI.getAll(category || undefined);
      setMaterials(res.data.materials);
    } catch (err) {
      console.error('Training error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found?.icon || '📚';
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Training Materials 📚</h1>
        <p>Access curated learning resources to ace your placements</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-sm flex-wrap mb-xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`btn ${category === cat.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : materials.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {materials.map((mat, i) => (
            <div
              key={mat.id}
              className="glass-card animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
              onClick={() => setExpandedId(expandedId === mat.id ? null : mat.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-md">
                  <span style={{ fontSize: '2rem' }}>{getCategoryIcon(mat.category)}</span>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                      {mat.title}
                    </h3>
                    <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                      {mat.description}
                    </p>
                    <div className="flex gap-sm mt-sm items-center">
                      <span className="badge badge-primary">{mat.category}</span>
                      <span className="badge badge-info">{mat.content_type}</span>
                      {mat.author_name && (
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                          by {mat.author_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '1.25rem', transition: 'transform 0.2s', transform: expandedId === mat.id ? 'rotate(180deg)' : 'rotate(0)' }}>
                  ▾
                </span>
              </div>

              {expandedId === mat.id && mat.content && (
                <div style={{
                  marginTop: 'var(--space-lg)',
                  paddingTop: 'var(--space-lg)',
                  borderTop: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {mat.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon">📚</div>
          <h3>No materials found</h3>
          <p>No training materials available for this category yet</p>
        </div>
      )}
    </div>
  );
}
