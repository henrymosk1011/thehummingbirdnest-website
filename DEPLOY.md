# Deploying The Hummingbird Nest

The site runs on **Cloudflare Workers** (static assets plus a small Worker), builds from **GitHub**, and delivers the contact form by email through **FormSubmit**. The domain is registered at **GoDaddy**.

## Already set up

These were done through the Cloudflare and GitHub connectors:

* **Worker `thehummingbirdnest`** in Cloudflare (account henrymm@gmail.com), connected to `henrymosk1011/thehummingbirdnest-website`, using the same build settings as The Social Club site:
  * Production branch `main`: `npm run build`, then `npm run deploy:ci` (runs `wrangler deploy` and, if Cloudflare's API fails for a moment, tries again after 20 and 40 seconds; see `site/deploy.mjs`)
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

`main` is the live branch. Review the site at **https://thehummingbirdnest.henrymm.workers.dev**.

Cloudflare does not receive this repository's GitHub push events, so the **Publish site** workflow (`.github/workflows/publish.yml`) starts the production build instead. Every push to `main` (a merged pull request, an edit on github.com, or a save in Pages CMS) calls the Worker's **deploy hook**, and Cloudflare runs `npm run build` and `npm run deploy:ci` (`wrangler deploy`, retried if Cloudflare's API has a brief error). The site updates about two minutes later. Check progress in **Cloudflare > Workers and Pages > thehummingbirdnest > Deployments**.

**One time setup: give GitHub the deploy hook.** Until this is done, pushes to `main` are not published (the workflow shows a warning saying so).

1. In Cloudflare, open **Workers and Pages > thehummingbirdnest > Settings > Builds > Deploy Hooks** and copy the URL of the hook named **GitHub push to main** (branch `main`). It looks like `https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/...`.
2. In GitHub, open the repository's **Settings > Secrets and variables > Actions** and click **New repository secret**. Name it `CLOUDFLARE_DEPLOY_HOOK`, paste the URL, and click **Add secret**.
3. Check it: open the **Actions** tab, choose **Publish site**, and click **Run workflow**. The run should finish green with "Cloudflare accepted the build", and a new build triggered by the deploy hook appears under **Deployments**.

Treat the hook URL like a password: the repository is public, and anyone who has the URL can start a build. They cannot change the site (a build only publishes what is already on `main`), but keep it out of files and messages. If it leaks, delete the hook in Cloudflare, create a new one for branch `main`, and paste the new URL into the secret.

If Cloudflare starts building on push again by itself, delete `.github/workflows/publish.yml` so each change is not built twice (Cloudflare skips duplicate builds that are still queued, so nothing breaks in the meantime).

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

Every old URL is preserved (`/about`, `/services-1-1-therapy`, `/post/...`, `/blog-categories/...`), so existing Google rankings and bookmarks carry over. The old `/blog` page now redirects permanently to the blog on the Resources page (`/resources#blog`).

## 4. Turn on the contact form (FormSubmit)

The form is delivered by [FormSubmit](https://formsubmit.co), a free form to email service (the same setup as hyeteam.com). There is no account, API key or DNS record. The browser sends the form straight to FormSubmit, which emails it to the address in `formSubmitTo` in `site/config.mjs` (`info@thehummingbirdnest.org`).

1. Send a test message from `/contact` (on the workers.dev address or the live site). This first message is not delivered: FormSubmit emails **info@thehummingbirdnest.org** an activation request instead, and the form shows "Something went wrong" with the phone number and email.
2. Someone with access to that inbox clicks **Activate Form** in FormSubmit's email.
3. Send a second test message. It arrives at info@thehummingbirdnest.org from FormSubmit as a table (Name, Email, Phone, Interested in), and replying goes straight to the visitor.
4. If messages land in spam, mark one **Not spam** in Gmail and add a filter for mail from FormSubmit with **Never send it to Spam**, so no inquiry is missed.
5. Optional: FormSubmit's confirmation email offers a random alias for the address. Put it in `formSubmitTo` in `site/config.mjs` so the address no longer appears in the page source.

To send messages somewhere else, change `formSubmitTo` (a new address needs its own activation).

Spam protection: a hidden honeypot field and a minimum fill time in the browser. Without JavaScript the form posts normally, FormSubmit shows its own quick human check, then returns the visitor to `/thanks`.

### HIPAA and the contact form

The form is **not** a HIPAA compliant channel, so it only collects a name, email, optional phone number, and the service someone is interested in, and it shows "Please do not submit any Protected Health Information (PHI)". The form script sends only those four fields, so free text never reaches the inbox. To accept health details online, every service that handles the submission must sign a Business Associate Agreement (BAA), and today that is not the case:

* **FormSubmit** does not offer a BAA.
* **Google Workspace** does sign one (Admin console > Account > Legal and compliance), which covers the inbox.

If the practice wants a HIPAA compliant intake form later, use a form service that signs a BAA and link to it or embed it on `/contact`: the contact or intake form of their practice management system (for example SimplePractice, TherapyNotes, Jane or IntakeQ), Google Forms under their Google Workspace BAA, Hushmail for Healthcare, or Jotform's Gold plan. An embedded form also needs its address added to the Content Security Policy in `src/worker.js`.

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
   * **Max posts:** 6 (the home page shows one row of six; the free plan allows 6).
   * Leave any domain or website restriction **empty**. The website's server reads the feed, not the visitor's browser, so a domain restriction would block it.
5. Copy the **JSON Feed URL**. It looks like `https://feeds.behold.so/AbCdEf123456`. The feed ID is the part after the last slash (`AbCdEf123456`).

**D. Put the feed ID on the site.** Either send the ID to whoever maintains the site, or edit it yourself on GitHub:

1. Open https://github.com/henrymosk1011/thehummingbirdnest-website and select the branch that is live (`main` once the site has launched).
2. Click `wrangler.jsonc`, then the pencil icon.
3. Change `"BEHOLD_FEED_ID": ""` to `"BEHOLD_FEED_ID": "AbCdEf123456"` (your ID between the quotes).
4. Click **Commit changes**. Cloudflare rebuilds and deploys in about two minutes.

**E. Check it.** Open `/api/instagram` on the site (for example `https://www.thehummingbirdnest.org/api/instagram`). It should show `"configured":true` and a list of posts. The home page then shows the real posts instead of the practice photos.

The Worker reads the feed at `/api/instagram`, keeps only Instagram links and Behold or Instagram image addresses, and keeps the result in Cloudflare's cache for two hours. That keeps Behold requests well under the free plan's 1,200 feed loads a month, even in a busy month. Alt text comes from the post's Instagram alt text (add it in Instagram under **Advanced settings > Write alt text**), or from the caption when there is none.

## 6. Google Search Console, Business Profile and Analytics

* **Search Console:** the domain is already verified through the DNS TXT record above. After launch, submit `https://www.thehummingbirdnest.org/sitemap.xml` under **Sitemaps**, and use **URL Inspection** to request indexing of the home page and the five service pages. The old Webflow site had no sitemap and no page descriptions, so this is the first time Google gets either.
* **Google Business Profile:** for a local practice this counts as much as the website. Check that the profile shows as open, links to `https://www.thehummingbirdnest.org/`, lists each service, and uses exactly the name, address and phone number in `site/config.mjs` (808 Foothill Blvd, Unit A; at least one directory listing says "Suite A"). Fix the same details on Yelp, MapQuest and other listings, and ask families for Google reviews.
* **Opening hours and map position** are not in the site's structured data because they are not in `site/config.mjs` yet. Once the practice confirms its hours, add them to `organizationGraph()` in `site/lib/seo.mjs` (`openingHoursSpecification`, and `geo` with the office's latitude and longitude).
* **Google Analytics 4:** put the Measurement ID in `site/config.mjs`:

  ```js
  analytics: { gaMeasurementId: 'G-XXXXXXXXXX' },
  ```

  The security policy already allows Google Analytics, so nothing else needs to change. The Privacy Policy already covers analytics cookies.

## 7. Let the practice edit the blog, team, testimonials and FAQ (Pages CMS)

Pages CMS (free) gives the practice simple forms for **Blog posts** (shown on the Resources page), **Team**, **Testimonials** and **FAQ**. The screens are defined in `.pages.yml`. Each save is a commit to GitHub, and Cloudflare publishes it in about two minutes. Photos are resized automatically, dashes are fixed automatically, and a post with **Draft** turned on stays off the site.

Saves only go live once the deploy hook secret from section 1 is set. Edits are saved to whichever branch is open in Pages CMS, and only `main` publishes to the real site.

**One time setup (you):**

1. In GitHub, open **Settings > General > Default branch** and make sure it is **`main`**. Pages CMS opens the default branch.
2. Go to **https://app.pagescms.org** and click **Sign in with GitHub**.
3. When asked, install the **Pages CMS** GitHub App on **henrymosk1011**. Choose **Only select repositories** and pick **thehummingbirdnest-website**.
4. Open **thehummingbirdnest-website** in Pages CMS. You should see **Blog posts, Team, Testimonials, FAQ** in the sidebar.
5. Open **Collaborators**, enter the client's email address, and send the invite.

**The client:**

1. Opens the invite email and clicks the **Join** link.
2. Enters their email and types in the **6 digit code** Pages CMS emails them. They never need a password or a GitHub account.
3. Next time: go to **www.thehummingbirdnest.org/edit** (until the domain is connected: **thehummingbirdnest.henrymm.workers.dev/edit**). It opens the blog in Pages CMS; if asked, they sign in with their email and enter the new code. Going to **https://app.pagescms.org** directly works too.

**Tips to pass on:**

* **New post:** open **Blog posts** and add a new entry. Fill in every field and click **Save**. Turn on **Draft** to save without publishing. The post is on the site 2 to 3 minutes after saving (a little longer with a new photo).
* **Photos:** JPG, PNG or WebP, under 2 MB each and about 1000 to 2000 pixels wide. Pages CMS cannot upload larger photos (a 5 MB photo failed, a 500 KB one worked); save a smaller copy and try again. On an iPhone, choose **Settings > Camera > Formats > Most Compatible** so photos are saved as JPG.
* **Photo description:** one sentence about what is in the photo, for people who cannot see it.
* **Team members** appear on the About page in the order they are listed. Typing **{years}** in a bio shows the practice's years of experience, updated every year.
* **Mistakes are recoverable:** every save is in the GitHub history, so any earlier version can be restored.

**Formatting your article:**

The **Article** box has no toolbar that is always showing. Formatting comes from two menus:

* **Highlight some text** and a small toolbar appears above it: a style menu (normal text or headings), **Bold**, *Italic*, **Link**, and a few more.
* **Type / at the start of an empty line** (the box says "Press '/' for commands") for a menu of headings, bulleted and numbered lists, **Image**, **Quote** and more.
* **Shortcuts:** Cmd+B (Ctrl+B on Windows) for bold, Cmd+I for italic. Typing `## ` starts a heading, `- ` a bulleted list, `1. ` a numbered list, and `> ` a quote.

Use these, which the site is designed for:

* **Heading 2** for section titles, and **Heading 3** for smaller headings inside a section.
* **Bold**, *italic*, bulleted and numbered lists, quotes, and links.
* **Photos inside the article:** drag a photo from your computer into the Article box, or paste a copied photo, and it uploads and appears where you dropped it. (/ then **Image** picks one already in the photo library.) Photos are resized for every screen automatically.
* **Describe every photo in the article:** click the photo, then the **alt text** button in the toolbar, and describe what is in it. A dragged or pasted photo starts with its file name (such as "IMG_1234.jpg") as its description, and one picked from the library starts with none, so this step matters.

Avoid these:

* **Heading 1:** the post title is already the page's main heading. A second one hurts accessibility and Google, and the site does not style it.
* **Underline:** readers mistake underlined text for a link.
* **Table** and **Code block:** the site does not style them, and a wide table makes the page scroll sideways on phones.

**Writing in Google Docs (or Word) first:**

Writing the article in Google Docs and pasting it into the **Article** box works well. Check the article before saving.

* **Comes across:** headings, bold, italic, bulleted and numbered lists, and links.
* **Left behind on purpose:** fonts, text sizes, colors, highlighting and centering, so every post matches the rest of the site.
* **Photos do not come across.** Drag each photo from your computer into the Article box where it belongs, then describe it (click the photo, then **alt text**).
* **In the Doc,** use **Heading 2** for section titles (not Title or Heading 1), and do not underline text. Leave the post's title out of the article: it goes in the **Title** field.
* **Dashes are changed automatically:** a dash used as punctuation becomes a comma, and a number range written with a long dash ("ages 3–7") shows as "ages 3 to 7". A range typed with a plain hyphen ("ages 3-7") shows as typed.

## Local development

```bash
npm install
npm run dev     # http://localhost:8787 with the real Worker and headers
```

The contact form sends real email through FormSubmit, even locally.
