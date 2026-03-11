// ========== إدارة السمات ==========
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateIcons();
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    this.updateIcons();
  }

  updateIcons() {
    const icon = document.querySelector('#theme-toggle .icon use');
    if (icon) {
      icon.setAttribute('href', this.theme === 'light' ? '#icon-moon' : '#icon-sun');
    }
  }
}

// ========== إدارة اللغة ==========
class LangManager {
  constructor() {
    this.lang = localStorage.getItem('lang') || 'ar';
    this.init();
  }

  init() {
    this.setLanguage(this.lang);
  }

  toggle() {
    this.setLanguage(this.lang === 'ar' ? 'en' : 'ar');
  }

  setLanguage(lang) {
    this.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('lang', lang);
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.getTranslation(key, lang);
    });

    document.querySelector('#lang-toggle').textContent = lang === 'ar' ? 'EN' : 'ع';
  }

  getTranslation(key, lang) {
    const translations = {
      'hero.title': { ar: 'وضوح مالي حقيقي', en: 'Real Financial Clarity' },
      'hero.subtitle': { ar: 'من بيانات خام إلى قرارات واضحة · أقل من 5 دقائق', en: 'From raw numbers to clear decisions · under 5 minutes' },
      'login.title': { ar: 'تسجيل الدخول', en: 'Sign In' },
      'login.email': { ar: 'البريد الإلكتروني', en: 'Email' },
      'login.password': { ar: 'كلمة المرور', en: 'Password' },
      'login.signin': { ar: 'دخول', en: 'Sign In' },
      'login.or': { ar: 'أو', en: 'or' },
      'login.try': { ar: 'تجربة بدون حساب', en: 'Try without account' },
      'login.security': { ar: 'بياناتك مشفرة ومحمية · لن نشاركها مع أي جهة', en: 'Your data is encrypted · never shared with third parties' }
    };
    return translations[key]?.[lang] || '';
  }
}

// ========== إدارة الشاشات ==========
class ScreenManager {
  constructor() {
    this.currentScreen = 'login';
    this.screens = document.querySelectorAll('.screen');
  }

  show(screenId) {
    this.screens.forEach(screen => {
      screen.classList.remove('screen--active');
    });
    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
      target.classList.add('screen--active');
      this.currentScreen = screenId;
    }
  }
}

// ========== التهيئة ==========
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
  window.langManager = new LangManager();
  window.screenManager = new ScreenManager();

  document.getElementById('theme-toggle').addEventListener('click', () => {
    window.themeManager.toggle();
  });

  document.getElementById('lang-toggle').addEventListener('click', () => {
    window.langManager.toggle();
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    window.screenManager.show('upload');
  });

  document.getElementById('try-btn').addEventListener('click', () => {
    window.screenManager.show('upload');
  });
});
