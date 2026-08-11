// Main JavaScript for the portfolio
// Handles: mobile nav toggle, smooth scrolling, active nav, reveal animations, form validation, back-to-top

document.addEventListener('DOMContentLoaded', () => {
  // Configuration: choose a client-side endpoint or a local server option
  // Replace FORMSPREE_ENDPOINT with your Formspree form endpoint (e.g. https://formspree.io/f/xyz)
  // Or set USE_SERVER to true and run the optional Node backend included in this repo.
  const CONFIG = {
    FORMSPREE_ENDPOINT: 'https://formspree.io/f/yourFormId',
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
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        const res = await fetch(CONFIG.FORMSPREE_ENDPOINT, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (res.ok) {
          formMsg.textContent = 'Message sent — thank you!';
          form.reset();
        } else {
          formMsg.textContent = data?.error || 'Failed to send message. Check your Formspree endpoint.';
        }
      }
    } catch (err) {
      console.error(err);
      formMsg.textContent = 'An error occurred while sending.';
    }
    setTimeout(()=> formMsg.textContent = '', 6000);
  });

  // Download portfolio PDF
  const downloadButton = document.getElementById('downloadPortfolioBtn');
  const headerSection = document.querySelector('header');
  const mainSection = document.querySelector('main');
  const footerSection = document.querySelector('footer');

  async function loadAllImages(parent) {
    const images = Array.from(parent.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  }

  async function ensureHtml2pdf() {
    if (typeof html2pdf !== 'undefined') return;
    const scriptUrl = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    const existing = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existing) {
      await new Promise((resolve, reject) => {
        if (typeof html2pdf !== 'undefined') return resolve();
        existing.addEventListener('load', () => typeof html2pdf !== 'undefined' ? resolve() : reject(new Error('html2pdf did not initialize after load')));
        existing.addEventListener('error', () => reject(new Error('Failed to load html2pdf library')));
      });
    } else {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.crossOrigin = 'anonymous';
        script.onload = () => typeof html2pdf !== 'undefined' ? resolve() : reject(new Error('html2pdf did not initialize after load'));
        script.onerror = () => reject(new Error('Failed to load html2pdf library'));
        document.head.appendChild(script);
      });
    }

    if (typeof html2pdf === 'undefined') {
      throw new Error('html2pdf did not initialize');
    }
  }

  async function generatePortfolioPDF() {
    if (!mainSection) return;
    await ensureHtml2pdf();

    const pdfRoot = document.createElement('div');
    pdfRoot.className = 'pdf-export-root';
    if (headerSection) pdfRoot.appendChild(headerSection.cloneNode(true));
    pdfRoot.appendChild(mainSection.cloneNode(true));
    if (footerSection) pdfRoot.appendChild(footerSection.cloneNode(true));

    pdfRoot.querySelectorAll('#downloadPortfolioBtn, .nav-toggle, .back-top, .contact-form').forEach(el => el.remove());
    pdfRoot.querySelectorAll('button, input, textarea').forEach(el => el.remove());

    await loadAllImages(pdfRoot);

    const originalScroll = window.scrollY;
    window.scrollTo(0, 0);

    pdfRoot.style.position = 'absolute';
    pdfRoot.style.top = '-9999px';
    pdfRoot.style.left = '-9999px';
    pdfRoot.style.width = '100%';
    pdfRoot.style.maxWidth = '900px';
    pdfRoot.style.padding = '1rem';
    pdfRoot.style.background = getComputedStyle(document.body).background;
    pdfRoot.style.color = getComputedStyle(document.body).color;
    pdfRoot.style.boxSizing = 'border-box';
    document.body.appendChild(pdfRoot);

    await html2pdf().set({
      margin: [15, 15, 15, 15],
      filename: 'Muhammad_Momin_Raza_Portfolio.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        logging: false,
        allowTaint: false,
      },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }).from(pdfRoot).save();

    pdfRoot.remove();
    window.scrollTo(0, originalScroll);
  }

  downloadButton?.addEventListener('click', async () => {
    downloadButton.disabled = true;
    downloadButton.textContent = 'Preparing PDF...';
    try {
      await generatePortfolioPDF();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Unable to generate the portfolio PDF at this time.');
    } finally {
      downloadButton.disabled = false;
      downloadButton.textContent = 'Download Portfolio';
    }
  });

  // Inject current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
