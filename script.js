// ============================================
// ClarityFinance – script.js
// الإصدار النهائي – منظم، عالي الجودة، وجاهز
// ============================================

// ========== الحالة العامة ==========
let currentLang = 'ar';
let currentTheme = 'light';
let currentScreen = 'login';

// ========== دوال مساعدة ==========
function formatNumber(num) {
  if (num === undefined || num === null) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function safeLocalStorage(key, defaultValue) {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn('localStorage غير متاح');
    return defaultValue;
  }
}

// ========== إدارة السمات (Theme) ==========
function toggleTheme() {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

function setTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('cf_theme', theme);
  } catch (e) {}
  updateThemeIcons();
}

function updateThemeIcons() {
  const icons = document.querySelectorAll('.theme-icon');
  icons.forEach(el => {
    el.innerHTML = currentTheme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  });
}

// ========== إدارة اللغة ==========
function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
}

function setLang(lang) {
  currentLang = lang;
  const isAr = lang === 'ar';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  
  document.querySelectorAll('[data-ar]').forEach(el => {
    if (el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && el.tagName !== 'TEXTAREA') {
      el.textContent = isAr ? (el.dataset.ar || '') : (el.dataset.en || el.dataset.ar || '');
    }
  });
  
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = isAr ? 'EN' : 'ع';
  });
  
  try {
    localStorage.setItem('cf_lang', lang);
  } catch (e) {}
}

// ========== التنقل بين الشاشات ==========
function showScreen(id) {
  const prev = document.getElementById('s-' + currentScreen);
  if (prev) {
    prev.classList.remove('active');
    prev.style.display = 'none';
  }
  
  const next = document.getElementById('s-' + id);
  if (!next) {
    console.error('الشاشة غير موجودة: s-' + id);
    return;
  }
  
  next.style.display = 'block';
  next.classList.add('active');
  next.scrollTop = 0;
  currentScreen = id;

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === id);
  });

  if (id === 'validation') runValidation();
  if (id === 'processing') runProcessing();
}

// ========== تحميل القالب ==========
function downloadTemplate(e) {
  e.preventDefault();
  const content = 'الحساب,المبلغ\nإيرادات المبيعات,100000\nمصاريف إيجار,25000\nرواتب,45000\n';
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clarity_finance_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

// ========== الترقية (مؤقت) ==========
function upgradePlan(plan) {
  alert(`شكراً لاهتمامك بخطة ${plan}! سيتم تفعيل الدفع قريباً.`);
}

// ========== رفع الملفات ==========
function dragOver(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.add('drag');
}

function dragLeave() {
  document.getElementById('drop-zone').classList.remove('drag');
}

function dropFile(e) {
  e.preventDefault();
  dragLeave();
  const f = e.dataTransfer.files[0];
  if (f) showFile(f);
}

function fileChosen(input) {
  if (input.files && input.files[0]) showFile(input.files[0]);
}

function showFile(file) {
  document.getElementById('file-name').textContent = file.name;
  const size = (file.size / 1024 / 1024).toFixed(1);
  document.getElementById('file-meta').textContent = size + ' MB - ' + file.name.split('.').pop().toUpperCase();
  document.getElementById('file-preview').classList.add('show');
}

function clearFile() {
  document.getElementById('file-input').value = '';
  document.getElementById('file-preview').classList.remove('show');
}

function setCurrency(cur, btn) {
  ['cur-sar', 'cur-usd', 'cur-eur'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'btn btn-sm ' + (el.id === btn.id ? 'btn-primary' : 'btn-ghost');
  });
}

function startAnalysis() {
  showScreen('validation');
}

// ========== التحقق (Validation) ==========
function runValidation() {
  const steps = document.querySelectorAll('#val-steps .val-step');
  const proc = document.getElementById('val-processing');
  const succ = document.getElementById('val-success');
  const err = document.getElementById('val-error');
  if (!proc) return;
  
  steps.forEach(s => { s.style.color = ''; s.style.fontWeight = ''; s.style.opacity = '0.45'; });
  proc.style.display = 'block';
  if (succ) succ.style.display = 'none';
  if (err) err.style.display = 'none';
  
  let i = 0;
  function next() {
    if (i < steps.length) {
      steps[i].style.color = 'var(--green)';
      steps[i].style.fontWeight = '700';
      steps[i].style.opacity = '1';
      i++;
      setTimeout(next, 680);
    } else {
      setTimeout(() => {
        proc.style.display = 'none';
        if (succ) succ.style.display = 'block';
      }, 450);
    }
  }
  setTimeout(next, 400);
}

// ========== المعالجة (Processing) ==========
function runProcessing() {
  const steps = document.querySelectorAll('#proc-list .proc-step');
  const ring = document.getElementById('proc-ring');
  const pct = document.getElementById('proc-pct');
  if (!steps.length) return;
  
  const pcts = [25, 50, 75, 100];
  const circumference = 226;
  let i = 0;
  
  steps.forEach(s => {
    const dot = s.querySelector('.proc-dot');
    const span = s.querySelector('span');
    if (dot) { dot.style.borderColor = ''; dot.style.background = ''; dot.style.color = ''; }
    if (span) { span.style.color = ''; span.style.fontWeight = ''; }
  });
  
  if (ring) ring.style.strokeDashoffset = circumference;
  if (pct) pct.textContent = '0%';
  
  function tick() {
    if (i < steps.length) {
      const dot = steps[i].querySelector('.proc-dot');
      const span = steps[i].querySelector('span');
      if (dot) {
        dot.style.background = 'var(--green)';
        dot.style.borderColor = 'var(--green)';
        dot.style.color = '#fff';
      }
      if (span) {
        span.style.color = 'var(--ink)';
        span.style.fontWeight = '600';
      }
      const p = pcts[i];
      const offset = circumference - (circumference * p / 100);
      if (ring) ring.style.strokeDashoffset = offset;
      if (pct) pct.textContent = p + '%';
      i++;
      setTimeout(tick, 900);
    } else {
      setTimeout(() => showScreen('dashboard'), 600);
    }
  }
  setTimeout(tick, 500);
}

// ========== التصنيف (Mapping) ==========
function filterMapping(type, btn) {
  document.querySelectorAll('.map-item').forEach(el => {
    el.style.display = (type === 'all' || el.dataset.status === type) ? 'flex' : 'none';
  });
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function toggleCategory(header) {
  const body = header.nextElementSibling;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  header.classList.toggle('open', !open);
}

function confirmMapping(btn, itemId) {
  const item = document.getElementById(itemId);
  if (!item) return;
  const select = item.querySelector('select');
  const catText = select ? select.options[select.selectedIndex].text : 'مؤكد';
  
  item.classList.remove('map-item-review', 'map-item-manual');
  item.classList.add('map-item-done');
  item.dataset.status = 'auto';
  
  const mainDiv = item.querySelector('.map-item-main');
  if (mainDiv) {
    const catSpan = mainDiv.querySelector('.map-item-cat');
    if (catSpan) catSpan.textContent = catText;
  }
  
  const actionsDiv = item.querySelector('.map-review-actions');
  if (actionsDiv) {
    actionsDiv.innerHTML = '<span class="badge badge-green">مؤكد ✓</span>';
  }
}

function manualSelect(select, itemId) {
  if (!select.value && select.selectedIndex === 0) return;
  const item = document.getElementById(itemId);
  if (!item) return;
  const catText = select.options[select.selectedIndex].text;
  
  item.classList.remove('map-item-manual');
  item.classList.add('map-item-done');
  item.dataset.status = 'auto';
  
  const mainDiv = item.querySelector('.map-item-main');
  if (mainDiv) {
    const catSpan = mainDiv.querySelector('.map-item-cat');
    if (catSpan) catSpan.textContent = catText;
  }
  
  const actionsDiv = item.querySelector('.map-review-actions');
  if (actionsDiv) {
    actionsDiv.innerHTML = '<span class="badge badge-green">مؤكد ✓</span>';
  }
}

// ========== Due Diligence ==========
function toggleSection(id) {
  const body = document.getElementById(id);
  if (!body) return;
  const hdr = body.previousElementSibling;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  if (hdr) hdr.classList.toggle('open', !isOpen);
}

// ========== التهيئة ==========
window.onload = function() {
  const savedTheme = safeLocalStorage('cf_theme', 'light');
  setTheme(savedTheme);
  
  const savedLang = safeLocalStorage('cf_lang', 'ar');
  setLang(savedLang);
  
  showScreen('login');
  
  // Empty state للتقارير إذا لزم
  const reportsContainer = document.querySelector('#s-reports .card');
  if (reportsContainer && !reportsContainer.querySelector('.empty-state')) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state show';
    emptyDiv.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><h3>لا توجد تقارير بعد</h3><p>ارفع ملفك الأول لترى تحليلك المالي</p>';
    reportsContainer.prepend(emptyDiv);
  }
};

// ========== تصدير الدوال للاستخدام العام ==========
window.toggleTheme = toggleTheme;
window.toggleLang = toggleLang;
window.showScreen = showScreen;
window.downloadTemplate = downloadTemplate;
window.upgradePlan = upgradePlan;
window.dragOver = dragOver;
window.dragLeave = dragLeave;
window.dropFile = dropFile;
window.fileChosen = fileChosen;
window.clearFile = clearFile;
window.setCurrency = setCurrency;
window.startAnalysis = startAnalysis;
window.filterMapping = filterMapping;
window.toggleCategory = toggleCategory;
window.confirmMapping = confirmMapping;
window.manualSelect = manualSelect;
window.toggleSection = toggleSection;
