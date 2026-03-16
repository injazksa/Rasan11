import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Globe, ChevronRight, ArrowRight } from 'lucide-react';

const RoleCard = ({ label, role, active, onClick }) => (
  <div 
    onClick={() => onClick(role)}
    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-2 ${active ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/5 bg-[#1F1F1F] hover:border-white/10'}`}
  >
    <span className={`text-xs font-bold tracking-wider ${active ? 'text-[#D4AF37]' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.country) {
      setError('يرجى اختيار الدولة للربط بالاتحاد المعني');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000),
        city: 'N/A'
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'فشل إنشاء الحساب');

      localStorage.setItem('rasan_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/race-arena');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans" dir="rtl">
      {/* Royal Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px]"></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col md:flex-row bg-[#141414] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-[#D4AF37]/20 overflow-hidden">
        
        {/* Left Side - Branding */}
        <div className="md:w-1/3 bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-l border-[#D4AF37]/10">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310419663030900418/EvnnRBezIZUmGlZz.png"
            alt="Rasan Logo" 
            className="w-56 md:w-64 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] mb-8"
          />
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-white tracking-wider">منظومة رَسَن</h2>
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
            <p className="text-[#D4AF37] text-[10px] font-medium uppercase tracking-[0.3em] mt-4">السيادة الرقمية لعالم الفروسية</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-2/3 p-8 md:p-16 bg-[#141414]">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-white mb-3">إنشاء حساب جديد</h3>
            <p className="text-gray-500">انضم إلى مجتمع الفروسية الأكبر في المنطقة</p>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {roles.map((role) => (
              <RoleCard 
                key={role.value}
                label={role.label} 
                role={role.value}
                active={formData.role === role.value}
                onClick={(r) => setFormData(prev => ({ ...prev, role: r }))}
              />
            ))}
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">الاسم الكامل</label>
                <div className="relative group">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="full_name"
                    placeholder="محمد بن سلمان" 
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 pr-12 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right placeholder:text-gray-700" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">رقم الهاتف</label>
                <div className="relative group">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                  <input 
                    type="text" 
                    name="phone"
                    placeholder="05xxxxxxxx" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 pr-12 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right placeholder:text-gray-700" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 pr-12 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right placeholder:text-gray-700" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">الدولة</label>
                <div className="relative group">
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 pr-12 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right appearance-none"
                  >
                    <option value="">اختر الدولة...</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name} className="bg-[#1F1F1F]">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mr-2">كلمة المرور</label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                  <input 
                    type="password" 
                    name="password"
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 pr-12 bg-[#1F1F1F] rounded-2xl border border-white/5 outline-none focus:border-[#D4AF37]/50 text-white transition-all text-right placeholder:text-gray-700" 
                  />
                </div>
              </div>
            </div>

            {formData.country && (
              <div className="p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20 text-xs text-[#D4AF37] text-center font-medium animate-fade-in">
                سيتم ربط حسابك تلقائياً بـ: <span className="font-bold">{countries.find(c => c.name === formData.country)?.federation}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black py-5 rounded-2xl font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6 text-lg flex items-center justify-center gap-3"
            >
              {loading ? 'جاري معالجة الطلب الملكي...' : 'إنشاء الحساب'}
              {!loading && <ChevronRight size={22} className="rotate-180" />}
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">لديك حساب بالفعل؟ <button onClick={() => navigate('/login')} className="text-[#D4AF37] font-bold hover:underline mr-2">تسجيل الدخول</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
