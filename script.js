/* =============================================================
YIREN & NIES WEDDING INVITATION — script.js
Particle system, envelope open sequence, scroll reveal,
countdown timer, petal confetti
============================================================= */

‘use strict’;

/* ─────────────────────────────────────────────────────────────

1. PARTICLE SYSTEM  (floating botanical particles on bg)
   ───────────────────────────────────────────────────────────── */
   (function initParticles() {
   const canvas = document.getElementById(‘particles’);
   const ctx    = canvas.getContext(‘2d’);
   let W, H, particles = [];

const COLORS = [
‘rgba(107,143,100,’,
‘rgba(154,184,148,’,
‘rgba(200,221,196,’,
‘rgba(212,135,138,’,
‘rgba(196,163,90,’,
];

function resize() {
W = canvas.width  = window.innerWidth;
H = canvas.height = window.innerHeight;
}

class Particle {
constructor() { this.reset(true); }
reset(init = false) {
this.x     = Math.random() * W;
this.y     = init ? Math.random() * H : H + 20;
this.size  = .8 + Math.random() * 2.2;
this.speed = .12 + Math.random() * .25;
this.drift = (Math.random() - .5) * .3;
this.alpha = .05 + Math.random() * .18;
this.col   = COLORS[Math.floor(Math.random() * COLORS.length)];
this.rot   = Math.random() * Math.PI * 2;
this.rotSpd= (Math.random() - .5) * .008;
// shape: 0 = circle, 1 = diamond, 2 = petal
this.shape = Math.floor(Math.random() * 3);
}
update() {
this.y   -= this.speed;
this.x   += this.drift;
this.rot += this.rotSpd;
if (this.y < -20) this.reset();
}
draw() {
ctx.save();
ctx.globalAlpha = this.alpha;
ctx.fillStyle   = this.col + ‘1)’;
ctx.translate(this.x, this.y);
ctx.rotate(this.rot);

```
  if (this.shape === 0) {
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (this.shape === 1) {
    const s = this.size * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * .6, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s * .6, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    // small leaf
    const s = this.size;
    ctx.beginPath();
    ctx.ellipse(0, -s, s * .45, s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
```

}

function initParts() {
particles = [];
const count = Math.min(60, Math.floor(W * H / 22000));
for (let i = 0; i < count; i++) particles.push(new Particle());
}

function loop() {
ctx.clearRect(0, 0, W, H);
particles.forEach(p => { p.update(); p.draw(); });
requestAnimationFrame(loop);
}

window.addEventListener(‘resize’, () => { resize(); initParts(); });
resize();
initParts();
loop();
})();

/* ─────────────────────────────────────────────────────────────
2.  PETAL CONFETTI  (burst on open)
───────────────────────────────────────────────────────────── */
function burstPetals(count = 36) {
const glyphs = [‘🌸’,‘🌷’,‘🌺’,‘✿’,‘❀’,‘🍃’,‘🌿’,‘🌼’,‘🌻’];
for (let i = 0; i < count; i++) {
setTimeout(() => {
const el = document.createElement(‘span’);
el.style.cssText = `position:fixed; top:-30px; left:${Math.random() * 100}vw; font-size:${.7 + Math.random() * .85}rem; pointer-events:none; z-index:99999; will-change:transform,opacity;`;
el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
document.body.appendChild(el);

```
  const dur    = 2.4 + Math.random() * 2.8;
  const drift  = (Math.random() - .5) * 160;
  const endRot = (Math.random() - .5) * 720;

  el.animate([
    { opacity: .9, transform: `translateY(0) translateX(0) rotate(0deg)` },
    { opacity: .6, transform: `translateY(45vh) translateX(${drift*.5}px) rotate(${endRot*.5}deg)` },
    { opacity: 0,  transform: `translateY(110vh) translateX(${drift}px) rotate(${endRot}deg)` }
  ], {
    duration: dur * 1000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards'
  }).onfinish = () => el.remove();

}, i * 55 + Math.random() * 80);
```

}
}

/* ─────────────────────────────────────────────────────────────
3.  ENVELOPE OPEN SEQUENCE
───────────────────────────────────────────────────────────── */
(function initEnvelope() {
const scene    = document.getElementById(‘envelope-scene’);
const envelope = document.getElementById(‘envelope’);
const invitation = document.getElementById(‘invitation’);
let opened = false;

function open() {
if (opened) return;
opened = true;

```
// 1. Trigger CSS open class (flap rotates, letter rises, seal shrinks)
envelope.classList.add('open');

// 2. Burst petals
setTimeout(() => burstPetals(40), 300);

// 3. Fade out scene, reveal invitation
setTimeout(() => {
  scene.classList.add('exit');
  invitation.removeAttribute('aria-hidden');
  invitation.classList.add('visible');
  document.body.style.overflow = 'auto';
}, 850);

// 4. Fully hide scene after transition
setTimeout(() => {
  scene.style.display = 'none';
}, 1600);
```

}

envelope.addEventListener(‘click’, open);
envelope.addEventListener(‘keydown’, e => {
if (e.key === ‘Enter’ || e.key === ’ ’) { e.preventDefault(); open(); }
});

// Touch feedback — subtle scale
envelope.addEventListener(‘touchstart’, () => {
envelope.style.transform = ‘scale(0.97)’;
}, { passive: true });
envelope.addEventListener(‘touchend’, () => {
envelope.style.transform = ‘’;
open();
});

// Initially lock scroll
document.body.style.overflow = ‘hidden’;
})();

/* ─────────────────────────────────────────────────────────────
4.  SCROLL REVEAL
───────────────────────────────────────────────────────────── */
(function initReveal() {
const targets = document.querySelectorAll(’[data-reveal]’);

const io = new IntersectionObserver(entries => {
entries.forEach((entry, i) => {
if (!entry.isIntersecting) return;
// stagger siblings
const siblings = […entry.target.parentElement.querySelectorAll(’[data-reveal]:not(.revealed)’)];
const idx = siblings.indexOf(entry.target);
setTimeout(() => {
entry.target.classList.add(‘revealed’);
}, idx * 80);
io.unobserve(entry.target);
});
}, { threshold: .12, rootMargin: ‘0px 0px -40px 0px’ });

targets.forEach(t => io.observe(t));
})();

/* ─────────────────────────────────────────────────────────────
5.  COUNTDOWN TIMER
───────────────────────────────────────────────────────────── */
(function initCountdown() {
const target = new Date(‘2026-06-22T13:00:00+02:00’).getTime();

const dEl = document.getElementById(‘cd-days’);
const hEl = document.getElementById(‘cd-hours’);
const mEl = document.getElementById(‘cd-mins’);
const sEl = document.getElementById(‘cd-secs’);

function pad(n) { return String(n).padStart(2, ‘0’); }

function tick() {
const now  = Date.now();
const diff = target - now;

```
if (diff <= 0) {
  dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
  return;
}

const days  = Math.floor(diff / 86400000);
const hours = Math.floor((diff % 86400000) / 3600000);
const mins  = Math.floor((diff % 3600000)  / 60000);
const secs  = Math.floor((diff % 60000)    / 1000);

// Animate flip when value changes
function update(el, val) {
  const str = pad(val);
  if (el.textContent !== str) {
    el.style.transition = 'none';
    el.style.transform = 'translateY(-8px)';
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.textContent = str;
      requestAnimationFrame(() => {
        el.style.transition = 'transform .35s cubic-bezier(0.34,1.56,0.64,1), opacity .25s ease';
        el.style.transform = 'translateY(0)';
        el.style.opacity   = '1';
      });
    });
  }
}

update(dEl, days);
update(hEl, hours);
update(mEl, mins);
update(sEl, secs);
```

}

tick();
setInterval(tick, 1000);
})();

/* ─────────────────────────────────────────────────────────────
6.  PARALLAX — subtle botanical shift on scroll
───────────────────────────────────────────────────────────── */
(function initParallax() {
const botanicals = document.querySelectorAll(’.hero-botanical’);
let ticking = false;

function onScroll() {
if (ticking) return;
ticking = true;
requestAnimationFrame(() => {
const scrollY = window.scrollY;
botanicals.forEach((el, i) => {
const dir   = i % 2 === 0 ? 1 : -1;
const speed = .18;
el.style.transform = `translateY(${scrollY * speed * dir}px)${i % 2 !== 0 ? ' scaleX(-1)' : ''}`;
});
ticking = false;
});
}

window.addEventListener(‘scroll’, onScroll, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────
7.  ENVELOPE SIZE SYNC  (CSS vars for triangles)
───────────────────────────────────────────────────────────── */
(function syncEnvSize() {
const env = document.querySelector(’.envelope’);
if (!env) return;

function sync() {
const w = env.offsetWidth;
const h = env.offsetHeight;
env.style.setProperty(’–w’, `${w / 2}px`);
env.style.setProperty(’–h’, `${h / 2}px`);
// bottom tri height is half the envelope height
env.querySelectorAll(’.env-tri–bl’).forEach(t => {
t.style.borderWidth = `0 0 ${h / 2}px ${w / 2}px`;
});
env.querySelectorAll(’.env-tri–br’).forEach(t => {
t.style.borderWidth = `0 ${w / 2}px ${h / 2}px 0`;
});
env.querySelectorAll(’.env-tri–bottom’).forEach(t => {
t.style.borderWidth = `0 0 ${h * .42}px ${w / 2}px`;
});
}

sync();
window.addEventListener(‘resize’, sync);
})();
