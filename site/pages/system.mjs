import { site } from '../config.mjs';
import { button, kicker } from '../lib/html.mjs';

export function notFoundPage() {
  return {
    path: '/404',
    output: '404.html',
    title: 'Page Not Found',
    description: 'The page you are looking for may have moved. Explore The Hummingbird Nest home page, services, or resources.',
    noindex: true,
    sitemap: false,
    body: `<section class="system" aria-labelledby="system-title">
  <div class="container system__inner">
    <img class="system__mark" src="/assets/img/mark.webp" alt="" width="120" height="92">
    ${kicker('Error 404')}
    <h1 class="page-hero__title" id="system-title" data-split>This page has <em>flown the nest.</em></h1>
    <p class="lead" data-reveal>The page you are looking for does not exist or has moved. Try one of these instead.</p>
    <div class="actions" data-reveal>
      ${button('/', 'Back to home', { variant: 'ink' })}
      ${button('/services', 'Our services', { variant: 'ghost' })}
      ${button('/resources', 'Resources', { variant: 'ghost' })}
    </div>
  </div>
</section>`,
  };
}

export function thanksPage() {
  return {
    path: '/thanks',
    title: 'Thank You',
    description: 'Thank you for contacting The Hummingbird Nest. We will be in touch soon.',
    noindex: true,
    sitemap: false,
    footerCta: false,
    body: `<section class="system" aria-labelledby="system-title">
  <div class="container system__inner">
    <img class="system__mark" src="/assets/img/mark.webp" alt="" width="120" height="92">
    <h1 class="page-hero__title" id="system-title" data-split>Thank you! <em>Your submission has been received!</em></h1>
    <div class="actions" data-reveal>
      ${button('/', 'Back to home', { variant: 'ink' })}
      ${button(site.phone.href, site.phone.display, { variant: 'ghost', iconName: 'phone' })}
    </div>
  </div>
</section>`,
  };
}
