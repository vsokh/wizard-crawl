import { registerClassHooks } from '../hooks';
import { clamp, netSfx, rand, shake, spawnParticles, spawnShockwave, spawnText, toWorld } from '../../state';
import { SfxName, SpellType } from '../../types';
import { ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

// Recoil Cannonball: backward push distance + iframe window (weaker than Ranger Roll).
const RECOIL_DIST = 90;
const RECOIL_TIME = 0.14;
const RECOIL_IFRAMES = 0.1;

// Shrapnel Burst: rocket flies to cursor and detonates into a ring of shrapnel.
const SHRAPNEL_TRAVEL = 0.45;      // seconds to reach cursor
const SHRAPNEL_COUNT = 10;
const SHRAPNEL_SPEED = 420;
const SHRAPNEL_DMG = 3;
const SHRAPNEL_LIFE = 0.45;

// Rocket Barrage ultimate: rain rockets on the cursor over a few seconds.
const BARRAGE_DURATION_MS = 3000;
const BARRAGE_INTERVAL_MS = 180;   // ~17 rockets over 3s
const BARRAGE_ROCKET_DMG = 5;
const BARRAGE_RADIUS = 58;
const BARRAGE_DELAY = 0.35;        // marker telegraph
const BARRAGE_SCATTER = 36;        // random offset from cursor per rocket

function launchRocketTo(
  state: any,
  p: any,
  tx: number,
  ty: number,
  dmg: number,
  color: string,
  radius: number,
  delay: number,
) {
  // Flying-shell trail from player to target
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const t = i / steps;
      const sx = p.x + (tx - p.x) * t;
      const sy = p.y + (ty - p.y) * t - Math.sin(t * Math.PI) * 40; // arc apex
      spawnParticles(state, sx, sy, color, 3, 0.28);
    }, i * (delay * 1000 / steps));
  }
  // Impact marker
  setTimeout(() => {
    const marker = state.aoeMarkers.acquire();
    if (marker) {
      marker.x = tx; marker.y = ty;
      marker.radius = radius;
      marker.delay = 0.001;   // instant explosion at end of flight
      marker.dmg = dmg; marker.owner = p.idx;
      marker.color = color; marker.age = 0; marker.stun = 0;
    }
  }, delay * 1000);
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

  // RMB Recoil Cannonball: apply backward push + iframes, then fall through
  // to the default Projectile cast so the shell fires.
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

  // Q Shrapnel Burst: rocket flies to the cursor world-position and
  // detonates there into a radial shrapnel ring.
  castQAbility: (state, p, def) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const tx = clamp(wp.x, 40, ROOM_WIDTH - 40);
    const ty = clamp(wp.y, 40, ROOM_HEIGHT - 40);

    // Flying-shell visual along arc player → cursor
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const t = i / steps;
        const sx = p.x + (tx - p.x) * t;
        const sy = p.y + (ty - p.y) * t - Math.sin(t * Math.PI) * 40;
        spawnParticles(state, sx, sy, def.color, 3, 0.28);
      }, i * (SHRAPNEL_TRAVEL * 1000 / steps));
    }

    // Detonation: ring of shrapnel projectiles radiating outward.
    setTimeout(() => {
      const pw = p.ultPower || 1;
      const dmg = Math.round(SHRAPNEL_DMG * pw);
      spawnParticles(state, tx, ty, def.color, 18, 0.5);
      spawnShockwave(state, tx, ty, 45, 'rgba(221,136,51,.5)');
      shake(state, 3);
      netSfx(state, SfxName.Hit);
      for (let i = 0; i < SHRAPNEL_COUNT; i++) {
        const sa = (i / SHRAPNEL_COUNT) * Math.PI * 2;
        state.spells.push({
          type: SpellType.Projectile, dmg, speed: SHRAPNEL_SPEED, radius: 4, life: SHRAPNEL_LIFE,
          color: def.color, trail: '#aa5522',
          x: tx, y: ty,
          vx: Math.cos(sa) * SHRAPNEL_SPEED,
          vy: Math.sin(sa) * SHRAPNEL_SPEED,
          owner: p.idx, age: 0, zapTimer: 0, pierceLeft: 1,
          homing: 0, zap: 0, zapRate: 0, slow: 0, drain: 0, explode: 0, burn: 0,
          stun: 0, clsKey: p.clsKey, _reversed: false, _bounces: 0,
        });
      }
    }, SHRAPNEL_TRAVEL * 1000);

    return true;
  },

  // Space Rocket Barrage: rain rockets on the cursor for ~3s. The cursor is
  // re-read every volley so aiming around mid-barrage works.
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
        launchRocketTo(state, p, tx, ty, dmg, '#dd8833', BARRAGE_RADIUS, BARRAGE_DELAY);
        if (i % 3 === 0) {
          shake(state, 2);
          netSfx(state, SfxName.Hit);
        }
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
