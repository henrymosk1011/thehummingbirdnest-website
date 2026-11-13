// Builds the static site into dist/.
//
//   npm run build
//
// 1. Copies site/static and the web fonts.
// 2. Bundles and minifies CSS and JavaScript with esbuild.
// 3. Renders every page and blog post to HTML.
// 4. Writes sitemap.xml, robots.txt and the web app manifest.
// 5. Checks the output: no dashes in visible text, every image has alt text,
//    every internal link points at a real page, and every page has one main heading
//    and its own search title and description.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as esbuild from 'esbuild';
import { parse as parseYaml } from 'yaml';

import { site } from './config.mjs';
import { services } from './data/services.mjs';
import { renderPage } from './lib/layout.mjs';
import { readingTime, hasImage } from './lib/html.mjs';
import { markdown, softenDashes, plainText, mediaName, KEPT_WORDS, looksLikeFileName } from './lib/cms.mjs';
import home from './pages/home.mjs';
import about from './pages/about.mjs';
import contact from './pages/contact.mjs';
import { servicesHub, servicePage } from './pages/services.mjs';
import { categoryPage, postPage, resourcesPage, categories, categoryById } from './pages/blog.mjs';
import { privacyPage, accessibilityPage } from './pages/legal.mjs';
import { notFoundPage, thanksPage } from './pages/system.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = path.join(ROOT, 'site');
const DIST = path.join(ROOT, 'dist');
const started = Date.now();

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

// 1. Static files and fonts
await fs.cp(path.join(SITE, 'static'), DIST, { recursive: true });
const fontsOut = path.join(DIST, 'assets', 'fonts');
await fs.mkdir(fontsOut, { recursive: true });
const fonts = {
  'jakarta-latin.woff2': '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  'jakarta-latin-ext.woff2': '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2',
  'instrument-italic.woff2': '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
  'instrument-italic-ext.woff2': '@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-italic.woff2',
};
for (const [out, src] of Object.entries(fonts)) {
  await fs.copyFile(path.join(ROOT, 'node_modules', src), path.join(fontsOut, out));
}

// 2. CSS and JS
const result = await esbuild.build({
  entryPoints: { 'css/main': path.join(SITE, 'styles', 'main.css'), 'js/main': path.join(SITE, 'scripts', 'main.js'), 'js/analytics': path.join(SITE, 'scripts', 'analytics.js') },
  outdir: path.join(DIST, 'assets'),
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020', 'chrome100', 'safari15', 'firefox100'],
  external: ['/assets/*'],
  legalComments: 'none',
  write: true,
  metafile: true,
});
const hash = crypto
  .createHash('sha1')
  .update(await fs.readFile(path.join(DIST, 'assets', 'css', 'main.css')))
  .update(await fs.readFile(path.join(DIST, 'assets', 'js', 'main.js')))
  .digest('hex')
  .slice(0, 10);
const build = { hash };

// 3. Content
const posts = await loadPosts();
const pages = [
  home({ posts }),
  about(),
  servicesHub(),
  ...services.map(servicePage),
  resourcesPage(posts),
  ...categories.map((c) => categoryPage(c, posts)),
  ...posts.map((p) => postPage(p, posts)),
  contact(),
  privacyPage(),
  accessibilityPage(),
  thanksPage(),
  notFoundPage(),
];

for (const page of pages) {
  const html = renderPage(page, build);
  const file = page.output || (page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`);
  const dest = path.join(DIST, file);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, html);
}

// 4. Sitemap, robots, manifest
// A page only carries a "last changed" date when the date is real: a post's own date, and the
// newest post on the pages that list posts. Stamping every page with today's date on every
// build teaches Google to ignore the dates altogether. (Google ignores priority, so it is left out.)
const indexable = pages.filter((p) => !p.noindex && p.sitemap !== false);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map((p) => {
    const lastmod = p.published || p.lastmod;
    return `  <url><loc>${site.url}${p.path === '/' ? '/' : p.path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  })
  .join('\n')}
</urlset>
`;
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
// /thanks is kept out of search by its own noindex tag, which Google can only read if it is
// allowed to fetch the page, so it is not blocked here.
await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`);
await fs.writeFile(
  path.join(DIST, 'site.webmanifest'),
  JSON.stringify(
    {
      name: site.name,
      short_name: site.shortName,
      start_url: '/',
      display: 'standalone',
      background_color: '#f7f5f0',
      theme_color: '#f7f5f0',
      icons: [
        { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2
  )
);

// 5. Checks
const problems = await check(pages);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const out = result.metafile.outputs;
console.log(`Built ${pages.length} pages in ${Date.now() - started} ms`);
for (const [file, info] of Object.entries(out)) console.log(`  ${path.relative(DIST, file).padEnd(24)} ${kb(info.bytes)}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s) found:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log('Checks passed: no dashes in visible text, alt text present, internal links resolve, search titles and descriptions in order.');

// Helpers

// The opening paragraph of an article is set larger as a lead in, but only when it is a
// full paragraph. A short opening line at that size would read like a heading.
function leadParagraph(html) {
  return html.replace(/^<p>([\s\S]*?)<\/p>/, (whole, inner) => (inner.replace(/<[^>]+>/g, '').trim().length >= 50 ? `<p class="lede">${inner}</p>` : whole));
}

// Blog posts are Markdown files with a YAML settings block at the top, written by hand
// or by Pages CMS. Problems in a post never stop the build: the post is fixed up or
// skipped with a warning, so the rest of the site always publishes.
async function loadPosts() {
  const dir = path.join(SITE, 'content', 'posts');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  const list = [];
  let drafts = 0;
  for (const f of files) {
    const warn = (msg) => console.warn(`Blog post ${f}: ${msg}`);
    const raw = (await fs.readFile(path.join(dir, f), 'utf8')).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const m = raw.match(/^---\n([\s\S]*?)\n---[^\n]*\n?([\s\S]*)$/);
    if (!m) {
      warn('skipped, the settings block at the top is missing.');
      continue;
    }
    let data;
    try {
      data = parseYaml(m[1]) || {};
    } catch (err) {
      warn(`skipped, the settings block could not be read (${err.message.split('\n')[0]}).`);
      continue;
    }
    if (data.draft === true || String(data.draft).toLowerCase() === 'true') {
      drafts++;
      continue;
    }
    const body = m[2];
    const title = softenDashes(data.title);
    if (!title) {
      warn('skipped, it has no title.');
      continue;
    }
    const fileSlug = f.replace(/\.md$/, '');
    const slug = /^[a-z0-9-]+$/.test(String(data.slug || '')) ? String(data.slug) : /^[a-z0-9-]+$/.test(fileSlug) ? fileSlug : mediaName(fileSlug);
    let category = String(data.category || '').toLowerCase();
    if (!categoryById[category]) {
      warn(`unknown category "${data.category}", filed under ${categories[0].name}.`);
      category = categories[0].id;
    }
    const date = postDate(data.date) || (warn('no valid date, using today.'), new Date().toISOString().slice(0, 10));
    let image = mediaName(data.image);
    if (!hasImage(image)) {
      if (data.image) warn(`photo "${data.image}" not found, using the blog header photo.`);
      image = 'blog-header';
    }
    if (looksLikeFileName(data.imageAlt)) warn(`the cover photo description "${data.imageAlt}" looks like a file name. Describe what is in the photo instead.`);
    const html = leadParagraph(markdown(body, `Blog post ${f}`));
    const text = plainText(html);
    list.push({
      title,
      slug,
      category,
      categoryName: categoryById[category].name,
      date,
      image,
      imageAlt: softenDashes(data.imageAlt),
      description: softenDashes(data.description) || summarize(text, 155),
      html,
      words: text.split(/\s+/).filter(Boolean).length,
      minutes: readingTime(text),
    });
  }
  const seen = new Set();
  const unique = list.filter((p) => (seen.has(p.slug) ? (console.warn(`Blog post ${p.slug}: skipped, another post already uses this address.`), false) : seen.add(p.slug)));
  if (drafts) console.log(`Blog: ${unique.length} published, ${drafts} draft${drafts === 1 ? '' : 's'} hidden.`);
  return unique.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

// Accepts 2026-01-27, 2026-01-27T09:00:00Z, a Date, or anything Date can read.
function postDate(value) {
  if (!value) return '';
  if (value instanceof Date) return isNaN(value) ? '' : value.toISOString().slice(0, 10);
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

function summarize(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

async function check(pages) {
  // Search results: Google shows roughly 60 characters of a title and 160 of a description.
  const TITLE_MAX = 70;
  const DESCRIPTION_MIN = 50;
  const DESCRIPTION_MAX = 165;
  const issues = [];
  const routes = new Set(pages.map((p) => p.path));
  routes.add('/');
  const titles = new Map();
  const descriptions = new Map();
  for (const page of pages) {
    const file = page.output || (page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`);
    const html = await fs.readFile(path.join(DIST, file), 'utf8');

    // Search basics. A blog post is written in the CMS, so its problems are warnings that
    // never stop the site from publishing; everywhere else they fail the build.
    const report = page.path.startsWith('/post/') ? (msg) => console.warn(`${file}: ${msg}`) : (msg) => issues.push(`${file}: ${msg}`);
    const headings = (html.match(/<h1\b/g) || []).length;
    if (headings !== 1) issues.push(`${file}: a page needs exactly one h1, found ${headings}`);
    if (!page.noindex) {
      const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
      const description = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
      if (title.length > TITLE_MAX) report(`the search title is ${title.length} characters, so Google will cut it off (keep it to ${TITLE_MAX}): "${title}"`);
      if (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX)
        report(`the search description is ${description.length} characters (keep it between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX}).`);
      for (const [seen, value, what] of [[titles, title, 'title'], [descriptions, description, 'description']]) {
        if (seen.has(value)) report(`same search ${what} as ${seen.get(value)}; each page needs its own.`);
        else seen.set(value, file);
      }
    }

    // Visible text: drop scripts, styles, tags and URLs, keep alt, title, aria-label, placeholder and meta content.
    const attrText = [...html.matchAll(/\s(?:alt|aria-label|placeholder|title|content)="([^"]*)"/g)]
      .map((x) => x[1])
      .filter((v) => !/^(https?:|\/|width=|#|index|noindex|telephone|summary|website|article|en_US|\d{4}-\d{2}-\d{2})/.test(v));
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ');
    for (const chunk of [text, ...attrText]) {
      // Web and email addresses and the words in site.keepHyphensIn ("1-on-1") keep their
      // hyphens; everything else must not show a dash.
      let decoded = chunk
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\S*(?::\/\/|www\.|@)\S*/g, ' ');
      if (KEPT_WORDS) decoded = decoded.replace(KEPT_WORDS, ' ');
      // With keepWordHyphens on, hyphens inside words ("In-School") are allowed; dashes are not.
      const visible = site.keepWordHyphens ? decoded.replace(/([\p{L}\p{N}])[-‐‑]+(?=[\p{L}\p{N}])/gu, '$1') : decoded;
      const hit = visible.match(/.{0,30}[-‐‑‒–—―−].{0,30}/);
      if (hit) issues.push(`${file}: dash in visible text: "${hit[0].trim()}"`);
    }

    for (const img of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\salt="/.test(img[0])) issues.push(`${file}: image without alt: ${img[0].slice(0, 80)}`);
    }

    for (const tag of html.matchAll(/<(?:a|link)\b[^>]*>/g)) {
      const a = tag[0].match(/\shref="(\/[^"#?]*)/);
      if (!a) continue;
      const href = a[1];
      // Links typed into CMS content: warn, but keep publishing.
      if (/\sdata-cms\b/.test(tag[0])) {
        if (!href.startsWith('/assets/') && !routes.has(href)) console.warn(`${file}: link to a page that does not exist: ${href}`);
        continue;
      }
      if (href.startsWith('/assets/') || href === '/favicon.ico' || href === '/site.webmanifest') {
        try {
          await fs.access(path.join(DIST, href));
        } catch {
          issues.push(`${file}: missing asset ${href}`);
        }
        continue;
      }
      if (!routes.has(href)) issues.push(`${file}: broken internal link ${href}`);
    }
    for (const s of html.matchAll(/\s(?:src|srcset|imagesrcset|poster)="([^"]+)"/g)) {
      for (const part of s[1].split(',')) {
        const url = part.trim().split(/\s+/)[0];
        if (!url.startsWith('/')) continue;
        try {
          await fs.access(path.join(DIST, url.split('?')[0]));
        } catch {
          issues.push(`${file}: missing file ${url}`);
        }
      }
    }
  }
  return [...new Set(issues)];
}
