import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Edit, Trash2, Eye, Search, Loader2, X, Send,
  DollarSign, Box, AlertCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const AdminProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({});

  const categories = [
    'السروج والأحزمة',
    'اللجام والأدوات',
    'الأغطية والملابس',
    'الأدوية والفيتامينات',
    'معدات العناية',
    'أخرى'
  ];

  useEffect(() => {
    fetchProducts();
  }, [filterStatus, filterCategory]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      const response = await axios.get('/api/admin/products', {
        params: { status: filterStatus, category: filterCategory },
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    setFormData(product || { status: 'active', quantity: 0 });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedProduct(null);
    setFormData({});
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.price) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const token = localStorage.getItem('rasan_token');
      const url = selectedProduct 
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';
      
      const method = selectedProduct ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(selectedProduct ? 'تم تحديث المنتج بنجاح' : 'تم إنشاء المنتج بنجاح');
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      alert('فشل في حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const token = localStorage.getItem('rasan_token');
      await axios.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم حذف المنتج بنجاح');
      fetchProducts();
    } catch (error) {
      alert('فشل في حذف المنتج');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id?.toString().includes(searchTerm)
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
          <Package size={28} /> إدارة المتجر والمنتجات
        </h2>
        <button
          onClick={() => handleOpenModal('create')}
          className="bg-[#D4AF37] text-black px-6 py-3 rounded-2xl font-bold hover:bg-[#B8962E] transition flex items-center gap-2"
        >
          <Plus size={20} /> منتج جديد
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-[#333] space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="البحث بالمنتج أو رقم الـ ID..."
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
            <option value="active">نشط</option>
            <option value="inactive">معطل</option>
            <option value="out_of_stock">نفذ المخزون</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-black/50 border border-gray-800 p-4 rounded-2xl text-white focus:border-[#D4AF37] outline-none text-sm"
          >
            <option value="">جميع الفئات</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#1A1A1A] rounded-[2.5rem] border border-[#333] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#333] bg-black/20">
          <h3 className="font-bold flex items-center gap-2">
            <Box size={18} className="text-[#D4AF37]" /> قائمة المنتجات
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-[#333] bg-black/20">
                <th className="p-4">المنتج</th>
                <th className="p-4">الفئة</th>
                <th className="p-4">السعر</th>
                <th className="p-4">الكمية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-black/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-white">{product.name}</div>
                      <div className="text-[10px] text-gray-500">ID: {product.id}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{product.category}</td>
                    <td className="p-4">
                      <span className="font-bold text-[#D4AF37]">${product.price?.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        product.quantity > 10 ? 'bg-green-600/20 text-green-400' :
                        product.quantity > 0 ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${
                        product.status === 'active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {product.status === 'active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal('view', product)}
                          className="p-2 hover:text-blue-400 transition"
                          title="عرض"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenModal('edit', product)}
                          className="p-2 hover:text-yellow-400 transition"
                          title="تعديل"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:text-red-500 transition"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-[#D4AF37]/50" />
                    <p>لا توجد منتجات</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">
                {modalType === 'create' && 'منتج جديد'}
                {modalType === 'edit' && 'تعديل المنتج'}
                {modalType === 'view' && 'تفاصيل المنتج'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {modalType === 'view' && selectedProduct && (
              <div className="space-y-4">
                <div className="bg-black/20 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">اسم المنتج</p>
                  <p className="font-bold text-white">{selectedProduct.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 mb-1">السعر</p>
                    <p className="font-bold text-[#D4AF37]">${selectedProduct.price?.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-2xl">
                    <p className="text-xs text-gray-400 mb-1">الكمية</p>
                    <p className="font-bold text-white">{selectedProduct.quantity}</p>
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">الفئة</p>
                  <p className="font-bold text-white">{selectedProduct.category}</p>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-1">الوصف</p>
                  <p className="text-sm text-gray-300">{selectedProduct.description}</p>
                </div>
              </div>
            )}

            {(modalType === 'create' || modalType === 'edit') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">اسم المنتج *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">الفئة</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">السعر *</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل السعر"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">الكمية</label>
                  <input
                    type="number"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل الكمية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">الوصف</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                    placeholder="أدخل وصف المنتج"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">الحالة</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-black/50 border border-gray-800 p-3 rounded-2xl text-white focus:border-[#D4AF37] outline-none"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">معطل</option>
                    <option value="out_of_stock">نفذ المخزون</option>
                  </select>
                </div>

                <button
                  onClick={handleCreateProduct}
                  className="w-full bg-[#D4AF37] text-black py-3 rounded-2xl font-bold hover:bg-[#B8962E] transition flex items-center justify-center gap-2"
                >
                  <Send size={18} /> {modalType === 'create' ? 'إنشاء المنتج' : 'حفظ التغييرات'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsManagement;
