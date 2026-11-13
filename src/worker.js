/**
 * The Hummingbird Nest website Worker.
 *
 * Static files in dist/ are served by Workers Static Assets. This script runs
 * first for every request (run_worker_first in wrangler.jsonc) so it can:
 *
 *   Redirect thehummingbirdnest.org to www.thehummingbirdnest.org (CANONICAL_HOST).
 *   GET  /blog          301 to /resources#blog (the blog moved onto the Resources page).
 *   GET  /about/        301 to /about (one permanent address per page, also for /about.html).
 *   GET  /api/instagram Latest Instagram posts for the home page, read from a Behold JSON feed and cached.
 *   Add security headers and cache rules to every page and file.
 *
 * The contact form does not use the Worker: the browser sends it straight to FormSubmit
 * (formsubmit.co), which emails it to the practice (see site/scripts/form.js and DEPLOY.md).
 *
 * Configuration (vars in wrangler.jsonc):
 *   CANONICAL_HOST        www.thehummingbirdnest.org
 *   BEHOLD_FEED_ID        optional, the Behold JSON feed ID that powers the Instagram section
 */

// Where /edit sends the practice: the Blog posts screen of this site in Pages CMS.
const EDITOR_URL = 'https://app.pagescms.org/henrymosk1011/thehummingbirdnest-website/main/collection/posts';

// Google Analytics hosts are allowed ahead of time so analytics can be switched on
// from site/config.mjs without touching this file. FormSubmit receives the contact form.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com",
  "style-src 'self'",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://behold.pictures https://*.behold.pictures https://*.cdninstagram.com https://*.fbcdn.net",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://formsubmit.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://formsubmit.co",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // thehummingbirdnest.org -> www.thehummingbirdnest.org
    const canonical = env.CANONICAL_HOST;
    if (canonical && url.hostname !== canonical && url.hostname === canonical.replace(/^www\./, '')) {
      url.hostname = canonical;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/instagram') {
      return instagram(env, ctx);
    }

    if (url.pathname.startsWith('/api/')) {
      return json(404, { ok: false, error: 'Not found.' });
    }

    // Old Webflow paths that no longer exist.
    if (url.pathname === '/checkout' || url.pathname.startsWith('/pages/')) {
      return Response.redirect(`${url.origin}/`, 301);
    }

    // The blog now lives on the Resources page (posts and categories keep their addresses).
    if (url.pathname === '/blog' || url.pathname === '/blog/') {
      return Response.redirect(`${url.origin}/resources#blog`, 301);
    }

    // An easy address for the practice's editing screens: /edit opens the blog in Pages CMS
    // (sign in first if needed). Temporary (302) and not cached, so browsers never hold on
    // to it if the editor's address changes.
    if (url.pathname === '/edit' || url.pathname === '/edit/') {
      return new Response(null, { status: 302, headers: { Location: EDITOR_URL, 'Cache-Control': 'no-store' } });
    }

    const response = await env.ASSETS.fetch(request);

    // Static Assets answers /about/, /about.html and /index.html with a temporary (307)
    // redirect to the page's real address. Make it permanent, so search engines fold
    // those addresses, and any links pointing at them, into the real one.
    if (response.status === 307) {
      const location = response.headers.get('Location') || '';
      if (location.startsWith('/') && !location.startsWith('//')) {
        return Response.redirect(new URL(location, url.origin).toString(), 301);
      }
    }

    return withSiteHeaders(response, url);
  },
};

// Instagram: Behold keeps the Instagram connection alive and hosts resized images.
// The response is trimmed to what the page needs, validated, and cached at the edge.
const INSTAGRAM_FALLBACK = { ok: true, configured: false, username: 'thehummingbirdnestlcf', posts: [] };
const SAFE_IMAGE_HOST = /(^|\.)behold\.pictures$|\.cdninstagram\.com$|\.fbcdn\.net$/;

// Behold's free plan allows 1,200 feed loads a month and refreshes once a day, so the
// tidied feed is kept in Cloudflare's cache for two hours and Behold is asked rarely.
const INSTAGRAM_CACHE_SECONDS = 7200;

async function instagram(env, ctx) {
  const id = String(env.BEHOLD_FEED_ID || '').trim();
  if (!/^[A-Za-z0-9_]{8,64}$/.test(id)) {
    return json(200, INSTAGRAM_FALLBACK, { 'Cache-Control': 'public, max-age=300' });
  }
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(`https://instagram-feed.cache/${id}`);
  const hit = cache && (await cache.match(key).catch(() => null));
  if (hit) return hit;
  try {
    const res = await fetch(`https://feeds.behold.so/${id}`, {
      headers: { Accept: 'application/json' },
      cf: { cacheTtl: INSTAGRAM_CACHE_SECONDS, cacheEverything: true },
    });
    if (!res.ok) throw new Error(`behold responded ${res.status}`);
    const feed = await res.json();
    const posts = (Array.isArray(feed.posts) ? feed.posts : [])
      .map((p) => {
        const size = p.sizes && (p.sizes.medium || p.sizes.large || p.sizes.small);
        const image = (size && size.mediaUrl) || (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl);
        return {
          id: String(p.id || ''),
          url: safeUrl(p.permalink, /(^|\.)instagram\.com$/),
          image: safeUrl(image, SAFE_IMAGE_HOST),
          width: Number(size && size.width) || 700,
          height: Number(size && size.height) || 700,
          type: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'].includes(p.mediaType) ? p.mediaType : 'IMAGE',
          alt: plainText(p.altText, 300),
          caption: plainText(p.prunedCaption || p.caption, 280),
          timestamp: clean(p.timestamp || '', 40),
        };
      })
      .filter((p) => p.url && p.image)
      .slice(0, 10);
    const username = /^[A-Za-z0-9._]{1,30}$/.test(feed.username || '') ? feed.username : INSTAGRAM_FALLBACK.username;
    const response = json(200, { ok: true, configured: true, username, posts }, { 'Cache-Control': `public, max-age=600, s-maxage=${INSTAGRAM_CACHE_SECONDS}` });
    if (cache && ctx) ctx.waitUntil(cache.put(key, response.clone()).catch(() => {}));
    return response;
  } catch (err) {
    console.error('instagram feed failed', err && err.message);
    return json(200, INSTAGRAM_FALLBACK, { 'Cache-Control': 'public, max-age=120' });
  }
}

function plainText(value, max) {
  return clean(value, 2000)
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/#[\p{L}\p{N}_]+/gu, ' ')
    .replace(/\s*[\u2013\u2014\u2015]+\s*/g, ', ')
    .replace(/\s+-+\s+/g, ', ')
    .replace(/(\S)[-\u2010\u2011](?=\S)/g, '$1 ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/,(\s*,)+/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .slice(0, max);
}

function safeUrl(value, hostPattern) {
  try {
    const u = new URL(String(value || ''));
    return u.protocol === 'https:' && hostPattern.test(u.hostname) ? u.toString() : '';
  } catch {
    return '';
  }
}

function withSiteHeaders(response, url) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  const type = headers.get('Content-Type') || '';
  if (url.pathname.startsWith('/assets/')) {
    // CSS and JS URLs carry ?v=<hash> from the build, so they can be cached for a year.
    const versioned = url.searchParams.has('v') || url.pathname.startsWith('/assets/fonts/');
    headers.set('Cache-Control', versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=2592000');
  } else if (type.includes('text/html')) {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  // Keep preview URLs out of search results; only the real domain should be indexed.
  if (url.hostname.endsWith('.workers.dev')) headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  // Drop control characters except tab and newline, normalize line endings, trim.
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function json(status, payload, extra = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      ...extra,
    },
  });
}
