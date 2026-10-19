import { site } from '../config.mjs';
import { button, kicker } from '../lib/html.mjs';

export function notFoundPage() {
  return {
    path: '/404',
    output: '404.html',
    title: 'Page Not Found',
    description: 'The page you are looking for may have moved. Explore The Hummingbird Nest home page, services, or blog.',
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
      ${button('/blog', 'Read the blog', { variant: 'ghost' })}
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
    ${kicker('Message sent')}
    <h1 class="page-hero__title" id="system-title" data-split>Thank you. <em>We will be in touch soon.</em></h1>
    <p class="lead" data-reveal>Your message is on its way to our team. If you need us sooner, call <a href="${site.phone.href}">${site.phone.display}</a>.</p>
    <div class="actions" data-reveal>
      ${button('/', 'Back to home', { variant: 'ink' })}
      ${button('/blog', 'Read the blog', { variant: 'ghost' })}
    </div>
  </div>
</section>`,
  };
}
