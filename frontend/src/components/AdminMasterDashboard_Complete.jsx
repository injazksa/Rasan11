import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Key, Eye, UserX, UserCheck, Search, Database, Fingerprint, Loader2,
  Plus, Edit, Trash2, Mail, Lock, Ban, CheckCircle, AlertCircle, TrendingUp,
  BarChart3, Users, DollarSign, Package, Gavel, MapPin, Settings, Download,
  Filter, ChevronDown, X, Send, FileText, Clock, Bell, ChevronRight, RefreshCw,
  Home, LogOut, ArrowUp, ArrowDown
} from 'lucide-react';
import { adminAPI, handleApiError, notificationsAPI } from '../services/api';

const AdminMasterDashboard = () => {
  // ============ State Management ============
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_revenue: 0,
    active_auctions: 0,
    pending_orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Approvals
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ============ Data Fetching ============
  const fetchDashboardData = useCallback(async () => {
    try {
      setErrorMessage('');
      const [usersRes, statsRes, approvalsRes] = await Promise.all([
        adminAPI.getUsers({ role: filterRole, status: filterStatus, country: filterCountry }),
        adminAPI.getStats(),
        adminAPI.getApprovals(),
      ]);

      setUsers(usersRes.data || []);
      setStats(statsRes.data || {});
      setPendingApprovals(approvalsRes.data || []);
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(apiError.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterRole, filterStatus, filterCountry]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.getNotifications();
      const notifs = res.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  // ============ Effects ============
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    
    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(fetchDashboardData, 30000);
    const notifInterval = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(interval);
      clearInterval(notifInterval);
    };
  }, [fetchDashboardData, fetchNotifications]);

  // ============ User Management Functions ============
  const handleApproveUser = async (req) => {
    setProcessingId(req.id);
    try {
      await adminAPI.approveUser({
        userId: req.id,
        userEmail: req.email,
        userName: req.full_name,
        userRole: req.role || 'owner',
        country: req.country || 'Unknown',
      });

      setPendingApprovals(prev => prev.filter(item => item.id !== req.id));
      setSuccessMessage(`✅ تم اعتماد ${req.full_name} بنجاح`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(`❌ ${apiError.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectUser = async (req) => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    setProcessingId(req.id);
    try {
      await adminAPI.rejectUser({ userId: req.id, reason });
      setPendingApprovals(prev => prev.filter(item => item.id !== req.id));
      setSuccessMessage(`✅ تم رفض طلب ${req.full_name}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(`❌ ${apiError.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBlockUser = async (userId) => {
    const reason = prompt('أدخل سبب الحظر:');
    if (!reason) return;

    try {
      await adminAPI.blockUser(userId, reason);
      setSuccessMessage('✅ تم حظر المستخدم بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDashboardData();
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(`❌ ${apiError.message}`);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminAPI.unblockUser(userId);
      setSuccessMessage('✅ تم فك حظر المستخدم بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDashboardData();
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(`❌ ${apiError.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword) {
      setErrorMessage('❌ يرجى إدخال كلمة المرور الجديدة');
      return;
    }

    try {
      await adminAPI.resetUserPassword(selectedUser.id, formData.newPassword);
      setSuccessMessage('✅ تم تحديث كلمة المرور بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      handleCloseModal();
      fetchDashboardData();
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(`❌ ${apiError.message}`);
    }
  };

  const handleSendEmail = async () => {
    if (!formData.message) {
      setErrorMessage('❌ يرجى إدخال الرسالة');
      return;
    }

    try {
      await adminAPI.sendEmail(selectedUser.id, {
        email: selectedUser.email,
        type: 'notification',
        subject: formData.subject || 'إشعار من مدير النظام',
        message: formData.message,
      });
      setSuccessMessage('✅ تم إرسال الرسالة بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      handleCloseModal();
    } catch (err) {
      const apiError = handleApiError(err);
      setErrorMessage(`❌ ${apiError.message}`);
    }
  };

  // ============ Modal Functions ============
  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setFormData(user || {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedUser(null);
    setFormData({});
  };

  // ============ Filtering ============
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ Render ============
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mb-4" size={48} />
          <p className="text-gray-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] text-[#E0E0E0] p-4 md:p-8 font-serif" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-[#D4AF37]/30 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#D4AF37] tracking-widest flex items-center gap-3 flex-wrap">
              <Fingerprint size={36} /> لوحة التحكم المطلقة
            </h1>
            <p className="text-gray-400 text-xs mt-2 uppercase tracking-[0.4em]">نظام إدارة منظومة رَسَن الكاملة</p>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            تحديث
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-6 rounded-2xl hover:border-[#D4AF37]/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase">إجمالي المستخدمين</div>
                <div className="text-3xl font-bold text-[#D4AF37] mt-2">{stats.total_users || 0}</div>
              </div>
              <Users size={32} className="text-[#D4AF37]/30" />
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-6 rounded-2xl hover:border-[#D4AF37]/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase">الإيرادات الكلية</div>
                <div className="text-3xl font-bold text-green-400 mt-2">${(stats.total_revenue || 0).toLocaleString()}</div>
              </div>
              <DollarSign size={32} className="text-green-400/30" />
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-6 rounded-2xl hover:border-[#D4AF37]/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase">المزادات النشطة</div>
                <div className="text-3xl font-bold text-blue-400 mt-2">{stats.active_auctions || 0}</div>
              </div>
              <Gavel size={32} className="text-blue-400/30" />
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-6 rounded-2xl hover:border-[#D4AF37]/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase">الطلبات المعلقة</div>
                <div className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending_orders || 0}</div>
              </div>
              <Package size={32} className="text-yellow-400/30" />
            </div>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-2">
            <AlertCircle size={20} />
            {errorMessage}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#333] mb-8">
        {[
          { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
          { id: 'users', label: 'إدارة المستخدمين', icon: Users },
          { id: 'approvals', label: 'طلبات الموافقة', icon: CheckCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-[#D4AF37] text-black'
                : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="ابحث عن المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg text-white placeholder-gray-500 focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg text-white focus:border-[#D4AF37] outline-none transition-colors"
              >
                <option value="">جميع الأدوار</option>
                <option value="admin">مدير</option>
                <option value="owner">مالك</option>
                <option value="doctor">طبيب</option>
                <option value="vendor">بائع</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg text-white focus:border-[#D4AF37] outline-none transition-colors"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="blocked">محظور</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0F0F0F] border-b border-[#D4AF37]/20">
                  <tr>
                    <th className="px-6 py-4 text-right font-bold text-[#D4AF37]">الاسم</th>
                    <th className="px-6 py-4 text-right font-bold text-[#D4AF37]">البريد</th>
                    <th className="px-6 py-4 text-right font-bold text-[#D4AF37]">الدور</th>
                    <th className="px-6 py-4 text-right font-bold text-[#D4AF37]">الحالة</th>
                    <th className="px-6 py-4 text-right font-bold text-[#D4AF37]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-[#333] hover:bg-[#0F0F0F]/50 transition-colors">
                      <td className="px-6 py-4">{user.full_name || user.username}</td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-xs font-bold">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal('email', user)}
                            className="p-2 hover:bg-[#D4AF37]/20 rounded-lg transition-colors"
                            title="إرسال رسالة"
                          >
                            <Mail size={16} className="text-[#D4AF37]" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleBlockUser(user.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="حظر المستخدم"
                            >
                              <Ban size={16} className="text-red-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(user.id)}
                              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="فك الحظر"
                            >
                              <CheckCircle size={16} className="text-green-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal('password', user)}
                            className="p-2 hover:bg-[#D4AF37]/20 rounded-lg transition-colors"
                            title="تغيير كلمة المرور"
                          >
                            <Lock size={16} className="text-[#D4AF37]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p>لا توجد طلبات معلقة</p>
            </div>
          ) : (
            pendingApprovals.map(req => (
              <div key={req.id} className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-6 rounded-2xl flex items-center justify-between hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{req.full_name}</h3>
                  <p className="text-gray-400 text-sm">{req.email}</p>
                  <p className="text-gray-500 text-xs mt-1">الدولة: {req.country} | الدور: {req.role}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveUser(req)}
                    disabled={processingId === req.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {processingId === req.id ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    موافقة
                  </button>
                  <button
                    onClick={() => handleRejectUser(req)}
                    disabled={processingId === req.id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    <X size={18} />
                    رفض
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#D4AF37]">
                {modalType === 'email' && 'إرسال رسالة'}
                {modalType === 'password' && 'تغيير كلمة المرور'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {modalType === 'email' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="الموضوع"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg text-white placeholder-gray-500 focus:border-[#D4AF37] outline-none"
                />
                <textarea
                  placeholder="الرسالة"
                  value={formData.message || ''}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg text-white placeholder-gray-500 focus:border-[#D4AF37] outline-none"
                />
                <button
                  onClick={handleSendEmail}
                  className="w-full px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  إرسال
                </button>
              </div>
            )}

            {modalType === 'password' && (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={formData.newPassword || ''}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg text-white placeholder-gray-500 focus:border-[#D4AF37] outline-none"
                />
                <button
                  onClick={handleResetPassword}
                  className="w-full px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  تحديث
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMasterDashboard;
