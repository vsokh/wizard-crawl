import { registerClassHooks } from '../hooks';
import { netSfx, spawnParticles, spawnText, toWorld } from '../../state';
import { createFriendlyEnemy } from '../../systems/dungeon';
import { SfxName } from '../../types';

registerClassHooks('necromancer', {
  // Soul Harvest: kills heal 0.5 HP.
  onKill: (state, p) => {
    p.hp = Math.min(p.maxHp, p.hp + 0.5);
    spawnText(state, p.x, p.y - 15, '+0.5 HP', '#44ff88');
  },

  // Death Harvest Q: drain + pull enemies toward center.
  castQAbility: (state, p, def) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const z = state.zones.acquire();
    if (z) {
      z.x = wp.x; z.y = wp.y; z.radius = def.radius; z.duration = def.duration;
      z.dmg = def.dmg; z.color = def.color; z.owner = p.idx;
      z.slow = def.slow || 0; z.stun = 0; z.tickRate = def.tickRate; z.tickTimer = 0; z.age = 0;
      z.drain = 0; z.heal = 0; z.pull = 30; z.freezeAfter = 0;
    }
    netSfx(state, SfxName.Arcane);
    return true;
  },

  castUltimate: (state, p) => {
    // Army of Dead: summon 6 friendly skeletons.
    for (let i = 0; i < 6; i++) {
      const sa = p.angle + (i / 6) * Math.PI * 2;
      const sx = p.x + Math.cos(sa) * 50;
      const sy = p.y + Math.sin(sa) * 50;
      state.enemies.push(createFriendlyEnemy(state, sx, sy, p.idx));
      spawnParticles(state, sx, sy, '#55cc55', 8);
    }
    return true;
  },
});
