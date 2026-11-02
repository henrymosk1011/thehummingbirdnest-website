import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { testimonials, faqs } from '../data/content.mjs';
import { esc, icon, picture, button, link, kicker, formatDate, coverSizes, preloadImage } from './html.mjs';

// The page hero frame is 21:9 and the photo is zoomed 12% for the parallax drift.
export const pageHeroSizes = (image) => coverSizes(image, 21 / 9, '(min-width: 1500px) 1400px, 100vw', 1.12);
export const pageHeroPreload = (image) => preloadImage(image, pageHeroSizes(image));

/** Inner page hero: big title, optional lead, actions, and a wide image that opens up on scroll. */
export function pageHero({ eyebrow, title, lead, image, imageAlt = '', actions = '', id = 'page-title', variant = '' }) {
  const sizes = image ? pageHeroSizes(image) : '';
  return `<section class="page-hero${variant ? ' page-hero--' + variant : ''}" aria-labelledby="${id}">
  <div class="container page-hero__head">
    ${eyebrow ? kicker(eyebrow) : ''}
    <h1 class="page-hero__title" id="${id}" data-split>${title}</h1>
    ${lead || actions ? `<div class="page-hero__meta" data-reveal>${lead ? `<p class="lead">${lead}</p>` : ''}${actions ? `<div class="actions">${actions}</div>` : ''}</div>` : ''}
  </div>
  ${
    image
      ? `<div class="page-hero__media" data-hero-reveal>
    <div class="page-hero__frame">${picture(image, { alt: imageAlt, sizes, priority: true, imgClass: 'page-hero__img', data: { parallax: '0.12' } })}</div>
  </div>`
      : ''
  }
</section>`;
}

/** Article cards. The photo frame is 4:5 in grids and 4:3 in the carousel. */
export function postCard(post, { headingLevel = 3, frame = 4 / 5, sizes = '(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 100vw', reveal = true } = {}) {
  const h = `h${headingLevel}`;
  return `<article class="post-card"${reveal ? ' data-reveal' : ''}>
  <a class="post-card__link" href="/post/${post.slug}">
    <div class="post-card__media">${picture(post.image, { alt: '', sizes: coverSizes(post.image, frame, sizes), maxWidth: 1200 })}</div>
    <div class="post-card__body">
      <p class="post-card__meta"><span class="tag">${post.categoryName}</span><span>${post.minutes} min read</span></p>
      <${h} class="post-card__title">${esc(post.title)}</${h}>
      <span class="post-card__cta">Read more ${icon('arrow')}</span>
    </div>
  </a>
</article>`;
}

/**
 * Blog posts in a carousel, with category tabs. Each tab is its own page (/resources and the
 * original /blog-categories/ addresses), so the tabs work without JavaScript and keep their rankings.
 */
export function blogCarousel(posts, { active = 'all', categories, headingLevel = 3, label = 'Blog posts' }) {
  const tabs = [{ id: 'all', name: 'All', path: '/resources#blog' }, ...categories];
  const total = String(posts.length).padStart(2, '0');
  return `<div class="blog-carousel" data-carousel>
  <div class="blog-carousel__bar">
    <nav class="filters" aria-label="Blog categories">
      <ul role="list">
        ${tabs.map((c) => `<li><a class="filter${c.id === active ? ' is-active' : ''}" href="${c.path}"${c.id === active ? ' aria-current="page"' : ''}>${c.name}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="carousel-controls">
      <div class="carousel-controls__count" aria-hidden="true"><span data-carousel-current>01</span> / ${total}</div>
      <button class="round-btn" type="button" data-carousel-prev aria-label="Previous posts">${icon('arrow-left')}</button>
      <button class="round-btn" type="button" data-carousel-next aria-label="Next posts">${icon('arrow')}</button>
    </div>
  </div>
  <div class="blog-carousel__viewport" data-carousel-track data-lenis-prevent-horizontal tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(label)}, scroll sideways or use the buttons to see more">
    <div class="blog-carousel__track">
      ${posts
        .map(
          (p, i) => `<div class="blog-carousel__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${posts.length}" data-carousel-slide>
        ${postCard(p, { headingLevel, frame: 4 / 3, sizes: '(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 86vw', reveal: false })}
      </div>`
        )
        .join('')}
    </div>
  </div>
</div>`;
}

/** Testimonials in a simple grid (no carousel). */
export function testimonialsSection() {
  return `<section class="quotes" aria-labelledby="quotes-title">
  <div class="container">
    <h2 class="h2 quotes__title" id="quotes-title" data-split>Testimonials</h2>
    <ul class="quotes__grid" role="list">
      ${testimonials
        .map(
          (t) => `<li class="quote-card" data-reveal>
        <figure>
          ${icon('quote', { className: 'quote-card__mark' })}
          <blockquote>${esc(t.quote)}</blockquote>
          <figcaption>${esc(t.name)}</figcaption>
        </figure>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

export function faqSection({ id = 'faq' } = {}) {
  return `<section class="faq" id="${id}" aria-labelledby="${id}-title">
  <div class="container faq__grid">
    <div class="faq__intro">
      <h2 class="h2" id="${id}-title" data-split>Frequently Asked <em>Questions</em></h2>
      <div data-reveal>${button(`mailto:${site.email}`, 'Email us', { variant: 'ink', iconName: 'mail' })}</div>
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

// What the "I am interested in" menu offers. The value is what the Worker receives; it turns it
// back into a readable name for the email (see SERVICES in src/worker.js).
export const SERVICE_OPTIONS = [
  { value: 'not-sure', label: 'Not sure yet' },
  ...services.map((s) => ({ value: s.slug, label: s.menuTitle })),
  { value: 'social-club', label: 'The Social Club' },
  { value: 'parent-coaching', label: 'Parent coaching' },
];

/**
 * Contact form. Posts to the Worker at /api/contact; works without JavaScript too.
 * It only asks for contact details and a service, never health information: the form
 * runs on services that do not sign a HIPAA Business Associate Agreement (see DEPLOY.md).
 */
export function contactForm({ id = 'contact-form' } = {}) {
  return `<form class="form" id="${id}" action="/api/contact" method="post" novalidate data-contact-form>
  <p class="form__note" id="${id}-required">Fields marked <span aria-hidden="true">*</span><span class="visually-hidden">with an asterisk</span> are required.</p>
  <div class="form__grid">
    ${field({ id, name: 'name', label: 'Your name', autocomplete: 'name', required: true })}
    ${field({ id, name: 'email', label: 'Email', type: 'email', autocomplete: 'email', required: true, inputmode: 'email' })}
    ${field({ id, name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', inputmode: 'tel', hint: 'Optional' })}
    <div class="field">
      <label for="${id}-service">I am interested in</label>
      <div class="select">
        <select id="${id}-service" name="service">
          ${SERVICE_OPTIONS.map((o) => `<option value="${o.value}">${esc(o.label)}</option>`).join('')}
        </select>
        ${icon('chevron')}
      </div>
    </div>
  </div>
  <p class="form__phi">${icon('shield')}<span>Please do not submit any Protected Health Information (PHI).</span></p>
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

/** Address, phone, email and the Calendly booking link. */
export function contactDetails() {
  return `<ul class="contact-list" role="list">
    <li>${icon('pin')}<div><span class="contact-list__label">Address</span>${link(site.address.mapUrl, `${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}`)}</div></li>
    <li>${icon('phone')}<div><span class="contact-list__label">Phone</span><a href="${site.phone.href}">${site.phone.display}</a></div></li>
    <li>${icon('mail')}<div><span class="contact-list__label">Email</span><a href="mailto:${site.email}">${site.email}</a></div></li>
    <li>${icon('calendar')}<div><span class="contact-list__label">Book online</span>${link(site.booking, site.bookingLabel)}</div></li>
  </ul>`;
}

/** "Get in Touch": the contact form at the foot of every page, as on the original site. */
export function getInTouch({ id = 'footer-form' } = {}) {
  return `<section class="contact-block" id="contact" aria-labelledby="contact-title">
  <div class="container contact-block__grid">
    <div class="contact-block__intro">
      <h2 class="h2" id="contact-title" data-split>Get in <em>Touch</em></h2>
      <p data-reveal>Enter your contact information below</p>
      <div data-reveal>${contactDetails()}</div>
    </div>
    <div class="contact-block__form" data-reveal>
      ${contactForm({ id })}
    </div>
  </div>
</section>`;
}

export function sectionHead({ eyebrow, title, text, id, align = '' }) {
  return `<div class="section-head${align ? ' section-head--' + align : ''}">
    ${eyebrow ? kicker(eyebrow) : ''}
    <h2 class="h2" id="${id}" data-split>${title}</h2>
    ${text ? `<p class="section-head__text" data-reveal>${text}</p>` : ''}
  </div>`;
}

export const postDate = (iso) => `<time datetime="${iso}">${formatDate(iso)}</time>`;
