import { createContext, useState, useEffect, useRef, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  const stopSessionRef = useRef(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    const savedUser  = localStorage.getItem('btp_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const registerStopSession = (fn) => {
    stopSessionRef.current = fn;
  };

  const login = (newToken, newUser) => {
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('btp_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    // Stop any active session before logging out
    if (stopSessionRef.current) {
      try { await stopSessionRef.current(); } catch (e) {}
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('btp_user');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      login,
      logout,
      registerStopSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
