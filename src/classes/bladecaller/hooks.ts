import { registerClassHooks } from '../hooks';
import { damageEnemy } from '../../systems/combat';
import { rand, spawnParticles, spawnText, netSfx, shake } from '../../state';
import { SfxName } from '../../types';
import { DEFAULT_MOVE_SPEED, ULTIMATE } from '../../constants';

registerClassHooks('bladecaller', {
  // Kill Rush speed boost: if active, raise move speed.
  onTick: (state, p) => {
    if (p._rushSpeed && p._rushSpeed > state.time) {
      p.moveSpeed = Math.max(p.moveSpeed, DEFAULT_MOVE_SPEED * 1.1);
    }
  },

  // Kill Rush: kills within 1.5s of Shadow Step reset its cd; kills grant speed boost.
  onKill: (state, p) => {
    if (p._lastShadowStep && state.time - p._lastShadowStep < 1.5) {
      p.cd[1] = 0;
      spawnText(state, p.x, p.y - 15, 'RESET!', '#cc3355');
    }
    p._rushSpeed = state.time + 3;
  },

  castUltimate: (state, p) => {
    // Thousand Cuts: dash to N random enemies dealing damage.
    const targets = state.enemies.filter(e => e.alive && !e._friendly);
    if (targets.length === 0) return true;

    const pw = p.ultPower || 1;
    const cutDmg = Math.round(ULTIMATE.THOUSAND_CUTS_DMG * pw);
    p.iframes = ULTIMATE.THOUSAND_CUTS_HITS * 0.1 + 0.5;

    for (let i = 0; i < ULTIMATE.THOUSAND_CUTS_HITS; i++) {
      const idx = i;
      setTimeout(() => {
        if (targets.length === 0) return;
        const t = targets[idx % targets.length];
        if (!t.alive) return;
        p.x = t.x + rand(-15, 15);
        p.y = t.y + rand(-15, 15);
        damageEnemy(state, t, cutDmg, p.idx);
        spawnParticles(state, t.x, t.y, '#cc3355', 4, 0.3);
        netSfx(state, SfxName.Hit);
        shake(state, 2);
      }, idx * 100);
    }
    return true;
  },
});
