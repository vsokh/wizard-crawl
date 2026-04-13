import { GameState } from '../state';
import { ENEMIES, WIZARD_SIZE } from '../constants';
import { PickupType } from '../types';

// ═══════════════════════════════════
//       DRAW WIZARDS
// ═══════════════════════════════════

// ── Class-specific silhouette drawing ──
function drawClassBody(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, clsKey: string, color: string, glow: string, time: number): void {
  const S = WIZARD_SIZE;

  if (clsKey === 'pyromancer') {
    // Flame-wreathed circle with fire crown
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, S, 0, Math.PI * 2); ctx.fill();
    // Fire crown (3 flame points)
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i - 1) * 0.5;
      const flicker = Math.sin(time * 12 + i * 2) * 2;
      ctx.fillStyle = i === 1 ? '#ff4400' : '#ff6633';
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a - 0.2) * S * 0.6, y + Math.sin(a - 0.2) * S * 0.6);
      ctx.lineTo(x + Math.cos(a) * (S * 1.5 + flicker), y + Math.sin(a) * (S * 1.5 + flicker));
      ctx.lineTo(x + Math.cos(a + 0.2) * S * 0.6, y + Math.sin(a + 0.2) * S * 0.6);
      ctx.closePath(); ctx.fill();
    }
  } else if (clsKey === 'cryomancer') {
    // Crystal/diamond shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - S * 1.2); ctx.lineTo(x + S * 0.8, y);
    ctx.lineTo(x, y + S * 1.2); ctx.lineTo(x - S * 0.8, y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#aaeeff'; ctx.lineWidth = 1; ctx.stroke();
    // Inner crystal
    ctx.fillStyle = '#88ddff44';
    ctx.beginPath();
    ctx.moveTo(x, y - S * 0.6); ctx.lineTo(x + S * 0.4, y);
    ctx.lineTo(x, y + S * 0.6); ctx.lineTo(x - S * 0.4, y);
    ctx.closePath(); ctx.fill();
  } else if (clsKey === 'stormcaller') {
    // Crackling orb with lightning spikes
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, S * 0.9, 0, Math.PI * 2); ctx.fill();
    // 4 lightning bolts radiating
    for (let i = 0; i < 4; i++) {
      const a = time * 3 + (i / 4) * Math.PI * 2;
      ctx.strokeStyle = `rgba(200,150,255,${0.3 + 0.2 * Math.sin(time * 8 + i)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * S * 0.7, y + Math.sin(a) * S * 0.7);
      const mx = x + Math.cos(a + 0.15) * S * 1.2;
      const my = y + Math.sin(a + 0.15) * S * 1.2;
      ctx.lineTo(mx, my);
      ctx.lineTo(x + Math.cos(a - 0.1) * S * 1.6, y + Math.sin(a - 0.1) * S * 1.6);
      ctx.stroke();
    }
  } else if (clsKey === 'arcanist') {
    // Floating rune circle
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, S * 0.8, 0, Math.PI * 2); ctx.fill();
    // Orbiting particles
    for (let i = 0; i < 3; i++) {
      const a = time * 2 + (i / 3) * Math.PI * 2;
      const ox = x + Math.cos(a) * S * 1.4;
      const oy = y + Math.sin(a) * S * 1.4;
      ctx.fillStyle = '#ff88cc';
      ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    // Rune ring
    ctx.strokeStyle = `rgba(255,100,180,${0.2 + 0.1 * Math.sin(time * 4)})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, S * 1.3, time, time + Math.PI * 1.5); ctx.stroke();
  } else if (clsKey === 'necromancer') {
    // Skull shape
    ctx.fillStyle = '#44aa44';
    ctx.beginPath(); ctx.arc(x, y - S * 0.1, S * 0.9, 0, Math.PI * 2); ctx.fill();
    // Jaw
    ctx.beginPath(); ctx.arc(x, y + S * 0.3, S * 0.6, 0, Math.PI); ctx.fill();
    // Eye sockets (dark)
    ctx.fillStyle = '#114411';
    ctx.beginPath(); ctx.arc(x - S * 0.3, y - S * 0.15, S * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + S * 0.3, y - S * 0.15, S * 0.22, 0, Math.PI * 2); ctx.fill();
    // Glowing eyes
    ctx.fillStyle = '#44ff44';
    ctx.beginPath(); ctx.arc(x - S * 0.3, y - S * 0.15, S * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + S * 0.3, y - S * 0.15, S * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (clsKey === 'chronomancer') {
    // Clock face
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, S, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffdd66'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, S * 0.9, 0, Math.PI * 2); ctx.stroke();
    // Clock hands (rotating)
    ctx.strokeStyle = '#ffffaa'; ctx.lineWidth = 1.5;
    const h1 = time * 0.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(h1) * S * 0.5, y + Math.sin(h1) * S * 0.5); ctx.stroke();
    ctx.lineWidth = 1;
    const h2 = time * 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(h2) * S * 0.7, y + Math.sin(h2) * S * 0.7); ctx.stroke();
  } else if (clsKey === 'knight') {
    // Shield shape
    ctx.fillStyle = '#99aabb';
    ctx.beginPath();
    ctx.moveTo(x, y - S * 1.1);
    ctx.lineTo(x + S * 0.9, y - S * 0.3);
    ctx.lineTo(x + S * 0.7, y + S * 0.8);
    ctx.lineTo(x, y + S * 1.1);
    ctx.lineTo(x - S * 0.7, y + S * 0.8);
    ctx.lineTo(x - S * 0.9, y - S * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ccddee'; ctx.lineWidth = 1.5; ctx.stroke();
    // Cross emblem
    ctx.fillStyle = '#ddeeff';
    ctx.fillRect(x - 1.5, y - S * 0.5, 3, S);
    ctx.fillRect(x - S * 0.35, y - 1.5, S * 0.7, 3);
  } else if (clsKey === 'berserker') {
    // Jagged angry circle
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i % 2 === 0 ? S * 1.2 : S * 0.8;
      i === 0 ? ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
              : ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    // Angry eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x - S * 0.4, y - S * 0.15, S * 0.3, S * 0.15);
    ctx.fillRect(x + S * 0.1, y - S * 0.15, S * 0.3, S * 0.15);
  } else if (clsKey === 'paladin') {
    // Halo + circle
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, S, 0, Math.PI * 2); ctx.fill();
    // Halo
    ctx.strokeStyle = `rgba(255,255,180,${0.4 + 0.2 * Math.sin(time * 3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - S * 1.0, S * 0.8, S * 0.25, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Cross
    ctx.strokeStyle = '#ffffcc'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y - S * 0.5); ctx.lineTo(x, y + S * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - S * 0.35, y - S * 0.1); ctx.lineTo(x + S * 0.35, y - S * 0.1); ctx.stroke();
  } else if (clsKey === 'ranger') {
    // Hooded triangle
    ctx.fillStyle = '#668833';
    ctx.beginPath();
    ctx.moveTo(x, y - S * 1.2);
    ctx.lineTo(x + S * 0.9, y + S * 0.8);
    ctx.lineTo(x - S * 0.9, y + S * 0.8);
    ctx.closePath(); ctx.fill();
    // Face
    ctx.fillStyle = '#88cc44';
    ctx.beginPath(); ctx.arc(x, y + S * 0.1, S * 0.5, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#ccff88';
    ctx.beginPath(); ctx.arc(x - S * 0.15, y, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + S * 0.15, y, 1.5, 0, Math.PI * 2); ctx.fill();
  } else if (clsKey === 'druid') {
    // Leaf/organic shape
    ctx.fillStyle = '#44aa33';
    ctx.beginPath();
    ctx.moveTo(x, y - S * 1.2);
    ctx.quadraticCurveTo(x + S * 1.2, y - S * 0.3, x + S * 0.3, y + S * 1.0);
    ctx.quadraticCurveTo(x, y + S * 0.6, x - S * 0.3, y + S * 1.0);
    ctx.quadraticCurveTo(x - S * 1.2, y - S * 0.3, x, y - S * 1.2);
    ctx.closePath(); ctx.fill();
    // Leaf vein
    ctx.strokeStyle = '#66cc55'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - S * 0.8); ctx.lineTo(x, y + S * 0.6); ctx.stroke();
  } else if (clsKey === 'warlock') {
    // Dark robed figure
    ctx.fillStyle = '#4a1166';
    ctx.beginPath();
    ctx.moveTo(x, y - S * 1.3);
    ctx.lineTo(x + S * 0.7, y - S * 0.2);
    ctx.lineTo(x + S * 0.9, y + S * 1.0);
    ctx.lineTo(x - S * 0.9, y + S * 1.0);
    ctx.lineTo(x - S * 0.7, y - S * 0.2);
    ctx.closePath(); ctx.fill();
    // Glowing eyes
    ctx.fillStyle = '#aa44ff';
    ctx.beginPath(); ctx.arc(x - S * 0.2, y - S * 0.3, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + S * 0.2, y - S * 0.3, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (clsKey === 'monk') {
    // Balanced yin-yang circle
    ctx.fillStyle = '#eedd88';
    ctx.beginPath(); ctx.arc(x, y, S, 0, Math.PI * 2); ctx.fill();
    // Yin-yang symbol
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x, y, S * 0.6, -Math.PI / 2, Math.PI / 2); ctx.fill();
    ctx.fillStyle = '#332200';
    ctx.beginPath(); ctx.arc(x, y, S * 0.6, Math.PI / 2, -Math.PI / 2); ctx.fill();
    ctx.fillStyle = '#332200';
    ctx.beginPath(); ctx.arc(x, y - S * 0.3, S * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x, y + S * 0.3, S * 0.15, 0, Math.PI * 2); ctx.fill();
  } else if (clsKey === 'engineer') {
    // Goggled figure with gear
    ctx.fillStyle = '#dd8833';
    ctx.beginPath(); ctx.arc(x, y, S, 0, Math.PI * 2); ctx.fill();
    // Goggles
    ctx.strokeStyle = '#aa6622'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x - S * 0.3, y - S * 0.1, S * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + S * 0.3, y - S * 0.1, S * 0.3, 0, Math.PI * 2); ctx.stroke();
    // Lens glint
    ctx.fillStyle = '#44ccff';
    ctx.beginPath(); ctx.arc(x - S * 0.3, y - S * 0.1, S * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + S * 0.3, y - S * 0.1, S * 0.15, 0, Math.PI * 2); ctx.fill();
    // Gear on top (rotating)
    ctx.strokeStyle = '#cc7722'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = time * 1.5 + (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * S * 0.7, y - S * 0.7 + Math.sin(a) * S * 0.3);
      ctx.lineTo(x + Math.cos(a) * S * 1.0, y - S * 0.7 + Math.sin(a) * S * 0.5);
      ctx.stroke();
    }
  } else {
    // Default fallback
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, S, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawWizard(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const p of state.players) {
    if (!p.alive) continue;
    if (p.iframes > 0 && Math.sin(state.time * 25) > 0) continue;

    const cls = p.cls;

    // Aura glow
    const ag = ctx.createRadialGradient(p.x, p.y, WIZARD_SIZE * 0.5, p.x, p.y, WIZARD_SIZE * 2.5);
    ag.addColorStop(0, cls.glow + '22');
    ag.addColorStop(1, 'transparent');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(p.x, p.y, WIZARD_SIZE * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Class-specific body
    drawClassBody(ctx, p.x, p.y, p.angle, p.clsKey, cls.color, cls.glow, state.time);

    // Weapon / aim indicator
    const sx = p.x + Math.cos(p.angle) * WIZARD_SIZE * 1.8;
    const sy = p.y + Math.sin(p.angle) * WIZARD_SIZE * 1.8;
    ctx.strokeStyle = cls.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.angle) * WIZARD_SIZE * 0.5, p.y + Math.sin(p.angle) * WIZARD_SIZE * 0.5);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    // Tip glow
    const tg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
    tg.addColorStop(0, cls.color);
    tg.addColorStop(1, 'transparent');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Slow indicator
    if (p.slowTimer > 0) {
      ctx.strokeStyle = 'rgba(80,180,255,.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, WIZARD_SIZE + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Ult ready glow
    if (p.ultCharge >= 100) {
      ctx.strokeStyle = `rgba(255,200,60,${0.3 + 0.2 * Math.sin(state.time * 4)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, WIZARD_SIZE + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Health bar
    const bw = WIZARD_SIZE * 2.5;
    const bh = 3;
    const bx = p.x - bw / 2;
    const by = p.y + WIZARD_SIZE + 8;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    const hr = p.hp / p.maxHp;
    ctx.fillStyle = hr > 0.5 ? '#33cc55' : hr > 0.25 ? '#ccaa33' : '#cc3333';
    ctx.fillRect(bx, by, bw * hr, bh);

    // Mana bar
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.fillRect(bx - 1, by + bh + 1, bw + 2, 2);
    ctx.fillStyle = 'rgba(60,120,255,.6)';
    ctx.fillRect(bx, by + bh + 2, bw * (p.mana / p.maxMana), 1);

    // Ult charge bar
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.fillRect(bx - 1, by + bh + 4, bw + 2, 2);
    ctx.fillStyle = p.ultCharge >= 100 ? 'rgba(255,200,60,.8)' : 'rgba(255,200,60,.3)';
    ctx.fillRect(bx, by + bh + 5, bw * Math.min(1, p.ultCharge / 100), 1);

    // Player label + class name
    ctx.fillStyle = p.idx === 0 ? 'rgba(100,180,255,.5)' : 'rgba(255,140,100,.5)';
    ctx.font = '9px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(`P${p.idx + 1} ${cls.name}`, p.x, p.y - WIZARD_SIZE - 7);
  }
}

// ═══════════════════════════════════
//       DRAW ENEMIES
// ═══════════════════════════════════

// ── Draw a Heimer-style turret ──
function drawTurret(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number, isMega: boolean): void {
  const s = size;
  const barrelAngle = time * 2; // rotating barrel

  // Base platform (hexagonal)
  ctx.fillStyle = isMega ? '#cc8822' : '#996622';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const px = x + Math.cos(a) * s * 0.9;
    const py = y + Math.sin(a) * s * 0.9;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Base outline
  ctx.strokeStyle = isMega ? '#ffaa33' : '#bb8833';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center dome
  const domeG = ctx.createRadialGradient(x, y - s * 0.1, s * 0.1, x, y, s * 0.5);
  domeG.addColorStop(0, isMega ? '#ffcc44' : '#ddaa33');
  domeG.addColorStop(1, isMega ? '#aa6611' : '#775511');
  ctx.fillStyle = domeG;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Three barrels (rotating)
  for (let i = 0; i < 3; i++) {
    const a = barrelAngle + (i / 3) * Math.PI * 2;
    const bx = x + Math.cos(a) * s * 0.3;
    const by = y + Math.sin(a) * s * 0.3;
    const ex = x + Math.cos(a) * s * (isMega ? 1.4 : 1.1);
    const ey = y + Math.sin(a) * s * (isMega ? 1.4 : 1.1);

    // Barrel body
    ctx.strokeStyle = isMega ? '#ffbb44' : '#cc9933';
    ctx.lineWidth = isMega ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Barrel tip glow
    const tipG = ctx.createRadialGradient(ex, ey, 0, ex, ey, 4);
    tipG.addColorStop(0, isMega ? '#ffdd66' : '#ffaa33');
    tipG.addColorStop(1, 'transparent');
    ctx.fillStyle = tipG;
    ctx.beginPath();
    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center eye/lens
  ctx.fillStyle = isMega ? '#ff6622' : '#ffcc44';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Pulsing ring (active indicator)
  const pulse = 0.3 + 0.2 * Math.sin(time * 5);
  ctx.strokeStyle = `rgba(255,170,50,${pulse})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, s * 1.1, 0, Math.PI * 2);
  ctx.stroke();
}

// ── Draw a wolf summon ──
function drawWolf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, target: { x: number; y: number } | null, time: number): void {
  const angle = target ? Math.atan2(target.y - y, target.x - x) : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Body (elongated)
  ctx.fillStyle = '#66aa55';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.2, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#77bb66';
  ctx.beginPath();
  ctx.arc(size * 0.8, 0, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#55aa44';
  ctx.beginPath();
  ctx.moveTo(size * 0.9, -size * 0.4);
  ctx.lineTo(size * 1.3, -size * 0.7);
  ctx.lineTo(size * 1.1, -size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.9, size * 0.4);
  ctx.lineTo(size * 1.3, size * 0.7);
  ctx.lineTo(size * 1.1, size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ccff88';
  ctx.beginPath();
  ctx.arc(size * 1.0, -size * 0.15, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 1.0, size * 0.15, 2, 0, Math.PI * 2);
  ctx.fill();

  // Tail (wagging)
  const wag = Math.sin(time * 8) * 0.3;
  ctx.strokeStyle = '#66aa55';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-size * 0.9, 0);
  ctx.quadraticCurveTo(-size * 1.3, Math.sin(wag) * size * 0.6, -size * 1.5, Math.sin(wag) * size * 0.4);
  ctx.stroke();

  ctx.restore();
}

// ── Draw an imp summon ──
function drawImp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number): void {
  // Wings (flapping)
  const flap = Math.sin(time * 10) * 0.3;
  ctx.fillStyle = 'rgba(100,30,120,.4)';
  ctx.beginPath();
  ctx.ellipse(x - size * 0.6, y - size * 0.2, size * 0.7, size * 0.4, -0.3 + flap, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.6, y - size * 0.2, size * 0.7, size * 0.4, 0.3 - flap, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#8833aa';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.strokeStyle = '#aa44cc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.5);
  ctx.lineTo(x - size * 0.5, y - size * 1.0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.5);
  ctx.lineTo(x + size * 0.5, y - size * 1.0);
  ctx.stroke();

  // Eyes (glowing)
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(x - size * 0.2, y - size * 0.1, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.2, y - size * 0.1, 2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnemies(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    const et = ENEMIES[e.type];
    if (e.iframes > 0 && Math.sin(state.time * 30) > 0) continue;

    // ── Friendly summons: custom rendering ──
    if (e._friendly) {
      const isMegaTurret = e.hp >= 20;
      const isWolf = e.type === '_wolf';
      const isImp = e.type === '_imp';

      if (isWolf) {
        // Find nearest enemy for wolf facing
        let nearest = null;
        let nd = Infinity;
        for (const e2 of state.enemies) {
          if (!e2.alive || e2._friendly) continue;
          const d = Math.sqrt((e2.x - e.x) ** 2 + (e2.y - e.y) ** 2);
          if (d < nd) { nd = d; nearest = e2; }
        }
        drawWolf(ctx, e.x, e.y, et.size, nearest, state.time);
      } else if (isImp) {
        drawImp(ctx, e.x, e.y, et.size, state.time);
      } else {
        // Turret (default ally for engineer / necro skeletons)
        drawTurret(ctx, e.x, e.y, et.size, state.time, isMegaTurret);
      }

      // Lifespan bar
      if (e._lifespan > 0) {
        const bw = et.size * 2;
        const by = e.y + et.size + 4;
        ctx.fillStyle = 'rgba(0,0,0,.4)';
        ctx.fillRect(e.x - bw / 2 - 1, by - 1, bw + 2, 3);
        ctx.fillStyle = 'rgba(80,200,100,.5)';
        ctx.fillRect(e.x - bw / 2, by, bw * Math.min(1, e._lifespan / 15), 2);
      }

      // HP bar for summons
      if (e.hp < e.maxHp) {
        const bw = et.size * 2;
        const by = e.y - et.size - 6;
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(e.x - bw / 2 - 1, by - 1, bw + 2, 3);
        ctx.fillStyle = '#44cc66';
        ctx.fillRect(e.x - bw / 2, by, bw * (e.hp / e.maxHp), 2);
      }
      continue;
    }

    // ── Regular enemies ──

    // Boss aura
    if (et.boss) {
      const bg2 = ctx.createRadialGradient(e.x, e.y, et.size * 0.5, e.x, e.y, et.size * 2);
      bg2.addColorStop(0, 'rgba(200,80,40,.08)');
      bg2.addColorStop(1, 'transparent');
      ctx.fillStyle = bg2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, et.size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = et.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, et.size, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(e.x, e.y, et.size, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    const target = state.players[e.target];
    const ea = target ? Math.atan2(target.y - e.y, target.x - e.x) : 0;
    const eyeD = et.size * 0.3;
    ctx.fillStyle = 'rgba(255,50,30,.8)';
    ctx.beginPath();
    ctx.arc(e.x + Math.cos(ea - 0.3) * eyeD, e.y + Math.sin(ea - 0.3) * eyeD, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e.x + Math.cos(ea + 0.3) * eyeD, e.y + Math.sin(ea + 0.3) * eyeD, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Health bar (only when damaged)
    if (e.hp < e.maxHp) {
      const bw = et.size * 2;
      const bh = 2;
      const bx = e.x - bw / 2;
      const by = e.y - et.size - 4;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = '#cc3333';
      ctx.fillRect(bx, by, bw * (e.hp / e.maxHp), bh);
    }

    // Slow indicator
    if (e.slowTimer > 0) {
      ctx.strokeStyle = 'rgba(80,200,255,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, et.size + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ═══════════════════════════════════
//       DRAW SPELLS / PROJECTILES
// ═══════════════════════════════════

export function drawSpells(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const s of state.spells) {
    const r = s.radius;
    const a = Math.atan2(s.vy, s.vx);
    const t = state.time;

    if (s.explode && s.color.includes('ff66')) {
      // ── FIREBALL: teardrop flame shape ──
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(a);
      // Outer flame
      const fGrad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.8);
      fGrad.addColorStop(0, '#ffcc33');
      fGrad.addColorStop(0.4, '#ff6600');
      fGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.moveTo(r * 1.3, 0);
      ctx.quadraticCurveTo(r * 0.3, -r * 1.0, -r * 1.5, 0);
      ctx.quadraticCurveTo(r * 0.3, r * 1.0, r * 1.3, 0);
      ctx.fill();
      // Hot core
      ctx.fillStyle = '#ffffaa';
      ctx.beginPath();
      ctx.arc(r * 0.2, 0, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (s.slow > 0) {
      // ── ICE SHARD: crystalline angular shape ──
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(a);
      // Crystal body
      ctx.fillStyle = '#aaeeff';
      ctx.beginPath();
      ctx.moveTo(r * 1.5, 0);
      ctx.lineTo(r * 0.2, -r * 0.6);
      ctx.lineTo(-r * 1.0, -r * 0.3);
      ctx.lineTo(-r * 1.0, r * 0.3);
      ctx.lineTo(r * 0.2, r * 0.6);
      ctx.closePath();
      ctx.fill();
      // Shine
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath();
      ctx.moveTo(r * 1.2, 0);
      ctx.lineTo(r * 0.3, -r * 0.3);
      ctx.lineTo(-r * 0.3, 0);
      ctx.closePath();
      ctx.fill();
      // Frost particles
      ctx.fillStyle = 'rgba(180,230,255,.4)';
      for (let i = 0; i < 3; i++) {
        const px = Math.sin(t * 8 + i * 2) * r * 0.5;
        const py = Math.cos(t * 8 + i * 2) * r * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    } else if (s.homing > 0) {
      // ── HOMING (arcane bolt): spinning star with trail ──
      ctx.save();
      ctx.translate(s.x, s.y);
      const spinAngle = t * 10;
      // Outer glow
      const hGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.8);
      hGrad.addColorStop(0, s.color);
      hGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Star shape (4 points, spinning)
      ctx.fillStyle = '#ffaacc';
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const sa = spinAngle + (i / 4) * Math.PI * 2;
        const outerR = i % 2 === 0 ? r * 1.2 : r * 0.5;
        i === 0 ? ctx.moveTo(Math.cos(sa) * outerR, Math.sin(sa) * outerR)
                : ctx.lineTo(Math.cos(sa) * outerR, Math.sin(sa) * outerR);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else if (s.zap > 0) {
      // ── BALL LIGHTNING: crackling electric orb ──
      // Outer electric field
      ctx.strokeStyle = `rgba(180,120,255,${0.2 + 0.15 * Math.sin(t * 6)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      // Core
      const bGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
      bGrad.addColorStop(0, '#eeccff');
      bGrad.addColorStop(1, '#7744bb');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
      // Random lightning arcs
      ctx.strokeStyle = '#cc99ff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const la = Math.sin(t * 12 + i * 3) * Math.PI * 2;
        const lx = s.x + Math.cos(la) * r;
        const ly = s.y + Math.sin(la) * r;
        const ex = s.x + Math.cos(la + 0.2) * r * 1.8;
        const ey = s.y + Math.sin(la + 0.2) * r * 1.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo((lx + ex) / 2 + Math.sin(t * 20 + i) * 3, (ly + ey) / 2);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

    } else if (s.drain > 0) {
      // ── SOUL BOLT: ghostly wisp with trailing souls ──
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(a);
      // Ghost body
      const sGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
      sGrad.addColorStop(0, '#88ff88');
      sGrad.addColorStop(0.5, '#44aa44');
      sGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      // Wispy tail
      ctx.strokeStyle = 'rgba(80,200,80,.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, 0);
      ctx.quadraticCurveTo(-r * 1.5, Math.sin(t * 8) * r, -r * 2.0, Math.sin(t * 6) * r * 0.5);
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.2, -r * 0.2, 2, 0, Math.PI * 2);
      ctx.arc(r * 0.2, r * 0.2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else if (s.color.includes('cc44') || s.color.includes('dd88')) {
      // ── ARROW / WRENCH: elongated bolt ──
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(a);
      // Shaft
      ctx.fillStyle = s.color;
      ctx.fillRect(-r * 1.2, -r * 0.25, r * 2.4, r * 0.5);
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(r * 1.8, 0);
      ctx.lineTo(r * 1.0, -r * 0.5);
      ctx.lineTo(r * 1.0, r * 0.5);
      ctx.closePath();
      ctx.fill();
      // Fletching
      ctx.fillStyle = s.trail || s.color;
      ctx.beginPath();
      ctx.moveTo(-r * 1.0, -r * 0.4);
      ctx.lineTo(-r * 1.5, -r * 0.6);
      ctx.lineTo(-r * 1.0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-r * 1.0, r * 0.4);
      ctx.lineTo(-r * 1.5, r * 0.6);
      ctx.lineTo(-r * 1.0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

    } else if (s.color.includes('4444') || s.color.includes('6644')) {
      // ── THROWING AXE / SHADOW BOLT: spinning weapon ──
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(t * 12); // spinning
      ctx.fillStyle = s.color;
      // Axe blade
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.3);
      ctx.quadraticCurveTo(r * 1.0, -r * 0.5, r * 0.8, r * 0.3);
      ctx.lineTo(0, 0);
      ctx.lineTo(-r * 0.8, r * 0.3);
      ctx.quadraticCurveTo(-r * 1.0, -r * 0.5, 0, -r * 1.3);
      ctx.fill();
      // Handle
      ctx.strokeStyle = s.trail || '#888';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 1.0);
      ctx.stroke();
      ctx.restore();

    } else {
      // ── DEFAULT: glowing orb (for any unmatched spell) ──
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 1.5);
      g.addColorStop(0, s.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawEProj(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const p of state.eProj) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ═══════════════════════════════════
//       DRAW PICKUPS
// ═══════════════════════════════════

export function drawPickups(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const pk of state.pickups) {
    if (pk.collected) continue;
    const pulse = 0.5 + 0.5 * Math.sin(state.time * 3);

    if (pk.type === PickupType.Chest) {
      ctx.fillStyle = `rgba(200,170,50,${0.2 + pulse * 0.15})`;
      ctx.fillRect(pk.x - 12, pk.y - 10, 24, 20);
      ctx.strokeStyle = '#bbaa44';
      ctx.lineWidth = 1;
      ctx.strokeRect(pk.x - 12, pk.y - 10, 24, 20);
      ctx.fillStyle = '#ddcc55';
      ctx.font = 'bold 12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('?', pk.x, pk.y + 5);
    } else if (pk.type === PickupType.Health) {
      const g = ctx.createRadialGradient(pk.x, pk.y, 3, pk.x, pk.y, 12 + pulse * 4);
      g.addColorStop(0, 'rgba(50,255,120,.3)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, 12 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(50,255,120,.7)';
      ctx.font = 'bold 12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('+', pk.x, pk.y + 5);
    } else if (pk.type === PickupType.Trap) {
      ctx.strokeStyle = `rgba(170,220,85,${0.3 + pulse * 0.2})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, pk._radius || 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(170,220,85,.5)';
      ctx.font = '9px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('TRAP', pk.x, pk.y + 3);
    }
  }
}
