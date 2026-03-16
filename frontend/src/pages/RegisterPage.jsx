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
    full_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    role: 'owner'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

    const countries = [
    { name: 'السعودية', federation: 'الاتحاد السعودي للفروسية' },
    { name: 'الأردن', federation: 'اتحاد الفروسية الملكي الأردني' },
    { name: 'قطر', federation: 'الاتحاد القطري للفروسية' },
    { name: 'البحرين', federation: 'الاتحاد الملكي البحريني للفروسية' },
    { name: 'الإمارات', federation: 'اتحاد الإمارات للفروسية والسباق' },
    { name: 'الكويت', federation: 'الاتحاد الكويتي للفروسية' },
    { name: 'عمان', federation: 'الاتحاد العماني للفروسية' },
    { name: 'مصر', federation: 'الاتحاد المصري للفروسية' },
    { name: 'المغرب', federation: 'الجامعة الملكية المغربية للفروسية' },
    { name: 'تونس', federation: 'الجامعة التونسية للفروسية' },
    { name: 'الجزائر', federation: 'الاتحاد الجزائري للفروسية' },
    { name: 'ليبيا', federation: 'الاتحاد الليبي للفروسية' },
    { name: 'سوريا', federation: 'الاتحاد العربي السوري للفروسية' },
    { name: 'لبنان', federation: 'الاتحاد اللبناني للفروسية' },
    { name: 'العراق', federation: 'الاتحاد العراقي للفروسية' },
    { name: 'فلسطين', federation: 'الاتحاد الفلسطيني للفروسية' },
    { name: 'تركيا', federation: 'الاتحاد التركي للفروسية' }
  ];

  const roles = [
    { label: 'مالك خيل', value: 'owner' },
    { label: 'اتحاد رسمي', value: 'federation' },
    { label: 'طبيب معتمد', value: 'doctor' },
    { label: 'تاجر معدات', value: 'vendor' }
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

    // Basic validation
    if (!formData.country) {
      setError('يرجى اختيار الدولة للربط بالاتحاد المعني');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:5000/api/auth/register' 
        : '/api/auth/register';

      // Ensure username is set (using email prefix if empty)
            const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        role: formData.role,
        username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000),
        city: 'N/A' // Default city to satisfy backend requirement
      };

      console.log('Sending Payload:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#D4AF37]/10">
        
        {/* Left Side - Branding */}
        <div className="md:w-1/3 bg-[#2C2C2C] p-8 md:p-12 text-[#D4AF37] flex flex-col items-center justify-center text-center border-b-8 md:border-b-0 md:border-l-8 border-[#D4AF37]">
          <img src="/rasan_logo.png" alt="Rasan Logo" className="w-48 md:w-64 mb-6 drop-shadow-2xl" />
          <h2 className="text-2xl md:text-3xl font-serif mb-4">منظومة رَسَن</h2>
          <p className="text-xs leading-relaxed opacity-70 uppercase tracking-widest">السيادة الرقمية لعالم الفروسية</p>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-2/3 p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-[#2C2C2C]">إنشاء حساب ملكي</h3>
            <img src="/rasan_logo.png" alt="Rasan" className="h-12 md:hidden" />
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-right animate-pulse">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                name="full_name"
                placeholder="الاسم الكامل" 
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all" 
              />
              <input 
                type="text" 
                name="phone"
                placeholder="رقم الهاتف" 
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all" 
              />
            </div>

            <input 
              type="email" 
              name="email"
              placeholder="البريد الإلكتروني" 
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select 
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all appearance-none"
              >
                <option value="">اختر الدولة...</option>
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              <input 
                type="password" 
                name="password"
                placeholder="كلمة المرور" 
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#D4AF37] focus:ring-2 ring-[#D4AF37]/10 text-right transition-all" 
              />
            </div>

            {formData.country && (
              <div className="p-3 bg-[#FAF6E9] rounded-xl border border-[#D4AF37]/20 text-[10px] text-[#B8962E] text-center font-bold">
                سيتم ربط حسابك تلقائياً بـ: {countries.find(c => c.name === formData.country)?.federation}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-[#2C2C2C] py-4 rounded-2xl font-bold shadow-lg hover:bg-[#B8962E] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'جاري توثيق البيانات...' : 'تأكيد الانضمام للإمبراطورية'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">لديك حساب بالفعل؟ <a href="/login" className="text-[#D4AF37] font-bold hover:underline">سجل دخول من هنا</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
