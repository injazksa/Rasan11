import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Ruler, Scale, HeartPulse, ShieldCheck, QrCode, CalendarDays, Award } from 'lucide-react';

const HorsePassportPage = () => {
  const { id } = useParams();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHorseDetails = async () => {
      try {
        const response = await axios.get(`/api/horses/${id}`);
        setHorse(response.data);
      } catch (err) {
        setError('تعذر جلب بيانات الخيل. قد يكون الرقم التعريفي غير صحيح أو الخيل غير موجود.');
        console.error('Error fetching horse details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHorseDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
        <p className="text-[#2C2C2C] text-xl">جاري تحميل الجواز الرقمي للخيل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBFBFB]">
        <p className="text-[#2C2C2C] text-xl">لا توجد بيانات لهذا الخيل.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#2C2C2C] p-8 font-serif" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl border border-[#D4AF37]/30 overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#2C2C2C] text-white p-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-wider flex items-center gap-3">
            <Award size={40} className="text-[#D4AF37]" /> الجواز الرقمي للخيل
          </h1>
          {horse.qr_code_url && (
            <img src={horse.qr_code_url} alt="QR Code" className="w-24 h-24 rounded-lg border border-[#D4AF37]" />
          )}
        </div>

        {/* Horse Image */}
        {horse.image_url && (
          <div className="relative h-96 overflow-hidden">
            <img src={horse.image_url} alt={horse.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 right-0 p-6 text-white">
              <p className="text-5xl font-bold text-[#D4AF37]">{horse.name}</p>
              <p className="text-xl">السلالة: {horse.breed}</p>
            </div>
          </div>
        )}

        {/* Details Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <DetailItem icon={<Ruler size={20} />} label="الاسم" value={horse.name} />
            <DetailItem icon={<Award size={20} />} label="السلالة" value={horse.breed} />
            <DetailItem icon={<CalendarDays size={20} />} label="العمر" value={`${horse.age} سنوات`} />
            <DetailItem icon={<Ruler size={20} />} label="الطول" value={`${horse.height} سم`} />
            <DetailItem icon={<Scale size={20} />} label="الوزن" value={`${horse.weight} كجم`} />
            <DetailItem icon={<ShieldCheck size={20} />} label="رقم التسجيل" value={horse.registration_number} />
          </div>

          <div className="space-y-6">
            <DetailItem icon={<HeartPulse size={20} />} label="الحالة الصحية" value={horse.health_status} />
            <DetailItem icon={<Award size={20} />} label="الإنجازات" value={horse.achievements || 'لا توجد إنجازات مسجلة'} />
            <DetailItem icon={<QrCode size={20} />} label="الجواز موثق" value={horse.is_approved_by_federation ? 'نعم' : 'لا'} />
            <DetailItem icon={<CalendarDays size={20} />} label="تاريخ آخر تحديث" value={new Date(horse.updated_at).toLocaleDateString('ar-EG')} />
          </div>
        </div>

        {/* Pedigree and Medical History */}
        <div className="p-8 border-t border-gray-100 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">النسب (Pedigree)</h3>
            <p className="text-gray-700 leading-relaxed">{horse.pedigree || 'لا يوجد نسب مسجل.'}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">السجل الطبي (Medical History)</h3>
            <p className="text-gray-700 leading-relaxed">{horse.medical_history || 'لا يوجد سجل طبي.'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2C2C2C] text-gray-400 text-center p-4 text-sm">
          &copy; {new Date().getFullYear()} منصة رَسَن. جميع الحقوق محفوظة.
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
    <div className="text-[#D4AF37]">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  </div>
);

export default HorsePassportPage;
