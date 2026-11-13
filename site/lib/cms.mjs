// Helpers for content edited in Pages CMS (blog posts, team, testimonials, FAQ).
// Editors never need to know the house rules: dashes are smoothed out, Markdown is
// rendered, and photos can be referenced by upload path or by plain name.

import { Marked } from 'marked';
import { site } from '../config.mjs';
import { picture, hasImage } from './html.mjs';

// "/images/My Photo.JPG", "site/images/my-photo.jpg" and "my-photo" all name the same image.
export function mediaName(value) {
  const base = String(value || '')
    .trim()
    .split(/[\\/]/)
    .pop()
    .replace(/\.(jpe?g|png|webp)$/i, '');
  return base
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Links, email addresses, web addresses and the words in site.keepHyphensIn ("1-on-1")
// keep their hyphens.
const KEPT = (site.keepHyphensIn || []).map((w) => `\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
export const KEPT_WORDS = KEPT.length ? new RegExp(KEPT.join('|'), 'gi') : null;
const PROTECTED = new RegExp(`(\\S*(?::\\/\\/|www\\.|@)\\S*${KEPT.map((k) => `|${k}`).join('')})`, 'i');
const DASH = '\\-\\u2010\\u2011\\u2012\\u2013\\u2014\\u2015\\u2212';

// The site never shows dashes. Turn them into the punctuation a careful editor would use:
// "2–5" becomes "2 to 5" ("2-5" too with keepWordHyphens off, as does "self-regulation",
// which becomes "self regulation"), and an aside
// set off with dashes becomes an aside set off with commas.
export function softenDashes(text) {
  return softenPart(text).replace(/^[\s,]+|[\s,]+$/g, '');
}

function softenPart(text) {
  return String(text ?? '')
    .split(PROTECTED)
    .map((part, i) => (i % 2 ? part : softenPlain(part)))
    .join('');
}

// A placeholder marks where an aside dash was, so the cleanup below only ever touches
// those spots and leaves the writer's own punctuation alone.
const MARK = '\u0001';

// Hyphens joining two words or numbers ("In-School", "1-on-1", "2-25").
const WORD_HYPHEN = /([\p{L}\p{N}])[\-\u2010\u2011]+(?=[\p{L}\p{N}])/gu;
// Any dash left over once word hyphens are kept.
const LOOSE_DASH = new RegExp(`(?<![\\p{L}\\p{N}])[${DASH}]+|[${DASH}]+(?![\\p{L}\\p{N}])|[\\u2012-\\u2015\\u2212]+`, 'gu');
// A number range written with a long dash ("3–7", "3 – 7", "3—7") or a spaced hyphen
// ("3 - 7") reads "3 to 7". Word and Google Docs turn typed hyphens into these, and
// without this rule they would become commas ("ages 3, 7"). A plain hyphen ("3-7") is a
// word hyphen and follows keepWordHyphens; a spaced em dash ("3 — 7") stays an aside.
const RANGE_DASH = /\b(\d{1,4})(?:\s*[‒–−]+\s*|[—―]+|\s+[\-‐‑]+\s+)(?=\d{1,4}\b)/g;

function softenPlain(s) {
  const keep = site.keepWordHyphens;
  // Phone numbers: (626) 765-1724 and 626-765-1724 read as (626) 765 1724 and 626 765 1724.
  let out = s
    .replace(new RegExp(`(\\d{3})[${DASH}](\\d{3})[${DASH}](\\d{4})`, 'g'), '$1 $2 $3')
    .replace(new RegExp(`(\\(\\d{3}\\)\\s*\\d{3})[${DASH}](\\d{4})\\b`, 'g'), '$1 $2')
    .replace(RANGE_DASH, '$1 to ');
  if (!keep) out = out.replace(new RegExp(`\\b(\\d{1,4})\\s*[${DASH}]\\s*(\\d{1,4})\\b`, 'g'), '$1 to $2');
  out = out.replace(/\s*[\u2012\u2013\u2014\u2015]+\s*/g, MARK).replace(/\s+[\-\u2010\u2011\u2212]+\s+/g, MARK);
  if (!keep) out = out.replace(WORD_HYPHEN, '$1 ');
  return out
    .replace(keep ? LOOSE_DASH : new RegExp(`[${DASH}]+`, 'g'), ' ')
    .replace(/\u0001+/g, MARK)
    .replace(/,?\s*\u0001\s*(?=[.,;:!?)\]”"’])/g, '')
    .replace(/([(\[“"‘])\s*\u0001\s*/g, '$1')
    .replace(/,?\s*\u0001\s*/g, ', ')
    .replace(/ {2,}/g, ' ');
}

// Same as softenDashes, but only touches text between HTML tags.
export function softenHtml(html) {
  return String(html ?? '')
    .split(/(<[^>]+>)/)
    .map((part) => (part.startsWith('<') ? part : softenPart(part)))
    .join('');
}

// A photo description that is really a file name ("IMG_1234.jpg", "PXL_20261103.png").
// Pages CMS fills one in when a photo is dragged or pasted into an article, and screen
// readers would read it out, so the build warns about it.
export const looksLikeFileName = (alt) => {
  const a = String(alt ?? '').trim();
  return /\.(jpe?g|png|webp|gif|heic|heif|avif|tiff?)$/i.test(a) || /^(img|dsc|dscn|pxl|mvimg|image|photo)[\s_-]*\d[\d\s_.()-]*$/i.test(a);
};
const FIX_DESCRIPTION = 'In Pages CMS, click the photo, then the alt text button, and describe what is in it.';
// Where the Markdown being rendered comes from ("Blog post why-is-my-kid-hitting.md"), so
// a warning about a photo inside it says which post to fix.
let source = '';
const warn = (message) => console.warn(source ? `${source}: ${message[0].toLowerCase()}${message.slice(1)}` : message);

// Markdown to HTML. External links open in a new tab and say so to screen readers.
// Links written in content carry data-cms, so a mistyped address is reported as a
// warning instead of stopping the whole site from publishing.
const marked = new Marked({ gfm: true, breaks: false });
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const ext = /^https?:\/\//.test(href) && !href.startsWith(site.url);
      return `<a href="${href}" data-cms${title ? ` title="${title}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${text}${ext ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`;
    },
    // Photos added inside an article become responsive images from the site's own library.
    image({ href, text }) {
      const name = mediaName(href);
      if (!/^https?:/i.test(href) && hasImage(name)) {
        // A photo picked from the library comes with no description at all.
        if (!String(text ?? '').trim()) warn(`Photo "${href}" in the article has no description. ${FIX_DESCRIPTION}`);
        else if (looksLikeFileName(text)) warn(`Photo "${href}" in the article is described as "${text}", which looks like a file name. ${FIX_DESCRIPTION}`);
        return picture(name, { alt: softenDashes(text), sizes: '(min-width: 900px) 760px, 100vw', className: 'prose__image' });
      }
      warn(`Photo "${href}" in the content is not in the site's photo library and was left out.`);
      return '';
    },
  },
});

// The page's own title is its one main heading (h1). A "Heading 1" used inside an article,
// bio or answer is shown as a section heading (h2) instead: it gets the section heading style,
// and the page keeps a single h1 for screen readers and search engines.
const demoteMainHeadings = (html) => {
  if (!/<h1[\s>]/i.test(html)) return html;
  warn('A Heading 1 was shown as a section heading. Use Heading 2 for section titles.');
  return html.replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2');
};

export const markdown = (md, from = '') => {
  source = from;
  try {
    return softenHtml(demoteMainHeadings(marked.parse(String(md ?? ''))));
  } finally {
    source = '';
  }
};
export const inlineMarkdown = (md) => softenHtml(marked.parseInline(String(md ?? '').trim()));

// Markdown or HTML to plain text (for structured data and summaries).
export const plainText = (html) =>
  String(html ?? '')
    .replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.;:!?])(?= |$)/g, '$1')
    .trim();
