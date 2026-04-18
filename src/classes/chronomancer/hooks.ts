import { registerClassHooks } from '../hooks';
import { dist, spawnShockwave } from '../../state';
import { ULTIMATE, ROOM_WIDTH } from '../../constants';

registerClassHooks('chronomancer', {
  // Haste aura: +15% move speed for nearby ally.
  onTick: (state, p) => {
    const ally = state.players[1 - p.idx];
    if (ally && ally.alive && dist(p.x, p.y, ally.x, ally.y) < 150) {
      ally._hasteBonus = true;
    } else if (ally) {
      ally._hasteBonus = false;
    }
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Time Stop: freeze all enemies for 3s, player moves 1.5x faster.
    const freezeDur = ULTIMATE.TIME_STOP_DURATION * pw;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      e.stunTimer = (e.stunTimer || 0) + freezeDur;
    }
    p.moveSpeed *= ULTIMATE.TIME_STOP_SPEED_MULT;
    p._timeStopTimer = freezeDur;
    spawnShockwave(state, p.x, p.y, ROOM_WIDTH, 'rgba(255,200,60,.2)');
    return true;
  },
});
