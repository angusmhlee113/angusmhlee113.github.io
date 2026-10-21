// The portfolio "operating system" shown once the camera dives into the monitor.
import { profile } from '../data/profile.js';
import { sfx } from './sound.js';
import { osName, initials } from './screen.js';

const ICONS = {
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/>',
  terminal: '<path d="m4 17 6-6-6-6M12 19h8"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  muted: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/>',
};
const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clamp = (v, a, b) => Math.min(Math.max(v, a), Math.max(a, b));
const host = osName(profile).replace(/OS$/, '').toLowerCase() || 'portfolio';
// Files in /public are served under the repo's sub-path on GitHub Pages.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
const asset = (url) => (url.startsWith('/') ? BASE + url : url);

// ── app contents ─────────────────────────────────────────────

function aboutApp() {
  const avatar = profile.avatar
    ? `<img src="${esc(asset(profile.avatar))}" alt="">`
    : esc(initials(profile));
  return `
    <div class="about">
      <div class="about-head">
        <div class="avatar">${avatar}</div>
        <div>
          <h2>${esc(profile.name)}</h2>
          <p class="muted">${esc(profile.role)} · ${esc(profile.location)}</p>
        </div>
      </div>
      <p class="tagline">${esc(profile.tagline)}</p>
      ${profile.about.map((p) => `<p>${esc(p)}</p>`).join('')}
      <div class="chips">${profile.facts.map((f) => `<span class="chip">${esc(f)}</span>`).join('')}</div>
      <div class="actions">
        <button class="btn" data-open="projects">${svg('folder')} See my projects</button>
        <button class="btn ghost" data-open="contact">${svg('mail')} Get in touch</button>
      </div>
    </div>`;
}

function projectsApp() {
  return `
    <div class="projects">
      ${profile.projects.map((p) => `
        <article class="card" style="--c1:${p.colors?.[0] ?? '#7c5cff'};--c2:${p.colors?.[1] ?? '#00d4ff'}">
          <div class="card-art"><span>${esc(p.title.slice(0, 1))}</span></div>
          <div class="card-body">
            <div class="card-top"><h3>${esc(p.title)}</h3><span class="muted mono">${esc(p.year ?? '')}</span></div>
            <p>${esc(p.description)}</p>
            <div class="chips">${p.tags.map((t) => `<span class="chip sm">${esc(t)}</span>`).join('')}</div>
            <div class="card-links">
              ${p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${svg('external')} Live</a>` : ''}
              ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">${svg('code')} Code</a>` : ''}
            </div>
          </div>
        </article>`).join('')}
    </div>`;
}

function skillsApp() {
  return `
    <div class="skills">
      <p class="mono muted">// skills.json</p>
      ${Object.entries(profile.skills).map(([group, items]) => `
        <section>
          <h3>${esc(group)}</h3>
          <div class="chips">${items.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
        </section>`).join('')}
    </div>`;
}

function experienceApp() {
  return `
    <ol class="timeline">
      ${profile.experience.map((x) => `
        <li>
          <div class="tl-head"><h3>${esc(x.role)}</h3><span class="muted mono">${esc(x.period)}</span></div>
          <p class="tl-company">${esc(x.company)}</p>
          ${x.summary ? `<p class="tl-summary">${esc(x.summary)}</p>` : ''}
          ${x.points.length ? `<ul>${x.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>` : ''}
        </li>`).join('')}
    </ol>`;
}

function contactApp() {
  return `
    <div class="contact">
      <h2>Let's build something.</h2>
      <p class="muted">The fastest way to reach me is email — I usually reply within a day or two.</p>
      <a class="btn big" href="mailto:${esc(profile.email)}">${svg('mail')} ${esc(profile.email)}</a>
      <ul class="socials">
        ${profile.socials.map((s) => `
          <li><a href="${esc(s.url)}" target="_blank" rel="noopener">
            <span>${esc(s.label)}</span><span class="muted mono">${esc(s.handle ?? '')}</span>${svg('external')}
          </a></li>`).join('')}
      </ul>
      <form class="compose">
        <label>Quick message<textarea name="msg" rows="4" placeholder="Hi ${esc(profile.name)}, I'd love to chat about…"></textarea></label>
        <button class="btn" type="submit">Open in my mail app</button>
      </form>
    </div>`;
}

function mountContact(body) {
  body.querySelector('.compose').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.msg.value.trim();
    const subject = encodeURIComponent(`Hello from your portfolio`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${encodeURIComponent(msg)}`;
  });
}

function mountTerminal(body, os) {
  body.innerHTML = `
    <div class="term">
      <div class="term-out" aria-live="polite"></div>
      <form class="term-line">
        <span class="prompt">guest@${esc(host)}:~$</span>
        <input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command">
      </form>
    </div>`;
  const out = body.querySelector('.term-out');
  const input = body.querySelector('input');
  const history = [];
  let hIdx = 0;

  const print = (text, cls = '') => {
    const line = document.createElement('div');
    line.className = `term-row ${cls}`;
    line.textContent = text;
    out.appendChild(line);
  };
  const files = {
    'about_me.md': () => profile.about.join('\n'),
    'skills.json': () => JSON.stringify(profile.skills, null, 2),
    'contact.txt': () => [`email: ${profile.email}`, ...profile.socials.map((s) => `${s.label.toLowerCase()}: ${s.url}`)].join('\n'),
  };

  const commands = {
    help: () => [
      'Available commands:',
      '  whoami        who is this person?',
      '  about         short bio',
      '  projects      list projects',
      '  skills        list skills',
      '  contact       how to reach me',
      '  open <app>    open an app (about, projects, skills, experience, contact)',
      '  ls / cat      browse files',
      '  neofetch      system info',
      '  clear         clear the screen',
      '  exit          stand up from the desk',
    ].join('\n'),
    whoami: () => `${profile.name} — ${profile.role}, ${profile.location}`,
    about: () => profile.about.join('\n'),
    projects: () => profile.projects.map((p) => `• ${p.title} (${p.tags.join(', ')})\n  ${p.description}`).join('\n'),
    skills: () => Object.entries(profile.skills).map(([g, s]) => `${g.padEnd(10)} ${s.join(' · ')}`).join('\n'),
    experience: () => profile.experience.map((x) => `${x.period.padEnd(16)} ${x.role} @ ${x.company}`).join('\n'),
    contact: () => files['contact.txt'](),
    ls: () => 'about_me.md  contact.txt  projects/  skills.json',
    cat: (arg) => (files[arg] ? files[arg]() : arg ? `cat: ${arg}: No such file` : 'usage: cat <file>'),
    open: (arg) => (os.open(arg) ? `opening ${arg}…` : `open: unknown app "${arg ?? ''}"`),
    date: () => new Date().toString(),
    echo: (...a) => a.join(' '),
    sudo: () => 'Nice try. This incident will be reported. 🙂',
    neofetch: () => [
      `   ▄▄▄▄▄▄     guest@${host}`,
      `  █ ${initials(profile).padEnd(2)}   █    ──────────────`,
      `  █      █    OS: ${osName(profile)} 26.10`,
      `   ▀▀▀▀▀▀     Host: ${profile.name}`,
      `              Role: ${profile.role}`,
      `              Shell: portfolio-sh`,
      `              Uptime: since you walked in`,
      `              Projects: ${profile.projects.length}`,
    ].join('\n'),
    clear: () => { out.innerHTML = ''; return null; },
    exit: () => { setTimeout(() => os.leave(), 300); return 'logout'; },
  };

  print(`${osName(profile)} 26.10 — type "help" to get started.`, 'dim');
  body.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    print(`guest@${host}:~$ ${raw}`, 'cmd');
    if (raw) { history.push(raw); hIdx = history.length; }
    const [name, ...args] = raw.split(/\s+/);
    if (!name) return;
    const fn = commands[name.toLowerCase()];
    const res = fn ? fn(...args) : `command not found: ${name}. Try "help".`;
    if (res) print(res, fn ? '' : 'err');
    out.scrollTop = out.scrollHeight;
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hIdx > 0) { input.value = history[--hIdx]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] ?? ''; e.preventDefault(); }
  });
  body.addEventListener('click', () => input.focus());
  setTimeout(() => input.focus(), 50);
}

const APPS = {
  about: { title: 'about_me.md', label: 'About me', icon: 'user', colors: ['#7c5cff', '#b06bff'], w: 560, h: 560, render: aboutApp },
  projects: { title: 'Projects', label: 'Projects', icon: 'folder', colors: ['#ffb86b', '#ff6b9a'], w: 820, h: 600, render: projectsApp },
  skills: { title: 'skills.json', label: 'Skills', icon: 'cpu', colors: ['#2ee6a6', '#00a3ff'], w: 560, h: 480, render: skillsApp },
  experience: { title: 'Experience', label: 'Experience', icon: 'briefcase', colors: ['#00d4ff', '#4c6bff'], w: 600, h: 540, render: experienceApp },
  contact: { title: 'contact.txt', label: 'Contact', icon: 'mail', colors: ['#ff6b9a', '#ff4d6d'], w: 520, h: 600, render: contactApp, mount: mountContact },
  terminal: { title: 'Terminal', label: 'Terminal', icon: 'terminal', colors: ['#2b2f47', '#151829'], w: 640, h: 420, mount: mountTerminal },
};
if (profile.resumeUrl) {
  APPS.resume = { title: 'Resume.pdf', label: 'Resume.pdf', icon: 'file', colors: ['#e8e4f0', '#9a9db5'], href: asset(profile.resumeUrl) };
}

// ── window manager ───────────────────────────────────────────

export class OS {
  constructor(root, { onLeave, onShutdown, onMuteToggle }) {
    this.root = root;
    this.onLeave = onLeave;
    this.onShutdown = onShutdown;
    this.onMuteToggle = onMuteToggle;
    this.wins = new Map();
    this.z = 10;
    this.build();
    const mq = window.matchMedia('(max-width: 720px)');
    const setCompact = () => root.classList.toggle('compact', mq.matches);
    mq.addEventListener('change', setCompact);
    setCompact();
  }

  get compact() { return this.root.classList.contains('compact'); }

  build() {
    const r = this.root;
    r.innerHTML = `
      <div class="desktop">
        <div class="watermark"><div class="wm-name">${esc(profile.name)}</div><div class="wm-role">${esc(profile.role)}</div></div>
        <nav class="icons" aria-label="Desktop">
          ${Object.entries(APPS).map(([id, a]) => `
            <button class="icon" data-open="${id}">
              <span class="icon-tile" style="--c1:${a.colors[0]};--c2:${a.colors[1]}">${svg(a.icon)}</span>
              <span class="icon-label">${esc(a.label)}</span>
            </button>`).join('')}
        </nav>
        <div class="windows"></div>
      </div>
      <div class="start-menu" hidden>
        <div class="sm-head"><div class="avatar sm">${esc(initials(profile))}</div><div><strong>${esc(profile.name)}</strong><div class="muted">${esc(profile.role)}</div></div></div>
        <div class="sm-list">
          ${Object.entries(APPS).map(([id, a]) => `<button data-open="${id}">${svg(a.icon)}${esc(a.label)}</button>`).join('')}
        </div>
        <div class="sm-foot">
          <button data-action="leave">${svg('logout')} Leave desk</button>
          <button data-action="shutdown">${svg('power')} Shut down</button>
        </div>
      </div>
      <footer class="taskbar">
        <button class="start" aria-label="Start menu" aria-expanded="false"><span class="start-logo">${esc(initials(profile))}</span><span class="start-name">${esc(osName(profile))}</span></button>
        <div class="tasks"></div>
        <div class="tray">
          <button class="tray-btn" data-action="mute" aria-label="Mute sound"></button>
          <button class="tray-btn" data-action="leave" aria-label="Leave desk" title="Leave desk">${svg('logout')}</button>
          <time class="clock"></time>
        </div>
      </footer>`;
    this.windowsEl = r.querySelector('.windows');
    this.tasksEl = r.querySelector('.tasks');
    this.startMenu = r.querySelector('.start-menu');
    this.startBtn = r.querySelector('.start');
    this.clockEl = r.querySelector('.clock');
    this.muteBtn = r.querySelector('[data-action="mute"]');

    r.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-open]');
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (opener) { sfx.ui(); this.open(opener.dataset.open); this.toggleStart(false); return; }
      if (action === 'leave') { this.toggleStart(false); this.leave(); return; }
      if (action === 'shutdown') { this.toggleStart(false); this.onShutdown(); return; }
      if (action === 'mute') { sfx.toggleMute(); this.onMuteToggle(); return; }
      if (e.target.closest('.start')) { sfx.ui(); this.toggleStart(); return; }
      if (!e.target.closest('.start-menu')) this.toggleStart(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.toggleStart(false); });
  }

  leave() { this.onLeave(); }

  syncMute() {
    this.muteBtn.innerHTML = svg(sfx.muted ? 'muted' : 'volume');
    this.muteBtn.setAttribute('aria-label', sfx.muted ? 'Unmute sound' : 'Mute sound');
  }

  toggleStart(force) {
    const open = force ?? this.startMenu.hidden;
    this.startMenu.hidden = !open;
    this.startBtn.setAttribute('aria-expanded', String(open));
  }

  show() {
    this.root.classList.add('visible');
    this.root.setAttribute('aria-hidden', 'false');
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 15000);
    if (!this.greeted) {
      this.greeted = true;
      setTimeout(() => this.open('about'), 450);
    }
  }

  hide() {
    this.root.classList.remove('visible');
    this.root.setAttribute('aria-hidden', 'true');
    this.toggleStart(false);
    clearInterval(this.clockTimer);
  }

  tickClock() {
    const d = new Date();
    this.clockEl.dateTime = d.toISOString();
    this.clockEl.innerHTML = `<span>${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span class="muted">${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>`;
  }

  open(id) {
    const app = APPS[id];
    if (!app) return false;
    if (app.href) { window.open(app.href, '_blank', 'noopener'); return true; }
    const existing = this.wins.get(id);
    if (existing) {
      existing.el.classList.remove('minimized');
      this.focus(id);
      return true;
    }

    const area = this.windowsEl.getBoundingClientRect();
    const n = this.wins.size;
    const width = Math.min(app.w, area.width - 24);
    const height = Math.min(app.h, area.height - 24);
    const left = clamp((area.width - width) / 2 - 80 + n * 36, 12, area.width - width - 12);
    const top = clamp((area.height - height) / 2 - 30 + n * 30, 12, area.height - height - 12);

    const el = document.createElement('section');
    el.className = 'win';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', app.title);
    Object.assign(el.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
    el.innerHTML = `
      <header class="win-bar">
        <div class="win-dots">
          <button class="dot close" aria-label="Close"></button>
          <button class="dot min" aria-label="Minimize"></button>
          <button class="dot max" aria-label="Maximize"></button>
        </div>
        <div class="win-title">${svg(app.icon)}<span>${esc(app.title)}</span></div>
      </header>
      <div class="win-body ${id === 'terminal' ? 'flush' : ''}">${app.render ? app.render() : ''}</div>
      <div class="win-resize" aria-hidden="true"></div>`;
    this.windowsEl.appendChild(el);

    const body = el.querySelector('.win-body');
    app.mount?.(body, this);

    const task = document.createElement('button');
    task.className = 'task';
    task.innerHTML = `${svg(app.icon)}<span>${esc(app.label)}</span>`;
    task.addEventListener('click', () => {
      sfx.ui();
      const w = this.wins.get(id);
      if (w.el.classList.contains('focused') && !w.el.classList.contains('minimized')) this.minimize(id);
      else { w.el.classList.remove('minimized'); this.focus(id); }
    });
    this.tasksEl.appendChild(task);

    this.wins.set(id, { el, task });
    el.addEventListener('pointerdown', () => this.focus(id));
    el.querySelector('.close').addEventListener('click', () => { sfx.ui(); this.close(id); });
    el.querySelector('.min').addEventListener('click', () => { sfx.ui(); this.minimize(id); });
    el.querySelector('.max').addEventListener('click', () => { sfx.ui(); el.classList.toggle('maxed'); });
    el.querySelector('.win-bar').addEventListener('dblclick', (e) => { if (!e.target.closest('button')) el.classList.toggle('maxed'); });
    this.makeDraggable(el);
    this.focus(id);
    return true;
  }

  focus(id) {
    for (const [wid, w] of this.wins) {
      const on = wid === id;
      w.el.classList.toggle('focused', on);
      w.task.classList.toggle('active', on);
    }
    const w = this.wins.get(id);
    if (w) w.el.style.zIndex = ++this.z;
  }

  minimize(id) {
    const w = this.wins.get(id);
    w.el.classList.add('minimized');
    w.el.classList.remove('focused');
    w.task.classList.remove('active');
  }

  close(id) {
    const w = this.wins.get(id);
    if (!w) return;
    this.wins.delete(id);
    w.task.remove();
    w.el.classList.add('closing');
    setTimeout(() => w.el.remove(), 160);
  }

  makeDraggable(el) {
    const drag = (handle, onMove) => {
      handle.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('button') || el.classList.contains('maxed') || this.compact) return;
        e.preventDefault();
        const start = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
        handle.setPointerCapture(e.pointerId);
        const move = (ev) => onMove(ev.clientX - start.x, ev.clientY - start.y, start);
        const up = () => {
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', up);
          handle.removeEventListener('pointercancel', up);
          el.classList.remove('dragging');
        };
        el.classList.add('dragging');
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
        handle.addEventListener('pointercancel', up);
      });
    };
    drag(el.querySelector('.win-bar'), (dx, dy, s) => {
      const area = this.windowsEl.getBoundingClientRect();
      el.style.left = `${clamp(s.l + dx, 80 - s.w, area.width - 80)}px`;
      el.style.top = `${clamp(s.t + dy, 0, area.height - 40)}px`;
    });
    drag(el.querySelector('.win-resize'), (dx, dy, s) => {
      el.style.width = `${Math.max(320, s.w + dx)}px`;
      el.style.height = `${Math.max(220, s.h + dy)}px`;
    });
  }
}
