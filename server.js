// Simple Node/Express email relay using nodemailer
// Usage: copy .env.example -> .env and fill SMTP and RECIPIENT_EMAIL, then `npm install` and `node server.js`
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.SMTP_HOST) {
  console.warn('Warning: SMTP_* variables not set. Configure .env before using email forwarding.');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/send', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  const mail = {
    from: `${name} <${email}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Portfolio contact from ${name}`,
    text: `${message}\n\nFrom: ${name} <${email}>`
  };
  try {
    await transporter.sendMail(mail);
    res.json({ ok: true });
  } catch (err) {
    console.error('sendMail error', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => console.log(`Email relay server running on http://localhost:${PORT}`));
