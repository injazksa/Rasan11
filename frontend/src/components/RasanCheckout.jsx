import React, { useState } from 'react';
import { Lock, CreditCard, Apple, CheckCircle2, ArrowRight } from 'lucide-react';

const RasanCheckout = () => {
  const [paymentStep, setPaymentStep] = useState('selection');

  const handlePayment = () => {
    setPaymentStep('processing');
    setTimeout(() => setPaymentStep('success'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6 font-serif">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Security Header */}
        <div className="bg-[#2C2C2C] p-4 text-[#D4AF37] flex justify-center items-center gap-2 text-xs tracking-widest uppercase">
          <Lock size={14} /> بوابة دفع رَسَن المشفرة والآمنة
        </div>

        <div className="p-10">
          {paymentStep === 'selection' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2 text-center">إتمام عملية الشراء</h2>
              <p className="text-gray-400 text-center text-sm mb-10">اختر وسيلة الدفع المفضلة لديك لبدء المعاملة الملكية</p>

              {/* Invoice Summary */}
              <div className="bg-[#FAF6E9] p-6 rounded-2xl mb-8 border border-[#D4AF37]/20">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">المنتج:</span>
                  <span className="font-bold">حصان "كحيلان" الأصيل</span>
                </div>
                <div className="flex justify-between text-xl border-t border-[#D4AF37]/10 pt-4 mt-2">
                  <span className="font-serif">الإجمالي:</span>
                  <span className="font-bold text-[#D4AF37]">$15,500.00</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <button 
                  onClick={handlePayment}
                  className="w-full flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl hover:scale-[1.02] transition shadow-lg"
                >
                  <Apple fill="white" size={20} /> Pay
                </button>
                
                <button 
                  onClick={handlePayment}
                  className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 py-4 rounded-2xl hover:border-[#D4AF37] transition font-bold"
                >
                  <CreditCard className="text-gray-400" size={20} /> البطاقة الائتمانية (Stripe)
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-20 animate-pulse">
               <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
               <p className="text-[#2C2C2C] font-bold">جاري تأمين المعاملة المالية...</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-10 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">تمت العملية بنجاح!</h2>
              <p className="text-gray-400 text-sm mb-8">تم خصم المبلغ وتأمينه في نظام رَسَن. تم إرسال إشعار للبائع والاتحاد.</p>
              <button className="bg-[#D4AF37] text-[#2C2C2C] px-10 py-3 rounded-full font-bold shadow-lg">
                عرض الفاتورة الملكية
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-6 opacity-50">
           <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-5" alt="Stripe" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-5" alt="Apple Pay" />
        </div>
      </div>
    </div>
  );
};

export default RasanCheckout;
