// Scroll state: progress bar, sticky nav, back-to-top, and active nav item.
const progressBar = document.getElementById('progressBar');
const nav = document.getElementById('mainNav');
const backTop = document.getElementById('backTop');
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
let scrollTicking = false;

function updateScrollState() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  let current = '';

  progressBar.style.width = progress + '%';
  nav.classList.toggle('scrolled', scrollTop > 40);
  backTop.classList.toggle('visible', scrollTop > 400);

  sections.forEach(section => {
    if (scrollTop >= section.offsetTop - 100) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
  });

  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollState);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollState();

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

function setMenu(open) {
  menuOpen = open;
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  hamburger.setAttribute('aria-expanded', open);
  hamburger.setAttribute('aria-label', open ? hamburger.dataset.labelClose : hamburger.dataset.labelOpen);
  document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => setMenu(!menuOpen));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

// Close on Escape, and auto-close when resizing up to desktop.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) setMenu(false);
});
window.addEventListener('resize', () => {
  // Must match the nav-collapse breakpoint in styles.css, or the sheet closes
  // at a width where the desktop links are still hidden.
  if (menuOpen && window.innerWidth > 1024) setMenu(false);
});

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));


// Theme: system preference by default, overridden by an explicit choice.
// The saved value is already applied inline in <head>; this only wires the control.
const themeButtons = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')]
  .filter(Boolean);
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return document.documentElement.dataset.theme || (systemDark.matches ? 'dark' : 'light');
}

function syncThemeButtons() {
  const isDark = currentTheme() === 'dark';
  themeButtons.forEach(btn => btn.setAttribute('aria-pressed', String(isDark)));
}

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('habib-theme', next); } catch (e) {}
    syncThemeButtons();
  });
});
// Follow the OS while no explicit choice has been made.
systemDark.addEventListener('change', () => {
  if (!document.documentElement.dataset.theme) syncThemeButtons();
});
syncThemeButtons();

// Count up the small figures when they first scroll into view.
// Years (2021) and anything above 100 stay put — counting those reads as a glitch.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const counters = document.querySelectorAll('.hero-stat .num, .kids-cred-num');

function countUp(el, target, suffix) {
  const duration = 900;
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (!reduceMotion.matches && counters.length) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      counterObserver.unobserve(entry.target);
      const match = entry.target.textContent.trim().match(/^(\d+)(\+?)$/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      if (target > 100) return;
      entry.target.textContent = '0' + match[2];
      countUp(entry.target, target, match[2]);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));
}

// ── Hero: pointer spotlight, crest parallax, media activation ──────────
const hero = document.querySelector('.hero');

if (hero && !reduceMotion.matches) {
  // Spotlight follows the pointer via CSS custom properties. Fine pointers
  // only — on touch there is no hover, and the glow would stick where the
  // last tap landed.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (finePointer.matches) {
    let pointerQueued = false;
    let px = 0, py = 0;
    hero.addEventListener('pointermove', e => {
      const rect = hero.getBoundingClientRect();
      px = ((e.clientX - rect.left) / rect.width) * 100;
      py = ((e.clientY - rect.top) / rect.height) * 100;
      if (!pointerQueued) {
        pointerQueued = true;
        requestAnimationFrame(() => {
          hero.style.setProperty('--mx', px + '%');
          hero.style.setProperty('--my', py + '%');
          pointerQueued = false;
        });
      }
    }, { passive: true });
  }

  // Crest drifts slower than the page. Bounded to the hero's own height so
  // it stops once the section is off screen.
  const crest = hero.querySelector('.hero-crest');
  if (crest) {
    let parallaxQueued = false;
    window.addEventListener('scroll', () => {
      if (parallaxQueued) return;
      parallaxQueued = true;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, hero.offsetHeight);
        crest.style.setProperty('--parallax', (offset * 0.16).toFixed(1) + 'px');
        parallaxQueued = false;
      });
    }, { passive: true });
  }
}

// ── Hero media: pick the right cut, then activate ──────────────────────
// The landscape file shows only its centre ~24% inside the hero's portrait
// box on a phone, so narrow screens load a 9:16 recut of the same footage.
// Selection happens here rather than via <source media> because Blink does
// not honour that attribute on <video>.
(function () {
  const video = document.querySelector('.hero-video');
  if (!hero || !video) return;

  const narrow = window.matchMedia('(max-width: 768px)').matches;
  const key = narrow ? 'narrow' : 'wide';
  const poster = video.dataset['poster' + (narrow ? 'Narrow' : 'Wide')];

  // The poster alone is enough to justify the scrim — raise it now so the
  // headline never sits over an unscrimmed still.
  if (poster) {
    video.poster = poster;
    hero.classList.add('has-media');
  }

  // Reduced motion keeps the poster as a still and never fetches the video.
  if (reduceMotion.matches) return;

  [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([ext, type]) => {
    const src = video.dataset[ext + (narrow ? 'Narrow' : 'Wide')];
    if (!src) return;
    const el = document.createElement('source');
    el.src = src;
    el.type = type;
    video.appendChild(el);
  });
  video.load();

  function attempt() {
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }
  // Muted + playsinline is usually enough, but Low Power Mode and data-saver
  // still refuse; retry on the first gesture, else the poster is what shows.
  video.addEventListener('loadeddata', attempt, { once: true });
  ['pointerdown', 'keydown', 'touchstart'].forEach(evt =>
    window.addEventListener(evt, attempt, { once: true, passive: true })
  );
  // Stop decoding once the hero scrolls away.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? attempt() : video.pause()));
    }, { threshold: 0.15 }).observe(video);
  }
})();
