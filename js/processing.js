/* ClarityFinance — Processing Animation (processing.js) */

var PROC = {
  run: function() {
    const steps = document.querySelectorAll('#proc-list .proc-step');
    const ring = document.getElementById('proc-ring');
    const pct = document.getElementById('proc-pct');
    if (!steps.length) return;

    const pcts = [25, 50, 75, 100];
    const circumference = 314;
    let i = 0;

    steps.forEach(function(s) {
      const dot = s.querySelector('.proc-dot');
      const span = s.querySelector('span');
      if (dot) {
        dot.style.background = '';
        dot.style.borderColor = '';
        dot.style.color = '';
      }
      if (span) {
        span.style.color = '';
        span.style.fontWeight = '';
      }
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
          dot.style.transform = 'scale(1.15)';
          dot.style.boxShadow = '0 0 12px rgba(61,166,102,0.5)';
          setTimeout(function(d) { d.style.transform = 'scale(1)'; }, 300, dot);
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
        setTimeout(function() { CF.show('dashboard'); }, 600);
      }
    }

    setTimeout(tick, 500);
  }
};
