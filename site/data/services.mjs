// The five services. Each one becomes a page at its original URL so existing
// search rankings and bookmarks keep working.

export const services = [
  {
    slug: 'services-1-1-therapy',
    number: '01',
    title: 'DIR Floortime® Sessions',
    menuTitle: 'DIR Floortime® Sessions',
    eyebrow: '1:1 therapy for children',
    seoTitle: 'DIR Floortime® Therapy Sessions for Children',
    description:
      'Play based DIR Floortime® therapy for children with autism, developmental delays, and behavioral challenges, with parents included in every 1:1 session.',
    summary: 'Play based, relationship driven 1:1 therapy that meets your child at their developmental level.',
    hero: { image: 'toy-train-play', alt: 'An adult and a young girl playing together with a wooden toy train on the floor' },
    card: { image: 'floortime-school-bus', alt: 'A therapist and a young boy playing with a toy school bus during a DIR Floortime session' },
    heading: 'DIR Floortime® children’s therapy',
    body: [
      'The Hummingbird Nest offers DIR Floortime® Therapy, a play based intervention method for children with Autism Spectrum Disorders, developmental delays, and behavioral challenges.',
      'Sessions are held in our office and incorporate sensory integration strategies to best support each child with a top down and bottom up approach at the same time.',
      'Parents are included in 1:1 sessions to strengthen and build upon the parent and child relationship. Goals are created after the first month of intervention, so parents and caregivers alike can put these strategies into practice for faster progress toward the goals we set together.',
    ],
    highlights: [
      { title: 'Child led play', text: 'We follow your child’s interests to build engagement, trust, and joy.' },
      { title: 'Sensory informed', text: 'Sensory integration strategies support regulation from the inside out.' },
      { title: 'Parents in the room', text: 'You learn the strategies alongside your child, session by session.' },
      { title: 'Goals that fit', text: 'Goals are created together after one month of consistent sessions.' },
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
    title: '1:1 In School Support',
    menuTitle: '1:1 In School Support',
    eyebrow: 'Shadow support in the classroom',
    seoTitle: '1:1 In School Support and Shadow Services',
    description:
      'Attuned 1:1 in school support and shadow services for children who need individualized help in the classroom, designed to phase out as your child succeeds.',
    summary: 'Discreet 1:1 shadow support in the classroom that phases out as your child grows more independent.',
    hero: { image: 'in-school-classroom', alt: 'Children working at their desks in a bright classroom' },
    card: { image: 'in-school-classroom', alt: 'Children working at their desks in a bright classroom' },
    heading: 'In school support and 1:1 shadow services',
    body: [
      'The Hummingbird Nest provides in school support for children who need 1:1 assistance.',
      'When a child has additional needs and the teacher is unable to provide individualized attention because of their many responsibilities in the class, we give that child the attuned support they need.',
      'Our role in the classroom is to follow the teacher’s lead, support the child without making the rest of the class aware that we are a shadow, and phase out as the child becomes successful in the school environment.',
    ],
    highlights: [
      { title: 'Teacher led', text: 'We follow the teacher’s lead and fit naturally into the classroom.' },
      { title: 'Discreet', text: 'Support is given quietly, so your child is not singled out.' },
      { title: 'Built to fade', text: 'We step back as your child grows more confident and independent.' },
    ],
    gallery: [],
  },
  {
    slug: 'services-staff-training',
    number: '03',
    title: 'Staff Training',
    menuTitle: 'Staff Training',
    eyebrow: 'For schools and child care facilities',
    seoTitle: 'Staff Training for Schools and Child Care Facilities',
    description:
      'Interactive staff trainings for schools and child care facilities that give educators practical, relationship based tools for challenging behaviors.',
    summary: 'Interactive trainings that give educators practical tools for the day to day hurdles of challenging behaviors.',
    hero: { image: 'staff-training-notebook', alt: 'An open notebook and colorful highlighters on a wooden desk' },
    card: { image: 'staff-training-classroom', alt: 'Educators seated around tables during a staff training session' },
    heading: 'Staff training in schools and child care facilities',
    body: [
      'Educators and caregivers have been experiencing burnout due to an increase in children’s behaviors, to the point where teaching academics is becoming an obstacle.',
      'Our staff trainings are designed to give teachers the tools they need to handle the day to day hurdles that come up when working with children who display challenging behaviors.',
      'Trainings can be tailored to your school or facility’s specific needs. Email us for more information about our staff trainings.',
    ],
    steps: [
      { title: 'The training', meta: '90 minutes', text: 'A 60 minute interactive presentation followed by a 30 minute Q and A, where specific strategies are given to staff for the challenges they face.' },
      { title: 'The follow up', meta: 'About 60 days later', text: 'A 90 minute Q and A session where educators bring specific scenarios and cases to discuss and receive further direction.' },
      { title: 'Made for you', meta: '3 weeks before', text: 'A planning meeting before the training date so the content fits your school or facility’s specific needs.' },
    ],
    gallery: [{ image: 'staff-training-classroom', alt: 'Educators seated around tables during a staff training session', wide: true }],
  },
  {
    slug: 'services-family-sibling-sessions',
    number: '04',
    title: 'Family and Sibling Sessions',
    menuTitle: 'Family and Sibling Sessions',
    eyebrow: 'Parent coaching and sibling support',
    seoTitle: 'Family Coaching and Sibling Sessions',
    description:
      'Family coaching and DIR Floortime® sibling sessions that help parents and siblings build connection, coregulation, and lasting skills at home.',
    summary: 'In session coaching for parents and DIR Floortime® sibling support that strengthens the whole family.',
    hero: { image: 'cardboard-house-play', alt: 'A parent and child playing together inside a painted cardboard house' },
    card: { image: 'family-sibling-session', alt: 'Tamar leading a family session with a parent and two children on a play mat' },
    heading: 'Growing stronger as a family',
    body: [
      'We believe that the biggest difference in a child’s development is who and what they are exposed to the majority of the time. When we work with a child for one to two hours a week and the family uses the strategies from our sessions the rest of the time, development moves forward quickly.',
      'Coaching parents directly during sessions on what to do, how to do it, and what words to say, paired with parental support outside of sessions, is the perfect recipe for success for the whole family.',
      'We also offer sibling support sessions using the DIR Floortime® approach. Siblings play a strong role in shaping one another’s social, cognitive, and emotional development. They are role models and social partners who can serve as built in support systems during life’s challenges.',
      'Conflict between siblings is inevitable, but it can become a learning tool for overcoming challenges, using coping and compromising skills, communicating feelings effectively, choosing assertiveness instead of aggression, and practicing coregulation. Fostering a positive sibling relationship in childhood brings benefits for years to come.',
    ],
    highlights: [
      { title: 'Live coaching', text: 'What to do, how to do it, and what words to say, in the moment.' },
      { title: 'Support between sessions', text: 'Guidance that carries the work into everyday family life.' },
      { title: 'Sibling connection', text: 'Turning conflict into practice for coping, compromise, and communication.' },
    ],
    gallery: [
      { image: 'family-sibling-session', alt: 'Tamar leading a family session with a parent and two children on a play mat' },
      { image: 'family-session-table', alt: 'Tamar playing with two siblings and their parent around a coffee table' },
      { image: 'parent-coaching-goals', alt: 'Two parents meeting with a therapist to set goals for their child' },
    ],
  },
  {
    slug: 'services-facilitated-playdates',
    number: '05',
    title: 'Facilitated Playdates',
    menuTitle: 'Facilitated Playdates',
    eyebrow: 'Clinician supported 2:1 play',
    seoTitle: 'Facilitated Playdates for Social and Emotional Growth',
    description:
      'Clinician supported 2:1 facilitated playdates that pair carefully matched peers to build social communication, regulation, flexibility, and confidence.',
    summary: 'Carefully matched 2:1 play sessions with real time coaching to build friendship skills that last.',
    hero: { image: 'playdate-clay', alt: 'Two children playing with colorful clay together at a table' },
    card: { image: 'juliana-facilitated-playdate', alt: 'Juliana guiding a facilitated playdate as two children play with balls' },
    heading: 'What is a facilitated playdate?',
    body: [
      'Facilitated Playdates are clinician supported, 2:1 structured play sessions that bring together carefully matched peers to support social, emotional, and developmental growth. Each pairing is thoughtfully selected based on age, communication style, interests, and therapeutic goals to create the best opportunity for meaningful connection and success.',
      'During sessions, clinicians provide real time coaching, modeling, and gentle guidance to help children navigate social interactions in a naturalistic setting. Activities are intentionally designed to encourage cooperation, flexibility, communication, and shared engagement, while still feeling fun and child led. Support is gradually adjusted to each child’s needs, allowing for more independence over time.',
    ],
    benefitsIntro:
      'Each session uses evidence based strategies to build skills in a way that is engaging, individualized, and functional. Children are supported in developing:',
    benefits: [
      'Social communication skills, such as starting play, taking turns, and conversational back and forth',
      'Emotional regulation and frustration tolerance',
      'Problem solving and flexible thinking',
      'Perspective taking and understanding social cues',
      'Confidence in peer interactions',
    ],
    benefitsOutro:
      'Because skills are practiced in real time with peers, children are better able to carry what they learn into school, home, and community settings. Caregivers may also receive feedback and strategies to reinforce progress outside of sessions, promoting consistency and long term growth.',
    gallery: [
      { image: 'juliana-facilitated-playdate', alt: 'Juliana guiding a facilitated playdate as two children play with balls' },
      { image: 'tamar-facilitated-playdate', alt: 'Tamar supporting two children building with colorful blocks during a facilitated playdate' },
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
