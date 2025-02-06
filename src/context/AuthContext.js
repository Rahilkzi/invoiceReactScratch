import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const user = localStorage.getItem('currentUser');
      setIsAuthenticated(authStatus);
      setCurrentUser(user);
    };

    checkAuth();
  }, []);

  const login = (username) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', username);
    setIsAuthenticated(true);
    setCurrentUser(username);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
