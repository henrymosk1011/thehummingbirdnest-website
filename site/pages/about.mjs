import { team, gallery, faqs } from '../data/content.mjs';
import { picture, button, link, kicker, withYears, icon, preloadImage } from '../lib/html.mjs';
import { pageHero, faqSection, sectionHead } from '../lib/partials.mjs';
import { webPage, personNode, faqNode } from '../lib/seo.mjs';

export default function about() {
  const path = '/about';
  const description =
    'Meet Tamar Matossian and the DIR Floortime® specialists of The Hummingbird Nest in La Cañada Flintridge, and learn how our relationship based approach supports children ages 2 to 25.';

  const members = team
    .map(
      (m, i) => `<article class="member${i === 0 ? ' member--lead' : ''}" id="${m.id}" aria-labelledby="${m.id}-name">
      <div class="member__media" data-reveal="scale">
        <div class="member__portrait">${picture(m.image, { alt: m.alt, sizes: '(min-width: 900px) 30vw, 70vw' })}</div>
      </div>
      <div class="member__copy">
        <div class="member__role">${m.role}${m.title ? `<span>${m.title}</span>` : ''}</div>
        <h3 class="member__name" id="${m.id}-name" data-split>${m.name}</h3>
        <div class="member__bio" data-reveal>${m.bio.map((p) => `<p>${withYears(p)}</p>`).join('')}</div>
      </div>
    </article>`
    )
    .join('');

  const body = `
${pageHero({
  eyebrow: 'About us',
  title: 'Every child is different. <em>They all are.</em>',
  lead: 'Parenting can be difficult. There are times you feel like your child is different from other kids, and the conflicting advice you receive from everyone becomes overwhelming. The struggle is real, and you do not have to navigate it alone.',
  image: 'office-lets-just-play',
  imageAlt: 'A framed print reading Let’s just play hanging on a white brick wall in our office',
  actions: button('/contact', 'Schedule a call', { variant: 'ink' }),
})}

<section class="approach" aria-labelledby="approach-title">
  <div class="container approach__grid">
    <div class="approach__head">
      ${kicker('Our approach')}
      <h2 class="h2" id="approach-title" data-split>We meet your child <em>where they are,</em> then grow from there.</h2>
    </div>
    <div class="approach__body" data-reveal>
      <p class="lead">At The Hummingbird Nest, we specialize in DIR Floortime® Therapy. We meet your child at their current level and expand from there. Their individual differences are accounted for and every session is fine tuned to your unique child.</p>
      <p>We use a multidisciplinary approach in all of our sessions to better understand the root causes of behaviors and how to best address them. Forming a healthy relationship with the child and family is key to development, and giving parents the tools to practice strategies at home speeds up progress toward the goals we create together.</p>
    </div>
  </div>
  <div class="container">
    <dl class="stats stats--wide" data-reveal-group>
      <div class="stat" data-reveal><dt>Years of experience</dt><dd>${withYears('{years}')}</dd></div>
      <div class="stat" data-reveal><dt>Ages we serve</dt><dd>2 to 25</dd></div>
      <div class="stat" data-reveal><dt>Specialists on our team</dt><dd>${team.length}</dd></div>
      <div class="stat" data-reveal><dt>Based in</dt><dd>La Cañada Flintridge</dd></div>
    </dl>
  </div>
</section>

<section class="dir" id="dir-floortime" aria-labelledby="dir-title" data-header-theme="dark">
  <div class="container dir__grid">
    <figure class="dir__media" data-clip>
      ${picture('dir-floortime-greenspan', { alt: 'Dr. Stanley Greenspan playing on the floor with a young child', sizes: '(min-width: 900px) 40vw, 100vw' })}
      <figcaption>Dr. Stanley Greenspan, who developed the DIR® model with Dr. Serena Wieder.</figcaption>
    </figure>
    <div class="dir__copy">
      ${kicker('What is DIR Floortime®?', 'kicker--light')}
      <h2 class="h2" id="dir-title" data-split>Developmental. Individual differences. <em>Relationship based.</em></h2>
      <div data-reveal>
        <p>DIR® Floortime™ is a developmental intervention model created by Dr. Stanley Greenspan and Dr. Serena Wieder. It centers the child’s unique interests, strengths, and challenges, and uses the power of relationships and personal connection to support healthy social and emotional development.</p>
        <p>For more information on DIR® Floortime™, visit the ${link('https://www.icdl.com/', 'Interdisciplinary Council on Development and Learning (ICDL)')} or ${link('https://www.profectum.org', 'Profectum')}.</p>
        <p class="dir__note">${icon('users')} The population we serve: children, adolescents, and young adults ages 2 to 25.</p>
      </div>
    </div>
  </div>
</section>

<section class="team" aria-labelledby="team-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Our team', title: 'The people behind <em>the Nest</em>', id: 'team-title', text: 'A compassionate group of specialists who love to integrate strategies across all of your family’s therapeutic disciplines.' })}
    <div class="team__list">${members}</div>
    <div class="team__cta" data-reveal>
      <p>Ready to meet the team in person?</p>
      ${button('/contact', 'Schedule a call', { variant: 'ink' })}
    </div>
  </div>
</section>

<section class="hscroll hscroll--gallery" aria-labelledby="gallery-title" data-hscroll>
  <div class="hscroll__pin" data-hscroll-pin>
    <div class="container hscroll__head">
      <div>
        ${kicker('Inside the Nest')}
        <h2 class="h2" id="gallery-title" data-split>A space made <em>for play</em></h2>
      </div>
      <div class="hscroll__count" aria-hidden="true"><span data-hscroll-current>01</span> / ${String(gallery.length).padStart(2, '0')}</div>
    </div>
    <div class="hscroll__viewport" data-hscroll-viewport data-lenis-prevent-horizontal tabindex="0" role="region" aria-label="Office photos, scroll sideways to see more">
      <ul class="hscroll__track" role="list" data-hscroll-track>
        ${gallery
          .map(
            (g, i) => `<li class="hscroll__item gallery-item${i % 3 === 1 ? ' gallery-item--tall' : ''}" data-hscroll-item>
          <figure>
            <div class="gallery-item__media">${picture(g.image, { alt: g.alt, sizes: '(min-width: 900px) 40vw, 80vw', maxWidth: 1200 })}</div>
            <figcaption>${g.caption}</figcaption>
          </figure>
        </li>`
          )
          .join('')}
      </ul>
    </div>
  </div>
</section>

${faqSection()}`;

  return {
    path,
    title: 'About Us',
    description,
    body,
    image: 'office-lets-just-play',
    imageAlt: 'A framed print reading Let’s just play in The Hummingbird Nest office',
    crumbs: [{ name: 'About', path }],
    preload: [preloadImage('office-lets-just-play')],
    jsonld: [webPage({ path, title: 'About The Hummingbird Nest', description, type: 'AboutPage' }), ...team.map((m) => personNode(m)), faqNode(faqs, path)],
  };
}
