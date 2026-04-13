import { SpellDefInput } from '../types';

// ═══════════════════════════════════
//     SPELL PREVIEW ANIMATIONS
// ═══════════════════════════════════

const CANVAS_W = 250;
const CANVAS_H = 36;
const LOOP_DURATION = 2.5; // seconds per animation cycle

interface PreviewParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  color: string;
}

interface PreviewState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  spell: SpellDefInput;
  color: string;
  trail: string;
  glow: string;
  particles: PreviewParticle[];
  time: number;
}

let states: PreviewState[] = [];
let rafId = 0;
let lastTime = 0;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

function spawnParticle(
  x: number, y: number, vx: number, vy: number,
  life: number, r: number, color: string,
): PreviewParticle {
  return { x, y, vx, vy, life, maxLife: life, r, color };
}

// ── Animation renderers by spell type ──

function drawProjectile(s: PreviewState, dt: number): void {
  const { ctx, color, trail } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = t * (CANVAS_W + 20) - 10;
  const cy = CANVAS_H / 2;
  const orbR = 4;

  // Trail particles
  if (Math.random() < 0.6) {
    s.particles.push(spawnParticle(
      cx - 2 + Math.random() * 4, cy + (Math.random() - 0.5) * 4,
      -20 - Math.random() * 30, (Math.random() - 0.5) * 10,
      0.3 + Math.random() * 0.2, 1.5 + Math.random(), trail || color,
    ));
  }

  // Orb
  ctx.beginPath();
  ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Glow
  ctx.beginPath();
  ctx.arc(cx, cy, orbR + 2, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.15);
  ctx.fill();
}

function drawHoming(s: PreviewState, dt: number): void {
  const { ctx, color, trail } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = t * (CANVAS_W + 20) - 10;
  const cy = CANVAS_H / 2 + Math.sin(t * Math.PI * 4) * 8;
  const orbR = 3.5;

  if (Math.random() < 0.5) {
    s.particles.push(spawnParticle(
      cx, cy, -15 - Math.random() * 20, (Math.random() - 0.5) * 10,
      0.25 + Math.random() * 0.15, 1 + Math.random(), trail || color,
    ));
  }

  ctx.beginPath();
  ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, orbR + 2, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.12);
  ctx.fill();
}

function drawBeam(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const pulse = Math.sin(t * Math.PI * 2);
  const beamW = 2 + pulse * 1;
  const cy = CANVAS_H / 2;

  // Main beam line
  ctx.strokeStyle = color;
  ctx.lineWidth = beamW;
  ctx.beginPath();
  ctx.moveTo(10, cy);
  // Jagged lightning segments
  const segs = 12;
  for (let i = 1; i <= segs; i++) {
    const sx = 10 + (CANVAS_W - 20) * (i / segs);
    const jitter = (i < segs) ? (Math.random() - 0.5) * 8 : 0;
    ctx.lineTo(sx, cy + jitter);
  }
  ctx.stroke();

  // Glow
  ctx.strokeStyle = hexToRgba(color, 0.15);
  ctx.lineWidth = beamW + 4;
  ctx.beginPath();
  ctx.moveTo(10, cy);
  for (let i = 1; i <= segs; i++) {
    const sx = 10 + (CANVAS_W - 20) * (i / segs);
    const jitter = (i < segs) ? (Math.random() - 0.5) * 6 : 0;
    ctx.lineTo(sx, cy + jitter);
  }
  ctx.stroke();

  // Crackle sparks
  if (Math.random() < 0.4) {
    const sparkX = 20 + Math.random() * (CANVAS_W - 40);
    s.particles.push(spawnParticle(
      sparkX, cy + (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40,
      0.15, 1, color,
    ));
  }
}

function drawCone(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const spread = t * 0.8;
  const alpha = t < 0.7 ? 0.4 : 0.4 * (1 - (t - 0.7) / 0.3);
  const originX = 15;
  const cy = CANVAS_H / 2;
  const length = 30 + spread * 180;
  const angle = 0.35;

  ctx.beginPath();
  ctx.moveTo(originX, cy);
  ctx.lineTo(originX + length, cy - Math.sin(angle) * length * 0.5);
  ctx.lineTo(originX + length, cy + Math.sin(angle) * length * 0.5);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, alpha * 0.5);
  ctx.fill();

  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawNova(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const maxR = 16;
  const r = t * maxR;
  const alpha = t < 0.7 ? 0.5 : 0.5 * (1 - (t - 0.7) / 0.3);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, alpha * 0.15);
  ctx.fill();
}

function drawAoeDelayed(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const markerR = 14;

  if (t < 0.6) {
    // Marker phase — pulsing circle
    const pulse = 0.6 + Math.sin(t * Math.PI * 6) * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, markerR, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(color, pulse * 0.5);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Burst phase
    const bt = (t - 0.6) / 0.4;
    const br = markerR * (0.5 + bt * 0.8);
    const alpha = 0.6 * (1 - bt);
    ctx.beginPath();
    ctx.arc(cx, cy, br, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, alpha * 0.4);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(color, alpha);
    ctx.lineWidth = 2;
    ctx.stroke();

    if (Math.random() < 0.5) {
      const ang = Math.random() * Math.PI * 2;
      s.particles.push(spawnParticle(
        cx + Math.cos(ang) * br, cy + Math.sin(ang) * br,
        Math.cos(ang) * 30, Math.sin(ang) * 30,
        0.2, 1.5, color,
      ));
    }
  }
}

function drawBlink(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cy = CANVAS_H / 2;

  // Quick dash
  const startX = 30;
  const endX = CANVAS_W - 30;
  const dashT = Math.min(t / 0.2, 1);
  const posX = startX + (endX - startX) * dashT;

  if (dashT < 1) {
    // Dash line
    ctx.strokeStyle = hexToRgba(color, 0.5);
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(startX, cy);
    ctx.lineTo(posX, cy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Afterimage at start
  if (t < 0.5) {
    const fade = 1 - t / 0.5;
    ctx.beginPath();
    ctx.arc(startX, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, fade * 0.3);
    ctx.fill();
  }

  // Main dot
  if (dashT >= 1) {
    const fade = Math.max(0, 1 - (t - 0.2) / 0.8);
    ctx.beginPath();
    ctx.arc(endX, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, fade * 0.7);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(posX, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawBarrage(s: PreviewState, dt: number): void {
  const { ctx, color, trail } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const originX = 15;
  const cy = CANVAS_H / 2;
  const count = 5;

  for (let i = 0; i < count; i++) {
    const angle = ((i - (count - 1) / 2) / count) * 0.5;
    const dist = t * (CANVAS_W + 10);
    const px = originX + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;

    if (px > CANVAS_W + 5 || py < -5 || py > CANVAS_H + 5) continue;

    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (Math.random() < 0.3) {
      s.particles.push(spawnParticle(
        px, py, -10, (Math.random() - 0.5) * 5,
        0.15, 1, trail || color,
      ));
    }
  }
}

function drawZone(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const r = 14;
  const pulse = 0.6 + Math.sin(t * Math.PI * 4) * 0.2;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, pulse * 0.15);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, pulse * 0.4);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Floating particles inside
  if (Math.random() < 0.3) {
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.random() * r * 0.8;
    s.particles.push(spawnParticle(
      cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist,
      (Math.random() - 0.5) * 8, -5 - Math.random() * 10,
      0.4 + Math.random() * 0.3, 1, color,
    ));
  }
}

function drawTrap(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const r = 5;
  const pulse = 0.7 + Math.sin(t * Math.PI * 3) * 0.3;

  // Trap body
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, pulse * 0.5);
  ctx.fill();

  // Danger rings
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3 + Math.sin(t * Math.PI * 2) * 2, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(color, pulse * 0.25);
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r + 6 + Math.sin(t * Math.PI * 2 + 1) * 2, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(color, pulse * 0.12);
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawUltimate(s: PreviewState, dt: number): void {
  const { ctx, color, glow } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;

  if (t < 0.3) {
    // Build-up — converging particles
    const bt = t / 0.3;
    const shrink = (1 - bt) * 16;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + s.time * 3;
      const px = cx + Math.cos(ang) * shrink;
      const py = cy + Math.sin(ang) * shrink;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(glow || color, 0.6);
      ctx.fill();
    }
  } else {
    // Explosion
    const et = (t - 0.3) / 0.7;
    const r = et * 16;
    const alpha = 0.6 * (1 - et);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(glow || color, alpha * 0.3);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(color, alpha);
    ctx.lineWidth = 2;
    ctx.stroke();

    if (Math.random() < 0.4 && et < 0.5) {
      const ang = Math.random() * Math.PI * 2;
      s.particles.push(spawnParticle(
        cx + Math.cos(ang) * r, cy + Math.sin(ang) * r,
        Math.cos(ang) * 40, Math.sin(ang) * 40,
        0.25, 1.5, glow || color,
      ));
    }
  }
}

function drawRewind(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const count = 8;

  // Forward phase (0–0.5), reverse phase (0.5–1.0)
  const forward = t < 0.5;
  const phase = forward ? t / 0.5 : (1 - t) / 0.5;

  for (let i = 0; i < count; i++) {
    const baseAng = (i / count) * Math.PI * 2;
    const ang = baseAng + phase * Math.PI * 2;
    const r = 4 + phase * 10;
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;

    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, forward ? 0.6 : 0.4);
    ctx.fill();
  }
}

function drawAllyShield(s: PreviewState, dt: number): void {
  const { ctx, color } = s;
  const t = (s.time % LOOP_DURATION) / LOOP_DURATION;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;

  const r = 6 + t * 8;
  const alpha = t < 0.6 ? 0.5 : 0.5 * (1 - (t - 0.6) / 0.4);

  // Shield bubble
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, alpha * 0.12);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(color, alpha * 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner dot (caster)
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.4);
  ctx.fill();
}

// Map spell types to their draw functions
type DrawFn = (s: PreviewState, dt: number) => void;

const DRAW_MAP: Record<string, DrawFn> = {
  projectile: drawProjectile,
  homing: drawHoming,
  beam: drawBeam,
  cone: drawCone,
  nova: drawNova,
  aoe_delayed: drawAoeDelayed,
  blink: drawBlink,
  leap: drawBlink,
  barrage: drawBarrage,
  zone: drawZone,
  trap: drawTrap,
  ultimate: drawUltimate,
  rewind: drawRewind,
  ally_shield: drawAllyShield,
};

// ── Particle update & draw ──

function updateParticles(s: PreviewState, dt: number): void {
  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      s.particles.splice(i, 1);
    }
  }
  // Cap particles per canvas
  if (s.particles.length > 30) {
    s.particles.splice(0, s.particles.length - 30);
  }
}

function drawParticles(s: PreviewState): void {
  const { ctx } = s;
  for (const p of s.particles) {
    const alpha = Math.max(0, p.life / p.maxLife) * 0.6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(p.color, alpha);
    ctx.fill();
  }
}

// ── Main loop ──

function tick(timestamp: number): void {
  if (!states.length) { rafId = 0; return; }
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  for (const s of states) {
    s.time += dt;
    const { ctx } = s;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw background
    ctx.fillStyle = 'rgba(10, 7, 18, 0.85)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw spell animation
    const drawFn = DRAW_MAP[s.spell.type] || drawProjectile;
    drawFn(s, dt);

    // Draw particles
    updateParticles(s, dt);
    drawParticles(s);
  }

  rafId = requestAnimationFrame(tick);
}

// ── Public API ──

export function startPreviews(
  spells: SpellDefInput[],
  classColor: string,
  classGlow: string,
): void {
  stopPreviews();

  const canvases = document.querySelectorAll<HTMLCanvasElement>('.cd-spell-preview');
  if (!canvases.length) return;

  states = [];
  canvases.forEach((canvas, i) => {
    if (i >= spells.length) return;
    const sp = spells[i];
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    states.push({
      canvas,
      ctx,
      spell: sp,
      color: sp.color || classColor,
      trail: sp.trail || '',
      glow: classGlow,
      particles: [],
      time: 0,
    });
  });

  lastTime = 0;
  rafId = requestAnimationFrame(tick);
}

export function stopPreviews(): void {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
  states = [];
  lastTime = 0;
}
