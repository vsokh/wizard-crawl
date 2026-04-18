import { registerClassHooks } from '../hooks';
import { netSfx, spawnShockwave, spawnText, toWorld } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { SfxName } from '../../types';
import { TIMING, ROOM_WIDTH } from '../../constants';

registerClassHooks('cryomancer', {
  // Frostbite: +1 dmg if slowed.
  onDamageEnemy: (state, _p, e) => {
    if (e.slowTimer > 0) {
      e.hp -= 1;
      spawnText(state, e.x, e.y - 15, '+1', '#88ddff');
    }
  },

  // Frost Prison Q: strong slow + freeze after 1.5s.
  castQAbility: (state, p, def) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const z = state.zones.acquire();
    if (z) {
      z.x = wp.x; z.y = wp.y; z.radius = def.radius; z.duration = def.duration;
      z.dmg = def.dmg; z.color = def.color; z.owner = p.idx;
      z.slow = 0.95; z.stun = 0; z.tickRate = def.tickRate; z.tickTimer = 0; z.age = 0;
      z.drain = 0; z.heal = 0; z.pull = 0; z.freezeAfter = TIMING.FREEZE_DURATION;
    }
    netSfx(state, SfxName.Ice);
    return true;
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Absolute Zero: freeze ALL enemies for 3s + damage.
    for (const e of state.enemies) {
      if (!e.alive) continue;
      e.stunTimer = (e.stunTimer || 0) + 3 * pw;
      damageEnemy(state, e, Math.round(3 * pw), p.idx);
    }
    spawnShockwave(state, p.x, p.y, ROOM_WIDTH, 'rgba(100,200,255,.3)');
    return true;
  },
});
