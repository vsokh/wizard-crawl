import { registerClassHooks } from '../hooks';
import { clamp, dist, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { ULTIMATE, ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

registerClassHooks('voidweaver', {
  // Entropic Decay: debuffed enemies take +15% damage.
  onDamageEnemy: (state, _p, e, dmg) => {
    if ((e._burnTimer || 0) > 0 || (e.slowTimer || 0) > 0 || (e.stunTimer || 0) > 0) {
      const bonus = Math.max(1, Math.floor(dmg * 0.15));
      e.hp -= bonus;
      spawnText(state, e.x, e.y - 20, '+' + bonus, '#aa44cc');
    }
  },

  // Debuffed kills explode for 1 AOE damage.
  onKill: (state, p, e) => {
    if ((e._burnTimer || 0) > 0 || (e.slowTimer || 0) > 0 || (e.stunTimer || 0) > 0) {
      for (const nearby of state.enemies) {
        if (!nearby.alive || nearby === e || nearby._friendly) continue;
        if (dist(e.x, e.y, nearby.x, nearby.y) < 60) {
          damageEnemy(state, nearby, 1, p.idx);
          spawnParticles(state, nearby.x, nearby.y, '#aa44cc', 4);
        }
      }
      spawnShockwave(state, e.x, e.y, 60, 'rgba(170,70,200,.3)');
    }
  },

  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Void Rift: pull zone + DOT + debuffs.
    const tx = clamp(p.x + Math.cos(angle) * 120, 60, ROOM_WIDTH - 60);
    const ty = clamp(p.y + Math.sin(angle) * 120, 60, ROOM_HEIGHT - 60);
    const z = state.zones.acquire();
    if (z) {
      z.x = tx; z.y = ty; z.radius = ULTIMATE.VOID_RIFT_RADIUS;
      z.duration = ULTIMATE.VOID_RIFT_DURATION; z.dmg = Math.round(ULTIMATE.VOID_RIFT_DMG * pw);
      z.color = '#882299'; z.owner = p.idx;
      z.slow = 1.0; z.stun = 0; z.tickRate = 0.5; z.tickTimer = 0; z.age = 0;
      z.drain = 0; z.heal = 0; z.pull = 1; z.freezeAfter = 0;
    }
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      const d = dist(tx, ty, e.x, e.y);
      if (d < ULTIMATE.VOID_RIFT_RADIUS && d > 1) {
        const nx = (tx - e.x) / d;
        const ny = (ty - e.y) / d;
        e.vx = nx * 60;
        e.vy = ny * 60;
        e.slowTimer = Math.max(e.slowTimer || 0, 1.0);
        e._burnTimer = (e._burnTimer || 0) + 3;
      }
    }
    spawnShockwave(state, tx, ty, ULTIMATE.VOID_RIFT_RADIUS, 'rgba(130,30,150,.3)');
    spawnParticles(state, tx, ty, '#aa44cc', 20, 1.0);
    return true;
  },
});
