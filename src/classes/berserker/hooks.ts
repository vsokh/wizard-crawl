import { registerClassHooks } from '../hooks';
import { spawnParticles } from '../../state';
import { DEFAULT_MOVE_SPEED, ULTIMATE } from '../../constants';

registerClassHooks('berserker', {
  // Fury: below 50% HP gain speed and damage bonus (damage bonus lives in damageEnemy multiplier).
  onTick: (_state, p) => {
    p._furyActive = p.hp <= p.maxHp / 2;
    if (p._furyActive) p.moveSpeed = Math.max(p.moveSpeed, DEFAULT_MOVE_SPEED * 1.5);
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Blood Rage: 2x dmg, 2x speed, take 2x damage for 5s.
    const rageDur = ULTIMATE.BLOOD_RAGE_DURATION * pw;
    p._rage = rageDur;
    p._rageDmgMul = ULTIMATE.BLOOD_RAGE_DMG_MULT;
    spawnParticles(state, p.x, p.y, '#ff3333', 25, 1.2);
    return true;
  },
});
