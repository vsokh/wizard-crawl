// ═══════════════════════════════════
//   ENEMY PROJECTILE POOL — Structure-of-Arrays
// ═══════════════════════════════════
//
// Stores enemy projectile data in contiguous typed arrays for cache locality.
// EProjView provides backward-compatible property access via getters/setters.
// Uses swap-and-pop release instead of splice for O(1) removal.

/** Minimal init shape accepted by EProjPool.add() / push() */
export interface EProjInit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  life: number;
  radius: number;
  color: string;
  _bounces: number;
}

// ── Typed-array helpers ──

function growFloat32(old: Float32Array, newCap: number): Float32Array {
  const a = new Float32Array(newCap);
  a.set(old);
  return a;
}

function growInt32(old: Int32Array, newCap: number): Int32Array {
  const a = new Int32Array(newCap);
  a.set(old);
  return a;
}

// ═══════════════════════════════════
//          EProjView
// ═══════════════════════════════════

/** A lightweight proxy that reads/writes a single slot in the EProjPool's typed arrays. */
export class EProjView {
  constructor(public _pool: EProjPool, public _idx: number) {}

  get x(): number { return this._pool.x[this._idx]; }
  set x(v: number) { this._pool.x[this._idx] = v; }

  get y(): number { return this._pool.y[this._idx]; }
  set y(v: number) { this._pool.y[this._idx] = v; }

  get vx(): number { return this._pool.vx[this._idx]; }
  set vx(v: number) { this._pool.vx[this._idx] = v; }

  get vy(): number { return this._pool.vy[this._idx]; }
  set vy(v: number) { this._pool.vy[this._idx] = v; }

  get dmg(): number { return this._pool.dmg[this._idx]; }
  set dmg(v: number) { this._pool.dmg[this._idx] = v; }

  get life(): number { return this._pool.life[this._idx]; }
  set life(v: number) { this._pool.life[this._idx] = v; }

  get radius(): number { return this._pool.radius[this._idx]; }
  set radius(v: number) { this._pool.radius[this._idx] = v; }

  get color(): string { return this._pool.color[this._idx]; }
  set color(v: string) { this._pool.color[this._idx] = v; }

  get _bounces(): number { return this._pool._bounces[this._idx]; }
  set _bounces(v: number) { this._pool._bounces[this._idx] = v; }
}

// ═══════════════════════════════════
//          EProjPool
// ═══════════════════════════════════

export class EProjPool {
  private _capacity: number;
  private _count: number = 0;

  // SoA typed arrays — Float32 for numeric fields
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  dmg: Float32Array;
  life: Float32Array;
  radius: Float32Array;

  // Int32 fields
  _bounces: Int32Array;

  // Regular arrays for string data
  color: string[];

  // Pre-allocated view pool
  private _views: (EProjView | undefined)[];

  constructor(capacity: number = 64) {
    this._capacity = capacity;
    const c = capacity;

    // Float32
    this.x = new Float32Array(c);
    this.y = new Float32Array(c);
    this.vx = new Float32Array(c);
    this.vy = new Float32Array(c);
    this.dmg = new Float32Array(c);
    this.life = new Float32Array(c);
    this.radius = new Float32Array(c);

    // Int32
    this._bounces = new Int32Array(c);

    // String arrays
    this.color = new Array(c).fill('');

    this._views = [];
  }

  /** Number of active projectiles. Compatible with array length reads. */
  get length(): number { return this._count; }

  /** Assignment to 0 clears the pool (for backward compat with `array.length = 0`). */
  set length(n: number) { if (n === 0) this.clear(); }

  /** Add a projectile from an EnemyProjectile-like object. Returns the EProjView. */
  add(proj: Partial<EProjInit> & { color: string }): EProjView {
    let idx = this._count;
    if (idx >= this._capacity) this._grow();
    this._count++;
    this._writeSlot(idx, proj);
    return this._getView(idx);
  }

  /** Release slot at index using swap-and-pop pattern. */
  release(idx: number): void {
    const last = this._count - 1;
    if (idx < last) {
      // Copy data from last slot to released slot
      // Float32
      this.x[idx] = this.x[last];
      this.y[idx] = this.y[last];
      this.vx[idx] = this.vx[last];
      this.vy[idx] = this.vy[last];
      this.dmg[idx] = this.dmg[last];
      this.life[idx] = this.life[last];
      this.radius[idx] = this.radius[last];
      // Int32
      this._bounces[idx] = this._bounces[last];
      // Strings
      this.color[idx] = this.color[last];
    }
    this._count--;
  }

  /** Remove all projectiles */
  clear(): void {
    this._count = 0;
  }

  /** Iterate over all active projectiles (yields EProjView). */
  *[Symbol.iterator](): Generator<EProjView> {
    for (let i = 0; i < this._count; i++) {
      yield this._getView(i);
    }
  }

  /** Get view at index. */
  at(idx: number): EProjView {
    return this._getView(idx);
  }

  /** Array-compatible filter method */
  filter(pred: (p: EProjView) => boolean): EProjView[] {
    const result: EProjView[] = [];
    for (let i = 0; i < this._count; i++) {
      const v = this._getView(i);
      if (pred(v)) result.push(v);
    }
    return result;
  }

  /** Array-compatible find method */
  find(pred: (p: EProjView) => boolean): EProjView | undefined {
    for (let i = 0; i < this._count; i++) {
      const v = this._getView(i);
      if (pred(v)) return v;
    }
    return undefined;
  }

  /** For compatibility with `state.eProj.push({...})` */
  push(...projs: any[]): number {
    for (const p of projs) this.add(p);
    return this._count;
  }

  // ── Private helpers ──

  private _getView(idx: number): EProjView {
    if (!this._views[idx]) {
      this._views[idx] = new EProjView(this, idx);
    }
    return this._views[idx]!;
  }

  private _writeSlot(idx: number, p: Partial<EProjInit> & { color: string }): void {
    // Float32 fields
    this.x[idx] = p.x ?? 0;
    this.y[idx] = p.y ?? 0;
    this.vx[idx] = p.vx ?? 0;
    this.vy[idx] = p.vy ?? 0;
    this.dmg[idx] = p.dmg ?? 0;
    this.life[idx] = p.life ?? 0;
    this.radius[idx] = p.radius ?? 0;
    // Int32 fields
    this._bounces[idx] = p._bounces ?? 0;
    // String fields
    this.color[idx] = p.color;
  }

  /** Grow capacity by doubling */
  private _grow(): void {
    const newCap = this._capacity * 2;

    // Float32
    this.x = growFloat32(this.x, newCap);
    this.y = growFloat32(this.y, newCap);
    this.vx = growFloat32(this.vx, newCap);
    this.vy = growFloat32(this.vy, newCap);
    this.dmg = growFloat32(this.dmg, newCap);
    this.life = growFloat32(this.life, newCap);
    this.radius = growFloat32(this.radius, newCap);

    // Int32
    this._bounces = growInt32(this._bounces, newCap);

    // String arrays
    while (this.color.length < newCap) this.color.push('');

    this._capacity = newCap;
  }
}
