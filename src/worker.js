/**
 * The Hummingbird Nest website Worker.
 *
 * Static files in dist/ are served by Workers Static Assets. This script runs
 * first for every request (run_worker_first in wrangler.jsonc) so it can:
 *
 *   Redirect thehummingbirdnest.org to www.thehummingbirdnest.org (CANONICAL_HOST).
 *   GET  /blog          301 to /resources#blog (the blog moved onto the Resources page).
 *   GET  /about/        301 to /about (one permanent address per page, also for /about.html).
 *   GET  /api/instagram Latest Instagram posts for the home page, from the copy of the Behold feed kept in KV.
 *   Add security headers and cache rules to every page and file.
 *
 * On a schedule (triggers.crons in wrangler.jsonc) it reads the Behold JSON feed and keeps a
 * tidied copy in Workers KV, so visitors never cause a request to Behold (see instagram below).
 *
 * The contact form does not use the Worker: the browser sends it straight to FormSubmit
 * (formsubmit.co), which emails it to the practice (see site/scripts/form.js and DEPLOY.md).
 *
 * Configuration (wrangler.jsonc):
 *   CANONICAL_HOST        www.thehummingbirdnest.org
 *   BEHOLD_FEED_ID        optional, the Behold JSON feed ID (or the whole feed URL) for the Instagram section
 *   INSTAGRAM             KV namespace that holds the latest copy of the feed
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
      return instagram(env);
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

  // Cron trigger: refresh the stored copy of the Instagram feed.
  async scheduled(controller, env) {
    const id = beholdFeedId(env);
    if (id && env.INSTAGRAM) await refreshInstagram(env, id);
  },
};

// Instagram: Behold keeps the Instagram connection alive and hosts resized images.
//
// Behold's free plan allows 1,200 feed loads a month (the account is paused until the next
// month if it goes over) and refreshes from Instagram once a day. So visitors never reach
// Behold: the cron trigger reads the feed every three hours (about 250 loads a month) and
// keeps a trimmed, validated copy in KV, and /api/instagram only reads that copy. Caching
// alone could not promise this: the Cache API does nothing on workers.dev, and elsewhere
// each Cloudflare data center keeps its own copy.
const INSTAGRAM_FALLBACK = { ok: true, configured: false, username: 'thehummingbirdnestlcf', posts: [] };
const SAFE_IMAGE_HOST = /(^|\.)behold\.pictures$|\.cdninstagram\.com$|\.fbcdn\.net$/;
// The last good copy is kept for two weeks, so a Behold outage or a paused month leaves the
// latest posts showing; after that the section falls back to the practice's own photos.
const INSTAGRAM_KEEP_SECONDS = 14 * 86400;
// When the feed has never been stored (just after the ID is set), the first visit fills it.
// If that fails, visits wait this long before trying again, so a wrong ID or a paused
// account cannot turn every visit into a request to Behold.
const INSTAGRAM_RETRY_SECONDS = 3 * 3600;

// The ID from wrangler.jsonc. The whole feed URL (https://feeds.behold.so/AbCdEf123456)
// is accepted too, in case it is pasted instead of just the ID.
function beholdFeedId(env) {
  const id = String(env.BEHOLD_FEED_ID || '')
    .trim()
    .replace(/^https?:\/\/feeds\.behold\.so\//i, '')
    .replace(/[/?#].*$/, '');
  return /^[A-Za-z0-9_-]{8,64}$/.test(id) ? id : '';
}

async function instagram(env) {
  const id = beholdFeedId(env);
  if (!id || !env.INSTAGRAM) {
    return json(200, INSTAGRAM_FALLBACK, { 'Cache-Control': 'public, max-age=300' });
  }
  let feed = await env.INSTAGRAM.get(`feed:${id}`, { type: 'json', cacheTtl: 300 }).catch(() => null);
  if (!feed && !(await env.INSTAGRAM.get(`retry:${id}`).catch(() => null))) {
    feed = await refreshInstagram(env, id);
  }
  if (!feed || !Array.isArray(feed.posts)) {
    return json(200, INSTAGRAM_FALLBACK, { 'Cache-Control': 'public, max-age=300' });
  }
  return json(
    200,
    { ok: true, configured: true, username: feed.username, updated: feed.updated, posts: feed.posts },
    { 'Cache-Control': 'public, max-age=900' }
  );
}

// Read the Behold feed and store the tidied copy. Returns the copy, or null on failure
// (the previous copy, if any, stays in place).
async function refreshInstagram(env, id) {
  try {
    const res = await fetch(`https://feeds.behold.so/${id}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Behold answered ${res.status}`);
    const feed = tidyFeed(await res.json());
    await env.INSTAGRAM.put(`feed:${id}`, JSON.stringify(feed), { expirationTtl: INSTAGRAM_KEEP_SECONDS });
    console.log(`instagram feed stored: ${feed.posts.length} posts from @${feed.username}`);
    return feed;
  } catch (err) {
    console.error('instagram feed refresh failed:', err && err.message);
    await env.INSTAGRAM.put(`retry:${id}`, '1', { expirationTtl: INSTAGRAM_RETRY_SECONDS }).catch(() => {});
    return null;
  }
}

// Keep only what the page needs, with Instagram links and Behold or Instagram image addresses only.
function tidyFeed(feed) {
  if (!feed || !Array.isArray(feed.posts)) throw new Error('Behold sent a feed without posts');
  const posts = feed.posts
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
  return { username, updated: new Date().toISOString(), posts };
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
