import { registerClassHooks } from '../hooks';
import { dist, netSfx, shake, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { damageEnemy } from '../../systems/combat';
import { SfxName } from '../../types';
import { COMBAT, TIMING, ULTIMATE } from '../../constants';

registerClassHooks('monk', {
  // Inner Peace: 25% dodge floor (applied in physics tick).
  onTick: (_state, p) => {
    if (p.dodgeChance < COMBAT.MONK_DODGE_CHANCE) {
      p.dodgeChance = COMBAT.MONK_DODGE_CHANCE;
    }
  },

  // Chi Burst Q: instant heal + knockback pulse.
  castQAbility: (state, p, def) => {
    const healAmt = def.heal || 3;
    p.hp = Math.min(p.maxHp, p.hp + healAmt);
    spawnText(state, p.x, p.y - 20, `+${healAmt} HP`, '#88ff88');
    if (p.zenMana) {
      p.mana = Math.min(p.maxMana, p.mana + healAmt);
      spawnText(state, p.x, p.y - 35, `+${healAmt} MP`, '#88bbff');
    }
    const knockR = 80;
    const knockForce = COMBAT.KNOCKBACK_FORCE;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      const d = dist(p.x, p.y, e.x, e.y);
      if (d < knockR && d > 0) {
        const knockAngle = Math.atan2(e.y - p.y, e.x - p.x);
        e.x += Math.cos(knockAngle) * (knockForce / Math.max(d, 30)) * 3;
        e.y += Math.sin(knockAngle) * (knockForce / Math.max(d, 30)) * 3;
        damageEnemy(state, e, 1, p.idx);
      }
    }
    spawnShockwave(state, p.x, p.y, knockR, 'rgba(255,255,200,.4)');
    spawnParticles(state, p.x, p.y, '#eedd88', 20, 0.8);
    netSfx(state, SfxName.Boom);
    shake(state, 4);
    return true;
  },

  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Thousand Fists: 20 rapid melee hits in a cone with knockback.
    p.iframes = TIMING.IFRAME_MONK_ULT;
    const monkDmg = Math.round(1 * pw);
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        for (const e of state.enemies) {
          if (!e.alive) continue;
          const d = dist(p.x, p.y, e.x, e.y);
          if (d > 60) continue;
          const a2 = Math.atan2(e.y - p.y, e.x - p.x);
          const diff = Math.abs(((a2 - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (diff <= ULTIMATE.MONK_CONE_ANGLE) {
            damageEnemy(state, e, monkDmg, p.idx);
            if (d > 0) {
              const nx = (e.x - p.x) / d;
              const ny = (e.y - p.y) / d;
              e.vx = nx * ULTIMATE.MONK_KNOCKBACK;
              e.vy = ny * ULTIMATE.MONK_KNOCKBACK;
            }
          }
        }
        spawnParticles(state, p.x + Math.cos(angle) * 30, p.y + Math.sin(angle) * 30, '#eedd88', 2, 0.3);
        netSfx(state, SfxName.Hit);
      }, i * 40);
    }
    return true;
  },
});
