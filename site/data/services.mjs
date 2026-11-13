// The five services. Each one becomes a page at its original URL so existing
// search rankings and bookmarks keep working.
//
// Page copy (title, heading, body, benefits) is word for word from the original site.
// Hyphens are kept here as written; the build applies the no dash house style when it
// renders (see keepWordHyphens in site/config.mjs). seoTitle and description are for
// search results only and do not appear on the page.

export const services = [
  {
    slug: 'services-1-1-therapy',
    number: '01',
    title: 'DIR Floortime® Sessions',
    menuTitle: 'DIR Floortime® Sessions',
    eyebrow: '1-on-1 Therapy',
    seoTitle: 'DIR Floortime® Therapy for Children',
    description:
      'Play based DIR Floortime® therapy in La Cañada Flintridge for children with autism, developmental delays, and behavioral challenges, with parents included.',
    hero: { image: 'toy-train-play', alt: 'An adult and a young girl playing together with a wooden toy train on the floor' },
    card: { image: 'floortime-school-bus', alt: 'A therapist and a young boy playing with a toy school bus during a DIR Floortime session' },
    heading: 'DIR Floortime® Children’s Therapy',
    body: [
      'The Hummingbird Nest offers DIR Floortime® Therapy, a play-based intervention method for children with Autism Spectrum Disorders, developmental delays and behavioral challenges. Sessions are held in-office and with the incorporation of sensory integration strategies to best support the child in a top-down & bottom-up approach simultaneously. Parents are incorporated into 1:1 sessions to strengthen and build upon the parent-child relationship with goals created after the first month of intervention, parents and caregivers alike can implement these strategies for faster progress towards set goals.',
    ],
    gallery: [
      { image: 'tamar-one-on-one', alt: 'Tamar playing a board game one on one with a child at a table' },
      { image: 'juliana-one-on-one', alt: 'Juliana working one on one with a child who is leaning on a large therapy ball' },
      { image: 'floortime-dollhouse', alt: 'A therapist kneeling beside a young boy as he plays with a wooden dollhouse' },
    ],
  },
  {
    slug: 'services-1-1-in-school-support',
    number: '02',
    title: '1-on-1 In-School Support',
    menuTitle: '1-on-1 In-School Support',
    seoTitle: '1:1 In School Support and Shadow Services',
    description:
      'Attuned 1:1 in school support and shadow services for children who need individualized help in the classroom, designed to phase out as your child succeeds.',
    hero: { image: 'in-school-classroom', alt: 'Children working at their desks in a bright classroom' },
    card: { image: 'in-school-classroom', alt: 'Children working at their desks in a bright classroom' },
    heading: 'In-School Support / 1:1 shadow',
    body: [
      'The Hummingbird Nest provides in-school support for kids that require 1:1 assistance. When a child has additional needs and the teacher is unable to provide that individualized attention due to having multiple responsibilities in the class, we provide that child with the attuned support he/she needs. Our role in the classroom is to follow the teachers’ lead, provide support for the child without making it aware to the rest of the class that we are a shadow, and to phase out as the child is successful in the school environment.',
    ],
    gallery: [],
  },
  {
    slug: 'services-staff-training',
    number: '03',
    title: 'Staff Training',
    menuTitle: 'Staff Training',
    seoTitle: 'Staff Training for Schools and Child Care',
    description:
      'Interactive staff trainings for schools and child care facilities in greater Los Angeles that give educators practical tools for challenging behaviors.',
    hero: { image: 'staff-training-classroom', alt: 'A presenter leading a staff training for a room of seated educators' },
    card: { image: 'staff-training-classroom', alt: 'A presenter leading a staff training for a room of seated educators' },
    heading: 'Staff training in schools & child care facilities',
    body: [
      'Educators and caregivers have been experiencing burnout due to an increase in children’s behaviors to the point where implementing academics is becoming an obstacle. Our staff trainings are designed to give teachers the tools they need to handle the day-to-day hurdles that arise when working with kids who display challenging behaviors.',
      'Our training typically runs 90 minutes, with the first 60 minutes being an interactive presentation and the last 30 minutes a Q & A session where specific strategies are given to the staff to use where challenges are present.',
      'A follow-up training session is usually scheduled 60 days after the initial training. The follow-up is 90 minutes of Q & A, where the educators come with specific scenarios/cases to discuss and receive further direction.',
      'Trainings can be tailored to the school/facilities specific needs with a meeting 3 weeks prior to the training date. <a href="mailto:info@thehummingbirdnest.org">Email</a> for more info on our staff trainings.',
    ],
    gallery: [],
  },
  {
    slug: 'services-family-sibling-sessions',
    number: '04',
    title: 'Family/Sibling Sessions',
    menuTitle: 'Family/Sibling Sessions',
    seoTitle: 'Family Coaching and Sibling Sessions',
    description:
      'Family coaching and DIR Floortime® sibling sessions that help parents and siblings build connection, coregulation, and lasting skills at home.',
    hero: { image: 'cardboard-house-play', alt: 'A parent and child playing together inside a painted cardboard house' },
    card: { image: 'family-sibling-session', alt: 'Tamar leading a family session with a parent and two children on a play mat' },
    heading: 'Family/Sibling Sessions',
    body: [
      'We believe that the biggest difference in a child’s development is who and what they are exposed to the majority of the time. When we work with a child for 1-2 hours a week, and the family implements the strategies used in session the rest of the time, quick progress in development is made. Coaching the parents directly when in session on what to do, how to do it, and what words to say, paired with out of session parental support is the perfect recipe for success for the family unit.',
      'We also offer sibling support sessions using the DIR Floortime® approach. Siblings play a strong role in influencing one another’s social cognitive and emotional development. They are role models and social partners that can serve as built-in support systems during life’s challenges.',
      'Conflict between siblings is inevitable, but can be used as a learning tool in overcoming challenges, use coping and compromising skills, communicate feelings effectively, assertiveness instead of aggression, and use of co-regulation strategies. Fostering a positive relationship with siblings is critical in childhood so that benefits could be seen in the years that lie ahead.',
    ],
    gallery: [
      { image: 'family-sibling-session', alt: 'Tamar leading a family session with a parent and two children on a play mat' },
      { image: 'family-session-table', alt: 'Tamar playing with two siblings and their parent around a coffee table' },
      { image: 'sensory-gym-play', alt: 'A woman and a young boy laughing and holding hands as they sit together on a large cushion in the sensory gym' },
    ],
  },
  {
    slug: 'services-facilitated-playdates',
    number: '05',
    title: 'Facilitated Playdates',
    menuTitle: 'Facilitated Playdates',
    seoTitle: 'Facilitated Playdates for Social Skills',
    description:
      'Clinician supported 2:1 facilitated playdates that pair carefully matched peers to build social communication, regulation, flexibility, and confidence.',
    hero: { image: 'juliana-facilitated-playdate', alt: 'Juliana guiding a facilitated playdate as two children play with soft balls on the playroom floor' },
    card: { image: 'juliana-facilitated-playdate', alt: 'Juliana guiding a facilitated playdate as two children play with balls' },
    heading: 'What is it?',
    body: [
      'Facilitated Playdates are clinician-supported, 2:1 structured play sessions that bring together carefully matched peers to support social, emotional, and developmental growth. Each pairing is thoughtfully selected based on age, communication style, interests, and therapeutic goals to create the best opportunity for meaningful connection and success.',
      'During sessions, clinicians provide real-time coaching, modeling, and gentle guidance to help children navigate social interactions in a naturalistic setting. Activities are intentionally designed to encourage cooperation, flexibility, communication, and shared engagement, while still feeling fun and child-led. Support is gradually adjusted based on each child’s needs, allowing for increased independence over time.',
    ],
    benefits: {
      heading: 'Benefits',
      intro: 'Each session incorporates evidence-based strategies to support skill-building in a way that is engaging, individualized, and functional. Children are supported in developing:',
      items: [
        'Social communication skills (e.g., initiating play, turn-taking, conversational reciprocity)',
        'Emotional regulation and frustration tolerance',
        'Problem-solving and flexible thinking',
        'Perspective-taking and understanding social cues',
        'Confidence in peer interactions',
      ],
      outro:
        'Because skills are practiced in real-time with peers, children are better able to generalize what they learn to school, home, and community settings. Caregivers may also receive feedback and strategies to reinforce progress outside of sessions, promoting consistency and long-term growth.',
    },
    gallery: [
      { image: 'tamar-facilitated-playdate', alt: 'Tamar supporting two children building with colorful blocks during a facilitated playdate' },
      { image: 'playdate-clay', alt: 'Two children playing with colorful clay together at a table' },
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
