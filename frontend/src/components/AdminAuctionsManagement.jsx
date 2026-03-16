import React, { useState, useEffect } from 'react';
import {
  Gavel, Plus, Edit, Trash2, Eye, Clock, TrendingUp, DollarSign,
  Filter, Search, Loader2, CheckCircle, AlertCircle, X, Send
} from 'lucide-react';
import axios from 'axios';

const AdminAuctionsManagement = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAuctions();
  }, [filterStatus]);

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      const response = await axios.get('/api/admin/auctions', {
        params: { status: filterStatus },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctions(response.data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, auction = null) => {
    setModalType(type);
    setSelectedAuction(auction);
    setFormData(auction || {});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedAuction(null);
    setFormData({});
  };

  const handleCreateAuction = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      await axios.post('/api/admin/auctions', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم إنشاء المزاد بنجاح');
      handleCloseModal();
      fetchAuctions();
    } catch (error) {
      alert('فشل في إنشاء المزاد');
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المزاد؟')) return;

    try {
      const token = localStorage.getItem('rasan_token');
      await axios.delete(`/api/admin/auctions/${auctionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم حذف المزاد بنجاح');
      fetchAuctions();
    } catch (error) {
      alert('فشل في حذف المزاد');
    }
  };

  const filteredAuctions = auctions.filter(auction =>
    auction.horse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.id?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#D4AF37] flex items-center gap-2">
          <Gavel size={28} /> إدارة المزادات
        </h2>
        <button
          onClick={() => handleOpenModal('create')}
          className="bg-[#D4AF37] text-black px-6 py-3 rounded-2xl font-bold hover:bg-[#B8962E] transition flex items-center gap-2"
        >
          <Plus size={20} /> مزاد جديد
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-[#333] space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="البحث بالحصان أو رقم المزاد..."
              className="w-full bg-black/50 border border-gray-800 p-4 pr-12 rounded-2xl focus:border-[#D4AF37] outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/50 border border-gray-800 p-4 rounded-2xl text-white focus:border-[#D4AF37] outline-none text-sm"
          >
            <option value="">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="active">نشط</option>
            <option value="closed">مغلق</option>
            <option value="sold">مباع</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.length > 0 ? (
          filteredAuctions.map((auction) => (
            <div key={auction.id} className="bg-[#1A1A1A] border border-[#333] rounded-3xl overflow-hidden hover:border-[#D4AF37]/50 transition">
              {/* Image */}
              <div className="h-48 bg-gray-800 relative overflow-hidden">
                <img
                  src={auction.horse_image || 'https://via.placeholder.com/300x200'}
                  alt={auction.horse_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200';
                  }}
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  auction.status === 'active' ? 'bg-green-600 text-white' :
                  auction.status === 'closed' ? 'bg-red-600 text-white' :
                  auction.status === 'sold' ? 'bg-blue-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}>
                  {auction.status}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1">{auction.horse_name}</h3>
                  <p className="text-xs text-gray-400">ID: {auction.id}</p>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">السعر الابتدائي</p>
                    <p className="font-bold text-[#D4AF37]">${auction.starting_price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">أعلى مزايدة</p>
                    <p className="font-bold text-green-400">${auction.current_highest_bid?.toLocaleString() || '0'}</p>
                  </div>
                </div>

                {/* Time Info */}
                {auction.end_time && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} />
                    ينتهي: {new Date(auction.end_time).toLocaleDateString('ar-EG')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[#333]">
                  <button
                    onClick={() => handleOpenModal('view', auction)}
                    className="flex-1 bg-blue-600/20 text-blue-400 py-2 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition flex items-center justify-center gap-1"
                  >
                    <Eye size={14} /> عرض
                  </button>
                  <button
                    onClick={() => handleOpenModal('edit', auction)}
                    className="flex-1 bg-yellow-600/20 text-yellow-400 py-2 rounded-lg text-xs font-bold hover:bg-yellow-600/30 transition flex items-center justify-center gap-1"
                  >
                    <Edit size={14} /> تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteAuction(auction.id)}
                    className="flex-1 bg-red-600/20 text-red-400 py-2 rounded-lg text-xs font-bold hover:bg-red-600/30 transition flex items-center justify-center gap-1"
                  >
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Gavel size={48} className="mx-auto mb-4 text-[#D4AF37]/50" />
            <p>لا توجد مزادات</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {modalType === 'create' && 'مزاد جديد'}
                {modalType === 'edit' && 'تعديل المزاد'}
                {modalType === 'view' && 'تفاصيل المزاد'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {modalType === 'view' && selectedAuction && (
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">الحصان</p>
                  <p className="font-bold text-white">{selectedAuction.horse_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 mb-1">السعر الابتدائي</p>
                    <p className="font-bold text-[#D4AF37]">${selectedAuction.starting_price?.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 mb-1">أعلى مزايدة</p>
                    <p className="font-bold text-green-400">${selectedAuction.current_highest_bid?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">الحالة</p>
                  <p className="font-bold text-white">{selectedAuction.status}</p>
                </div>
                {selectedAuction.highest_bidder_name && (
                  <div className="bg-black/20 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 mb-1">أعلى مزايد</p>
                    <p className="font-bold text-white">{selectedAuction.highest_bidder_name}</p>
                  </div>
                )}
              </div>
            )}

            {(modalType === 'create' || modalType === 'edit') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">اسم الحصان</label>
                  <input
                    type="text"
                    value={formData.horse_name || ''}
                    onChange={(e) => setFormData({ ...formData, horse_name: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل اسم الحصان"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">السعر الابتدائي</label>
                  <input
                    type="number"
                    value={formData.starting_price || ''}
                    onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل السعر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">تاريخ الانتهاء</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">الحالة</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="active">نشط</option>
                    <option value="closed">مغلق</option>
                    <option value="sold">مباع</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateAuction}
                  className="w-full bg-[#D4AF37] text-black py-3 rounded-2xl font-bold hover:bg-[#B8962E] transition flex items-center justify-center gap-2"
                >
                  <Send size={18} /> {modalType === 'create' ? 'إنشاء المزاد' : 'حفظ التغييرات'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuctionsManagement;
