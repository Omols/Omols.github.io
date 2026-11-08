// 月见个人主页 v2 · 交互脚本（无依赖）

/* ---------------- 桔梗花瓣画布 ---------------- */
(function petals(){
  const cvs = document.getElementById('petals');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  const PETAL_COLORS = ['#d9cdf7', '#b9a3e3', '#9b86d8', '#efe7ff'];

  function resize(){
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = W * DPR; cvs.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // 一朵桔梗花瓣：五点钟形，用贝塞尔画
  function drawPetal(x, y, s, rot, alpha, color){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.7, s * 0.85, s * 0.55, 0, s);
    ctx.bezierCurveTo(-s * 0.85, s * 0.55, -s * 0.95, -s * 0.7, 0, -s);
    ctx.fill();
    // 花瓣尖端的浅色高光
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.45, s * 0.28, s * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const COUNT = window.innerWidth < 760 ? 26 : 46;
  const items = [];
  for (let i = 0; i < COUNT; i++) items.push(spawn(true));

  function spawn(init){
    return {
      x: Math.random() * window.innerWidth,
      y: init ? Math.random() * window.innerHeight : -30,
      s: 4 + Math.random() * 7,
      vy: 0.35 + Math.random() * 0.85,
      vx: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.006 + Math.random() * 0.012,
      alpha: 0.35 + Math.random() * 0.5,
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]
    };
  }

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  window.addEventListener('pointermove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  function loop(){
    ctx.clearRect(0, 0, W, H);
    for (const p of items) {
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.7;
      p.y += p.vy;
      p.rot += p.vr;

      // 鼠标拂过时轻微推开
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 24000) {
        const f = (1 - d2 / 24000) * 1.6;
        p.x += (dx / (Math.sqrt(d2) + 1)) * f;
        p.y += (dy / (Math.sqrt(d2) + 1)) * f;
      }

      if (p.y > H + 40 || p.x < -60 || p.x > W + 60) Object.assign(p, spawn(false));
      drawPetal(p.x, p.y, p.s, p.rot, p.alpha, p.color);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ---------------- 鼠标柔光 ---------------- */
(function glow(){
  const el = document.getElementById('cursorGlow');
  if (!el || !window.matchMedia('(hover:hover)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    el.style.opacity = '1';
  }, { passive: true });
  (function tick(){
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
    el.style.left = cx + 'px'; el.style.top = cy + 'px';
    requestAnimationFrame(tick);
  })();
})();

/* ---------------- 背景视差 ---------------- */
(function parallax(){
  const layers = [...document.querySelectorAll('.layer[data-depth]')];
  if (!layers.length) return;
  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  (function tick(){
    mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
    for (const l of layers) {
      const d = parseFloat(l.dataset.depth) || 0;
      l.style.transform = `translate3d(${-mx * d}px, ${-my * d * 0.6}px, 0)`;
    }
    requestAnimationFrame(tick);
  })();
})();

/* ---------------- 滚动：进度条 / 导航样式 / 渐显 / 当前节 ---------------- */
(function scrollUI(){
  const bar = document.getElementById('progressBar');
  const dock = document.getElementById('dock');
  const links = [...document.querySelectorAll('[data-nav]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll(){
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
    if (dock) dock.classList.toggle('scrolled', h.scrollTop > 60);

    const mid = window.scrollY + window.innerHeight * 0.35;
    let idx = -1;
    sections.forEach((s, i) => { if (s.offsetTop <= mid) idx = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === idx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------------- 入场渐显 ---------------- */
(function reveal(){
  const els = document.querySelectorAll('.section, .glass, .card, .facts li');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach((el, i) => { el.style.transitionDelay = (i % 6) * 40 + 'ms'; io.observe(el); });
})();

/* ---------------- 卡片 3D 跟随 ---------------- */
(function tilt(){
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 11}deg) translateY(-6px)`;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ---------------- 点击：涟漪 + 散花 ---------------- */
(function clicks(){
  document.addEventListener('pointerdown', e => {
    // 涟漪（按钮/链接）
    const host = e.target.closest('.btn, .links a');
    if (host) {
      const r = host.getBoundingClientRect();
      const s = document.createElement('em');
      s.className = 'ripple';
      s.style.left = (e.clientX - r.left) + 'px';
      s.style.top = (e.clientY - r.top) + 'px';
      s.style.width = s.style.height = Math.max(r.width, r.height) * 0.9 + 'px';
      host.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
    // 散花
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('i');
      p.className = 'spark';
      const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.6;
      const d = 46 + Math.random() * 62;
      p.style.left = e.clientX + 'px';
      p.style.top = e.clientY + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.transform += ` rotate(${a * 57}deg)`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  });
})();

/* ---------------- 标题逐字出现 ---------------- */
(function title(){
  const t = document.getElementById('title');
  if (!t) return;
  [...t.children].forEach((s, i) => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(28px)';
    setTimeout(() => {
      s.style.transition = 'opacity .9s cubic-bezier(.2,.8,.2,1), transform .9s cubic-bezier(.2,.8,.2,1)';
      s.style.opacity = '1';
      s.style.transform = 'none';
    }, 220 + i * 160);
  });
})();

/* ---------------- 年份 ---------------- */
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

/* ---------------- 导航：花随滚动滑向左，标签随之落下 ---------------- */
(function dock(){
  const dock = document.getElementById('dock');
  const flower = document.getElementById('dockFlower');
  const items = [...document.querySelectorAll('.dock-items li')];
  if (!dock || !flower) return;

  const RANGE = 240;            // 滚动多少像素走完整个动画
  const TH = [0.46, 0.60, 0.74]; // 三条标签各自的出现阈值

  let p = 0, target = 0, raf = null, hoverOpen = false, closeTimer = null;

  function render(){
    const hoverMode = p < 0.02 && hoverOpen;
    // 缓动：一开始就跑得快一点，避免“滚了半天花没动”
    const e = Math.pow(p, 0.72);
    const dx = e * (50 - window.innerWidth / 2);
    // 旋转独立：前 72% 的进度里转满两圈并回到正位，之后只剩平移
    const rot = 720 * Math.min(1, p / 0.72);

    if (hoverMode) {
      flower.style.transform = '';           // 顶部悬停时交给 CSS 控制 left
    } else {
      flower.style.transform =
        `translateX(calc(-50% + ${dx.toFixed(1)}px)) rotate(${rot.toFixed(1)}deg)`;
    }

    dock.classList.toggle('docked', p > 0.08);

    // 顶部悬停模式：标签交给 CSS，清掉内联样式，否则会被锁死看不见
    items.forEach((li, i) => {
      if (hoverMode) {
        li.style.opacity = '';
        li.style.transform = '';
        li.style.pointerEvents = '';
        return;
      }
      const q = Math.max(0, Math.min(1, (p - TH[i]) / 0.12));
      li.style.opacity = q.toFixed(3);
      li.style.transform = `translateY(${((1 - q) * -18).toFixed(1)}px)`;
      li.style.pointerEvents = q > 0.5 ? 'auto' : 'none';
    });
  }

  function loop(){
    p += (target - p) * 0.22;
    if (Math.abs(target - p) < 0.002) { p = target; raf = null; render(); return; }
    render();
    raf = requestAnimationFrame(loop);
  }

  function closeHover(){
    hoverOpen = false;
    dock.classList.remove('open');
    flower.setAttribute('aria-expanded', 'false');
    render();          // 让标签回到隐藏状态
  }
  function openHover(){
    if (target > 0.02) return;
    clearTimeout(closeTimer); closeTimer = null;
    hoverOpen = true;
    dock.classList.add('open');
    flower.setAttribute('aria-expanded', 'true');
    render();          // 清掉内联样式，交给 CSS 弹出
  }

  function onScroll(){
    target = Math.max(0, Math.min(1, window.scrollY / RANGE));
    if (target > 0.02 && hoverOpen) closeHover();
    if (!raf) raf = requestAnimationFrame(loop);
  }

  flower.addEventListener('mouseenter', openHover);
  flower.addEventListener('click', e => {
    e.preventDefault();
    if (target > 0.02) return;
    hoverOpen ? closeHover() : openHover();
  });
  document.addEventListener('pointermove', e => {
    if (!hoverOpen || e.pointerType !== 'mouse') return;
    const insideBand = e.clientY < 190 && e.clientX < window.innerWidth * 0.94;
    if (insideBand) {
      clearTimeout(closeTimer); closeTimer = null;
    } else if (!closeTimer) {
      closeTimer = setTimeout(() => { closeTimer = null; closeHover(); }, 500);
    }
  }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHover(); });
  dock.querySelectorAll('.dock-items a').forEach(a =>
    a.addEventListener('click', () => { if (hoverOpen) closeHover(); }));

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { if (!raf) render(); }, { passive: true });

  onScroll(); p = target; render();

  // 调试用：打开 #navopen 直接展开导航（不影响正常使用）
  if (location.hash === '#navopen') setTimeout(openHover, 400);
  if (location.hash === '#static') {
    const st = document.createElement('style');
    st.textContent = '*{transition:none!important;animation:none!important}';
    document.head.appendChild(st);
    setTimeout(openHover, 200);
  }
  if (location.hash === '#diag') {
    setTimeout(openHover, 300);
    setTimeout(() => {
      // 诊断时关掉过渡，直接看最终值
      const st = document.createElement('style');
      st.textContent = '*{transition:none!important;animation:none!important}';
      document.head.appendChild(st);
      const cs = getComputedStyle(flower);
      const li = getComputedStyle(items[0]);
      let found = 'no', cnt = 0;
      try {
        const rules = document.styleSheets[0].cssRules;
        cnt = rules.length;
        for (const r of rules) {
          if (r.selectorText && r.selectorText.includes('dock.open')) { found = r.selectorText + ' => ' + r.style.left; break; }
        }
      } catch (err) { found = 'ERR:' + err.message; }
      document.title = 'L=' + cs.left + '|liOp=' + li.opacity + '|cls=' + dock.className + '|rules=' + cnt + '|open=' + found;
    }, 1800);
  }
})();

/* ---------------- 年份 ---------------- */
const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();
