import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { testimonials, faqs } from '../data/content.mjs';
import { esc, icon, picture, button, link, kicker, formatDate } from './html.mjs';

/** Inner page hero: big title, optional lead, actions, and a wide image that opens up on scroll. */
export function pageHero({ eyebrow, title, lead, image, imageAlt = '', actions = '', id = 'page-title', variant = '' }) {
  return `<section class="page-hero${variant ? ' page-hero--' + variant : ''}" aria-labelledby="${id}">
  <div class="container page-hero__head">
    ${eyebrow ? kicker(eyebrow) : ''}
    <h1 class="page-hero__title" id="${id}" data-split>${title}</h1>
    ${lead || actions ? `<div class="page-hero__meta" data-reveal>${lead ? `<p class="lead">${lead}</p>` : ''}${actions ? `<div class="actions">${actions}</div>` : ''}</div>` : ''}
  </div>
  ${
    image
      ? `<div class="page-hero__media" data-hero-reveal>
    <div class="page-hero__frame">${picture(image, { alt: imageAlt, sizes: '100vw', priority: true, imgClass: 'page-hero__img', data: { parallax: '0.12' } })}</div>
  </div>`
      : ''
  }
</section>`;
}

/** Article and listing cards. */
export function postCard(post, { featured = false, headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `<article class="post-card${featured ? ' post-card--featured' : ''}" data-reveal>
  <a class="post-card__link" href="/post/${post.slug}">
    <div class="post-card__media">${picture(post.image, { alt: '', sizes: featured ? '(min-width: 900px) 60vw, 100vw' : '(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 100vw', maxWidth: 1200 })}</div>
    <div class="post-card__body">
      <p class="post-card__meta"><span class="tag">${post.categoryName}</span><span>${post.minutes} min read</span></p>
      <${h} class="post-card__title">${esc(post.title)}</${h}>
      ${featured ? `<p class="post-card__excerpt">${esc(post.description)}</p>` : ''}
      <span class="post-card__cta">Read article ${icon('arrow')}</span>
    </div>
  </a>
</article>`;
}

/** Testimonials as an accessible horizontal carousel (native scroll snap plus buttons). */
export function testimonialsSection({ title = 'Words from our <em>families</em>' } = {}) {
  const total = String(testimonials.length).padStart(2, '0');
  return `<section class="quotes" aria-labelledby="quotes-title" data-carousel>
  <div class="container quotes__head">
    <div>
      ${kicker('Testimonials')}
      <h2 class="h2" id="quotes-title" data-split>${title}</h2>
    </div>
    <div class="quotes__controls">
      <div class="quotes__count" aria-hidden="true"><span data-carousel-current>01</span> / ${total}</div>
      <button class="round-btn" type="button" data-carousel-prev aria-label="Previous testimonial">${icon('arrow-left')}</button>
      <button class="round-btn" type="button" data-carousel-next aria-label="Next testimonial">${icon('arrow')}</button>
    </div>
  </div>
  <div class="quotes__viewport" data-carousel-track data-lenis-prevent-horizontal tabindex="0" role="region" aria-roledescription="carousel" aria-label="Testimonials, scroll sideways or use the buttons to see more">
    <div class="quotes__track">
      ${testimonials
        .map(
          (t, i) => `<div class="quote-card" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${testimonials.length}" data-carousel-slide>
        <figure>
          ${icon('quote', { className: 'quote-card__mark' })}
          <blockquote>${esc(t.quote)}</blockquote>
          <figcaption>${esc(t.name)}<span>Parent</span></figcaption>
        </figure>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

export function faqSection({ id = 'faq' } = {}) {
  return `<section class="faq" id="${id}" aria-labelledby="${id}-title">
  <div class="container faq__grid">
    <div class="faq__intro">
      ${kicker('FAQ')}
      <h2 class="h2" id="${id}-title" data-split>Questions families <em>often ask</em></h2>
      <p data-reveal>Still wondering about something? We are always happy to talk it through.</p>
      <div data-reveal>${button(`mailto:${site.email}`, 'Email us a question', { variant: 'ink', iconName: 'mail' })}</div>
    </div>
    <div class="faq__list" data-reveal>
      ${faqs
        .map(
          (f) => `<details class="faq__item" data-accordion>
        <summary><span>${esc(f.q)}</span><span class="faq__icon" aria-hidden="true">${icon('plus')}</span></summary>
        <div class="faq__answer"><div>${f.html}</div></div>
      </details>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

const SERVICE_OPTIONS = ['Not sure yet', ...services.map((s) => s.menuTitle), 'The Social Club', 'Parent coaching'];

/** Contact form. Posts to the Worker at /api/contact; works without JavaScript too. */
export function contactForm({ id = 'contact-form', compact = false } = {}) {
  return `<form class="form${compact ? ' form--compact' : ''}" id="${id}" action="/api/contact" method="post" novalidate data-contact-form>
  <p class="form__note" id="${id}-required">Fields marked <span aria-hidden="true">*</span><span class="visually-hidden">with an asterisk</span> are required.</p>
  <div class="form__grid">
    ${field({ id, name: 'name', label: 'Your name', autocomplete: 'name', required: true })}
    ${field({ id, name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true, inputmode: 'email' })}
    ${field({ id, name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', inputmode: 'tel', hint: 'Optional' })}
    ${field({ id, name: 'age', label: 'Child’s age', autocomplete: 'off', hint: 'Optional', maxlength: 20 })}
    <div class="field field--full">
      <label for="${id}-service">I am interested in</label>
      <div class="select">
        <select id="${id}-service" name="service">
          ${SERVICE_OPTIONS.map((o) => `<option>${esc(o)}</option>`).join('')}
        </select>
        ${icon('chevron')}
      </div>
    </div>
    <div class="field field--full">
      <label for="${id}-message">How can we help? <span class="req" aria-hidden="true">*</span></label>
      <textarea id="${id}-message" name="message" rows="${compact ? 4 : 5}" required aria-required="true" maxlength="5000" aria-describedby="${id}-message-hint ${id}-message-error"></textarea>
      <p class="field__hint" id="${id}-message-hint">Please do not include any Protected Health Information (PHI), such as diagnoses, medical records, or insurance details.</p>
      <p class="field__error" id="${id}-message-error" data-error-for="message" hidden></p>
    </div>
  </div>
  <div class="form__trap" aria-hidden="true">
    <label for="${id}-website">Leave this field empty</label>
    <input id="${id}-website" name="website" type="text" tabindex="-1" autocomplete="off">
  </div>
  <input type="hidden" name="t" value="" data-form-start>
  <div class="form__turnstile" data-turnstile hidden></div>
  <div class="form__footer">
    <button class="btn btn--ink" type="submit" data-submit>
      <span class="btn__label">Send message</span><span class="btn__icon" aria-hidden="true">${icon('arrow')}${icon('arrow')}</span>
    </button>
    <p class="form__legal">By sending this form you agree to our <a href="/privacy-policy">Privacy Policy</a>.</p>
  </div>
  <div class="form__status" role="status" aria-live="polite" data-form-status></div>
</form>`;
}

function field({ id, name, label, type = 'text', autocomplete, required = false, hint, inputmode, maxlength }) {
  const fid = `${id}-${name}`;
  const described = [hint ? `${fid}-hint` : '', `${fid}-error`].filter(Boolean).join(' ');
  return `<div class="field">
      <label for="${fid}">${label}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}${hint ? ` <span class="field__opt" id="${fid}-hint">(${hint.toLowerCase()})</span>` : ''}</label>
      <input id="${fid}" name="${name}" type="${type}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${inputmode ? ` inputmode="${inputmode}"` : ''}${required ? ' required aria-required="true"' : ''} maxlength="${maxlength || (name === 'email' ? 254 : 100)}" aria-describedby="${described}">
      <p class="field__error" id="${fid}-error" data-error-for="${name}" hidden></p>
    </div>`;
}

/** Address, phone, email and booking link. */
export function contactDetails() {
  return `<ul class="contact-list" role="list">
    <li>${icon('pin')}<div><span class="contact-list__label">Visit</span>${link(site.address.mapUrl, `${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}`)}</div></li>
    <li>${icon('phone')}<div><span class="contact-list__label">Call</span><a href="${site.phone.href}">${site.phone.display}</a></div></li>
    <li>${icon('mail')}<div><span class="contact-list__label">Email</span><a href="mailto:${site.email}">${site.email}</a></div></li>
    <li>${icon('calendar')}<div><span class="contact-list__label">Book</span>${link(site.booking, 'Schedule an appointment online')}</div></li>
  </ul>`;
}

export function sectionHead({ eyebrow, title, text, id, align = '' }) {
  return `<div class="section-head${align ? ' section-head--' + align : ''}">
    ${eyebrow ? kicker(eyebrow) : ''}
    <h2 class="h2" id="${id}" data-split>${title}</h2>
    ${text ? `<p class="section-head__text" data-reveal>${text}</p>` : ''}
  </div>`;
}

export const postDate = (iso) => `<time datetime="${iso}">${formatDate(iso)}</time>`;
