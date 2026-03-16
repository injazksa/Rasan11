import React, { useState, useEffect } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import axios from 'axios';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('rasan_token');
      const response = await axios.get('/api/marketplace/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('فشل في جلب المنتجات');
      // استخدام بيانات افتراضية عند الفشل
      setProducts([
        {
          id: 1,
          name: 'سرج جلدي فاخر - نخب أول',
          price: 1200,
          image: 'https://img.icons8.com/ios/100/D4AF37/saddle.png'
        },
        {
          id: 2,
          name: 'لجام ملكي مزخرف',
          price: 800,
          image: 'https://img.icons8.com/ios/100/D4AF37/bridle.png'
        },
        {
          id: 3,
          name: 'أغطية خيل حريرية',
          price: 500,
          image: 'https://img.icons8.com/ios/100/D4AF37/blanket.png'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`تم إضافة "${product.name}" إلى السلة`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#F9F8F6] text-right min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-serif text-[#2C2C2C]">تجهيزات الفروسية الملكية</h2>
          <p className="text-gray-500 text-sm mt-2">أفضل المنتجات المختارة بعناية</p>
        </div>
        <div className="bg-[#D4AF37] text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold">
          <ShoppingCart size={20} />
          {cart.length}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded-2xl text-yellow-800 text-sm">
          {error} - يتم عرض بيانات افتراضية
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition">
              <div className="h-48 bg-gray-50 rounded-3xl mb-6 flex items-center justify-center overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://img.icons8.com/ios/100/D4AF37/saddle.png';
                  }}
                />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#2C2C2C]">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{product.description || 'منتج فاخر عالي الجودة'}</p>
              <div className="flex justify-between items-center mt-6">
                <span className="text-[#D4AF37] font-bold text-xl">${product.price}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-[#2C2C2C] text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-black transition flex items-center gap-2"
                >
                  <ShoppingCart size={14} />
                  أضف للسلة
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            لا توجد منتجات متاحة حالياً
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
