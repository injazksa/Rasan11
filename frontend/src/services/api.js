/**
 * خدمة API موحدة للتعامل مع جميع استدعاءات الـ Backend
 * توفر طبقة وسيطة بين الـ Frontend والـ Backend
 * تتعامل مع المصادقة والأخطاء والتحديثات الديناميكية
 */

import axios from 'axios';

// إعداد قاعدة الـ URL للـ API
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// إنشاء instance من axios مع الإعدادات الافتراضية
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor لإضافة التوكن إلى كل طلب
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rasan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor للتعامل مع الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا كان الخطأ 401 (غير مصرح)، قم بتسجيل الخروج
    if (error.response?.status === 401) {
      localStorage.removeItem('rasan_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Authentication APIs ============

export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (userData) =>
    apiClient.post('/auth/register', userData),
  
  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// ============ Admin APIs ============

export const adminAPI = {
  // Users Management
  getUsers: (params = {}) =>
    apiClient.get('/admin/users', { params }),
  
  getUserById: (userId) =>
    apiClient.get(`/admin/user/${userId}`),
  
  updateUser: (userId, userData) =>
    apiClient.put(`/admin/user/${userId}`, userData),
  
  blockUser: (userId, reason) =>
    apiClient.post(`/admin/user/${userId}/block`, { reason }),
  
  unblockUser: (userId) =>
    apiClient.post(`/admin/user/${userId}/unblock`, {}),
  
  resetUserPassword: (userId, password) =>
    apiClient.post(`/admin/user/${userId}/password`, { password }),
  
  sendEmail: (userId, emailData) =>
    apiClient.post(`/admin/user/${userId}/send-email`, emailData),
  
  requestDocument: (userId, documentData) =>
    apiClient.post(`/admin/user/${userId}/request-document`, documentData),
  
  sendPasswordReset: (userId) =>
    apiClient.post(`/admin/user/${userId}/send-password-reset`, {}),
  
  changePermissions: (userId, role) =>
    apiClient.post(`/admin/user/${userId}/permissions`, { role }),
  
  // Approvals
  getApprovals: () =>
    apiClient.get('/admin/approvals'),
  
  approveUser: (approvalData) =>
    apiClient.post('/admin/approve-user', approvalData),
  
  rejectUser: (rejectData) =>
    apiClient.post('/admin/reject-user', rejectData),
  
  // Statistics
  getStats: () =>
    apiClient.get('/admin/godeye/stats'),
  
  // Auctions
  getAuctions: (params = {}) =>
    apiClient.get('/admin/auctions', { params }),
  
  // Products
  getProducts: (params = {}) =>
    apiClient.get('/admin/products', { params }),
  
  createProduct: (productData) =>
    apiClient.post('/admin/products', productData),
  
  updateProduct: (productId, productData) =>
    apiClient.put(`/admin/products/${productId}`, productData),
  
  deleteProduct: (productId) =>
    apiClient.delete(`/admin/products/${productId}`),
};

// ============ Notifications APIs ============

export const notificationsAPI = {
  getNotifications: () =>
    apiClient.get('/notifications'),
  
  markAsRead: (notificationId) =>
    apiClient.post(`/notifications/${notificationId}/read`, {}),
  
  deleteNotification: (notificationId) =>
    apiClient.delete(`/notifications/${notificationId}`),
};

// ============ Public APIs ============

export const publicAPI = {
  getRaces: () =>
    apiClient.get('/races'),
  
  getMarketplaceProducts: () =>
    apiClient.get('/marketplace/products'),
  
  getUserPoints: (userId) =>
    apiClient.get(`/user/${userId}/points`),
};

// ============ Health Check ============

export const healthCheck = () =>
  apiClient.get('/health');

// ============ Utility Functions ============

/**
 * دالة للتعامل مع الأخطاء بشكل موحد
 */
export const handleApiError = (error) => {
  if (error.response) {
    // الخادم رد برمز حالة خطأ
    return {
      status: error.response.status,
      message: error.response.data?.message || 'حدث خطأ في الخادم',
      data: error.response.data,
    };
  } else if (error.request) {
    // تم إرسال الطلب لكن لم يتم استقبال رد
    return {
      status: 0,
      message: 'لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت.',
      data: null,
    };
  } else {
    // حدث خطأ في إعداد الطلب
    return {
      status: 0,
      message: error.message || 'حدث خطأ غير متوقع',
      data: null,
    };
  }
};

/**
 * دالة للتحقق من صحة التوكن
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('rasan_token');
  return !!token;
};

/**
 * دالة للحصول على بيانات المستخدم من localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * دالة لتحديث بيانات المستخدم في localStorage
 */
export const updateCurrentUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * دالة لتسجيل الخروج
 */
export const logout = () => {
  localStorage.removeItem('rasan_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default apiClient;
