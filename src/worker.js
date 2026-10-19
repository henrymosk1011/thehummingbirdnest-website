/**
 * The Hummingbird Nest website Worker.
 *
 * Static files in dist/ are served by Workers Static Assets. This script runs
 * first for every request (run_worker_first in wrangler.jsonc) so it can:
 *
 *   Redirect thehummingbirdnest.org to www.thehummingbirdnest.org (CANONICAL_HOST).
 *   POST /api/contact   Validate the contact form and email it through Resend.
 *   GET  /api/config    Public client config (the optional Turnstile site key).
 *   Add security headers and cache rules to every page and file.
 *
 * Configuration (Cloudflare dashboard: Workers and Pages > thehummingbirdnest > Settings > Variables and Secrets):
 *   RESEND_API_KEY        secret, required to send mail
 *   CONTACT_TO            var, inbox that receives submissions (comma separated for several)
 *   CONTACT_FROM          var, verified Resend sender, for example "The Hummingbird Nest <website@forms.thehummingbirdnest.org>"
 *   CANONICAL_HOST        var, www.thehummingbirdnest.org
 *   ALLOWED_ORIGINS       var, optional comma separated list of extra allowed origins
 *   TURNSTILE_SITE_KEY    var, optional, turns on Cloudflare Turnstile on the form
 *   TURNSTILE_SECRET_KEY  secret, optional, required when TURNSTILE_SITE_KEY is set
 */

const MAX_BODY_BYTES = 32 * 1024;
const MIN_FILL_MS = 2500; // people take longer than this to fill in the form

const SERVICES = new Set([
  'Not sure yet',
  'DIR Floortime® Sessions',
  '1:1 In School Support',
  'Staff Training',
  'Family and Sibling Sessions',
  'Facilitated Playdates',
  'The Social Club',
  'Parent coaching',
]);

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[0-9+().\s\-xX]{7,40}$/;

// Google Analytics hosts are allowed ahead of time so analytics can be switched on
// from site/config.mjs without touching this file. Turnstile is allowed for the form.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://challenges.cloudflare.com",
  "style-src 'self'",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com",
  'frame-src https://challenges.cloudflare.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // thehummingbirdnest.org -> www.thehummingbirdnest.org
    const canonical = env.CANONICAL_HOST;
    if (canonical && url.hostname !== canonical && url.hostname === canonical.replace(/^www\./, '')) {
      url.hostname = canonical;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/contact') {
      try {
        return await handleContact(request, env, url);
      } catch (err) {
        console.error('contact handler failed', err && err.stack ? err.stack : err);
        return respond(request, 500, { ok: false, error: 'Unexpected server error.' });
      }
    }

    if (url.pathname === '/api/config') {
      return json(200, { turnstileSiteKey: env.TURNSTILE_SITE_KEY || null }, { 'Cache-Control': 'public, max-age=300' });
    }

    if (url.pathname.startsWith('/api/')) {
      return json(404, { ok: false, error: 'Not found.' });
    }

    // Old Webflow paths that no longer exist.
    if (url.pathname === '/checkout' || url.pathname.startsWith('/pages/')) {
      return Response.redirect(`${url.origin}/`, 301);
    }

    const response = await env.ASSETS.fetch(request);
    return withSiteHeaders(response, url);
  },
};

function withSiteHeaders(response, url) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  const type = headers.get('Content-Type') || '';
  if (url.pathname.startsWith('/assets/')) {
    // CSS and JS URLs carry ?v=<hash> from the build, so they can be cached for a year.
    const versioned = url.searchParams.has('v') || url.pathname.startsWith('/assets/fonts/');
    headers.set('Cache-Control', versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=2592000');
  } else if (type.includes('text/html')) {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  // Keep preview URLs out of search results; only the real domain should be indexed.
  if (url.hostname.endsWith('.workers.dev')) headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handleContact(request, env, url) {
  if (request.method !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed.' }, { Allow: 'POST' });
  }

  // Only accept submissions that come from this site.
  if (!originAllowed(request, env, url)) {
    return json(403, { ok: false, error: 'Forbidden.' });
  }

  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > MAX_BODY_BYTES) {
    return respond(request, 413, { ok: false, error: 'Your message is too large.' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.CONTACT_LIMITER) {
    const { success } = await env.CONTACT_LIMITER.limit({ key: `contact:${ip}` });
    if (!success) {
      return respond(request, 429, { ok: false, error: 'Too many messages. Please try again in a minute.' });
    }
  }

  let raw;
  try {
    raw = await readBody(request);
  } catch {
    return respond(request, 400, { ok: false, error: 'Could not read your message.' });
  }

  // Bots: honeypot filled in, or the form was sent faster than a person could type.
  // Pretend success so they learn nothing.
  const startedAt = Number(raw.t || 0);
  if (clean(raw.website, 200) || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return respond(request, 200, { ok: true });
  }

  const data = {
    name: singleLine(clean(raw.name, 100)),
    email: singleLine(clean(raw.email, 254)),
    phone: singleLine(clean(raw.phone, 40)),
    service: singleLine(clean(raw.service, 60)) || 'Not sure yet',
    age: singleLine(clean(raw.age, 20)),
    message: clean(raw.message, 5000),
  };

  const fields = validate(data);
  if (Object.keys(fields).length) {
    return respond(request, 422, { ok: false, error: 'Please check the highlighted fields.', fields });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const token = clean(raw.turnstileToken || raw['cf-turnstile-response'], 2048);
    const passed = token && (await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY));
    if (!passed) {
      return respond(request, 400, { ok: false, error: 'We could not verify that you are human. Please try again.' });
    }
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    console.error('Contact form is not configured: set RESEND_API_KEY, CONTACT_TO and CONTACT_FROM.');
    return respond(request, 503, { ok: false, error: 'The contact form is not available right now.' });
  }

  const sent = await sendEmail(env, data);
  if (!sent) {
    return respond(request, 502, { ok: false, error: 'Your message could not be delivered.' });
  }

  return respond(request, 200, { ok: true });
}

function originAllowed(request, env, url) {
  const origin = request.headers.get('Origin');
  if (!origin) {
    // Older browsers may omit Origin on same origin form posts; fall back to Sec-Fetch-Site.
    const site = request.headers.get('Sec-Fetch-Site');
    return !site || site === 'same-origin' || site === 'none';
  }
  const allowed = new Set([url.origin]);
  (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((o) => allowed.add(o));
  return allowed.has(origin);
}

async function readBody(request) {
  const type = (request.headers.get('Content-Type') || '').toLowerCase();
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error('too large');
  if (type.includes('application/json')) {
    const parsed = JSON.parse(text || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad json');
    return parsed;
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(text));
  }
  throw new Error('unsupported content type');
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // Drop control characters except tab and newline, normalize line endings, trim.
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function singleLine(value) {
  return value.replace(/\s+/g, ' ');
}

function validate(d) {
  const f = {};
  if (!d.name) f.name = 'Please enter your name.';
  if (!d.email) f.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(d.email)) f.email = 'Please enter a valid email address, like name@example.com.';
  if (d.phone && (!PHONE_RE.test(d.phone) || (d.phone.match(/\d/g) || []).length < 7)) {
    f.phone = 'Please enter a valid phone number, or leave this field blank.';
  }
  if (!SERVICES.has(d.service)) d.service = 'Not sure yet';
  if (!d.message) f.message = 'Please tell us a little about how we can help.';
  else if (d.message.length < 10) f.message = 'Please add a few more details, at least 10 characters.';
  return f;
}

async function verifyTurnstile(token, ip, secret) {
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (ip && ip !== 'unknown') body.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const out = await res.json();
    return Boolean(out && out.success);
  } catch (err) {
    console.error('turnstile verification failed', err);
    return false;
  }
}

async function sendEmail(env, d) {
  const when = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'short' });
  const rows = [
    ['Name', d.name],
    ['Email', d.email],
    ['Phone', d.phone || 'Not provided'],
    ['Interested in', d.service],
    ['Child’s age', d.age || 'Not provided'],
  ];
  const text = ['New message from thehummingbirdnest.org', '', ...rows.map(([k, v]) => `${k}: ${v}`), '', 'Message:', d.message, '', `Sent ${when} (Pacific)`].join('\n');
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f7f5f0;font-family:Arial,Helvetica,sans-serif;color:#0d2024">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px">
    <tr><td style="padding:28px 28px 8px">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#4a5f63">Website contact form</p>
      <h1 style="margin:0;font-size:24px;line-height:1.2">New message from ${esc(d.name)}</h1>
    </td></tr>
    <tr><td style="padding:16px 28px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#4a5f63;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;font-weight:bold">${esc(v)}</td></tr>`).join('')}
      </table>
    </td></tr>
    <tr><td style="padding:8px 28px 28px">
      <p style="margin:0 0 8px;color:#4a5f63;font-size:13px;letter-spacing:1px;text-transform:uppercase">Message</p>
      <div style="font-size:16px;line-height:1.6;white-space:pre-wrap">${esc(d.message)}</div>
      <p style="margin:24px 0 0;color:#4a5f63;font-size:13px">Sent ${esc(when)} (Pacific). Reply to this email to respond directly.</p>
    </td></tr>
  </table></body></html>`;

  const to = env.CONTACT_TO.split(',').map((s) => s.trim()).filter(Boolean);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `thn-${crypto.randomUUID()}`,
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to,
      reply_to: d.email,
      subject: `New website message from ${d.name}`,
      text,
      html,
      tags: [{ name: 'source', value: 'website_contact' }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('resend send failed', res.status, detail.slice(0, 500));
    return false;
  }
  return true;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function wantsJson(request) {
  const type = (request.headers.get('Content-Type') || '').toLowerCase();
  const accept = (request.headers.get('Accept') || '').toLowerCase();
  return type.includes('application/json') || accept.includes('application/json');
}

// JSON for the script powered form; a redirect or a simple page when the form posts without JavaScript.
function respond(request, status, payload) {
  if (wantsJson(request)) return json(status, payload);
  if (payload.ok) {
    return new Response(null, { status: 303, headers: { Location: '/thanks', 'Cache-Control': 'no-store' } });
  }
  const msg = esc(payload.error || 'Something went wrong.');
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Message not sent | The Hummingbird Nest</title><link rel="stylesheet" href="/assets/css/main.css"></head><body><main id="main" class="system"><div class="container system__inner"><h1 class="page-hero__title">Message not sent.</h1><p class="lead">${msg} You can also email <a href="mailto:info@thehummingbirdnest.org">info@thehummingbirdnest.org</a> or call <a href="tel:+16267651724">(626) 765 1724</a>.</p><p><a class="text-link" href="/contact">Back to the contact form</a></p></div></main></body></html>`;
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS },
  });
}

function json(status, payload, extra = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      ...extra,
    },
  });
}
