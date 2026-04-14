import { GameState, dist, clamp } from '../state';
import { ENEMIES, ROOM_WIDTH, ROOM_HEIGHT } from '../constants';

/**
 * System 4: Enemy Physics (priority 53)
 * Applies velocity to position, wall clamping, and pillar collision.
 */
export function enemyPhysics(state: GameState, dt: number): void {
  for (const e of state.enemies) {
    if (!e.alive) continue;
    if (e._deathTimer >= 0) continue;
    if (e._friendly) continue;
    if (e.stunTimer > 0) continue;

    const et = ENEMIES[e.type];

    // Apply velocity
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.x = clamp(e.x, et.size, ROOM_WIDTH - et.size);
    e.y = clamp(e.y, et.size, ROOM_HEIGHT - et.size);

    // Pillar collision (unless phasing)
    if (!et.phase) {
      for (const pl of state.pillars) {
        const pd = dist(e.x, e.y, pl.x, pl.y);
        if (pd < pl.radius + et.size) {
          const nx = (e.x - pl.x) / pd;
          const ny = (e.y - pl.y) / pd;
          e.x = pl.x + nx * (pl.radius + et.size + 1);
          e.y = pl.y + ny * (pl.radius + et.size + 1);
        }
      }
    }
  }
}
