import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleCard = ({ label, role, active, onClick }) => (
  <div 
    onClick={() => onClick(role)}
    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${active ? 'border-[#D4AF37] bg-[#FAF6E9]' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
  >
    <span className={`text-xs font-bold ${active ? 'text-[#D4AF37]' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'OWNER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { label: 'مالك خيل', value: 'OWNER' },
    { label: 'اتحاد رسمي', value: 'FEDERATION' },
    { label: 'طبيب معتمد', value: 'DOCTOR' },
    { label: 'تاجر معدات', value: 'MERCHANT' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:5000/api/auth/register' 
        : '/api/auth/register';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل إنشاء الحساب');
      }

      localStorage.setItem('rasan_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/race-arena');
    } catch (err) {
      setError(err.message || 'حدث خطأ في إنشاء الحساب');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/3 bg-[#2C2C2C] p-10 text-[#D4AF37] flex flex-col justify-center border-l-8 border-[#D4AF37]">
          <h2 className="text-3xl font-serif mb-4">انضم للنخبة</h2>
          <p className="text-xs leading-relaxed opacity-70 uppercase tracking-widest">كن جزءاً من أكبر نظام رقمي للفروسية في العالم.</p>
        </div>

        <div className="md:w-2/3 p-12">
          <h3 className="text-xl font-bold mb-8 text-[#2C2C2C] text-right">إنشاء حساب جديد</h3>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-right">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {roles.map((role) => (
              <RoleCard 
                key={role.value}
                label={role.label} 
                role={role.value}
                active={formData.role === role.value}
                onClick={handleRoleSelect}
              />
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <input 
              type="text" 
              name="fullName"
              placeholder="الاسم الكامل" 
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 ring-[#D4AF37]/20 text-right" 
            />
            <input 
              type="email" 
              name="email"
              placeholder="البريد الإلكتروني" 
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 ring-[#D4AF37]/20 text-right" 
            />
            <input 
              type="password" 
              name="password"
              placeholder="كلمة المرور" 
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 ring-[#D4AF37]/20 text-right" 
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#B8962E] transition-all disabled:opacity-50"
            >
              {loading ? 'جاري المعالجة...' : 'تأكيد الانضمام'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">لديك حساب بالفعل؟ <a href="/login" className="text-[#D4AF37] font-bold">سجل دخول</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
