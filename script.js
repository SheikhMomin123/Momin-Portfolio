// Main JavaScript for the portfolio
// Handles: mobile nav toggle, smooth scrolling, active nav, reveal animations, form validation, back-to-top

document.addEventListener('DOMContentLoaded', () => {
  // Configuration: choose a client-side endpoint or a local server option
  // Replace FORMSPREE_ENDPOINT with your Formspree form endpoint (e.g. https://formspree.io/f/xyz)
  // Or set USE_SERVER to true and run the optional Node backend included in this repo.
  const CONFIG = {
    FORMSPREE_ENDPOINT: '',
    USE_SERVER: true,
    SERVER_ENDPOINT: 'http://localhost:3000/send'
  };
  // Nav toggle for mobile
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Smooth scrolling for in-page links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Active link highlighting using IntersectionObserver
  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('.nav-link');
  const obsOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (entry.isIntersecting) {
        navItems.forEach(i => i.classList.remove('active'));
        link?.classList.add('active');
      }
    });
  }, obsOptions);
  sections.forEach(s => obs.observe(s));

  // Scroll reveal: add 'visible' when element enters viewport
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(e => revealObserver.observe(e));

  // Back to top button
  const backTop = document.getElementById('backTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backTop.style.display = 'block';
    else backTop.style.display = 'none';
  });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Inject current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
