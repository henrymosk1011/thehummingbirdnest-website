// Home page Instagram section. The page ships with our own photos; when the
// section comes near the screen we ask the Worker (/api/instagram) for the
// latest posts and swap them in. Each post links to Instagram in a new tab.

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TYPE_LABEL = { VIDEO: 'Video', CAROUSEL_ALBUM: 'Gallery' };

function svgIcon(paths) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  paths.forEach((d) => {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    svg.appendChild(p);
  });
  return svg;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function describe(post) {
  const words = (s, n) => {
    const t = s.replace(/\s+/g, ' ').trim();
    return t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')}…` : t;
  };
  if (post.alt) return words(post.alt, 220);
  if (post.caption) return `Instagram post: ${words(post.caption, 160)}`;
  const date = post.timestamp ? new Date(post.timestamp) : null;
  return date && !isNaN(date)
    ? `Instagram post from ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : 'Instagram post';
}

function tile(post) {
  const li = el('li', 'insta__item');
  const a = el('a', 'insta__tile insta__tile--live');
  a.href = post.url;
  a.target = '_blank';
  a.rel = 'noopener';

  const img = el('img');
  img.alt = describe(post);
  img.width = post.width;
  img.height = post.height;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
  img.src = post.image;
  a.appendChild(img);

  const label = TYPE_LABEL[post.type];
  if (label) {
    const badge = el('span', 'insta__badge');
    badge.append(el('span', 'visually-hidden', ', '), label);
    a.appendChild(badge);
  }

  const view = el('span', 'insta__view');
  view.setAttribute('aria-hidden', 'true');
  view.append('View post', svgIcon(['M7 17 17 7', 'M8 7h9v9']));
  a.appendChild(view);
  a.appendChild(el('span', 'visually-hidden', ' (opens Instagram in a new tab)'));

  li.appendChild(a);
  return li;
}

// Use a count that fills whole rows at every screen size.
const usable = (n) => (n >= 10 ? 10 : n >= 6 ? 6 : n >= 4 ? 4 : 0);

// Rows drift in opposite directions on wide screens, so mark each tile with its row direction.
function layout(grid) {
  const items = [...grid.children];
  const cols = { 10: 5, 6: 3, 4: 4 }[items.length] || 5;
  items.forEach((item, i) => {
    item.style.setProperty('--i', String(i % cols + Math.floor(i / cols)));
    item.style.setProperty('--dir', Math.floor(i / cols) % 2 ? '-1' : '1');
  });
}

export function initInstagram({ reduce = false } = {}) {
  const section = document.querySelector('[data-insta]');
  const grid = section && section.querySelector('[data-insta-grid]');
  if (!grid) return;
  layout(grid);

  let requested = false;
  const load = () => {
    if (requested) return;
    requested = true;
    fetch('/api/instagram', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const posts = (data && Array.isArray(data.posts) ? data.posts : []).filter((p) => p && p.url && p.image);
        const count = usable(posts.length);
        if (!count) return;
        // Never pull focus away from someone who is already tabbing through the grid.
        if (grid.contains(document.activeElement)) return;
        grid.replaceChildren(...posts.slice(0, count).map(tile));
        grid.classList.add('is-live', `insta__grid--${count}`);
        layout(grid);
        ScrollTrigger.refresh();
      })
      .catch(() => {});
  };

  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          near.disconnect();
          load();
        }
      },
      { rootMargin: '900px 0px' }
    );
    near.observe(section);
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          seen.disconnect();
          grid.classList.add('is-in');
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    seen.observe(grid);
  } else {
    grid.classList.add('is-in');
    load();
  }

  // Wide screens: the two rows slide gently in opposite directions as the page scrolls.
  if (!reduce) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const amount = Math.min(56, window.innerWidth * 0.035);
        grid.style.setProperty('--drift', `${((self.progress - 0.5) * 2 * amount).toFixed(1)}px`);
      },
    });
  }
}
