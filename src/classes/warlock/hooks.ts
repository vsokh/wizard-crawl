import { registerClassHooks } from '../hooks';
import {
  clamp, dist, netSfx, shake, spawnParticles, spawnShockwave, spawnText, toWorld,
} from '../../state';
import { damageEnemy } from '../../systems/combat';
import { createFriendlyEnemy } from '../../systems/dungeon';
import { SfxName } from '../../types';
import { ROOM_WIDTH, ROOM_HEIGHT } from '../../constants';

// Curse stacking config
const MAX_STACKS = 10;
const VOODOO_MARK = { name: 'voodoo', duration: 6, maxStacks: MAX_STACKS, visual: '#cc55ee' } as const;

// Release Hex (RMB)
const RELEASE_RADIUS = 180;
const RELEASE_DMG_PER_STACK = 3;
const RELEASE_HEAL_PER_STACK = 1;

// Voodoo Totem (Q)
const TOTEM_LIFE = 5;
const TOTEM_HP = 10;
const TOTEM_RADIUS = 150;
const TOTEM_STACK_INTERVAL = 0.8;    // seconds between curse ticks
const TOTEM_HEAL_INTERVAL = 1.0;     // seconds between regen ticks
const TOTEM_HEAL_AMOUNT = 1;

// Summon the Loa (Space)
const LOA_LIFE = 10;
const LOA_HP = 60;
const LOA_RADIUS = 250;
const LOA_STACK_INTERVAL = 0.4;
const FINAL_DETONATE_DMG_PER_STACK = 5;
const FINAL_DETONATE_AOE = 80;

// Contagion (passive on kill)
const CONTAGION_RANGE = 120;

/** Apply/stack the voodoo mark directly without going through applyMarkToEnemy
 * (so we can stack custom amounts like totem-ticks). */
function stackVoodoo(e: any, ownerIdx: number, amount: number): void {
  if (e._markName === 'voodoo') {
    e._markStacks = Math.min(MAX_STACKS, e._markStacks + amount);
  } else {
    e._markName = 'voodoo';
    e._markStacks = Math.min(MAX_STACKS, amount);
    e._markOwner = ownerIdx;
  }
  e._markTimer = VOODOO_MARK.duration;
}

registerClassHooks('warlock', {
  // Hex Saturation augment: Hex Powder hits add an extra curse stack.
  // Runs on every enemy-damage by the warlock; only bumps stacks when the
  // voodoo mark is already present (skipping Release-Hex's clear-step).
  onDamageEnemy: (_state, p, e) => {
    if (!p.hexSaturation) return;
    if (e._markName !== 'voodoo' || e._markStacks <= 0) return;
    if (e._markStacks < MAX_STACKS) e._markStacks++;
  },

  // Passive — Voodoo Priest's Pact
  // (a) Blood Doll: damage you take mirrors to most-cursed enemy owned by you.
  onDamagePlayer: (state, p, dmg) => {
    let best: any = null;
    let bestStacks = 0;
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      if (e._markName !== 'voodoo') continue;
      if (e._markOwner !== p.idx) continue;
      if (e._markStacks > bestStacks) { bestStacks = e._markStacks; best = e; }
    }
    if (best) {
      damageEnemy(state, best, dmg, p.idx);
      spawnParticles(state, best.x, best.y, '#cc55ee', 6, 0.4);
      spawnText(state, best.x, best.y - 30, `-${dmg}`, '#cc55ee');
    }
  },

  // (b) Contagion: killing a cursed enemy spreads 1 stack to 2 nearest enemies.
  onKill: (state, p, e) => {
    if (e._markName !== 'voodoo' || e._markStacks <= 0) return;
    // Find 2 nearest non-cursed (or under-cap) enemies within range
    const candidates: Array<{ e: any; d: number }> = [];
    for (const o of state.enemies) {
      if (!o.alive || o._friendly || o === e) continue;
      const d = dist(e.x, e.y, o.x, o.y);
      if (d > CONTAGION_RANGE) continue;
      candidates.push({ e: o, d });
    }
    candidates.sort((a, b) => a.d - b.d);
    for (let i = 0; i < Math.min(2, candidates.length); i++) {
      const o = candidates[i].e;
      stackVoodoo(o, p.idx, 1);
      spawnParticles(state, o.x, o.y, '#cc55ee', 5, 0.35);
      // Visible tendril from dead enemy to new carrier
      spawnParticles(state, (e.x + o.x) / 2, (e.y + o.y) / 2, '#8833aa', 3, 0.3);
    }
  },

  // RMB Release Hex — detonate all cursed enemies near cursor, heal per stack
  castRMBAbility: (state, p) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const tx = clamp(wp.x, 0, ROOM_WIDTH);
    const ty = clamp(wp.y, 0, ROOM_HEIGHT);
    let totalHeal = 0;
    let detonated = 0;
    for (const e of state.enemies) {
      if (!e.alive || e._friendly) continue;
      if (e._markName !== 'voodoo' || e._markStacks <= 0) continue;
      if (dist(tx, ty, e.x, e.y) > RELEASE_RADIUS) continue;
      const stacks = e._markStacks;
      const dmg = stacks * RELEASE_DMG_PER_STACK;
      const healPerStack = RELEASE_HEAL_PER_STACK + (p.biggerDetonations ? 1 : 0);
      totalHeal += stacks * healPerStack;
      detonated++;
      // Detonation VFX
      spawnShockwave(state, e.x, e.y, 32 + stacks * 4, 'rgba(204,85,238,.55)');
      spawnParticles(state, e.x, e.y, '#cc55ee', 10 + stacks * 2, 0.7);
      // Splash hits nearby enemies + applies 1 stack for chain-setup
      const splashR = 50;
      for (const o of state.enemies) {
        if (!o.alive || o._friendly || o === e) continue;
        if (dist(e.x, e.y, o.x, o.y) > splashR) continue;
        stackVoodoo(o, p.idx, 1);
      }
      // Damage + clear mark
      damageEnemy(state, e, dmg, p.idx);
      e._markStacks = 0;
      e._markName = '';
      e._markTimer = 0;
    }
    if (detonated > 0) {
      p.hp = Math.min(p.maxHp, p.hp + totalHeal);
      spawnText(state, p.x, p.y - 20, `+${totalHeal} HP`, '#44ff88');
      spawnShockwave(state, tx, ty, RELEASE_RADIUS, 'rgba(170,60,210,.2)');
      shake(state, 4);
      netSfx(state, SfxName.Boom);
    } else {
      // Nothing to release — give a dud effect so it's obvious
      spawnText(state, tx, ty, 'NO CURSES', '#aa7788');
      spawnParticles(state, tx, ty, '#553366', 5, 0.4);
    }
    return true;
  },

  // Q Voodoo Totem — plant a fetish that pulses curses + regen
  castQAbility: (state, p) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const tx = clamp(wp.x, 30, ROOM_WIDTH - 30);
    const ty = clamp(wp.y, 30, ROOM_HEIGHT - 30);
    // Reuse the friendly-enemy slot as a stationary totem entity
    const totem = createFriendlyEnemy(state, tx, ty, p.idx);
    totem.type = '_totem';
    totem.hp = TOTEM_HP;
    totem.maxHp = TOTEM_HP;
    totem._lifespan = p.extendedRitual ? TOTEM_LIFE * 2 : TOTEM_LIFE;
    totem.vx = 0;
    totem.vy = 0;
    // Re-purpose unused timers as tick accumulators (avoid adding new fields)
    totem._burnTick = 0;         // curse tick accumulator
    totem._lmbHitTimer = 0;      // heal tick accumulator
    state.enemies.push(totem);
    spawnShockwave(state, tx, ty, 32, 'rgba(136,51,170,.6)');
    spawnParticles(state, tx, ty, '#8833aa', 15, 0.6);
    spawnText(state, tx, ty - 30, 'TOTEM', '#cc55ee');
    netSfx(state, SfxName.Arcane);
    return true;
  },

  // Space Summon the Loa — giant spirit with massive curse aura; detonates all on expire
  castUltimate: (state, p) => {
    const wp = toWorld(state, state.mouseX, state.mouseY);
    const tx = clamp(wp.x, 40, ROOM_WIDTH - 40);
    const ty = clamp(wp.y, 40, ROOM_HEIGHT - 40);
    const loa = createFriendlyEnemy(state, tx, ty, p.idx);
    loa.type = '_loa';
    loa.hp = LOA_HP;
    loa.maxHp = LOA_HP;
    loa._lifespan = LOA_LIFE;
    loa.vx = 0;
    loa.vy = 0;
    loa._burnTick = 0;
    state.enemies.push(loa);
    spawnShockwave(state, tx, ty, 100, 'rgba(102,34,136,.55)');
    spawnShockwave(state, tx, ty, LOA_RADIUS, 'rgba(204,85,238,.25)');
    spawnParticles(state, tx, ty, '#cc55ee', 30, 0.9);
    spawnText(state, tx, ty - 60, 'LOA ARISES', '#cc55ee');
    netSfx(state, SfxName.Boom);
    shake(state, 7);
    return true;
  },

  // Per-tick: totem + Loa aura pulses, Loa final detonation
  onTick: (state, p, dt) => {
    const pIdx = p.idx;
    for (const ent of state.enemies) {
      if (!ent.alive || !ent._friendly || ent._owner !== pIdx) continue;

      if (ent.type === '_totem') {
        const totemR = p.extendedRitual ? TOTEM_RADIUS + 40 : TOTEM_RADIUS;
        // Curse tick
        ent._burnTick = (ent._burnTick || 0) + dt;
        if (ent._burnTick >= TOTEM_STACK_INTERVAL) {
          ent._burnTick -= TOTEM_STACK_INTERVAL;
          for (const o of state.enemies) {
            if (!o.alive || o._friendly) continue;
            if (dist(ent.x, ent.y, o.x, o.y) > totemR) continue;
            stackVoodoo(o, pIdx, 1);
            spawnParticles(state, o.x, o.y, '#cc55ee', 2, 0.25);
          }
          spawnShockwave(state, ent.x, ent.y, totemR * 0.3, 'rgba(204,85,238,.2)');
        }
        // Heal tick for player
        ent._lmbHitTimer = (ent._lmbHitTimer || 0) + dt;
        if (ent._lmbHitTimer >= TOTEM_HEAL_INTERVAL) {
          ent._lmbHitTimer -= TOTEM_HEAL_INTERVAL;
          if (dist(ent.x, ent.y, p.x, p.y) < totemR && p.hp < p.maxHp) {
            p.hp = Math.min(p.maxHp, p.hp + TOTEM_HEAL_AMOUNT);
            spawnParticles(state, p.x, p.y, '#44ff88', 3, 0.3);
          }
        }
      } else if (ent.type === '_loa') {
        // Curse aura
        ent._burnTick = (ent._burnTick || 0) + dt;
        if (ent._burnTick >= LOA_STACK_INTERVAL) {
          ent._burnTick -= LOA_STACK_INTERVAL;
          for (const o of state.enemies) {
            if (!o.alive || o._friendly) continue;
            if (dist(ent.x, ent.y, o.x, o.y) > LOA_RADIUS) continue;
            stackVoodoo(o, pIdx, 1);
            spawnParticles(state, o.x, o.y, '#cc55ee', 2, 0.2);
          }
        }
        // On expire: detonate every cursed enemy on the map
        if (ent._lifespan <= dt) {
          // Snapshot Loa position before it dies so we can spawn the final shockwave
          const lx = ent.x, ly = ent.y;
          setTimeout(() => {
            for (const o of state.enemies) {
              if (!o.alive || o._friendly) continue;
              if (o._markName !== 'voodoo' || o._markStacks <= 0) continue;
              const stacks = o._markStacks;
              const dmg = stacks * FINAL_DETONATE_DMG_PER_STACK;
              spawnShockwave(state, o.x, o.y, FINAL_DETONATE_AOE, 'rgba(204,85,238,.5)');
              spawnParticles(state, o.x, o.y, '#cc55ee', 12 + stacks, 0.8);
              // Splash damage
              for (const o2 of state.enemies) {
                if (!o2.alive || o2._friendly || o2 === o) continue;
                if (dist(o.x, o.y, o2.x, o2.y) > FINAL_DETONATE_AOE) continue;
                damageEnemy(state, o2, Math.ceil(dmg * 0.5), pIdx);
              }
              damageEnemy(state, o, dmg, pIdx);
              o._markStacks = 0; o._markName = ''; o._markTimer = 0;
            }
            spawnShockwave(state, lx, ly, LOA_RADIUS, 'rgba(170,60,210,.35)');
            shake(state, 12);
            netSfx(state, SfxName.Boom);
          }, 0);
        }
      }
    }
  },
});
