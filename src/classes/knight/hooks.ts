import { registerClassHooks } from '../hooks';
import { spawnShockwave } from '../../state';
import { ULTIMATE } from '../../constants';

registerClassHooks('knight', {
  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Shield Wall: invulnerable for 3s + reflect.
    const shieldDur = ULTIMATE.TIME_STOP_DURATION * pw;
    p.iframes = shieldDur;
    p._shieldWall = shieldDur;
    spawnShockwave(state, p.x, p.y, 80, 'rgba(200,200,255,.4)');
    return true;
  },
});
