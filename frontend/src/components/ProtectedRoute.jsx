import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('rasan_token');
  const userStr = localStorage.getItem('user');

  // إذا لم يكن هناك توكن، أعد التوجيه إلى صفحة الدخول
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان هناك توكن وكان المستخدم غير نشط (ما لم يكن مدير)
  try {
    const user = JSON.parse(userStr || '{}');
    
    // تحقق من أن المستخدم نشط أو مدير
    if (user.status !== 'active' && user.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }

    // إذا كان هناك دور مطلوب، تحقق من أن المستخدم لديه هذا الدور
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
