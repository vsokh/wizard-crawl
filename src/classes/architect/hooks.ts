import { registerClassHooks } from '../hooks';
import { clamp, spawnParticles, spawnShockwave } from '../../state';
import { ULTIMATE, ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

import { dist } from '../../state';

registerClassHooks('architect', {
  // Fortification: near own zones gain DR flag + bonus mana regen.
  onTick: (state, p, dt) => {
    p._fortified = false;
    for (const z of state.zones) {
      if (!z || z.duration <= 0 || z.owner !== p.idx) continue;
      if (dist(p.x, p.y, z.x, z.y) < z.radius) {
        p._fortified = true;
        p.mana = Math.min(p.maxMana, p.mana + dt);
        break;
      }
    }
  },

  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Mega Construct: massive zone at cursor.
    const tx = clamp(p.x + Math.cos(angle) * 100, 60, ROOM_WIDTH - 60);
    const ty = clamp(p.y + Math.sin(angle) * 100, 60, ROOM_HEIGHT - 60);
    const z = state.zones.acquire();
    if (z) {
      z.x = tx; z.y = ty; z.radius = ULTIMATE.MEGA_CONSTRUCT_RADIUS;
      z.duration = ULTIMATE.MEGA_CONSTRUCT_DURATION; z.dmg = Math.round(ULTIMATE.MEGA_CONSTRUCT_DMG * pw);
      z.color = '#228899'; z.owner = p.idx;
      z.slow = 0.5; z.stun = 0; z.tickRate = 0.5; z.tickTimer = 0; z.age = 0;
      z.drain = 0; z.heal = 0; z.pull = 0; z.freezeAfter = 0;
    }
    spawnShockwave(state, tx, ty, ULTIMATE.MEGA_CONSTRUCT_RADIUS, 'rgba(50,150,180,.3)');
    spawnParticles(state, tx, ty, '#44aacc', 20, 1.2);
    return true;
  },
});
