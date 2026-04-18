import { registerClassHooks } from '../hooks';
import { dist, netSfx, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { SfxName } from '../../types';
import { RANGES, TIMING, ULTIMATE, ROOM_WIDTH } from '../../constants';

registerClassHooks('paladin', {
  // Hallowed Ground Q: self-centered healing zone.
  castQAbility: (state, p, def) => {
    const z = state.zones.acquire();
    if (z) {
      z.x = p.x; z.y = p.y; z.radius = 100; z.duration = def.duration;
      z.dmg = def.dmg; z.color = def.color; z.owner = p.idx;
      z.slow = def.slow || 0; z.stun = 0; z.tickRate = def.tickRate; z.tickTimer = 0; z.age = 0;
      z.drain = 0; z.heal = 2; z.pull = 0; z.freezeAfter = 0;
    }
    netSfx(state, SfxName.Pickup);
    spawnParticles(state, p.x, p.y, '#ffffaa', 15);
    return true;
  },

  // Aura of Light: heal nearby ally 2 HP/s.
  onTick: (state, p, dt) => {
    const ally = state.players[1 - p.idx];
    if (!ally || !ally.alive) return;
    if (dist(p.x, p.y, ally.x, ally.y) >= RANGES.AURA) return;
    p._auraTick = (p._auraTick || 0) + dt;
    if (p._auraTick >= TIMING.AURA_HEAL_TICK) {
      p._auraTick = 0;
      if (ally.hp < ally.maxHp) {
        ally.hp = Math.min(ally.maxHp, ally.hp + 1);
        spawnText(state, ally.x, ally.y - 20, '+1', '#ffffaa');
      }
    }
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Holy Light: heal all players 75% maxHp + damage all enemies.
    for (const pl of state.players) {
      if (pl.alive) {
        pl.hp = Math.min(pl.maxHp, pl.hp + Math.round(pl.maxHp * ULTIMATE.PALADIN_HEAL_FRACTION));
        spawnParticles(state, pl.x, pl.y, '#ffffaa', 15);
        spawnText(state, pl.x, pl.y - 20, 'HEAL 75%', '#ffffaa');
      }
    }
    for (const e of state.enemies) {
      if (!e.alive) continue;
      damageEnemy(state, e, Math.round(3 * pw), p.idx);
    }
    spawnShockwave(state, p.x, p.y, ROOM_WIDTH, 'rgba(255,255,180,.3)');
    return true;
  },
});
