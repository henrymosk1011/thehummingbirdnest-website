// The Hummingbird Nest: interaction and motion.
// Everything here is progressive: the site is complete without it, and visitors
// who ask their device to reduce motion get a calm, static version.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initForms } from './form.js';
import { initInstagram } from './instagram.js';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
root.classList.add('js-ready');
if (reduce) root.classList.add('reduce-motion');

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* Dates that stay current */
const year = new Date().getFullYear();
$$('[data-year]').forEach((el) => (el.textContent = year));
$$('[data-years-since]').forEach((el) => (el.textContent = year - Number(el.dataset.yearsSince)));

/* Smooth scrolling */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, stopInertiaOnNavigate: true });
  root.classList.add('has-lenis');
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToY = (y, immediate = false) => {
  if (lenis) lenis.scrollTo(y, { immediate, force: true });
  else window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
};

// In page links: scroll, then move focus so keyboard and screen reader users land in the right place.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const y = target.getBoundingClientRect().top + window.scrollY - (id === 'main' ? 0 : headerOffset());
  scrollToY(y, id === 'main');
  if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.pushState(null, '', `#${id}`);
});
const headerOffset = () => ($('[data-header]')?.offsetHeight || 80) + 24;
if (location.hash && lenis) {
  const t = document.getElementById(location.hash.slice(1));
  if (t) window.addEventListener('load', () => scrollToY(t.getBoundingClientRect().top + window.scrollY - headerOffset(), true));
}

/* Header: compact on scroll, hides while reading down, returns on scroll up, switches theme over dark sections */
const header = $('[data-header]');
let lastY = window.scrollY;
let menuOpen = false;
let megaOpen = false;
const darkSources = new Set();
function setHeaderDark(key, on) {
  on ? darkSources.add(key) : darkSources.delete(key);
  header?.classList.toggle('is-dark', darkSources.size > 0);
}
function onScroll() {
  const y = window.scrollY;
  if (!header) return;
  header.classList.toggle('is-scrolled', y > 24);
  if (!menuOpen && !megaOpen && !header.contains(document.activeElement)) {
    if (y > lastY + 6 && y > 240) header.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 240) header.classList.remove('is-hidden');
  }
  lastY = y;
}
if (lenis) lenis.on('scroll', onScroll);
else window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

$$('[data-header-theme="dark"]').forEach((section, i) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top 44px',
    end: 'bottom 44px',
    onToggle: (self) => setHeaderDark(`s${i}`, self.isActive),
  });
});

/* Services menu */
$$('[data-mega]').forEach((item) => {
  const btn = $('[data-mega-toggle]', item);
  const panel = $('[data-mega-panel]', item);
  let timer;
  const open = () => {
    clearTimeout(timer);
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    megaOpen = true;
    header.classList.remove('is-hidden');
  };
  const close = (returnFocus = false) => {
    clearTimeout(timer);
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    megaOpen = false;
    if (returnFocus) btn.focus();
  };
  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  if (finePointer) {
    item.addEventListener('pointerenter', open);
    item.addEventListener('pointerleave', () => (timer = setTimeout(close, 260)));
  }
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      e.stopPropagation();
      close(true);
    }
  });
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) close();
  });
  document.addEventListener('click', (e) => {
    if (!item.contains(e.target)) close();
  });
});

/* Mobile menu (native dialog) */
const menu = $('[data-menu]');
const menuOpenBtn = $('[data-menu-open]');
if (menu && menuOpenBtn) {
  const closeMenu = () => {
    if (!menu.open) return;
    if (reduce) return menu.close();
    menu.classList.add('is-closing');
    menu.addEventListener(
      'animationend',
      () => {
        menu.classList.remove('is-closing');
        menu.close();
      },
      { once: true }
    );
  };
  menuOpenBtn.addEventListener('click', () => {
    menu.showModal();
    menuOpen = true;
    lenis?.stop();
  });
  $('[data-menu-close]', menu)?.addEventListener('click', closeMenu);
  menu.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeMenu();
  });
  menu.addEventListener('close', () => {
    menuOpen = false;
    lenis?.start();
    menuOpenBtn.focus();
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });
}

/* Split headings into words */
function splitWords(el, cls = 'w') {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let i = 0;
  const words = [];
  for (const node of nodes) {
    if (!node.textContent.trim()) continue;
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = cls;
      if (cls === 'w') {
        const inner = document.createElement('span');
        inner.textContent = part;
        inner.style.setProperty('--i', i++);
        w.appendChild(inner);
      } else {
        w.textContent = part;
      }
      words.push(w);
      frag.appendChild(w);
    });
    node.parentNode.replaceChild(frag, node);
  }
  return words;
}
if (!reduce) {
  $$('[data-split]').forEach((el) => {
    splitWords(el);
    el.classList.add('is-split');
  });
}

/* Reveal on scroll */
const revealTargets = $$('[data-reveal], [data-clip], [data-split], [data-hero-reveal]');
$$('[data-reveal-group]').forEach((group) => {
  $$('[data-reveal]', group).forEach((el, i) => el.style.setProperty('--delay', `${Math.min(i, 6) * 0.09}s`));
});
if (reduce || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  revealTargets.forEach((el) => io.observe(el));
}

/* Large statement: words fill with color as you read (both colors meet contrast requirements) */
if (!reduce) {
  $$('[data-fill-text]').forEach((el) => {
    const words = splitWords(el, 'word');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      end: 'bottom 52%',
      scrub: true,
      onUpdate: (self) => {
        const lit = Math.round(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
      },
    });
  });
}

/* Image parallax (uses the independent `translate` property so it never fights other transforms) */
if (!reduce) {
  $$('[data-parallax]').forEach((pic) => {
    const img = pic.querySelector('img');
    const amount = Number(pic.dataset.parallax) || 0.1;
    const frame = pic.parentElement;
    ScrollTrigger.create({
      trigger: frame,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        img.style.translate = `0 ${((self.progress - 0.5) * amount * 100).toFixed(2)}%`;
      },
    });
  });
}

/* Video: plays only when visible, respects the pause button everywhere, never autoplays for reduced motion */
const VIDEO_KEY = 'hn-video-paused';
const userPaused = () => {
  try {
    return localStorage.getItem(VIDEO_KEY) === '1';
  } catch {
    return false;
  }
};
const videos = $$('[data-video]');
const toggles = $$('[data-video-toggle]');
function syncToggles() {
  const paused = reduce ? !videos.some((v) => !v.paused) : userPaused();
  toggles.forEach((t) => {
    t.classList.toggle('is-paused', paused);
    $('.video-toggle__label', t).textContent = paused ? 'Play video' : 'Pause video';
  });
}
function tryPlay(v) {
  if (reduce && !v.dataset.userPlay) return;
  if (!reduce && userPaused()) return;
  if (v.dataset.lazyVideo !== undefined && !v.dataset.loaded) {
    v.dataset.loaded = '1';
    v.preload = 'auto';
    v.load();
  }
  const p = v.play();
  if (p && p.catch) p.catch(() => {});
}
if ('IntersectionObserver' in window) {
  const vio = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? tryPlay(e.target) : e.target.pause())),
    { rootMargin: '200px 0px', threshold: 0.01 }
  );
  videos.forEach((v) => vio.observe(v));
}
toggles.forEach((t) =>
  t.addEventListener('click', () => {
    const video = t.closest('[data-hero-media], .finale')?.querySelector('video') || videos[0];
    if (!video) return;
    if (video.paused) {
      video.dataset.userPlay = '1';
      try {
        localStorage.removeItem(VIDEO_KEY);
      } catch {}
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      videos.forEach((v) => v.pause());
      try {
        localStorage.setItem(VIDEO_KEY, '1');
      } catch {}
    }
    setTimeout(syncToggles, 30);
  })
);
videos.forEach((v) => {
  v.addEventListener('play', syncToggles);
  v.addEventListener('pause', syncToggles);
});
syncToggles();

/* Hero: the video window opens up to full screen while the headline lifts away.
 * Only when the headline and buttons fit comfortably above the window (wide screens).
 * On phones and short screens the video sits below the copy as a card, so nothing overlaps. */
const hero = $('[data-hero]');
if (hero && !reduce) {
  const media = $('[data-hero-media]', hero);
  const copy = $('[data-hero-copy]', hero);
  let state = {};
  let st = null;
  const fits = () => {
    const content = [...copy.children].reduce((sum, el) => sum + el.offsetHeight, 0) + 70;
    return window.innerWidth >= 900 && content + headerOffset() < window.innerHeight * 0.66;
  };
  const measure = () => {
    const vh = window.innerHeight;
    const gutter = parseFloat(getComputedStyle(copy).paddingLeft) || 24;
    const copyBottom = copy.offsetTop + copy.offsetHeight;
    state = {
      top: Math.min(copyBottom + Math.max(24, vh * 0.035), vh * 0.74),
      x: gutter,
      bottom: Math.max(16, gutter * 0.6),
      r: Math.min(40, Math.max(24, window.innerWidth * 0.03)),
    };
  };
  const apply = (p) => {
    const k = easeInOut(clamp(p / 0.62));
    const s = easeOut(clamp((p - 0.5) / 0.3));
    media.style.setProperty('--clip-top', `${(state.top * (1 - k)).toFixed(1)}px`);
    media.style.setProperty('--clip-x', `${(state.x * (1 - k)).toFixed(1)}px`);
    media.style.setProperty('--clip-bottom', `${(state.bottom * (1 - k)).toFixed(1)}px`);
    media.style.setProperty('--clip-r', `${(state.r * (1 - k)).toFixed(1)}px`);
    media.style.setProperty('--clip-x-px', `${(state.x * (1 - k)).toFixed(1)}px`);
    media.style.setProperty('--clip-bottom-px', `${(state.bottom * (1 - k)).toFixed(1)}px`);
    media.style.setProperty('--video-scale', (1.16 - 0.16 * k).toFixed(4));
    media.style.setProperty('--statement', s.toFixed(3));
    copy.style.transform = `translate3d(0, ${(-k * 140).toFixed(1)}px, 0)`;
    copy.style.opacity = (1 - k * 1.6).toFixed(3);
    copy.style.visibility = k > 0.62 ? 'hidden' : '';
    setHeaderDark('hero', k > 0.9);
  };
  const enable = () => {
    hero.classList.add('is-enhanced');
    measure();
    st = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => {
        measure();
        apply(self.progress);
      },
    });
    apply(st.progress || 0);
  };
  const disable = () => {
    st?.kill();
    st = null;
    hero.classList.remove('is-enhanced');
    media.removeAttribute('style');
    copy.removeAttribute('style');
    setHeaderDark('hero', false);
  };
  const decide = () => {
    const want = fits();
    if (want && !st) enable();
    else if (!want && st) disable();
  };
  decide();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      decide();
      ScrollTrigger.refresh();
    }, 200);
  });
  // Re measure when the headline reflows (web fonts arriving).
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (!st) return decide();
      measure();
      apply(st.progress || 0);
    }).observe(copy);
  }
  // If someone tabs into the headline after it has faded, bring it back into view.
  copy.addEventListener('focusin', () => {
    if (st && st.progress > 0.05) scrollToY(0, true);
  });
}

/* Signature section: cards rise in at staggered heights, settle, and lock into a row */
const stage = $('[data-stack]');
if (stage) {
  const section = stage.closest('.stack');
  const cards = $$('[data-stack-card]', stage);
  const words = $$('[data-stack-word]', stage);
  const tilt = [-7, 6, -5];
  const update = () => {
    const vh = window.innerHeight;
    const small = window.innerWidth < 900;
    let active = -1;
    cards.forEach((card, i) => {
      const col = card.parentElement;
      const stick = parseFloat(getComputedStyle(card).top) || 0;
      const colTop = col.getBoundingClientRect().top;
      const p = clamp((vh - colTop) / Math.max(1, vh - stick));
      if (p >= 0.55) active = i;
      if (reduce) return;
      const e = easeOut(p);
      const rot = (small ? tilt[i] * 0.4 : tilt[i]) * (1 - e);
      card.style.transform = `translate3d(0, ${((1 - e) * 70).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${(0.86 + 0.14 * e).toFixed(4)})`;
      const img = card.querySelector('img');
      if (img) img.style.scale = (1.28 - 0.28 * e).toFixed(4);
      const body = card.querySelector('.stack-card__body');
      if (body) body.style.opacity = clamp((p - 0.35) / 0.5).toFixed(3);
    });
    words.forEach((w, i) => w.classList.toggle('is-active', i === Math.max(0, active)));
    if (active >= 0) section.dataset.tone = cards[active].dataset.tone;
    else delete section.dataset.tone;
  };
  ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: update });
  update();
}

/* Horizontal scroll: vertical scrolling moves the track sideways while the section is pinned */
const mm = gsap.matchMedia();
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const cleanups = $$('[data-hscroll]').map((section) => {
    const track = $('[data-hscroll-track]', section);
    const items = $$('[data-hscroll-item]', section);
    const counter = $('[data-hscroll-current]', section);
    section.classList.add('is-pinned');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (counter) counter.textContent = String(Math.min(items.length, Math.round(self.progress * (items.length - 1)) + 1)).padStart(2, '0');
        },
      },
    });
    // Keyboard users: when focus lands on a card, scroll the page so that card is on screen.
    const onFocus = (e) => {
      const item = e.target.closest('[data-hscroll-item]');
      const st = tween.scrollTrigger;
      if (!item || !st) return;
      const target = clamp((item.offsetLeft - (window.innerWidth - item.offsetWidth) / 2) / Math.max(1, distance()));
      scrollToY(st.start + target * (st.end - st.start), true);
    };
    track.addEventListener('focusin', onFocus);
    return () => {
      track.removeEventListener('focusin', onFocus);
      section.classList.remove('is-pinned');
    };
  });
  return () => cleanups.forEach((fn) => fn());
});
// Native horizontal scrolling (mobile and reduced motion): keep the counter in sync.
$$('[data-hscroll]').forEach((section) => {
  const viewport = $('[data-hscroll-viewport]', section);
  const items = $$('[data-hscroll-item]', section);
  const counter = $('[data-hscroll-current]', section);
  viewport?.addEventListener(
    'scroll',
    () => {
      if (section.classList.contains('is-pinned') || !counter) return;
      const step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : 1;
      counter.textContent = String(Math.min(items.length, Math.round(viewport.scrollLeft / step) + 1)).padStart(2, '0');
    },
    { passive: true }
  );
});

/* Marquee of neighborhoods, driven by scrolling (it never moves on its own) */
const marquee = $('[data-marquee]');
if (marquee && !reduce) {
  let groupW = marquee.firstElementChild.offsetWidth;
  const setX = () => {
    const offset = (window.scrollY * 0.5) % groupW;
    marquee.style.transform = `translate3d(${-offset.toFixed(1)}px, 0, 0)`;
  };
  ScrollTrigger.create({
    trigger: marquee,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: setX,
    onRefresh: () => {
      groupW = marquee.firstElementChild.offsetWidth;
      setX();
    },
  });
}

/* Finale: giant type settles into place as it arrives */
const finaleTitle = $('[data-finale-title]');
if (finaleTitle && !reduce) {
  gsap.fromTo(
    finaleTitle,
    { scale: 0.78, yPercent: 18 },
    { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-finale]', start: 'top bottom', end: 'top 15%', scrub: true } }
  );
}

/* Testimonials carousel */
$$('[data-carousel]').forEach((carousel) => {
  const track = $('[data-carousel-track]', carousel);
  const slides = $$('[data-carousel-slide]', carousel);
  const prev = $('[data-carousel-prev]', carousel);
  const next = $('[data-carousel-next]', carousel);
  const current = $('[data-carousel-current]', carousel);
  if (!track || !slides.length) return;
  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : slides[0].offsetWidth);
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const index = Math.round(track.scrollLeft / step());
    if (current) current.textContent = String(Math.min(slides.length, index + 1)).padStart(2, '0');
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

/* FAQ accordions with a smooth height animation */
$$('[data-accordion]').forEach((details) => {
  const summary = $('summary', details);
  const panel = $('.faq__answer', details);
  if (reduce || !panel.animate) return;
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    const opts = { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
    if (details.open) {
      const h = panel.offsetHeight;
      panel.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], opts).onfinish = () => {
        details.open = false;
        ScrollTrigger.refresh();
      };
    } else {
      details.open = true;
      const h = panel.offsetHeight;
      panel.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], opts).onfinish = () => ScrollTrigger.refresh();
    }
  });
});

/* Instagram feed on the home page */
initInstagram({ reduce });

/* Forms */
initForms();

/* Keep scroll positions accurate after fonts and images settle */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
