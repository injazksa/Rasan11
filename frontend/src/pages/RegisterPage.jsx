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
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-[#D4AF37]/20">
        
        {/* Left Side - Branding (Lighter & More Elegant) */}
        <div className="md:w-2/5 bg-[#FDFCFB] p-8 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-l border-[#D4AF37]/10">
          <img 
            src={`/rasan_logo_v2.png?t=${Date.now()}`}
            alt="Rasan Logo" 
            className="w-64 md:w-80 mb-8 drop-shadow-xl"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=Rasan+Logo';
            }}
          />
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-[#2C2C2C]">منظومة رَسَن</h2>
          <p className="text-sm leading-relaxed text-[#D4AF37] font-medium uppercase tracking-[0.2em]">السيادة الرقمية لعالم الفروسية</p>
          <div className="mt-12 w-16 h-1 bg-[#D4AF37]/30 rounded-full"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-3/5 p-8 md:p-16 bg-white">
          <div className="mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2">إنشاء حساب جديد</h3>
            <p className="text-gray-500">انضم إلى مجتمع الفروسية الأكبر في المنطقة</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm text-right">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
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

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">الاسم الكامل</label>
                <input 
                  type="text" 
                  name="full_name"
                  placeholder="مثال: محمد بن سلمان" 
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">رقم الهاتف</label>
                <input 
                  type="text" 
                  name="phone"
                  placeholder="05xxxxxxxx" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 mr-2">البريد الإلكتروني</label>
              <input 
                type="email" 
                name="email"
                placeholder="name@example.com" 
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">الدولة</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-[#D4AF37] focus:bg-white transition-all text-right appearance-none"
                >
                  <option value="">اختر الدولة...</option>
                  {countries.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 mr-2">كلمة المرور</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-[#D4AF37] focus:bg-white transition-all text-right" 
                />
              </div>
            </div>

            {formData.country && (
              <div className="p-4 bg-[#FAF6E9] rounded-2xl border border-[#D4AF37]/10 text-xs text-[#B8962E] text-center font-medium">
                سيتم ربط حسابك تلقائياً بـ: <span className="font-bold">{countries.find(c => c.name === formData.country)?.federation}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] text-white py-5 rounded-2xl font-bold shadow-xl shadow-[#D4AF37]/20 hover:bg-[#B8962E] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-6 text-lg"
            >
              {loading ? 'جاري معالجة الطلب...' : 'إنشاء الحساب'}
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-400">لديك حساب بالفعل؟ <a href="/login" className="text-[#D4AF37] font-bold hover:underline ml-1">تسجيل الدخول</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
