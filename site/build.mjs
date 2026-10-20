// Builds the static site into dist/.
//
//   npm run build
//
// 1. Copies site/static and the web fonts.
// 2. Bundles and minifies CSS and JavaScript with esbuild.
// 3. Renders every page and blog post to HTML.
// 4. Writes sitemap.xml, robots.txt and the web app manifest.
// 5. Checks the output: no dashes in visible text, every image has alt text,
//    and every internal link points at a real page.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as esbuild from 'esbuild';
import { Marked } from 'marked';

import { site } from './config.mjs';
import { services } from './data/services.mjs';
import { renderPage } from './lib/layout.mjs';
import { readingTime } from './lib/html.mjs';
import home from './pages/home.mjs';
import about from './pages/about.mjs';
import contact from './pages/contact.mjs';
import { servicesHub, servicePage } from './pages/services.mjs';
import { blogIndex, categoryPage, postPage, resourcesPage, categories, categoryById } from './pages/blog.mjs';
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
  blogIndex(posts),
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
const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter((p) => !p.noindex && p.sitemap !== false);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map((p) => {
    const lastmod = p.published || today;
    const priority = p.path === '/' ? '1.0' : p.path.startsWith('/post/') ? '0.6' : p.path.startsWith('/services') ? '0.9' : '0.7';
    return `  <url><loc>${site.url}${p.path === '/' ? '/' : p.path}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`;
  })
  .join('\n')}
</urlset>
`;
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
await fs.writeFile(
  path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /thanks\n\nSitemap: ${site.url}/sitemap.xml\n`
);
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
console.log('Checks passed: no dashes in visible text, alt text present, internal links resolve.');

// Helpers

// The opening paragraph of an article is set larger as a lead in, but only when it is a
// full paragraph. A short opening line at that size would read like a heading.
function leadParagraph(html) {
  return html.replace(/^<p>([\s\S]*?)<\/p>/, (whole, inner) => (inner.replace(/<[^>]+>/g, '').trim().length >= 50 ? `<p class="lede">${inner}</p>` : whole));
}

async function loadPosts() {
  const dir = path.join(SITE, 'content', 'posts');
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href) && !href.startsWith(site.url);
        return `<a href="${href}"${title ? ` title="${title}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${text}${ext ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`;
      },
    },
  });
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  const list = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(dir, f), 'utf8');
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) throw new Error(`Missing front matter in ${f}`);
    const data = Object.fromEntries(
      m[1].split('\n').map((line) => {
        const i = line.indexOf(':');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')];
      })
    );
    const words = m[2].split(/\s+/).filter(Boolean).length;
    if (!categoryById[data.category]) throw new Error(`Unknown category "${data.category}" in ${f}`);
    list.push({
      ...data,
      categoryName: categoryById[data.category].name,
      html: leadParagraph(marked.parse(m[2])),
      words,
      minutes: readingTime(m[2]),
    });
  }
  return list.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

async function check(pages) {
  const issues = [];
  const routes = new Set(pages.map((p) => p.path));
  routes.add('/');
  for (const page of pages) {
    const file = page.output || (page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`);
    const html = await fs.readFile(path.join(DIST, file), 'utf8');

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
      const decoded = chunk.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      const hit = decoded.match(/.{0,30}[-‐‑‒–—―−].{0,30}/);
      if (hit) issues.push(`${file}: dash in visible text: "${hit[0].trim()}"`);
    }

    for (const img of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\salt="/.test(img[0])) issues.push(`${file}: image without alt: ${img[0].slice(0, 80)}`);
    }

    for (const a of html.matchAll(/\shref="(\/[^"#?]*)/g)) {
      const href = a[1];
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
