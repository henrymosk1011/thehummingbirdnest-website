# Deploying The Hummingbird Nest

The site runs on **Cloudflare Workers** (static assets plus a small Worker for the contact form), builds from **GitHub**, and sends form email through **Resend**. The domain is registered at **GoDaddy**.

## Already set up

These were done through the Cloudflare and GitHub connectors:

* **Worker `thehummingbirdnest`** in Cloudflare (account henrymm@gmail.com), connected to `henrymosk1011/thehummingbirdnest-website`, using the same build settings as The Social Club site:
  * Production branch `main`: `npm run build`, then `npx wrangler deploy`
  * Every other branch: `npm run build`, then `npx wrangler preview` (a preview URL per branch)
  * workers.dev address: `https://thehummingbirdnest.henrymm.workers.dev` (marked `noindex` so it never competes with the real domain in Google)
* **Zone `thehummingbirdnest.org`** added to Cloudflare. It stays **pending** and changes nothing until the nameservers are switched at GoDaddy. The current DNS was imported so nothing breaks when you switch:

  | Type | Name | Value | Purpose |
  | --- | --- | --- | --- |
  | MX | @ | aspmx.l.google.com (1), alt1/alt2 (5), alt3/alt4 (10) | Google Workspace email |
  | TXT | @ | v=spf1 include:dc-aa8e722993._spfm.thehummingbirdnest.org ~all | SPF |
  | TXT | dc-aa8e722993._spfm | v=spf1 include:_spf.google.com ~all | SPF helper GoDaddy managed (looked up and copied) |
  | TXT | _dmarc | v=DMARC1; p=none; | DMARC |
  | TXT | @ | google-site-verification=CemfpJ3M... | Google Search Console (already verified by DNS) |
  | TXT | @ | pinterest-site-verification=e08df8... | Pinterest |
  | CNAME | www | cdn.webflow.com | Old Webflow site (replace at launch) |
  | A | @ | 198.202.211.1 | GoDaddy forwarding (replace at launch) |
  | CNAME | pay | paylinks.commerce.godaddy.com | GoDaddy payment links |
  | CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com | GoDaddy Domain Connect |

  Note: there is no Google DKIM record (`google._domainkey`) today. Turning on DKIM in Google Workspace Admin (Apps > Gmail > Authenticate email) and adding its TXT record in Cloudflare will improve email deliverability.

## 1. Publish to production

The current branch has already been built and deployed once, so you can review the new site right now at **https://thehummingbirdnest.henrymm.workers.dev**.

1. Open a pull request from `claude/charming-ptolemy-kcab42` into `main` (create `main` if it does not exist yet) and merge it.
2. Cloudflare builds and deploys automatically. Check progress in **Cloudflare > Workers and Pages > thehummingbirdnest > Deployments**.
3. Review it at `https://thehummingbirdnest.henrymm.workers.dev`.

## 2. Move DNS to Cloudflare (GoDaddy)

1. In GoDaddy, open **Domain Portfolio > thehummingbirdnest.org > DNS** and compare its records with the table above. If GoDaddy shows anything that is not in the table, add it in **Cloudflare > thehummingbirdnest.org > DNS > Records** first.
2. In GoDaddy, go to **DNS > Nameservers > Change Nameservers > I'll use my own nameservers** and enter:
   * `kira.ns.cloudflare.com`
   * `viddy.ns.cloudflare.com`
3. Wait for Cloudflare to show the zone as **Active** (usually under an hour, can take up to 24 hours). The old Webflow site and email keep working during and after the switch, because those records were copied.

## 3. Launch the new site on the domain

1. In **Cloudflare > thehummingbirdnest.org > DNS > Records**, delete the `www` CNAME to `cdn.webflow.com` and the `@` A record `198.202.211.1`.
2. In **Workers and Pages > thehummingbirdnest > Settings > Domains and Routes > Add > Custom domain**, add both:
   * `www.thehummingbirdnest.org`
   * `thehummingbirdnest.org`
3. The Worker sends the bare domain to `https://www.thehummingbirdnest.org` (the address Google already indexes) with a permanent redirect.
4. Turn off the custom domain in Webflow and cancel Webflow hosting once you are happy.

Every old URL is preserved (`/about`, `/services-1-1-therapy`, `/post/...`, `/blog-categories/...`), so existing Google rankings and bookmarks carry over.

## 4. Turn on the contact form (Resend)

The form is fully built. Until Resend is configured it politely tells visitors to call or email instead.

1. After upgrading Resend, add the sending domain **`forms.thehummingbirdnest.org`** (same pattern as `forms.starlighthh.com`).
2. Add the DNS records Resend shows (DKIM, SPF and MX on the `forms` subdomain) in **Cloudflare > thehummingbirdnest.org > DNS**, set to **DNS only** (grey cloud), then click **Verify** in Resend. These live on the subdomain, so they do not touch Google Workspace email.
3. In Resend, create an API key with **Sending access** limited to that domain.
4. In **Cloudflare > Workers and Pages > thehummingbirdnest > Settings > Variables and Secrets**, add a **Secret** named `RESEND_API_KEY` with that key. (Or run `npx wrangler secret put RESEND_API_KEY`.)
5. Submit a test message on `/contact`. It arrives at `info@thehummingbirdnest.org`, and replying goes straight to the visitor.

The sender and recipient are set in `wrangler.jsonc`:

```jsonc
"CONTACT_TO": "info@thehummingbirdnest.org",
"CONTACT_FROM": "The Hummingbird Nest <website@forms.thehummingbirdnest.org>",
```

Edit them there (not in the dashboard), because values in `wrangler.jsonc` are applied on every deploy. Secrets are kept between deploys.

Spam protection already included: same origin check, 5 messages per minute per visitor, a hidden honeypot field, and a minimum fill time.

### Optional: Cloudflare Turnstile

1. **Cloudflare > Turnstile > Add widget** for `www.thehummingbirdnest.org` and `thehummingbirdnest.org` (Managed mode).
2. Add `"TURNSTILE_SITE_KEY": "<site key>"` to `vars` in `wrangler.jsonc`.
3. Add a Secret `TURNSTILE_SECRET_KEY` with the secret key.

The form loads the check automatically once both are set.

## 5. Turn on the live Instagram feed (Behold)

The home page has an Instagram section. Until the feed is connected it shows the practice's own photos, so nothing looks broken. Once connected, it shows the latest posts from **@thehummingbirdnestlcf** and updates on its own whenever the client posts.

The old site used an Elfsight widget, which is now disabled on Elfsight's side. This site uses **Behold** instead: no third party script runs on the page, the photos load fast, and the grid stays fully keyboard and screen reader friendly.

**A. Make sure the Instagram account is a professional account.** Instagram only shares posts with outside services for **Business** or **Creator** accounts. In the Instagram app, open the profile, tap the menu (three lines, top right), then **Account type and tools**. If it offers **Switch to professional account**, tap it, choose **Business**, and pick whichever category fits best. Switching is free and can be undone. Behold also offers this switch during step B if needed.

**B. Create a Behold account and connect Instagram.**

1. Sign up at **https://app.behold.so/register** (the free plan is enough).
2. Go to **Sources** (https://app.behold.so/sources), click **+ Add source**, and choose **Basic source**.
3. If you can log in to @thehummingbirdnestlcf: click **Connect**, log in to Instagram, and click **Allow**. Leave every permission turned on, including the ones marked optional; Behold needs all of them.
   If only the client can log in: copy the **auth link** shown next to **Open link** and send it to them. They open it, log in to Instagram, and click **Allow**. They do not need a Behold login.
4. The account appears on the Sources page.

**C. Create the feed.**

1. Go to **Feeds** (https://app.behold.so/feeds) and click **Add feed**.
2. Choose **User feed**, pick the @thehummingbirdnestlcf source, then choose **JSON** (not Widget).
3. Name it (for example "Website") and click **Create feed**.
4. On the feed page that opens, in the settings:
   * **Max posts:** 6 on the free plan, 10 on a paid plan.
   * Leave any domain or website restriction **empty**. The website's server reads the feed, not the visitor's browser, so a domain restriction would block it.
5. Copy the **JSON Feed URL**. It looks like `https://feeds.behold.so/AbCdEf123456`. The feed ID is the part after the last slash (`AbCdEf123456`).

**D. Put the feed ID on the site.** Either send the ID to whoever maintains the site, or edit it yourself on GitHub:

1. Open https://github.com/henrymosk1011/thehummingbirdnest-website and select the branch that is live (`main` once the site has launched).
2. Click `wrangler.jsonc`, then the pencil icon.
3. Change `"BEHOLD_FEED_ID": ""` to `"BEHOLD_FEED_ID": "AbCdEf123456"` (your ID between the quotes).
4. Click **Commit changes**. Cloudflare rebuilds and deploys in about two minutes.

**E. Check it.** Open `/api/instagram` on the site (for example `https://www.thehummingbirdnest.org/api/instagram`). It should show `"configured":true` and a list of posts. The home page then shows the real posts instead of the practice photos.

The Worker reads the feed at `/api/instagram`, keeps only Instagram links and Behold or Instagram image addresses, and keeps the result in Cloudflare's cache for two hours. That keeps Behold requests well under the free plan's 1,200 feed loads a month, even in a busy month. Alt text comes from the post's Instagram alt text (add it in Instagram under **Advanced settings > Write alt text**), or from the caption when there is none.

## 6. Google Search Console and Analytics

* **Search Console:** the domain is already verified through the DNS TXT record above. After launch, submit `https://www.thehummingbirdnest.org/sitemap.xml` under **Sitemaps**, and use **URL Inspection** on the home page to request indexing.
* **Google Analytics 4:** put the Measurement ID in `site/config.mjs`:

  ```js
  analytics: { gaMeasurementId: 'G-XXXXXXXXXX' },
  ```

  The security policy already allows Google Analytics, so nothing else needs to change. The Privacy Policy already covers analytics cookies.

## Local development

```bash
npm install
npm run dev     # http://localhost:8787 with the real Worker, headers and form handling
```

For a local form test, create `.dev.vars` (ignored by git) with `RESEND_API_KEY=...`.
