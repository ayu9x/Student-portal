import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedToken = localStorage.getItem('talenttrack_token');
    const savedUser = localStorage.getItem('talenttrack_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('talenttrack_token');
        localStorage.removeItem('talenttrack_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('talenttrack_token', authToken);
    localStorage.setItem('talenttrack_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('talenttrack_token');
    localStorage.removeItem('talenttrack_user');
  };

  const isAdmin = () => user?.role === 'admin';
  const isStudent = () => user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAdmin, isStudent }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
