import { registerClassHooks } from '../hooks';
import { spawnParticles } from '../../state';
import { createFriendlyEnemy } from '../../systems/dungeon';
import { ULTIMATE } from '../../constants';

registerClassHooks('engineer', {
  castUltimate: (state, p, angle) => {
    const pw = p.ultPower || 1;
    // Mega Turret: 20 HP, 3 dmg/shot, 12s.
    const turret = createFriendlyEnemy(state, p.x + Math.cos(angle) * 40, p.y + Math.sin(angle) * 40, p.idx);
    turret.type = '_ally';
    turret.hp = 20;
    turret.maxHp = 20;
    turret._lifespan = ULTIMATE.TURRET_LIFE;
    state.enemies.push(turret);
    spawnParticles(state, turret.x, turret.y, '#dd8833', 15);
    const megaZone = state.zones.acquire();
    if (megaZone) {
      megaZone.x = turret.x; megaZone.y = turret.y; megaZone.radius = ULTIMATE.TURRET_RADIUS; megaZone.duration = ULTIMATE.TURRET_LIFE;
      megaZone.dmg = Math.round(3 * pw); megaZone.color = '#dd8833'; megaZone.owner = p.idx;
      megaZone.slow = 0; megaZone.stun = 0; megaZone.tickRate = 0.7; megaZone.tickTimer = 0; megaZone.age = 0;
      megaZone.drain = 0; megaZone.heal = 0; megaZone.pull = 0; megaZone.freezeAfter = 0;
      megaZone._turret = true; megaZone._megaTurret = true;
      megaZone.tickRate *= 0.8; // Overclock: +20% turret fire rate.
    }
    return true;
  },
});
