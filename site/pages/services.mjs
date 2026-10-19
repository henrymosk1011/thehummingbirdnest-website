import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { picture, button, link, kicker, icon, preloadImage } from '../lib/html.mjs';
import { pageHero, sectionHead } from '../lib/partials.mjs';
import { webPage, serviceNode } from '../lib/seo.mjs';

export function servicesHub() {
  const path = '/services';
  const description =
    'Explore DIR Floortime® sessions, 1:1 in school support, staff training, family and sibling sessions, and facilitated playdates at The Hummingbird Nest in La Cañada Flintridge.';
  const rows = services
    .map(
      (s) => `<li class="svc-row" data-reveal>
      <a class="svc-row__link" href="/${s.slug}">
        <span class="svc-row__num" aria-hidden="true">${s.number}</span>
        <span class="svc-row__main">
          <span class="svc-row__title">${s.title}</span>
          <span class="svc-row__text">${s.summary}</span>
        </span>
        <span class="svc-row__media">${picture(s.card.image, { alt: '', sizes: '(min-width: 900px) 260px, 40vw', maxWidth: 800 })}</span>
        <span class="svc-row__arrow" aria-hidden="true">${icon('arrow')}</span>
      </a>
    </li>`
    )
    .join('');

  const body = `
${pageHero({
  eyebrow: 'Services',
  title: 'Support for every stage of <em>growing up.</em>',
  lead: 'From play based therapy to classroom support and staff trainings, every service is built on relationships, trust, and the belief that each child develops in their own way.',
  actions: button('/contact', 'Book a call', { variant: 'ink' }),
  variant: 'plain',
})}

<section class="svc-list" aria-label="All services">
  <div class="container">
    <ul class="svc-rows" role="list">${rows}
      <li class="svc-row svc-row--ext" data-reveal>
        ${link(
          site.socialClub,
          `<span class="svc-row__num" aria-hidden="true">06</span>
          <span class="svc-row__main">
            <span class="svc-row__title">The Social Club</span>
            <span class="svc-row__text">PEERS® social learning groups for kids, pre teens, teens, and young adults, run by our team.</span>
          </span>
          <span class="svc-row__media">${picture('kids-on-grass', { alt: '', sizes: '(min-width: 900px) 260px, 40vw', maxWidth: 800 })}</span>
          <span class="svc-row__arrow" aria-hidden="true">${icon('arrow-up-right')}</span>`,
          { className: 'svc-row__link' }
        )}
      </li>
    </ul>
  </div>
</section>

<section class="process" aria-labelledby="process-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Getting started', title: 'How it <em>works</em>', id: 'process-title' })}
    <ol class="process__list" role="list" data-reveal-group>
      <li class="process__step" data-reveal><span class="process__num" aria-hidden="true">01</span><h3>A phone call</h3><p>We talk about your family, your questions, and whether we are a good fit.</p></li>
      <li class="process__step" data-reveal><span class="process__num" aria-hidden="true">02</span><h3>Intake or observation</h3><p>We schedule an intake session in our office or an observation at your child’s school.</p></li>
      <li class="process__step" data-reveal><span class="process__num" aria-hidden="true">03</span><h3>Goals together</h3><p>After one month of consistent sessions we meet to set goals for your child and your family.</p></li>
      <li class="process__step" data-reveal><span class="process__num" aria-hidden="true">04</span><h3>Grow and revisit</h3><p>Goals are revisited and updated every six months as your child grows.</p></li>
    </ol>
  </div>
</section>`;

  return {
    path,
    title: 'Services',
    description,
    body,
    crumbs: [{ name: 'Services', path }],
    jsonld: [
      webPage({ path, title: 'Services', description, type: 'CollectionPage' }),
      {
        '@type': 'ItemList',
        '@id': `${site.url}${path}#list`,
        itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${site.url}/${s.slug}`, name: s.title })),
      },
    ],
  };
}

export function servicePage(s) {
  const path = `/${s.slug}`;
  const others = services.filter((o) => o.slug !== s.slug);

  const highlights = s.highlights?.length
    ? `<ul class="highlights" role="list" data-reveal-group>
        ${s.highlights.map((h, i) => `<li class="highlight" data-reveal><span class="highlight__num" aria-hidden="true">0${i + 1}</span><h3>${h.title}</h3><p>${h.text}</p></li>`).join('')}
      </ul>`
    : '';

  const steps = s.steps?.length
    ? `<section class="steps" aria-labelledby="steps-title">
    <div class="container">
      ${sectionHead({ eyebrow: 'The format', title: 'What a training <em>looks like</em>', id: 'steps-title' })}
      <ol class="steps__list" role="list" data-reveal-group>
        ${s.steps.map((st, i) => `<li class="step" data-reveal><span class="step__meta">${st.meta}</span><h3>${st.title}</h3><p>${st.text}</p><span class="step__num" aria-hidden="true" data-text="0${i + 1}"></span></li>`).join('')}
      </ol>
    </div>
  </section>`
    : '';

  const benefits = s.benefits?.length
    ? `<section class="benefits" aria-labelledby="benefits-title" data-header-theme="dark">
    <div class="container benefits__grid">
      <div class="benefits__head">
        ${kicker('Benefits', 'kicker--light')}
        <h2 class="h2" id="benefits-title" data-split>Skills that carry into <em>everyday life</em></h2>
        <p data-reveal>${s.benefitsIntro}</p>
      </div>
      <div>
        <ul class="checklist checklist--light" role="list" data-reveal-group>
          ${s.benefits.map((b) => `<li data-reveal>${icon('check')}<span>${b}</span></li>`).join('')}
        </ul>
        <p class="benefits__outro" data-reveal>${s.benefitsOutro}</p>
      </div>
    </div>
  </section>`
    : '';

  const gallery = s.gallery?.length
    ? `<section class="svc-gallery svc-gallery--${s.gallery.length}" aria-label="${s.title} photos">
    <div class="container svc-gallery__grid">
      ${s.gallery
        .map(
          (g) => `<figure class="svc-gallery__item${g.wide ? ' svc-gallery__item--wide' : ''}" data-clip>${picture(g.image, {
            alt: g.alt,
            sizes: s.gallery.length === 1 ? '100vw' : '(min-width: 900px) 50vw, 100vw',
            data: { parallax: '0.08' },
          })}</figure>`
        )
        .join('')}
    </div>
  </section>`
    : '';

  const body = `
${pageHero({
  eyebrow: s.eyebrow,
  title: s.title,
  lead: s.summary,
  image: s.hero.image,
  imageAlt: s.hero.alt,
  actions: `${button('/contact', 'Schedule a call', { variant: 'ink' })}${button(site.phone.href, site.phone.display, { variant: 'ghost', iconName: 'phone' })}`,
})}

<section class="svc-detail" aria-labelledby="detail-title">
  <div class="container svc-detail__grid">
    <div class="svc-detail__head">
      <span class="svc-detail__num" aria-hidden="true" data-text="${s.number}"></span>
      <h2 class="h2" id="detail-title" data-split>${s.heading}</h2>
    </div>
    <div class="svc-detail__body prose" data-reveal>
      ${s.body.map((p) => `<p>${p}</p>`).join('')}
      <div class="actions">${button('/contact', 'Schedule a call', { variant: 'ink' })}</div>
    </div>
  </div>
  ${highlights ? `<div class="container">${highlights}</div>` : ''}
</section>
${steps}
${gallery}
${benefits}

<section class="related-svc" aria-labelledby="related-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Keep exploring', title: 'Other ways we <em>can help</em>', id: 'related-title' })}
    <ul class="mini-cards" role="list" data-reveal-group>
      ${others
        .map(
          (o) => `<li data-reveal><a class="mini-card" href="/${o.slug}">
        <span class="mini-card__media">${picture(o.card.image, { alt: '', sizes: '(min-width: 1000px) 22vw, (min-width: 600px) 45vw, 90vw', maxWidth: 800 })}</span>
        <span class="mini-card__num" aria-hidden="true">${o.number}</span>
        <span class="mini-card__title">${o.title}</span>
        <span class="mini-card__arrow" aria-hidden="true">${icon('arrow')}</span>
      </a></li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;

  return {
    path,
    title: s.seoTitle,
    ogTitle: s.title,
    description: s.description,
    body,
    image: s.hero.image,
    imageAlt: s.hero.alt,
    crumbs: [
      { name: 'Services', path: '/services' },
      { name: s.title, path },
    ],
    preload: [preloadImage(s.hero.image)],
    jsonld: [webPage({ path, title: s.seoTitle, description: s.description }), serviceNode(s)],
  };
}
