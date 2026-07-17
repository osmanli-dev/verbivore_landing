
/* =====================================================
   VERBIVORE — main.js  (navigation-aware, v3)

   Architecture:
   • Event delegation for all accordion/toggle clicks
     → works after Next.js client-side navigation
   • history.pushState / popstate patching
     → detects navigation, re-runs initPage()
   • AbortController per-page
     → cleans up transient listeners (gallery, filters…)
   • Singleton DOM elements (lightbox, map tooltip)
     → created once, reused across navigations
   ===================================================== */

/* ── MOCK DATA ─────────────────────────────────────── */

// Gallery data is injected by the server via <script id="galleryDataScript" type="application/json">
// Falls back to defaults if not present
var galleryData = [
  { image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80', title: 'International student experience', text: 'Colorful moments from classrooms, ceremonies and student activities.', tag: 'Featured Media' },
  { image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80', title: 'Exam day atmosphere', text: 'A modern visual area for photos and video highlights from each edition.', tag: 'Video' },
  { image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', title: 'Awards and recognition', text: 'Medal ceremonies, certificates and student success stories.', tag: 'Photo' },
];

function loadGalleryData() {
  var el = document.getElementById('galleryDataScript');
  if (!el) return;
  try {
    var parsed = JSON.parse(el.textContent || el.innerHTML);
    if (Array.isArray(parsed) && parsed.length > 0) galleryData = parsed;
  } catch(e) {}
}

var MOCK_CERTS = {
  'VERB-2026-AZ-001': { name: 'Ayla Mammadova',     country: '🇦🇿 Azerbaijan',     grade: '7',  date: '15 Aug 2026', score: '94/100', achievement: 'Gold Medal',   type: 'Grand Final' },
  'VERB-2026-AZ-012': { name: 'Kamran Aliyev',       country: '🇦🇿 Azerbaijan',     grade: '8',  date: '15 Aug 2026', score: '87/100', achievement: 'Silver Medal', type: 'Grand Final' },
  'VERB-2026-TR-007': { name: 'Emre Yildirim',       country: '🇹🇷 Türkiye',        grade: '9',  date: '15 Aug 2026', score: '88/100', achievement: 'Silver Medal', type: 'Grand Final' },
  'VERB-2026-UK-003': { name: 'Oliver Smith',        country: '🇬🇧 United Kingdom', grade: '8',  date: '15 Aug 2026', score: '91/100', achievement: 'Gold Medal',   type: 'Grand Final' },
  'VERB-2026-UK-009': { name: 'Sophia Johnson',      country: '🇬🇧 United Kingdom', grade: '7',  date: '15 Aug 2026', score: '85/100', achievement: 'Silver Medal', type: 'Grand Final' },
  'VERB-2026-KZ-004': { name: 'Asel Nurmagambetova', country: '🇰🇿 Kazakhstan',     grade: '10', date: '15 Aug 2026', score: '82/100', achievement: 'Bronze Medal', type: 'Grand Final' },
};

var MOCK_RESULTS = {
  'Azerbaijan':     [ { name: 'Ayla Mammadova', cls: '7B', score: '94', medal: 'Gold' }, { name: 'Kamran Aliyev', cls: '8A', score: '87', medal: 'Silver' }, { name: 'Nigar Hasanova', cls: '6C', score: '82', medal: 'Bronze' }, { name: 'Tural Quliyev', cls: '9A', score: '79', medal: 'Bronze' }, { name: 'Leyla Ahmadova', cls: '7A', score: '75', medal: 'H.M.' } ],
  'Türkiye':        [ { name: 'Emre Yildirim', cls: '9A', score: '88', medal: 'Silver' }, { name: 'Zeynep Kaya', cls: '7B', score: '80', medal: 'Bronze' }, { name: 'Ali Demir', cls: '8C', score: '78', medal: 'Bronze' }, { name: 'Selin Arslan', cls: '6A', score: '73', medal: 'H.M.' } ],
  'United Kingdom': [ { name: 'Oliver Smith', cls: '8A', score: '91', medal: 'Gold' }, { name: 'Sophia Johnson', cls: '7C', score: '85', medal: 'Silver' }, { name: 'Noah Williams', cls: '9B', score: '81', medal: 'Bronze' } ],
};

var EXAM_DETAIL_DATA = {
  'Azerbaijan':     { flag: '🇦🇿', name: 'Azerbaijan',     sub: 'Preliminary Round · 2026', round: 'Preliminary Round', date: '27 September 2026',   venue: 'Baku, Sumgayit, Ganja',             participants: 'To be announced', status: 'upcoming', statusLabel: '📅 Upcoming' },
  'Türkiye':        { flag: '🇹🇷', name: 'Türkiye',        sub: 'Preliminary Round · 2026', round: 'Preliminary Round', date: 'TBA',                  venue: 'Istanbul, Ankara, Izmir',            participants: 'To be announced', status: 'upcoming', statusLabel: '⏳ Draft calendar' },
  'United Kingdom': { flag: '🇬🇧', name: 'United Kingdom', sub: 'Grand Final Host · 2026',  round: 'Grand Final',       date: 'July 14–18, 2026',    venue: 'London, Central Conference Centre', participants: '500+',           status: 'upcoming', statusLabel: '🏆 Grand Final' },
  'Kazakhstan':     { flag: '🇰🇿', name: 'Kazakhstan',     sub: 'Preliminary Round · 2026', round: 'Preliminary Round', date: 'October 2026',          venue: 'Almaty, Astana',                    participants: 'To be announced', status: 'upcoming', statusLabel: '📅 Upcoming' },
  'Italy':          { flag: '🇮🇹', name: 'Italy',          sub: 'Preliminary Round · 2026', round: 'Preliminary Round', date: 'TBA',                  venue: 'Rome, Milan',                       participants: 'To be announced', status: 'upcoming', statusLabel: '⏳ Pending representative' },
};

/* ── GLOBAL STATE ───────────────────────────────────── */
var galleryIndex      = 0;
var autoGalleryTimer  = null;
var pageAbortCtrl     = new AbortController();
var countdownStarted  = false;
var toastTimer        = null;

/* ── SINGLETON DOM ELEMENTS ─────────────────────────── */
var lbEl = null, lbImg = null, lbVideo = null, lbYt = null, lbYtFrame = null, lbCap = null;   // lightbox
var mapTip = null;                              // map tooltip

/* =====================================================
   ONE-TIME GLOBAL SETUP (header, mobile menu, toast)
   ===================================================== */

var _siteHeader   = document.getElementById('siteHeader');
var _mobileToggle = document.getElementById('mobileToggle');
var _mobMenu      = null; /* resolved lazily so HMR doesn't stale the ref */

/* ── Mobile backdrop (created once) ──────────────────────── */
var _mobBackdrop = document.createElement('div');
_mobBackdrop.className = 'mob-backdrop';
document.body.appendChild(_mobBackdrop);

function _getMobMenu()   { return _mobMenu   || (_mobMenu   = document.getElementById('mobMenu'));   }
function _getMobToggle() { return _mobileToggle || (_mobileToggle = document.getElementById('mobileToggle')); }

function openMobileMenu() {
  var mm = _getMobMenu();
  if (!mm) return;
  mm.classList.add('open');
  _mobBackdrop.classList.add('open');
  var mt = _getMobToggle();
  if (mt) mt.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  var mm = _getMobMenu();
  var mt = _getMobToggle();
  if (mm) mm.classList.remove('open');
  _mobBackdrop.classList.remove('open');
  if (mt) mt.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Mobile menu: close interactions via delegation (survives HMR / re-renders) */
/* Note: hamburger OPEN is handled by MobileToggle React client component */
document.addEventListener('click', function(e) {
  /* X close button inside drawer */
  if (e.target.closest('#mobCloseBtn')) {
    closeMobileMenu();
    return;
  }
  /* Close when any nav link / footer CTA / logo inside drawer is tapped */
  if (e.target.closest('.mob-nav-link, .mob-nav-sub, .mob-menu-footer a, .mob-menu-logo')) {
    closeMobileMenu();
    return;
  }
});

/* Close on backdrop click */
_mobBackdrop.addEventListener('click', closeMobileMenu);

/* Close on Escape */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var mm = document.getElementById('mobMenu');
    if (mm && mm.classList.contains('open')) closeMobileMenu();
  }
});

/* Swipe right to close mobile menu */
var _menuSwipeX = 0;
document.addEventListener('touchstart', function(e) {
  _menuSwipeX = e.touches[0].clientX;
}, { passive: true });
document.addEventListener('touchend', function(e) {
  var mm = document.getElementById('mobMenu');
  if (!mm || !mm.classList.contains('open')) return;
  var dx = e.changedTouches[0].clientX - _menuSwipeX;
  if (dx > 60) closeMobileMenu();
}, { passive: true });

/* ── TOAST ─────────────────────────────────────────── */
function showToast(msg, icon) {
  var toast  = document.getElementById('verbToast');
  var msgEl  = document.getElementById('verbToastMsg');
  var iconEl = toast && toast.querySelector('.toast-icon');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  if (iconEl) iconEl.textContent = icon || '✅';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 5000);
}

/* =====================================================
   GALLERY LIGHTBOX — singleton, created once
   ===================================================== */
function ensureLightbox() {
  if (lbEl) return;
  lbEl = document.createElement('div');
  lbEl.id = 'galleryLightbox';
  lbEl.innerHTML =
    '<div class="glb-inner">' +
      '<button class="glb-close" aria-label="Close">✕</button>' +
      '<img class="glb-img" src="" alt="" />' +
      '<video class="glb-video" controls playsinline></video>' +
      '<div class="glb-yt"><iframe class="glb-yt-iframe" src="" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>' +
      '<div class="glb-caption"></div>' +
    '</div>';
  document.body.appendChild(lbEl);
  lbImg     = lbEl.querySelector('.glb-img');
  lbVideo   = lbEl.querySelector('.glb-video');
  lbYt      = lbEl.querySelector('.glb-yt');
  lbYtFrame = lbEl.querySelector('.glb-yt-iframe');
  lbCap     = lbEl.querySelector('.glb-caption');
}

// type: 'photo' | 'video' | 'youtube'
function openLightbox(type, src, caption) {
  ensureLightbox();
  lbImg.style.display   = 'none';
  lbVideo.style.display = 'none';
  lbYt.style.display    = 'none';
  lbVideo.pause();
  lbVideo.removeAttribute('src');
  lbYtFrame.src = '';

  if (type === 'video') {
    lbVideo.src = src || '';
    lbVideo.style.display = 'block';
    lbVideo.play().catch(function() {});
  } else if (type === 'youtube') {
    lbYtFrame.src = 'https://www.youtube.com/embed/' + src + '?autoplay=1&rel=0';
    lbYt.style.display = 'block';
  } else {
    lbImg.src = src || '';
    lbImg.style.display = 'block';
  }

  lbCap.textContent = caption || '';
  lbEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lbEl) return;
  lbEl.classList.remove('open');
  document.body.style.overflow = '';
  lbVideo.pause();
  lbVideo.removeAttribute('src');
  lbYtFrame.src = '';
}

/* =====================================================
   MAP TOOLTIP — singleton
   ===================================================== */
function ensureMapTip() {
  if (mapTip) return mapTip;
  mapTip = document.createElement('div');
  mapTip.id = 'mapTooltip';
  mapTip.style.cssText = 'position:fixed;background:#17205a;color:#fff;padding:8px 13px;border-radius:12px;font-size:12px;font-weight:800;line-height:1.4;box-shadow:0 6px 20px rgba(0,0,0,.3);pointer-events:none;z-index:200;display:none;white-space:nowrap';
  document.body.appendChild(mapTip);
  return mapTip;
}

/* =====================================================
   RESULT MODAL
   ===================================================== */
function medalClass(m) {
  return m === 'Gold' ? 'medal-gold' : m === 'Silver' ? 'medal-silver' : m === 'Bronze' ? 'medal-bronze' : 'medal-hm';
}

function openResultModal(country) {
  var students = MOCK_RESULTS[country] || [];
  var content  = document.getElementById('resultModalContent');
  var modal    = document.getElementById('resultModal');
  if (content) {
    content.innerHTML =
      '<h2>🏅 ' + country + ' — Grand Final Results</h2>' +
      '<table class="student-table">' +
        '<thead><tr><th>#</th><th>Name</th><th>Class</th><th>Score</th><th>Award</th></tr></thead>' +
        '<tbody>' + students.map(function(s, i) {
          return '<tr>' +
            '<td style="color:var(--muted);font-size:13px">' + (i + 1) + '</td>' +
            '<td>' + s.name + '</td><td>' + s.cls + '</td>' +
            '<td><b>' + s.score + '/100</b></td>' +
            '<td class="' + medalClass(s.medal) + '">' + s.medal + '</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table>';
  }
  if (modal) modal.classList.add('open');
}

/* =====================================================
   EXAM DETAIL PANEL
   ===================================================== */
function renderCountryDetail(d) {
  var panel = document.getElementById('countryDetail');
  if (!panel) return;
  var sc = d.statusLabel.indexOf('Grand Final') !== -1 ? 'var(--sky)' : (d.status === 'upcoming' ? 'var(--orange)' : 'var(--green,#16a34a)');
  panel.innerHTML =
    '<h2>Selected country</h2>' +
    '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px">' +
      '<div style="font-size:36px">' + d.flag + '</div>' +
      '<div><div style="font-weight:800;color:var(--navy-2);font-size:18px">' + d.name + '</div>' +
      '<div style="color:var(--muted);font-size:13px">' + d.sub + '</div></div>' +
    '</div>' +
    '<div style="display:grid;gap:10px">' +
      [['Round', d.round], ['Exam Date', d.date], ['Venue', d.venue], ['Participants', d.participants]].map(function(kv) {
        return '<div style="display:flex;justify-content:space-between;padding:11px 14px;background:#f7f8ff;border-radius:14px">' +
          '<span style="color:var(--muted);font-weight:700">' + kv[0] + '</span>' +
          '<span style="color:var(--navy);font-weight:800">' + kv[1] + '</span></div>';
      }).join('') +
      '<div style="display:flex;justify-content:space-between;padding:11px 14px;background:rgba(255,130,26,.10);border-radius:14px">' +
        '<span style="color:var(--muted);font-weight:700">Result status</span>' +
        '<span style="color:' + sc + ';font-weight:800">' + d.statusLabel + '</span></div>' +
    '</div>';
}

function selectCountryDetail(name) {
  var d = EXAM_DETAIL_DATA[name];
  if (!d) return;
  var panel = document.getElementById('countryDetail');
  if (panel) {
    panel.classList.add('updating');
    setTimeout(function() { renderCountryDetail(d); panel.classList.remove('updating'); }, 200);
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  var sel = document.getElementById('countryFilter');
  if (sel) sel.value = name;
}

/* =====================================================
   COUNTER ANIMATION
   ===================================================== */
function animateCounter(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  var raw = el.textContent.trim();
  var num = parseInt(raw.replace(/\D/g, ''), 10);
  var sfx = raw.replace(/\d/g, '');
  if (isNaN(num) || num === 0) return;
  var steps = 60, cur = 0, inc = num / steps;
  var iv = setInterval(function() {
    cur = Math.min(cur + inc, num);
    el.textContent = Math.round(cur) + sfx;
    if (cur >= num) { el.textContent = raw; clearInterval(iv); }
  }, 1600 / steps);
}

/* =====================================================
   GALLERY
   ===================================================== */
function updateGallery(direction) {
  var gf = document.getElementById('galleryFeature');
  if (!gf) return;
  galleryIndex = (galleryIndex + direction + galleryData.length) % galleryData.length;
  var item = galleryData[galleryIndex];
  gf.style.setProperty('--bg', "url('" + item.image + "')");
  var h3 = gf.querySelector('h3'), p = gf.querySelector('p');
  if (h3) h3.textContent = item.title;
  if (p)  p.textContent  = item.text;
}

function getGalleryBg(el) {
  var v = el.style.getPropertyValue('--bg') || '';
  var m = v.match(/url\(['"]?([^'"]+)['"]?\)/);
  return m ? m[1] : null;
}

/* =====================================================
   COUNTDOWN — re-queries elements each tick so it works
   even after navigation replaces the DOM
   ===================================================== */
function tryStartCountdown() {
  if (countdownStarted) return;
  if (!document.getElementById('cdDays')) return;
  countdownStarted = true;
  // Date is set from admin via data-countdown-target on #countdownStrip
  var strip = document.getElementById('countdownStrip');
  var isoDate = strip && strip.dataset && strip.dataset.countdownTarget;
  var target = isoDate ? new Date(isoDate) : new Date('2026-07-14T09:00:00');
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var d = document.getElementById('cdDays'),
        h = document.getElementById('cdHours'),
        m = document.getElementById('cdMins'),
        s = document.getElementById('cdSecs'),
        strip = document.getElementById('countdownStrip');
    if (!d) return;
    var diff = target - Date.now();
    if (diff <= 0) {
      if (strip) strip.classList.add('countdown-finished');
      d.textContent = h.textContent = m.textContent = s.textContent = '00';
      return;
    }
    d.textContent = pad(Math.floor(diff / 86400000));
    h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    m.textContent = pad(Math.floor((diff % 3600000) / 60000));
    s.textContent = pad(Math.floor((diff % 60000)  / 1000));
  }
  tick();
  setInterval(tick, 1000);
}

/* =====================================================
   EVENT DELEGATION
   All accordion / toggle / modal interactions use
   document-level delegation so they work across
   client-side navigation without re-attaching listeners.
   ===================================================== */
document.addEventListener('click', function(e) {

  /* FAQ toggle */
  var faqBtn = e.target.closest('.faq-q');
  if (faqBtn) {
    faqBtn.closest('.faq-item').classList.toggle('active');
    return;
  }

  /* Exam section country items (homepage) */
  var cItem = e.target.closest('.country-item');
  if (cItem) {
    var tgt = document.getElementById(cItem.dataset.target);
    document.querySelectorAll('.country-panel').forEach(function(p) {
      if (p !== tgt) p.classList.remove('active');
    });
    if (tgt) tgt.classList.toggle('active');
    return;
  }

  /* Regulations accordion */
  var regBtn = e.target.closest('.reg-header');
  if (regBtn) {
    var sec = regBtn.closest('.reg-section');
    document.querySelectorAll('.reg-section.open').forEach(function(s) {
      if (s !== sec) s.classList.remove('open');
    });
    sec.classList.toggle('open');
    return;
  }

  /* Participant group toggle */
  var partBtn = e.target.closest('.participant-header');
  if (partBtn) {
    partBtn.closest('.participant-group').classList.toggle('open');
    return;
  }

  /* Result modal — open */
  var resBtn = e.target.closest('[data-result-country]');
  if (resBtn) {
    openResultModal(resBtn.dataset.resultCountry);
    return;
  }

  /* Result modal — close (button or backdrop) */
  if (e.target.closest('#resultModalClose') || e.target.id === 'resultModal') {
    var rModal = document.getElementById('resultModal');
    if (rModal) rModal.classList.remove('open');
    return;
  }

  /* Gallery card — open lightbox (photo / uploaded video / YouTube) */
  var galCard = e.target.closest('[data-gallery]');
  if (galCard) {
    var galType = galCard.getAttribute('data-media-type') || 'photo';
    var galCaption = galCard.getAttribute('data-title') || '';
    if (galType === 'video-file') {
      openLightbox('video', galCard.getAttribute('data-video-src'), galCaption);
    } else if (galType === 'youtube') {
      openLightbox('youtube', galCard.getAttribute('data-youtube-id'), galCaption);
    } else {
      openLightbox('photo', getGalleryBg(galCard), galCaption);
    }
    return;
  }

  /* Gallery lightbox — close */
  if (e.target.closest('.glb-close') || e.target.id === 'galleryLightbox') {
    closeLightbox();
    return;
  }

  /* Toast — close */
  if (e.target.closest('.toast-close')) {
    var toast = document.getElementById('verbToast');
    if (toast) toast.classList.remove('show');
    return;
  }
});

/* Escape key closes open modal / lightbox */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Escape') return;
  var rModal = document.getElementById('resultModal');
  if (rModal && rModal.classList.contains('open')) { rModal.classList.remove('open'); return; }
  closeLightbox();
});

/* =====================================================
   PAGE INIT — runs on initial load and after navigation
   ===================================================== */
function initPage() {
  /* Cancel listeners from the previous page */
  pageAbortCtrl.abort();
  pageAbortCtrl = new AbortController();
  var sig = pageAbortCtrl.signal;

  clearInterval(autoGalleryTimer);
  autoGalleryTimer = null;
  galleryIndex = 0;

  /* ── Load gallery data from server-injected JSON ── */
  loadGalleryData();

  /* ── Countdown ── */
  countdownStarted = false;
  tryStartCountdown();

  /* ── Gallery ── */
  var gf = document.getElementById('galleryFeature');
  if (gf) {
    autoGalleryTimer = setInterval(function() { updateGallery(1); }, 4200);
    gf.style.cursor = 'pointer';

    gf.addEventListener('click', function() {
      var img = getGalleryBg(gf) || (galleryData[galleryIndex] && galleryData[galleryIndex].image);
      var h3  = gf.querySelector('h3');
      openLightbox(img, h3 ? h3.textContent : '');
    }, { signal: sig });

    var touchX = 0;
    gf.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; }, { passive: true, signal: sig });
    gf.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) < 40) return;
      clearInterval(autoGalleryTimer);
      updateGallery(dx < 0 ? 1 : -1);
      autoGalleryTimer = setInterval(function() { updateGallery(1); }, 4200);
    }, { signal: sig });
  }

  var prevBtn = document.getElementById('prevGallery');
  var nextBtn = document.getElementById('nextGallery');
  if (prevBtn) prevBtn.addEventListener('click', function() {
    clearInterval(autoGalleryTimer); updateGallery(-1);
    autoGalleryTimer = setInterval(function() { updateGallery(1); }, 4200);
  }, { signal: sig });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    clearInterval(autoGalleryTimer); updateGallery(1);
    autoGalleryTimer = setInterval(function() { updateGallery(1); }, 4200);
  }, { signal: sig });

  /* ── Gallery: hover-to-preview uploaded video backgrounds ── */
  document.querySelectorAll('.gallery-bg-video').forEach(function(vid) {
    var card = vid.closest('.gallery-feature, .gallery-item');
    if (!card) return;
    card.addEventListener('mouseenter', function() {
      vid.play().catch(function() {});
    }, { signal: sig });
    card.addEventListener('mouseleave', function() {
      vid.pause();
      vid.currentTime = 0;
    }, { signal: sig });
  });

  /* ── Animated counters ── */
  var cObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { animateCounter(entry.target); cObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-card b, .mini-card b').forEach(function(el) {
    el.removeAttribute('data-counted');
    cObserver.observe(el);
  });

  /* ── World map pin tooltips ── */
  var pins = document.querySelectorAll('.map-pin-group');
  if (pins.length) {
    var tip = ensureMapTip();
    tip.style.display = 'none';
    pins.forEach(function(pin) {
      pin.addEventListener('mouseenter', function() {
        tip.innerHTML =
          '<div>' + (pin.dataset.country || '') + '</div>' +
          '<div style="color:rgba(255,255,255,.65);font-weight:600;font-size:11px">' + (pin.dataset.status || '') + '</div>';
        tip.style.display = 'block';
      }, { signal: sig });
      pin.addEventListener('mousemove', function(e) {
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY - 10) + 'px';
      }, { signal: sig });
      pin.addEventListener('mouseleave', function() {
        tip.style.display = 'none';
      }, { signal: sig });
    });
  }

  /* ── Exam time filters ── */
  var examTbody = document.getElementById('examTbody');
  if (examTbody) {
    var cFilter = document.getElementById('countryFilter');
    var rFilter = document.getElementById('roundFilter');
    var sFilter = document.getElementById('statusFilter');
    var yFilter = document.getElementById('yearFilter');

    function applyExamFilters() {
      var cVal = cFilter ? cFilter.value : 'all';
      var rVal = rFilter ? rFilter.value : 'all';
      var sVal = sFilter ? sFilter.value : 'all';
      var yVal = yFilter ? yFilter.value : 'all';
      examTbody.querySelectorAll('tr').forEach(function(row) {
        var ok =
          (cVal === 'all' || row.dataset.country === cVal) &&
          (rVal === 'all' || (row.dataset.round || '').indexOf(rVal) !== -1) &&
          (sVal === 'all' || row.dataset.status  === sVal) &&
          (yVal === 'all' || row.dataset.year    === yVal);
        row.classList.toggle('exam-row-hidden', !ok);
      });
      if (cVal !== 'all' && EXAM_DETAIL_DATA[cVal]) selectCountryDetail(cVal);
    }

    if (cFilter) cFilter.addEventListener('change', applyExamFilters, { signal: sig });
    if (rFilter) rFilter.addEventListener('change', applyExamFilters, { signal: sig });
    if (sFilter) sFilter.addEventListener('change', applyExamFilters, { signal: sig });
    if (yFilter) yFilter.addEventListener('change', applyExamFilters, { signal: sig });
    applyExamFilters();

    examTbody.addEventListener('click', function(e) {
      var row = e.target.closest('tr');
      if (!row || !row.dataset.country) return;
      var country = row.dataset.country;
      if (EXAM_DETAIL_DATA[country]) {
        selectCountryDetail(country);
        if (cFilter) cFilter.value = country;
      }
    }, { signal: sig });
  }

  /* ── Results page filter ── */
  var resultsTbody = document.getElementById('resultsTbody');
  if (resultsTbody) {
    var rCountrySel = document.querySelector('[data-results-filter] select, .results-filter select');
    if (!rCountrySel) {
      // Fallback: find a select within the filter panel that doesn't have exam-time IDs
      var panels = document.querySelectorAll('.panel .form-grid select');
      panels.forEach(function(sel) {
        if (!sel.id || (sel.id !== 'countryFilter' && sel.id !== 'roundFilter' && sel.id !== 'statusFilter')) {
          rCountrySel = rCountrySel || sel;
        }
      });
    }
    if (rCountrySel) {
      rCountrySel.addEventListener('change', function() {
        var val = rCountrySel.value;
        resultsTbody.querySelectorAll('tr').forEach(function(row) {
          row.toggleAttribute('data-filter-hidden', val !== 'All countries' && row.dataset.country !== val);
        });
      }, { signal: sig });
    }
  }

  /* ── Participant search ── */
  var pSearch = document.getElementById('participantSearch');
  if (pSearch) {
    var noRes = document.getElementById('participantNoResults');
    pSearch.addEventListener('input', function() {
      var q = pSearch.value.trim().toLowerCase();
      var groups = document.querySelectorAll('.participant-group');
      var anyVis = false;
      groups.forEach(function(g) {
        if (!q) { g.style.display = ''; anyVis = true; return; }
        var cName = (g.querySelector('.participant-info h4') || {}).textContent || '';
        var sNames = Array.from(g.querySelectorAll('.student-table td:nth-child(2), .mob-student-name')).map(function(el) { return el.textContent; });
        var cMatch = cName.toLowerCase().indexOf(q) !== -1;
        var sMatch = sNames.some(function(n) { return n.toLowerCase().indexOf(q) !== -1; });
        if (cMatch || sMatch) {
          g.style.display = ''; anyVis = true;
          if (sMatch && !cMatch) g.classList.add('open');
        } else {
          g.style.display = 'none';
        }
      });
      if (noRes) noRes.style.display = (anyVis || !q) ? 'none' : 'block';
    }, { signal: sig });
  }

  /* ── Countries & Territories: search + mobile status filter ── */
  var countrySearch = document.getElementById('countrySearch');
  if (countrySearch || document.querySelector('.mob-filter-pill')) {
    var applyCountryRowFilter = function() {
      var q = countrySearch ? countrySearch.value.trim().toLowerCase() : '';
      var activePill = document.querySelector('.mob-filter-pill.active');
      var status = activePill ? (activePill.getAttribute('data-country-filter') || 'All') : 'All';
      document.querySelectorAll('.mob-country-row[data-country-name]').forEach(function(row) {
        var statusMatch = status === 'All' || row.getAttribute('data-status') === status;
        var searchMatch = !q || row.getAttribute('data-country-name').indexOf(q) !== -1;
        row.classList.toggle('hidden', !(statusMatch && searchMatch));
      });
    };
    var applyCountryCardFilter = function() {
      var q = countrySearch ? countrySearch.value.trim().toLowerCase() : '';
      document.querySelectorAll('.country-card[data-country-name]').forEach(function(card) {
        card.style.display = (!q || card.getAttribute('data-country-name').indexOf(q) !== -1) ? '' : 'none';
      });
    };

    if (countrySearch) {
      countrySearch.addEventListener('input', function() {
        applyCountryCardFilter();
        applyCountryRowFilter();
      }, { signal: sig });
    }

    document.querySelectorAll('.mob-filter-pill').forEach(function(pill) {
      pill.addEventListener('click', function() {
        document.querySelectorAll('.mob-filter-pill').forEach(function(p) { p.classList.remove('active'); });
        pill.classList.add('active');
        applyCountryRowFilter();
      }, { signal: sig });
    });
  }

  /* ── Mobile: Exam time card filters ── */
  var mobRoundFilter  = document.getElementById('mobRoundFilter');
  var mobStatusFilter = document.getElementById('mobStatusFilter');
  var mobYearFilter   = document.getElementById('mobYearFilter');
  function applyMobExamFilter() {
    var round  = mobRoundFilter  ? mobRoundFilter.value  : 'all';
    var status = mobStatusFilter ? mobStatusFilter.value : 'all';
    var year   = mobYearFilter   ? mobYearFilter.value   : 'all';
    document.querySelectorAll('.mob-exam-card').forEach(function(card) {
      var matchRound  = round  === 'all' || (card.getAttribute('data-round')  || '').indexOf(round)  !== -1;
      var matchStatus = status === 'all' || (card.getAttribute('data-status') || '') === status;
      var matchYear   = year   === 'all' || (card.getAttribute('data-year')   || '') === year;
      card.classList.toggle('hidden', !(matchRound && matchStatus && matchYear));
    });
  }
  if (mobRoundFilter)  mobRoundFilter.addEventListener('change', applyMobExamFilter, { signal: sig });
  if (mobStatusFilter) mobStatusFilter.addEventListener('change', applyMobExamFilter, { signal: sig });
  if (mobYearFilter)   mobYearFilter.addEventListener('change', applyMobExamFilter, { signal: sig });
  applyMobExamFilter();

  /* ── Mobile: Category tabs ── */
  document.querySelectorAll('.mob-cat-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var idx = tab.getAttribute('data-cat');
      document.querySelectorAll('.mob-cat-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.mob-cat-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.mob-cat-panel[data-panel="' + idx + '"]');
      if (panel) panel.classList.add('active');
    }, { signal: sig });
  });

  /* ── Mobile: pill tab switcher (e.g. schedule day-switcher) ── */
  document.querySelectorAll('.mob-pill-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var idx = tab.getAttribute('data-cat');
      document.querySelectorAll('.mob-pill-tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.mob-pill-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.mob-pill-panel[data-panel="' + idx + '"]');
      if (panel) panel.classList.add('active');
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, { signal: sig });
  });

  /* ── Mobile: Regulations / Category quick-jump, FAQ tabs ── */
  document.querySelectorAll('.mob-reg-jump').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.getAttribute('data-reg-id');
      var section = document.getElementById('reg-' + id);
      if (!section) return;

      var strip = btn.closest('.mob-faq-jumps');
      if (strip) {
        /* FAQ: swap the visible category panel in place — the initial
           active pill/panel is already server-rendered, this just
           keeps them in sync on subsequent taps. No page scroll. */
        strip.querySelectorAll('.mob-reg-jump').forEach(function(b) {
          b.classList.remove('active');
          b.removeAttribute('aria-current');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'true');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        var group = section.parentElement;
        if (group) {
          group.querySelectorAll('.faq-group').forEach(function(g) { g.classList.remove('mob-faq-active'); });
        }
        section.classList.add('mob-faq-active');
        /* Bring the newly active panel's top into view — accounts for
           the sticky navbar + tab bar via scroll-margin-top so shorter
           categories never leave the user scrolled past their content. */
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      /* Regulations / category detail: anchor quick-jump (unchanged) */
      section.classList.add('open');
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, { signal: sig });
  });

  /* ── Certificate verify (plain-JS fallback for any page that
     might embed the verify widget outside of the React component) ── */
  var vBtn   = document.getElementById('verifyBtn');
  var vInput = document.getElementById('verifyCode');
  var vRes   = document.getElementById('verifyResult');
  if (vBtn && vInput && vRes) {
    function runVerify() {
      var code = vInput.value.trim().toUpperCase();
      if (!code) { vInput.focus(); return; }
      vRes.style.display = 'block';
      var cert = MOCK_CERTS[code];
      if (cert) {
        vRes.className = 'verify-result valid';
        vRes.innerHTML =
          '<div class="verify-badge ok">✓ &nbsp;Verified Certificate</div>' +
          '<div class="verify-grid">' +
            [['Certificate Code', code], ['Full Name', cert.name], ['Country', cert.country],
             ['Grade', 'Grade ' + cert.grade], ['Exam Date', cert.date], ['Score', cert.score],
             ['Achievement', cert.achievement], ['Exam Type', cert.type]].map(function(kv) {
              return '<div class="verify-field"><label>' + kv[0] + '</label><span>' + kv[1] + '</span></div>';
            }).join('') +
          '</div>';
      } else {
        vRes.className = 'verify-result invalid';
        vRes.innerHTML =
          '<div class="verify-badge fail">✗ &nbsp;Certificate Not Found</div>' +
          '<p class="verify-invalid-msg">The code <b>' + code + '</b> could not be found.<br>Please check the code and try again.</p>' +
          '<p style="color:var(--muted);font-size:13px;margin-top:10px">Demo codes: VERB-2026-AZ-001 · VERB-2026-UK-003 · VERB-2026-TR-007</p>';
      }
      vRes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    vBtn.addEventListener('click', runVerify, { signal: sig });
    vInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') runVerify(); }, { signal: sig });
  }
}

/* =====================================================
   NAVIGATION DETECTION
   Next.js App Router uses history.pushState for client-
   side navigation. Patch it (and replaceState / popstate)
   to re-run initPage after the DOM has been committed.
   ===================================================== */
var _origPush    = history.pushState.bind(history);
var _origReplace = history.replaceState.bind(history);
var _navTimer    = null;

function schedulePageInit() {
  clearTimeout(_navTimer);
  _navTimer = setTimeout(initPage, 80); // 80 ms — enough for React to commit
}

history.pushState = function() {
  _origPush.apply(this, arguments);
  schedulePageInit();
};
history.replaceState = function() {
  _origReplace.apply(this, arguments);
  schedulePageInit();
};
window.addEventListener('popstate', schedulePageInit);

/* ── Initial load ── */
initPage();

/* ════════════════════════════════════════════════════════
   PRELIMINARY ROUND + RESOURCES PAGE — accordions & tabs
   ════════════════════════════════════════════════════════ */
document.addEventListener('click', function(e) {
  // Resource page tabs
  var resTab = e.target.closest('.res-tab');
  if (resTab && resTab.dataset.resTab) {
    document.querySelectorAll('.res-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.res-panel').forEach(function(p) { p.classList.remove('active'); });
    resTab.classList.add('active');
    var panel = document.getElementById(resTab.dataset.resTab);
    if (panel) panel.classList.add('active');
    return;
  }
  // Mobile round switcher (scoped to nearest [data-round-switch])
  var roundTab = e.target.closest('.mob-round-tab[data-round-tab]');
  if (roundTab) {
    var rGroup = roundTab.closest('[data-round-switch]');
    if (rGroup) {
      var ridx = roundTab.getAttribute('data-round-tab');
      rGroup.querySelectorAll('.mob-round-tab').forEach(function(t) { t.classList.remove('active'); });
      rGroup.querySelectorAll('.mob-round-panel').forEach(function(p) { p.classList.remove('active'); });
      roundTab.classList.add('active');
      var rPanel = rGroup.querySelector('.mob-round-panel[data-round-panel="' + ridx + '"]');
      if (rPanel) rPanel.classList.add('active');
      roundTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    return;
  }
  // Prelim accordion
  var roundBtn = e.target.closest('.prelim-round-btn');
  if (roundBtn) { roundBtn.closest('.prelim-round').classList.toggle('open'); return; }
  var catBtn = e.target.closest('.prelim-cat-btn');
  if (catBtn) { catBtn.closest('.prelim-category').classList.toggle('open'); }
});
