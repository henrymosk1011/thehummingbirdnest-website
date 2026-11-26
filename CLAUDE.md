# Working on The Hummingbird Nest website

## Standing instruction from the site owner: ship every change

Every time a change is requested, do all of this without asking first:

1. Make the change on the working branch, run `npm run build` (it must pass its checks), then commit and push.
2. Open a pull request into `main`.
3. Merge it.
4. Deploy `main`. The repository's push events never reach Workers Builds (as of November 2026), so the **Publish site** GitHub workflow (`.github/workflows/publish.yml`) calls the Worker's deploy hook on every push to `main`, once the `CLOUDFLARE_DEPLOY_HOOK` secret is set (DEPLOY.md, section 1). After merging, list the Worker's builds with the Cloudflare API and look for a new one with `build_trigger_source: "deploy_hook"`. If none starts within a minute, start the production build yourself: `POST /accounts/{account_id}/builds/triggers/b194d803-1d6d-4568-a0d2-8cd3e6988233/builds` with body `{"branch": "main"}`. That trigger runs `npm run build` then `npm run deploy:ci` (`site/deploy.mjs`: `wrangler deploy`, retried after 20 and 40 seconds if Cloudflare's API fails) for the `thehummingbirdnest` Worker. If a build still fails at the deploy step, start it again with the same request. Either way, wait for the build to finish with outcome `success` and check its logs for "Checks passed" and a new "Current Version ID". Also pass on any content warnings in the log (such as a photo described by its file name), since nobody else reads them.
5. Report the PR link and the deployed version. The site is served at https://thehummingbirdnest.henrymm.workers.dev, and at www.thehummingbirdnest.org once its nameservers at GoDaddy point to Cloudflare (DEPLOY.md, section 2; the zone and custom domains are already set up in Cloudflare).

If the working branch's earlier PR is already merged, start the next change from the latest `main`.

## How to report back to the site owner

The owner finds long reports overwhelming. In every reply:

* Lead with a short, clean numbered list of simple steps or results. One line each, plain words, no jargon.
* Anything the owner has to do goes in its own numbered list, in order, with exactly what to click or type.
* Keep technical detail (test numbers, file names, build logs) out, unless asked. One closing line with the PR link and deployed version is enough.

## Content rules from the client

* Page wording stays word for word as on the original site (www.thehummingbirdnest.org on Webflow). Do not add new paragraphs or rewrite copy; short navigation labels and button text are fine.
* Buttons that go to the contact form say "Contact us". Any "Book a call" wording links to Calendly and names it ("Book a call with Calendly").
* No carousels or sideways scrolling, except the blog carousel on the Resources page.
* The contact form must never ask for health information (no child's age, no free text message): the form's services do not sign a HIPAA BAA.
* House rules enforced by the build are listed in README.md (no dashes in visible text, alt text on every image, internal links resolve).
