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

export const pillars = [
  {
    number: '01',
    title: 'A qualified team',
    text: 'A compassionate group of specialists attuned to your child and your family’s dynamic needs. We integrate strategies across all of your family’s therapeutic disciplines, so you and your child receive a cohesive and collaborative experience.',
  },
  {
    number: '02',
    title: 'Customized sessions',
    text: 'Specializing in DIR Floortime® Therapy, we meet your child at their developmental level and expand their social and play world to help meet your family’s goals. Individual differences and sensory needs are supported with trust and care.',
  },
  {
    number: '03',
    title: 'Specializing in',
    tags: [
      'Autism Spectrum Disorders',
      'Emotional Regulation',
      'Anxiety',
      'Tantrums and Meltdowns',
      'Sensory Modulation and Integration',
      'Friendship Struggles',
      'ADHD',
      'Neuroaffirming Approaches',
      'Trauma',
      'Grief and Loss',
      'Phobias',
    ],
  },
];

// The signature sticky card section on the home page.
export const supportCards = [
  {
    title: 'Individualized Therapy',
    word: 'Connect',
    text: 'DIR Floortime® sessions that follow your child’s lead and build on their strengths.',
    href: '/services-1-1-therapy',
    image: 'floortime-school-bus',
    alt: 'A therapist and a young boy playing with a toy school bus',
    tone: 'blue',
  },
  {
    title: 'Parent Support',
    word: 'Support',
    text: 'Coaching that gives you the words, tools, and confidence to keep growth going at home.',
    href: '/services-family-sibling-sessions',
    image: 'parent-support',
    alt: 'Parents and a toddler talking with a therapist outdoors',
    tone: 'mint',
  },
  {
    title: 'The Social Club',
    word: 'Belong',
    text: 'Social learning groups where kids, teens, and young adults practice friendship together.',
    href: 'https://www.thesocialclubkids.com',
    external: true,
    image: 'kids-on-grass',
    alt: 'A group of children sitting in a circle on the grass, talking and playing',
    tone: 'aqua',
  },
];

export const gallery = [
  { image: 'group-play-session', alt: 'Therapists playing on the floor with children in the playroom', caption: 'The playroom' },
  { image: 'intake-session', alt: 'A parent meeting with a therapist while a child plays nearby', caption: 'Intake sessions' },
  { image: 'floortime-dollhouse', alt: 'A therapist and a young boy playing at a wooden dollhouse', caption: 'Floortime in action' },
  { image: 'parent-coaching-goals', alt: 'Two parents meeting with a therapist to set goals', caption: 'Setting goals together' },
  { image: 'office-door-sign', alt: 'The Hummingbird Nest sign on the office wall', caption: 'Our La Cañada Flintridge office' },
  { image: 'floortime-school-bus', alt: 'A therapist and a young boy playing with a toy school bus', caption: 'Play with purpose' },
  { image: 'office-lets-just-play', alt: 'A framed sign reading Let’s just play on a white brick wall', caption: 'Let’s just play' },
];

// Shown in the home page Instagram section until the live feed loads (or if it is not set up yet).
export const instagramFallback = [
  { image: 'toy-train-play', alt: 'An adult and a young girl playing together with a wooden toy train on the floor' },
  { image: 'playdate-clay', alt: 'Two children playing with colorful clay together at a table' },
  { image: 'office-lets-just-play', alt: 'A framed sign reading Let’s just play on a white brick wall' },
  { image: 'kids-on-grass', alt: 'A group of children sitting in a circle on the grass, talking and playing' },
  { image: 'floortime-dollhouse', alt: 'A therapist and a young boy playing at a wooden dollhouse' },
  { image: 'cardboard-house-play', alt: 'A parent and child playing together inside a painted cardboard house' },
  { image: 'tamar-facilitated-playdate', alt: 'Tamar supporting two children building with colorful blocks during a facilitated playdate' },
  { image: 'group-play-session', alt: 'Therapists playing on the floor with children in the playroom' },
  { image: 'family-sibling-session', alt: 'Tamar leading a family session with a parent and two children on a play mat' },
  { image: 'office-door-sign', alt: 'The Hummingbird Nest sign on the office wall' },
];
