import { site } from '../config.mjs';
import { picture, button, kicker } from '../lib/html.mjs';
import { contactForm, contactDetails } from '../lib/partials.mjs';
import { webPage } from '../lib/seo.mjs';

// Contact page copy is word for word from the original site.
export default function contact() {
  const path = '/contact';
  const description =
    'Contact The Hummingbird Nest in La Cañada Flintridge. Call (626) 765 1724, email info@thehummingbirdnest.org, send us your details, or book a call with Calendly.';

  const body = `
<section class="contact-hero" aria-labelledby="contact-title">
  <div class="container contact-hero__grid">
    <div class="contact-hero__intro">
      ${kicker('Contact')}
      <h1 class="page-hero__title" id="contact-title" data-split>Connect <em>With Us</em></h1>
      <p class="lead" data-reveal>Just fill out this short form on the right to get started in your life changing journey. If you prefer you can contact us below directly.</p>
      <div data-reveal>${contactDetails()}</div>
      <div class="actions contact-hero__book" data-reveal>${button(site.booking, site.bookingLabel, { variant: 'ghost', iconName: 'calendar' })}</div>
      <figure class="contact-hero__media" data-clip>${picture('office-door-sign', { alt: 'The Hummingbird Nest sign on the wall of our La Cañada Flintridge office', sizes: '(min-width: 1000px) 44vw, 100vw', maxWidth: 1600 })}</figure>
    </div>
    <div class="contact-hero__form">
      <div class="form-card" data-reveal>
        <h2 class="form-card__title">Get in Touch</h2>
        <p class="form-card__text">Enter your contact information</p>
        ${contactForm({ id: 'contact-form' })}
      </div>
    </div>
  </div>
</section>`;

  return {
    path,
    title: 'Contact Us',
    description,
    body,
    footerCta: false,
    bodyClass: 'page-contact',
    image: 'office-door-sign',
    imageAlt: 'The Hummingbird Nest office sign',
    crumbs: [{ name: 'Contact', path }],
    jsonld: [webPage({ path, title: 'Contact The Hummingbird Nest', description, type: 'ContactPage' })],
  };
}
