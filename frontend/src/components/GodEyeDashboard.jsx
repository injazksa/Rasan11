import React, { useState, useEffect } from 'react';
import { ShieldAlert, Key, Eye, UserX, UserCheck, Search, Database, Fingerprint, Loader2 } from 'lucide-react';
import axios from 'axios';

const GodEyeDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get('/api/admin/godeye/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/godeye/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching God Eye dashboard data:', error);
      alert('فشل في جلب بيانات لوحة التحكم. تأكد من أنك مدير نظام.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, currentStatus) => {
    setProcessingUserId(userId);
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/godeye/user/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      alert(`تم تحديث حالة المستخدم ${userId} إلى ${newStatus}.`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('فشل في تحديث حالة المستخدم.');
    } finally {
      setProcessingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#E0E0E0] p-8 font-serif">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-[#D4AF37]/30 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37] tracking-widest flex items-center gap-3">
            <Fingerprint size={36} /> لوحة التحكم المطلقة | RASAN
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-[0.4em]">God-Mode Access Only</p>
        </div>
        <div className="flex gap-4 font-sans">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-4 rounded-2xl">
            <div className="text-[10px] text-gray-400">إجمالي الهويات</div>
            <div className="text-xl font-bold">{stats.total_users || 0}</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 p-4 rounded-2xl text-[#D4AF37]">
            <div className="text-[10px] text-gray-400">إجمالي الإيرادات</div>
            <div className="text-xl font-bold">${stats.total_revenue?.toLocaleString() || '0'}</div>
          </div>
        </div>
      </div>

      {/* Search Engine */}
      <div className="bg-[#1A1A1A] p-6 rounded-3xl mb-10 border border-[#333] flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="البحث بالاسم، الإيميل، رقم الـ ID أو رقم الهاتف..." 
            className="w-full bg-black/50 border border-gray-800 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-[#D4AF37] text-black px-8 rounded-2xl font-bold text-sm hover:bg-[#B8962E] transition">فحص الهوية</button>
      </div>

      {/* Users Table */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] border border-[#333] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#333] flex justify-between items-center bg-black/20">
          <h3 className="font-bold flex items-center gap-2"><Database size={18} className="text-[#D4AF37]" /> سجل الهويات النشطة</h3>
          <div className="flex gap-2">
             <button className="text-[10px] bg-red-900/30 text-red-500 px-3 py-1 rounded-full border border-red-500/20">حظر جماعي</button>
             <button className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full border border-blue-400/20">تصدير قاعدة البيانات</button>
          </div>
        </div>
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-[#333]">
              <th className="p-6">المستخدم (ID)</th>
              <th className="p-6">نوع الحساب</th>
              <th className="p-6">بيانات التواصل</th>
              <th className="p-6">الحالة</th>
              <th className="p-6">الإجراءات الفائقة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-black/40 transition">
                <td className="p-6">
                  <div className="font-bold text-white">{user.full_name || user.username}</div>
                  <div className="text-[10px] text-[#D4AF37] font-mono">{user.id}</div>
                </td>
                <td className="p-6">
                  <span className="bg-gray-800 px-3 py-1 rounded-lg text-[10px] uppercase">{user.role}</span>
                </td>
                <td className="p-6">
                  <div className="text-xs">{user.email}</div>
                  <div className="text-[10px] text-gray-500">آخر ظهور: {user.last_login ? new Date(user.last_login).toLocaleString('ar-EG') : 'N/A'}</div>
                </td>
                <td className="p-6">
                  <span className={`flex items-center gap-1 text-[10px] ${user.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                    {user.status === 'active' ? <UserCheck size={12}/> : <UserX size={12}/>} {user.status}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex gap-3">
                    <button className="p-2 hover:text-[#D4AF37] transition" title="مشاهدة كـ مستخدم"><Eye size={16}/></button>
                    <button className="p-2 hover:text-blue-400 transition" title="تغيير كلمة المرور"><Key size={16}/></button>
                    <button 
                      onClick={() => handleUserStatusChange(user.id, user.status)}
                      disabled={processingUserId === user.id}
                      className="p-2 hover:text-red-500 transition disabled:opacity-50"
                      title={user.status === 'active' ? 'حظر المستخدم' : 'تفعيل المستخدم'}
                    >
                      {processingUserId === user.id ? <Loader2 className="animate-spin" size={16} /> : <UserX size={16}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Alert */}
      <div className="mt-10 p-4 bg-red-950/20 border border-red-900/50 rounded-2xl flex items-center gap-4 text-red-400 text-xs">
        <ShieldAlert size={20} />
        <span>تنبيه: أنت الآن في وضع الوصول المطلق. أي تغيير في كلمات المرور أو الحذف سيؤثر فوراً على استمرارية العمل في الاتحادات المختصة.</span>
      </div>
    </div>
  );
};

export default GodEyeDashboard;
