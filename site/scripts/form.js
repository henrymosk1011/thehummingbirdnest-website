// Contact form: client side validation with accessible error messages, then a
// JSON post to the Worker at /api/contact. Without JavaScript the form still
// posts normally and the Worker redirects to /thanks.

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[0-9+().\s\-xX]{7,40}$/;
const FALLBACK = 'You can also email info@thehummingbirdnest.org or call (626) 765 1724.';

let turnstilePromise = null;
let siteKey = null;

function loadTurnstile() {
  if (turnstilePromise) return turnstilePromise;
  turnstilePromise = fetch('/api/config', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : {}))
    .then((cfg) => {
      siteKey = cfg && cfg.turnstileSiteKey;
      if (!siteKey) return null;
      return new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.onload = () => resolve(window.turnstile || null);
        s.onerror = () => resolve(null);
        document.head.appendChild(s);
      });
    })
    .catch(() => null);
  return turnstilePromise;
}

function validate(form) {
  const v = (name) => (form.elements[name]?.value || '').trim();
  const errors = {};
  if (!v('name')) errors.name = 'Please enter your name.';
  if (!v('email')) errors.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(v('email'))) errors.email = 'Please enter a valid email address, like name@example.com.';
  const phone = v('phone');
  if (phone && (!PHONE_RE.test(phone) || (phone.match(/\d/g) || []).length < 7)) errors.phone = 'Please enter a valid phone number, or leave this field blank.';
  if (!v('message')) errors.message = 'Please tell us a little about how we can help.';
  else if (v('message').length < 10) errors.message = 'Please add a few more details, at least 10 characters.';
  return errors;
}

function showErrors(form, errors) {
  form.querySelectorAll('[data-error-for]').forEach((el) => {
    const name = el.dataset.errorFor;
    const input = form.elements[name];
    if (errors[name]) {
      el.textContent = errors[name];
      el.hidden = false;
      input?.setAttribute('aria-invalid', 'true');
    } else {
      el.textContent = '';
      el.hidden = true;
      input?.removeAttribute('aria-invalid');
    }
  });
}

function setStatus(form, message, type = 'info') {
  const status = form.querySelector('[data-form-status]');
  status.classList.toggle('is-error', type === 'error');
  status.textContent = message;
}

export function initForms() {
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    const start = form.querySelector('[data-form-start]');
    if (start) start.value = String(Date.now());
    const submit = form.querySelector('[data-submit]');
    const label = submit.querySelector('.btn__label');
    const widgetHost = form.querySelector('[data-turnstile]');
    let widgetId = null;

    // Load the optional human check only when someone starts filling in the form.
    form.addEventListener(
      'focusin',
      () => {
        loadTurnstile().then((ts) => {
          if (!ts || !widgetHost || widgetId !== null) return;
          widgetHost.hidden = false;
          widgetId = ts.render(widgetHost, { sitekey: siteKey, theme: 'light', size: 'flexible' });
        });
      },
      { once: true }
    );

    // Clear a field's error as soon as it is fixed.
    form.addEventListener('input', (e) => {
      const name = e.target.name;
      if (!name || e.target.getAttribute('aria-invalid') !== 'true' || validate(form)[name]) return;
      const el = form.querySelector(`[data-error-for="${name}"]`);
      if (el) {
        el.textContent = '';
        el.hidden = true;
      }
      e.target.removeAttribute('aria-invalid');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submit.getAttribute('aria-disabled') === 'true') return;
      const errors = validate(form);
      showErrors(form, errors);
      const firstBad = Object.keys(errors)[0];
      if (firstBad) {
        setStatus(form, `Please check the ${Object.keys(errors).length === 1 ? 'highlighted field' : 'highlighted fields'}.`, 'error');
        form.elements[firstBad]?.focus();
        return;
      }

      submit.setAttribute('aria-disabled', 'true');
      const original = label.textContent;
      label.textContent = 'Sending';
      setStatus(form, 'Sending your message.');

      const data = Object.fromEntries(new FormData(form).entries());
      if (window.turnstile && widgetId !== null) data.turnstileToken = window.turnstile.getResponse(widgetId) || '';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.ok) {
          form.reset();
          if (start) start.value = String(Date.now());
          showErrors(form, {});
          setStatus(form, 'Thank you! Your message has been sent. We will be in touch soon.');
        } else if (out.fields) {
          showErrors(form, out.fields);
          setStatus(form, out.error || 'Please check the highlighted fields.', 'error');
          const first = Object.keys(out.fields)[0];
          form.elements[first]?.focus();
        } else {
          setStatus(form, `${out.error || 'Your message could not be sent right now.'} ${FALLBACK}`, 'error');
        }
      } catch {
        setStatus(form, `We could not reach the server. Please check your connection and try again. ${FALLBACK}`, 'error');
      } finally {
        submit.removeAttribute('aria-disabled');
        label.textContent = original;
        if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
      }
    });
  });
}
