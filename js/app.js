/**
 * ClarityFinance Core Logic - v1.3
 */

const App = {
    // 1. حالة التطبيق
    state: {
        currentScreen: 'upload',
        data: {
            revenue: 0,
            expenses: 0,
            profit: 0
        }
    },

    // 2. تشغيل التطبيق
    init() {
        console.log("App Starting...");
        this.setupEventListeners();
        // تأكد أننا نبدأ بشاشة الرفع
        this.showScreen('upload');
    },

    // 3. التبديل بين الشاشات
    showScreen(screenId) {
        this.state.currentScreen = screenId;

        // إخفاء كل الشاشات باستخدام الكلاسات
        document.querySelectorAll('.screen-view').forEach(screen => {
            screen.classList.remove('active-screen');
            screen.style.display = 'none';
        });

        // إظهار الشاشة المطلوبة
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active-screen');
            target.style.display = 'block';
        }

        // تحديث حالة الأزرار في القائمة الجانبية
        document.querySelectorAll('.nav-link').forEach(btn => {
            btn.classList.remove('active');
        });
        
        console.log("Showing screen:", screenId);
    },

    // 4. إعداد مراقبة الأزرار والملفات
    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    },

    // 5. معالجة الملف المرفوع
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.processData(text);
        };
        reader.readAsText(file);
    },

    // 6. تحليل البيانات (تحليل ذكي بسيط)
    processData(csvText) {
        const lines = csvText.split('\n');
        let rev = 0;
        let exp = 0;

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const label = parts[0].toLowerCase();
                const value = parseFloat(parts[1]) || 0;

                // كلمات مفتاحية بناءً على الـ PRD
                if (label.includes('sale') || label.includes('مبيعات') || label.includes('revenue')) {
                    rev += value;
                } else if (label.includes('rent') || label.includes('exp') || label.includes('مصروف')) {
                    exp += value;
                }
            }
        });

        this.updateUI(rev, exp);
    },

    // 7. تحديث الأرقام في الواجهة
    updateUI(rev, exp) {
        const profit = rev - exp;
        
        document.getElementById('rev-val').innerText = `﷼ ${rev.toLocaleString()}`;
        document.getElementById('exp-val').innerText = `﷼ ${exp.toLocaleString()}`;
        const profitElem = document.getElementById('profit-val');
        profitElem.innerText = `﷼ ${profit.toLocaleString()}`;
        
        // تغيير لون الربح إذا كان سالباً (خسارة)
        profitElem.style.color = profit >= 0 ? '#d4af37' : '#ff4d4d';

        // الانتقال للداشبورد لرؤية النتائج
        this.showScreen('dashboard');
    }
};

// تشغيل المحرك
window.addEventListener('DOMContentLoaded', () => App.init());
