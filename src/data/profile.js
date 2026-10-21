// ─────────────────────────────────────────────────────────────
//  Your portfolio content. Edit this file — everything else
//  (the 3D room, boot screen, desktop, terminal) reads from it.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Angus',
  role: 'Software Developer',
  location: 'Earth',
  tagline: 'I build things for the web — sometimes in three dimensions.',
  // Optional: a square photo. Put it in /public (e.g. public/me.jpg → '/me.jpg')
  // or use a full URL. Leave empty to show initials.
  avatar: '',
  // Optional: a PDF résumé, same rules as avatar. Adds a "Resume.pdf" icon when set.
  resumeUrl: '',
  email: 'hello@example.com',

  about: [
    "Hi! I'm a developer who loves turning ideas into fast, polished, slightly playful software.",
    'I work across the stack — from interactive front-ends and 3D on the web to APIs and the infrastructure underneath them.',
    'When I\'m not coding you\'ll find me (replace this with something true about you).',
  ],

  facts: ['☕ Runs on coffee', '🌏 Open to remote', '🎮 Gamer', '📚 Always learning'],

  socials: [
    { label: 'GitHub', url: 'https://github.com/', handle: '@your-handle' },
    { label: 'LinkedIn', url: 'https://linkedin.com/', handle: 'in/your-name' },
    { label: 'X / Twitter', url: 'https://x.com/', handle: '@your-handle' },
  ],

  skills: {
    Languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go'],
    Frontend: ['React', 'Next.js', 'Three.js', 'Tailwind', 'WebGL'],
    Backend: ['Node.js', 'PostgreSQL', 'Redis', 'REST', 'GraphQL'],
    Tooling: ['Git', 'Docker', 'AWS', 'Vercel', 'Figma'],
  },

  experience: [
    {
      role: 'Software Developer',
      company: 'Company Name',
      period: '2024 — Present',
      points: [
        'Describe an impact you had, with a number if you can.',
        'Another accomplishment worth bragging about.',
      ],
    },
    {
      role: 'Junior Developer',
      company: 'Previous Company',
      period: '2022 — 2024',
      points: ['What you built, shipped, or improved.'],
    },
    {
      role: 'B.Sc. Computer Science',
      company: 'Your University',
      period: '2018 — 2022',
      points: ['Relevant coursework, thesis, or clubs.'],
    },
  ],

  projects: [
    {
      title: '3D Room Portfolio',
      year: '2026',
      description: 'This site! A first-person walk to my desk, rendered in Three.js, that boots into a tiny desktop OS.',
      tags: ['Three.js', 'WebGL', 'Web Audio'],
      link: '',
      repo: 'https://github.com/',
      colors: ['#7c5cff', '#00d4ff'],
    },
    {
      title: 'Project Two',
      year: '2025',
      description: 'One or two sentences on what it does and why it is interesting.',
      tags: ['React', 'Node.js'],
      link: 'https://example.com',
      repo: '',
      colors: ['#ff6b9a', '#ffb86b'],
    },
    {
      title: 'Project Three',
      year: '2025',
      description: 'Another thing you are proud of. Mention the hardest problem you solved.',
      tags: ['Python', 'PostgreSQL'],
      link: '',
      repo: 'https://github.com/',
      colors: ['#2ee6a6', '#00a3ff'],
    },
    {
      title: 'Project Four',
      year: '2024',
      description: 'A side project, hackathon entry, or open-source contribution.',
      tags: ['Go', 'Docker'],
      link: 'https://example.com',
      repo: 'https://github.com/',
      colors: ['#ffd166', '#ef476f'],
    },
  ],
};
