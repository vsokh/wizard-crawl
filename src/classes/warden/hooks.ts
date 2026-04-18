import { registerClassHooks } from '../hooks';
import { dist, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { ULTIMATE } from '../../constants';

registerClassHooks('warden', {
  // Sentinel: 20% DR when facing enemies, mark melee attackers for +1 ally dmg.
  onTick: (state, p) => {
    p._facingDR = false;
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      const d = dist(p.x, p.y, e.x, e.y);
      if (d < 100) {
        const aimAngle = Math.atan2(e.y - p.y, e.x - p.x);
        const diff = Math.abs(((aimAngle - p.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (diff < Math.PI / 3) p._facingDR = true;
        if (d < 50) e._wardenMark = true;
      }
    }
  },

  castUltimate: (state, p) => {
    // Unbreakable: invulnerable + protect allies.
    p.iframes = ULTIMATE.UNBREAKABLE_DURATION;
    p._invulnTimer = ULTIMATE.UNBREAKABLE_DURATION;
    for (const ally of state.players) {
      if (ally.idx !== p.idx && ally.alive) {
        ally._wardenDR = ULTIMATE.UNBREAKABLE_DURATION;
        spawnText(state, ally.x, ally.y - 20, 'PROTECTED', '#5588aa');
        spawnParticles(state, ally.x, ally.y, '#88bbdd', 10);
      }
    }
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      if (dist(p.x, p.y, e.x, e.y) < 200) {
        e._wardenMark = true;
        spawnText(state, e.x, e.y - 15, 'MARKED', '#5588aa');
      }
    }
    spawnShockwave(state, p.x, p.y, 200, 'rgba(80,130,170,.4)');
    return true;
  },
});
