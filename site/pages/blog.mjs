import { site } from '../config.mjs';
import { picture, button, link, kicker, icon, preloadImage } from '../lib/html.mjs';
import { pageHero, postCard, postDate, sectionHead } from '../lib/partials.mjs';
import { webPage, articleNode } from '../lib/seo.mjs';

// Category URLs match the original site.
export const categories = [
  { id: 'children', name: 'Children', path: '/blog-categories/resources-children', blurb: 'Ideas for supporting young children through play, regulation, and connection.' },
  { id: 'teens', name: 'Teens', path: '/blog-categories/teens', blurb: 'Articles on attachment, relationships, and emotional growth for older kids and teens.' },
  { id: 'adults', name: 'Adults', path: '/blog-categories/resources-adults', blurb: 'Support for parents and caregivers, from burnout to brain based regulation.' },
];
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

function filters(active) {
  const items = [{ name: 'All articles', path: '/blog', id: 'all' }, ...categories];
  return `<nav class="filters" aria-label="Blog categories">
    <ul role="list">
      ${items.map((c) => `<li><a class="filter${c.id === active ? ' is-active' : ''}" href="${c.path}"${c.id === active ? ' aria-current="page"' : ''}>${c.name}</a></li>`).join('')}
    </ul>
  </nav>`;
}

function listing(list, { featured = true } = {}) {
  const [first, ...rest] = list;
  return `${featured && first ? `<div class="post-featured">${postCard(first, { featured: true, headingLevel: 2 })}</div>` : ''}
  <div class="post-grid">${(featured ? rest : list).map((p) => postCard(p, { headingLevel: featured ? 3 : 2 })).join('')}</div>`;
}

export function blogIndex(posts) {
  const path = '/blog';
  const description = 'Articles from The Hummingbird Nest on child development, DIR Floortime®, emotional regulation, parenting, and caregiver wellbeing.';
  const body = `
${pageHero({
  eyebrow: 'Blog',
  title: 'Notes on growing, <em>together.</em>',
  lead: 'Free articles on development, regulation, connection, and caring for yourself along the way.',
  variant: 'plain',
})}
<section class="blog-list" aria-label="Articles">
  <div class="container">
    ${filters('all')}
    ${listing(posts)}
  </div>
</section>`;
  return {
    path,
    title: 'Blog',
    description,
    body,
    crumbs: [{ name: 'Blog', path }],
    jsonld: [
      webPage({ path, title: 'Blog', description, type: 'CollectionPage' }),
      { '@type': 'Blog', '@id': `${site.url}${path}#blog`, url: `${site.url}${path}`, name: `${site.name} Blog`, publisher: { '@id': `${site.url}/#organization` } },
    ],
  };
}

export function categoryPage(cat, posts) {
  const list = posts.filter((p) => p.category === cat.id);
  const description = `${cat.blurb} Articles from The Hummingbird Nest in La Cañada Flintridge.`;
  const body = `
${pageHero({ eyebrow: 'Blog category', title: `Articles about <em>${cat.name.toLowerCase()}</em>`, lead: cat.blurb, variant: 'plain' })}
<section class="blog-list" aria-label="${cat.name} articles">
  <div class="container">
    ${filters(cat.id)}
    ${list.length ? listing(list, { featured: list.length > 2 }) : '<p>New articles are on the way.</p>'}
  </div>
</section>`;
  return {
    path: cat.path,
    title: `${cat.name} Articles`,
    description,
    body,
    crumbs: [
      { name: 'Blog', path: '/blog' },
      { name: cat.name, path: cat.path },
    ],
    jsonld: [webPage({ path: cat.path, title: `${cat.name} Articles`, description, type: 'CollectionPage' })],
  };
}

export function postPage(post, posts) {
  const path = `/post/${post.slug}`;
  const cat = categoryById[post.category];
  const related = posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (b.category === post.category) - (a.category === post.category) || b.date.localeCompare(a.date))
    .slice(0, 3);

  const body = `
<article class="article" aria-labelledby="article-title">
  <header class="article__header container">
    <p class="article__meta" data-reveal><a class="tag" href="${cat.path}">${cat.name}</a><span>${postDate(post.date)}</span><span>${post.minutes} min read</span></p>
    <h1 class="article__title" id="article-title" data-split>${post.title}</h1>
    <p class="article__dek" data-reveal>${post.description}</p>
  </header>
  <figure class="article__media" data-hero-reveal>
    <div class="article__frame">${picture(post.image, { alt: post.imageAlt, sizes: '(min-width: 1200px) 1100px, 100vw', priority: true, data: { parallax: '0.1' } })}</div>
  </figure>
  <div class="article__body container">
    <div class="prose prose--article">
      ${post.html}
    </div>
    <aside class="article__aside" aria-label="About this article">
      <div class="author-card">
        <img src="/assets/img/mark.webp" alt="" width="48" height="37" loading="lazy">
        <p><strong>${site.name}</strong>Written by our team of DIR Floortime® developmental specialists.</p>
      </div>
      <div class="aside-cta">
        <p>Have questions about your child’s development?</p>
        ${button('/contact', 'Talk with us', { variant: 'ink', size: 'sm' })}
      </div>
    </aside>
  </div>
  <footer class="article__footer container">
    <a class="text-link" href="/blog">${icon('arrow-left')}<span>Back to all articles</span></a>
  </footer>
</article>

<section class="journal journal--related" aria-labelledby="related-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Keep reading', title: 'More from <em>the blog</em>', id: 'related-title' })}
    <div class="post-grid">${related.map((p) => postCard(p)).join('')}</div>
  </div>
</section>`;

  const img = `${site.url}/assets/img/${post.image}-og.jpg`;
  return {
    path,
    title: post.title,
    description: post.description,
    body,
    image: post.image,
    imageAlt: post.imageAlt,
    ogType: 'article',
    published: post.date,
    crumbs: [
      { name: 'Blog', path: '/blog' },
      { name: cat.name, path: cat.path },
      { name: post.title, path },
    ],
    hideCrumbs: false,
    preload: [preloadImage(post.image, '(min-width: 1200px) 1100px, 100vw')],
    jsonld: [webPage({ path, title: post.title, description: post.description, image: img }), articleNode(post, img)],
  };
}

export function resourcesPage(posts) {
  const path = '/resources';
  const description =
    'Helpful resources from The Hummingbird Nest: articles for parents and caregivers, DIR Floortime® information, The Social Club, and Tamar Matossian’s book What’s Autism.';
  const links = [
    { href: site.book.url, title: site.book.title, text: 'The book by our founder, Tamar Matossian, available on Amazon.', icon: 'book' },
    { href: '/about#dir-floortime', title: 'What is DIR Floortime®?', text: 'Learn about the developmental, relationship based model at the heart of our work.', icon: 'sparkle' },
    { href: 'https://www.icdl.com/', title: 'ICDL', text: 'The Interdisciplinary Council on Development and Learning, home of DIR® Floortime™ training and research.', icon: 'arrow-up-right' },
    { href: 'https://www.profectum.org', title: 'Profectum', text: 'Parent and professional resources for DIR based, developmental approaches.', icon: 'arrow-up-right' },
    { href: site.socialClub, title: 'The Social Club', text: 'Social learning groups for kids, pre teens, teens, and young adults, led by our team.', icon: 'users' },
    { href: '/about#faq', title: 'Frequently asked questions', text: 'Insurance, ages, getting started, and more.', icon: 'plus' },
  ];

  const body = `
${pageHero({
  eyebrow: 'Resources',
  title: 'Tools and ideas for <em>your family.</em>',
  lead: 'The Hummingbird Nest offers 1:1 DIR Floortime® therapy in our office and in school. Sessions are held indoors and outdoors with sensory motor play to support social and emotional development, and parents are included to strengthen the parent and child relationship.',
  image: 'toy-animals',
  imageAlt: 'A row of small toy animals lined up on a wooden ledge',
})}

<section class="res-intro" aria-labelledby="res-intro-title">
  <div class="container res-intro__grid">
    <figure class="res-intro__media" data-clip>${picture('family-session-table', { alt: 'Tamar playing with two siblings and their parent around a coffee table', sizes: '(min-width: 900px) 50vw, 100vw', data: { parallax: '0.08' } })}</figure>
    <div class="res-intro__copy">
      ${kicker('Why it works')}
      <h2 class="h2" id="res-intro-title" data-split>Your child is different. <em>They all are.</em></h2>
      <div data-reveal>
        <p>With an approach like DIR Floortime®, your child’s individual differences are accounted for and every session is fine tuned to who they are.</p>
        <p>We use a multidisciplinary approach to better understand the root causes of behaviors and how to best address them. Forming a healthy relationship with the child and family is key to development, and giving parents the tools to practice at home speeds up progress toward the goals we create together.</p>
      </div>
    </div>
  </div>
</section>

<section class="res-links" aria-labelledby="res-links-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Helpful links', title: 'Recommended <em>reading and resources</em>', id: 'res-links-title' })}
    <ul class="link-cards" role="list" data-reveal-group>
      ${links
        .map(
          (l) => `<li data-reveal>${link(
            l.href,
            `<span class="link-card__icon" aria-hidden="true">${icon(l.icon)}</span><span class="link-card__title">${l.title}</span><span class="link-card__text">${l.text}</span><span class="link-card__arrow" aria-hidden="true">${icon(/^https?:/.test(l.href) ? 'arrow-up-right' : 'arrow')}</span>`,
            { className: 'link-card' }
          )}</li>`
        )
        .join('')}
    </ul>
  </div>
</section>

<section class="journal" aria-labelledby="latest-title">
  <div class="container">
    <div class="journal__head">
      ${sectionHead({ eyebrow: 'From the blog', title: 'Latest <em>articles</em>', id: 'latest-title' })}
      <div data-reveal>${button('/blog', 'View all articles', { variant: 'ghost' })}</div>
    </div>
    ${filters('none')}
    <div class="post-grid">${posts.slice(0, 6).map((p) => postCard(p)).join('')}</div>
  </div>
</section>`;

  return {
    path,
    title: 'Resources',
    description,
    body,
    image: 'toy-animals',
    imageAlt: 'A row of small toy animals lined up on a wooden ledge',
    crumbs: [{ name: 'Resources', path }],
    preload: [preloadImage('toy-animals')],
    jsonld: [webPage({ path, title: 'Resources', description })],
  };
}
