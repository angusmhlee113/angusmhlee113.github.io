# 3D Room Portfolio

A first-person developer portfolio built with **Next.js** and **Three.js**. Visitors walk into a night-time bedroom, sit at the desk, press the PC's power button, watch it boot, and then the camera dives into the monitor, which becomes a small desktop OS holding the portfolio.

- No 3D model files: the room is built from Three.js primitives with canvas-drawn textures, and the sound effects are synthesized with Web Audio.
- The desktop OS has draggable, resizable windows, a taskbar, a start menu, and a working terminal (`help`, `neofetch`, `open projects`, `exit`…).
- Phones get full-screen windows. Visitors can skip the intro, and if WebGL isn't available the site opens the desktop directly.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

`npm run build` writes a fully static site to `out/`, and `npm start` serves it locally.

## Make it yours

Edit **`src/data/profile.js`**. It holds your name, role, bio, skills, experience, projects, email and socials. Put a photo or résumé PDF in `public/` and reference it as `'/me.jpg'`. The site adds the GitHub Pages sub-path automatically.

| Path | What it does |
| --- | --- |
| `src/app/` | Next.js layout (fonts, metadata), page, global CSS |
| `src/components/Portfolio.js` | Page shell, which loads the 3D experience in the browser |
| `src/portfolio/main.js` | Camera choreography (walk → sit → power on → zoom), state, input |
| `src/portfolio/room.js` | The room: furniture, lights, textures, PC power state |
| `src/portfolio/screen.js` | Monitor boot sequence drawn on a canvas texture |
| `src/portfolio/os.js` | Desktop OS: apps, window manager, terminal |
| `src/portfolio/sound.js` | Synthesized sound effects |

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. Create a repo on GitHub. Name it `<username>.github.io` to serve the site at the root, or give it any other name to serve it at `https://<username>.github.io/<repo>/`.
2. Push this project to the repo's `main` branch.
3. In the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The **Actions** tab shows the deploy. When it finishes, the site is live.

The base path is detected automatically, so the same code works for both repo types.
