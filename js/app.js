const App = {
    state: {
        currentLang: 'ar',
        currentScreen: 'dashboard'
    },

    // محتوى الشاشات (سننقل تصميمك v10 هنا)
    screens: {
        dashboard: `
            <div class="dashboard-grid">
                <div class="card health-card">
                    <h3>مؤشر الصحة المالية</h3>
                    <div class="score">72%</div>
                </div>
                <div class="card stats-card">
                    <h3>الإيرادات</h3>
                    <p>﷼ 0</p>
                </div>
                <div class="card stats-card">
                    <h3>المصاريف</h3>
                    <p>﷼ 0</p>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="mainChart"></canvas>
            </div>
        `,
        upload: `
            <div class="upload-area">
                <h2>ارفع ملفك المالي (CSV/Excel)</h2>
                <input type="file" id="fileInput" hidden>
                <button onclick="document.getElementById('fileInput').click()" class="btn-primary">اختر الملف</button>
                <p>سنسحب البيانات ونحللها لك في ثوانٍ</p>
            </div>
        `
    },

    init() {
        this.render();
    },

    showScreen(screenId) {
        this.state.currentScreen = screenId;
        this.render();
    },

    render() {
        const content = document.getElementById('screen-content');
        if (content) {
            content.innerHTML = this.screens[this.state.currentScreen];
        }
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
