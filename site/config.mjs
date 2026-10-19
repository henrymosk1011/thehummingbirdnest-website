// Site wide settings. Edit contact details, links and analytics here.

export const site = {
  name: 'The Hummingbird Nest',
  shortName: 'Hummingbird Nest',
  // Canonical origin. The Worker redirects the bare domain here (see CANONICAL_HOST in wrangler.jsonc).
  url: 'https://www.thehummingbirdnest.org',
  locale: 'en_US',
  tagline: 'DIR Floortime® therapy, social learning, and family coaching in La Cañada Flintridge, CA.',
  description:
    'The Hummingbird Nest offers DIR Floortime® sessions, facilitated playdates, social skills groups, family coaching, in school support, and staff training for children, teens, and young adults in La Cañada Flintridge and greater Los Angeles.',

  phone: {
    display: '(626) 765 1724',
    href: 'tel:+16267651724',
    e164: '+16267651724',
  },
  email: 'info@thehummingbirdnest.org',
  address: {
    street: '808 Foothill Blvd, Unit A',
    city: 'La Cañada Flintridge',
    region: 'CA',
    postalCode: '91011',
    country: 'US',
    mapUrl: 'https://maps.google.com/?q=808+Foothill+Blvd+Unit+A,+La+Canada+Flintridge,+CA+91011',
  },
  serviceAreas: ['La Cañada Flintridge', 'Glendale', 'Pasadena', 'Burbank', 'La Crescenta', 'Northern Los Angeles'],
  booking: 'https://calendly.com/thehummingbirdnest',
  socialClub: 'https://www.thesocialclubkids.com',
  book: {
    title: 'What’s Autism',
    url: 'https://www.amazon.com/dp/069285620X',
  },
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/thehummingbirdnestlcf', icon: 'instagram' },
    { name: 'Facebook', url: 'https://www.facebook.com/thehummingbirdnestlcf', icon: 'facebook' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/90431142/', icon: 'linkedin' },
  ],
  // Tamar has worked with the neurodiverse population since this year; the site shows the running total.
  experienceSince: 2006,

  designer: { name: 'TENELEVENMEDIA', url: 'https://www.tenelevenmedia.com' },

  // Turn these on later. Leave empty to disable.
  analytics: {
    // Google Analytics 4 measurement ID, for example 'G-XXXXXXXXXX'.
    gaMeasurementId: '',
  },
  // Google Search Console HTML tag verification code (the content="" value only).
  // DNS verification through Cloudflare is the better option; this is here as a fallback.
  googleSiteVerification: '',
};

export const nav = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services', mega: true },
  { label: 'Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
];
