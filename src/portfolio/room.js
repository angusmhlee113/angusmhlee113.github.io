// Builds the developer's bedroom out of primitives and canvas textures.
// Units are meters. The room spans x/z ∈ [-3, 3], y ∈ [0, 2.8]; the desk is
// against the back wall (z = -3), facing +z.
import * as THREE from 'three';
import { SANS, MONO } from './fonts.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V = THREE.Vector3;

// deterministic random so the room looks the same on every visit
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(42);

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });

function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, receive = true, parent } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  if (parent) parent.add(m);
  return m;
}

const rbox = (w, h, d, r = 0.01) => new RoundedBoxGeometry(w, h, d, 3, r);

function rod(a, b, radius, mat, parent) {
  const dir = new V().subVectors(b, a);
  const m = mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 12), mat, 0, 0, 0, { parent });
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new V(0, 1, 0), dir.normalize());
  return m;
}

// ── textures ───────────────────────────────────────────────────

function woodFloor() {
  return canvasTex(1024, 1024, (g, w, h) => {
    const rows = 8;
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      const off = ((r * 0.37) % 1) * (w / 2);
      for (let x = -off; x < w; x += w / 2) {
        g.fillStyle = `hsl(${24 + rnd() * 6}, ${32 + rnd() * 10}%, ${22 + rnd() * 8}%)`;
        g.fillRect(x, r * rh, w / 2, rh);
        for (let i = 0; i < 16; i++) {
          g.strokeStyle = `rgba(20,10,5,${0.06 + rnd() * 0.12})`;
          g.lineWidth = 1 + rnd() * 2;
          const y = r * rh + rnd() * rh;
          g.beginPath();
          g.moveTo(x, y);
          g.bezierCurveTo(x + w * 0.15, y + rnd() * 8 - 4, x + w * 0.35, y + rnd() * 8 - 4, x + w / 2, y);
          g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,0.45)';
        g.fillRect(x, r * rh, 3, rh);
      }
      g.fillStyle = 'rgba(0,0,0,0.5)';
      g.fillRect(0, r * rh, w, 3);
    }
  }, [3, 3]);
}

function nightCity() {
  return canvasTex(1024, 800, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#050817');
    sky.addColorStop(0.7, '#1b1442');
    sky.addColorStop(1, '#3a1d4f');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.7})`;
      g.fillRect(rnd() * w, rnd() * h * 0.6, 1.5, 1.5);
    }
    // moon
    const mx = w * 0.76, my = h * 0.2;
    const glow = g.createRadialGradient(mx, my, 10, mx, my, 160);
    glow.addColorStop(0, 'rgba(200,210,255,0.5)');
    glow.addColorStop(1, 'rgba(200,210,255,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#eef0ff';
    g.beginPath();
    g.arc(mx, my, 44, 0, Math.PI * 2);
    g.fill();
    // skyline, two layers
    for (const [shade, minH, maxH, lit] of [['#0d0c22', 0.25, 0.45, 0.15], ['#06060f', 0.15, 0.6, 0.3]]) {
      let x = -20;
      while (x < w) {
        const bw = 40 + rnd() * 90;
        const bh = h * (minH + rnd() * (maxH - minH));
        g.fillStyle = shade;
        g.fillRect(x, h - bh, bw, bh);
        for (let wy = h - bh + 12; wy < h - 10; wy += 16) {
          for (let wx = x + 8; wx < x + bw - 8; wx += 12) {
            if (rnd() < lit) {
              g.fillStyle = ['#ffd27a', '#ffb86b', '#9fd8ff', '#c9a8ff'][Math.floor(rnd() * 4)];
              g.globalAlpha = 0.5 + rnd() * 0.5;
              g.fillRect(wx, wy, 5, 7);
              g.globalAlpha = 1;
            }
          }
        }
        x += bw + rnd() * 6;
      }
    }
  });
}

function posterTex(name) {
  return canvasTex(500, 700, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#ff6b9a');
    bg.addColorStop(1, '#5b2cff');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < 12; i++) g.fillRect(0, i * 60 + 20, w, 2);
    g.fillStyle = '#fff';
    g.font = `800 92px ${SANS}`;
    ['BUILD', 'BREAK', 'LEARN', 'REPEAT'].forEach((wd, i) => {
      g.globalAlpha = i === 3 ? 1 : 0.85;
      g.fillText(wd, 36, 150 + i * 120);
    });
    g.globalAlpha = 1;
    g.font = `500 22px ${MONO}`;
    g.fillText(`// ${name.toLowerCase()} — est. 2026`, 36, h - 46);
  });
}

function neonTex() {
  return canvasTex(600, 300, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = `700 190px ${MONO}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 10;
    g.strokeStyle = '#ff5ccf';
    g.shadowColor = '#ff5ccf';
    for (const blur of [60, 30, 12]) {
      g.shadowBlur = blur;
      g.strokeText('</>', w / 2, h / 2);
    }
    g.shadowBlur = 0;
    g.lineWidth = 4;
    g.strokeStyle = '#ffe3f7';
    g.strokeText('</>', w / 2, h / 2);
  });
}

function rugTex() {
  return canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = '#231a3d';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6b4fd8';
    g.lineWidth = 10;
    g.strokeRect(24, 24, w - 48, h - 48);
    g.strokeStyle = '#2ec4d6';
    g.lineWidth = 4;
    g.strokeRect(46, 46, w - 92, h - 92);
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(255,255,255,${rnd() * 0.04})`;
      g.fillRect(rnd() * w, rnd() * h, 2, 2);
    }
  });
}

function sidePanelTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#7c5cff');
    gr.addColorStop(1, '#00d4ff');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(20, 20, w - 40, h - 40);
  });
}

// ── build ──────────────────────────────────────────────────────

export function buildRoom(scene, screenTexture, name) {
  const refs = { pickables: [] };

  // lights
  scene.add(new THREE.HemisphereLight('#7a88d0', '#3a2c24', 2.6));
  const moon = new THREE.DirectionalLight('#9fb2ff', 1.2);
  moon.position.set(6, 4, -0.6);
  scene.add(moon);

  // shell
  const wallMat = std('#4d5478', { roughness: 0.95 });
  const floor = mesh(new THREE.PlaneGeometry(6, 6), std('#ffffff', { map: woodFloor(), roughness: 0.6 }), 0, 0, 0, { cast: false });
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const ceil = mesh(new THREE.PlaneGeometry(6, 6), std('#5a6080'), 0, 2.8, 0, { cast: false });
  ceil.rotation.x = Math.PI / 2;
  scene.add(ceil);
  for (const [x, z, ry] of [[0, -3, 0], [0, 3, Math.PI], [-3, 0, Math.PI / 2], [3, 0, -Math.PI / 2]]) {
    const wall = mesh(new THREE.PlaneGeometry(6, 2.8), wallMat, x, 1.4, z, { cast: false });
    wall.rotation.y = ry;
    scene.add(wall);
    const base = mesh(new THREE.BoxGeometry(6, 0.1, 0.02), std('#15172a'), x, 0.05, z, { cast: false });
    base.rotation.y = ry;
    base.translateZ(0.01);
    scene.add(base);
  }

  // window on the right wall
  const win = new THREE.Group();
  win.position.set(2.985, 1.55, -0.7);
  win.rotation.y = -Math.PI / 2;
  scene.add(win);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshBasicMaterial({ map: nightCity(), toneMapped: false }));
  glass.material.color.setScalar(0.85);
  win.add(glass);
  const frameMat = std('#d8d4e4', { roughness: 0.5 });
  for (const [w, h, x, y] of [[1.6, 0.05, 0, 0.575], [1.6, 0.05, 0, -0.575], [0.05, 1.2, 0.775, 0], [0.05, 1.2, -0.775, 0], [0.03, 1.1, 0, 0], [1.5, 0.03, 0, 0.1]]) {
    mesh(new THREE.BoxGeometry(w, h, 0.04), frameMat, x, y, 0.02, { parent: win });
  }
  mesh(new THREE.BoxGeometry(1.7, 0.04, 0.16), frameMat, 0, -0.62, 0.08, { parent: win });

  // rug
  const rug = mesh(new THREE.PlaneGeometry(2.4, 1.8), std('#ffffff', { map: rugTex(), roughness: 1 }), 0, 0.004, -1.7, { cast: false });
  rug.rotation.x = -Math.PI / 2;
  scene.add(rug);

  // desk
  const desk = new THREE.Group();
  scene.add(desk);
  const woodMat = std('#3a2a20', { roughness: 0.55 });
  const metal = std('#16171c', { metalness: 0.6, roughness: 0.4 });
  mesh(rbox(1.7, 0.04, 0.75, 0.008), woodMat, 0, 0.74, -2.6, { parent: desk });
  for (const x of [-0.8, 0.8]) for (const z of [-2.29, -2.91]) mesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), metal, x, 0.36, z, { parent: desk });
  mesh(new THREE.BoxGeometry(0.9, 0.004, 0.38), std('#121319', { roughness: 1 }), 0.05, 0.762, -2.42, { parent: desk });

  // LED strip on the wall behind the desk
  mesh(new THREE.BoxGeometry(1.6, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: '#a58cff', toneMapped: false }), 0, 0.8, -2.99, { cast: false, parent: desk });
  const led = new THREE.PointLight('#8a63ff', 1.6, 3.2, 1.6);
  led.position.set(0, 1.05, -2.88);
  scene.add(led);

  // monitor
  const SCREEN_W = 0.62;
  const SCREEN_H = 0.35;
  const screenCenter = new V(0, 1.13, -2.703);
  const bezelMat = std('#0d0e12', { roughness: 0.35, metalness: 0.2 });
  const bezel = mesh(rbox(0.66, 0.39, 0.03, 0.008), bezelMat, 0, 1.13, -2.72, { parent: desk });
  mesh(rbox(0.32, 0.2, 0.05, 0.02), bezelMat, 0, 1.12, -2.75, { parent: desk });
  mesh(new THREE.BoxGeometry(0.05, 0.26, 0.03), metal, 0, 0.89, -2.765, { parent: desk });
  mesh(rbox(0.26, 0.014, 0.18, 0.006), metal, 0, 0.767, -2.73, { parent: desk });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false }));
  screenMesh.position.copy(screenCenter);
  screenMesh.userData.pick = 'screen';
  bezel.userData.pick = 'screen';
  desk.add(screenMesh);
  refs.pickables.push(screenMesh, bezel);
  const monitorLight = new THREE.PointLight('#a9bfff', 0, 2.6, 1.5);
  monitorLight.position.set(0, 1.13, -2.45);
  scene.add(monitorLight);
  refs.screen = { center: screenCenter, w: SCREEN_W, h: SCREEN_H, mesh: screenMesh };
  refs.monitorLight = monitorLight;

  // keyboard with per-key RGB
  mesh(rbox(0.44, 0.022, 0.145, 0.006), std('#1b1c23', { roughness: 0.5 }), 0, 0.773, -2.4, { parent: desk });
  const keyMat = std('#2b2d38', { roughness: 0.6, emissive: '#000000' });
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.023, 0.01, 0.022), keyMat, 15 * 5);
  const dummy = new THREE.Object3D();
  let k = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 15; c++) {
      dummy.position.set(-0.189 + c * 0.027, 0.788, -2.454 + r * 0.027);
      dummy.updateMatrix();
      keys.setMatrixAt(k++, dummy.matrix);
    }
  }
  keys.castShadow = true;
  desk.add(keys);

  // mouse, mug, notebook
  const mouse = mesh(new THREE.SphereGeometry(0.03, 20, 12), std('#1b1c23', { roughness: 0.4 }), 0.32, 0.772, -2.4, { parent: desk });
  mouse.scale.set(0.9, 0.42, 1.4);
  const mugMat = std('#ece7dc', { roughness: 0.3 });
  mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 24), mugMat, -0.48, 0.81, -2.45, { parent: desk });
  mesh(new THREE.TorusGeometry(0.026, 0.007, 8, 20), mugMat, -0.44, 0.812, -2.45, { parent: desk });
  const coffee = mesh(new THREE.CircleGeometry(0.035, 24), std('#3b2317', { roughness: 0.2 }), -0.48, 0.85, -2.45, { cast: false, parent: desk });
  coffee.rotation.x = -Math.PI / 2;
  const book = mesh(rbox(0.16, 0.014, 0.22, 0.004), std('#7c5cff'), -0.3, 0.768, -2.66, { parent: desk });
  book.rotation.y = 0.25;

  // desk lamp
  const lampMat = std('#e7e4ef', { roughness: 0.4 });
  const p0 = new V(-0.7, 0.78, -2.82);
  const p1 = new V(-0.74, 1.16, -2.76);
  const p2 = new V(-0.54, 1.24, -2.6);
  const lampTarget = new V(-0.42, 0.76, -2.45);
  mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 32), lampMat, p0.x, 0.773, p0.z, { parent: desk });
  rod(p0, p1, 0.008, lampMat, desk);
  rod(p1, p2, 0.008, lampMat, desk);
  const shade = mesh(new THREE.ConeGeometry(0.065, 0.11, 32, 1, true), std('#e7e4ef', { side: THREE.DoubleSide, roughness: 0.4 }), p2.x, p2.y, p2.z, { parent: desk });
  const down = new V().subVectors(p2, lampTarget).normalize();
  shade.quaternion.setFromUnitVectors(new V(0, 1, 0), down);
  const bulb = mesh(new THREE.SphereGeometry(0.022, 16, 8), new THREE.MeshBasicMaterial({ color: '#fff2d6' }), 0, 0, 0, { cast: false, parent: desk });
  bulb.position.copy(p2).addScaledVector(down, -0.04);
  const lamp = new THREE.SpotLight('#ffb871', 9, 5, 0.8, 0.6, 1.4);
  lamp.position.copy(bulb.position);
  lamp.target.position.copy(lampTarget);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(1024, 1024);
  lamp.shadow.bias = -0.0005;
  lamp.shadow.camera.near = 0.05;
  scene.add(lamp, lamp.target);

  // PC tower
  const tower = new THREE.Group();
  tower.position.set(0.66, 0.76, -2.66);
  scene.add(tower);
  const towerCase = mesh(rbox(0.2, 0.44, 0.42, 0.012), std('#111217', { roughness: 0.35, metalness: 0.3 }), 0, 0.22, 0, { parent: tower });
  const ringMat = std('#1e1f26', { emissive: '#000000', roughness: 0.4 });
  const fanMat = std('#07070a', { roughness: 0.9 });
  for (const y of [0.13, 0.27]) {
    mesh(new THREE.CircleGeometry(0.05, 32), fanMat, 0, y, 0.2115, { cast: false, parent: tower });
    mesh(new THREE.TorusGeometry(0.052, 0.006, 10, 48), ringMat, 0, y, 0.212, { parent: tower });
  }
  const button = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 24), std('#2a2b33', { metalness: 0.5, roughness: 0.3 }), 0, 0.39, 0.212, { parent: tower });
  button.rotation.x = Math.PI / 2;
  const btnRingMat = std('#202128', { emissive: '#000000' });
  mesh(new THREE.TorusGeometry(0.015, 0.0025, 8, 32), btnRingMat, 0, 0.39, 0.213, { parent: tower });
  const sideMat = std('#000000', { emissive: '#ffffff', emissiveMap: sidePanelTex(), emissiveIntensity: 0, roughness: 0.2 });
  const side = mesh(new THREE.PlaneGeometry(0.38, 0.38), sideMat, -0.1015, 0.22, 0, { cast: false, parent: tower });
  side.rotation.y = -Math.PI / 2;
  const towerLight = new THREE.PointLight('#7c5cff', 0, 1.4, 1.5);
  towerLight.position.set(0.5, 1.0, -2.6);
  scene.add(towerLight);
  for (const m of [towerCase, button]) {
    m.userData.pick = 'power';
    refs.pickables.push(m);
  }
  refs.powerButton = button;

  // office chair
  const chair = new THREE.Group();
  chair.position.set(0.5, 0, -1.6);
  chair.rotation.y = 0.9;
  scene.add(chair);
  const fabric = std('#1f2232', { roughness: 0.95 });
  const accent = std('#7c5cff', { roughness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = mesh(new THREE.BoxGeometry(0.3, 0.03, 0.04), metal, Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15, { parent: chair });
    leg.rotation.y = -a;
    mesh(new THREE.SphereGeometry(0.028, 12, 8), metal, Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3, { parent: chair });
  }
  mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.32, 16), metal, 0, 0.24, 0, { parent: chair });
  mesh(rbox(0.5, 0.09, 0.48, 0.035), fabric, 0, 0.45, 0, { parent: chair });
  const back = mesh(rbox(0.46, 0.62, 0.07, 0.03), fabric, 0, 0.88, 0.25, { parent: chair });
  back.rotation.x = 0.12;
  const stripe = mesh(new THREE.BoxGeometry(0.06, 0.5, 0.01), accent, 0, 0.88, 0.288, { cast: false, parent: chair });
  stripe.rotation.x = 0.12;
  mesh(new THREE.BoxGeometry(0.06, 0.28, 0.03), metal, 0, 0.58, 0.24, { parent: chair });
  for (const x of [-0.27, 0.27]) {
    mesh(new THREE.BoxGeometry(0.03, 0.2, 0.04), metal, x, 0.57, 0.02, { parent: chair });
    mesh(rbox(0.06, 0.025, 0.25, 0.01), fabric, x, 0.68, 0.02, { parent: chair });
  }
  refs.chair = chair;

  // bookshelf on the left wall
  const shelf = new THREE.Group();
  shelf.position.set(-2.82, 0, -1.55);
  scene.add(shelf);
  const shelfMat = std('#3d2c22', { roughness: 0.7 });
  for (const z of [-0.485, 0.485]) mesh(new THREE.BoxGeometry(0.34, 1.9, 0.03), shelfMat, 0, 0.95, z, { parent: shelf });
  mesh(new THREE.BoxGeometry(0.02, 1.9, 1.0), shelfMat, -0.16, 0.95, 0, { parent: shelf });
  const levels = [0.02, 0.48, 0.94, 1.4, 1.88];
  for (const y of levels) mesh(new THREE.BoxGeometry(0.34, 0.025, 0.97), shelfMat, 0, y, 0, { parent: shelf });
  const bookColors = ['#7c5cff', '#ff6b9a', '#2ec4d6', '#ffd166', '#e8e4f0', '#3a3f6b', '#ef476f', '#06d6a0', '#20223a'];
  for (const y of levels.slice(0, 4)) {
    let z = -0.46;
    while (z < 0.44) {
      const t = 0.025 + rnd() * 0.03;
      if (rnd() < 0.08) { z += 0.08; continue; }
      const h = 0.24 + rnd() * 0.14;
      const b = mesh(new THREE.BoxGeometry(0.22 + rnd() * 0.05, h, t), std(bookColors[Math.floor(rnd() * bookColors.length)], { roughness: 0.75 }), 0.02, y + 0.0125 + h / 2, z + t / 2, { parent: shelf });
      if (rnd() < 0.06) b.rotation.x = 0.15;
      z += t + 0.002;
    }
  }

  // bed in the near-left corner
  const bed = new THREE.Group();
  bed.position.set(-2.2, 0, 1.75);
  scene.add(bed);
  mesh(new THREE.BoxGeometry(1.4, 0.28, 2.1), shelfMat, 0, 0.14, 0, { parent: bed });
  mesh(rbox(1.34, 0.2, 2.0, 0.05), std('#d9d6e6', { roughness: 0.95 }), 0, 0.38, 0, { parent: bed });
  mesh(rbox(1.4, 0.07, 1.35, 0.03), std('#4b3f8f', { roughness: 1 }), 0, 0.5, -0.32, { parent: bed });
  for (const x of [-0.33, 0.33]) mesh(rbox(0.58, 0.12, 0.34, 0.05), std('#ecebf5', { roughness: 1 }), x, 0.53, 0.75, { parent: bed });
  mesh(new THREE.BoxGeometry(1.4, 0.85, 0.06), shelfMat, 0, 0.42, 1.06, { parent: bed });

  // plant by the desk
  const plant = new THREE.Group();
  plant.position.set(1.32, 0, -2.62);
  scene.add(plant);
  mesh(new THREE.CylinderGeometry(0.15, 0.115, 0.34, 28), std('#c9b8a6', { roughness: 0.9 }), 0, 0.17, 0, { parent: plant });
  const leafGeo = new THREE.SphereGeometry(1, 12, 8);
  for (let i = 0; i < 11; i++) {
    const pivot = new THREE.Group();
    pivot.position.y = 0.32;
    pivot.rotation.y = (i / 11) * Math.PI * 2 + rnd() * 0.4;
    plant.add(pivot);
    const leaf = mesh(leafGeo, std(`hsl(${135 + rnd() * 20}, 45%, ${24 + rnd() * 12}%)`, { roughness: 0.7 }), 0, 0, 0, { parent: pivot });
    leaf.scale.set(0.07, 0.32 + rnd() * 0.15, 0.015);
    const tilt = 0.25 + rnd() * 0.6;
    leaf.rotation.z = tilt;
    leaf.position.set(-Math.sin(tilt) * leaf.scale.y, Math.cos(tilt) * leaf.scale.y, 0);
  }

  // wall decor: poster + neon sign
  mesh(new THREE.BoxGeometry(0.54, 0.74, 0.02), std('#0e0f14'), -1.05, 1.86, -2.99, { cast: false, parent: scene });
  mesh(new THREE.PlaneGeometry(0.5, 0.7), std('#ffffff', { map: posterTex(name) }), -1.05, 1.86, -2.978, { cast: false, parent: scene });
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.32), new THREE.MeshBasicMaterial({ map: neonTex(), transparent: true, toneMapped: false, depthWrite: false }));
  neon.position.set(0.95, 1.92, -2.975);
  scene.add(neon);
  const neonLight = new THREE.PointLight('#ff5ccf', 0.6, 2.2, 1.5);
  neonLight.position.set(0.95, 1.9, -2.75);
  scene.add(neonLight);

  // ceiling light: a soft warm fill so the room reads clearly
  scene.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 32), new THREE.MeshBasicMaterial({ color: '#fff1dc' }), 0, 2.78, 0, { cast: false }));
  const ceilingLight = new THREE.PointLight('#ffe2bf', 5, 9, 1.1);
  ceilingLight.position.set(0, 2.35, 0);
  scene.add(ceilingLight);

  // ── power state ──
  let on = false;
  refs.powerOn = () => {
    on = true;
    btnRingMat.emissive.set('#3aa0ff');
    btnRingMat.emissiveIntensity = 2;
    sideMat.emissiveIntensity = 0.9;
    towerLight.intensity = 0.7;
  };
  refs.powerOff = () => {
    on = false;
    btnRingMat.emissive.set('#000000');
    ringMat.emissive.set('#000000');
    keyMat.emissive.set('#000000');
    sideMat.emissiveIntensity = 0;
    towerLight.intensity = 0;
  };
  refs.isOn = () => on;
  refs.update = (t) => {
    if (!on) return;
    ringMat.emissive.setHSL((t * 0.07) % 1, 0.9, 0.55);
    ringMat.emissiveIntensity = 1.6;
    keyMat.emissive.setHSL((t * 0.07 + 0.3) % 1, 0.8, 0.4);
    keyMat.emissiveIntensity = 0.5;
    towerLight.color.copy(ringMat.emissive);
  };

  return refs;
}
