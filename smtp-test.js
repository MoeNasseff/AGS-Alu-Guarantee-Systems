const nodemailer = require('nodemailer');

const HOST = 'send.one.com';
const USER = 'w.azzam@ags-aluminum.com';
const PASS = 'paB6AVAgATlZJGCh@itags_@WAzzam';
const FROM = 'w.azzam@ags-aluminum.com';
const TO = 'nerdx.eg@gmail.com';
const SUBJECT = 'SMTP test';
const TEXT = 'Hello from SMTP test';

// Ordered attempts: TLS 587, SSL 465, plain 25
const ATTEMPTS = [
  { port: 587, secure: false, label: 'TLS 587' },
  { port: 465, secure: true, label: 'SSL 465' },
  { port: 25, secure: false, label: 'Plain 25' },
];

const TIMEOUT_MS = 20000; // per attempt
const RETRIES_PER_ATTEMPT = 2;

async function sendOnce({ port, secure, label }) {
  const transport = nodemailer.createTransport({
    host: HOST,
    port,
    secure,
    auth: { user: USER, pass: PASS },
    tls: { rejectUnauthorized: false },
  });

  const sendPromise = transport.sendMail({ from: FROM, to: TO, subject: SUBJECT, text: TEXT });

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`timeout after ${TIMEOUT_MS}ms (${label})`)), TIMEOUT_MS)
  );

  return Promise.race([sendPromise, timeout]);
}

async function tryAttempt(cfg) {
  for (let i = 0; i < RETRIES_PER_ATTEMPT; i++) {
    try {
      console.log(`Trying ${cfg.label}, attempt ${i + 1}/${RETRIES_PER_ATTEMPT}...`);
      const info = await sendOnce(cfg);
      console.log(`Success via ${cfg.label}:`, info.messageId || info.response || info);
      return true;
    } catch (err) {
      console.error(`Failed ${cfg.label} attempt ${i + 1}:`, err.message);
    }
  }
  return false;
}

async function main() {
  for (const cfg of ATTEMPTS) {
    const ok = await tryAttempt(cfg);
    if (ok) return;
  }
  console.error('All SMTP attempts failed.');
}

main().catch((err) => {
  console.error('Unhandled error:', err);
});
