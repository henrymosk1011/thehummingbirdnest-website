import { team, gallery, faqs } from '../data/content.mjs';
import { picture, button, link, withYears, icon, esc, coverSizes } from '../lib/html.mjs';
import { pageHero, pageHeroPreload, faqSection } from '../lib/partials.mjs';
import { webPage, personNode, faqNode, bookNode } from '../lib/seo.mjs';

// About page copy is word for word from the original site.
export default function about() {
  const path = '/about';
  const description =
    'Meet Tamar Matossian and the DIR Floortime® specialists of The Hummingbird Nest in La Cañada Flintridge, serving children, teens, and young adults ages 2 to 25.';

  const members = team
    .map(
      (m, i) => `<article class="member${i === 0 ? ' member--lead' : ''}" id="${m.id}" aria-labelledby="${m.id}-name">
      <div class="member__media" data-reveal="scale">
        <div class="member__portrait">${picture(m.image, { alt: m.alt, sizes: '(min-width: 1000px) 440px, 70vw' })}</div>
      </div>
      <div class="member__copy">
        <div class="member__role">${esc(m.role)}${m.title ? `<span>${esc(m.title)}</span>` : ''}</div>
        <h2 class="member__name" id="${m.id}-name" data-split>${esc(m.name)}</h2>
        <div class="member__bio" data-reveal>${withYears(m.bio)}</div>
      </div>
    </article>`
    )
    .join('');

  const body = `
${pageHero({
  title: 'About Us',
  image: 'office-lets-just-play',
  imageAlt: 'A framed print reading Let’s just play hanging on a white brick wall in our office',
  actions: button('/contact', 'Contact us', { variant: 'ink' }),
})}

<section class="approach" aria-labelledby="approach-title">
  <h2 class="visually-hidden" id="approach-title">Our approach</h2>
  <div class="container approach__grid">
    <div class="approach__head">
      <p class="approach__statement" data-reveal>Parenting can be difficult, there are times you feel like your child is different from other children, and the conflicting advice you receive from everyone becomes overwhelming. The struggle is real! It’s true that your child is different, <em>they all are.</em></p>
    </div>
    <div class="approach__body" data-reveal>
      <p>At The Hummingbird Nest, we specialize in DIR Floortime® Therapy. With the DIR Floortime® approach, we meet your child at their current level and expand from there. Their individual differences are accounted for and the sessions are fine-tuned to your unique child.</p>
      <p>We use a multidisciplinary approach in all our sessions to better understand the root causes of behaviors and how to best address them. Forming a healthy relationship with the child and family is key in development. Giving parents the tools they need to practice strategies at home speeds up progress in meeting the goals we create together.</p>
    </div>
  </div>
</section>

<section class="dir" id="dir-floortime" aria-labelledby="dir-title" data-header-theme="dark">
  <div class="container dir__grid">
    <figure class="dir__media" data-clip>
      ${picture('dir-floortime-greenspan', { alt: 'Dr. Stanley Greenspan playing on the floor with a young child', sizes: '(min-width: 1000px) 40vw, 100vw' })}
    </figure>
    <div class="dir__copy">
      <h2 class="h2" id="dir-title" data-split>DIR®/<em>Floortime™</em></h2>
      <div data-reveal>
        <p>DIR®/Floortime™ (Developmental, Individual-differences, Relationship-based) is a developmental intervention model developed by Dr. Stanley Greenspan and Dr. Serena Wieder. It centers the child’s unique interests, strengths, and challenges and uses the power of relationships and personal connections to aid in healthy social and emotional development.</p>
        <p>For more information on DIR®/Floortime™, please refer to the ${link('https://www.icdl.com/', 'Interdisciplinary Council on Development and Learning (ICDL)')} or ${link('https://www.profectum.org', 'Profectum')}.</p>
        <p class="dir__note">${icon('users')} The population we serve: Children, adolescents, and young adults (2-25 years of age).</p>
      </div>
    </div>
  </div>
</section>

<section class="team" aria-label="Our team">
  <div class="container">
    <div class="team__list">${members}</div>
  </div>
</section>

<section class="space" aria-labelledby="space-title">
  <div class="container">
    <h2 class="h2 space__title" id="space-title" data-split>A space made <em>for play</em></h2>
    <ul class="space__grid space__grid--${gallery.length}" role="list">
      ${gallery
        .map(
          (g) => `<li class="space__item" data-clip>${picture(g.image, {
            alt: g.alt,
            sizes: coverSizes(g.image, 3 / 2, gallery.length === 1 ? '(min-width: 1500px) 1400px, 100vw' : '(min-width: 1500px) 700px, (min-width: 641px) 50vw, 100vw'),
            maxWidth: 2000,
          })}</li>`
        )
        .join('')}
    </ul>
  </div>
</section>

${faqSection()}`;

  return {
    path,
    // Search result title only (the page heading stays "About Us"): people search for Tamar by name.
    title: 'About Tamar Matossian and Our Team',
    ogTitle: 'About The Hummingbird Nest',
    description,
    body,
    image: 'office-lets-just-play',
    imageAlt: 'A framed print reading Let’s just play in The Hummingbird Nest office',
    crumbs: [{ name: 'About', path }],
    preload: [pageHeroPreload('office-lets-just-play')],
    jsonld: [
      webPage({ path, title: 'About The Hummingbird Nest', description, type: 'AboutPage' }),
      ...team.map((m) => personNode(m)),
      ...(team.some((m) => m.id === 'tamar') ? [bookNode()] : []),
      faqNode(faqs, path),
    ],
  };
}
