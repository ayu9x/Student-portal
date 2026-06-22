import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import TrainingMaterials from './pages/TrainingMaterials';
import Tests from './pages/Tests';
import TakeTest from './pages/TakeTest';
import Results from './pages/Results';
import PlacementNotices from './pages/PlacementNotices';
import { adminAPI } from './services/api';
import './App.css';

/* ==========================================
   Admin Students Page (inline)
   ========================================== */
function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await adminAPI.getStudents({ search: search || undefined });
      setStudents(res.data.students);
    } catch (err) {
      console.error('Admin students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchStudents();
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>Student Management 👥</h1>
        <p>View and manage all registered students</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-md mb-xl">
        <input
          className="form-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
        <button type="submit" className="btn btn-primary">🔍 Search</button>
      </form>

      {students.length > 0 ? (
        <div className="table-container glass-card-static" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Year</th>
                <th>CGPA</th>
                <th>Skills</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'white',
                      }}>
                        {s.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.name}</p>
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.department || '—'}</td>
                  <td>{s.year ? `Year ${s.year}` : '—'}</td>
                  <td>
                    {s.cgpa ? (
                      <span className={`text-${parseFloat(s.cgpa) >= 8 ? 'success' : parseFloat(s.cgpa) >= 6 ? 'warning' : 'danger'}`} style={{ fontWeight: 600 }}>
                        {s.cgpa}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div className="flex gap-sm flex-wrap">
                      {s.skills ? s.skills.split(',').slice(0, 3).map((sk) => (
                        <span key={sk.trim()} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{sk.trim()}</span>
                      )) : '—'}
                    </div>
                  </td>
                  <td className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon">👥</div>
          <h3>No students found</h3>
          <p>No students match your search criteria</p>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   Layout Component
   ========================================== */
function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

/* ==========================================
   App Layout with Routes
   ========================================== */
function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <Login />
      } />

      {/* Student Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['student']}><Layout><StudentDashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute roles={['student']}><Layout><Profile /></Layout></ProtectedRoute>
      } />
      <Route path="/training" element={
        <ProtectedRoute roles={['student']}><Layout><TrainingMaterials /></Layout></ProtectedRoute>
      } />
      <Route path="/tests" element={
        <ProtectedRoute roles={['student']}><Layout><Tests /></Layout></ProtectedRoute>
      } />
      <Route path="/tests/:id" element={
        <ProtectedRoute roles={['student']}><Layout><TakeTest /></Layout></ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute roles={['student']}><Layout><Results /></Layout></ProtectedRoute>
      } />
      <Route path="/placements" element={
        <ProtectedRoute roles={['student']}><Layout><PlacementNotices /></Layout></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute roles={['admin']}><Layout><AdminStudents /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/training" element={
        <ProtectedRoute roles={['admin']}><Layout><TrainingMaterials /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/tests" element={
        <ProtectedRoute roles={['admin']}><Layout><Tests /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/placements" element={
        <ProtectedRoute roles={['admin']}><Layout><PlacementNotices /></Layout></ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

/* ==========================================
   Root App Component
   ========================================== */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
