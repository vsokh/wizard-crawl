import { registerClassHooks } from '../hooks';
import { netSfx, rand } from '../../state';
import { castSpellSilent } from '../../systems/combat';
import { SfxName, SpellType } from '../../types';
import { COMBAT, ULTIMATE, WIZARD_SIZE } from '../../constants';

registerClassHooks('arcanist', {
  // Arcane Echo: 25% chance to echo primary attack.
  onDamageEnemy: (state, p, e) => {
    if (Math.random() < COMBAT.ARCANIST_ECHO_CHANCE) {
      castSpellSilent(state, p, 0, Math.atan2(e.y - p.y, e.x - p.x));
    }
  },

  // Arcane Salvo Q: 5 homing projectiles fanned around angle.
  castQAbility: (state, p, def, angle) => {
    for (let i = 0; i < 5; i++) {
      const sa = angle + (i - 2.5) * 0.12 + rand(-0.05, 0.05);
      setTimeout(() => {
        state.spells.push({
          type: SpellType.Homing, dmg: def.dmg, speed: def.speed,
          radius: def.radius || 7, life: 2, homing: 2.5,
          color: def.color, trail: def.trail,
          x: p.x + Math.cos(sa) * WIZARD_SIZE,
          y: p.y + Math.sin(sa) * WIZARD_SIZE,
          vx: Math.cos(sa) * def.speed,
          vy: Math.sin(sa) * def.speed,
          owner: p.idx, age: 0, zapTimer: 0, pierceLeft: 0,
          zap: 0, zapRate: 0, slow: 0, drain: 0, explode: 0, burn: 0,
          stun: 0, clsKey: p.clsKey, _reversed: false, _bounces: 0,
          _slot: 2,
        });
        netSfx(state, SfxName.Arcane);
      }, i * 80);
    }
    return true;
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Arcane Storm: spiral of 20 homing missiles.
    for (let i = 0; i < 20; i++) {
      const sa = p.angle + (i / 20) * Math.PI * 4;
      setTimeout(() => {
        state.spells.push({
          type: SpellType.Homing, dmg: Math.round(2 * pw), speed: 250, radius: 6, life: ULTIMATE.HOMING_MISSILE_LIFE,
          homing: ULTIMATE.HOMING_FACTOR, color: '#ff55aa', trail: '#dd3388',
          x: p.x + Math.cos(sa) * 20, y: p.y + Math.sin(sa) * 20,
          vx: Math.cos(sa) * 200, vy: Math.sin(sa) * 200,
          owner: p.idx, age: 0, zapTimer: 0, pierceLeft: 0,
          zap: 0, zapRate: 0, slow: 0, drain: 0, explode: 0, burn: 0,
          stun: 0, clsKey: p.clsKey, _reversed: false, _bounces: 0,
        });
        netSfx(state, SfxName.Arcane);
      }, i * ULTIMATE.ARCANE_STORM_TIMEOUT);
    }
    return true;
  },
});
