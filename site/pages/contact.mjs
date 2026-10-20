import { site } from '../config.mjs';
import { picture, button, kicker } from '../lib/html.mjs';
import { contactForm, contactDetails } from '../lib/partials.mjs';
import { webPage } from '../lib/seo.mjs';

export default function contact() {
  const path = '/contact';
  const description =
    'Contact The Hummingbird Nest in La Cañada Flintridge. Call (626) 765 1724, email info@thehummingbirdnest.org, or send a message to schedule an intake session.';

  const body = `
<section class="contact-hero" aria-labelledby="contact-title">
  <div class="container contact-hero__grid">
    <div class="contact-hero__intro">
      ${kicker('Contact')}
      <h1 class="page-hero__title" id="contact-title" data-split>Let’s <em>connect.</em></h1>
      <p class="lead" data-reveal>Fill out this short form to get started on your journey. If you prefer, you can reach us directly by phone or email, or book a time online.</p>
      <div data-reveal>${contactDetails()}</div>
      <figure class="contact-hero__media" data-clip>${picture('office-door-sign', { alt: 'The Hummingbird Nest sign on the wall of our La Cañada Flintridge office', sizes: '(min-width: 900px) 40vw, 100vw', maxWidth: 1200 })}</figure>
    </div>
    <div class="contact-hero__form">
      <div class="form-card" data-reveal>
        <h2 class="form-card__title">Send us a message</h2>
        <p class="form-card__text">We will get back to you as soon as we can.</p>
        ${contactForm({ id: 'contact-form' })}
      </div>
    </div>
  </div>
</section>

<section class="next-steps" aria-labelledby="next-title" data-header-theme="dark">
  <div class="container">
    ${kicker('What happens next', 'kicker--light')}
    <h2 class="h2" id="next-title" data-split>Three simple steps to <em>get started</em></h2>
    <ol class="next-steps__list" role="list" data-reveal-group>
      <li data-reveal><span aria-hidden="true">01</span><h3>We reach out</h3><p>We contact you to set up a short phone call at a time that works for you.</p></li>
      <li data-reveal><span aria-hidden="true">02</span><h3>We get to know you</h3><p>Together we see if we are a good fit and talk through your goals and questions.</p></li>
      <li data-reveal><span aria-hidden="true">03</span><h3>We begin</h3><p>We schedule an intake session in our office or an observation at your child’s school.</p></li>
    </ol>
    <div class="next-steps__cta" data-reveal>${button(site.booking, 'Book an appointment online', { variant: 'light' })}</div>
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
