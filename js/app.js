/**
 * ClarityFinance App Logic v1.0
 * المحرك الأساسي لإدارة الواجهة والبيانات
 */

const App = {
    // 1. حالة التطبيق (State)
    state: {
        currentLang: 'ar',
        currentScreen: 'dashboard',
        isFileDataLoaded: false,
        financialData: null
    },

    // 2. القاموس (Translations)
    translations: {
        ar: {
            dashboard: "الرئيسية",
            upload: "رفع البيانات",
            reports: "التقارير",
            healthScore: "مؤشر الصحة المالية",
            langBtn: "English"
        },
        en: {
            dashboard: "Dashboard",
            upload: "Upload Data",
            reports: "Reports",
            healthScore: "Financial Health Score",
            langBtn: "العربية"
        }
    },

    // 3. دالة التشغيل الأولية (Init)
    init() {
        console.log("App Initialized...");
        this.applyLanguage();
        this.showScreen('upload'); // نبدأ بشاشة الرفع كأول خطوة للمستخدم
    },

    // 4. دالة التنقل بين الشاشات
    showScreen(screenId) {
        this.state.currentScreen = screenId;
        
        // إخفاء كل الشاشات أولاً
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });

        // إظهار الشاشة المختارة فقط
        const targetScreen = document.getElementById(`screen-${screenId}`);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }

        console.log(`Mapsd to: ${screenId}`);
    },

    // 5. إدارة اللغات
    toggleLang() {
        this.state.currentLang = this.state.currentLang === 'ar' ? 'en' : 'ar';
        this.applyLanguage();
    },

    applyLanguage() {
        const lang = this.state.currentLang;
        const t = this.translations[lang];

        // تغيير اتجاه الصفحة
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // تحديث نصوص الأزرار (أمثلة)
        const langBtn = document.getElementById('langBtn');
        if (langBtn) langBtn.innerText = t.langBtn;

        // تحديث الخطوط بناءً على اللغة
        document.body.style.fontFamily = lang === 'ar' ? "'Tajawal', sans-serif" : "'Plus Jakarta Sans', sans-serif";
    }
};

// تشغيل التطبيق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => App.init());
