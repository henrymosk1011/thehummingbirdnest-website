// schema.org structured data. Every page includes the business and website
// nodes; pages add their own nodes (WebPage, Service, BlogPosting, FAQPage...).

import { site } from '../config.mjs';
import { plainText } from './cms.mjs';

export const ORG_ID = `${site.url}/#organization`;
export const SITE_ID = `${site.url}/#website`;
export const TAMAR_ID = `${site.url}/about#tamar`;

export function organizationGraph() {
  return [
    {
      '@type': ['ProfessionalService', 'LocalBusiness'],
      '@id': ORG_ID,
      name: site.name,
      alternateName: 'Hummingbird Nest',
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
      areaServed: site.serviceAreas.map((name) => ({ '@type': 'City', name: name === 'Northern Los Angeles' ? 'Los Angeles' : name })),
      founder: { '@id': TAMAR_ID },
      sameAs: site.social.map((s) => s.url).concat(site.socialClub),
      knowsAbout: ['DIR Floortime', 'Autism Spectrum Disorder', 'Emotional regulation', 'Social skills', 'Parent coaching', 'Sensory integration'],
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: `${site.url}/`,
      name: site.name,
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
  name: s.title.replace('®', ''),
  serviceType: s.title.replace('®', ''),
  description: s.description,
  url: `${site.url}/${s.slug}`,
  provider: { '@id': ORG_ID },
  areaServed: site.serviceAreas.map((name) => ({ '@type': 'City', name: name === 'Northern Los Angeles' ? 'Los Angeles' : name })),
  audience: { '@type': 'PeopleAudience', suggestedMinAge: 2, suggestedMaxAge: 25 },
});

export const personNode = (p, path = '/about') => ({
  '@type': 'Person',
  '@id': `${site.url}${path}#${p.id}`,
  name: p.name,
  jobTitle: p.title ? `${p.role}, ${p.title}` : p.role,
  worksFor: { '@id': ORG_ID },
  image: `${site.url}/assets/img/${p.image}-560.webp`,
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
