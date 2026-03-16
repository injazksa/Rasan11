import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Key, Eye, UserX, UserCheck, Search, Database, Fingerprint, Loader2,
  Plus, Edit, Trash2, Mail, Lock, Ban, CheckCircle, AlertCircle, TrendingUp,
  BarChart3, Users, DollarSign, Package, Gavel, MapPin, Settings, Download,
  Filter, ChevronDown, X, Send, FileText, Clock
} from 'lucide-react';
import axios from 'axios';
import AdminAuctionsManagement from './AdminAuctionsManagement';
import AdminProductsManagement from './AdminProductsManagement';

const GodEyeDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [permissions, setPermissions] = useState({});

  // نظام الصلاحيات - مرتب من الأقوى للأضعف
  const permissionsHierarchy = {
    'super_admin': { level: 1, label: 'مدير نظام أعلى', permissions: ['all'] },
    'admin': { level: 2, label: 'مدير نظام', permissions: ['users', 'auctions', 'products', 'orders', 'reports', 'notifications', 'federations'] },
    'federation_admin': { level: 3, label: 'مدير اتحاد', permissions: ['users_federation', 'auctions_federation', 'reports_federation'] },
    'moderator': { level: 4, label: 'مشرف', permissions: ['users_view', 'auctions_view', 'reports_view'] },
    'vendor': { level: 5, label: 'بائع', permissions: ['products_manage', 'orders_manage'] },
    'owner': { level: 6, label: 'مالك', permissions: ['auctions_manage', 'horses_manage'] },
    'doctor': { level: 7, label: 'طبيب بيطري', permissions: ['prescriptions_manage', 'horses_view'] }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterRole, filterStatus, filterCountry]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersResponse, statsResponse, approvalsResponse] = await Promise.all([
        axios.get('/api/admin/users', {
          params: { role: filterRole, status: filterStatus, country: filterCountry },
          headers
        }),
        axios.get('/api/admin/godeye/stats', { headers }),
        axios.get('/api/admin/approvals', { headers })
      ]);

      setUsers(usersResponse.data);
      setStats(statsResponse.data);
      setPendingApprovals(approvalsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePasswordReset = async () => {
    if (!formData.newPassword) {
      alert('يرجى إدخال كلمة المرور الجديدة');
      return;
    }

    try {
      const token = localStorage.getItem('rasan_token');
      await axios.post(
        `/api/admin/user/${selectedUser.id}/password`,
        { password: formData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('تم تحديث كلمة المرور بنجاح وإرسال إشعار للمستخدم');
      handleCloseModal();
      fetchDashboardData();
    } catch (error) {
      alert('فشل في تحديث كلمة المرور');
    }
  };

  const handleBlockUser = async (userId) => {
    const reason = prompt('أدخل سبب الحظر:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('rasan_token');
      await axios.post(
        `/api/admin/user/${userId}/block`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('تم حظر المستخدم بنجاح');
      fetchDashboardData();
    } catch (error) {
      alert('فشل في حظر المستخدم');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('rasan_token');
      await axios.post(
        `/api/admin/user/${userId}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('تم فك حظر المستخدم بنجاح');
      fetchDashboardData();
    } catch (error) {
      alert('فشل في فك حظر المستخدم');
    }
  };

  const handleApproveUser = async (req) => {
    setProcessingUserId(req.id);
    try {
      const token = localStorage.getItem('rasan_token');
      await axios.post('/api/admin/approve-user', {
        userId: req.id,
        userEmail: req.email,
        userName: req.name,
        userRole: req.type,
        country: req.country
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPendingApprovals(prev => prev.filter(item => item.id !== req.id));
      alert(`تم اعتماد ${req.name} بنجاح`);
    } catch (error) {
      alert('فشل في اعتماد المستخدم');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleRejectUser = async (req) => {
    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('rasan_token');
      await axios.post('/api/admin/reject-user', {
        userId: req.id,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPendingApprovals(prev => prev.filter(item => item.id !== req.id));
      alert(`تم رفض طلب ${req.name}`);
    } catch (error) {
      alert('فشل في رفض المستخدم');
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.size === 0) {
      alert('يرجى اختيار مستخدمين أولاً');
      return;
    }

    const userIds = Array.from(selectedUsers);
    const token = localStorage.getItem('rasan_token');

    try {
      for (const userId of userIds) {
        if (action === 'block') {
          await axios.post(
            `/api/admin/user/${userId}/block`,
            { reason: 'حظر جماعي من المدير' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else if (action === 'unblock') {
          await axios.post(
            `/api/admin/user/${userId}/unblock`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      alert(`تم تنفيذ الإجراء على ${userIds.length} مستخدم`);
      setSelectedUsers(new Set());
      fetchDashboardData();
    } catch (error) {
      alert('فشل في تنفيذ الإجراء الجماعي');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
            <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-4 rounded-2xl">
              <div className="text-[10px] text-gray-400">إجمالي المستخدمين</div>
              <div className="text-xl font-bold text-[#D4AF37]">{stats.total_users || 0}</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-4 rounded-2xl">
              <div className="text-[10px] text-gray-400">الإيرادات</div>
              <div className="text-xl font-bold text-green-400">${stats.total_revenue?.toLocaleString() || '0'}</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-4 rounded-2xl">
              <div className="text-[10px] text-gray-400">المزادات النشطة</div>
              <div className="text-xl font-bold text-blue-400">{stats.active_auctions || 0}</div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-4 rounded-2xl">
              <div className="text-[10px] text-gray-400">الطلبات المعلقة</div>
              <div className="text-xl font-bold text-yellow-400">{stats.pending_orders || 0}</div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-[#333]">
          {[
            { id: 'users', label: 'إدارة المستخدمين', icon: Users },
            { id: 'approvals', label: 'طلبات الموافقة', icon: CheckCircle },
            { id: 'auctions', label: 'إدارة المزادات', icon: Gavel },
            { id: 'products', label: 'إدارة المتجر', icon: Package },
            { id: 'orders', label: 'الطلبات والتوصيل', icon: TrendingUp },
            { id: 'reports', label: 'التقارير المالية', icon: BarChart3 },
            { id: 'permissions', label: 'الصلاحيات', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Sections */}
      
      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-[#333] space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="البحث بالاسم، الإيميل أو رقم الـ ID..."
                  className="w-full bg-black/50 border border-gray-800 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-[#D4AF37] text-black px-8 rounded-2xl font-bold text-sm hover:bg-[#B8962E] transition">
                بحث متقدم
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none text-sm"
              >
                <option value="">جميع الأدوار</option>
                <option value="admin">مدير نظام</option>
                <option value="federation">اتحاد</option>
                <option value="owner">مالك</option>
                <option value="doctor">طبيب</option>
                <option value="vendor">بائع</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none text-sm"
              >
                <option value="">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="blocked">محظور</option>
                <option value="suspended">معلق</option>
              </select>

              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none text-sm"
              >
                <option value="">جميع الدول</option>
                <option value="السعودية">السعودية</option>
                <option value="الإمارات">الإمارات</option>
                <option value="الأردن">الأردن</option>
                <option value="مصر">مصر</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-blue-400">تم اختيار {selectedUsers.size} مستخدم</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('block')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  حظر جماعي
                </button>
                <button
                  onClick={() => handleBulkAction('unblock')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  فك حظر جماعي
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-[#1A1A1A] rounded-[2.5rem] border border-[#333] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#333] flex justify-between items-center bg-black/20">
              <h3 className="font-bold flex items-center gap-2">
                <Database size={18} className="text-[#D4AF37]" /> سجل المستخدمين
              </h3>
              <div className="flex gap-2">
                <button className="text-[10px] bg-green-900/30 text-green-400 px-3 py-1 rounded-full border border-green-500/20 hover:bg-green-900/50 transition">
                  تصدير CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-[#333] bg-black/20">
                    <th className="p-4">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(new Set(users.map(u => u.id)));
                          } else {
                            setSelectedUsers(new Set());
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">المستخدم</th>
                    <th className="p-4">الدولة</th>
                    <th className="p-4">الدور</th>
                    <th className="p-4">البريد الإلكتروني</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">آخر ظهور</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-black/40 transition">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{user.full_name || user.username}</div>
                        <div className="text-[10px] text-[#D4AF37] font-mono">ID: {user.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          {user.country || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-800 px-3 py-1 rounded-lg text-[10px] uppercase font-bold">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1 text-[10px] font-bold ${
                          user.status === 'active' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {user.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('ar-EG') : 'لم يسجل دخول'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenModal('password', user)}
                            className="p-2 hover:text-blue-400 transition" title="تغيير كلمة المرور"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenModal('edit', user)}
                            className="p-2 hover:text-yellow-400 transition" title="تعديل"
                          >
                            <Edit size={16} />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleBlockUser(user.id)}
                              className="p-2 hover:text-red-500 transition" title="حظر"
                            >
                              <Ban size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(user.id)}
                              className="p-2 hover:text-green-500 transition" title="فك حظر"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            className="p-2 hover:text-purple-400 transition" title="إرسال بريد"
                          >
                            <Mail size={16} />
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

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">طلبات الموافقة على المستخدمين الجدد</h2>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا توجد طلبات معلقة</div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((req) => (
                <div key={req.id} className="bg-[#1A1A1A] border border-[#333] p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#D4AF37]/50 transition">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-2">{req.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      <div>البريد: {req.email}</div>
                      <div>الدور: {req.type}</div>
                      <div>الدولة: {req.country}</div>
                      <div>ID: {req.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveUser(req)}
                      disabled={processingUserId === req.id}
                      className="bg-[#D4AF37] text-black p-3 rounded-full hover:scale-110 transition shadow-lg disabled:opacity-50 font-bold"
                      title="قبول"
                    >
                      {processingUserId === req.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    </button>
                    <button
                      onClick={() => handleRejectUser(req)}
                      className="bg-red-600 text-white p-3 rounded-full hover:scale-110 transition shadow-lg font-bold"
                      title="رفض"
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={() => handleOpenModal('request_docs', req)}
                      className="bg-blue-600 text-white p-3 rounded-full hover:scale-110 transition shadow-lg font-bold"
                      title="طلب مستندات"
                    >
                      <FileText size={20} />
                    </button>
                    <button
                      className="bg-purple-600 text-white p-3 rounded-full hover:scale-110 transition shadow-lg font-bold"
                      title="إرسال رسالة"
                    >
                      <Mail size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Auctions Tab */}
      {activeTab === 'auctions' && (
        <AdminAuctionsManagement />
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <AdminProductsManagement />
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">نظام الصلاحيات - مرتب من الأقوى للأضعف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(permissionsHierarchy).map(([key, perm]) => (
              <div key={key} className="bg-[#1A1A1A] border border-[#333] p-6 rounded-3xl hover:border-[#D4AF37]/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#D4AF37]">{perm.label}</h3>
                    <p className="text-xs text-gray-500">المستوى: {perm.level}</p>
                  </div>
                  <Lock className="text-[#D4AF37]" size={24} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400">الصلاحيات:</p>
                  <div className="flex flex-wrap gap-2">
                    {perm.permissions.map((permission, idx) => (
                      <span key={idx} className="bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-bold">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp size={48} className="mx-auto mb-4 text-[#D4AF37]" />
          <p>قسم الطلبات والتوصيل قيد التطوير</p>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-[#D4AF37]" />
          <p>قسم التقارير المالية قيد التطوير</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {modalType === 'password' && 'تغيير كلمة المرور'}
                {modalType === 'edit' && 'تعديل المستخدم'}
                {modalType === 'request_docs' && 'طلب مستندات'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {modalType === 'password' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={formData.newPassword || ''}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                </div>
                <button
                  onClick={handlePasswordReset}
                  className="w-full bg-[#D4AF37] text-black py-3 rounded-2xl font-bold hover:bg-[#B8962E] transition"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            )}

            {modalType === 'request_docs' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">نوع المستند المطلوب</label>
                  <select className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none">
                    <option>شهادة تسجيل</option>
                    <option>وثيقة هوية</option>
                    <option>شهادة ملكية</option>
                    <option>وثيقة أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">ملاحظات</label>
                  <textarea
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل الملاحظات..."
                    rows="3"
                  />
                </div>
                <button className="w-full bg-[#D4AF37] text-black py-3 rounded-2xl font-bold hover:bg-[#B8962E] transition flex items-center justify-center gap-2">
                  <Send size={18} /> إرسال الطلب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Alert */}
      <div className="fixed bottom-8 right-8 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl flex items-center gap-4 text-red-400 text-xs max-w-sm">
        <ShieldAlert size={20} />
        <span>تنبيه: أنت في وضع الوصول المطلق. أي تغيير سيؤثر فوراً على جميع المستخدمين.</span>
      </div>
    </div>
  );
};

export default GodEyeDashboard;
