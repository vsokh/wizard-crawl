import { GameState, rand } from '../state';
import {
  ROOM_WIDTH,
  ROOM_HEIGHT,
  WALL_THICKNESS,
} from '../constants';
import { GamePhase } from '../types';

// ═══════════════════════════════════
//       AMBIENT PARTICLES
// ═══════════════════════════════════

interface AmbientMote {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number;
  hue: number; phase: number;
}

const ambientMotes: AmbientMote[] = [];
const MOTE_COUNT = 40;

function ensureMotes(): void {
  while (ambientMotes.length < MOTE_COUNT) {
    ambientMotes.push({
      x: Math.random() * ROOM_WIDTH,
      y: Math.random() * ROOM_HEIGHT,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 6 - 3, // drift upward
      size: 1 + Math.random() * 2.5,
      alpha: 0.05 + Math.random() * 0.15,
      hue: Math.random() > 0.6 ? 270 : (Math.random() > 0.5 ? 220 : 40),
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function updateMotes(dt: number, time: number): void {
  for (let i = ambientMotes.length - 1; i >= 0; i--) {
    const m = ambientMotes[i];
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.alpha += Math.sin(time * 2 + m.phase) * dt * 0.02;
    // Wrap
    if (m.y < -10) { m.y = ROOM_HEIGHT + 5; m.x = Math.random() * ROOM_WIDTH; }
    if (m.x < -10 || m.x > ROOM_WIDTH + 10) { m.x = Math.random() * ROOM_WIDTH; m.y = Math.random() * ROOM_HEIGHT; }
  }
}

// ═══════════════════════════════════
//       FLOOR TILE CACHE
// ═══════════════════════════════════

let floorCanvas: OffscreenCanvas | null = null;

function generateFloorTexture(): OffscreenCanvas {
  const c = new OffscreenCanvas(ROOM_WIDTH, ROOM_HEIGHT);
  const ctx = c.getContext('2d')!;

  // Base dark floor
  ctx.fillStyle = '#0c0916';
  ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

  // Stone tile pattern (irregular)
  const TILE = 48;
  for (let ty = 0; ty < ROOM_HEIGHT; ty += TILE) {
    for (let tx = 0; tx < ROOM_WIDTH; tx += TILE) {
      const offset = (Math.floor(ty / TILE) % 2) * TILE * 0.5;
      const x = tx + offset;
      const brightness = 8 + Math.floor(Math.random() * 6);
      const hue = 260 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `hsl(${hue}, 15%, ${brightness}%)`;
      ctx.fillRect(x + 1, ty + 1, TILE - 2, TILE - 2);

      // Subtle crack lines
      if (Math.random() > 0.7) {
        ctx.strokeStyle = `rgba(40, 25, 60, ${0.1 + Math.random() * 0.1})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const cx = x + Math.random() * TILE;
        const cy = ty + Math.random() * TILE;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20);
        ctx.stroke();
      }
    }
  }

  // Grout lines (darker)
  ctx.strokeStyle = 'rgba(5, 3, 10, 0.4)';
  ctx.lineWidth = 1;
  for (let ty = 0; ty <= ROOM_HEIGHT; ty += TILE) {
    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(ROOM_WIDTH, ty); ctx.stroke();
  }
  for (let tx = 0; tx <= ROOM_WIDTH; tx += TILE) {
    const offset = tx % (TILE * 2) === 0 ? 0 : TILE * 0.5;
    ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx, ROOM_HEIGHT); ctx.stroke();
  }

  // Central magical rune circle (permanent floor detail)
  const cx = ROOM_WIDTH / 2, cy = ROOM_HEIGHT / 2;
  ctx.strokeStyle = 'rgba(80, 50, 120, 0.06)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 180, 0, Math.PI * 2); ctx.stroke();

  // Rune symbols in the circle
  ctx.strokeStyle = 'rgba(80, 50, 120, 0.04)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rx = cx + Math.cos(a) * 150;
    const ry = cy + Math.sin(a) * 150;
    // Small rune mark
    ctx.beginPath();
    ctx.moveTo(rx - 5, ry - 5);
    ctx.lineTo(rx + 5, ry + 5);
    ctx.moveTo(rx + 5, ry - 5);
    ctx.lineTo(rx - 5, ry + 5);
    ctx.stroke();
  }

  // Corner decorative marks
  const cornerDist = 60;
  const corners = [[cornerDist, cornerDist], [ROOM_WIDTH - cornerDist, cornerDist],
                   [cornerDist, ROOM_HEIGHT - cornerDist], [ROOM_WIDTH - cornerDist, ROOM_HEIGHT - cornerDist]];
  ctx.strokeStyle = 'rgba(60, 40, 90, 0.05)';
  ctx.lineWidth = 1;
  for (const [ccx, ccy] of corners) {
    ctx.beginPath(); ctx.arc(ccx, ccy, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(ccx, ccy, 15, 0, Math.PI * 2); ctx.stroke();
  }

  // Vignette darkening at edges
  const vigGrad = ctx.createRadialGradient(cx, cy, Math.min(ROOM_WIDTH, ROOM_HEIGHT) * 0.3, cx, cy, Math.max(ROOM_WIDTH, ROOM_HEIGHT) * 0.6);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);

  return c;
}

// ═══════════════════════════════════
//       DRAW ROOM
// ═══════════════════════════════════

export function drawRoom(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Generate floor texture once
  if (!floorCanvas) {
    floorCanvas = generateFloorTexture();
  }

  // Draw cached floor
  ctx.drawImage(floorCanvas, 0, 0);

  // Animated rune glow in center (pulses)
  const t = state.time;
  const runeAlpha = 0.02 + 0.015 * Math.sin(t * 0.8);
  const cx = ROOM_WIDTH / 2, cy = ROOM_HEIGHT / 2;
  ctx.strokeStyle = `rgba(120, 80, 200, ${runeAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, 120 + Math.sin(t * 0.5) * 3, t * 0.1, t * 0.1 + Math.PI * 1.8); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 180 + Math.sin(t * 0.3) * 4, -t * 0.07, -t * 0.07 + Math.PI * 1.6); ctx.stroke();

  // Ambient floating motes
  ensureMotes();
  updateMotes(0.016, t);
  for (const m of ambientMotes) {
    const flicker = m.alpha + Math.sin(t * 1.5 + m.phase) * 0.03;
    if (flicker <= 0) continue;
    ctx.globalAlpha = Math.max(0, Math.min(0.25, flicker));
    ctx.fillStyle = `hsl(${m.hue}, 40%, 70%)`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Walls — stone border with inner glow
  const wallGrad = ctx.createLinearGradient(0, 0, 0, WALL_THICKNESS * 3);
  wallGrad.addColorStop(0, '#1a1428');
  wallGrad.addColorStop(1, 'rgba(26,20,40,0)');
  ctx.fillStyle = '#1a1428';
  ctx.fillRect(0, 0, ROOM_WIDTH, WALL_THICKNESS);
  ctx.fillRect(0, ROOM_HEIGHT - WALL_THICKNESS, ROOM_WIDTH, WALL_THICKNESS);
  ctx.fillRect(0, 0, WALL_THICKNESS, ROOM_HEIGHT);
  ctx.fillRect(ROOM_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, ROOM_HEIGHT);

  // Inner wall glow (subtle purple edge light)
  ctx.strokeStyle = `rgba(100, 60, 160, ${0.08 + 0.03 * Math.sin(t * 1.2)})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(WALL_THICKNESS, WALL_THICKNESS, ROOM_WIDTH - WALL_THICKNESS * 2, ROOM_HEIGHT - WALL_THICKNESS * 2);

  // Wave indicator
  if (!state.waveActive && state.waveBreakTimer > 0 && state.gamePhase === GamePhase.Playing) {
    const waveAlpha = 0.2 + 0.1 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(200, 170, 80, ${waveAlpha})`;
    ctx.font = 'bold 28px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(200, 170, 80, 0.3)';
    ctx.shadowBlur = 15;
    ctx.fillText(`NEXT WAVE IN ${Math.ceil(state.waveBreakTimer)}`, ROOM_WIDTH / 2, ROOM_HEIGHT / 2 - 20);
    ctx.shadowBlur = 0;
  }

  // Enemy count
  if (state.waveActive) {
    const alive = state.enemies.filter(e => e.alive && !e._friendly).length;
    ctx.fillStyle = 'rgba(180,80,80,.15)';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`${alive} enemies remaining`, ROOM_WIDTH / 2, ROOM_HEIGHT - 14);
  }
}

// ═══════════════════════════════════
//       DRAW PILLARS
// ═══════════════════════════════════

export function drawPillars(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.time;
  for (const p of state.pillars) {
    const r = p.radius;

    // Shadow beneath pillar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(p.x + 2, p.y + r * 0.7, r * 0.9, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pillar body — stone gradient
    const g = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, r * 0.1, p.x, p.y, r);
    g.addColorStop(0, '#302840');
    g.addColorStop(0.6, '#1e1530');
    g.addColorStop(1, '#120e1c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Stone edge highlight
    ctx.strokeStyle = 'rgba(120, 90, 160, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, -0.8, 0.8);
    ctx.stroke();

    // Magical etch on some pillars
    if (p.radius > 22) {
      ctx.strokeStyle = `rgba(100, 70, 160, ${0.04 + 0.02 * Math.sin(t * 1.5 + p.x)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.6, t * 0.3 + p.y, t * 0.3 + p.y + Math.PI);
      ctx.stroke();
    }
  }
}
