import * as THREE from 'three';
import { buildRoom } from './room.js';
import { BootScreen } from './screen.js';
import { OS } from './os.js';
import { sfx } from './sound.js';
import { profile } from '../data/profile.js';

const V = THREE.Vector3;
const $ = (s) => document.querySelector(s);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (a, b, t) => { t = clamp01((t - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = {
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

let started = false;

// Called once from the React page after fonts are ready. Guarded because
// React dev mode runs effects twice.
export function initPortfolio() {
  if (started) return;
  started = true;

  const ui = {
    gate: $('#gate'),
    enter: $('#enter'),
    skipGate: $('#skip-gate'),
    skip: $('#skip'),
    hint: $('#hint'),
    mute: $('#mute'),
  };

  // Replaced by the 3D scene once it's set up; without WebGL there's no room to go back to.
  let leaveDesk = () => {};
  const os = new OS($('#os'), {
    onLeave: () => leaveDesk(false),
    onShutdown: () => leaveDesk(true),
    onMuteToggle: syncMute,
  });

  function syncMute() {
    ui.mute.classList.toggle('is-muted', sfx.muted);
    ui.mute.setAttribute('aria-label', sfx.muted ? 'Unmute sound' : 'Mute sound');
    os.syncMute();
  }
  ui.mute.addEventListener('click', () => { sfx.toggleMute(); syncMute(); });
  syncMute();

  // ── renderer ─────────────────────────────────────────────────

  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: true, powerPreference: 'high-performance' });
  } catch {
    renderer = null;
  }

  let state = 'gate'; // gate → intro → booting → zooming → os ⇄ seated
  let osShownAt = 0;

  if (!renderer) {
    // No WebGL: go straight to the 2D portfolio.
    const open = () => { sfx.init(); ui.gate.classList.add('hidden'); os.show(); state = 'os'; };
    ui.enter.addEventListener('click', open);
    ui.skipGate.addEventListener('click', open);
  } else {
    start3D();
  }

  function start3D() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.7;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#06070d');
    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.01, 40);

    const screen = new BootScreen(profile);
    screen.onDesktop = () => sfx.chime();
    const room = buildRoom(scene, screen.texture, profile.name);
    const SC = room.screen;

    const P = {
      start: new V(2.15, 1.65, 2.55),
      standing: new V(0.18, 1.66, -1.2),
      seated: new V(0, 1.21, -1.93),
    };
    const pos = P.start.clone();
    const look = new V(0.3, 1.3, -2.7);
    const lookOff = { x: 0, y: 0, tx: 0, ty: 0, strength: 0.15 };

    // ── tweens: awaitable, and instantly completable when skipping ──
    const tweens = new Set();
    let skipping = false;
    const tween = (duration, fn) => new Promise((resolve) => {
      if (skipping || duration <= 0) { fn(1); resolve(); return; }
      tweens.add({ t: 0, duration, fn, resolve });
    });
    const wait = (s) => tween(s, () => {});
    function updateTweens(dt) {
      for (const tw of tweens) {
        tw.t += dt;
        const p = skipping ? 1 : Math.min(tw.t / tw.duration, 1);
        tw.fn(p);
        if (p >= 1) { tweens.delete(tw); tw.resolve(); }
      }
    }

    // Camera spot where the monitor exactly fills the viewport.
    function fillPosition(out) {
      const t = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const dH = SC.h / 2 / t;
      const dW = SC.w / 2 / (t * camera.aspect);
      return out.copy(SC.center).add(new V(0, 0, Math.min(dH, dW) * 0.985));
    }

    // ── hints ──
    function showHint(text) { ui.hint.textContent = text; ui.hint.hidden = false; }
    function hideHint() { ui.hint.hidden = true; }

    // ── the intro ──
    async function runIntro() {
      state = 'intro';
      lookOff.strength = 0.2;
      if (!skipping) ui.skip.hidden = false;

      // 1. walk to the desk
      const curve = new THREE.CatmullRomCurve3([P.start.clone(), new V(1.55, 1.65, 1.25), new V(0.75, 1.65, -0.2), P.standing.clone()]);
      const lookA = look.clone();
      const lookB = new V(0.1, 0.95, -2.3);
      const STEPS = 8;
      let lastStep = 0;
      await tween(5.2, (p) => {
        const e = ease.inOutSine(p);
        curve.getPointAt(e, pos);
        const phase = e * STEPS * Math.PI;
        const amp = Math.sin(Math.PI * p);
        pos.y -= Math.abs(Math.sin(phase)) * 0.035 * amp;
        pos.x += Math.sin(phase * 0.5) * 0.018 * amp;
        const step = Math.floor((phase + Math.PI / 2) / Math.PI);
        if (step !== lastStep && p < 0.98) { lastStep = step; sfx.footstep(); }
        look.lerpVectors(lookA, lookB, smooth(0.5, 1, p));
      });

      // 2. pull the chair in and sit down
      sfx.creak();
      const chair = room.chair;
      const c0 = chair.position.clone();
      const r0 = chair.rotation.y;
      const cEnd = new V(0, 0, -1.95);
      let pos0 = pos.clone();
      let look0 = look.clone();
      await tween(1.9, (p) => {
        const e = ease.inOutCubic(p);
        const ce = ease.outCubic(clamp01(p * 1.3));
        chair.position.lerpVectors(c0, cEnd, ce);
        chair.rotation.y = lerp(r0, 0, ce);
        pos.lerpVectors(pos0, P.seated, e);
        pos.y -= Math.sin(Math.PI * p) * 0.07;
        look.lerpVectors(look0, SC.center, e);
      });

      // 3. lean over and press the PC's power button
      const btn = room.powerButton.getWorldPosition(new V());
      const lean = P.seated.clone().add(new V(0.1, -0.04, -0.1));
      await tween(1.0, (p) => {
        const e = ease.inOutCubic(p);
        look.lerpVectors(SC.center, btn, e);
        pos.lerpVectors(P.seated, lean, e);
      });
      const toBtn = new V().subVectors(btn, lean).normalize();
      await tween(0.35, (p) => { pos.copy(lean).addScaledVector(toBtn, Math.sin(Math.PI * p) * 0.05); });
      await powerOn();

      // 4. back to the monitor while it boots
      await tween(1.1, (p) => {
        const e = ease.inOutCubic(p);
        look.lerpVectors(btn, SC.center, e);
        pos.lerpVectors(lean, P.seated, e);
      });
      state = 'booting';
      lookOff.strength = 0.5;
      if (skipping) screen.finish();
      await wait(screen.remaining() + 0.3);
      ui.skip.hidden = true;
      await zoomIn();
    }

    async function powerOn() {
      sfx.click();
      room.powerOn();
      sfx.hum(true);
      await wait(0.35);
      sfx.beep();
      screen.boot();
    }

    async function zoomIn() {
      state = 'zooming';
      lookOff.strength = 0;
      hideHint();
      const pos0 = pos.clone();
      const look0 = look.clone();
      const target = fillPosition(new V());
      let shown = false;
      const reveal = () => { shown = true; os.show(); osShownAt = performance.now(); };
      await tween(1.7, (p) => {
        const e = ease.inOutCubic(p);
        pos.lerpVectors(pos0, target, e);
        look.lerpVectors(look0, SC.center, ease.outCubic(clamp01(p * 1.6)));
        if (p > 0.8 && !shown) reveal();
      });
      if (!shown) reveal();
      state = 'os';
    }

    leaveDesk = async (shutdown) => {
      if (state !== 'os') return;
      state = 'zooming';
      os.hide();
      if (shutdown) {
        sfx.powerDown();
        screen.off();
        room.powerOff();
        sfx.hum(false);
      }
      const pos0 = pos.clone();
      await tween(1.5, (p) => {
        pos.lerpVectors(pos0, P.seated, ease.inOutCubic(p));
        look.copy(SC.center);
      });
      state = 'seated';
      lookOff.strength = 1;
      showHint(shutdown ? 'Press the power button on the PC to boot it back up' : 'Click the monitor to get back to the desktop');
    };

    async function reboot() {
      state = 'booting';
      hideHint();
      await powerOn();
      await wait(screen.remaining() + 0.3);
      await zoomIn();
    }

    function shutdownFromRoom() {
      sfx.click();
      sfx.powerDown();
      screen.off();
      room.powerOff();
      sfx.hum(false);
      showHint('Press the power button on the PC to boot it back up');
    }

    function begin(skip) {
      sfx.init();
      ui.gate.classList.add('hidden');
      if (skip) { skipping = true; sfx.quiet = true; }
      runIntro().finally(() => { skipping = false; sfx.quiet = false; });
    }
    ui.enter.addEventListener('click', () => begin(false));
    ui.skipGate.addEventListener('click', () => begin(true));
    ui.skip.addEventListener('click', () => {
      skipping = true;
      sfx.quiet = true;
      ui.skip.hidden = true;
    });

    // ── input ──
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(e) {
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(room.pickables, false)[0]?.object.userData.pick ?? null;
    }
    window.addEventListener('pointermove', (e) => {
      lookOff.tx = (e.clientX / window.innerWidth) * 2 - 1;
      lookOff.ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (state === 'seated') renderer.domElement.style.cursor = pick(e) ? 'pointer' : '';
    });
    renderer.domElement.addEventListener('click', (e) => {
      if (state !== 'seated') return;
      const hit = pick(e);
      renderer.domElement.style.cursor = '';
      if (hit === 'screen' && screen.ready) zoomIn();
      else if (hit === 'power' && room.isOn()) shutdownFromRoom();
      else if (hit === 'power' || hit === 'screen') reboot();
    });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (state === 'os') fillPosition(pos);
    });

    // ── frame loop ──
    const up = new V(0, 1, 0);
    const dir = new V();
    const right = new V();
    const target = new V();
    function applyCamera(dt) {
      const k = Math.min(1, dt * 4);
      lookOff.x += (lookOff.tx * lookOff.strength - lookOff.x) * k;
      lookOff.y += (lookOff.ty * lookOff.strength - lookOff.y) * k;
      camera.position.copy(pos);
      dir.subVectors(look, pos);
      const dist = dir.length();
      dir.normalize().applyAxisAngle(up, -lookOff.x * 0.6);
      right.crossVectors(dir, up).normalize();
      dir.applyAxisAngle(right, -lookOff.y * 0.35);
      camera.lookAt(target.copy(pos).addScaledVector(dir, dist));
    }

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      // Generous cap: slow devices skip frames rather than playing the intro in slow motion.
      const dt = Math.min(clock.getDelta(), 0.5);
      const t = clock.elapsedTime;
      updateTweens(dt);
      screen.update();
      room.update(t);
      room.monitorLight.intensity = lerp(room.monitorLight.intensity, screen.glow * 1.4, Math.min(1, dt * 6));
      if (state === 'gate') pos.y = P.start.y + Math.sin(t * 1.2) * 0.008;
      // The desktop covers the canvas once it's faded in — stop rendering to save battery.
      if (state === 'os' && performance.now() - osShownAt > 900) return;
      applyCamera(dt);
      renderer.render(scene, camera);
    });
  }
}
