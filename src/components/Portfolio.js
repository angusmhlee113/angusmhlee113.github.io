'use client';

import { useEffect } from 'react';
import { profile } from '@/data/profile';

// React renders the page shell; the 3D room and desktop OS (src/portfolio) are
// plain browser modules that take over these elements once loaded.
export default function Portfolio() {
  useEffect(() => {
    // Wait for fonts so text drawn onto canvas textures uses them.
    document.fonts.ready
      .then(() => import('@/portfolio/main'))
      .then(({ initPortfolio }) => initPortfolio());
  }, []);

  return (
    <>
      <canvas id="scene" aria-label="A 3D bedroom with a developer's desk and computer" />

      <div id="gate" className="gate">
        <div className="gate-card">
          <p className="gate-kicker">portfolio.exe</p>
          <h1>{profile.name}</h1>
          <p className="gate-role">{profile.role}</p>
          <button id="enter" className="btn-enter">Enter the room</button>
          <button id="skip-gate" className="btn-link">Skip straight to the portfolio →</button>
          <p className="gate-hint">🎧 Best with sound on</p>
        </div>
      </div>

      <button id="skip" className="skip" hidden>Skip intro ⏭</button>
      <div id="hint" className="hint" role="status" hidden />
      <button id="mute" className="mute" aria-label="Mute sound">
        <svg className="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <svg className="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="m23 9-6 6M17 9l6 6" />
        </svg>
      </button>

      <div id="os" className="os" aria-hidden="true" />
    </>
  );
}
