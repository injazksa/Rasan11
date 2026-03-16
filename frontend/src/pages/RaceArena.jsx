import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const RaceArena = () => {
  const [races, setRaces] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRaceData();
  }, []);

  const fetchRaceData = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // جلب بيانات السباقات
      const racesResponse = await axios.get('/api/races', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // جلب نقاط المستخدم
      const pointsResponse = await axios.get(`/api/user/${user.id}/points`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRaces(racesResponse.data || []);
      setUserPoints(pointsResponse.data?.points || 0);
    } catch (err) {
      console.error('Error fetching race data:', err);
      setError('فشل في جلب بيانات السباقات');
      // استخدام بيانات افتراضية عند الفشل
      setRaces([
        {
          id: 1,
          name: 'كأس رَسَن الدولي للجمال',
          date: '20 رمضان 1447',
          location: 'إسطبلات رَسَن الملكية',
          status: 'open',
          image: 'https://images.unsplash.com/photo-1598974357851-98166a9d9b5b?auto=format&fit=crop&w=800'
        }
      ]);
      setUserPoints(1450);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 font-serif text-right" dir="rtl">
      <header className="mb-12 border-b border-gray-100 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-[#2C2C2C]">ميدان السباق</h1>
          <p className="text-[#D4AF37] italic uppercase tracking-widest text-xs mt-2">البطولات الرسمية والمعتمدة</p>
        </div>
        <div className="bg-[#FAF6E9] p-4 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-3">
          <Trophy className="text-[#D4AF37]" size={24} />
          <span className="text-sm font-bold">نقاطك في الميدان: {userPoints.toLocaleString('ar-EG')}</span>
        </div>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded-2xl text-yellow-800 text-sm">
          {error} - يتم عرض بيانات افتراضية
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {races.length > 0 ? (
          races.map((race) => (
            <div key={race.id} className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden group">
              <div 
                className="h-64 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{
                  backgroundImage: `url('${race.image}')`
                }}
              ></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-[#2C2C2C]">{race.name}</h2>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold ${
                    race.status === 'open' ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {race.status === 'open' ? 'تسجيل مفتوح' : 'مغلق'}
                  </span>
                </div>
                <div className="flex gap-6 text-gray-400 text-xs mb-8">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {race.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={14}/> {race.location}</span>
                </div>
                <button className="w-full bg-[#2C2C2C] text-[#D4AF37] py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg flex justify-center items-center gap-2">
                  <CheckCircle size={18} /> تسجيل خيلك في البطولة
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            لا توجد سباقات متاحة حالياً
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceArena;
