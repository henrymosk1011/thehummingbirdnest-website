import { site } from '../config.mjs';
import { link, kicker } from '../lib/html.mjs';
import { webPage } from '../lib/seo.mjs';

const EFFECTIVE = 'October 19, 2026';
const EFFECTIVE_ISO = '2026-10-19';

function legalPage({ path, title, intro, sections, description, updatedLabel = 'Effective' }) {
  const toc = sections.map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`).join('');
  const body = `
<section class="legal-hero" aria-labelledby="legal-title">
  <div class="container">
    ${kicker('Legal')}
    <h1 class="page-hero__title" id="legal-title" data-split>${title}</h1>
    <p class="legal-hero__date" data-reveal>${updatedLabel} <time datetime="${EFFECTIVE_ISO}">${EFFECTIVE}</time></p>
  </div>
</section>
<div class="container legal">
  <nav class="legal__toc" aria-labelledby="toc-title">
    <h2 class="legal__toc-title" id="toc-title">On this page</h2>
    <ol role="list">${toc}</ol>
  </nav>
  <div class="prose legal__body">
    ${intro.map((p) => `<p>${p}</p>`).join('')}
    ${sections.map((s) => `<section id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h">${s.title}</h2>${s.html}</section>`).join('\n')}
  </div>
</div>`;
  return { path, title, description, body, crumbs: [{ name: title, path }], jsonld: [webPage({ path, title, description })] };
}

const contactLines = `<p>${site.name}<br>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}<br>
Email: <a href="mailto:${site.email}">${site.email}</a><br>
Phone: <a href="${site.phone.href}">${site.phone.display}</a></p>`;

export function privacyPage() {
  return legalPage({
    path: '/privacy-policy',
    title: 'Privacy Policy',
    description: 'How The Hummingbird Nest collects, uses, and protects information when you visit our website or contact us, including your California privacy rights.',
    intro: [
      `This Privacy Policy explains how ${site.name} (“we,” “us,” or “our”) collects, uses, shares, and protects information when you visit <a href="${site.url}/">${site.url.replace('https://', '')}</a> (the “Site”) or contact us through it. By using the Site, you agree to the practices described here.`,
    ],
    sections: [
      {
        id: 'information-we-collect',
        title: 'Information we collect',
        html: `<h3>Information you give us</h3>
<p>When you fill out our contact form, email us, or call us, we collect the information you choose to share. Our contact form asks for your name and email address, and optionally your phone number, your child’s age, the service you are interested in, and a message.</p>
<h3>Information collected automatically</h3>
<p>Like most websites, our hosting and security provider automatically receives basic technical information when you visit, such as your IP address, browser type, device type, the pages you request, the referring page, and the date and time of your visit. This information is used to deliver the Site, keep it secure, and prevent abuse.</p>
<h3>Cookies and similar technologies</h3>
<p>The Site does not use advertising cookies. Our hosting and security provider may set strictly necessary cookies to protect the Site from spam and malicious traffic. If we enable website analytics, such as Google Analytics, those tools use cookies or similar technologies to help us understand how visitors use the Site in aggregate. You can block or delete cookies in your browser settings, and you can opt out of Google Analytics with the ${link('https://tools.google.com/dlpage/gaoptout', 'Google Analytics Opt out Browser Add on')}.</p>`,
      },
      {
        id: 'health-information',
        title: 'Please do not send health information',
        html: `<p>The Site and our contact form are designed for general inquiries only. Please do not submit Protected Health Information (PHI) or other sensitive details through the Site, such as diagnoses, medical or school records, insurance information, or details about a child’s health or treatment.</p>
<p>Information you share with us as part of a client relationship, such as intake paperwork and session records, is handled separately from this website and is kept confidential as required by applicable law.</p>`,
      },
      {
        id: 'how-we-use',
        title: 'How we use information',
        html: `<ul>
<li>To respond to your questions and requests, and to schedule calls, intakes, or observations.</li>
<li>To provide, operate, maintain, and improve the Site.</li>
<li>To protect the Site, our clients, and our team from spam, fraud, and security threats.</li>
<li>To comply with legal obligations and enforce our rights.</li>
</ul>
<p>We do not sell your personal information, and we do not use it for targeted advertising.</p>`,
      },
      {
        id: 'how-we-share',
        title: 'How we share information',
        html: `<p>We share personal information only as needed to run the Site and respond to you, including with:</p>
<ul>
<li><strong>Service providers</strong> that help us operate, such as our website hosting and security provider (Cloudflare), our email delivery provider (Resend), our online scheduling provider (Calendly), and, if enabled, our analytics provider (Google). These providers may only use the information to perform services for us.</li>
<li><strong>Legal and safety reasons</strong>, when we believe disclosure is required by law, legal process, or a government request, or is needed to protect the rights, property, or safety of our clients, our team, or others.</li>
<li><strong>Business transfers</strong>, if our practice is involved in a merger, acquisition, or sale of assets, subject to this policy.</li>
</ul>
<p>We do not sell or share personal information for cross context behavioral advertising, and we do not disclose personal information to third parties for their own direct marketing purposes.</p>`,
      },
      {
        id: 'third-party-links',
        title: 'Third party links and services',
        html: `<p>The Site links to websites and services we do not control, such as The Social Club, Calendly, Amazon, ICDL, Profectum, Google Maps, Instagram, Facebook, and LinkedIn. Their privacy practices are governed by their own policies, and we encourage you to review them.</p>`,
      },
      {
        id: 'retention',
        title: 'How long we keep information',
        html: `<p>We keep contact form messages and related emails for as long as needed to respond to you and maintain a record of our communications, unless a longer period is required by law. Technical logs kept by our hosting provider are retained for a limited time for security and reliability.</p>`,
      },
      {
        id: 'security',
        title: 'How we protect information',
        html: `<p>The Site is served only over encrypted HTTPS connections, and access to messages is limited to the people who need it to respond to you. No method of transmission or storage is completely secure, so we cannot guarantee absolute security, which is one more reason not to send sensitive health information through the Site.</p>`,
      },
      {
        id: 'children',
        title: 'Children’s privacy',
        html: `<p>The Site is intended for parents, caregivers, educators, and professionals. We do not knowingly collect personal information directly from children under 13 through the Site. If you believe a child has submitted personal information to us through the Site, please contact us and we will delete it.</p>`,
      },
      {
        id: 'your-rights',
        title: 'Your choices and privacy rights',
        html: `<p>You may ask us to access, correct, or delete the personal information you have shared with us through the Site, or to stop contacting you. To make a request, email <a href="mailto:${site.email}">${site.email}</a> or call <a href="${site.phone.href}">${site.phone.display}</a>. We may need to verify your identity before completing a request, and we will respond within the time required by law.</p>
<h3>California residents</h3>
<p>If you live in California, you have rights under the California Consumer Privacy Act, as amended by the California Privacy Rights Act, to the extent it applies to us. These include the right to know what personal information we collect, use, and disclose; the right to delete and to correct personal information; the right to opt out of the sale or sharing of personal information; the right to limit the use of sensitive personal information; and the right not to be discriminated against for exercising these rights. As described above, we do not sell or share personal information. You may use an authorized agent to make a request on your behalf.</p>
<p>California Civil Code Section 1798.83 also lets California residents ask whether we have disclosed personal information to third parties for their direct marketing purposes. We do not.</p>
<h3>Global Privacy Control and Do Not Track</h3>
<p>We treat a Global Privacy Control signal from your browser as a request to opt out of the sale or sharing of personal information. Because there is no common standard for Do Not Track signals, the Site does not respond to them differently.</p>`,
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        html: `<p>We may update this Privacy Policy from time to time. When we do, we will change the effective date at the top of this page. If the changes are significant, we will provide a more prominent notice on the Site.</p>`,
      },
      {
        id: 'contact-us',
        title: 'Contact us',
        html: `<p>If you have questions about this Privacy Policy or how we handle your information, please contact us:</p>${contactLines}`,
      },
    ],
  });
}

export function accessibilityPage() {
  return legalPage({
    path: '/accessibility',
    title: 'Accessibility Statement',
    updatedLabel: 'Last reviewed',
    description: 'The Hummingbird Nest is committed to a website that is accessible to everyone, following WCAG 2.2 Level AA. Learn about our approach and how to share feedback.',
    intro: [
      `${site.name} is committed to making our website usable by everyone, including people with disabilities. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA, and we treat accessibility as an ongoing effort.`,
    ],
    sections: [
      {
        id: 'what-we-do',
        title: 'What we do',
        html: `<ul>
<li>Semantic page structure with landmarks, a logical heading order, and a skip to content link.</li>
<li>Full keyboard support, including menus, the services menu, accordions, and carousels, with a clearly visible focus indicator.</li>
<li>Text and interactive elements designed to meet WCAG color contrast requirements.</li>
<li>Descriptive text alternatives for meaningful images.</li>
<li>Animations that turn off or soften when your device is set to reduce motion, and a pause button for background video.</li>
<li>Forms with visible labels, clear instructions, and error messages that are announced to assistive technology.</li>
<li>Layouts that adapt to small screens and to text enlarged up to 200 percent.</li>
</ul>`,
      },
      {
        id: 'compatibility',
        title: 'Compatibility',
        html: `<p>The Site is designed to work with current versions of major browsers, including Chrome, Safari, Firefox, and Edge, and with assistive technologies such as VoiceOver, NVDA, JAWS, and TalkBack.</p>`,
      },
      {
        id: 'limitations',
        title: 'Known limitations',
        html: `<p>Some content is provided by third parties, such as our online scheduling provider, social media platforms, and external websites we link to. We do not control these services and they may not fully meet the same standards. If you have trouble with any of them, please contact us and we will help directly.</p>`,
      },
      {
        id: 'feedback',
        title: 'Feedback and assistance',
        html: `<p>If you have difficulty using any part of the Site, or you need information in a different format, please let us know. Tell us the page and the problem you ran into, and we will do our best to help and to fix it.</p>${contactLines}`,
      },
    ],
  });
}
