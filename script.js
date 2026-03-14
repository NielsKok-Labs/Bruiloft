'use strict';

/* ═══════════════════════════════════════════════
   1. SYNC ENVELOPE GEOMETRY
   (CSS border-trick triangles need px values)
═══════════════════════════════════════════════ */
(function syncEnv() {
  var env   = document.getElementById('env');
  var sideL = env.querySelector('.env-side-l');
  var sideR = env.querySelector('.env-side-r');
  var botF  = env.querySelector('.env-bottom-fold');

  function sync() {
    var w  = env.offsetWidth;
    var h  = env.offsetHeight;
    var hw = Math.ceil(w / 2) + 1;
    var hh = Math.ceil(h / 2) + 1;
    var fh = Math.round(h * 0.42);  // bottom-fold height

    /* side triangles */
    sideL.style.borderWidth = '0 0 ' + hh + 'px ' + hw + 'px';
    sideR.style.borderWidth = '0 ' + hw + 'px ' + hh + 'px 0';

    /* bottom fold — update via CSS custom props on root */
    env.style.setProperty('--env-hw', hw + 'px');
    env.style.setProperty('--env-h',  hh + 'px');
    env.style.setProperty('--env-fh', fh + 'px');
  }

  sync();
  window.addEventListener('resize', sync);
})();


/* ═══════════════════════════════════════════════
   2. FLOATING PARTICLES
═══════════════════════════════════════════════ */
(function initParticles() {
  var canvas = document.getElementById('particles-canvas');
  var ctx    = canvas.getContext('2d');
  var W, H, pts = [];

  var COLORS = [
    [107, 158, 100],
    [168, 196, 162],
    [207, 224, 204],
    [217, 138, 141],
    [200, 165,  92]
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle(init) {
    this.reset(init);
  }
  Particle.prototype.reset = function(init) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : H + 12;
    this.r  = 0.5 + Math.random() * 1.9;
    this.vy = 0.09 + Math.random() * 0.22;
    this.vx = (Math.random() - 0.5) * 0.18;
    this.a  = 0.04 + Math.random() * 0.13;
    var c   = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.fill = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',';
  };
  Particle.prototype.step = function() {
    this.y -= this.vy;
    this.x += this.vx;
    if (this.y < -12) this.reset(false);
  };
  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.fill + this.a + ')';
    ctx.fill();
  };

  function initPts() {
    pts = [];
    var n = Math.min(55, Math.floor(W * H / 20000));
    for (var i = 0; i < n; i++) pts.push(new Particle(true));
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) { pts[i].step(); pts[i].draw(); }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', function() { resize(); initPts(); });
  resize();
  initPts();
  loop();
})();


/* ═══════════════════════════════════════════════
   3. FIREFLIES  (layered on the scene)
═══════════════════════════════════════════════ */
(function initFireflies() {
  var scene = document.getElementById('scene');
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '.ff{position:absolute;border-radius:50%;pointer-events:none;' +
    'background:rgba(185,228,160,.9);' +
    'box-shadow:0 0 7px 3px rgba(140,210,100,.55);' +
    'animation:ffAnim linear infinite;}' +
    '@keyframes ffAnim{' +
    '0%  {opacity:0;transform:translate(0,0) scale(1)}' +
    '10% {opacity:1}' +
    '50% {opacity:.8;transform:translate(var(--fx),var(--fy)) scale(1.4)}' +
    '90% {opacity:.5}' +
    '100%{opacity:0;transform:translate(calc(var(--fx)*1.8),calc(var(--fy)*1.6)) scale(.6)}}';
  document.head.appendChild(styleEl);

  for (var i = 0; i < 20; i++) {
    var f   = document.createElement('div');
    var sz  = 1.8 + Math.random() * 2.4;
    var dur = 6 + Math.random() * 10;
    var dx  = ((Math.random() - 0.5) * 200).toFixed(1);
    var dy  = ((Math.random() - 0.5) * 200).toFixed(1);
    f.className = 'ff';
    f.style.cssText =
      'left:'  + (Math.random() * 100).toFixed(1) + '%;' +
      'top:'   + (Math.random() * 100).toFixed(1) + '%;' +
      'width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;' +
      '--fx:'  + dx + 'px;--fy:' + dy + 'px;' +
      'animation-duration:' + dur.toFixed(1) + 's;' +
      'animation-delay:-'   + (Math.random() * dur).toFixed(1) + 's;';
    scene.appendChild(f);
  }
})();


/* ═══════════════════════════════════════════════
   4. ENVELOPE OPEN
═══════════════════════════════════════════════ */
(function initEnvelope() {
  var scene  = document.getElementById('scene');
  var env    = document.getElementById('env');
  var invite = document.getElementById('invite');
  var opened = false;

  function open() {
    if (opened) return;
    opened = true;

    /* step 1 — CSS open class triggers flap + card */
    env.classList.add('opened');

    /* step 2 — petal burst after short delay */
    setTimeout(burstPetals, 380);

    /* step 3 — fade out scene, show invite */
    setTimeout(function() {
      scene.classList.add('out');
      invite.style.display = 'block';
      /* Force layout before adding visible class */
      void invite.offsetWidth;
      invite.classList.add('visible');
    }, 950);

    /* step 4 — remove scene from DOM */
    setTimeout(function() {
      scene.style.display = 'none';
    }, 2000);
  }

  /* Click */
  scene.addEventListener('click', open);

  /* Touch — prevent ghost click on mobile */
  var touchMoved = false;
  scene.addEventListener('touchstart', function() { touchMoved = false; }, { passive: true });
  scene.addEventListener('touchmove',  function() { touchMoved = true;  }, { passive: true });
  scene.addEventListener('touchend', function(e) {
    if (touchMoved) return;
    e.preventDefault();
    open();
  }, { passive: false });

  /* Keyboard */
  scene.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });

  /* ── Petal confetti burst ── */
  function burstPetals() {
    var emojis = ['🌸','🌷','🌺','✿','❀','🍃','🌿','🌼','🌻'];
    var count  = 40;

    for (var i = 0; i < count; i++) {
      (function(idx) {
        setTimeout(function() {
          var el  = document.createElement('span');
          var dur = 2200 + Math.random() * 2800;
          var dx  = (Math.random() - 0.5) * 220;
          var rot = (Math.random() - 0.5) * 680;

          el.textContent  = emojis[Math.floor(Math.random() * emojis.length)];
          el.style.cssText =
            'position:fixed;pointer-events:none;z-index:99999;' +
            'top:-36px;left:' + (Math.random() * 100).toFixed(1) + 'vw;' +
            'font-size:' + (0.7 + Math.random() * 0.9).toFixed(2) + 'rem;';
          document.body.appendChild(el);

          if (el.animate) {
            el.animate([
              { opacity: .9, transform: 'translateY(0) translateX(0) rotate(0deg)' },
              { opacity: .65, transform: 'translateY(44vh) translateX(' + (dx * 0.55).toFixed(0) + 'px) rotate(' + (rot * 0.5).toFixed(0) + 'deg)' },
              { opacity: 0,  transform: 'translateY(110vh) translateX(' + dx.toFixed(0) + 'px) rotate(' + rot.toFixed(0) + 'deg)' }
            ], { duration: dur, easing: 'ease-in', fill: 'forwards' })
            .onfinish = function() { el.remove(); };
          } else {
            /* Fallback for older browsers */
            setTimeout(function() { el.remove(); }, dur + 100);
          }
        }, idx * 52 + Math.random() * 65);
      })(i);
    }
  }
})();


/* ═══════════════════════════════════════════════
   5. SCROLL REVEAL
═══════════════════════════════════════════════ */
(function initReveal() {
  var targets = document.querySelectorAll('[data-r]');
  if (!window.IntersectionObserver) {
    /* Fallback: show all */
    targets.forEach(function(el) { el.classList.add('on'); });
    return;
  }

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el       = entry.target;
      var siblings = el.parentElement
        ? Array.prototype.slice.call(el.parentElement.querySelectorAll('[data-r]:not(.on)'))
        : [];
      var idx = siblings.indexOf(el);
      setTimeout(function() {
        el.classList.add('on');
      }, Math.max(0, idx) * 95);
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -44px 0px' });

  targets.forEach(function(el) { io.observe(el); });
})();


/* ═══════════════════════════════════════════════
   6. COUNTDOWN
═══════════════════════════════════════════════ */
(function initCountdown() {
  var TARGET = new Date('2026-06-22T13:00:00+02:00').getTime();
  var dEl = document.getElementById('cdD');
  var hEl = document.getElementById('cdH');
  var mEl = document.getElementById('cdM');
  var sEl = document.getElementById('cdS');

  function pad(n) {
    return ('0' + n).slice(-2);
  }

  function setNum(el, val) {
    var s = pad(val);
    if (el.textContent === s) return;
    el.classList.add('flip');
    setTimeout(function() {
      el.textContent = s;
      el.classList.remove('flip');
    }, 200);
  }

  function tick() {
    var diff = TARGET - Date.now();
    if (diff < 0) diff = 0;
    setNum(dEl, Math.floor(diff / 86400000));
    setNum(hEl, Math.floor((diff % 86400000) / 3600000));
    setNum(mEl, Math.floor((diff % 3600000)  / 60000));
    setNum(sEl, Math.floor((diff % 60000)    / 1000));
  }

  tick();
  setInterval(tick, 1000);
})();
