# Muhammad Momin Raza — Portfolio (Local)

This repository contains a simple, responsive portfolio built with HTML, CSS, and vanilla JavaScript. It includes options to wire the contact form to a client-side service (Formspree) or to run a local Node/Express email relay using Nodemailer.

Files added/updated:
- `index.html` — site markup (hero, about, skills, projects, education, contact).
- `style.css` — styles and responsive layout.
- `script.js` — client-side behaviour, contact form integration.
- `server.js` — optional Node/Express email relay (requires .env configuration).
- `package.json` — dependencies for the optional server.
- `.env.example` — example environment variables for the server.

Quick setup

1) Open the project in VS Code.

2) Add your profile image and resume:
   - Place your photo at `assets/profile.jpg` (create the `assets` folder if missing).
   - Place your resume PDF at `assets/Muhammad_Momin_Raza_Resume.pdf`.

3) Client-side contact (Formspree)
   - Sign up at https://formspree.io and create a form; copy your form endpoint URL.
   - Open `script.js` and set `CONFIG.FORMSPREE_ENDPOINT` to your endpoint.
   - Leave `CONFIG.USE_SERVER = false`.

4) Optional: Local Node email relay
   - Copy `.env.example` to `.env` and fill SMTP_* and RECIPIENT_EMAIL.
   - Install dependencies and run the server:

```bash
cd "Momin Portfolio"
npm install
npm start
```

   - In `script.js` set `CONFIG.USE_SERVER = true` and `CONFIG.SERVER_ENDPOINT` to your server URL (e.g. `http://localhost:3000/send`).

5) Run the site locally
   - Use Live Server extension in VS Code or run a static server (Python):

```bash
python -m http.server 5500
```

Then open `http://localhost:5500/index.html` and test the form.

Notes
- The `server.js` is optional; the client-side Formspree integration requires no backend but needs a Formspree endpoint.
- Replace placeholder contact links (LinkedIn/GitHub/email) in `index.html` with your real links.
