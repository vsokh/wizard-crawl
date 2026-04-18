/**
 * Generic decaying-timer collection. Replaces scattered `_xxxTimer` player fields.
 *
 * Usage:
 *   const bag = new TimerBag();
 *   bag.set('rage', 5);           // 5 seconds
 *   bag.tick(dt);                 // call once per frame
 *   if (bag.active('rage')) { ... }
 *   const t = bag.remaining('rage');
 *
 * Expired keys are dropped in tick(). `remaining(key)` returns 0 when inactive.
 */
export class TimerBag {
  private t = new Map<string, number>();

  set(key: string, seconds: number): void {
    if (seconds <= 0) {
      this.t.delete(key);
      return;
    }
    this.t.set(key, seconds);
  }

  add(key: string, seconds: number): void {
    const cur = this.t.get(key) ?? 0;
    this.set(key, cur + seconds);
  }

  active(key: string): boolean {
    return (this.t.get(key) ?? 0) > 0;
  }

  remaining(key: string): number {
    return this.t.get(key) ?? 0;
  }

  clear(key: string): void {
    this.t.delete(key);
  }

  reset(): void {
    this.t.clear();
  }

  /** Decrement all timers by dt. Drop any that reach <= 0. */
  tick(dt: number): void {
    for (const [k, v] of this.t) {
      const nv = v - dt;
      if (nv <= 0) this.t.delete(k);
      else this.t.set(k, nv);
    }
  }

  /** Number of active (non-expired) timers. Useful for tests. */
  get size(): number {
    return this.t.size;
  }
}
