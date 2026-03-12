/**
 * ClarityFinance - المحرك المالي v1.5
 */
const App = {
    init() {
        console.log("المنصة جاهزة لتحليل البيانات...");
        this.setupListeners();
    },

    // 1. التنقل بين الشاشات بسلاسة
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
        const target = document.getElementById(`screen-${screenId}`);
        if (target) target.style.display = 'block';
        console.log("انتقال إلى شاشة:", screenId);
    },

    // 2. مراقبة رفع الملفات
    setupListeners() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    },

    // 3. قراءة الملف المرفوع
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.processFinancialData(text);
        };
        reader.readAsText(file);
    },

    // 4. تحليل البيانات (المحرك الذكي)
    processFinancialData(csvText) {
        const lines = csvText.split('\n');
        let totalRev = 0;
        let totalExp = 0;

        lines.forEach(line => {
            const columns = line.split(',');
            if (columns.length >= 2) {
                const label = columns[0].toLowerCase();
                const amount = parseFloat(columns[1]) || 0;

                // التصنيف التلقائي بناءً على الكلمات المفتاحية
                if (label.includes('sale') || label.includes('مبيعات') || label.includes('revenue')) {
                    totalRev += amount;
                } else if (label.includes('rent') || label.includes('مصروف') || label.includes('exp')) {
                    totalExp += amount;
                }
            }
        });

        this.updateDashboard(totalRev, totalExp);
    },

    // 5. تحديث الأرقام في الواجهة
    updateDashboard(rev, exp) {
        const profit = rev - exp;
        
        // سنفترض أن هذه هي الـ IDs الموجودة في الـ HTML الخاص بك
        const revElem = document.getElementById('rev-val');
        const expElem = document.getElementById('exp-val');
        const profitElem = document.getElementById('profit-val');

        if(revElem) revElem.innerText = rev.toLocaleString() + " ﷼";
        if(expElem) expElem.innerText = exp.toLocaleString() + " ﷼";
        if(profitElem) {
            profitElem.innerText = profit.toLocaleString() + " ﷼";
            profitElem.style.color = profit >= 0 ? '#d4af37' : '#ff4d4d'; // ذهبي للربح، أحمر للخسارة
        }

        // الانتقال للداشبورد فوراً لرؤية النتائج
        this.showScreen('dashboard');
    }
};

window.onload = () => App.init();
