import { registerClassHooks } from '../hooks';
import { dist, spawnParticles, spawnShockwave } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { ULTIMATE, ROOM_WIDTH } from '../../constants';

registerClassHooks('hexblade', {
  // Hex stacks: each hit adds a stack, 3+ stacks applies slow.
  onDamageEnemy: (_state, _p, e) => {
    e._hexStacks = (e._hexStacks || 0) + 1;
    if (e._hexStacks >= 3) e.slowTimer = (e.slowTimer || 0) + 0.5;
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Hexstorm: apply 3 hex stacks to all enemies, then detonate.
    const hexDmg = Math.round(ULTIMATE.HEXSTORM_EXPLOSION_DMG * pw);
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      e._hexStacks = (e._hexStacks || 0) + ULTIMATE.HEXSTORM_STACKS;
      e.slowTimer = (e.slowTimer || 0) + 1.0;
      damageEnemy(state, e, hexDmg, p.idx);
      spawnParticles(state, e.x, e.y, '#7755cc', 8, 0.5);
    }
    const hexed = state.enemies.filter(e => e.alive && (e._hexStacks || 0) >= 3);
    for (let i = 0; i < hexed.length && i < 20; i++) {
      for (let j = i + 1; j < hexed.length && j < 20; j++) {
        if (dist(hexed[i].x, hexed[i].y, hexed[j].x, hexed[j].y) < 150) {
          const b = state.beams.acquire();
          if (b) {
            b.x = hexed[i].x; b.y = hexed[i].y;
            b.angle = Math.atan2(hexed[j].y - hexed[i].y, hexed[j].x - hexed[i].x);
            b.range = dist(hexed[i].x, hexed[i].y, hexed[j].x, hexed[j].y);
            b.width = 3; b.color = '#7755cc'; b.life = 0.5;
          }
        }
      }
    }
    spawnShockwave(state, p.x, p.y, ROOM_WIDTH * 0.5, 'rgba(120,80,200,.2)');
    return true;
  },
});
