import { registerClassHooks } from '../hooks';
import { netSfx, rand, spawnParticles, spawnShockwave } from '../../state';
import { createFriendlyEnemy } from '../../systems/dungeon';
import { SfxName } from '../../types';
import { ULTIMATE, TIMING } from '../../constants';

import { spawnText } from '../../state';

registerClassHooks('druid', {
  // Spirit Wolf Q: summon wolf ally (2 wolves with Pack Leader).
  castQAbility: (state, p, _def, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const wolf = createFriendlyEnemy(state, p.x + cos * 40, p.y + sin * 40, p.idx);
    wolf.type = '_wolf';
    wolf.hp = 8;
    wolf.maxHp = 8;
    wolf._lifespan = 12;
    if (p.packLeader) {
      wolf.hp = 16;
      wolf.maxHp = 16;
      wolf._dmgMul = 2;
    }
    state.enemies.push(wolf);
    spawnParticles(state, wolf.x, wolf.y, '#88aa66', 10);
    if (p.packLeader) {
      const wolf2 = createFriendlyEnemy(state, p.x - cos * 40, p.y - sin * 40, p.idx);
      wolf2.type = '_wolf';
      wolf2.hp = 16;
      wolf2.maxHp = 16;
      wolf2._dmgMul = 2;
      wolf2._lifespan = 15;
      state.enemies.push(wolf2);
      spawnParticles(state, wolf2.x, wolf2.y, '#88aa66', 10);
    }
    netSfx(state, SfxName.Pickup);
    return true;
  },

  // Regrowth: regen 1 HP every 7s.
  onTick: (state, p, dt) => {
    p._auraTick = (p._auraTick || 0) + dt;
    if (p._auraTick >= 7) {
      p._auraTick = 0;
      if (p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + 1);
        spawnText(state, p.x, p.y - 20, '+1 HP', '#44aa33');
      }
    }
  },

  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Nature's Wrath: ring of 6 thorn zones + 2 treant allies.
    for (let i = 0; i < 6; i++) {
      const za = (i / 6) * Math.PI * 2;
      const zDist = rand(100, 120);
      const zx = p.x + Math.cos(za) * zDist;
      const zy = p.y + Math.sin(za) * zDist;
      const z = state.zones.acquire();
      if (z) {
        z.x = zx; z.y = zy; z.radius = 40; z.duration = 4;
        z.dmg = Math.round(2 * pw); z.color = '#66aa44'; z.owner = p.idx;
        z.slow = ULTIMATE.DRUID_ZONE_SLOW; z.stun = 0; z.tickRate = ULTIMATE.DRUID_ZONE_TICK; z.tickTimer = 0; z.age = 0;
        z.drain = 0; z.heal = 0; z.pull = 0; z.freezeAfter = 0;
      }
      spawnParticles(state, zx, zy, '#88aa66', 6, TIMING.PARTICLE_LIFE_MEDIUM);
    }
    for (let i = 0; i < 2; i++) {
      const ta = angle + (i === 0 ? -ULTIMATE.DRUID_TREANT_ANGLE : ULTIMATE.DRUID_TREANT_ANGLE);
      const tx = p.x + Math.cos(ta) * 50;
      const ty = p.y + Math.sin(ta) * 50;
      const treant = createFriendlyEnemy(state, tx, ty, p.idx);
      treant.hp = 8;
      treant.maxHp = 8;
      treant._lifespan = ULTIMATE.DRUID_TREANT_LIFE;
      state.enemies.push(treant);
      spawnParticles(state, tx, ty, '#88aa66', 10);
    }
    spawnShockwave(state, p.x, p.y, 130, 'rgba(80,180,60,.3)');
    return true;
  },
});
