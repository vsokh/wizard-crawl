import { registerClassHooks } from '../hooks';
import { netSfx, rand, toWorld } from '../../state';
import { SfxName } from '../../types';
import { TIMING, ULTIMATE, ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

registerClassHooks('pyromancer', {
  // Ignite: hits burn for 4 dmg over 2s.
  onDamageEnemy: (_state, p, e) => {
    e._burnTimer = (e._burnTimer || 0) + 2;
    e._burnOwner = p.idx;
  },

  // Meteor Shower Q: 3 scattered meteors + burn zones.
  castQAbility: (state, p) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    for (let i = 0; i < 3; i++) {
      const ox = rand(-40, 40);
      const oy = rand(-40, 40);
      const meteorDelay = TIMING.ZONE_TICK + i * TIMING.METEOR_DELAY_STEP;
      const meteorAoe = state.aoeMarkers.acquire();
      if (meteorAoe) {
        meteorAoe.x = wp.x + ox; meteorAoe.y = wp.y + oy; meteorAoe.radius = 50; meteorAoe.delay = meteorDelay;
        meteorAoe.dmg = 2; meteorAoe.color = '#ff2200'; meteorAoe.owner = p.idx; meteorAoe.stun = 0; meteorAoe.age = 0;
      }
      setTimeout(() => {
        const burnZone = state.zones.acquire();
        if (burnZone) {
          burnZone.x = wp.x + ox; burnZone.y = wp.y + oy; burnZone.radius = 35; burnZone.duration = 2;
          burnZone.dmg = 1; burnZone.color = '#ff4400'; burnZone.owner = p.idx;
          burnZone.slow = 0; burnZone.stun = 0; burnZone.tickRate = TIMING.ZONE_TICK; burnZone.tickTimer = 0; burnZone.age = 0;
          burnZone.drain = 0; burnZone.heal = 0; burnZone.pull = 0; burnZone.freezeAfter = 0;
        }
      }, meteorDelay * 1000);
    }
    netSfx(state, SfxName.Fire);
    return true;
  },

  castUltimate: (state, p) => {
    const pw = p.ultPower || 1;
    // Inferno: rain 8 meteors across the room with lingering burn zones.
    for (let i = 0; i < 8; i++) {
      const mx = rand(60, ROOM_WIDTH - 60);
      const my = rand(60, ROOM_HEIGHT - 60);
      setTimeout(() => {
        const ultAoe = state.aoeMarkers.acquire();
        if (ultAoe) {
          ultAoe.x = mx; ultAoe.y = my; ultAoe.radius = 80; ultAoe.delay = ULTIMATE.METEOR_DELAY;
          ultAoe.dmg = Math.round(5 * pw); ultAoe.color = '#ff2200'; ultAoe.owner = p.idx; ultAoe.stun = 0; ultAoe.age = 0;
        }
        netSfx(state, SfxName.Fire);
        setTimeout(() => {
          const z = state.zones.acquire();
          if (z) {
            z.x = mx; z.y = my; z.radius = 40; z.duration = 3;
            z.dmg = 1; z.color = '#ff4400'; z.owner = p.idx;
            z.slow = 0; z.stun = 0; z.tickRate = ULTIMATE.BURN_ZONE_TICK; z.tickTimer = 0; z.age = 0;
            z.drain = 0; z.heal = 0; z.pull = 0; z.freezeAfter = 0;
          }
        }, ULTIMATE.BURN_ZONE_LINGER);
      }, i * 200);
    }
    return true;
  },
});
