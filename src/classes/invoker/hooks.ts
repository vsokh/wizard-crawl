import { registerClassHooks } from '../hooks';
import { clamp, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { ULTIMATE, ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

registerClassHooks('invoker', {
  // Elemental Attunement: burning+slowed enemies take +1 dmg.
  onDamageEnemy: (state, _p, e) => {
    if ((e._burnTimer || 0) > 0 && (e.slowTimer || 0) > 0) {
      e.hp -= 1;
      spawnText(state, e.x, e.y - 20, '+1', '#cc8844');
    }
  },

  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Elemental Convergence: triple overlapping zones.
    const tx = clamp(p.x + Math.cos(angle) * 120, 60, ROOM_WIDTH - 60);
    const ty = clamp(p.y + Math.sin(angle) * 120, 60, ROOM_HEIGHT - 60);
    const zoneDmg = Math.round(ULTIMATE.CONVERGENCE_DMG * pw);

    const fireZone = state.zones.acquire();
    if (fireZone) {
      fireZone.x = tx - 30; fireZone.y = ty; fireZone.radius = ULTIMATE.CONVERGENCE_RADIUS;
      fireZone.duration = ULTIMATE.CONVERGENCE_DURATION; fireZone.dmg = zoneDmg;
      fireZone.color = '#ff6633'; fireZone.owner = p.idx;
      fireZone.slow = 0; fireZone.stun = 0; fireZone.tickRate = 0.5; fireZone.tickTimer = 0; fireZone.age = 0;
      fireZone.drain = 0; fireZone.heal = 0; fireZone.pull = 0; fireZone.freezeAfter = 0;
    }
    const iceZone = state.zones.acquire();
    if (iceZone) {
      iceZone.x = tx + 30; iceZone.y = ty; iceZone.radius = ULTIMATE.CONVERGENCE_RADIUS;
      iceZone.duration = ULTIMATE.CONVERGENCE_DURATION; iceZone.dmg = zoneDmg;
      iceZone.color = '#44bbff'; iceZone.owner = p.idx;
      iceZone.slow = 1.5; iceZone.stun = 0; iceZone.tickRate = 0.5; iceZone.tickTimer = 0; iceZone.age = 0;
      iceZone.drain = 0; iceZone.heal = 0; iceZone.pull = 0; iceZone.freezeAfter = 0;
    }
    const lightZone = state.zones.acquire();
    if (lightZone) {
      lightZone.x = tx; lightZone.y = ty - 30; lightZone.radius = ULTIMATE.CONVERGENCE_RADIUS;
      lightZone.duration = ULTIMATE.CONVERGENCE_DURATION; lightZone.dmg = zoneDmg;
      lightZone.color = '#ffcc44'; lightZone.owner = p.idx;
      lightZone.slow = 0; lightZone.stun = 0.5; lightZone.tickRate = 0.6; lightZone.tickTimer = 0; lightZone.age = 0;
      lightZone.drain = 0; lightZone.heal = 0; lightZone.pull = 0; lightZone.freezeAfter = 0;
    }
    spawnShockwave(state, tx, ty, ULTIMATE.CONVERGENCE_RADIUS, 'rgba(200,130,70,.3)');
    spawnParticles(state, tx, ty, '#ff6633', 8, 0.5);
    spawnParticles(state, tx, ty, '#44bbff', 8, 0.5);
    spawnParticles(state, tx, ty, '#ffcc44', 8, 0.5);
    return true;
  },
});
