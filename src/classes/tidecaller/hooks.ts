import { registerClassHooks } from '../hooks';
import { dist, spawnParticles, spawnShockwave } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { ULTIMATE } from '../../constants';

registerClassHooks('tidecaller', {
  // Rising Tide: count active summons (capped at 3) for passive dmg bonus.
  onTick: (state, p) => {
    let summonCount = 0;
    for (const e of state.enemies) {
      if (e.alive && e._friendly && e._owner === p.idx) summonCount++;
    }
    p._summonCount = Math.min(3, summonCount);
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Tsunami: push all enemies away + damage + slow.
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      const d = dist(p.x, p.y, e.x, e.y);
      if (d < ULTIMATE.TSUNAMI_RADIUS && d > 1) {
        const nx = (e.x - p.x) / d;
        const ny = (e.y - p.y) / d;
        e.vx = nx * ULTIMATE.TSUNAMI_PUSH;
        e.vy = ny * ULTIMATE.TSUNAMI_PUSH;
        e.slowTimer = Math.max(e.slowTimer || 0, ULTIMATE.TSUNAMI_SLOW);
        damageEnemy(state, e, Math.round(ULTIMATE.TSUNAMI_DMG * pw), p.idx);
        spawnParticles(state, e.x, e.y, '#3388bb', 4, 0.3);
      }
    }
    spawnShockwave(state, p.x, p.y, ULTIMATE.TSUNAMI_RADIUS, 'rgba(50,130,180,.4)');
    spawnParticles(state, p.x, p.y, '#44aadd', 20, 1.2);
    return true;
  },
});
