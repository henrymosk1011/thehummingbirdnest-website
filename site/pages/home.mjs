import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { pillars, supportCards, instagramFallback, team } from '../data/content.mjs';
import { picture, button, link, icon, kicker, imageUrl, imageMeta, coverSizes } from '../lib/html.mjs';
import { testimonialsSection, postCard } from '../lib/partials.mjs';
import { webPage, personNode } from '../lib/seo.mjs';

// Home page copy is word for word from the original site, except the Meet Tamar bio,
// which Tamar supplied for the new site.
export default function home({ posts }) {
  // Search result title and summary (the longer site.description is used in structured data).
  // Neither appears on the page. The summary names the nearby cities families search from.
  const titleTag = `${site.name} | DIR Floortime® Therapy in La Cañada`;
  const description =
    'DIR Floortime® therapy, playdates, social skills groups, and parent coaching for ages 2 to 25 in La Cañada Flintridge, serving Pasadena, Glendale, and Burbank.';
  const tamar = team[0];
  const instagram = site.social.find((s) => s.name === 'Instagram');
  const instagramHandle = instagram.url.split('/').filter(Boolean).pop();

  // Stack cards: tall frames, so wide photos are shown wider than the card (see coverSizes).
  const stackSizes = (image) => {
    const m = imageMeta(image);
    return m.width > m.height ? '(min-width: 900px) 62vw, 100vw' : '(min-width: 900px) 34vw, 100vw';
  };

  const body = `
<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__stage">
    <div class="container hero__copy" data-hero-copy>
      ${kicker('The Hummingbird Nest', 'hero__kicker')}
      <h1 class="hero__title" id="hero-title" data-split>Cultivating <em>Joyful</em> Family Connections</h1>
      <div class="hero__row">
        <div class="actions" data-reveal>
          ${button('/contact', 'Contact us', { variant: 'ink' })}
          ${button('/services', 'Our services', { variant: 'ghost' })}
        </div>
      </div>
    </div>
    <div class="hero__media" data-hero-media>
      <video class="hero__video" muted loop playsinline preload="metadata" poster="${imageUrl('hero-poster', 1280)}" data-video aria-hidden="true" tabindex="-1">
        <source src="/assets/media/hero-854.mp4" type="video/mp4" media="(max-width: 700px)">
        <source src="/assets/media/hero-1280.webm" type="video/webm">
        <source src="/assets/media/hero-1280.mp4" type="video/mp4">
      </video>
      <div class="hero__shade" aria-hidden="true"></div>
      <button class="video-toggle" type="button" data-video-toggle>
        <span class="video-toggle__icon" aria-hidden="true">${icon('pause', { className: 'icon icon--pause' })}${icon('play', { className: 'icon icon--play' })}</span>
        <span class="video-toggle__label">Pause video</span>
      </button>
    </div>
  </div>
</section>

<section class="intro" aria-labelledby="intro-title">
  <div class="container intro__grid">
    <div class="intro__side">
      <h2 class="h2 intro__title" id="intro-title" data-split>The Hummingbird <em>Nest</em></h2>
    </div>
    <div class="intro__main">
      <p class="intro__statement" data-fill-text><strong>The Hummingbird Nest</strong> office in <strong>La Cañada Flintridge</strong>, CA offers children, adolescents and young adults <strong>DIR Floortime®</strong> sessions, Facilitated Playdates, PEERS® Social Skills Groups, Whole-Family Coaching, In-School Support (Shadow Services), and Staff/Facility Trainings within the <strong>greater Los Angeles area</strong>. Glendale - Pasadena - Burbank - La Crescenta - Northern LA Neighborhoods.</p>
      <div class="intro__foot" data-reveal>
        <p>Contact us through the link below or give our team a call today to schedule an intake session.</p>
        <div class="actions">
          ${button('/contact', 'Contact us', { variant: 'ink' })}
          ${link(site.phone.href, `${icon('phone')}<span>${site.phone.display}</span>`, { className: 'text-link' })}
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="pillars__grid" data-reveal-group>
      ${pillars
        .map(
          (p) => `<article class="pillar" data-reveal>
        <h3 class="pillar__title">${p.title}</h3>
        <p>${p.text}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="stack" aria-label="Individualized Therapy, Parent Support, and The Social Club">
  <div class="stack__stage" data-stack>
    <ul class="stack__cols" role="list">
      ${supportCards
        .map(
          (c, i) => `<li class="stack__col stack__col--${i + 1}">
        ${link(
          c.href,
          `<span class="stack-card__media">${picture(c.image, { alt: '', sizes: stackSizes(c.image), maxWidth: 1600 })}</span>
          <span class="stack-card__shade" aria-hidden="true"></span>
          <span class="stack-card__body">
            <span class="stack-card__num" aria-hidden="true">0${i + 1}</span>
            <span class="stack-card__title">${c.title}</span>
            <span class="stack-card__cta">${c.external ? 'Visit The Social Club' : 'Learn more'} ${icon(c.external ? 'arrow-up-right' : 'arrow')}</span>
          </span>`,
          { className: `stack-card stack-card--${c.tone}` }
        ).replace('<a ', `<a data-stack-card data-tone="${c.tone}" `)}
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>

<section class="founder" aria-labelledby="founder-title">
  <div class="container founder__grid">
    <figure class="founder__media" data-clip>
      ${picture('tamar-matossian', { alt: 'Tamar Matossian seated in the Hummingbird Nest office in front of a chalkboard', sizes: '(min-width: 1000px) 48vw, 100vw', data: { parallax: '0.1' } })}
    </figure>
    <div class="founder__copy">
      <h2 class="h2" id="founder-title" data-split>Meet <em>Tamar</em></h2>
      <div class="founder__text" data-reveal>
        <p>Tamar Matossian is the founder and director of The Hummingbird Nest and The Social Club. She is a Neurodevelopmental Specialist with over 20 years of experience and a strong passion for supporting the neurodiverse community. The services she provides are designed with children, parents, and the broader community in mind, fostering healthy relationships, emotional development, and growing independence in children.</p>
      </div>
      <div class="actions" data-reveal>
        ${button('/about', 'Learn more<span class="visually-hidden"> about Tamar and our team</span>', { variant: 'ink' })}
      </div>
    </div>
  </div>
</section>

<section class="services-grid" aria-labelledby="services-title" data-header-theme="dark">
  <div class="container">
    <div class="services-grid__head">
      ${kicker('What we do')}
      <h2 class="h2" id="services-title" data-split>Services</h2>
    </div>
    <ul class="services-grid__list" role="list" data-reveal-group>
      ${services
        .map(
          (s, i) => `<li class="services-grid__item" data-reveal>
        <a class="svc-card" href="/${s.slug}">
          <span class="svc-card__media">${picture(s.card.image, { alt: '', sizes: coverSizes(s.card.image, 4 / 3, i < 3 ? '(min-width: 1000px) 31vw, (min-width: 641px) 48vw, 100vw' : '(min-width: 641px) 48vw, 100vw'), maxWidth: 1200 })}</span>
          <span class="svc-card__body">
            <span class="svc-card__num" aria-hidden="true">${s.number}</span>
            <span class="svc-card__title">${s.title}</span>
            <span class="svc-card__cta">Learn more ${icon('arrow')}</span>
          </span>
        </a>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>

${testimonialsSection()}

<section class="journal" aria-labelledby="journal-title">
  <div class="container">
    <div class="journal__head">
      <div class="section-head">
        <h2 class="h2" id="journal-title" data-split>Read some of our <em>articles</em> here</h2>
        <p class="section-head__text" data-reveal>We post a lot of free content around mental health and general wellbeing. Make sure to check all of our posts down below.</p>
      </div>
      <div data-reveal>${button('/resources#blog', 'View all posts', { variant: 'ghost' })}</div>
    </div>
    <div class="post-grid">
      ${posts.slice(0, 3).map((p) => postCard(p)).join('')}
    </div>
  </div>
</section>

<section class="insta" aria-labelledby="insta-title" data-insta>
  <div class="container">
    <div class="insta__head">
      <h2 class="h2" id="insta-title" data-split>Instagram</h2>
      <div data-reveal>${button(instagram.url, `Follow @${instagramHandle}`, { variant: 'ghost', iconName: 'instagram' })}</div>
    </div>
    <ul class="insta__grid" role="list" data-insta-grid>
      ${instagramFallback
        .map(
          (p) => `<li class="insta__item">
        <div class="insta__tile">${picture(p.image, { alt: p.alt, sizes: coverSizes(p.image, 1, '(min-width: 1100px) 16vw, (min-width: 700px) 24vw, 33vw'), maxWidth: 800 })}</div>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;

  return {
    path: '/',
    title: site.name,
    titleTag,
    ogTitle: 'The Hummingbird Nest: Cultivating Joyful Family Connections',
    description,
    lastmod: posts[0]?.date,
    body,
    bodyClass: 'page-home',
    clearsHeader: true,
    preload: [`<link rel="preload" as="image" href="${imageUrl('hero-poster', 1280)}" fetchpriority="high">`],
    jsonld: [webPage({ path: '/', title: 'The Hummingbird Nest', description }), personNode(tamar)],
  };
}
