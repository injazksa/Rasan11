import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const token = localStorage.getItem('rasan_token');
        const userStr = localStorage.getItem('user');

        // إذا لم يكن هناك توكن، أعد التوجيه إلى صفحة الدخول
        if (!token || !userStr) {
          setRedirectPath('/login');
          setIsLoading(false);
          return;
        }

        // محاولة تحليل بيانات المستخدم
        let user;
        try {
          user = JSON.parse(userStr);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setRedirectPath('/login');
          setIsLoading(false);
          return;
        }

        // تحقق من أن المستخدم نشط أو مدير
        if (user.status !== 'active' && user.role !== 'admin') {
          setRedirectPath('/login');
          setIsLoading(false);
          return;
        }

        // إذا كان هناك دور مطلوب، تحقق من أن المستخدم لديه هذا الدور
        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
          setRedirectPath('/unauthorized');
          setIsLoading(false);
          return;
        }

        // إذا مرت جميع الفحوصات، السماح بالوصول
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setRedirectPath('/login');
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  // عرض شاشة التحميل أثناء التحقق
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={48} />
          <p className="text-gray-400">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // إذا كان هناك مسار إعادة توجيه، قم بإعادة التوجيه
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  // إذا كان المستخدم مصرح، اعرض الـ children
  return isAuthorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
