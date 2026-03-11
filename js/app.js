/* ClarityFinance — Core App Controller (app.js) */

var CF = {
  lang: 'ar',
  theme: 'light',
  cur: 'login',
  translations: {},

  /* Initialize app */
  init: async function() {
    const savedTheme = localStorage.getItem('cf_theme') || 'light';
    const savedLang = localStorage.getItem('cf_lang') || 'ar';
    
    await CF.loadTranslations(savedLang);
    CF.setTheme(savedTheme, true);
    CF.setLang(savedLang, true);
    CF.show(CF.cur);
    CF.initParticles();
    CF.initHealthCard3D();
  },

  /* Load translations */
  loadTranslations: async function(lang) {
    try {
      const response = await fetch(`assets/i18n/${lang}.json`);
      CF.translations = await response.json();
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  },

  /* Translate text */
  t: function(key, params = {}) {
    const keys = key.split('.');
    let value = CF.translations;
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value === 'string') {
      return value.replace(/{(\w+)}/g, (match, p1) => params[p1] || match);
    }
    
    return value || key;
  },

  /* Navigation */
  show: function(id) {
    const prev = document.getElementById('s-' + CF.cur);
    if (prev) {
      prev.classList.remove('active');
      prev.style.display = 'none';
    }
    
    CF.cur = id;
    const next = document.getElementById('s-' + id);
    if (!next) return;
    
    next.style.display = 'block';
    void next.offsetWidth; // trigger reflow
    next.classList.add('active');
    next.scrollTop = 0;
    
    CF.syncNav(id);
    
    if (id === 'validation') CF.runValidation();
    if (id === 'processing') PROC.run();
    if (id === 'dashboard') CF.animateDashboard();
  },

  /* Sync navigation active state */
  syncNav: function(id) {
    document.querySelectorAll('.nav-item').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.screen === id);
    });
  },

  /* Language handling */
  setLang: async function(lang, silent) {
    CF.lang = lang;
    localStorage.setItem('cf_lang', lang);
    
    await CF.loadTranslations(lang);
    
    const isAr = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.getAttribute('data-i18n');
      const translation = CF.t(key);
      
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
    
    document.querySelectorAll('.lang-toggle').forEach(function(btn) {
      btn.textContent = isAr ? 'EN' : 'ع';
    });
    
    if (!silent) CF.show(CF.cur);
  },

  toggleLang: function() {
    CF.setLang(CF.lang === 'ar' ? 'en' : 'ar');
  },

  /* Theme handling */
  setTheme: function(theme, silent) {
    CF.theme = theme;
    localStorage.setItem('cf_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const moonSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const sunSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    document.querySelectorAll('.theme-icon').forEach(function(el) {
      el.innerHTML = theme === 'dark' ? sunSvg : moonSvg;
      el.style.transition = 'transform 0.4s var(--ease-spring)';
      el.style.transform = 'rotate(180deg)';
      setTimeout(function() { el.style.transform = 'rotate(0deg)'; }, 10);
    });
  },

  toggleTheme: function() {
    CF.setTheme(CF.theme === 'light' ? 'dark' : 'light');
  },

  /* Dashboard animations */
  animateDashboard: function() {
    setTimeout(function() {
      const bar = document.querySelector('.health-bar-fill');
      const ring = document.querySelector('.health-ring-fill');
      if (bar) bar.style.width = '76%';
      if (ring) {
        ring.style.strokeDashoffset = (188.5 - 188.5 * 0.76).toString();
      }
    }, 200);
  },

  /* Validation animation */
  runValidation: function() {
    const steps = document.querySelectorAll('#val-steps .val-step');
    const proc = document.getElementById('val-processing');
    const succ = document.getElementById('val-success');
    
    if (!proc) return;

    steps.forEach(function(s) {
      s.style.opacity = '0.4';
    });
    proc.style.display = 'block';
    if (succ) succ.style.display = 'none';

    let i = 0;
    function nextStep() {
      if (i < steps.length) {
        steps[i].style.color = 'var(--green)';
        steps[i].style.fontWeight = '700';
        steps[i].style.opacity = '1';
        i++;
        setTimeout(nextStep, 680);
      } else {
        setTimeout(function() {
          proc.style.display = 'none';
          if (succ) {
            succ.style.display = 'block';
            succ.style.animation = 'scaleIn 0.4s var(--ease-spring) both';
          }
        }, 450);
      }
    }
    setTimeout(nextStep, 400);
  },

  /* 3D Health Card */
  initHealthCard3D: function() {
    document.addEventListener('mousemove', function(e) {
      const card = document.querySelector('#s-dashboard .health-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const inCard = Math.abs(dx) < 0.7 && Math.abs(dy) < 0.7;
      
      if (inCard) {
        card.style.transform =
          'perspective(900px) rotateX(' + (-dy * 6) + 'deg) rotateY(' + (dx * 6) + 'deg) translateY(-3px)';
      } else {
        card.style.transform = '';
      }
    });
  },

  /* Floating particles */
  initParticles: function() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? '#3DA666' : '#1A5C40'
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      
      particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      
      particles.forEach(function(a, i) {
        particles.slice(i+1).forEach(function(b) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = '#3DA666';
            ctx.globalAlpha = (1 - dist/100) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });
      
      requestAnimationFrame(draw);
    }
    draw();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  CF.init();
});
