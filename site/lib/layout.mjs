import { site, nav } from '../config.mjs';
import { services } from '../data/services.mjs';
import { esc, attrs, icon, picture, button, link } from './html.mjs';
import { organizationGraph } from './seo.mjs';

/**
 * Wraps page content in the full document.
 *
 * page: {
 *   path, title, description, body,
 *   image?: image name for social cards, ogType?, noindex?,
 *   jsonld?: array of schema objects for this page,
 *   crumbs?: [{ name, path }], footerCta?: boolean, bodyClass?
 * }
 */
export function renderPage(page, build) {
  const canonical = site.url + (page.path === '/' ? '/' : page.path);
  const fullTitle = page.title === site.name ? `${site.name} | DIR Floortime® in La Cañada Flintridge` : `${page.title} | ${site.name}`;
  const ogImage = page.image ? `${site.url}/assets/img/${page.image}-og.jpg` : `${site.url}/assets/img/og-default.jpg`;
  const graph = [...organizationGraph(), ...(page.jsonld || [])];
  if (page.crumbs?.length) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [{ name: 'Home', path: '/' }, ...page.crumbs].map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: site.url + (c.path === '/' ? '/' : c.path),
      })),
    });
  }
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  const ga = site.analytics.gaMeasurementId;

  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.imageAlt || site.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImage}">
${page.ogType === 'article' && page.published ? `<meta property="article:published_time" content="${page.published}">\n` : ''}<meta name="theme-color" content="#f7f5f0">
<meta name="format-detection" content="telephone=no">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">\n` : ''}<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/jakarta-latin.woff2" as="font" type="font/woff2" crossorigin>
${(page.preload || []).join('\n')}${page.preload?.length ? '\n' : ''}<link rel="stylesheet" href="/assets/css/main.css?v=${build.hash}">
<script type="module" src="/assets/js/main.js?v=${build.hash}"></script>
${ga ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(ga)}"></script>\n<script src="/assets/js/analytics.js?v=${build.hash}" data-ga="${esc(ga)}" defer></script>\n` : ''}<script type="application/ld+json">${ld}</script>
</head>
<body${attrs({ class: page.bodyClass })}>
<a class="skip-link" href="#main">Skip to main content</a>
${header(page)}
<main id="main" tabindex="-1">
${page.crumbs?.length && !page.hideCrumbs ? breadcrumbs(page.crumbs) : ''}${page.body}
</main>
${footer(page)}
</body>
</html>
`;
}

function isCurrent(page, href) {
  if (href === '/') return page.path === '/';
  if (href === '/services') return page.path === '/services' || page.path.startsWith('/services-');
  if (href === '/blog') return page.path === '/blog' || page.path.startsWith('/post/') || page.path.startsWith('/blog-categories/');
  return page.path === href;
}

function header(page) {
  const items = nav
    .map((item) => {
      const current = isCurrent(page, item.href);
      if (item.mega) {
        return `<li class="nav__item nav__item--mega" data-mega>
          <a class="nav__link" href="${item.href}"${current ? ' aria-current="page"' : ''}>${item.label}</a>
          <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="mega-services" data-mega-toggle>
            <span class="visually-hidden">Show ${item.label.toLowerCase()} menu</span>${icon('chevron')}
          </button>
          ${megaMenu()}
        </li>`;
      }
      return `<li class="nav__item"><a class="nav__link" href="${item.href}"${current ? ' aria-current="page"' : ''}>${item.label}</a></li>`;
    })
    .join('\n');

  return `<header class="site-header" data-header>
  <div class="site-header__bar">
    <a class="brand" href="/" aria-label="${esc(site.name)} home">
      <img class="brand__logo brand__logo--dark" src="/assets/img/logo-dark-560.webp" width="280" height="69" alt="${esc(site.name)}">
      <img class="brand__logo brand__logo--light" src="/assets/img/logo-light-560.webp" width="280" height="66" alt="" aria-hidden="true">
    </a>
    <nav class="nav" aria-label="Main">
      <ul class="nav__list" role="list">
        ${items}
        <li class="nav__item">${link(site.socialClub, `The Social Club ${icon('arrow-up-right')}`, { className: 'nav__link nav__link--ext' })}</li>
      </ul>
    </nav>
    <div class="site-header__actions">
      ${button('/contact', 'Book a call', { variant: 'ink', size: 'sm', className: 'site-header__cta' })}
      <button class="menu-button" type="button" aria-haspopup="dialog" aria-controls="mobile-menu" data-menu-open>
        <span class="menu-button__label">Menu</span>
      </button>
    </div>
  </div>
</header>
${mobileMenu(page)}`;
}

function megaMenu() {
  const list = services
    .map(
      (s) => `<li>
        <a class="mega__link" href="/${s.slug}">
          ${picture(s.card.image, { alt: '', sizes: '96px', className: 'mega__thumb', maxWidth: 480 })}
          <span class="mega__text"><span class="mega__title">${s.menuTitle}</span><span class="mega__desc">${s.eyebrow}</span></span>
        </a>
      </li>`
    )
    .join('');
  return `<div class="mega" id="mega-services" data-mega-panel hidden>
    <div class="mega__inner">
      <ul class="mega__list" role="list">${list}</ul>
      <div class="mega__aside">
        <p class="mega__aside-title">Not sure where to start?</p>
        <p class="mega__aside-text">A short phone call helps us understand your family and recommend the right next step.</p>
        ${button('/contact', 'Book a call', { variant: 'ink', size: 'sm' })}
        <a class="mega__all" href="/services">View all services ${icon('arrow')}</a>
      </div>
    </div>
  </div>`;
}

function mobileMenu(page) {
  const links = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];
  return `<dialog class="mobile-menu" id="mobile-menu" aria-label="Menu" data-menu>
  <div class="mobile-menu__inner">
    <div class="mobile-menu__top">
      <a class="brand" href="/" aria-label="${esc(site.name)} home"><img class="brand__logo" src="/assets/img/logo-light-560.webp" width="280" height="66" alt="${esc(site.name)}"></a>
      <button class="menu-button menu-button--close" type="button" data-menu-close><span class="menu-button__label">Close</span></button>
    </div>
    <nav aria-label="Mobile">
      <ul class="mobile-menu__list" role="list">
        ${links
          .map((l, i) => `<li><a href="${l.href}"${isCurrent(page, l.href) ? ' aria-current="page"' : ''}><span class="mobile-menu__num" aria-hidden="true">0${i + 1}</span>${l.label}</a></li>`)
          .join('')}
      </ul>
      <ul class="mobile-menu__sub" role="list">
        ${services.map((s) => `<li><a href="/${s.slug}">${s.menuTitle}</a></li>`).join('')}
        <li>${link(site.socialClub, `The Social Club ${icon('arrow-up-right')}`)}</li>
      </ul>
    </nav>
    <div class="mobile-menu__contact">
      <a href="${site.phone.href}">${icon('phone')} ${site.phone.display}</a>
      <a href="mailto:${site.email}">${icon('mail')} ${site.email}</a>
    </div>
  </div>
</dialog>`;
}

function breadcrumbs(crumbs) {
  const all = [{ name: 'Home', path: '/' }, ...crumbs];
  return `<nav class="crumbs container" aria-label="Breadcrumb"><ol role="list">${all
    .map((c, i) =>
      i === all.length - 1
        ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
        : `<li><a href="${c.path}">${esc(c.name)}</a>${icon('chevron-right', { className: 'icon crumbs__sep' })}</li>`
    )
    .join('')}</ol></nav>\n`;
}

function footer(page) {
  const year = new Date().getFullYear();
  const cta =
    page.footerCta === false
      ? ''
      : `<section class="footer-cta" aria-labelledby="footer-cta-title">
    <div class="container footer-cta__inner">
      <p class="kicker kicker--light">Let’s talk</p>
      <h2 class="footer-cta__title" id="footer-cta-title" data-split>Every journey starts with <em>one conversation.</em></h2>
      <div class="footer-cta__actions" data-reveal>
        ${button('/contact', 'Book a call', { variant: 'light' })}
        ${link(site.phone.href, `${icon('phone')}<span>${site.phone.display}</span>`, { className: 'footer-cta__phone' })}
      </div>
    </div>
  </section>`;

  return `<footer class="site-footer" data-header-theme="dark">
  ${cta}
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="brand" href="/" aria-label="${esc(site.name)} home"><img class="brand__logo" src="/assets/img/logo-light-560.webp" width="280" height="66" alt="${esc(site.name)}" loading="lazy"></a>
      <p>Cultivating joyful family connections through DIR Floortime®, social learning, and family coaching.</p>
      <ul class="social" role="list">
        ${site.social.map((s) => `<li>${link(s.url, s.name, { className: 'social__link' })}</li>`).join('')}
      </ul>
    </div>
    <nav class="site-footer__col" aria-labelledby="footer-explore">
      <h2 class="site-footer__heading" id="footer-explore">Explore</h2>
      <ul role="list">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/resources">Resources</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
    <nav class="site-footer__col" aria-labelledby="footer-services">
      <h2 class="site-footer__heading" id="footer-services">Services</h2>
      <ul role="list">
        ${services.map((s) => `<li><a href="/${s.slug}">${s.menuTitle}</a></li>`).join('')}
        <li>${link(site.socialClub, 'The Social Club')}</li>
      </ul>
    </nav>
    <div class="site-footer__col">
      <h2 class="site-footer__heading">Visit</h2>
      <address>
        <ul role="list">
          <li>${link(site.address.mapUrl, `${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}`)}</li>
          <li><a href="${site.phone.href}">${site.phone.display}</a></li>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
          <li>${link(site.booking, 'Book an appointment')}</li>
        </ul>
      </address>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>© <span data-year>${year}</span> ${esc(site.name)}. All rights reserved.</p>
    <ul class="site-footer__legal" role="list">
      <li><a href="/privacy-policy">Privacy Policy</a></li>
      <li><a href="/accessibility">Accessibility</a></li>
    </ul>
    <p class="site-footer__credit">Designed by ${link(site.designer.url, site.designer.name)}</p>
  </div>
  <div class="site-footer__wordmark" aria-hidden="true"><span data-wordmark data-text="Hummingbird Nest"></span></div>
</footer>`;
}
