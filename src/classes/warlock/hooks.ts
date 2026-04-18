import { registerClassHooks } from '../hooks';
import { netSfx, shake, spawnParticles, spawnText } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { createFriendlyEnemy } from '../../systems/dungeon';
import { SfxName } from '../../types';
import { ULTIMATE } from '../../constants';

registerClassHooks('warlock', {
  // Summon Imp Q: small ranged demon ally (up to 3 with Demonic Pact).
  castQAbility: (state, p, _def, angle) => {
    if (p.demonicPact) {
      const impCount = state.enemies.filter(e => e.alive && e._friendly && e.type === '_imp' && e._owner === p.idx).length;
      if (impCount >= 3) return true;
    }
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const imp = createFriendlyEnemy(state, p.x + cos * 40, p.y + sin * 40, p.idx);
    imp.type = '_imp';
    imp.hp = 5;
    imp.maxHp = 5;
    imp._lifespan = p.demonicPact ? 0 : 12;
    state.enemies.push(imp);
    spawnParticles(state, imp.x, imp.y, '#cc4466', 10);
    netSfx(state, SfxName.Arcane);
    return true;
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Doom: marks all enemies, after 3s they take 35% of max HP as damage.
    const marked = state.enemies.filter(e => e.alive && !e._friendly);
    for (const e of marked) spawnText(state, e.x, e.y - 15, 'DOOMED', '#662288');
    const pIdx = p.idx;
    setTimeout(() => {
      for (const e of marked) {
        if (!e.alive) continue;
        const doomDmg = Math.max(1, Math.ceil(e.maxHp * ULTIMATE.DOOM_DMG_FRACTION * pw));
        damageEnemy(state, e, doomDmg, pIdx);
        spawnParticles(state, e.x, e.y, '#662288', 10);
      }
      netSfx(state, SfxName.Boom);
      shake(state, 6);
    }, 3000);
    return true;
  },
});
