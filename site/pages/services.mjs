import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { picture, button, link, icon, coverSizes } from '../lib/html.mjs';
import { pageHero, pageHeroPreload } from '../lib/partials.mjs';
import { webPage, serviceNode } from '../lib/seo.mjs';

export function servicesHub() {
  const path = '/services';
  const description =
    'DIR Floortime® sessions, 1:1 in school support, staff training, family and sibling sessions, and facilitated playdates in La Cañada Flintridge, CA.';
  const row = (s) => `<span class="svc-row__num" aria-hidden="true">${s.number}</span>
        <span class="svc-row__main"><span class="svc-row__title">${s.title}</span></span>
        <span class="svc-row__media">${picture(s.image, { alt: '', sizes: coverSizes(s.image, 4 / 3, '260px'), maxWidth: 800 })}</span>
        <span class="svc-row__arrow" aria-hidden="true">${icon(s.external ? 'arrow-up-right' : 'arrow')}</span>`;

  const rows = services
    .map((s) => `<li class="svc-row" data-reveal><a class="svc-row__link" href="/${s.slug}">${row({ ...s, image: s.card.image })}</a></li>`)
    .join('');

  const body = `
${pageHero({
  title: 'Services',
  actions: button('/contact', 'Contact us', { variant: 'ink' }),
  variant: 'plain',
})}

<section class="svc-list" aria-label="All services">
  <div class="container">
    <ul class="svc-rows" role="list">${rows}
      <li class="svc-row svc-row--ext" data-reveal>
        ${link(site.socialClub, row({ number: '06', title: 'The Social Club', image: 'kids-on-grass', external: true }), { className: 'svc-row__link' })}
      </li>
    </ul>
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

  const benefits = s.benefits
    ? `<section class="benefits" aria-labelledby="benefits-title" data-header-theme="dark">
    <div class="container benefits__grid">
      <div class="benefits__head">
        <h2 class="h2" id="benefits-title" data-split>${s.benefits.heading}</h2>
        <p data-reveal>${s.benefits.intro}</p>
      </div>
      <div>
        <ul class="checklist checklist--light" role="list" data-reveal-group>
          ${s.benefits.items.map((b) => `<li data-reveal>${icon('check')}<span>${b}</span></li>`).join('')}
        </ul>
        <p class="benefits__outro" data-reveal>${s.benefits.outro}</p>
      </div>
    </div>
  </section>`
    : '';

  // Photos are cropped to fill their frames and zoomed 12% for the parallax drift, so the
  // sizes hint accounts for both (otherwise a file that is too small loads and looks soft).
  const n = s.gallery?.length || 0;
  const galleryItem = (g, i) => {
    const full = n === 1 || (n === 3 && i === 0);
    const frame = full ? 21 / 9 : 3 / 2;
    const base = full ? '(min-width: 1500px) 1400px, 100vw' : '(min-width: 1500px) 700px, (min-width: 641px) 50vw, 100vw';
    return `<figure class="svc-gallery__item" data-clip>${picture(g.image, { alt: g.alt, sizes: coverSizes(g.image, frame, base, 1.12), data: { parallax: '0.08' } })}</figure>`;
  };
  const gallery = n
    ? `<section class="svc-gallery svc-gallery--${n}" aria-label="${s.title} photos">
    <div class="container svc-gallery__grid">
      ${s.gallery.map(galleryItem).join('')}
    </div>
  </section>`
    : '';

  const body = `
${pageHero({
  eyebrow: s.eyebrow || 'Services',
  title: s.title,
  image: s.hero.image,
  imageAlt: s.hero.alt,
  actions: `${button('/contact', 'Contact us', { variant: 'ink' })}${button(site.phone.href, site.phone.display, { variant: 'ghost', iconName: 'phone' })}`,
})}

<section class="svc-detail"${s.heading === s.title ? '' : ' aria-labelledby="detail-title"'}>
  <div class="container svc-detail__grid">
    <div class="svc-detail__head">
      <span class="svc-detail__num" aria-hidden="true" data-text="${s.number}"></span>
      <h2 class="h2" id="detail-title" data-split>${s.heading}</h2>
    </div>
    <div class="svc-detail__body prose" data-reveal>
      ${s.body.map((p) => `<p>${p}</p>`).join('')}
      <div class="actions">${button('/contact', 'Contact us', { variant: 'ink' })}</div>
    </div>
  </div>
</section>
${gallery}
${benefits}

<section class="related-svc" aria-labelledby="related-title">
  <div class="container">
    <h2 class="h2 related-svc__title" id="related-title" data-split>Other <em>services</em></h2>
    <ul class="mini-cards" role="list" data-reveal-group>
      ${others
        .map(
          (o) => `<li data-reveal><a class="mini-card" href="/${o.slug}">
        <span class="mini-card__media">${picture(o.card.image, { alt: '', sizes: coverSizes(o.card.image, 0.95, '(min-width: 1001px) 23vw, (min-width: 641px) 46vw, 92vw'), maxWidth: 1200 })}</span>
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
    preload: [pageHeroPreload(s.hero.image)],
    jsonld: [webPage({ path, title: s.seoTitle, description: s.description }), serviceNode(s)],
  };
}
