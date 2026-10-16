/* =============================================
   script.js — Portfolio Interactivity
   ============================================= */

// ─── 1. Navbar: scroll effect + active link ────────────────────────────────
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Sticky style
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active nav highlight
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle(
      'active',
      link.getAttribute('href') === `#${current}`
    );
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

// ─── 2. Mobile hamburger menu ──────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu when a nav link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── 3. Skill bars — animate on scroll into view ──────────────────────────
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

skillFills.forEach(fill => skillObserver.observe(fill));

// ─── 4. Scroll-reveal animation for cards ─────────────────────────────────
const revealEls = document.querySelectorAll(
  '.project-card, .skill-category, .contact-card, .about-grid'
);

// Add initial hidden style via JS (so no-JS users still see content)
revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger effect for grid children
        const delay = entry.target.closest('.projects-grid, .skills-categories, .contact-cards')
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
          : 0;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealEls.forEach(el => revealObserver.observe(el));

// ─── 5. Project filter ─────────────────────────────────────────────────────
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        // Animate back in
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ─── 6. Contact form validation & fake submit ──────────────────────────────
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const btnText     = document.getElementById('btn-text');
const formSuccess = document.getElementById('form-success');

function validateField(id, errorId, validator, message) {
  const field = document.getElementById(id);
  const error = document.getElementById(errorId);
  if (!validator(field.value.trim())) {
    field.classList.add('error');
    error.textContent = message;
    return false;
  }
  field.classList.remove('error');
  error.textContent = '';
  return true;
}

function isNotEmpty(val) { return val.length > 0; }
function isEmail(val)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const valid = [
    validateField('name',    'name-error',    isNotEmpty, 'Name is required.'),
    validateField('email',   'email-error',   isEmail,    'Please enter a valid email.'),
    validateField('subject', 'subject-error', isNotEmpty, 'Subject is required.'),
    validateField('message', 'message-error', v => v.length >= 10, 'Message must be at least 10 characters.'),
  ].every(Boolean);

  if (!valid) return;

  // Simulate sending
  btnText.textContent = 'Sending…';
  submitBtn.disabled  = true;

  setTimeout(() => {
    btnText.textContent   = 'Send Message';
    submitBtn.disabled    = false;
    formSuccess.style.display = 'block';
    contactForm.reset();
    // Hide success after 5s
    setTimeout(() => { formSuccess.style.display = 'none'; }, 5000);
  }, 1600);
});

// Clear error state on input
['name','email','subject','message'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    el.classList.remove('error');
    document.getElementById(`${id}-error`).textContent = '';
  });
});

// ─── 7. Smooth scroll for anchor links ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
