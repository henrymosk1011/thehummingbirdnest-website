# Working on The Hummingbird Nest website

## Standing instruction from the site owner: ship every change

Every time a change is requested, do all of this without asking first:

1. Make the change on the working branch, run `npm run build` (it must pass its checks), then commit and push.
2. Open a pull request into `main`.
3. Merge it. Merging to `main` is what makes it live: Cloudflare builds and deploys `main` to production automatically (see DEPLOY.md, section 1).
4. Confirm the deploy is live (the new content is served at https://thehummingbirdnest.henrymm.workers.dev, and on www.thehummingbirdnest.org once DNS points to Cloudflare), then report the PR link.

If the working branch's earlier PR is already merged, start the next change from the latest `main`.

## Content rules from the client

* Page wording stays word for word as on the original site (www.thehummingbirdnest.org on Webflow). Do not add new paragraphs or rewrite copy; short navigation labels and button text are fine.
* Buttons that go to the contact form say "Contact us". Any "Book a call" wording links to Calendly and names it ("Book a call with Calendly").
* No carousels or sideways scrolling, except the blog carousel on the Resources page.
* The contact form must never ask for health information (no child's age, no free text message): the form's services do not sign a HIPAA BAA.
* House rules enforced by the build are listed in README.md (no dashes in visible text, alt text on every image, internal links resolve).
