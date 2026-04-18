import { registerClassHooks } from '../hooks';
import { clamp, dist, spawnParticles, spawnShockwave } from '../../state';
import { ULTIMATE, ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

import { damageEnemy } from '../../systems/combat';

registerClassHooks('graviturge', {
  // Gravity Well aura: enemies within 80u take 0.5 dps; each nearby enemy grants +1 mana/s.
  onTick: (state, p, dt) => {
    let nearbyCount = 0;
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      if (dist(p.x, p.y, e.x, e.y) < 80) {
        nearbyCount++;
        e.hp -= 0.5 * dt;
        if (e.hp <= 0 && e._deathTimer < 0) damageEnemy(state, e, 1, p.idx);
      }
    }
    if (nearbyCount > 0) p.mana = Math.min(p.maxMana, p.mana + nearbyCount * dt);
  },

  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Gravitational Ruin: gravity vortex at cursor.
    const tx = clamp(p.x + Math.cos(angle) * 120, 60, ROOM_WIDTH - 60);
    const ty = clamp(p.y + Math.sin(angle) * 120, 60, ROOM_HEIGHT - 60);
    const gz = state.zones.acquire();
    if (gz) {
      gz.x = tx; gz.y = ty; gz.radius = ULTIMATE.GRAVITY_PULL_RANGE;
      gz.duration = ULTIMATE.GRAVITY_SLOW_DURATION; gz.dmg = Math.round(ULTIMATE.GRAVITY_PULL_DMG * pw);
      gz.color = '#4422aa'; gz.owner = p.idx;
      gz.slow = 0.8; gz.stun = 0; gz.tickRate = 0.5; gz.tickTimer = 0; gz.age = 0;
      gz.drain = 0; gz.heal = 0; gz.pull = 1; gz.freezeAfter = 0;
    }
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      const d = dist(tx, ty, e.x, e.y);
      if (d < ULTIMATE.GRAVITY_PULL_RANGE && d > 1) {
        const nx = (tx - e.x) / d;
        const ny = (ty - e.y) / d;
        e.vx = nx * 80;
        e.vy = ny * 80;
        e.slowTimer = Math.max(e.slowTimer || 0, ULTIMATE.GRAVITY_SLOW_DURATION);
      }
    }
    spawnShockwave(state, tx, ty, ULTIMATE.GRAVITY_PULL_RANGE, 'rgba(100,50,180,.3)');
    spawnParticles(state, tx, ty, '#6644aa', 20, 1.0);
    return true;
  },
});
