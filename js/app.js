const App = {
    init() {
        console.log("App started...");
        this.setupListeners();
    },

    setupListeners() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    alert("تم استلام الملف: " + file.name); // تنبيه للتأكد أن الرفع اشتغل
                    this.handleFile(file);
                }
            });
        } else {
            console.error("لم يتم العثور على عنصر fileInput");
        }
    },

    handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.processData(content);
        };
        reader.readAsText(file);
    },

    processData(text) {
        const lines = text.split('\n');
        let rev = 0, exp = 0;

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const label = parts[0].toLowerCase();
                const val = parseFloat(parts[1]) || 0;
                if (label.includes('sale') || label.includes('revenue') || label.includes('مبيعات')) rev += val;
                else if (label.includes('rent') || label.includes('exp') || label.includes('مصروف')) exp += val;
            }
        });

        // تحديث الأرقام
        document.getElementById('rev-val').innerText = rev.toLocaleString() + " ﷼";
        document.getElementById('exp-val').innerText = exp.toLocaleString() + " ﷼";
        document.getElementById('profit-val').innerText = (rev - exp).toLocaleString() + " ﷼";

        // إظهار الداشبورد وإخفاء الرفع
        document.getElementById('screen-upload').style.display = 'none';
        document.getElementById('screen-dashboard').style.display = 'block';
    }
};

window.onload = () => App.init();
