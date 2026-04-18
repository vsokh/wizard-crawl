import { registerClassHooks } from '../hooks';
import { dist, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { ULTIMATE } from '../../constants';

registerClassHooks('soulbinder', {
  // Soul Bond: marks enemies for 4s on hit.
  onDamageEnemy: (state, _p, e) => {
    e._soulMark = state.time + 4;
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Soul Storm: drain life from nearby enemies.
    const stormDmg = Math.round(ULTIMATE.SOUL_STORM_DMG * pw);
    let totalDrained = 0;
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      if (dist(p.x, p.y, e.x, e.y) < ULTIMATE.SOUL_STORM_RADIUS) {
        damageEnemy(state, e, stormDmg, p.idx);
        totalDrained += stormDmg;
        spawnParticles(state, e.x, e.y, '#55aa88', 6, 0.4);
        e._soulMark = state.time + 4;
      }
    }
    const healAmt = Math.floor(totalDrained * 0.25);
    if (healAmt > 0) {
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
      spawnText(state, p.x, p.y - 15, '+' + healAmt + ' HP', '#44ff88');
    }
    spawnShockwave(state, p.x, p.y, ULTIMATE.SOUL_STORM_RADIUS, 'rgba(80,170,130,.3)');
    spawnParticles(state, p.x, p.y, '#55aa88', 15, 1.0);
    return true;
  },
});
