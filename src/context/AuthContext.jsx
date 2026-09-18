import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('prismoUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role.toLowerCase(),
        token: data.token
      };

      setCurrentUser(user);
      localStorage.setItem('prismoUser', JSON.stringify(user));
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Registration failed');
      }

      const data = await response.json();
      
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role.toLowerCase(),
        token: data.token
      };

      setCurrentUser(user);
      localStorage.setItem('prismoUser', JSON.stringify(user));
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to send OTP');
      }
      return await response.text();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Password reset failed');
      }
      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prismoUser');
  };

  const value = {
    currentUser,
    login,
    register,
    requestPasswordReset,
    resetPassword,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
