// ─────────────────────────────────────────────────────────────
//  Your portfolio content. Edit this file — everything else
//  (the 3D room, boot screen, desktop, terminal) reads from it.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Angus',
  role: 'Senior Software Engineer',
  location: 'Hong Kong',
  tagline: 'Good ideas. A little play. A lot of care.',
  // Optional: a square photo. Put it in /public (e.g. public/me.jpg → '/me.jpg')
  // or use a full URL. Leave empty to show initials.
  avatar: '',
  // Optional: a PDF résumé, same rules as avatar. Adds a "Resume.pdf" icon when set.
  resumeUrl: '',
  // TODO: add the address you want public. The Contact window's email button uses it.
  email: 'hello@example.com',

  about: [
    "Hey, I'm Angus. This is a little world for the things I make, the ideas I explore, and whatever comes next.",
    "I'm a Senior Software Engineer at Nanoinsure in Hong Kong, building the next generation of insurance technology through backend engineering, conversational AI, and intelligent workflow integration.",
    'Before that I built metaverse applications and reward-based mini-games at New Galaxy. I studied Computer Engineering (B.S.) and Environmental & Ecological Engineering (M.S.) at Purdue University.',
  ],

  facts: ['📍 Hong Kong', '🎓 Purdue alum', '🤖 Conversational AI', '🎮 Game-maker at heart'],

  socials: [
    { label: 'GitHub', url: 'https://github.com/angusmhlee113', handle: '@angusmhlee113' },
  ],

  // TODO: add the specific languages and frameworks you use.
  skills: {
    'Focus areas': ['Backend engineering', 'Conversational AI', 'AI-enabled workflows', 'Full-stack development'],
    Domains: ['Insurance technology', 'Point-of-sale platforms', 'Metaverse', 'Gamification'],
    Foundations: ['Computer engineering', 'Environmental & ecological engineering'],
  },

  experience: [
    {
      role: 'Senior Software Engineer I',
      company: 'Nanoinsure · Hong Kong',
      period: 'Feb 2024 — Present',
      summary: 'Building the next generation of insurance technology through backend engineering, conversational AI, and intelligent workflow integration.',
      points: [
        "Engineered core backend capabilities for a leading Hong Kong insurer's point-of-sale (POS) platform, spanning the end-to-end sales journey — from financial needs analysis (FNA) and sales illustrations to policy applications and payments.",
        'Integrated conversational AI into the insurance POS ecosystem, embedding chatbot capabilities directly within the digital sales experience.',
        'Developed AI-enabled communication workflows for Aibora, bringing artificial intelligence into dealer email interactions and communication logging.',
        "Contributed to Aibora's intelligent comparison capabilities, applying AI to the analysis and comparison of insurance sales illustrations.",
      ],
    },
    {
      role: 'Software Engineer I',
      company: 'New Galaxy Ltd · Hong Kong',
      period: 'Dec 2022 — Dec 2023',
      summary: 'Delivered full-stack software development for metaverse projects, bringing immersive digital experiences to life.',
      points: [
        'Contributed across frontend and backend development to build metaverse applications.',
        'Independently developed reward-based mini-games for company promotional campaigns, creating gamified experiences that connected interactive play with reward opportunities.',
      ],
    },
    {
      role: 'M.S. Environmental and Ecological Engineering',
      company: 'Purdue University, West Lafayette',
      period: 'Aug 2017 — Aug 2019',
      summary: 'Expanded an engineering foundation through graduate study in environmental and ecological engineering.',
      points: [],
    },
    {
      role: 'B.S. Computer Engineering',
      company: 'Purdue University, West Lafayette',
      period: 'Aug 2013 — Aug 2017',
      summary: 'Built a foundation in computer engineering before pursuing further interdisciplinary engineering studies.',
      points: [],
    },
  ],

  projects: [
    {
      title: '3D Room Portfolio',
      year: '2026',
      description: 'This site! A first-person walk to my desk, rendered in Three.js, that boots into a tiny desktop OS.',
      tags: ['Next.js', 'Three.js', 'Web Audio'],
      link: '',
      repo: 'https://github.com/angusmhlee113',
      colors: ['#7c5cff', '#00d4ff'],
    },
    {
      title: 'Insurance POS Platform',
      year: '2024',
      description: "Core backend for a leading Hong Kong insurer's point-of-sale platform, covering the full sales journey from needs analysis and illustrations to applications and payments.",
      tags: ['Backend', 'InsurTech', 'Nanoinsure'],
      link: '',
      repo: '',
      colors: ['#2ee6a6', '#00a3ff'],
    },
    {
      title: 'Aibora',
      year: '2024',
      description: 'AI-enabled dealer email workflows, communication logging, and intelligent comparison of insurance sales illustrations.',
      tags: ['Conversational AI', 'Workflows', 'Nanoinsure'],
      link: '',
      repo: '',
      colors: ['#ff6b9a', '#ffb86b'],
    },
    {
      title: 'Reward Mini-Games',
      year: '2023',
      description: 'Independently built reward-based mini-games for promotional campaigns, connecting interactive play with reward opportunities.',
      tags: ['Game dev', 'Metaverse', 'New Galaxy'],
      link: '',
      repo: '',
      colors: ['#ffd166', '#ef476f'],
    },
  ],
};
