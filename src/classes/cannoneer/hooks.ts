import { registerClassHooks } from '../hooks';
import { clamp, dist, netSfx, shake, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { SfxName, SpellType } from '../../types';
import { ROOM_WIDTH, ROOM_HEIGHT, WIZARD_SIZE } from '../../constants';

// Recoil Cannonball: backward push distance + iframe window (weaker than Ranger Roll).
const RECOIL_DIST = 90;
const RECOIL_TIME = 0.14;
const RECOIL_IFRAMES = 0.1;

// Shrapnel Burst: forward-arcing shell that detonates mid-flight into a ring.
const SHRAPNEL_RANGE = 240;
const SHRAPNEL_DELAY = 0.4;
const SHRAPNEL_COUNT = 10;
const SHRAPNEL_SPEED = 420;
const SHRAPNEL_DMG = 3;
const SHRAPNEL_LIFE = 0.45;

// Siege Mode: root + auto-fire.
const SIEGE_DURATION = 4.0;
const SIEGE_FIRE_RATE = 0.32;     // seconds between auto-shells
const SIEGE_SHELL_DMG = 6;
const SIEGE_SHELL_RADIUS = 55;
const SIEGE_DELAY = 0.35;         // marker telegraph
const SIEGE_RANGE = 460;          // target search range
const SIEGE_DR = 0.3;             // 30% damage reduction while sieged

registerClassHooks('cannoneer', {
  // Heavy Caliber: every 4th shot deals 2x damage.
  onDamageEnemy: (state, p, e, dmg) => {
    p._cannonShots = (p._cannonShots || 0) + 1;
    if (p._cannonShots % 4 === 0) {
      e.hp -= dmg;
      spawnText(state, e.x, e.y - 25, 'HEAVY!', '#aa7733');
    }
  },

  // RMB Recoil Cannonball: apply backward push + iframes, then let the
  // normal Projectile cast path fire the shell. (Returning undefined keeps
  // the default handler running.)
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
    return undefined; // fall through to normal Projectile spawn
  },

  // Q Shrapnel Burst: predict detonation point, arc a shell with trail
  // particles over the delay, then spawn a ring of shrapnel at the point.
  castQAbility: (state, p, def, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tx = clamp(p.x + cos * SHRAPNEL_RANGE, 40, ROOM_WIDTH - 40);
    const ty = clamp(p.y + sin * SHRAPNEL_RANGE, 40, ROOM_HEIGHT - 40);

    // Flying-shell visual: staggered trail particles along the arc.
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      setTimeout(() => {
        const t = i / steps;
        const sx = p.x + (tx - p.x) * t;
        const sy = p.y + (ty - p.y) * t - Math.sin(t * Math.PI) * 40; // slight arc
        spawnParticles(state, sx, sy, def.color, 3, 0.28);
      }, i * (SHRAPNEL_DELAY * 1000 / steps));
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
    }, SHRAPNEL_DELAY * 1000);

    return true; // override default
  },

  // Space Siege Mode: root the player; auto-fire is handled in onTick.
  castUltimate: (state, p) => {
    p._siegeTimer = SIEGE_DURATION;
    p._siegeFireTimer = 0;
    p._rollTimer = 0; // cancel any active roll
    spawnShockwave(state, p.x, p.y, 90, 'rgba(180,110,50,.5)');
    spawnParticles(state, p.x, p.y, '#dd8833', 18, 0.6);
    spawnText(state, p.x, p.y - 40, 'SIEGE MODE', '#ffbb66');
    netSfx(state, SfxName.Hit);
    shake(state, 5);
    return true;
  },

  // Per-frame: during Siege, lock movement (done in physics.ts) and fire
  // auto-aimed shells at nearest enemies.
  onTick: (state, p, dt) => {
    if (p._siegeTimer <= 0) return;
    p._siegeTimer -= dt;
    p._siegeFireTimer -= dt;

    // Damage reduction flag — reuse wardenDR as a temporary DR channel.
    p._wardenDR = Math.max(p._wardenDR || 0, SIEGE_DR);

    if (p._siegeFireTimer <= 0) {
      p._siegeFireTimer = SIEGE_FIRE_RATE;

      // Find nearest enemy in range
      let best: any = null;
      let bestD = Infinity;
      for (const e of state.enemies) {
        if (!e.alive || e._friendly) continue;
        const d = dist(p.x, p.y, e.x, e.y);
        if (d < SIEGE_RANGE && d < bestD) { bestD = d; best = e; }
      }

      if (best) {
        const pw = p.ultPower || 1;
        const dmg = Math.round(SIEGE_SHELL_DMG * pw);
        // Lead the target slightly using its velocity (matches player lock-on feel).
        const tx = clamp(best.x + (best.vx || 0) * SIEGE_DELAY, 40, ROOM_WIDTH - 40);
        const ty = clamp(best.y + (best.vy || 0) * SIEGE_DELAY, 40, ROOM_HEIGHT - 40);
        const marker = state.aoeMarkers.acquire();
        if (marker) {
          marker.x = tx; marker.y = ty;
          marker.radius = SIEGE_SHELL_RADIUS;
          marker.delay = SIEGE_DELAY;
          marker.dmg = dmg; marker.owner = p.idx;
          marker.color = '#dd8833'; marker.age = 0; marker.stun = 0;
        }
        // Muzzle flash at player
        const a = Math.atan2(ty - p.y, tx - p.x);
        spawnParticles(state, p.x + Math.cos(a) * WIZARD_SIZE, p.y + Math.sin(a) * WIZARD_SIZE, '#ffcc77', 5, 0.3);
        shake(state, 2);
        netSfx(state, SfxName.Hit);
      }
    }

    if (p._siegeTimer <= 0) {
      spawnParticles(state, p.x, p.y, '#dd8833', 12, 0.4);
      spawnText(state, p.x, p.y - 30, 'RELEASED', '#ffbb66');
    }
  },

});
