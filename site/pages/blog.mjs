import { site } from '../config.mjs';
import { picture, button, icon, preloadImage, esc } from '../lib/html.mjs';
import { pageHero, pageHeroPreload, postCard, postDate, blogCarousel } from '../lib/partials.mjs';
import { webPage, articleNode } from '../lib/seo.mjs';

// The blog lives on the Resources page (as on the original site). Category pages keep their
// original addresses and act as tabs; the old /blog address redirects to /resources#blog.
export const categories = [
  { id: 'children', name: 'Children', seoTitle: 'Articles on Supporting Young Children', path: '/blog-categories/resources-children', blurb: 'Articles from The Hummingbird Nest on supporting young children through play, regulation, and connection.' },
  { id: 'teens', name: 'Teens', seoTitle: 'Articles on Older Kids and Teens', path: '/blog-categories/teens', blurb: 'Articles from The Hummingbird Nest on attachment, relationships, and emotional growth for older kids and teens.' },
  { id: 'adults', name: 'Adults', seoTitle: 'Articles for Parents and Caregivers', path: '/blog-categories/resources-adults', blurb: 'Articles from The Hummingbird Nest for parents and caregivers, from burnout to brain based regulation.' },
];
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

const blogIntro = 'We post a lot of free content around mental health and general wellbeing. Make sure to check all of our posts down below.';

export function resourcesPage(posts) {
  const path = '/resources';
  const description =
    'Free articles from The Hummingbird Nest for parents and caregivers on child development, DIR Floortime®, emotional regulation, and caregiver wellbeing.';

  const body = `
${pageHero({
  title: 'Resources',
  lead: 'The Hummingbird Nest offers 1-on-1 DIR Floortime Therapy in-office and in-school. Sessions are held both indoors and outdoors with the incorporation of sensorimotor play to best support the child in social-emotional development. Parents are incorporated into 1:1 sessions to strengthen the parent-child relationship.',
  image: 'toy-animals',
  imageAlt: 'A row of small toy animals lined up on a wooden ledge',
  actions: button('/contact', 'Contact us', { variant: 'ink' }),
})}

<section class="res-intro">
  <div class="container res-intro__grid">
    <figure class="res-intro__media" data-clip>${picture('family-session-table', { alt: 'Tamar playing with two siblings and their parent around a coffee table', sizes: '(min-width: 1000px) 56vw, 112vw', data: { parallax: '0.08' } })}</figure>
    <div class="res-intro__copy">
      <div data-reveal>
        <p>With an approach like DIR Floortime, the child’s individual differences are accounted for and sessions are fine tuned to the unique child. The Hummingbird Nest uses a multidisciplinary approach in all her sessions to better understand the root causes of behaviors and how to best address them. Forming a healthy relationship with the child and family is key in development. Giving parents the tools they need to practice strategies at home speeds up progress in meeting the goals we create together.</p>
      </div>
    </div>
  </div>
</section>

<section class="blog-section" id="blog" aria-labelledby="blog-title">
  <div class="container">
    <div class="section-head">
      <h2 class="h2" id="blog-title" data-split>Blog</h2>
      <p class="section-head__text" data-reveal>${blogIntro}</p>
    </div>
    ${blogCarousel(posts, { active: 'all', categories })}
  </div>
</section>`;

  return {
    path,
    title: 'Child Development Resources and Blog',
    ogTitle: 'Resources',
    description,
    lastmod: posts[0]?.date,
    body,
    image: 'toy-animals',
    imageAlt: 'A row of small toy animals lined up on a wooden ledge',
    crumbs: [{ name: 'Resources', path }],
    preload: [pageHeroPreload('toy-animals')],
    jsonld: [
      webPage({ path, title: 'Child Development Resources and Blog', description, type: 'CollectionPage' }),
      {
        '@type': 'Blog',
        '@id': `${site.url}${path}#blog`,
        url: `${site.url}${path}`,
        name: `${site.name} Blog`,
        publisher: { '@id': `${site.url}/#organization` },
        blogPost: posts.map((p) => ({ '@id': `${site.url}/post/${p.slug}#article` })),
      },
    ],
  };
}

export function categoryPage(cat, posts) {
  const list = posts.filter((p) => p.category === cat.id);
  const body = `
${pageHero({ eyebrow: 'Blog', title: cat.name, variant: 'plain' })}
<section class="blog-section blog-section--category">
  <div class="container">
    ${list.length ? blogCarousel(list, { active: cat.id, categories, headingLevel: 2, label: `${cat.name} blog posts` }) : `<p>${blogIntro}</p>`}
  </div>
</section>`;
  return {
    path: cat.path,
    title: cat.seoTitle,
    ogTitle: `${cat.name} Articles`,
    description: cat.blurb,
    lastmod: list[0]?.date,
    body,
    crumbs: [
      { name: 'Resources', path: '/resources' },
      { name: cat.name, path: cat.path },
    ],
    jsonld: [webPage({ path: cat.path, title: cat.seoTitle, description: cat.blurb, type: 'CollectionPage' })],
  };
}

export function postPage(post, posts) {
  const path = `/post/${post.slug}`;
  const cat = categoryById[post.category];
  const related = posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (b.category === post.category) - (a.category === post.category) || b.date.localeCompare(a.date))
    .slice(0, 3);
  const heroSizes = '(min-width: 1400px) 1390px, 112vw';

  const body = `
<article class="article" aria-labelledby="article-title">
  <header class="article__header container">
    <p class="article__meta" data-reveal><a class="tag" href="${cat.path}">${cat.name}</a><span>${postDate(post.date)}</span><span>${post.minutes} min read</span></p>
    <h1 class="article__title" id="article-title" data-split>${esc(post.title)}</h1>
  </header>
  <figure class="article__media" data-hero-reveal>
    <div class="article__frame">${picture(post.image, { alt: post.imageAlt, sizes: heroSizes, priority: true, data: { parallax: '0.1' } })}</div>
  </figure>
  <div class="article__body container">
    <div class="prose prose--article">
      ${post.html}
    </div>
    <aside class="article__aside" aria-label="Contact The Hummingbird Nest">
      <div class="author-card">
        <img src="/assets/img/mark.webp" alt="" width="48" height="37" loading="lazy">
        <p><strong>${site.name}</strong></p>
      </div>
      ${button('/contact', 'Contact us', { variant: 'ink', size: 'sm' })}
    </aside>
  </div>
  <footer class="article__footer container">
    <a class="text-link" href="/resources#blog">${icon('arrow-left')}<span>View all posts</span></a>
  </footer>
</article>

<section class="journal journal--related" aria-labelledby="related-title">
  <div class="container">
    <h2 class="h2 journal__title" id="related-title" data-split>More from the <em>blog</em></h2>
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
      { name: 'Resources', path: '/resources' },
      { name: cat.name, path: cat.path },
      { name: post.title, path },
    ],
    preload: [preloadImage(post.image, heroSizes)],
    jsonld: [webPage({ path, title: post.title, description: post.description, image: img }), articleNode(post, img)],
  };
}

