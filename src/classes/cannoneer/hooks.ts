import { registerClassHooks } from '../hooks';
import { clamp, netSfx, rand, shake, spawnParticles, spawnShockwave, spawnText } from '../../state';
import { SfxName } from '../../types';
import { ULTIMATE, ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

registerClassHooks('cannoneer', {
  // Heavy Caliber: every 4th shot deals 2x damage.
  onDamageEnemy: (state, p, e, dmg) => {
    p._cannonShots = (p._cannonShots || 0) + 1;
    if (p._cannonShots % 4 === 0) {
      e.hp -= dmg;
      spawnText(state, e.x, e.y - 25, 'HEAVY!', '#aa7733');
    }
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Artillery Barrage: rain explosive shells.
    const shellDmg = Math.round(ULTIMATE.ARTILLERY_DMG * pw);
    for (let i = 0; i < ULTIMATE.ARTILLERY_SHELLS; i++) {
      const idx = i;
      setTimeout(() => {
        const tx = clamp(p.x + rand(-200, 200), 60, ROOM_WIDTH - 60);
        const ty = clamp(p.y + rand(-200, 200), 60, ROOM_HEIGHT - 60);
        const marker = state.aoeMarkers.acquire();
        if (marker) {
          marker.x = tx; marker.y = ty;
          marker.radius = ULTIMATE.ARTILLERY_RADIUS; marker.delay = 0.4;
          marker.dmg = shellDmg; marker.owner = p.idx;
          marker.color = '#aa7733'; marker.age = 0; marker.stun = 0.5;
        }
        spawnParticles(state, tx, ty, '#dd8833', 10, 0.5);
        shake(state, 4);
        netSfx(state, SfxName.Hit);
      }, idx * 300);
    }
    spawnShockwave(state, p.x, p.y, 200, 'rgba(170,120,50,.3)');
    return true;
  },
});
