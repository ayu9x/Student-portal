import { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentAPI.getProfile();
      setProfile(res.data.profile);
      setForm(res.data.profile);
    } catch (err) {
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await studentAPI.updateProfile(form);
      setMessage('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        <div className="flex justify-between items-center">
          <div>
            <h1>My Profile 👤</h1>
            <p>Manage your personal and academic information</p>
          </div>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)} id="edit-profile-btn">
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'} mb-lg`}>
          {message}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="glass-card-static mb-xl" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-success))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700, color: 'white', flexShrink: 0
        }}>
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-xs)' }}>
            {profile?.name}
          </h2>
          <p className="text-secondary">{profile?.email}</p>
          <div className="flex gap-sm mt-sm">
            <span className="badge badge-primary">{profile?.role}</span>
            {profile?.department && (
              <span className="badge badge-info">{profile.department}</span>
            )}
            {profile?.year && (
              <span className="badge badge-warning">Year {profile.year}</span>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave}>
          <div className="grid-2 mb-lg">
            <div className="glass-card-static">
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                📋 Personal Info
              </h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Your phone number" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder="Your address" />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-input" value={form.linkedin_url || ''} onChange={(e) => handleChange('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <div className="glass-card-static">
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>
                🎓 Academic Info
              </h3>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={form.department || ''} onChange={(e) => handleChange('department', e.target.value)}>
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select className="form-select" value={form.year || ''} onChange={(e) => handleChange('year', e.target.value)}>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CGPA</label>
                <input className="form-input" type="number" step="0.01" min="0" max="10" value={form.cgpa || ''} onChange={(e) => handleChange('cgpa', e.target.value)} placeholder="e.g., 8.50" />
              </div>
              <div className="form-group">
                <label className="form-label">Skills</label>
                <textarea className="form-textarea" value={form.skills || ''} onChange={(e) => handleChange('skills', e.target.value)} placeholder="e.g., Java, Python, React, SQL" />
              </div>
            </div>
          </div>

          <div className="flex gap-md">
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm(profile); }}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid-2">
          <div className="glass-card-static">
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>📋 Personal Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { label: 'Phone', value: profile?.phone },
                { label: 'Address', value: profile?.address },
                { label: 'LinkedIn', value: profile?.linkedin_url },
                { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : null },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: '2px' }}>{label}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card-static">
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-lg)' }}>🎓 Academic Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { label: 'Department', value: profile?.department },
                { label: 'Year', value: profile?.year ? `Year ${profile.year}` : null },
                { label: 'CGPA', value: profile?.cgpa },
                { label: 'Skills', value: profile?.skills },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', display: 'block', marginBottom: '2px' }}>{label}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>
                    {label === 'Skills' && value ? (
                      <div className="flex gap-sm flex-wrap mt-sm">
                        {value.split(',').map((s) => (
                          <span key={s.trim()} className="badge badge-primary">{s.trim()}</span>
                        ))}
                      </div>
                    ) : value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
