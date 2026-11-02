// Shared copy. Team bios, testimonials and FAQ answers live in site/content/*.json so the
// practice can edit them in Pages CMS; everything else on this page is edited here.
// {years} is replaced with the running years of experience (see experienceSince in config.mjs).

import fs from 'node:fs';
import path from 'node:path';
import { markdown, softenDashes, mediaName } from '../lib/cms.mjs';
import { hasImage } from '../lib/html.mjs';

const CONTENT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'content');

// Each file holds one list, either at the top level or under the given key.
function readList(file, key) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
  } catch (err) {
    throw new Error(`site/content/${file} could not be read: ${err.message}`);
  }
  const list = Array.isArray(data) ? data : data && data[key];
  return Array.isArray(list) ? list.filter((item) => item && typeof item === 'object') : [];
}

const ids = new Set();
export const team = readList('team.json', 'members')
  .filter((m) => softenDashes(m.name))
  .map((m) => {
    const name = softenDashes(m.name);
    // Anchors on the About page use the first name: /about#tamar
    let id = mediaName(name.split(/\s+/)[0]) || 'member';
    for (let n = 2; ids.has(id); n++) id = `${mediaName(name.split(/\s+/)[0])}-${n}`;
    ids.add(id);
    let image = mediaName(m.photo);
    let alt = softenDashes(m.photoAlt) || name;
    if (!hasImage(image)) {
      console.warn(`Team member ${name}: photo "${m.photo || ''}" not found, using the office photo.`);
      image = 'office-door-sign';
      alt = '';
    }
    return { id, name, role: softenDashes(m.role), title: softenDashes(m.title), image, alt, bio: markdown(m.bio) };
  });

export const testimonials = readList('testimonials.json', 'testimonials')
  .map((t) => ({ quote: softenDashes(t.quote).replace(/\s+/g, ' '), name: softenDashes(t.name) }))
  .filter((t) => t.quote);

export const faqs = readList('faq.json', 'questions')
  .map((f) => ({ q: softenDashes(f.question), html: markdown(f.answer) }))
  .filter((f) => f.q && f.html);

// Home page: the three columns under the introduction (word for word from the original site).
export const pillars = [
  {
    title: 'Qualified Team',
    text: 'A compassionate group of specialists that are attuned to your child and family’s dynamic needs. Our team strives to provide you with the best care in a supportive environment. We love to integrate strategies across all of your family’s therapeutic disciplines to ensure you and your child are receiving a cohesive and collaborative therapeutic experience.',
  },
  {
    title: 'Customized sessions',
    text: 'Specializing in DIR Floortime® Therapy, we meet your child at their developmental level and expand their social and play world to help meet your family’s goals. Our relationship-based model invites your child’s individual differences and sensory needs to be supported with trust and care to ensure emotional regulation and trust in the therapeutic process.',
  },
  {
    title: 'Specializing In',
    text: 'Autism Spectrum Disorders, Emotional Regulation, Anxiety, Tantrums/Meltdowns, Sensory Modulation & Integration, Friendship Struggles, Attention-Deficit/Hyperactivity Disorder (ADHD), Using Neuro-affirming approaches, Trauma, Grief, Loss, & Phobias.',
  },
];

// The signature sticky card section on the home page.
export const supportCards = [
  {
    title: 'Individualized Therapy',
    href: '/services-1-1-therapy',
    image: 'therapist-girl-sensory-spinner',
    alt: 'A therapist and a laughing young girl playing together on a spinning sensory seat in the playroom',
    tone: 'blue',
  },
  {
    title: 'Parent Support',
    href: '/services-family-sibling-sessions',
    image: 'parent-support',
    alt: 'Parents and a toddler talking with a therapist outdoors',
    tone: 'mint',
  },
  {
    title: 'The Social Club',
    href: 'https://www.thesocialclubkids.com',
    external: true,
    image: 'kids-on-grass',
    alt: 'A group of children sitting in a circle on the grass, talking and playing',
    tone: 'aqua',
  },
];

// About page, "A space made for play". Add a line here for each new office photo
// (put the photo in site/images first). Two to four photos lay out best.
export const gallery = [
  { image: 'group-play-session', alt: 'Therapists playing on the floor with children in the playroom' },
  { image: 'intake-session', alt: 'A parent meeting with a therapist while a child plays nearby' },
];

// Shown in the home page Instagram row until the live feed loads (or if it is not set up yet).
// One row: six photos on wide screens, four on tablets, three on phones.
export const instagramFallback = [
  { image: 'therapist-girl-sensory-spinner', alt: 'A therapist and a laughing young girl playing together on a spinning sensory seat' },
  { image: 'tamar-facilitated-playdate', alt: 'Tamar supporting two children building with colorful blocks during a facilitated playdate' },
  { image: 'family-sibling-session', alt: 'Tamar leading a family session with a parent and two children on a play mat' },
  { image: 'juliana-facilitated-playdate', alt: 'Juliana guiding a facilitated playdate as two children play with soft balls' },
  { image: 'toy-train-play', alt: 'An adult and a young girl playing together with a wooden toy train on the floor' },
  { image: 'kids-on-grass', alt: 'A group of children sitting in a circle on the grass, talking and playing' },
];
