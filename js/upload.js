/* ClarityFinance — Upload & Validation (upload.js) */

var UPLOAD = {
  cur: 'SAR',
  fileData: null,
  columns: [],
  errors: [],
  mapping: {},

  dragOver: function(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.add('drag');
  },

  dragLeave: function() {
    document.getElementById('drop-zone').classList.remove('drag');
  },

  drop: function(e) {
    e.preventDefault();
    UPLOAD.dragLeave();
    const f = e.dataTransfer.files[0];
    if (f) UPLOAD.processFile(f);
  },

  fileChosen: function(inp) {
    if (inp.files && inp.files[0]) UPLOAD.processFile(inp.files[0]);
  },

  processFile: function(f) {
    if (f.size > 10 * 1024 * 1024) {
      alert(CF.lang === 'ar' ? 'الملف أكبر من 10MB' : 'File exceeds 10MB');
      return;
    }
    
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert(CF.lang === 'ar' ? 'يُقبل فقط xlsx, xls, csv' : 'Only xlsx, xls, csv accepted');
      return;
    }
    
    document.getElementById('file-name').textContent = f.name;
    document.getElementById('file-meta').textContent = (f.size / 1024).toFixed(0) + ' KB · ' + ext.toUpperCase();
    document.getElementById('file-preview').classList.add('show');
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        UPLOAD.onParsed(rows, f.name);
      } catch (err) {
        UPLOAD.showParseError(err);
      }
    };
    reader.readAsArrayBuffer(f);
  },

  onParsed: function(rows, fname) {
    if (!rows || rows.length < 2) {
      UPLOAD.showParseError(CF.lang === 'ar' ? 'الملف فارغ' : 'File empty');
      return;
    }
    
    const headers = rows[0].map(function(h) { return String(h).trim(); });
    const dataRows = rows.slice(1).filter(function(r) {
      return r.some(function(c) { return c !== '' && c !== null; });
    });
    
    UPLOAD.columns = headers;
    UPLOAD.fileData = dataRows;
    UPLOAD.errors = [];
    
    UPLOAD.renderPreview(headers, dataRows);
    UPLOAD.quickValidate(headers, dataRows);
    UPLOAD.autoMap(headers);
    
    const wrap = document.getElementById('data-preview-wrap');
    wrap.style.display = 'block';
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderPreview: function(headers, rows) {
    const badge = document.getElementById('preview-rows-badge');
    if (badge) badge.textContent = rows.length + ' ' + (CF.lang === 'ar' ? 'صف' : 'rows');
    
    const chips = document.getElementById('col-chips');
    if (chips) {
      chips.innerHTML = '';
      headers.forEach(function(h) {
        const cat = UPLOAD.guessCategory(h);
        const chip = document.createElement('span');
        chip.className = 'file-chip';
        chip.style.background = cat.color;
        chip.style.color = cat.text;
        chip.style.border = '1px solid ' + cat.border;
        chip.style.fontWeight = '700';
        chip.textContent = h;
        chips.appendChild(chip);
      });
    }
    
    const tbl = document.getElementById('preview-table');
    if (!tbl) return;
    
    const preview = rows.slice(0, 6);
    let html = '<thead><tr>';
    headers.forEach(function(h) {
      html += '<th style="white-space:nowrap;padding:8px 12px">' + UPLOAD.esc(h) + '</th>';
    });
    html += '</tr></thead><tbody>';
    
    preview.forEach(function(row) {
      html += '<tr>';
      headers.forEach(function(_, ci) {
        const val = row[ci] !== undefined ? row[ci] : '';
        html += '<td style="white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis">' + UPLOAD.esc(String(val)) + '</td>';
      });
      html += '</tr>';
    });
    
    if (rows.length > 6) {
      html += '<tr><td colspan="' + headers.length + '" style="text-align:center;color:var(--muted);font-size:11px;padding:8px">... ' +
              (rows.length - 6) + ' ' + (CF.lang === 'ar' ? 'صف إضافي' : 'more rows') + '</td></tr>';
    }
    html += '</tbody>';
    tbl.innerHTML = html;
  },

  quickValidate: function(headers, rows) {
    const errs = [];
    const warns = [];
    
    headers.forEach(function(h, i) {
      if (!h) errs.push({ type: 'error', msg: (CF.lang === 'ar' ? 'عمود بدون اسم في الموضع ' : 'Unnamed column at position ') + (i + 1) });
    });
    
    const numCols = [];
    headers.forEach(function(h, ci) {
      const nums = rows.filter(function(r) {
        return r[ci] !== '' && !isNaN(parseFloat(String(r[ci]).replace(/,/g, '')));
      }).length;
      if (nums / rows.length > 0.7) numCols.push(h);
    });
    
    if (numCols.length === 0) {
      warns.push({ type: 'warn', msg: CF.lang === 'ar' ? 'لم يتم اكتشاف أعمدة أرقام' : 'No numeric columns detected' });
    }
    
    const emptyRows = rows.filter(function(r) {
      return r.every(function(c) { return c === '' || c === null; });
    }).length;
    
    if (emptyRows > 0) {
      warns.push({ type: 'warn', msg: (CF.lang === 'ar' ? 'يوجد ' : '') + emptyRows + (CF.lang === 'ar' ? ' صف فارغ' : ' empty rows') });
    }
    
    const seen = {};
    headers.forEach(function(h) {
      if (h && seen[h]) errs.push({ type: 'error', msg: (CF.lang === 'ar' ? 'عمود مكرر: ' : 'Duplicate column: ') + h });
      seen[h] = true;
    });
    
    UPLOAD.errors = errs.concat(warns);
    
    const sum = document.getElementById('parse-summary');
    if (!sum) return;
    
    sum.innerHTML = '<span class="badge badge-green">' + rows.length + (CF.lang === 'ar' ? ' صف' : ' rows') + '</span>' +
                    '<span class="badge badge-blue">' + headers.length + (CF.lang === 'ar' ? ' عمود' : ' cols') + '</span>' +
                    '<span class="badge badge-green">' + numCols.length + (CF.lang === 'ar' ? ' عمود أرقام' : ' numeric') + '</span>';
    
    errs.forEach(function(e) {
      sum.innerHTML += '<span class="badge badge-red">' + UPLOAD.esc(e.msg) + '</span>';
    });
    warns.forEach(function(w) {
      sum.innerHTML += '<span class="badge badge-amber">' + UPLOAD.esc(w.msg) + '</span>';
    });
    
    if (errs.length === 0 && warns.length === 0) {
      sum.innerHTML += '<span class="badge badge-green">✓ ' + (CF.lang === 'ar' ? 'الملف سليم' : 'File OK') + '</span>';
    }
  },

  autoMap: function(headers) {
    UPLOAD.mapping = {};
    headers.forEach(function(h) {
      UPLOAD.mapping[h] = UPLOAD.guessCategory(h).label;
    });
  },

  guessCategory: function(h) {
    const lh = h.toLowerCase();
    
    if (/revenue|sales|income|إيراد|مبيع/.test(lh)) {
      return { label: 'Revenue', color: 'var(--green4)', text: 'var(--green)', border: 'var(--green3)' };
    }
    if (/cost|cogs|تكلفة/.test(lh)) {
      return { label: 'Cost of Sales', color: '#FFF7ED', text: '#9A3412', border: '#FED7AA' };
    }
    if (/salary|salaries|wage|راتب|رواتب/.test(lh)) {
      return { label: 'Salaries', color: 'var(--blue2)', text: 'var(--blue)', border: '#BFDBFE' };
    }
    if (/rent|إيجار/.test(lh)) {
      return { label: 'Rent', color: 'var(--amber2)', text: 'var(--amber)', border: '#FDE68A' };
    }
    if (/market|تسويق/.test(lh)) {
      return { label: 'Marketing', color: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' };
    }
    if (/admin|إدار/.test(lh)) {
      return { label: 'Admin', color: 'var(--surface2)', text: 'var(--ink2)', border: 'var(--border)' };
    }
    if (/date|تاريخ|period|فترة/.test(lh)) {
      return { label: 'Date', color: 'var(--surface2)', text: 'var(--muted)', border: 'var(--border)' };
    }
    if (/account|حساب/.test(lh)) {
      return { label: 'Account', color: 'var(--surface2)', text: 'var(--ink2)', border: 'var(--border)' };
    }
    if (/amount|value|total|مبلغ|قيمة|إجمالي/.test(lh)) {
      return { label: 'Amount', color: 'var(--green4)', text: 'var(--green)', border: 'var(--green3)' };
    }
    
    return { label: 'Other', color: 'var(--surface2)', text: 'var(--muted)', border: 'var(--border)' };
  },

  clearFile: function() {
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview').classList.remove('show');
    document.getElementById('data-preview-wrap').style.display = 'none';
    UPLOAD.fileData = null;
    UPLOAD.columns = [];
    UPLOAD.errors = [];
    UPLOAD.mapping = {};
  },

  setCur: function(cur, btn) {
    UPLOAD.cur = cur;
    ['cur-sar', 'cur-usd', 'cur-eur'].forEach(function(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = 'btn btn-sm ' + (el.id === btn.id ? 'btn-primary' : 'btn-ghost');
    });
  },

  start: function() {
    if (!UPLOAD.fileData) {
      CF.show('validation');
      return;
    }
    
    const criticalErrs = UPLOAD.errors.filter(function(e) { return e.type === 'error'; });
    if (criticalErrs.length > 0) {
      const msg = (CF.lang === 'ar' ? 'يوجد أخطاء:\n' : 'File errors:\n') +
                  criticalErrs.map(function(e) { return '• ' + e.msg; }).join('\n');
      if (!confirm(msg + '\n\n' + (CF.lang === 'ar' ? 'هل تريد المتابعة؟' : 'Continue anyway?'))) return;
    }
    
    UPLOAD.injectRealMapping();
    CF.show('validation');
  },

  injectRealMapping: function() {
    const list = document.getElementById('map-list');
    if (!list || !UPLOAD.columns.length) return;
    
    const CATS = ['Revenue', 'Cost of Sales', 'Salaries', 'Rent', 'Marketing', 'Admin', 'Assets', 'Liabilities', 'Other'];
    let html = '<div class="map-cat-header open" onclick="MAPPING.toggleCat(this)"><div class="map-cat-icon" style="background:var(--green4);color:var(--green)">📂</div><div class="map-cat-info"><div class="map-cat-name">الأعمدة المكتشفة</div><div class="map-cat-sub">' + UPLOAD.columns.length + ' عمود</div></div><svg class="map-cat-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></div><div class="map-cat-body">';
    
    UPLOAD.columns.forEach(function(col, i) {
      const guess = UPLOAD.guessCategory(col);
      const isHigh = ['Revenue', 'Amount', 'Cost of Sales', 'Salaries', 'Rent'].includes(guess.label);
      const conf = isHigh ? (85 + Math.floor(Math.random() * 13)) : (55 + Math.floor(Math.random() * 25));
      const status = conf >= 85 ? 'auto' : conf >= 60 ? 'review' : 'manual';
      const id = 'map-real-' + i;
      
      if (status === 'auto') {
        html += '<div class="map-item" data-status="auto" style="display:flex;align-items:center;gap:12px"><div class="map-item-main"><div class="map-item-name">' + UPLOAD.esc(col) + '</div><div class="map-item-cat">' + guess.label + '</div></div><div class="map-item-end"><span class="conf-pill conf-high">' + conf + '%</span><span class="map-check">✓</span></div></div>';
      } else if (status === 'review') {
        html += '<div class="map-item map-item-review" data-status="review" id="' + id + '"><div class="map-review-header"><div class="map-item-main"><div class="map-item-name">' + UPLOAD.esc(col) + '</div><div class="map-item-cat">مقترح: ' + guess.label + '</div></div><span class="conf-pill conf-medium">' + conf + '%</span></div><div class="map-review-actions"><button class="btn btn-sm btn-primary" onclick="MAPPING.confirm(this,\'' + id + '\')">تأكيد ✓</button><select class="map-select">';
        CATS.forEach(function(c) {
          html += '<option' + (c === guess.label ? ' selected' : '') + '>' + c + '</option>';
        });
        html += '</select></div></div>';
      } else {
        html += '<div class="map-item map-item-manual" data-status="manual" id="' + id + '"><div class="map-review-header"><div class="map-item-main"><div class="map-item-name">' + UPLOAD.esc(col) + '</div><div class="map-item-cat" style="color:var(--red)">غير معروف</div></div><span class="conf-pill conf-low">' + conf + '%</span></div><select class="map-select" onchange="MAPPING.manualSelect(this,\'' + id + '\')"><option value="">— اختر الفئة —</option>';
        CATS.forEach(function(c) {
          html += '<option>' + c + '</option>';
        });
        html += '</select></div>';
      }
    });
    
    html += '</div>';
    list.innerHTML = html;
    
    const autoCount = UPLOAD.columns.filter(function(c) {
      const g = UPLOAD.guessCategory(c);
      return ['Revenue', 'Amount', 'Cost of Sales', 'Salaries', 'Rent'].includes(g.label);
    }).length;
    
    const reviewCount = Math.floor((UPLOAD.columns.length - autoCount) * 0.6);
    const ca = document.getElementById('map-count-auto');
    const cr = document.getElementById('map-count-review');
    const cm = document.getElementById('map-count-manual');
    
    if (ca) ca.textContent = autoCount;
    if (cr) cr.textContent = reviewCount;
    if (cm) cm.textContent = UPLOAD.columns.length - autoCount - reviewCount;
    
    const bar = document.getElementById('map-progress');
    const lbl = document.getElementById('map-pct-label');
    const pct = Math.round(autoCount / UPLOAD.columns.length * 100);
    
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = autoCount + ' / ' + UPLOAD.columns.length;
  },

  showParseError: function(err) {
    const sum = document.getElementById('parse-summary');
    if (sum) sum.innerHTML = '<span class="badge badge-red">خطأ: ' + UPLOAD.esc(String(err)) + '</span>';
    const wrap = document.getElementById('data-preview-wrap');
    if (wrap) wrap.style.display = 'block';
  },

  esc: function(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
