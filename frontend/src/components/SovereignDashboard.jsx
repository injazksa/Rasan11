import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Users, Horse, Zap, Settings, BarChart3, AlertCircle,
  Lock, Unlock, UserX, Mail, Eye, EyeOff, Plus, Trash2,
  Edit, CheckCircle, XCircle, Clock, TrendingUp, DollarSign,
  ShieldAlert, LogOut, Menu, X, Bell, Search
} from 'lucide-react';
import axios from 'axios';

const SovereignDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, productsRes, disputesRes, logsRes, settingsRes] = await Promise.all([
        axios.get('/api/admin/live-stats', { headers }).catch(() => ({ data: {} })),
        axios.get('/api/admin/users', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/admin/products', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/admin/disputes', { headers }).catch(() => ({ data: { disputes: [] } })),
        axios.get('/api/admin/audit-logs?limit=20', { headers }).catch(() => ({ data: { logs: [] } })),
        axios.get('/api/admin/system-settings', { headers }).catch(() => ({ data: {} }))
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setDisputes(disputesRes.data.disputes || []);
      setAuditLogs(logsRes.data.logs || []);
      setSystemSettings(settingsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      setLoading(false);
    }
  };

  // ============ Sidebar Navigation ============
  const SidebarNav = () => (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-[#0B0B0B] to-[#1a1a1a] border-r border-[#D4AF37] border-opacity-20 z-40 overflow-y-auto"
    >
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Crown className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="text-2xl font-bold text-[#D4AF37]">رَسَن</h1>
        </motion.div>

        <nav className="space-y-2">
          {[
            { id: 'overview', label: 'لوحة التحكم', icon: BarChart3 },
            { id: 'users', label: 'إدارة المستخدمين', icon: Users },
            { id: 'marketplace', label: 'المتجر والمزادات', icon: Zap },
            { id: 'disputes', label: 'إدارة النزاعات', icon: AlertCircle },
            { id: 'audit', label: 'سجل العمليات', icon: ShieldAlert },
            { id: 'settings', label: 'إعدادات النظام', icon: Settings }
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 10 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-[#D4AF37] bg-opacity-20 border border-[#D4AF37] text-[#D4AF37]'
                  : 'text-gray-300 hover:text-[#D4AF37]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
    </motion.div>
  );

  // ============ Live Statistics Cards ============
  const StatCard = ({ icon: Icon, label, value, color = '#D4AF37' }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-2xl p-6 border border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
      style={{
        background: 'rgba(11, 11, 11, 0.8)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)'
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20, transparent)`,
          opacity: 0.3
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" style={{ color }} />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <p className="text-3xl font-bold" style={{ color }}>
          {value || '0'}
        </p>
      </div>
    </motion.div>
  );

  // ============ Overview Tab ============
  const OverviewTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="المستخدمون النشطون" value={stats?.total_active_users} />
        <StatCard icon={Horse} label="إجمالي الخيول" value={stats?.total_horses} />
        <StatCard icon={DollarSign} label="إجمالي المبيعات" value={`$${stats?.total_revenue?.toFixed(2) || '0'}`} />
        <StatCard icon={Zap} label="المزادات النشطة" value={stats?.active_auctions} />
        <StatCard icon={Users} label="الاتحادات النشطة" value={stats?.active_federations} />
        <StatCard icon={Clock} label="الطلبات المعلقة" value={stats?.pending_orders} />
      </div>

      {/* Live Activity Feed */}
      <motion.div
        className="rounded-2xl p-6 border border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
        style={{ background: 'rgba(11, 11, 11, 0.8)' }}
      >
        <h3 className="text-xl font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          آخر العمليات
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {auditLogs.slice(0, 10).map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#D4AF37] bg-opacity-5 border border-[#D4AF37] border-opacity-10"
            >
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">{log.action}</p>
                <p className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleString('ar-SA')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  // ============ Users Management Tab ============
  const UsersTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="ابحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#D4AF37] border-opacity-20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="space-y-3 max-h-screen overflow-y-auto">
        {users.filter(u => u.full_name?.includes(searchTerm) || u.email?.includes(searchTerm)).map((user) => (
          <motion.div
            key={user.id}
            whileHover={{ x: 5 }}
            className="p-4 rounded-xl border border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
            style={{ background: 'rgba(11, 11, 11, 0.8)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-[#D4AF37]">{user.full_name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-[#D4AF37] bg-opacity-10 hover:bg-opacity-20 text-[#D4AF37]"
                  title="انتحال الشخصية"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-red-500 bg-opacity-10 hover:bg-opacity-20 text-red-500"
                  title="حظر"
                >
                  <Lock className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-[#D4AF37] bg-opacity-10 text-[#D4AF37]">{user.role}</span>
              <span className={`px-2 py-1 rounded ${
                user.status === 'active'
                  ? 'bg-green-500 bg-opacity-10 text-green-500'
                  : 'bg-red-500 bg-opacity-10 text-red-500'
              }`}>
                {user.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // ============ Marketplace Tab ============
  const MarketplaceTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-bold hover:bg-opacity-90"
      >
        <Plus className="w-5 h-5" />
        إضافة منتج جديد
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="p-4 rounded-xl border border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
            style={{ background: 'rgba(11, 11, 11, 0.8)' }}
          >
            <p className="font-bold text-[#D4AF37] mb-2">{product.name}</p>
            <p className="text-sm text-gray-400 mb-3">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#D4AF37]">${product.price}</span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-lg bg-[#D4AF37] bg-opacity-10 text-[#D4AF37]"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="p-2 rounded-lg bg-red-500 bg-opacity-10 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // ============ Disputes Tab ============
  const DisputesTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {disputes.map((dispute) => (
        <motion.div
          key={dispute.id}
          whileHover={{ x: 5 }}
          className="p-4 rounded-xl border border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
          style={{ background: 'rgba(11, 11, 11, 0.8)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-[#D4AF37]">{dispute.dispute_type}</p>
              <p className="text-sm text-gray-400">{dispute.description}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-bold"
            >
              حل النزاع
            </motion.button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // ============ Audit Log Tab ============
  const AuditTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 max-h-screen overflow-y-auto"
    >
      {auditLogs.map((log, idx) => (
        <motion.div
          key={idx}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
          className="p-4 rounded-xl border border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
          style={{ background: 'rgba(11, 11, 11, 0.8)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-[#D4AF37]">{log.action}</p>
              <p className="text-sm text-gray-400">{log.details}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(log.created_at).toLocaleString('ar-SA')}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs bg-[#D4AF37] bg-opacity-10 text-[#D4AF37]">
              {log.status}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // ============ Settings Tab ============
  const SettingsTab = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {systemSettings && (
        <>
          <motion.div
            className="p-6 rounded-2xl border border-[#D4AF37] border-opacity-20 backdrop-blur-xl space-y-4"
            style={{ background: 'rgba(11, 11, 11, 0.8)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#D4AF37]">وضع الصيانة</p>
                <p className="text-sm text-gray-400">إغلاق الموقع للصيانة</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  systemSettings.maintenance_mode ? 'bg-[#D4AF37]' : 'bg-gray-600'
                }`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#D4AF37]">تفعيل المتجر</p>
                <p className="text-sm text-gray-400">السماح بالتسوق</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  systemSettings.store_enabled ? 'bg-[#D4AF37]' : 'bg-gray-600'
                }`}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#D4AF37]">تفعيل المزادات</p>
                <p className="text-sm text-gray-400">السماح بالمزادات</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`w-12 h-6 rounded-full transition-colors ${
                  systemSettings.auction_enabled ? 'bg-[#D4AF37]' : 'bg-gray-600'
                }`}
              />
            </div>

            <div className="pt-4 border-t border-[#D4AF37] border-opacity-20">
              <label className="block text-[#D4AF37] font-bold mb-2">نسبة العمولة (%)</label>
              <input
                type="number"
                defaultValue={systemSettings.commission_rate}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#D4AF37] border-opacity-20 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );

  // ============ Main Render ============
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white overflow-hidden">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'mr-80' : 'mr-0'}`}>
        {/* Top Bar */}
        <motion.div
          className="sticky top-0 z-30 flex items-center justify-between p-6 border-b border-[#D4AF37] border-opacity-20 backdrop-blur-xl"
          style={{ background: 'rgba(11, 11, 11, 0.9)' }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#D4AF37] hover:bg-opacity-10"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>

          <h2 className="text-2xl font-bold text-[#D4AF37]">لوحة التحكم السيادية</h2>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-[#D4AF37] hover:bg-opacity-10"
          >
            <Bell className="w-6 h-6" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500"
            />
          </motion.button>
        </motion.div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 border-4 border-[#D4AF37] border-opacity-20 border-t-[#D4AF37] rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'marketplace' && <MarketplaceTab />}
              {activeTab === 'disputes' && <DisputesTab />}
              {activeTab === 'audit' && <AuditTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default SovereignDashboard;
