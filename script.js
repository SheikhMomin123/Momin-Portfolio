// Main JavaScript for the portfolio
// Handles: mobile nav toggle, smooth scrolling, active nav, reveal animations, form validation, back-to-top

document.addEventListener('DOMContentLoaded', () => {
  // Configuration: choose a client-side endpoint or a local server option
  // Replace FORMSPREE_ENDPOINT with your Formspree form endpoint (e.g. https://formspree.io/f/xyz)
  // Or set USE_SERVER to true and run the optional Node backend included in this repo.
  const CONFIG = {
    FORMSPREE_ENDPOINT: '',
    USE_SERVER: false,
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

  // Contact form validation and submission (supports Formspree or local server)
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      formMsg.textContent = 'Please fill out all fields.';
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) { formMsg.textContent = 'Please enter a valid email.'; return; }
    if (message.length < 10) { formMsg.textContent = 'Message should be at least 10 characters.'; return; }

    const payload = { name, email, message };

    try {
      formMsg.textContent = 'Sending...';
      if (CONFIG.USE_SERVER) {
        // POST to local/remote server that relays email (see server folder)
        const res = await fetch(CONFIG.SERVER_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          formMsg.textContent = 'Message sent — thank you!';
          form.reset();
        } else {
          formMsg.textContent = data?.error || 'Failed to send message.';
        }
      } else {
        // Client-side submission to Formspree
        if (!CONFIG.FORMSPREE_ENDPOINT || CONFIG.FORMSPREE_ENDPOINT.includes('yourFormId')) {
          formMsg.textContent = 'Contact form is not configured. Set CONFIG.FORMSPREE_ENDPOINT in script.js or enable USE_SERVER.';
          return;
        }
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
        const data = await res.json().catch(() => null);
        if (res.ok) {
          formMsg.textContent = 'Message sent — thank you!';
          form.reset();
        } else if (data?.error) {
          if (data.error.toLowerCase().includes('form not found')) {
            formMsg.textContent = 'Formspree endpoint invalid. Update CONFIG.FORMSPREE_ENDPOINT in script.js with the correct Formspree URL.';
          } else {
            formMsg.textContent = data.error;
          }
        } else if (res.status === 404) {
          formMsg.textContent = 'Formspree endpoint not found (404). Please verify CONFIG.FORMSPREE_ENDPOINT in script.js.';
        } else {
          formMsg.textContent = 'Failed to send message. Check your Formspree endpoint or enable USE_SERVER.';
        }
      }
    } catch (err) {
      console.error(err);
      formMsg.textContent = 'An error occurred while sending.';
    }
    setTimeout(()=> formMsg.textContent = '', 6000);
  });

  // Inject current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
