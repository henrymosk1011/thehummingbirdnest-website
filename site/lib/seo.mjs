// schema.org structured data. Every page includes the business and website
// nodes; pages add their own nodes (WebPage, Service, BlogPosting, FAQPage...).

import { site } from '../config.mjs';
import { services } from '../data/services.mjs';
import { team } from '../data/content.mjs';
import { plainText } from './cms.mjs';
import { yearsOfExperience } from './html.mjs';

export const ORG_ID = `${site.url}/#organization`;
export const SITE_ID = `${site.url}/#website`;
export const TAMAR_ID = `${site.url}/about#tamar`;

const areaServed = () => site.serviceAreas.map((name) => ({ '@type': 'City', name: name === 'Northern Los Angeles' ? 'Los Angeles' : name }));
const serviceName = (s) => s.title.replace('®', '');

export function organizationGraph() {
  return [
    {
      '@type': ['ProfessionalService', 'LocalBusiness'],
      '@id': ORG_ID,
      name: site.name,
      alternateName: site.shortName,
      slogan: 'Cultivating Joyful Family Connections',
      description: site.description,
      url: `${site.url}/`,
      logo: { '@type': 'ImageObject', url: `${site.url}/assets/img/logo-600.png`, width: 600, height: 149 },
      image: `${site.url}/assets/img/og-default.jpg`,
      telephone: site.phone.e164,
      email: site.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
      hasMap: site.address.mapUrl,
      areaServed: areaServed(),
      // Only while Tamar is in the Team list, where her details come from.
      ...(team.some((m) => m.id === 'tamar') ? { founder: { '@id': TAMAR_ID } } : {}),
      // Profiles of this same business only. The Social Club is its own brand, so it is
      // listed as a service below instead.
      sameAs: site.social.map((s) => s.url),
      knowsAbout: ['DIR Floortime', 'Autism Spectrum Disorder', 'Developmental delays', 'Emotional regulation', 'Social skills', 'Parent coaching', 'Sensory integration'],
      // What the practice offers, so search engines can connect each service page to the business.
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Services',
        itemListElement: [
          ...services.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', '@id': `${site.url}/${s.slug}#service`, name: serviceName(s), url: `${site.url}/${s.slug}` },
          })),
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'PEERS Social Skills Groups', url: site.socialClub, brand: { '@type': 'Brand', name: 'The Social Club' } },
          },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: `${site.url}/`,
      name: site.name,
      // Google reads these two for the site name it shows above each result.
      alternateName: site.shortName,
      inLanguage: 'en-US',
      publisher: { '@id': ORG_ID },
    },
  ];
}

export const webPage = ({ path, title, description, type = 'WebPage', image }) => ({
  '@type': type,
  '@id': `${site.url}${path}#webpage`,
  url: `${site.url}${path}`,
  name: title,
  description,
  isPartOf: { '@id': SITE_ID },
  about: { '@id': ORG_ID },
  inLanguage: 'en-US',
  ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
});

export const serviceNode = (s) => ({
  '@type': 'Service',
  '@id': `${site.url}/${s.slug}#service`,
  name: serviceName(s),
  serviceType: serviceName(s),
  description: s.description,
  url: `${site.url}/${s.slug}`,
  image: `${site.url}/assets/img/${s.hero.image}-og.jpg`,
  provider: { '@id': ORG_ID },
  areaServed: areaServed(),
  audience: { '@type': 'PeopleAudience', suggestedMinAge: 2, suggestedMaxAge: 25 },
});

// The description is the bio shown on the About page, so training and certifications reach
// search engines exactly as the practice wrote them.
export const personNode = (p, path = '/about') => ({
  '@type': 'Person',
  '@id': `${site.url}${path}#${p.id}`,
  name: p.name,
  jobTitle: p.title ? `${p.role}, ${p.title}` : p.role,
  description: plainText(p.bio.replace(/\{years\}/g, `${yearsOfExperience()}+`)) || undefined,
  url: `${site.url}${path}#${p.id}`,
  worksFor: { '@id': ORG_ID },
  image: `${site.url}/assets/img/${p.image}-560.webp`,
});

// Tamar's book (see book in site/config.mjs).
export const bookNode = () => ({
  '@type': 'Book',
  '@id': `${site.url}/about#book`,
  name: site.book.title,
  author: { '@id': TAMAR_ID },
  url: site.book.url,
});

export const faqNode = (faqs, path) => ({
  '@type': 'FAQPage',
  '@id': `${site.url}${path}#faq`,
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: plainText(f.html) },
  })),
});

export const articleNode = (post, imageUrl) => ({
  '@type': 'BlogPosting',
  '@id': `${site.url}/post/${post.slug}#article`,
  mainEntityOfPage: { '@id': `${site.url}/post/${post.slug}#webpage` },
  headline: post.title,
  description: post.description,
  image: imageUrl,
  datePublished: post.date,
  dateModified: post.date,
  inLanguage: 'en-US',
  articleSection: post.categoryName,
  wordCount: post.words,
  author: { '@id': ORG_ID },
  publisher: { '@id': ORG_ID },
});
