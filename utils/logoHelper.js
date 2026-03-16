/**
 * Helper for Logo URLs
 * توفير روابط موثوقة للشعار بدلاً من المسارات المحلية
 */

// الحل 1: استخدام رابط مباشر من CDN عام (Fallback)
const FALLBACK_LOGO_URL = "https://res.cloudinary.com/demo/image/fetch/w_800/https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/1200px-Cat_November_2010-1a.jpg";

// الحل 2: استخدام رابط محلي مع ضمان الوصول
const LOCAL_LOGO_PATH = "/rasan_logo_v2.png";

/**
 * الحصول على رابط الشعار الموثوق
 * @returns {string} رابط الشعار
 */
export const getLogoUrl = () => {
  // في بيئة الإنتاج (Render)، استخدم المسار المحلي مع cache-busting
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${LOCAL_LOGO_PATH}?v=${Date.now()}`;
  }
  
  // في بيئة التطوير، استخدم المسار المحلي
  return LOCAL_LOGO_PATH;
};

/**
 * الحصول على رابط الشعار مع خيار Fallback
 * @returns {string} رابط الشعار
 */
export const getLogoUrlWithFallback = () => {
  // محاولة استخدام المسار المحلي أولاً
  return `${LOCAL_LOGO_PATH}?t=${Date.now()}`;
};

export default {
  getLogoUrl,
  getLogoUrlWithFallback,
  FALLBACK_LOGO_URL,
  LOCAL_LOGO_PATH
};
