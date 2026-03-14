'use strict';

/* ═══════════════════════════════════════
   FLOATING PARTICLES
═══════════════════════════════════════ */
(function () {
  var canvas = document.getElementById('petals-canvas');
  var ctx = canvas.getContext('2d');
  var W, H, pts = [];
  var COLS = [
    [168, 196, 162],  // sage light
    [207, 224, 204],  // sage pale
    [122, 158, 115],  // sage mid
    [232, 160, 164],  // pink
    [242, 203, 204],  // pink light
    [200, 165, 92]    // gold
  ];

  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }

  function Pt(init) { this.spawn(init); }
  Pt.prototype.spawn = function (init) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : H + 10;
    this.r  = 0.6 + Math.random() * 2.0;
    this.vy = 0.1 + Math.random() * 0.24;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.a  = 0.04 + Math.random() * 0.14;
    var c = COLS[Math.floor(Math.random() * COLS.length)];
    this.col = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',';
  };
  Pt.prototype.step = function () {
    this.y -= this.vy; this.x += this.vx;
    if (this.y < -12) this.spawn(false);
  };
  Pt.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.col + this.a + ')';
    ctx.fill();
  };

  function boot() {
    pts = [];
    var n = Math.min(60, Math.floor(W * H / 18000));
    for (var i = 0; i < n; i++) pts.push(new Pt(true));
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) { pts[i].step(); pts[i].draw(); }
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', function () { resize(); boot(); });
  resize(); boot(); loop();
}());


/* ═══════════════════════════════════════
   ENVELOPE  OPEN
═══════════════════════════════════════ */
(function () {
  var scene   = document.getElementById('scene');
  var env     = document.getElementById('envelope');
  var invite  = document.getElementById('invite');
  var opened  = false;

  function open() {
    if (opened) return;
    opened = true;

    /* 1. apply open class → CSS handles flap + card animation */
    env.classList.add('open');

    /* 2. petals after short delay */
    setTimeout(burst, 420);

    /* 3. fade out scene, reveal invite */
    setTimeout(function () {
      scene.classList.add('gone');
      invite.style.display = 'block';
      void invite.offsetWidth;          // force reflow
      invite.classList.add('visible');
    }, 980);

    /* 4. remove scene */
    setTimeout(function () {
      scene.style.display = 'none';
    }, 2000);
  }

  /* Click */
  scene.addEventListener('click', open);

  /* Touch — prevent ghost-click double-fire */
  var hasMoved = false;
  scene.addEventListener('touchstart', function () { hasMoved = false; }, { passive: true });
  scene.addEventListener('touchmove',  function () { hasMoved = true;  }, { passive: true });
  scene.addEventListener('touchend', function (e) {
    if (hasMoved) return;
    e.preventDefault();
    open();
  }, { passive: false });

  /* Keyboard */
  scene.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });

  /* ── PETAL BURST ── */
  function burst() {
    var glyphs = ['🌸','🌷','🌺','✿','❀','🍃','🌿','🌼','🩷'];
    for (var i = 0; i < 42; i++) {
      (function (idx) {
        setTimeout(function () {
          var el  = document.createElement('span');
          var dur = 2400 + Math.random() * 2800;
          var dx  = (Math.random() - 0.5) * 240;
          var rot = (Math.random() - 0.5) * 700;

          el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
          el.style.cssText =
            'position:fixed;pointer-events:none;z-index:99999;' +
            'top:-36px;left:' + (Math.random() * 100).toFixed(1) + 'vw;' +
            'font-size:' + (0.65 + Math.random() * 0.9).toFixed(2) + 'rem;';

          document.body.appendChild(el);

          if (el.animate) {
            el.animate([
              { opacity: .9,  transform: 'translateY(0) translateX(0) rotate(0deg)' },
              { opacity: .65, transform: 'translateY(44vh) translateX(' + (dx * 0.55).toFixed(0) + 'px) rotate(' + (rot * 0.5).toFixed(0) + 'deg)' },
              { opacity: 0,   transform: 'translateY(110vh) translateX(' + dx.toFixed(0) + 'px) rotate(' + rot.toFixed(0) + 'deg)' }
            ], { duration: dur, easing: 'ease-in', fill: 'forwards' })
            .onfinish = function () { el.remove(); };
          } else {
            setTimeout(function () { el.remove(); }, dur + 100);
          }
        }, idx * 50 + Math.random() * 65);
      }(i));
    }
  }
}());


/* ═══════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════ */
(function () {
  var els = document.querySelectorAll('[data-reveal]');

  if (!window.IntersectionObserver) {
    els.forEach(function (el) { el.classList.add('on'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var siblings = el.parentElement
        ? Array.prototype.slice.call(el.parentElement.querySelectorAll('[data-reveal]:not(.on)'))
        : [];
      var idx = siblings.indexOf(el);
      setTimeout(function () { el.classList.add('on'); }, Math.max(0, idx) * 95);
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -44px 0px' });

  els.forEach(function (el) { io.observe(el); });
}());


/* ═══════════════════════════════════════
   COUNTDOWN  — target: 22 June 2026 13:00 CEST
═══════════════════════════════════════ */
(function () {
  /* 22-06-2026 13:00:00 Amsterdam time (UTC+2 in summer) */
  var TARGET = new Date('2026-06-22T13:00:00+02:00').getTime();

  var dEl = document.getElementById('cdD');
  var hEl = document.getElementById('cdH');
  var mEl = document.getElementById('cdM');
  var sEl = document.getElementById('cdS');

  function pad(n) { return ('0' + Math.max(0, Math.floor(n))).slice(-2); }

  function setNum(el, val) {
    var s = pad(val);
    if (el.textContent === s) return;
    el.classList.add('flip');
    setTimeout(function () {
      el.textContent = s;
      el.classList.remove('flip');
    }, 210);
  }

  function tick() {
    var diff = TARGET - Date.now();
    if (diff < 0) diff = 0;
    setNum(dEl, diff / 86400000);
    setNum(hEl, (diff % 86400000) / 3600000);
    setNum(mEl, (diff % 3600000)  / 60000);
    setNum(sEl, (diff % 60000)    / 1000);
  }

  tick();
  setInterval(tick, 1000);
}());
