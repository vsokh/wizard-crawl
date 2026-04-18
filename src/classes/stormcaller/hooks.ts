import { registerClassHooks } from '../hooks';
import { spawnParticles, spawnShockwave, shake, netSfx } from '../../state';
import { SfxName } from '../../types';

registerClassHooks('stormcaller', {
  castUltimate: (state, p) => {
    // Thunder God: 5s transformation — Lightning instant, auto-detonates on hit, Storm Step cd removed, +50% ms.
    p._thunderGod = 5;
    p.cd[2] = 0;
    spawnParticles(state, p.x, p.y, '#ffcc44', 40, 1.5);
    spawnShockwave(state, p.x, p.y, 160, '#ffcc44');
    shake(state, 4);
    netSfx(state, SfxName.Zap);
    return true;
  },
});
