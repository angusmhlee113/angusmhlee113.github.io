// The monitor's display: a canvas texture that plays a BIOS → logo → desktop
// boot sequence. The final desktop frame matches the HTML desktop in os.js so
// the hand-off from 3D to DOM is seamless.
import * as THREE from 'three';
import { SANS, MONO } from './fonts.js';

const W = 1280;
const H = 720;
export const BOOT_TIME = 4.6;
const now = () => performance.now() / 1000;
const clamp01 = (t) => Math.min(1, Math.max(0, t));

export const osName = (p) => `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}OS`;
export const initials = (p) => p.name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase();

export function drawWallpaper(g, w, h) {
  const base = g.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, '#0b0f1f');
  base.addColorStop(1, '#1a1033');
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  const r = Math.hypot(w, h) * 0.5;
  for (const [x, y, c] of [[0.2, 0.3, 'rgba(124,92,255,0.35)'], [0.8, 0.7, 'rgba(0,212,255,0.22)']]) {
    const rg = g.createRadialGradient(w * x, h * y, 0, w * x, h * y, r);
    rg.addColorStop(0, c);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
  }
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

export class BootScreen {
  constructor(profile) {
    this.profile = profile;
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.g = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.state = 'off';
    this.t0 = 0;
    this.done = false;
    this.onDesktop = null;

    const home = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    this.bios = [
      ['CPU    : Creative Core(TM) i9 @ 4.20GHz', ''],
      ['Memory Test : 65536K', 'OK'],
      ['Initializing USB Controllers ..', 'Done'],
      ['Detecting Primary Master ... projects.db', ''],
      ['Detecting Primary Slave  ... skills.bin', ''],
      ['Loading coffee.sys', 'OK'],
      ['Loading imposter_syndrome.dll', 'SKIPPED'],
      [`Mounting /home/${home}`, 'OK'],
      ['', ''],
      [`Booting ${osName(profile)}...`, ''],
    ];
    this.drawOff();
  }

  boot() {
    this.state = 'boot';
    this.t0 = now();
    this.done = false;
    this.desktopFired = false;
  }

  finish() { this.t0 = now() - BOOT_TIME; }

  off() {
    this.state = 'off';
    this.drawOff();
  }

  get elapsed() { return now() - this.t0; }
  get isOn() { return this.state === 'boot'; }
  get ready() { return this.isOn && this.elapsed >= BOOT_TIME; }
  remaining() { return this.isOn ? Math.max(0, BOOT_TIME - this.elapsed) : 0; }

  // 0..1 brightness, used to drive the monitor's light on the room.
  get glow() {
    if (!this.isOn) return 0;
    const e = this.elapsed;
    if (e < 0.35) return (e / 0.35) * 0.2;
    if (e < 2.1) return 0.25;
    if (e < 3.8) return 0.45;
    return 0.45 + clamp01((e - 3.8) / 0.6) * 0.55;
  }

  update() {
    if (!this.isOn || this.done) return;
    const e = this.elapsed;
    this.draw(e);
    if (e >= 3.8 && !this.desktopFired) {
      this.desktopFired = true;
      this.onDesktop?.();
    }
    if (e >= BOOT_TIME) this.done = true;
    this.texture.needsUpdate = true;
  }

  drawOff() {
    const g = this.g;
    g.fillStyle = '#030304';
    g.fillRect(0, 0, W, H);
    const sheen = g.createLinearGradient(0, 0, W, H);
    sheen.addColorStop(0, 'rgba(255,255,255,0.05)');
    sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.fillStyle = sheen;
    g.fillRect(0, 0, W, H);
    this.texture.needsUpdate = true;
  }

  draw(e) {
    if (e < 0.35) {
      const v = Math.round(12 * (e / 0.35));
      this.g.fillStyle = `rgb(${v},${v},${v + 2})`;
      this.g.fillRect(0, 0, W, H);
    } else if (e < 2.1) {
      this.drawBios(e - 0.35);
    } else {
      this.drawLogo(e - 2.1);
      if (e > 3.8) {
        this.g.globalAlpha = clamp01((e - 3.8) / 0.6);
        this.drawDesktop();
        this.g.globalAlpha = 1;
      }
    }
  }

  drawBios(t) {
    const g = this.g;
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    g.textBaseline = 'top';
    g.font = `600 30px ${MONO}`;
    g.fillStyle = '#ffffff';
    g.fillText(`${initials(this.profile)} Portfolio BIOS v26.10`, 60, 54);
    g.fillStyle = '#8a8fa3';
    g.font = `24px ${MONO}`;
    g.fillText(`Copyright (C) 2026 ${this.profile.name}. All rights reserved.`, 60, 96);

    // corner badge
    const grad = g.createLinearGradient(W - 200, 50, W - 60, 150);
    grad.addColorStop(0, '#7c5cff');
    grad.addColorStop(1, '#00d4ff');
    g.fillStyle = grad;
    roundRect(g, W - 190, 50, 130, 100, 16);
    g.fill();
    g.fillStyle = '#fff';
    g.font = `800 48px ${SANS}`;
    g.textAlign = 'center';
    g.fillText(initials(this.profile), W - 125, 74);
    g.textAlign = 'left';

    const shown = Math.min(this.bios.length, Math.floor(t / 0.15) + 1);
    g.font = `26px ${MONO}`;
    let y = 180;
    for (let i = 0; i < shown; i++) {
      const [text, status] = this.bios[i];
      g.fillStyle = '#cfd3dc';
      g.fillText(text, 60, y);
      if (status) {
        const x = 60 + g.measureText(text + ' ').width;
        g.fillStyle = status === 'SKIPPED' ? '#ffb454' : '#5af78e';
        g.fillText(status, x, y);
      }
      y += 40;
    }
    if (Math.floor(t * 4) % 2 === 0) {
      g.fillStyle = '#cfd3dc';
      g.fillRect(60, y + 4, 16, 26);
    }
    g.fillStyle = '#6c7085';
    g.font = `22px ${MONO}`;
    g.fillText('Press DEL to enter SETUP · F12 for Boot Menu', 60, H - 70);
  }

  drawLogo(t) {
    const g = this.g;
    g.fillStyle = '#07080f';
    g.fillRect(0, 0, W, H);
    const k = clamp01(t / 0.5);
    const s = 1 + 0.12 * Math.sin(k * Math.PI) * (1 - k) + (1 - k) * -0.3;
    const size = 170 * s;
    const cx = W / 2;
    const cy = H * 0.42;
    g.save();
    g.globalAlpha = k;
    g.shadowColor = 'rgba(124,92,255,0.7)';
    g.shadowBlur = 60;
    const grad = g.createLinearGradient(cx - size / 2, cy - size / 2, cx + size / 2, cy + size / 2);
    grad.addColorStop(0, '#7c5cff');
    grad.addColorStop(1, '#00d4ff');
    g.fillStyle = grad;
    roundRect(g, cx - size / 2, cy - size / 2, size, size, size * 0.24);
    g.fill();
    g.shadowBlur = 0;
    g.fillStyle = '#fff';
    g.font = `800 ${Math.round(size * 0.46)}px ${SANS}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(initials(this.profile), cx, cy + size * 0.02);
    g.font = `700 40px ${SANS}`;
    g.fillStyle = '#e8e9f3';
    g.fillText(osName(this.profile), cx, cy + 150);
    g.restore();

    // progress bar
    const p = clamp01((t - 0.3) / 1.4);
    const bw = 320;
    const by = H * 0.76;
    g.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(g, cx - bw / 2, by, bw, 6, 3);
    g.fill();
    g.fillStyle = '#b9a8ff';
    roundRect(g, cx - bw / 2, by, bw * p, 6, 3);
    g.fill();
    g.textAlign = 'left';
    g.textBaseline = 'top';
  }

  drawDesktop() {
    const g = this.g;
    drawWallpaper(g, W, H);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.font = `800 ${Math.round(H * 0.11)}px ${SANS}`;
    g.fillText(this.profile.name, W / 2, H * 0.46);
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.font = `500 ${Math.round(H * 0.03)}px ${SANS}`;
    g.fillText(this.profile.role.toUpperCase().split('').join(' '), W / 2, H * 0.55);
    g.fillStyle = 'rgba(8,9,20,0.75)';
    g.fillRect(0, H - 52, W, 52);
    g.textAlign = 'left';
    g.textBaseline = 'top';
  }
}
