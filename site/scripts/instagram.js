// Home page Instagram section. The page ships with the practice's own photos; when the
// section comes near the screen we ask the Worker (/api/instagram) for the latest posts
// and swap them in. Selecting a post opens it in a lightbox on the page (a native dialog:
// focus stays inside, Escape closes it), with the full caption and a link to Instagram.

import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  expand: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
  prev: ['M15 18l-6-6 6-6'],
  next: ['m9 18 6-6-6-6'],
  out: ['M7 17 17 7', 'M8 7h9v9'],
};

// Two rows of tiles; the CSS sets four, three or two across.
const ROWS = 2;

function svgIcon(name, className = 'icon') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  ICONS[name].forEach((d) => {
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

const shorten = (s, n) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, '')}…` : t;
};

const postDate = (post) => {
  const date = post.timestamp ? new Date(post.timestamp) : null;
  return date && !isNaN(date) ? date : null;
};

const longDate = (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Name for a tile: the post's Instagram alt text, else the start of its caption.
function describe(post) {
  const kind = post.type === 'VIDEO' ? 'Instagram video' : 'Instagram post';
  if (post.alt) return shorten(post.alt, 220);
  if (post.caption) return `${kind}: ${shorten(post.caption, 160)}`;
  const date = postDate(post);
  return date ? `${kind} from ${longDate(date)}` : kind;
}

// Slides for the lightbox. Older stored copies of the feed have none, so fall back to the tile image.
const slidesOf = (post) =>
  Array.isArray(post.slides) && post.slides.length ? post.slides : [{ image: post.image, width: post.width, height: post.height, alt: post.alt }];

function tile(post, index, open) {
  const li = el('li', 'insta__item');
  const button = el('button', 'insta__tile insta__tile--live');
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', () => open(index, button));

  const cover = slidesOf(post)[0];
  const img = el('img');
  img.alt = describe(post);
  img.width = post.width;
  img.height = post.height;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
  // The tile is square, so a tall photo is shown wider than the tile: offer the large size too.
  if (cover.image && cover.image !== post.image && post.type !== 'CAROUSEL_ALBUM') {
    img.srcset = `${post.image} ${post.width}w, ${cover.image} ${cover.width}w`;
    img.sizes = '(min-width: 1460px) 340px, (min-width: 1100px) 24vw, (min-width: 700px) 32vw, 48vw';
  }
  img.src = post.image;
  button.appendChild(img);

  const view = el('span', 'insta__view');
  view.setAttribute('aria-hidden', 'true');
  view.append('View post', svgIcon('expand'));
  button.appendChild(view);

  li.appendChild(button);
  return li;
}

// Tiles rise in one after another.
function stagger(grid) {
  [...grid.children].forEach((item, i) => item.style.setProperty('--i', String(i)));
}

// Show only whole rows: with fewer posts than two full rows, show one.
function fitRows(grid) {
  const items = [...grid.children];
  const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
  const show = Math.min(ROWS, Math.floor(items.length / columns)) * columns;
  items.forEach((item, i) => (item.hidden = i >= show));
}

/* Lightbox */

function createLightbox({ username, onOpen, onClose }) {
  const dialog = el('dialog', 'lightbox');
  dialog.setAttribute('aria-label', 'Instagram post');

  const close = el('button', 'lightbox__close lightbox__round');
  close.type = 'button';
  close.autofocus = true;
  close.setAttribute('aria-label', 'Close');
  close.appendChild(svgIcon('close'));

  const frame = el('div', 'lightbox__frame');
  const media = el('div', 'lightbox__media');
  const stage = el('div', 'lightbox__stage');
  const stepPrev = el('button', 'lightbox__step lightbox__step--prev lightbox__round');
  stepPrev.type = 'button';
  stepPrev.setAttribute('aria-label', 'Previous photo');
  stepPrev.appendChild(svgIcon('prev'));
  const stepNext = el('button', 'lightbox__step lightbox__step--next lightbox__round');
  stepNext.type = 'button';
  stepNext.setAttribute('aria-label', 'Next photo');
  stepNext.appendChild(svgIcon('next'));
  const count = el('p', 'lightbox__count');
  count.setAttribute('aria-hidden', 'true');
  media.append(stage, stepPrev, stepNext, count);

  const side = el('div', 'lightbox__side');
  const head = el('div', 'lightbox__head');
  const user = el('a', 'lightbox__user');
  user.href = `https://www.instagram.com/${username}/`;
  user.target = '_blank';
  user.rel = 'noopener';
  user.append(el('span', '', `@${username}`), el('span', 'visually-hidden', ' (opens in a new tab)'));
  const date = el('time', 'lightbox__date');
  head.append(user, date);

  const caption = el('div', 'lightbox__caption');
  caption.tabIndex = 0;
  caption.setAttribute('role', 'region');
  caption.setAttribute('aria-label', 'Caption');

  const foot = el('div', 'lightbox__foot');
  const link = el('a', 'btn btn--sm lightbox__link');
  link.target = '_blank';
  link.rel = 'noopener';
  const linkIcon = el('span', 'btn__icon');
  linkIcon.setAttribute('aria-hidden', 'true');
  linkIcon.append(svgIcon('out'), svgIcon('out'));
  link.append(el('span', 'btn__label', 'View on Instagram'), linkIcon, el('span', 'visually-hidden', ' (opens in a new tab)'));
  const pager = el('div', 'lightbox__pager');
  const prev = el('button', 'lightbox__round');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous post');
  prev.appendChild(svgIcon('prev'));
  const position = el('span', 'lightbox__position');
  position.setAttribute('aria-hidden', 'true');
  const next = el('button', 'lightbox__round');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next post');
  next.appendChild(svgIcon('next'));
  pager.append(prev, position, next);
  foot.append(link, pager);

  // Screen readers hear where they are after moving between posts or photos.
  const status = el('p', 'visually-hidden');
  status.setAttribute('role', 'status');

  side.append(head, caption, foot);
  frame.append(close, media, side);
  dialog.append(frame, status);
  document.body.appendChild(dialog);

  let posts = [];
  let index = 0;
  let slides = [];
  let slideIndex = 0;
  let opener = null;

  const stopVideo = () => stage.querySelectorAll('video').forEach((v) => v.pause());

  function showImage(slide, alt) {
    const img = el('img');
    img.alt = alt;
    img.width = slide.width;
    img.height = slide.height;
    img.decoding = 'async';
    if (slide.full && slide.fullWidth) {
      img.srcset = `${slide.image} ${slide.width}w, ${slide.full} ${slide.fullWidth}w`;
      img.sizes = '(min-width: 900px) 62vw, 100vw';
    }
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
    img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    img.src = slide.image;
    return img;
  }

  function showSlide() {
    stopVideo();
    const post = posts[index];
    const slide = slides[slideIndex];
    const many = slides.length > 1;
    const alt = slide.alt || post.alt || (many ? `Photo ${slideIndex + 1} of ${slides.length} from this post` : 'Photo from this post');
    if (slide.video) {
      const video = el('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.poster = slide.image;
      video.width = slide.width;
      video.height = slide.height;
      video.setAttribute('aria-label', 'Video from this post');
      // Instagram's video links expire; if one no longer plays, show the still and point to Instagram.
      video.addEventListener(
        'error',
        () => {
          const still = el('div', 'lightbox__still');
          const watch = el('a', 'btn btn--sm btn--dark lightbox__watch');
          watch.href = post.url;
          watch.target = '_blank';
          watch.rel = 'noopener';
          const icon = el('span', 'btn__icon');
          icon.setAttribute('aria-hidden', 'true');
          icon.append(svgIcon('out'), svgIcon('out'));
          watch.append(el('span', 'btn__label', 'Watch on Instagram'), icon, el('span', 'visually-hidden', ' (opens in a new tab)'));
          still.append(showImage(slide, 'Still from this video'), watch);
          video.replaceWith(still);
        },
        { once: true }
      );
      video.src = slide.video;
      stage.replaceChildren(video);
      // Reels start on their own, like the hero video: never for visitors who ask for reduced
      // motion, and muted if the browser does not allow sound (the controls can turn it on).
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.play().catch((err) => {
          if (err && err.name === 'NotAllowedError' && video.isConnected) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    } else {
      stage.replaceChildren(showImage(slide, alt));
    }
    stepPrev.hidden = stepNext.hidden = count.hidden = !many;
    count.textContent = many ? `${slideIndex + 1} / ${slides.length}` : '';
  }

  function showPost() {
    const post = posts[index];
    slides = slidesOf(post);
    slideIndex = 0;
    showSlide();
    const when = postDate(post);
    date.textContent = when ? longDate(when) : '';
    if (when) date.dateTime = when.toISOString();
    caption.textContent = post.text || post.caption || '';
    caption.hidden = !caption.textContent;
    caption.scrollTop = 0;
    link.href = post.url;
    position.textContent = `${index + 1} of ${posts.length}`;
    prev.hidden = next.hidden = position.hidden = posts.length < 2;
    dialog.setAttribute('aria-label', `Instagram post ${index + 1} of ${posts.length}`);
  }

  function goPost(step) {
    index = (index + step + posts.length) % posts.length;
    showPost();
    status.textContent = `Post ${index + 1} of ${posts.length}`;
  }

  function goSlide(step) {
    slideIndex = (slideIndex + step + slides.length) % slides.length;
    showSlide();
    status.textContent = `Photo ${slideIndex + 1} of ${slides.length}`;
  }

  prev.addEventListener('click', () => goPost(-1));
  next.addEventListener('click', () => goPost(1));
  stepPrev.addEventListener('click', () => goSlide(-1));
  stepNext.addEventListener('click', () => goSlide(1));
  close.addEventListener('click', () => dialog.close());
  // A click on the dimmed area around the frame closes it.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  // Left and right arrow keys move between posts (not while a video's controls have focus).
  dialog.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('video')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      goPost(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('close', () => {
    stopVideo();
    stage.replaceChildren();
    status.textContent = '';
    document.documentElement.classList.remove('lightbox-open');
    onClose();
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });

  return {
    open(list, i, from) {
      posts = list;
      index = i;
      opener = from;
      document.documentElement.classList.add('lightbox-open');
      onOpen();
      // Open first, then fill it, so a reel starts playing in a visible dialog.
      dialog.showModal();
      showPost();
    },
  };
}

export function initInstagram({ onOpen = () => {}, onClose = () => {} } = {}) {
  const section = document.querySelector('[data-insta]');
  const grid = section && section.querySelector('[data-insta-grid]');
  if (!grid) return;
  stagger(grid);

  let requested = false;
  const load = () => {
    if (requested) return;
    requested = true;
    fetch('/api/instagram', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const posts = (data && Array.isArray(data.posts) ? data.posts : []).filter((p) => p && p.url && p.image);
        // Keep our own photos unless there are enough posts for at least one full row.
        if (posts.length < 4 || typeof HTMLDialogElement !== 'function') return;
        // Never pull focus away from someone who is already tabbing through the grid.
        if (grid.contains(document.activeElement)) return;
        let lightbox = null;
        const open = (i, from) => {
          lightbox = lightbox || createLightbox({ username: data.username || 'thehummingbirdnestlcf', onOpen, onClose });
          lightbox.open(posts, i, from);
        };
        grid.replaceChildren(...posts.map((post, i) => tile(post, i, open)));
        grid.classList.add('is-live');
        stagger(grid);
        fitRows(grid);
        // The number of columns only changes at the CSS breakpoints.
        ['(max-width: 1099px)', '(max-width: 699px)'].forEach((q) => window.matchMedia(q).addEventListener('change', () => fitRows(grid)));
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
}
