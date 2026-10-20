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

// Links, email addresses and web addresses keep their hyphens.
const PROTECTED = /(\S*(?::\/\/|www\.|@)\S*)/;
const DASH = '\\-\\u2010\\u2011\\u2012\\u2013\\u2014\\u2015\\u2212';

// The site never shows dashes. Turn them into the punctuation a careful editor would use:
// "2-5" becomes "2 to 5", "self-regulation" becomes "self regulation", and an aside
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

function softenPlain(s) {
  return s
    .replace(new RegExp(`(\\d{3})[${DASH}](\\d{3})[${DASH}](\\d{4})`, 'g'), '$1 $2 $3')
    .replace(new RegExp(`\\b(\\d{1,4})\\s*[${DASH}]\\s*(\\d{1,4})\\b`, 'g'), '$1 to $2')
    .replace(/\s*[\u2012\u2013\u2014\u2015]+\s*/g, MARK)
    .replace(/\s+[\-\u2010\u2011\u2212]+\s+/g, MARK)
    .replace(/([\p{L}\p{N}])[\-\u2010\u2011\u2212]+(?=[\p{L}\p{N}])/gu, '$1 ')
    .replace(new RegExp(`[${DASH}]+`, 'g'), ' ')
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
        return picture(name, { alt: softenDashes(text), sizes: '(min-width: 900px) 760px, 100vw', className: 'prose__image' });
      }
      console.warn(`Photo "${href}" in the content is not in the site's photo library and was left out.`);
      return '';
    },
  },
});

export const markdown = (md) => softenHtml(marked.parse(String(md ?? '')));
export const inlineMarkdown = (md) => softenHtml(marked.parseInline(String(md ?? '').trim()));

// Markdown or HTML to plain text (for structured data and summaries).
export const plainText = (html) =>
  String(html ?? '')
    .replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
