import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { pillars, supportCards } from '../data/content.mjs';
import { picture, button, link, icon, kicker, withYears, imageUrl } from '../lib/html.mjs';
import { testimonialsSection, postCard, contactForm, contactDetails, sectionHead } from '../lib/partials.mjs';
import { webPage, personNode } from '../lib/seo.mjs';
import { team } from '../data/content.mjs';

export default function home({ posts }) {
  const description = site.description;
  const tamar = team[0];

  const body = `
<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__stage">
    <div class="container hero__copy" data-hero-copy>
      ${kicker('DIR Floortime® in La Cañada Flintridge', 'hero__kicker')}
      <h1 class="hero__title" id="hero-title" data-split>Cultivating <em>joyful</em> family connections.</h1>
      <div class="hero__row">
        <p class="hero__lead" data-reveal>We are a community of unique individuals who come together to learn and grow, supporting children, teens, and young adults ages 2 to 25.</p>
        <div class="actions" data-reveal>
          ${button('/contact', 'Book a call', { variant: 'ink' })}
          ${button('/services', 'Explore services', { variant: 'ghost' })}
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
      <p class="hero__statement" data-hero-statement>Meeting every child <em>where they are.</em></p>
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
      ${kicker('Welcome to the Nest')}
      <h2 class="visually-hidden" id="intro-title">About The Hummingbird Nest</h2>
      <div class="intro__badge" data-reveal>
        <span class="intro__badge-num"><span data-years-since="${site.experienceSince}">${new Date().getFullYear() - site.experienceSince}</span>+</span>
        <span class="intro__badge-text">years supporting neurodiverse children and families</span>
      </div>
    </div>
    <div class="intro__main">
      <p class="intro__statement" data-fill-text>Our La Cañada Flintridge office offers children, adolescents, and young adults <strong>DIR Floortime® sessions</strong>, facilitated playdates, PEERS® social skills groups, whole family coaching, in school support, and staff trainings across greater Los Angeles.</p>
      <div class="intro__foot" data-reveal>
        <p>Contact us below or give our team a call today to schedule an intake session.</p>
        <div class="actions">
          ${button('/contact', 'Schedule an intake', { variant: 'ink' })}
          ${link(site.phone.href, `${icon('phone')}<span>${site.phone.display}</span>`, { className: 'text-link' })}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="marquee" aria-label="Areas we serve">
  <p class="visually-hidden">Serving ${site.serviceAreas.slice(0, -1).join(', ')}, and ${site.serviceAreas[site.serviceAreas.length - 1]} neighborhoods.</p>
  <div class="marquee__track" data-marquee aria-hidden="true">
    ${[0, 1]
      .map(
        () =>
          `<div class="marquee__group">${site.serviceAreas
            .map((a) => `<span class="marquee__item">${a}</span><img class="marquee__mark" src="/assets/img/mark.webp" alt="" width="60" height="46" loading="lazy">`)
            .join('')}</div>`
      )
      .join('')}
  </div>
</section>

<section class="pillars" aria-labelledby="pillars-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Why families choose us', title: 'Care that is <em>attuned</em> to your whole family', id: 'pillars-title' })}
    <div class="pillars__grid" data-reveal-group>
      ${pillars
        .map(
          (p) => `<article class="pillar" data-reveal>
        <span class="pillar__num" aria-hidden="true" data-text="${p.number}"></span>
        <h3 class="pillar__title">${p.title}</h3>
        ${p.text ? `<p>${p.text}</p>` : ''}
        ${p.tags ? `<ul class="tags" role="list">${p.tags.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="stack" aria-labelledby="stack-title">
  <div class="container stack__intro">
    ${sectionHead({ eyebrow: 'How we help', title: 'Three ways we <em>support</em> your family', id: 'stack-title', text: 'From one on one therapy to coaching for parents and friendship groups for kids, every path starts with connection.' })}
  </div>
  <div class="stack__stage" data-stack>
    <div class="stack__bg" aria-hidden="true">
      ${supportCards.map((c, i) => `<span class="stack__word${i === 0 ? ' is-active' : ''}" data-stack-word data-text="${c.word}"></span>`).join('')}
    </div>
    <ul class="stack__cols" role="list">
      ${supportCards
        .map(
          (c, i) => `<li class="stack__col stack__col--${i + 1}">
        ${link(
          c.href,
          `<span class="stack-card__media">${picture(c.image, { alt: '', sizes: '(min-width: 900px) 30vw, 90vw', maxWidth: 1200 })}</span>
          <span class="stack-card__shade" aria-hidden="true"></span>
          <span class="stack-card__body">
            <span class="stack-card__num" aria-hidden="true">0${i + 1}</span>
            <span class="stack-card__title">${c.title}</span>
            <span class="stack-card__text">${c.text}</span>
            <span class="stack-card__cta">${c.external ? 'Visit The Social Club' : 'Explore'} ${icon(c.external ? 'arrow-up-right' : 'arrow')}</span>
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
      ${picture('tamar-matossian', { alt: 'Tamar Matossian seated in the Hummingbird Nest office in front of a chalkboard', sizes: '(min-width: 900px) 42vw, 100vw', data: { parallax: '0.1' } })}
    </figure>
    <div class="founder__copy">
      ${kicker('Meet the founder')}
      <h2 class="h2" id="founder-title" data-split>Hi, I am <em>Tamar.</em></h2>
      <div class="founder__text" data-reveal>
        <p>Tamar Matossian is a Neurodevelopmental Specialist who specializes in the DIR Floortime® approach, with ${withYears('{years}')} years of experience working with the neurodiverse population.</p>
        <p>She also holds a Speech Language Pathology Assistant License, so she brings a multidisciplinary approach to every session to support maximum development. Tamar is the founder and director of The Hummingbird Nest and The Social Club social learning program, and the author of the book ${link(site.book.url, `<em>${site.book.title}</em>`)}.</p>
      </div>
      <dl class="stats" data-reveal-group>
        <div class="stat" data-reveal><dt>Experience</dt><dd>${withYears('{years}')} years</dd></div>
        <div class="stat" data-reveal><dt>Ages we serve</dt><dd>2 to 25</dd></div>
        <div class="stat" data-reveal><dt>Approach</dt><dd>DIR Floortime®</dd></div>
      </dl>
      <div class="actions" data-reveal>
        ${button('/about', 'Meet the team', { variant: 'ink' })}
        ${button(site.book.url, `Read ${site.book.title}`, { variant: 'ghost' })}
      </div>
    </div>
  </div>
</section>

<section class="hscroll" aria-labelledby="services-title" data-hscroll data-header-theme="dark">
  <div class="hscroll__pin" data-hscroll-pin>
    <div class="container hscroll__head">
      <div>
        ${kicker('What we do')}
        <h2 class="h2" id="services-title" data-split>Services that grow <em>with your family</em></h2>
      </div>
      <p class="hscroll__count" aria-hidden="true"><span data-hscroll-current>01</span> / ${String(services.length).padStart(2, '0')}</p>
    </div>
    <div class="hscroll__viewport" data-hscroll-viewport data-lenis-prevent-horizontal>
      <ul class="hscroll__track" role="list" data-hscroll-track>
        ${services
          .map(
            (s) => `<li class="hscroll__item" data-hscroll-item>
          <a class="svc-card" href="/${s.slug}">
            <span class="svc-card__media">${picture(s.card.image, { alt: '', sizes: '(min-width: 900px) 40vw, 85vw', maxWidth: 1200 })}</span>
            <span class="svc-card__body">
              <span class="svc-card__top"><span class="svc-card__num" aria-hidden="true">${s.number}</span><span class="svc-card__eyebrow">${s.eyebrow}</span></span>
              <span class="svc-card__title">${s.title}</span>
              <span class="svc-card__text">${s.summary}</span>
              <span class="svc-card__cta">Learn more ${icon('arrow')}</span>
            </span>
          </a>
        </li>`
          )
          .join('')}
        <li class="hscroll__item hscroll__item--end" data-hscroll-item>
          <div class="svc-end">
            <p class="svc-end__title">Not sure which service is right for your child?</p>
            <p>Start with a short call. We will listen, answer your questions, and recommend a next step.</p>
            ${button('/contact', 'Book a call', { variant: 'light' })}
          </div>
        </li>
      </ul>
    </div>
  </div>
</section>

${testimonialsSection()}

<section class="journal" aria-labelledby="journal-title">
  <div class="container">
    <div class="journal__head">
      ${sectionHead({ eyebrow: 'From the blog', title: 'Free resources for <em>growing</em> families', id: 'journal-title', text: 'We share practical ideas on development, regulation, and connection. Explore our latest articles below.' })}
      <div data-reveal>${button('/blog', 'View all articles', { variant: 'ghost' })}</div>
    </div>
    <div class="post-grid">
      ${posts.slice(0, 3).map((p) => postCard(p)).join('')}
    </div>
  </div>
</section>

<section class="contact-block" id="contact" aria-labelledby="contact-title">
  <div class="container contact-block__grid">
    <div class="contact-block__intro">
      ${kicker('Get in touch')}
      <h2 class="h2" id="contact-title" data-split>Let’s start the <em>conversation.</em></h2>
      <p data-reveal>Tell us a little about your family and we will reach out to set up a phone call. Prefer to talk now? Call us or book online.</p>
      <div data-reveal>${contactDetails()}</div>
    </div>
    <div class="contact-block__form" data-reveal>
      ${contactForm({ id: 'home-form', compact: true })}
    </div>
  </div>
</section>

<section class="finale" aria-labelledby="finale-title" data-finale data-header-theme="dark">
  <div class="finale__media" aria-hidden="true">
    <video muted loop playsinline preload="none" poster="${imageUrl('hero-poster', 1280)}" data-video data-lazy-video tabindex="-1">
      <source src="/assets/media/hero-854.mp4" type="video/mp4" media="(max-width: 700px)">
      <source src="/assets/media/hero-1280.webm" type="video/webm">
      <source src="/assets/media/hero-1280.mp4" type="video/mp4">
    </video>
  </div>
  <div class="finale__type">
    <h2 class="finale__title" id="finale-title" data-finale-title><span>Let’s grow</span> <span>together</span></h2>
  </div>
  <div class="finale__bar">
    <div class="finale__actions container">
      <p>Every child is different. They all are. Let’s find the path that fits yours.</p>
      <div class="actions">
        ${button('/contact', 'Book a call', { variant: 'light' })}
        ${link(site.phone.href, `${icon('phone')}<span>${site.phone.display}</span>`, { className: 'text-link text-link--light' })}
      </div>
    </div>
  </div>
</section>`;

  return {
    path: '/',
    title: site.name,
    ogTitle: 'The Hummingbird Nest: Cultivating Joyful Family Connections',
    description,
    body,
    footerCta: false,
    bodyClass: 'page-home',
    preload: [`<link rel="preload" as="image" href="${imageUrl('hero-poster', 1280)}" fetchpriority="high">`],
    jsonld: [webPage({ path: '/', title: 'The Hummingbird Nest', description }), personNode(tamar)],
  };
}
