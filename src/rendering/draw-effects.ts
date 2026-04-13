import { GameState, rand, toWorld, spawnParticles } from '../state';
import { GamePhase } from '../types';
import { ROOM_WIDTH, ROOM_HEIGHT } from '../constants';

// ═══════════════════════════════════
//       EFFECTS UPDATE
// ═══════════════════════════════════

export function updateFx(state: GameState, dt: number): void {
  // Particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt * 2.2;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  // Trails
  for (let i = state.trails.length - 1; i >= 0; i--) {
    state.trails[i].life -= dt * 4;
    if (state.trails[i].life <= 0) state.trails.splice(i, 1);
  }

  // Shockwaves
  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const s = state.shockwaves[i];
    s.radius += dt * 200;
    s.life -= dt * 2.5;
    if (s.life <= 0) state.shockwaves.splice(i, 1);
  }

  // Floating text
  for (let i = state.texts.length - 1; i >= 0; i--) {
    const t = state.texts[i];
    t.y += t.vy * dt;
    t.life -= dt;
    if (t.life <= 0) state.texts.splice(i, 1);
  }

  // Beams
  for (let i = state.beams.length - 1; i >= 0; i--) {
    state.beams[i].life -= dt;
    if (state.beams[i].life <= 0) state.beams.splice(i, 1);
  }

  // Screen shake
  if (state.shakeIntensity > 0) {
    state.shakeX = (Math.random() - 0.5) * state.shakeIntensity * 2;
    state.shakeY = (Math.random() - 0.5) * state.shakeIntensity * 2;
    state.shakeIntensity *= 0.87;
    if (state.shakeIntensity < 0.3) {
      state.shakeIntensity = 0;
      state.shakeX = 0;
      state.shakeY = 0;
    }
  }

  // Screen flash
  if (state.screenFlash > 0) state.screenFlash -= dt * 3;
}

// ═══════════════════════════════════
//       DRAW EFFECTS
// ═══════════════════════════════════

export function drawBeams(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const b of state.beams) {
    const life = b.life / 0.15;
    const ex = b.x + Math.cos(b.angle) * b.range;
    const ey = b.y + Math.sin(b.angle) * b.range;

    // Layer 1: outer glow
    ctx.globalAlpha = life * 0.3;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.width + 8;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Layer 2: mid beam
    ctx.globalAlpha = life * 0.6;
    ctx.lineWidth = b.width + 3;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Layer 3: bright core
    ctx.globalAlpha = life * 0.8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = b.width * 0.5;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

export function drawZones(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.time;
  for (const z of state.zones) {
    const isIce = z.color.includes('22') || z.color.includes('bb');
    const isFire = z.color.includes('ff44') || z.color.includes('ff22') || z.color.includes('7722');
    const isHeal = z.color.includes('ffcc') || z.color.includes('ffee');

    if (isIce) {
      // ── ICE ZONE: snowflake pattern + frost ring ──
      ctx.globalAlpha = 0.08 + 0.04 * Math.sin(t * 2);
      ctx.fillStyle = '#88ccff';
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
      // Frost ring
      ctx.strokeStyle = '#aaeeff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      // Ice crystal particles
      ctx.fillStyle = '#cceeFF';
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 6; i++) {
        const a = t * 0.5 + (i / 6) * Math.PI * 2;
        const d = z.radius * (0.3 + 0.2 * Math.sin(t + i));
        ctx.beginPath();
        ctx.moveTo(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d - 3);
        ctx.lineTo(z.x + Math.cos(a) * d + 2, z.y + Math.sin(a) * d + 2);
        ctx.lineTo(z.x + Math.cos(a) * d - 2, z.y + Math.sin(a) * d + 2);
        ctx.closePath(); ctx.fill();
      }
    } else if (isFire) {
      // ── FIRE ZONE: flickering embers ──
      ctx.globalAlpha = 0.06 + 0.04 * Math.sin(t * 4);
      ctx.fillStyle = '#ff4400';
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ff6622';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.stroke();
      // Rising embers
      if (Math.random() < 0.4) {
        spawnParticles(state, z.x + rand(-z.radius * 0.8, z.radius * 0.8), z.y + rand(-z.radius * 0.8, z.radius * 0.8), '#ff8833', 1, 0.2);
      }
    } else if (isHeal) {
      // ── HEAL ZONE: golden sparkles ──
      ctx.globalAlpha = 0.05 + 0.03 * Math.sin(t * 3);
      ctx.fillStyle = '#ffeeaa';
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffdd66';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.stroke();
      // Rising + sparkles
      ctx.fillStyle = '#ffffcc';
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 3; i++) {
        const sx = z.x + Math.sin(t * 2 + i * 2.1) * z.radius * 0.5;
        const sy = z.y - (t * 20 + i * 30) % z.radius;
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // ── DEFAULT ZONE ──
      ctx.globalAlpha = 0.06 + 0.03 * Math.sin(t * 3);
      ctx.fillStyle = z.color;
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (Math.random() < 0.15) {
      spawnParticles(state, z.x + rand(-z.radius, z.radius), z.y + rand(-z.radius, z.radius), z.color, 1, 0.15);
    }
  }
}

export function drawAoe(ctx: CanvasRenderingContext2D, state: GameState): void {
  const t = state.time;
  for (const m of state.aoeMarkers) {
    const pr = m.age / m.delay;
    const isFire = m.color.includes('ff22');
    const isLightning = m.color.includes('ffcc');

    // Warning ring
    ctx.globalAlpha = 0.15 + pr * 0.25;
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 2 + pr * 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Filling danger zone
    ctx.fillStyle = m.color;
    ctx.globalAlpha = pr * 0.15;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius * pr, 0, Math.PI * 2);
    ctx.fill();

    if (isFire) {
      // Meteor: falling shadow that grows
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.radius * 0.4 * pr, m.radius * 0.25 * pr, 0, 0, Math.PI * 2);
      ctx.fill();
      // Meteor body approaching
      if (pr > 0.3) {
        const mSize = 8 + pr * 10;
        const mY = m.y - 100 * (1 - pr);
        ctx.fillStyle = '#ff4400';
        ctx.beginPath(); ctx.arc(m.x + 2, mY, mSize, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffaa33';
        ctx.beginPath(); ctx.arc(m.x + 2, mY, mSize * 0.5, 0, Math.PI * 2); ctx.fill();
        // Fire trail
        ctx.strokeStyle = '#ff6633';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(m.x + 2, mY - mSize);
        ctx.lineTo(m.x + 5, mY - mSize * 3);
        ctx.stroke();
      }
    } else if (isLightning) {
      // Thunder: lightning flicker from sky
      if (pr > 0.5 && Math.random() < 0.3) {
        ctx.strokeStyle = '#ffee88';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        const lx = m.x + (Math.random() - 0.5) * m.radius * 0.6;
        ctx.beginPath();
        ctx.moveTo(lx, m.y - 80);
        ctx.lineTo(lx + (Math.random() - 0.5) * 20, m.y - 40);
        ctx.lineTo(lx + (Math.random() - 0.5) * 15, m.y);
        ctx.stroke();
      }
      // Ground crackle
      ctx.strokeStyle = `rgba(255,220,100,${pr * 0.3})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a = t * 3 + (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + Math.cos(a) * m.radius * pr * 0.8, m.y + Math.sin(a) * m.radius * pr * 0.8);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }
}

export function drawFx(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Trails
  for (const t of state.trails) {
    const alpha = t.life * t.life * 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 4 * t.life;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r * t.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Particles
  for (const p of state.particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6 * p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Shockwaves
  for (const s of state.shockwaves) {
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 10 * s.life;
    ctx.globalAlpha = s.life * 0.4;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 3 * s.life;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.stroke();
    // Inner ring for layered look
    ctx.globalAlpha = s.life * 0.2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Floating text with damage-scaled sizing
  for (const t of state.texts) {
    ctx.globalAlpha = Math.min(1, t.life);
    ctx.fillStyle = t.color;
    // Scale font for damage numbers
    let fontSize = 12;
    const numMatch = t.text.match(/^-?(\d+)$/);
    if (numMatch) {
      const val = parseInt(numMatch[1]);
      if (val >= 12) { fontSize = 22; ctx.fillStyle = '#ffdd44'; }
      else if (val >= 8) fontSize = 18;
      else if (val >= 5) fontSize = 16;
    }
    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1;

  // Combo counter display
  if (state.comboCount >= 3) {
    const comboSize = 16 + Math.min(state.comboCount, 20);
    const comboPulse = 0.7 + 0.3 * Math.sin(state.time * 6);
    // Color shifts: white -> yellow -> orange -> red
    let comboColor: string;
    if (state.comboCount >= 50) comboColor = '#ffdd44';
    else if (state.comboCount >= 20) comboColor = '#ff4444';
    else if (state.comboCount >= 10) comboColor = '#ff8833';
    else comboColor = '#ffcc44';
    ctx.globalAlpha = comboPulse;
    ctx.fillStyle = comboColor;
    ctx.font = `bold ${comboSize}px Courier New`;
    ctx.textAlign = 'center';
    ctx.fillText(`${state.comboCount}x COMBO`, ROOM_WIDTH / 2, 40);
    ctx.globalAlpha = 1;
  }
}

export function drawCrosshair(ctx: CanvasRenderingContext2D, state: GameState): void {
  const wp = toWorld(state, state.mouseX, state.mouseY);
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(wp.x - 7, wp.y);
  ctx.lineTo(wp.x + 7, wp.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wp.x, wp.y - 7);
  ctx.lineTo(wp.x, wp.y + 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wp.x, wp.y, 4, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawCountdown(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.gamePhase !== GamePhase.Countdown) return;
  const n = Math.ceil(state.countdownTimer);
  const f = state.countdownTimer - Math.floor(state.countdownTimer);
  const sc = 1 + f * 0.3;
  ctx.fillStyle = `rgba(200,180,255,${0.3 + f * 0.5})`;
  ctx.font = `bold ${Math.floor(60 * sc)}px Courier New`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(n <= 0 ? 'GO!' : String(n), ROOM_WIDTH / 2, ROOM_HEIGHT / 2);
}
