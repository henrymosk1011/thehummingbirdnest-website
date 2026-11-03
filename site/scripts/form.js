// Contact form: client side validation with accessible error messages, then a JSON
// post to FormSubmit's AJAX endpoint (data-endpoint on the form), which emails it to
// the practice. Without JavaScript the form still posts normally to FormSubmit, which
// shows a quick check and then returns the visitor to /thanks.

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[0-9+().\s\-xX]{7,40}$/;
const FALLBACK = 'You can also email info@thehummingbirdnest.org or call (626) 765 1724.';
const MIN_FILL_MS = 2500; // people take longer than this to fill in the form

function validate(form) {
  const v = (name) => (form.elements[name]?.value || '').trim();
  const errors = {};
  if (!v('name')) errors.name = 'Please enter your name.';
  if (!v('email')) errors.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(v('email'))) errors.email = 'Please enter a valid email address, like name@example.com.';
  const phone = v('phone');
  if (phone && (!PHONE_RE.test(phone) || (phone.match(/\d/g) || []).length < 7)) errors.phone = 'Please enter a valid phone number, or leave this field blank.';
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

// Only these fields are sent, under readable names, so the email is a tidy table and
// nothing else on the page (and never health information) can ride along.
function payload(form) {
  const v = (name) => (form.elements[name]?.value || '').trim().replace(/\s+/g, ' ');
  return {
    Name: v('name'),
    Email: v('email'),
    Phone: v('phone') || 'Not provided',
    'Interested in': v('service') || 'Not sure yet',
    _subject: `New website contact request from ${v('name')}`,
    _replyto: v('email'),
    _template: 'table',
    _captcha: 'false',
  };
}

export function initForms() {
  document.querySelectorAll('[data-contact-form]').forEach((form) => {
    const submit = form.querySelector('[data-submit]');
    const label = submit.querySelector('.btn__label');
    let startedAt = Date.now();

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

    const succeed = () => {
      form.reset();
      startedAt = Date.now();
      showErrors(form, {});
      setStatus(form, 'Thank you! Your submission has been received!');
    };

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

      // Bots: honeypot filled in, or sent faster than a person could type. Pretend it worked.
      if (form.elements._honey?.value || Date.now() - startedAt < MIN_FILL_MS) {
        succeed();
        return;
      }

      submit.setAttribute('aria-disabled', 'true');
      const original = label.textContent;
      label.textContent = 'Sending';
      setStatus(form, 'Sending.');

      try {
        const res = await fetch(form.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload(form)),
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && String(out.success) === 'true') succeed();
        else setStatus(form, `Oops! Something went wrong while submitting the form. ${FALLBACK}`, 'error');
      } catch {
        setStatus(form, `We could not reach the server. Please check your connection and try again. ${FALLBACK}`, 'error');
      } finally {
        submit.removeAttribute('aria-disabled');
        label.textContent = original;
      }
    });
  });
}
