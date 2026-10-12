// Single source of truth for copy, dates, colours. Scenes read from here; nothing is hard-coded in a scene.
export const COLORS = { ink: '#091F39', navy: '#1C3D5A', blue: '#2E5A7A', blueLight: '#447CA0', white: '#FFFFFF', mist: '#D7DFE5', accent: '#7DB8E0', warm: '#E3C58B' };
export const BG = { gradient: 'linear-gradient(135deg, #091F39 0%, #1C3D5A 55%, #3B6F91 100%)' };
export const EVENT = {
  name: 'SHAPE INDONESIA',
  tagline: 'The Definitive Wellbeing & Lifestyle Expo',
  edition: 'EXPO 2027',
  date: '8–10 OCTOBER 2027',
  location: 'NICE PIK 2 · JAKARTA, INDONESIA',
  url: 'www.shapeindonesia.com',
  ctaPrimary: 'Register your business',
  format: ['Exhibition', 'Conference', 'Experience'],   // kept for captions; not shown in the film (less text)
  scarcity: null,                                       // set only if true, e.g. "Limited booths available"
};
export const HOOK = { line: [['Wellbeing', 'is', 'no', 'longer'], ['one', 'industry.']], accent: 'one' };
export const CONVERGENCE = {
  a: 'Where connections become visible,', b: 'useful, and commercially meaningful.', bAccent: ['commercially', 'meaningful.'],
  trio: ['INNOVATION', 'BUSINESS', 'LIFESTYLE'],
};
export const JOURNEY = {
  headline: ['The', 'journey', 'starts', 'before', 'October', '2027.'], highlight: 'before',
  steps: [
    { year: '2026', title: 'Start the conversation', items: ['Executive Forum', 'Webinars', 'Community Campaign'] },
    { year: '2027', title: 'Build the momentum', items: ['Community Activations', 'Business Networking', 'Pre-event Engagement'] },
  ],
  final: '8–10 OCTOBER 2027',
  caption: 'A year-round programme builds conversation, community and business momentum before the exhibition doors open.',
};
export const PILLARS = [
  { key: 'mind-power', title: 'Mind Power', desc: 'Mental fitness, recovery, focus and human performance.', footage: 's3-mind' },
  { key: 'health', title: 'Health', desc: 'Preventive care, diagnostics and connected health technology.', footage: 's3-health' },
  { key: 'fitness', title: 'Fitness', desc: 'Movement, performance, equipment and active lifestyle.', footage: 's3-fitness' },
  { key: 'longevity', title: 'Longevity & Biohacking', desc: 'Science-backed tools for healthier, longer lives.', footage: 's3-longevity' },
  { key: 'nutrition', title: 'Nutrition', desc: 'Functional food, supplements and better everyday choices.', footage: 's3-nutrition' },
  { key: 'aesthetics', title: 'Aesthetics', desc: 'Beauty technology, personal care and confidence.', footage: 's3-aesthetics' },
];
export const NETWORK = {
  hub: 'SHAPE INDONESIA EXPO', headline: ['Where', 'business', 'meets', 'lifestyle.'], accent: ['business', 'lifestyle.'],
  b2bTitle: 'B2B · INDUSTRY PROFESSIONALS', b2cTitle: 'B2C · ACTIVE LIFESTYLE CONSUMERS',
  b2b: ['GYM OWNERS & FITNESS OPERATORS', 'HEALTHCARE PROFESSIONALS', 'WELLNESS BUSINESS OWNERS', 'DISTRIBUTORS & RETAILERS', 'CORPORATE WELLNESS DECISION MAKERS', 'INVESTORS & INDUSTRY PARTNERS'],
  b2c: ['FITNESS ENTHUSIASTS', 'HEALTH-CONSCIOUS CONSUMERS', 'SPORTS COMMUNITIES', 'WELLNESS SEEKERS', 'FAMILIES WITH ACTIVE LIFESTYLES'],
  trio: [
    { w: 'Curated.', sub: 'Relevant experiences', slot: 's4-keynote' },
    { w: 'Connected.', sub: 'B2B meets B2C', slot: 's4-matchmaking' },
    { w: 'Credible.', sub: 'Trusted experts & insights', slot: 's4-crowd' },
  ],
};
// Social proof: only rendered when a value is real (never invent numbers).
export const STATS = { exhibitors: null, speakers: null, expectedVisitors: null, brands: null };
