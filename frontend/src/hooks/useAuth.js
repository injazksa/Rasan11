/**
 * Hook مخصص لإدارة حالة المصادقة والمستخدم
 * يوفر وظائف للتحقق من صحة التوكن وتحديث بيانات المستخدم
 */

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, isTokenValid, logout } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // تهيئة حالة المصادقة عند تحميل الـ Hook
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('rasan_token');
      const storedUser = getCurrentUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // دالة لتحديث بيانات المستخدم
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  // دالة لتسجيل الخروج
  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    logout();
  }, []);

  // دالة للتحقق من صحة التوكن
  const checkAuth = useCallback(() => {
    const valid = isTokenValid();
    setIsAuthenticated(valid);
    return valid;
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    updateUser,
    handleLogout,
    checkAuth,
  };
};

export default useAuth;
