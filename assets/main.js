// 月见 v2 · 交互（无依赖）
const isMobile = () => matchMedia('(max-width: 760px), (hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (location.search.includes('flat')) document.documentElement.classList.add('flat');

/* ---------- 年份 / 时钟 ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
// 截图辅助：#y=1234 直接滚到该位置（不影响正常访问）
if (/^#y=\d+$/.test(location.hash)) {
  const y = parseInt(location.hash.slice(3), 10);
  document.documentElement.style.scrollBehavior = 'auto';
  setTimeout(() => { scrollTo(0, y); }, 50);
}
if (location.hash === '#offsets') {
  setTimeout(() => {
    const o = (sel) => sel ? Math.round(document.querySelector(sel).offsetTop) : -1;
    document.title = 'about=' + o('#about') + '|works=' + o('#works') + '|contact=' + o('#contact') + '|sh=' + document.documentElement.scrollHeight;
  }, 1200);
}

if (location.hash.startsWith('#diag')) {
  setTimeout(() => {
    const el = document.querySelector('#about .cell');
    const r = el ? el.getBoundingClientRect() : null;
    document.title = 'sy=' + Math.round(scrollY) + '|sh=' + document.documentElement.scrollHeight
      + '|ih=' + innerHeight + '|cellTop=' + (r ? Math.round(r.top) : 'na')
      + '|cellOp=' + (el ? getComputedStyle(el).opacity : 'na');
  }, 1500);
}

(function clock(){
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  };
  tick(); setInterval(tick, 30000);
})();

/* ---------- 滚动进度 / 导航状态 / 当前节 ---------- */
(function scrollUI(){
  const bar = document.getElementById('bar');
  const nav = document.getElementById('nav');
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll(){
    const el = document.documentElement;
    const p = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
    nav.classList.toggle('solid', el.scrollTop > 40);

    const mid = scrollY + innerHeight * 0.35;
    let idx = -1;
    sections.forEach((s, i) => { if (s.offsetTop <= mid) idx = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === idx));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- 入场渐显 ---------- */
(function reveal(){
  const els = [...document.querySelectorAll('.reveal')];
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => { el.style.transitionDelay = (i % 5) * 60 + 'ms'; io.observe(el); });
})();

/* ---------- 鼠标柔光 ---------- */
(function glow(){
  const el = document.getElementById('cursor');
  if (!el || isMobile() || reduce) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; el.style.opacity = '1'; }, { passive: true });
  (function tick(){
    cx += (tx - cx) * 0.10; cy += (ty - cy) * 0.10;
    el.style.left = cx + 'px'; el.style.top = cy + 'px';
    requestAnimationFrame(tick);
  })();
})();

/* ---------- 磁吸按钮 + 光斑跟随 ---------- */
(function magnetic(){
  if (isMobile() || reduce) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width;
      const my = (e.clientY - r.top) / r.height;
      btn.style.setProperty('--mx', mx * 100 + '%');
      btn.style.setProperty('--my', my * 100 + '%');
      btn.style.transform = `translate(${(mx - .5) * 10}px, ${(my - .5) * 8}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
})();

/* ---------- 卡片光斑（Bento） ---------- */
(function cells(){
  if (isMobile() || reduce) return;
  document.querySelectorAll('.cell').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
})();

/* ---------- 标题字：视差 + 悬停浮起 ---------- */
(function heroParallax(){
  const chs = [...document.querySelectorAll('.ch')];
  if (!chs.length || reduce) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, sx = 0;
  if (!isMobile()) {
    addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5) * 18;
      ty = (e.clientY / innerHeight - .5) * 14;
    }, { passive: true });
  }
  (function tick(){
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    chs.forEach((c, i) => {
      const d = i === 0 ? 1 : 1.35;
      c.style.transform = `translate3d(${cx * d}px, ${cy * d + sx}px, 0)`;
    });
    requestAnimationFrame(tick);
  })();
  addEventListener('scroll', () => { sx = Math.min(scrollY * 0.08, 60); }, { passive: true });
})();

/* ---------- 桔梗花瓣（canvas） ---------- */
(function petals(){
  const cvs = document.getElementById('petals');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
  const COLORS = ['#d9cdf7','#b9a3e3','#9b86d8','#efe7ff','#f0b7c8'];

  function resize(){
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = W * DPR; cvs.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize(); addEventListener('resize', resize);

  const N = isMobile() ? 22 : 40;
  const items = Array.from({length: N}, () => spawn(true));

  function spawn(init){
    return {
      x: Math.random()*W, y: init ? Math.random()*H : -24,
      s: 3.5 + Math.random()*6,
      vy: .3 + Math.random()*.7,
      vx: (Math.random()-.5)*.4,
      rot: Math.random()*6.28, vr: (Math.random()-.5)*.02,
      sw: Math.random()*6.28, sws: .005 + Math.random()*.01,
      a: .22 + Math.random()*.4,
      c: COLORS[(Math.random()*COLORS.length)|0]
    };
  }

  function petal(p){
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.globalAlpha = p.a; ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s*.95, -p.s*.7, p.s*.85, p.s*.55, 0, p.s);
    ctx.bezierCurveTo(-p.s*.85, p.s*.55, -p.s*.95, -p.s*.7, 0, -p.s);
    ctx.fill();
    ctx.restore();
  }

  let mx = -999, my = -999;
  if (!isMobile()) addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  let raf = null;
  function loop(){
    ctx.clearRect(0,0,W,H);
    for (const p of items){
      p.sw += p.sws;
      p.x += p.vx + Math.sin(p.sw)*.6;
      p.y += p.vy;
      p.rot += p.vr;
      const dx = p.x - mx, dy = p.y - my, d2 = dx*dx + dy*dy;
      if (d2 < 20000){
        const f = (1 - d2/20000) * 1.4, d = Math.sqrt(d2)+1;
        p.x += dx/d*f; p.y += dy/d*f;
      }
      if (p.y > H+30 || p.x < -40 || p.x > W+40) Object.assign(p, spawn(false));
      petal(p);
    }
    raf = requestAnimationFrame(loop);
  }

  // 只在可见时跑，省电
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting && !raf) loop();
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }, { threshold: 0 });
  io.observe(cvs);
})();

/* ---------- 平滑锚点（移动端更顺） ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
});

/* ============================================================
   日夜主题
   ============================================================ */
(function theme(){
  const KEY = 'yy_theme';
  const btn = document.getElementById('themeBtn');
  const saved = localStorage.getItem(KEY);
  if (saved === 'light') document.documentElement.dataset.theme = 'light';

  function toggle(){
    const light = document.documentElement.dataset.theme === 'light';
    if (light) { delete document.documentElement.dataset.theme; localStorage.setItem(KEY, 'dark'); }
    else { document.documentElement.dataset.theme = 'light'; localStorage.setItem(KEY, 'light'); }
    playChime(light ? 'sun' : 'moon');
  }
  btn && btn.addEventListener('click', toggle);
})();

/* ============================================================
   音效（WebAudio，无音频文件）
   ============================================================ */
let audioCtx = null;
let soundOn = localStorage.getItem('yy_sound') === '1';

function ensureAudio(){
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playChime(kind){
  if (!soundOn) return;
  const ctx = ensureAudio(); if (!ctx) return;
  const now = ctx.currentTime;
  const chords = {
    tick:  [880, 1320],
    sun:   [523.25, 659.25, 783.99],
    moon:  [392, 523.25, 659.25],
    open:  [659.25, 987.77],
    save:  [783.99, 1046.5]
  };
  const notes = chords[kind] || chords.tick;
  notes.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, now + i * 0.055);
    g.gain.linearRampToValueAtTime(0.055, now + i * 0.055 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.055 + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start(now + i * 0.055); o.stop(now + i * 0.055 + 0.55);
  });
}

(function soundToggle(){
  const btn = document.getElementById('soundBtn');
  if (!btn) return;
  btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
  btn.addEventListener('click', () => {
    soundOn = !soundOn;
    localStorage.setItem('yy_sound', soundOn ? '1' : '0');
    btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    if (soundOn) playChime('open');
  });

  // 点到这些元素时轻响一下
  document.addEventListener('click', e => {
    if (!soundOn) return;
    if (e.target.closest('.btn, .work a, .contact-links a, .icon-btn, .nav-links a')) playChime('tick');
  }, { passive: true });
})();

/* ============================================================
   隐藏入口 → 登录 → 工作台
   ============================================================ */
(function workbench(){
  const LOGIN = document.getElementById('loginModal');
  const DRAWER = document.getElementById('drawer');
  if (!LOGIN || !DRAWER) return;

  const USER_HASH = '26f371716b253c6550df72535d28388433938c2ac25b3677064ff64c7e815d7a';
  const PASS_HASH = '627827e0eddd7a8ee690e14ac5dd683c95fb4c34820028155ffa275c07794f1a';
  const DRAFT_KEY = 'yy_draft_v1';
  const SESSION_KEY = 'yy_admin';

  const $ = s => document.querySelector(s);

  /* ---- 极简 SHA-256（无 subtle 时兜底） ---- */
  async function hash(str){
    if (crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // 兜底：FNV-1a（仅演示，安全性弱）
    let h = 0x811c9dc5;
    for (const ch of str) { h ^= ch.codePointAt(0); h = (h * 0x01000193) >>> 0; }
    return 'fnv_' + h.toString(16);
  }

  /* ---- 打开/关闭 ---- */
  function openLogin(){
    LOGIN.classList.add('open'); LOGIN.setAttribute('aria-hidden','false');
    setTimeout(() => $('#loginUser').focus(), 120);
    playChime('open');
  }
  function closeLogin(){
    LOGIN.classList.remove('open'); LOGIN.setAttribute('aria-hidden','true');
    $('#loginErr').classList.remove('show');
  }
  function openDrawer(){
    buildFields();
    DRAWER.classList.add('open'); DRAWER.setAttribute('aria-hidden','false');
  }
  function closeDrawer(){
    DRAWER.classList.remove('open'); DRAWER.setAttribute('aria-hidden','true');
  }

  /* ---- 登录 ---- */
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const u = $('#loginUser').value.trim();
    const p = $('#loginPass').value;
    const [uh, ph] = await Promise.all([hash(u), hash(p)]);
    if (uh === USER_HASH && ph === PASS_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1');
      closeLogin();
      $('#loginPass').value = '';
      openDrawer();
    } else {
      const err = $('#loginErr');
      err.classList.remove('show'); void err.offsetWidth; err.classList.add('show');
      playChime('tick');
    }
  });

  $('#loginClose').addEventListener('click', closeLogin);
  LOGIN.addEventListener('click', e => { if (e.target === LOGIN) closeLogin(); });
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#btnLogout').addEventListener('click', () => { sessionStorage.removeItem(SESSION_KEY); closeDrawer(); });

  /* ---- 隐藏触发 1：地址栏 #admin ---- */
  function checkHash(){
    if (location.hash.toLowerCase() === '#admin') {
      if (sessionStorage.getItem(SESSION_KEY) === '1') openDrawer(); else openLogin();
    }
  }
  addEventListener('hashchange', checkHash);

  /* ---- 隐藏触发 2：连点 logo 三下 ---- */
  let clicks = 0, timer = null;
  const brand = document.querySelector('.brand');
  if (brand) {
    brand.addEventListener('click', e => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 900);
      if (clicks >= 3) {
        e.preventDefault(); clicks = 0;
        if (sessionStorage.getItem(SESSION_KEY) === '1') openDrawer(); else openLogin();
      }
    });
  }

  /* ---- 隐藏触发 3：Ctrl/Cmd + Shift + E ---- */
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      if (sessionStorage.getItem(SESSION_KEY) === '1') openDrawer(); else openLogin();
    }
  });

  /* ---- 字段 ---- */
  const GROUPS = [
    ['首屏', ['heroLede']],
    ['关于', ['aboutBig','doingTitle','doingDesc','learnTitle','learnDesc','playTitle','playDesc']],
    ['作品', ['work1Title','work1Desc','work1Meta','work2Title','work2Desc','work2Meta','work3Title','work3Desc','work3Meta']],
    ['联系', ['contactLine']]
  ];
  const LABELS = {
    heroLede:'首屏副标题', aboutBig:'关于 · 大段文字',
    doingTitle:'在做 · 标题', doingDesc:'在做 · 说明',
    learnTitle:'在学 · 标题', learnDesc:'在学 · 说明',
    playTitle:'在玩 · 标题', playDesc:'在玩 · 说明',
    work1Title:'作品 1 · 标题', work1Desc:'作品 1 · 描述', work1Meta:'作品 1 · 状态',
    work2Title:'作品 2 · 标题', work2Desc:'作品 2 · 描述', work2Meta:'作品 2 · 状态',
    work3Title:'作品 3 · 标题', work3Desc:'作品 3 · 描述', work3Meta:'作品 3 · 状态',
    contactLine:'联系 · 那句话'
  };

  function currentDraft(){
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'); } catch { return {}; }
  }

  function buildFields(){
    const box = $('#fields');
    if (box.dataset.built === '1') return;
    const draft = currentDraft();
    const html = GROUPS.map(([title, keys]) => {
      const rows = keys.map(k => {
        const el = document.querySelector(`[data-edit="${k}"]`);
        const val = draft[k] != null ? draft[k] : (el ? el.textContent.trim() : '');
        const long = val.length > 28 || ['aboutBig','heroLede','contactLine'].includes(k) || k.endsWith('Desc');
        const field = long
          ? `<textarea data-k="${k}">${escapeHtml(val)}</textarea>`
          : `<input data-k="${k}" value="${escapeHtml(val)}">`;
        return `<label class="edit-row"><span>${LABELS[k] || k}</span>${field}</label>`;
      }).join('');
      return `<div class="edit-group"><p>${title}</p>${rows}</div>`;
    }).join('');
    box.innerHTML = html;
    box.dataset.built = '1';

    // 输入即时预览
    box.querySelectorAll('[data-k]').forEach(inp => {
      inp.addEventListener('input', () => applyOne(inp.dataset.k, inp.value));
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function applyOne(k, v){
    const el = document.querySelector(`[data-edit="${k}"]`);
    if (el) el.textContent = v;
  }

  function applyAll(draft){
    Object.entries(draft).forEach(([k, v]) => applyOne(k, v));
  }

  $('#btnSave').addEventListener('click', () => {
    const draft = {};
    $('#fields').querySelectorAll('[data-k]').forEach(inp => { draft[inp.dataset.k] = inp.value; });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    applyAll(draft);
    playChime('save');
    const tip = $('#drawerTip');
    tip.textContent = '已保存到这台电脑的浏览器 ✓';
    setTimeout(() => { tip.textContent = '改动只存在这台电脑的浏览器里，不写服务器。'; }, 2600);
  });

  $('#btnExport').addEventListener('click', async () => {
    const draft = {};
    $('#fields').querySelectorAll('[data-k]').forEach(inp => { draft[inp.dataset.k] = inp.value; });
    const text = JSON.stringify(draft, null, 2);
    try { await navigator.clipboard.writeText(text); $('#drawerTip').textContent = 'JSON 已复制到剪贴板 ✓'; }
    catch { window.prompt('复制这段 JSON：', text); }
    playChime('save');
    setTimeout(() => { $('#drawerTip').textContent = '改动只存在这台电脑的浏览器里，不写服务器。'; }, 2600);
  });

  $('#btnReset').addEventListener('click', () => {
    localStorage.removeItem(DRAFT_KEY);
    location.reload();
  });

  /* ---- 载入草稿 ---- */
  const draft = currentDraft();
  if (Object.keys(draft).length) applyAll(draft);

  /* ---- 首次进入检查 hash ---- */
  setTimeout(checkHash, 300);
})();

/* ---------- 调试开关（仅用于自查） ---------- */
if (location.hash === '#light') document.documentElement.dataset.theme = 'light';
