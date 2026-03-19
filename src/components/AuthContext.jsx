import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || isTokenExpired(storedToken)) {
      // Clear storage if expired
      localStorage.removeItem('token');
      setAuthenticated(false);
      setToken(null);
      navigate("/login", { replace: true });
    } else {
      setToken(storedToken);
      setAuthenticated(true);
    }
  }, [navigate]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    setToken(null);
    setAuthenticated(false);
    navigate("/login", { replace: true });
  };
  return (
    <AuthContext.Provider value={{ token, authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
