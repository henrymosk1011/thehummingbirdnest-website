import fs from 'node:fs';
import path from 'node:path';
import { site } from '../config.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.json'), 'utf8'));

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const attrs = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`))
    .join('');

export const yearsOfExperience = () => new Date().getFullYear() - site.experienceSince;

// "{years}" placeholders become a span the browser keeps current each year.
export const withYears = (html) =>
  html.replace(/\{years\}/g, `<span data-years-since="${site.experienceSince}">${yearsOfExperience()}</span>+`);

export const imageMeta = (name) => {
  const m = images[name];
  if (!m) throw new Error(`Unknown image "${name}". Add it to site/images and run npm run images.`);
  return m;
};

export const imageUrl = (name, width) => {
  const m = imageMeta(name);
  const w = width ? m.widths.find((x) => x >= width) || m.widths[m.widths.length - 1] : m.widths[m.widths.length - 1];
  return `/assets/img/${name}-${w}.webp`;
};

/**
 * Responsive <picture> with AVIF and WebP sources.
 * alt: required. Pass '' for decorative images.
 */
export function picture(name, { alt, sizes = '100vw', className = '', imgClass = '', priority = false, maxWidth, data = {} } = {}) {
  if (alt === undefined) throw new Error(`Missing alt for image ${name}`);
  const m = imageMeta(name);
  const widths = maxWidth ? m.widths.filter((w) => w <= maxWidth).concat(m.widths.find((w) => w > maxWidth) || []) : m.widths;
  const set = (ext) => widths.map((w) => `/assets/img/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallbackW = widths.find((w) => w >= 1200) || widths[widths.length - 1];
  const dataAttrs = Object.fromEntries(Object.entries(data).map(([k, v]) => [`data-${k}`, v]));
  return `<picture${attrs({ class: className || undefined, ...dataAttrs })}><source type="image/avif" srcset="${set('avif')}" sizes="${esc(sizes)}"><source type="image/webp" srcset="${set('webp')}" sizes="${esc(sizes)}"><img${attrs({
    src: `/assets/img/${name}-${fallbackW}.webp`,
    alt,
    width: m.width,
    height: m.height,
    class: imgClass || undefined,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    fetchpriority: priority ? 'high' : undefined,
  })}></picture>`;
}

export const external = (href) => /^https?:\/\//.test(href) && !href.startsWith(site.url);

// Link helper: external links open in a new tab and say so to screen readers.
export function link(href, inner, { className = '', label } = {}) {
  const ext = external(href);
  return `<a${attrs({ href, class: className || undefined, target: ext ? '_blank' : undefined, rel: ext ? 'noopener' : undefined, 'aria-label': label })}>${inner}${
    ext ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''
  }</a>`;
}

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-left': '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><path d="M9 10.5 11 12.5 15 8.5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
  quote: '<path d="M10 7H6a3 3 0 0 0-3 3v4h5v-4H5m14-3h-4a3 3 0 0 0-3 3v4h5v-4h-3" />',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  spark: '<path d="M12 2c.6 4.8 2.9 7.3 8 8-5.1.7-7.4 3.2-8 8-.6-4.8-2.9-7.3-8-8 5.1-.7 7.4-3.2 8-8z" fill="currentColor" stroke="none"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4.2"/>',
};

export function icon(name, { className = 'icon', label } = {}) {
  const body = ICONS[name];
  if (!body) throw new Error(`Unknown icon ${name}`);
  const a11y = label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true" focusable="false"';
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${a11y}>${body}</svg>`;
}

// Arrow button content, the arrow slides on hover.
export const btnInner = (text, iconName = 'arrow') =>
  `<span class="btn__label">${text}</span><span class="btn__icon" aria-hidden="true">${icon(iconName)}${icon(iconName)}</span>`;

export function button(href, text, { variant = 'ink', size = '', iconName, className = '' } = {}) {
  const ext = external(href);
  const ico = iconName || (ext ? 'arrow-up-right' : 'arrow');
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, className].filter(Boolean).join(' ');
  return link(href, btnInner(text, ico), { className: cls });
}

export const kicker = (text, extra = '') => `<div class="kicker${extra ? ' ' + extra : ''}">${text}</div>`;

export const readingTime = (text) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

export const formatDate = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// Preload hint that matches the AVIF source of picture(), so the browser fetches the hero image early, once.
export function preloadImage(name, sizes = '100vw') {
  const m = imageMeta(name);
  const set = m.widths.map((w) => `/assets/img/${name}-${w}.avif ${w}w`).join(', ');
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${set}" imagesizes="${sizes}" fetchpriority="high">`;
}
