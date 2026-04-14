import { GameState } from '../state';
import { ENEMIES } from '../constants';

/**
 * Rebuild the spatial hash grid with all alive enemies.
 * Called once per frame at priority 5 (before all collision systems)
 * so that every subsequent system can use grid queries for broad-phase checks.
 */
export function rebuildEnemyGrid(state: GameState): void {
  const grid = state.enemyGrid;
  grid.clear();
  for (const e of state.enemies) {
    if (!e.alive) continue;
    grid.insert(e._idx, e.x, e.y, ENEMIES[e.type].size);
  }
}
