// ============================================
// ClarityFinance – JavaScript Module (Advanced)
// الإصدار: 4.0.0
// ============================================

// ---------- App State ----------
const AppState = (() => {
  let state = {
    theme: 'light',
    language: 'ar',
    currentScreen: 'login',
    validationExecuted: false,
    processingExecuted: false
  };

  const listeners = [];

  return {
    get: () => ({ ...state }),
    set: (newState) => {
      state = { ...state, ...newState };
      listeners.forEach(fn => fn(state));
    },
    subscribe: (fn) => {
      listeners.push(fn);
      return () => listeners.splice(listeners.indexOf(fn), 1);
    }
  };
})();

// ---------- Storage Service ----------
const StorageService = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

// ---------- I18n Service ----------
const I18nService = {
  translations: {
    ar: {
      'hero.title': 'وضوح مالي حقيقي',
      'hero.subtitle': 'من بيانات خام إلى قرارات واضحة · أقل من 5 دقائق',
      'login.title': 'تسجيل الدخول',
      'login.email': 'البريد الإلكتروني',
      'login.password': 'كلمة المرور',
      'login.signin': 'دخول',
      'login.or': 'أو',
      'login.try': 'تجربة بدون حساب',
      'login.security': 'بياناتك مشفرة ومحمية · لن نشاركها مع أي جهة'
    },
    en: {
      'hero.title': 'Real Financial Clarity',
      'hero.subtitle': 'From raw numbers to clear decisions · under 5 minutes',
      'login.title': 'Sign In',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.signin': 'Sign In',
      'login.or': 'or',
      'login.try': 'Try without account',
      'login.security': 'Your data is encrypted · never shared with third parties'
    }
  },

  currentLanguage: 'ar',

  init() {
    this.currentLanguage = StorageService.get('language', 'ar');
    this.applyLanguage();
  },

  setLanguage(lang) {
    this.currentLanguage = lang;
    StorageService.set('language', lang);
    this.applyLanguage();
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  },

  applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (this.translations[this.currentLanguage]?.[key]) {
        el.textContent = this.translations[this.currentLanguage][key];
      }
    });

    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.textContent = this.currentLanguage === 'ar' ? 'EN' : 'ع';
    });
  },

  toggle() {
    this.setLanguage(this.currentLanguage === 'ar' ? 'en' : 'ar');
  }
};

// ---------- Theme Service ----------
const ThemeService = {
  init() {
    const saved = StorageService.get('theme', 'light');
    this.set(saved);
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    StorageService.set('theme', theme);
    this.updateIcon(theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.set(current === 'light' ? 'dark' : 'light');
  },

  updateIcon(theme) {
    const icon = document.querySelector('#theme-toggle use');
    if (icon) {
      icon.setAttribute('href', theme === 'light' ? '#icon-moon' : '#icon-sun');
    }
  }
};

// ---------- Screen Manager ----------
const ScreenManager = {
  init() {
    window.addEventListener('popstate', (e) => {
      if (e.state?.screen) {
        this.show(e.state.screen, false);
      }
    });
  },

  show(screenId, updateHistory = true) {
    const currentScreen = document.querySelector('.screen--active');
    const nextScreen = document.getElementById(`${screenId}-screen`);

    if (!nextScreen) return;

    if (currentScreen) {
      currentScreen.classList.remove('screen--active');
    }

    nextScreen.classList.add('screen--active');
    AppState.set({ currentScreen: screenId });

    if (updateHistory) {
      history.pushState({ screen: screenId }, '', `#${screenId}`);
    }

    // Trigger screen-specific actions
    if (screenId === 'validation') {
      ValidationService.run();
    }
    if (screenId === 'processing') {
      ProcessingService.run();
    }
  },

  showLogin() { this.show('login'); },
  showUpload() { this.show('upload'); },
  showValidation() { this.show('validation'); },
  showMapping() { this.show('mapping'); },
  showProcessing() { this.show('processing'); },
  showDashboard() { this.show('dashboard'); },
  showInsights() { this.show('insights'); },
  showDueDiligence() { this.show('duediligence'); },
  showReports() { this.show('reports'); }
};

// ---------- Validation Service ----------
const ValidationService = {
  run() {
    if (AppState.get().validationExecuted) return;

    const steps = document.querySelectorAll('#val-steps .val-step');
    const processing = document.getElementById('val-processing');
    const success = document.getElementById('val-success');
    const error = document.getElementById('val-error');

    if (!processing || !steps.length) return;

    steps.forEach(s => {
      s.style.color = '';
      s.style.fontWeight = '';
      s.style.opacity = '0.45';
    });

    processing.style.display = 'block';
    if (success) success.style.display = 'none';
    if (error) error.style.display = 'none';

    let i = 0;

    const runStep = () => {
      if (i < steps.length) {
        steps[i].style.color = 'var(--color-green-600)';
        steps[i].style.fontWeight = '700';
        steps[i].style.opacity = '1';
        i++;
        setTimeout(runStep, 680);
      } else {
        setTimeout(() => {
          processing.style.display = 'none';
          if (success) success.style.display = 'block';
          AppState.set({ validationExecuted: true });
        }, 450);
      }
    };

    setTimeout(runStep, 400);
  }
};

// ---------- Processing Service ----------
const ProcessingService = {
  run() {
    if (AppState.get().processingExecuted) return;

    const steps = document.querySelectorAll('#proc-list .proc-step');
    const ring = document.getElementById('proc-ring');
    const percent = document.getElementById('proc-pct');

    if (!steps.length) return;

    const percentages = [25, 50, 75, 100];
    const circumference = 226;
    let i = 0;

    steps.forEach(s => {
      const dot = s.querySelector('.proc-dot');
      const span = s.querySelector('span');
      if (dot) {
        dot.style.borderColor = '';
        dot.style.background = '';
        dot.style.color = '';
      }
      if (span) {
        span.style.color = '';
        span.style.fontWeight = '';
      }
    });

    if (ring) ring.style.strokeDashoffset = circumference;
    if (percent) percent.textContent = '0%';

    const tick = () => {
      if (i < steps.length) {
        const dot = steps[i].querySelector('.proc-dot');
        const span = steps[i].querySelector('span');

        if (dot) {
          dot.style.background = 'var(--color-green-600)';
          dot.style.borderColor = 'var(--color-green-600)';
          dot.style.color = '#fff';
        }
        if (span) {
          span.style.color = 'var(--color-neutral-900)';
          span.style.fontWeight = '600';
        }

        const p = percentages[i];
        const offset = circumference - (circumference * p / 100);
        if (ring) ring.style.strokeDashoffset = offset;
        if (percent) percent.textContent = p + '%';

        i++;
        setTimeout(tick, 900);
      } else {
        AppState.set({ processingExecuted: true });
        setTimeout(() => ScreenManager.showDashboard(), 600);
      }
    };

    setTimeout(tick, 500);
  }
};

// ---------- Upload Service ----------
const UploadService = {
  dragOver(e) {
    e.preventDefault();
    document.getElementById('drop-zone')?.classList.add('drag');
  },

  dragLeave() {
    document.getElementById('drop-zone')?.classList.remove('drag');
  },

  drop(e) {
    e.preventDefault();
    this.dragLeave();
    const file = e.dataTransfer.files[0];
    if (file) this.showFile(file);
  },

  fileChosen(input) {
    if (input.files && input.files[0]) this.showFile(input.files[0]);
  },

  showFile(file) {
    const nameEl = document.getElementById('file-name');
    const metaEl = document.getElementById('file-meta');
    const previewEl = document.getElementById('file-preview');

    if (nameEl) nameEl.textContent = file.name;
    if (metaEl) {
      const size = (file.size / 1024 / 1024).toFixed(1);
      metaEl.textContent = `${size} MB - ${file.name.split('.').pop().toUpperCase()}`;
    }
    if (previewEl) previewEl.classList.add('show');
  },

  clearFile() {
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview')?.classList.remove('show');
  },

  setCurrency(cur, btn) {
    ['cur-sar', 'cur-usd', 'cur-eur'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.className = `btn btn--sm ${el.id === btn.id ? 'btn--primary' : 'btn--ghost'}`;
      }
    });
  },

  startAnalysis() {
    ScreenManager.showValidation();
  }
};

// ---------- Event Bus (للتواصل بين المكونات) ----------
const EventBus = {
  events: {},

  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
};

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  // Load saved preferences
  I18nService.init();
  ThemeService.init();

  // Set up event listeners
  document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeService.toggle());
  document.getElementById('lang-toggle')?.addEventListener('click', () => I18nService.toggle());
  document.getElementById('login-btn')?.addEventListener('click', () => ScreenManager.showUpload());
  document.getElementById('try-btn')?.addEventListener('click', () => ScreenManager.showUpload());

  // Initialize screen manager
  ScreenManager.init();

  // Show initial screen based on URL hash or default
  const initialScreen = window.location.hash.slice(1) || 'login';
  ScreenManager.show(initialScreen);
});

// ---------- Export for global usage ----------
window.AppState = AppState;
window.ScreenManager = ScreenManager;
window.UploadService = UploadService;
window.ValidationService = ValidationService;
window.ProcessingService = ProcessingService;
window.I18nService = I18nService;
window.ThemeService = ThemeService;
window.EventBus = EventBus;
