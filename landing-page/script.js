/* ============================================================
   NOVAMIND — script.js
   Handles: sticky header shadow, mobile nav toggle
   ============================================================ */

const header     = document.getElementById('header');
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');

/* ── Sticky header: add shadow on scroll ── */
const onScroll = () => {
  if (window.scrollY > 20) {
    header.style.boxShadow = '0 4px 32px rgba(0,0,0,0.45)';
  } else {
    header.style.boxShadow = 'none';
  }
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ── Hamburger toggle ── */
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

/* ── Close mobile nav when a link is clicked ── */
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Intersection Observer: fade-in sections ── */
const fadeTargets = document.querySelectorAll(
  '.feature-card, .testimonial-card, .pricing-card, .stat, .faq__item'
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform += ' translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

fadeTargets.forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = (el.style.transform || '') + ' translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
