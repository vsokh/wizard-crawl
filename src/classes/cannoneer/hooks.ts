import { registerClassHooks } from '../hooks';
import { clamp, netSfx, rand, shake, spawnParticles, spawnShockwave, spawnText, toWorld } from '../../state';
import { SfxName } from '../../types';
import { ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

// Recoil Cannonball: backward push distance + iframe window (weaker than Ranger Roll).
const RECOIL_DIST = 90;
const RECOIL_TIME = 0.14;
const RECOIL_IFRAMES = 0.1;

// Heavy Shell (Q): one massive slow rocket that deletes a pack.
const HEAVY_TRAVEL = 0.65;
const HEAVY_RADIUS = 110;
const HEAVY_DMG = 10;

// Rocket Barrage (Space): many medium rockets over ~3s.
const BARRAGE_DURATION_MS = 3000;
const BARRAGE_INTERVAL_MS = 180;
const BARRAGE_ROCKET_DMG = 5;
const BARRAGE_RADIUS = 70;
const BARRAGE_TRAVEL = 0.38;
const BARRAGE_SCATTER = 36;

/**
 * Visualise a rocket arcing from (sx,sy) to (tx,ty) over `travel` seconds by
 * streaming dense particles along the arc, then impact at target.
 * `size` picks between "medium" (Space) and "heavy" (Q) visuals.
 */
function launchRocket(
  state: any,
  p: any,
  tx: number, ty: number,
  travel: number,
  dmg: number,
  radius: number,
  color: string,
  size: 'medium' | 'heavy',
) {
  const sx = p.x;
  const sy = p.y;
  const arcApex = size === 'heavy' ? 70 : 45;
  const steps = size === 'heavy' ? 16 : 10;
  const msPerStep = (travel * 1000) / steps;

  // Flight body: dense staggered particles along the arc
  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const t = i / steps;
      const bx = sx + (tx - sx) * t;
      const by = sy + (ty - sy) * t - Math.sin(t * Math.PI) * arcApex;
      // Bright core
      spawnParticles(state, bx, by, '#ffcc77', size === 'heavy' ? 5 : 3, size === 'heavy' ? 0.22 : 0.18);
      // Colored trail behind
      spawnParticles(state, bx, by, color, size === 'heavy' ? 4 : 2, size === 'heavy' ? 0.35 : 0.25);
      // Dark smoke
      if (i > 1) {
        const pt = (i - 1) / steps;
        const px = sx + (tx - sx) * pt;
        const py = sy + (ty - sy) * pt - Math.sin(pt * Math.PI) * arcApex;
        spawnParticles(state, px, py, '#553322', 1, 0.6);
      }
    }, i * msPerStep);
  }

  // Impact
  setTimeout(() => {
    const marker = state.aoeMarkers.acquire();
    if (marker) {
      marker.x = tx; marker.y = ty;
      marker.radius = radius;
      marker.delay = 0.001;
      marker.dmg = dmg; marker.owner = p.idx;
      marker.color = color; marker.age = 0; marker.stun = 0;
    }
    if (size === 'heavy') {
      // Triple-ring shockwave + fat particle burst
      spawnShockwave(state, tx, ty, radius * 1.05, 'rgba(255,200,120,.55)');
      spawnShockwave(state, tx, ty, radius * 0.7, 'rgba(255,140,60,.6)');
      spawnShockwave(state, tx, ty, radius * 0.35, 'rgba(255,255,200,.7)');
      spawnParticles(state, tx, ty, '#ffdd88', 30, 1.0);
      spawnParticles(state, tx, ty, color, 25, 0.8);
      spawnParticles(state, tx, ty, '#553322', 12, 1.2); // dark smoke
      shake(state, 10);
    } else {
      spawnShockwave(state, tx, ty, radius * 0.95, 'rgba(221,136,51,.5)');
      spawnShockwave(state, tx, ty, radius * 0.55, 'rgba(255,200,120,.55)');
      spawnParticles(state, tx, ty, '#ffcc77', 14, 0.5);
      spawnParticles(state, tx, ty, color, 12, 0.45);
      spawnParticles(state, tx, ty, '#553322', 5, 0.7);
      shake(state, 3);
    }
    netSfx(state, SfxName.Hit);
  }, travel * 1000);
}

registerClassHooks('cannoneer', {
  // Heavy Caliber: every 4th shot deals 2x damage.
  onDamageEnemy: (state, p, e, dmg) => {
    p._cannonShots = (p._cannonShots || 0) + 1;
    if (p._cannonShots % 4 === 0) {
      e.hp -= dmg;
      spawnText(state, e.x, e.y - 25, 'HEAVY!', '#aa7733');
    }
  },

  // RMB Recoil Cannonball: backward push + iframes; fall through to default
  // Projectile cast so the actual shell fires.
  castRMBAbility: (state, p, _def, angle) => {
    p._rollTimer = RECOIL_TIME;
    p._rollVx = -Math.cos(angle) * (RECOIL_DIST / RECOIL_TIME);
    p._rollVy = -Math.sin(angle) * (RECOIL_DIST / RECOIL_TIME);
    p.iframes = Math.max(p.iframes, RECOIL_TIME + RECOIL_IFRAMES);
    p._rollGhosts.length = 0;
    spawnParticles(state, p.x, p.y, '#dd7722', 10, 0.35);
    spawnShockwave(state, p.x, p.y, 28, 'rgba(220,130,50,.45)');
    shake(state, 2);
    netSfx(state, SfxName.Hit);
    return undefined;
  },

  // Q Heavy Shell: one massive slow rocket that arcs to cursor and deletes
  // a pack. Distinct from Space by scale and tempo — single overwhelming boom.
  castQAbility: (state, p, def) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const tx = clamp(wp.x, 40, ROOM_WIDTH - 40);
    const ty = clamp(wp.y, 40, ROOM_HEIGHT - 40);
    const pw = p.ultPower || 1;
    const dmg = Math.round(HEAVY_DMG * pw);
    launchRocket(state, p, tx, ty, HEAVY_TRAVEL, dmg, HEAVY_RADIUS, def.color, 'heavy');
    // Player-side cast feedback: muzzle flash + announce
    spawnParticles(state, p.x, p.y, '#ffcc77', 10, 0.4);
    spawnShockwave(state, p.x, p.y, 22, 'rgba(255,180,80,.4)');
    shake(state, 4);
    netSfx(state, SfxName.Hit);
    return true;
  },

  // Space Rocket Barrage: rain medium rockets on the cursor for 3s. The cursor
  // is re-read every volley, so sweep the mouse to steer the barrage.
  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    const dmg = Math.round(BARRAGE_ROCKET_DMG * pw);
    const volleys = Math.floor(BARRAGE_DURATION_MS / BARRAGE_INTERVAL_MS);
    for (let i = 0; i < volleys; i++) {
      setTimeout(() => {
        if (!p.alive) return;
        const wp = toWorld(state, state.mouseX, state.mouseY);
        const tx = clamp(wp.x + rand(-BARRAGE_SCATTER, BARRAGE_SCATTER), 40, ROOM_WIDTH - 40);
        const ty = clamp(wp.y + rand(-BARRAGE_SCATTER, BARRAGE_SCATTER), 40, ROOM_HEIGHT - 40);
        launchRocket(state, p, tx, ty, BARRAGE_TRAVEL, dmg, BARRAGE_RADIUS, '#dd8833', 'medium');
      }, i * BARRAGE_INTERVAL_MS);
    }
    spawnShockwave(state, p.x, p.y, 90, 'rgba(180,110,50,.5)');
    spawnParticles(state, p.x, p.y, '#dd8833', 18, 0.6);
    spawnText(state, p.x, p.y - 40, 'ROCKET BARRAGE', '#ffbb66');
    netSfx(state, SfxName.Hit);
    shake(state, 5);
    return true;
  },
});
