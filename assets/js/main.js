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
    link.style.color = link.getAttribute('href') === '#' + current ? 'var(--gold)' : '';
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
  if (menuOpen && window.innerWidth > 768) setMenu(false);
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
