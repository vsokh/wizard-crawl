# Anti-Kiting Combat Mechanics — Design Specification

## Executive Summary

Spellstorm's 14 wizard classes converge on a single dominant strategy: circle-kite at maximum range while holding LMB and pressing Space (ultimate) on cooldown. This happens because all spells are instant-cast with zero movement penalty, all classes share identical base stats (8 HP, 100 mana, 190 move speed), and 10 of 14 classes fire projectiles as their primary attack. There are no attack commitments, no recovery frames, and no mechanical reason to stand still or engage at close range.

This document specifies 8 new combat mechanics designed to break the circle-kiting meta by forcing different engagement patterns. Each mechanic introduces a fundamentally different relationship between the player's position, timing, and damage output. The mechanics are designed to layer onto existing classes and serve as core identities for new ones.

The expected outcome: after implementing these mechanics, at least 6 distinct playstyles should emerge across the roster — ranged kiters, channeling artillery, melee combo fighters, stance-switching hybrids, tether-range brawlers, and zone-anchored controllers.

## Design Principles

### What makes a good anti-kiting mechanic

1. **Reward, not punishment.** Players should WANT to stop kiting because the alternative is more powerful, not because kiting is nerfed. A charge-up shot that deals 4x damage is better than a movement speed nerf.
2. **Commitment windows.** The mechanic should create moments where the player voluntarily gives up mobility in exchange for power. These windows should be 0.5-3 seconds — long enough to feel like a decision, short enough to not feel like paralysis.
3. **Distinct spatial patterns.** Each mechanic should produce a visibly different movement pattern on the screen. Tether players orbit enemies at close range. Channelers find safe spots and hunker down. Combo players dash through waves.
4. **Compatible with co-op.** The mechanic should create interesting team dynamics. A channeling player needs their ally to protect them. A tether player wants to be near their ally for empowerment.

### What makes a bad anti-kiting mechanic

1. **Forced immobility without reward.** Stunning the player or reducing movement speed without a power payoff just feels bad.
2. **Removing player agency.** Mechanics that play themselves (auto-targeting, passive auras with no interaction) don't create new playstyles.
3. **Complexity without depth.** A 5-element cycling system that functions identically to a projectile isn't anti-kiting — it's visual noise.

---

## Mechanic 1: Channeled Casting

### Overview

Channeled abilities require the player to hold the cast key for a duration. During the channel, the player's movement speed is reduced (or zeroed) and the ability's power scales with channel time. Interrupting the channel early fires a weaker version. Taking damage above a threshold can break the channel.

This directly opposes kiting by making the player's strongest abilities require standing still.

### Type System Changes

**New SpellDef fields:**
```typescript
// Add to SpellDef interface in types.ts
channel?: number;        // Channel duration in seconds (0.5-4.0)
channelSlow?: number;    // Movement speed multiplier while channeling (0-1.0, where 0 = rooted)
channelScale?: number;   // Damage multiplier at full channel (1.0-4.0). Linear interpolation from 1.0x at 0s to channelScale at full channel
channelTicks?: number;   // For sustained channels: number of damage ticks during the channel (e.g., 4 ticks over 4s)
channelBreak?: number;   // Damage threshold to break channel (0 = unbreakable). Single hit exceeding this value interrupts.
```

**New Player fields:**
```typescript
// Add to Player interface in types.ts
channeling?: boolean;      // Currently channeling an ability
channelTimer?: number;     // Time spent channeling (0 to spell.channel)
channelSlot?: number;      // Which spell slot is being channeled (0-3)
channelAngle?: number;     // Locked aim angle at channel start (for directed channels)
```

**SpellType additions:**
```typescript
// No new SpellType needed — channel is a modifier on existing types.
// A channeled Projectile charges up and fires on release.
// A channeled Beam sustains while held.
// A channeled Zone grows in radius during the channel.
```

### System Changes

**`src/systems/combat.ts` — castSpell():**
- If `spell.channel` is set, instead of immediately executing, set `p.channeling = true`, `p.channelTimer = 0`, `p.channelSlot = idx`
- Each frame: increment `channelTimer` by `dt` while the cast key is held
- On key release OR `channelTimer >= spell.channel`: execute the spell with damage scaled by `1 + (channelScale - 1) * (channelTimer / spell.channel)`
- Deduct mana at channel START (prevents free cancels)

**`src/systems/physics.ts` — player movement:**
- If `p.channeling && spell.channelSlow !== undefined`: multiply move speed by `channelSlow`
- If `channelSlow === 0`: zero out velocity completely (rooted)

**`src/systems/enemy-attack-system.ts` — damage to player:**
- On player taking damage: if `p.channeling && spell.channelBreak > 0 && dmg >= spell.channelBreak`: set `p.channeling = false`, refund 50% of remaining channel time as reduced cooldown

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| channel | 0.5 — 3.0s | <0.5 feels instant; >3.0 is death sentence at higher waves |
| channelSlow | 0.0 — 0.6 | 0.0 = rooted (ultimates only); 0.4-0.6 = can crawl while charging |
| channelScale | 1.5 — 4.0 | Must exceed the DPS lost from not moving. 2.0x minimum for it to feel worth it |
| channelBreak | 2 — 4 | Below base enemy damage (1-2) means channels never complete; 3+ means only big hits break |
| channelTicks | 2 — 8 | For sustained channels like beams/drains |

### Class Applications

**Existing classes to retrofit:**
- **Stormcaller** — LMB Lightning Beam becomes a sustained channel. Hold LMB to maintain the beam; damage ticks at 2x per tick while channeling. Movement at 0.5x speed. This changes Stormcaller from "tap LMB while kiting" to "find a safe angle and hold the beam."
- **Berserker** — Ultimate (Blood Rage) becomes a 1.5s channel wind-up. During the wind-up, the Berserker glows red and enemies in range are pulled slightly toward them. On completion, Blood Rage activates with +50% damage bonus (up from base). If broken, Blood Rage activates at half duration.

**New class identity:**
- **Cannoneer** — Core identity is charge-up primary (see Mechanic 2) + channeled ultimate (4s root, 4 long-range sniper shots).

### Upgrade Interactions

- **Unshakeable (new upgrade):** `channelBreak` threshold increased by +2 per stack. Max 3 stacks. Makes channels harder to interrupt.
- **Quick Channel (new upgrade):** Channel time reduced by 15% per stack (hyperbolic scaling). Max 3 stacks. At 3 stacks: 37% reduction.
- **Existing "Swift Cast":** Should also reduce channel time by 10% to maintain relevance.

### Example: Stormcaller with Channeled LMB

```typescript
{
  name: 'Lightning Beam',
  key: 'LMB',
  type: SpellType.Beam,
  dmg: 1.5,      // base damage per tick
  range: 320,
  width: 8,
  mana: 7,
  cd: 0.28,       // cd between channel starts
  life: 0,
  // NEW channel fields:
  channel: 1.5,       // 1.5s max channel
  channelSlow: 0.5,   // 50% move speed while channeling
  channelScale: 2.5,  // At full channel: 3.75 dmg per tick
  channelTicks: 5,    // 5 ticks over 1.5s = tick every 0.3s
  channelBreak: 3,    // Only hits of 3+ break the channel
}
```

---

## Mechanic 2: Charge-Up System

### Overview

Charge-up abilities are a specific type of channel where the player holds a button to build power, then releases to fire. Unlike sustained channels (which deal damage during the channel), charge-ups deal all damage on release. The longer the charge, the more powerful the shot — but movement is penalized during the charge.

This is the most natural anti-kiting mechanic: it directly converts standing-still time into damage.

### Type System Changes

**New SpellDef fields:**
```typescript
// Add to SpellDef interface in types.ts
chargeTime?: number;       // Max charge duration in seconds (0.5-2.5)
chargeSlow?: number;       // Movement speed multiplier while charging (0.3-0.8)
chargeMinDmg?: number;     // Damage at 0 charge (tap-fire). Defaults to dmg * 0.3
chargeMaxDmg?: number;     // Damage at full charge. Defaults to dmg * channelScale (or dmg * 3 if no channelScale)
chargePierce?: number;     // At full charge, projectile gains this many pierce
chargeRadius?: number;     // At full charge, explosion/aoe gains this much extra radius
```

**New Player fields:**
```typescript
// Reuses channeling/channelTimer from Mechanic 1
// Additional:
chargeLevel?: number;      // 0.0-1.0, computed as channelTimer / spell.chargeTime. Used by rendering for visual indicator.
```

### System Changes

**`src/systems/combat.ts` — castSpell():**
- If `spell.chargeTime` is set: begin charge on key press (set `p.channeling = true`, `p.channelTimer = 0`)
- Each frame: increment `channelTimer`, compute `chargeLevel = clamp(channelTimer / chargeTime, 0, 1)`
- On key RELEASE: fire spell with damage = `lerp(chargeMinDmg, chargeMaxDmg, chargeLevel)`
- If `chargePierce`: add `floor(chargePierce * chargeLevel)` pierce at release
- If `chargeRadius`: add `chargeRadius * chargeLevel` to explosion radius

**`src/rendering/` — charge indicator:**
- When `p.channeling && p.chargeLevel > 0`: draw a growing circle/arc around the player showing charge level
- Color transitions: white (0%) -> yellow (50%) -> orange (80%) -> red pulse (100%)

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| chargeTime | 0.5 — 2.0s | Primary attacks: 0.5-1.0s. Abilities: 1.0-2.0s. Ultimates: use channel instead |
| chargeSlow | 0.3 — 0.7 | Lower than channelSlow since charge-up has a release payoff |
| chargeMinDmg | 0.3x — 0.5x of base dmg | Tap-fire should feel weak but not useless |
| chargeMaxDmg | 2.5x — 4.0x of base dmg | Must feel dramatically stronger than tap-fire |
| chargePierce | 1 — 3 | Full-charge shots punching through lines is satisfying |

### Class Applications

**Existing classes to retrofit:**
- **Ranger** — LMB Power Shot gains charge-up. Tap for 1.0 dmg quick shot. Hold 1.2s for 4.5 dmg piercing sniper shot. Move at 0.5x while charging. This changes Ranger from "machine gun while running" to "find an angle, charge, release, reposition."
- **Warlock** — RMB Shadow Bolt gains a 0.8s charge for 2x damage + AOE explosion. Since Warlock already has highest base RMB damage (3), a charged Shadow Bolt at 6 dmg with an explosion is devastating but requires commitment.

**New class identity:**
- **Cannoneer** (see Section 3 of LoL research) — LMB is a charge-up power shot with a 4-shot ammo magazine (see Mechanic 7). The 4th shot always deals 1.5x regardless of charge.

### Upgrade Interactions

- **Overcharge (new upgrade):** Allows charging past 100% for 0.5s additional time. Overcharged shots gain +1 pierce and visual particle burst. Mana cost increases by 50% for overcharged shots.
- **Steady Aim (new upgrade):** `chargeSlow` increased by 0.15 per stack (you can move faster while charging). Max 3 stacks.
- **Existing "Velocity":** Should increase projectile speed of charged shots by an additional 20% at full charge.

### Example: Ranger with Charge-Up LMB

```typescript
{
  name: 'Power Shot',
  key: 'LMB',
  type: SpellType.Projectile,
  dmg: 1.5,           // base (used for chargeMaxDmg calculation)
  speed: 600,
  radius: 5,
  mana: 4,
  cd: 0.8,            // longer cd to account for charge time
  life: 1.0,
  // NEW charge fields:
  chargeTime: 1.2,     // 1.2s max charge
  chargeSlow: 0.5,     // 50% move speed while charging
  chargeMinDmg: 0.5,   // tap-fire: 0.5 dmg (weak)
  chargeMaxDmg: 4.5,   // full charge: 4.5 dmg (devastating)
  chargePierce: 2,     // full charge pierces 2 enemies
}
```

---

## Mechanic 3: Combo Chains

### Overview

Combo chains turn the primary attack (LMB) from a single repeating action into a sequence of 2-4 distinct attacks. Each press advances the combo. The final hit in the sequence is significantly more powerful. The combo resets if the player doesn't press LMB within a timeout window (1.5-2.0s).

This breaks kiting because maintaining a combo requires staying in attack range. Running away resets the combo, forfeiting the powerful finisher.

### Type System Changes

**New SpellDef fields:**
```typescript
// Add to SpellDef interface in types.ts
comboStep?: number;         // Which step this spell is in a combo (1, 2, 3, 4)
comboTotal?: number;        // Total steps in the combo chain
comboTimeout?: number;      // Seconds before combo resets (1.0-2.5)
comboNext?: SpellDefInput;  // The next spell in the combo chain (inline definition)
```

**New Player fields:**
```typescript
// Add to Player interface in types.ts
comboCount?: number;        // Current combo step (0 = no combo active)
comboTimer?: number;        // Time since last combo hit (resets combo at comboTimeout)
```

**Alternative approach (simpler):** Instead of linked SpellDefs, define the combo as an array of modifiers on the base spell:
```typescript
combo?: {
  steps: number;          // Total combo hits (2-4)
  timeout: number;        // Reset window (seconds)
  dmgScale: number[];     // Damage multiplier per step: [1.0, 1.2, 2.5]
  effects: {              // Per-step bonus effects
    [step: number]: { stun?: number; aoeR?: number; slow?: number; knockback?: number }
  }
}
```

### System Changes

**`src/systems/combat.ts` — castSpell():**
- If spell has `combo`: on LMB press, increment `p.comboCount`
- Apply `combo.dmgScale[p.comboCount - 1]` to damage
- Apply `combo.effects[p.comboCount]` if present
- If `p.comboCount >= combo.steps`: reset to 0 after firing (combo complete)
- Set `p.comboTimer = 0` on each hit

**`src/systems/physics.ts` — player update:**
- Each frame: increment `p.comboTimer` by `dt`
- If `p.comboTimer >= combo.timeout`: reset `p.comboCount = 0`

**`src/rendering/` — combo indicator:**
- Show combo step number (1, 2, 3) near the player
- Final step indicator: flash/glow effect
- Combo timer: shrinking arc showing remaining time

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| steps | 2 — 4 | 2 = simple rhythm, 3 = sweet spot for complexity, 4 = expert |
| timeout | 1.5 — 2.5s | Must be short enough that kiting away resets it, long enough for repositioning between hits |
| dmgScale step 1 | 0.8x — 1.0x | Early hits slightly weaker than non-combo baseline |
| dmgScale step 2 | 1.0x — 1.5x | Middle hits at baseline or slightly above |
| dmgScale final | 2.0x — 3.5x | Final hit is THE payoff. Must dramatically exceed single-hit DPS |
| Final step bonus | stun 0.5s OR aoeR 60 OR knockback | The finisher should feel special beyond just damage |

### Class Applications

**Existing classes to retrofit:**
- **Monk** — LMB Chi Blast becomes a 3-hit combo: Jab (0.8 dmg cone), Cross (1.2 dmg wider cone), Palm Strike (2.5 dmg + stun 0.5s + knockback). Timeout 1.5s. This transforms Monk from "spam fastest LMB" to "maintain combo rhythm for devastating palm strikes."
- **Berserker** — LMB War Cry becomes a 3-hit melee combo: Slash (2.5 dmg), Uppercut (3.0 dmg + small knockup), Slam (5.0 dmg + AOE 50 radius). Timeout 2.0s. Berserker's melee identity is reinforced with a committal finisher.
- **Knight** — RMB Shield Bash becomes a 2-hit combo: Bash (1.5 dmg + slow 0.5), Thrust (3.0 dmg + stun 1.0s). Timeout 2.0s. Creates a "set up the stun" pattern.

**New class identity:**
- **Bladecaller** — Entire kit revolves around combos. LMB is a 4-hit chain with the 4th hit being an AOE execution. RMB dash resets on kills. Q throws a blade to dash to. The rhythm of combo-dash-combo-dash creates a through-the-wave movement pattern that's the opposite of circle kiting.

### Upgrade Interactions

- **Combo Extender (new upgrade):** Adds +1 combo step. The new step copies the final step's damage at 0.7x. Max 1 stack. A 3-hit combo becomes 4-hit.
- **Combo Memory (new upgrade):** Combo timeout increased by +0.5s per stack. Max 2 stacks. More time to reposition between hits.
- **Existing "Spell Weaving":** Should grant +10% damage per combo step maintained (stacks with combo dmgScale).

### Example: Monk with 3-Hit LMB Combo

```typescript
{
  name: 'Chi Combo',
  key: 'LMB',
  type: SpellType.Cone,
  dmg: 1.0,            // base damage (modified by combo scale)
  range: 60,
  angle: 1.2,
  mana: 3,
  cd: 0.2,             // fast rhythm between hits
  life: 0,
  // NEW combo fields:
  combo: {
    steps: 3,
    timeout: 1.5,
    dmgScale: [0.8, 1.2, 2.5],
    effects: {
      3: { stun: 0.5, aoeR: 40 }  // 3rd hit stuns and has AOE
    }
  }
}
```

---

## Mechanic 4: Stance Switching

### Overview

Stance switching gives a class two complete spell sets (forms) that the player toggles between. Each form has different LMB, RMB, and Q abilities with different optimal engagement ranges. The Ultimate key switches forms instead of being a traditional ultimate (or the ultimate is shared across forms).

This breaks kiting because each form demands a different spatial pattern. A ranged form kites; a melee form dives. The player alternates between the two, creating a push-pull rhythm.

### Type System Changes

**New ClassDefInput fields:**
```typescript
// Add to ClassDefInput in constants.ts
stanceForms?: {
  formA: {
    name: string;             // e.g., "Caster Form"
    spells: SpellDefInput[];  // [LMB, RMB, Q] for this form (3 spells, not 4)
    passive?: ClassPassive;   // Form-specific passive (optional)
    moveSpeed?: number;       // Override base moveSpeed in this form
    color?: string;           // Player color changes with form
  };
  formB: {
    name: string;             // e.g., "Blade Form"
    spells: SpellDefInput[];
    passive?: ClassPassive;
    moveSpeed?: number;
    color?: string;
  };
  switchCd: number;           // Cooldown between form switches (2-5 seconds)
  switchBuff?: {              // Buff granted on form switch
    duration: number;         // seconds
    dmgMult?: number;         // damage multiplier during buff
    armor?: number;           // damage reduction during buff
  };
}
```

**New Player fields:**
```typescript
// Add to Player interface in types.ts
currentForm?: 'A' | 'B';       // Current active form
formSwitchCd?: number;         // Remaining cooldown on form switch
formSwitchBuff?: number;       // Remaining duration of switch buff
```

### System Changes

**`src/systems/combat.ts` — spell resolution:**
- When player has `stanceForms`: use `stanceForms.formA.spells` or `formB.spells` based on `p.currentForm`
- Ultimate key (Space) triggers form switch instead of casting a spell
- On switch: set `formSwitchCd = switchCd`, apply `switchBuff` if defined
- Cooldowns are PER-SLOT, shared across forms (slot 0 CD carries over on switch)

**`src/systems/physics.ts` — movement:**
- If form has `moveSpeed` override: use that instead of base 190

**`src/rendering/` — form indicators:**
- Player color changes between forms
- Switch animation: brief particle burst
- Form indicator icon near player

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| switchCd | 2.5 — 5.0s | Short enough to switch reactively, long enough to prevent spam-toggling |
| switchBuff duration | 1.0 — 2.0s | Brief reward window after switching |
| switchBuff dmgMult | 1.3 — 1.5x | Meaningful but not overwhelming |
| Ranged form moveSpeed | 190 — 210 | Slightly faster for kiting |
| Melee form moveSpeed | 170 — 190 | Slightly slower, compensated by gap-closer |
| Melee form dmg | 1.5x — 2.0x of ranged | Melee risk must be rewarded with higher damage |

### Class Applications

**Existing classes to retrofit:**
- **Necromancer** — Form A: "Shadow Mage" (ranged drain bolts, summon minion). Form B: "Death Knight" (melee drain cone, empowered minions, lifesteal). Switch CD 4s. This splits Necro's identity into a ranged summoner phase and a melee sustain phase.

**New class identity:**
- **Hexblade** — Form A: "Caster" (Arcane bolts, Hex Curse mark, debuff zone). Form B: "Blade" (melee cone, leap, spinning nova). Switching grants 1s of 50% DR. First ability after switch is empowered (2x). The optimal pattern is: mark targets in caster form, switch to blade, leap to marked targets for massive burst, switch back.

### Upgrade Interactions

- **Fluid Forms (new upgrade):** Switch cooldown reduced by 20% per stack. Max 3 stacks.
- **Lingering Power (new upgrade):** Switch buff duration +1.0s per stack. Max 2 stacks.
- **Existing class-specific upgrades:** Should specify which form they apply to, or apply to both.

### Example: Hexblade Full Kit

```typescript
{
  name: 'Hexblade',
  color: '#7B2D8E',
  glow: '#A855F7',
  desc: 'Stance-switching hybrid — ranged marks, melee executions',
  passive: { hexMastery: true },  // NEW passive type
  stanceForms: {
    formA: {
      name: 'Caster',
      color: '#A855F7',
      moveSpeed: 200,
      spells: [
        { name: 'Arcane Bolt', key: 'LMB', type: 'projectile', dmg: 1.5, speed: 420, radius: 5, mana: 6, cd: 0.3, life: 0.8, homing: 0.8 },
        { name: 'Hex Curse', key: 'RMB', type: 'projectile', dmg: 0.5, speed: 500, radius: 6, mana: 12, cd: 3.0, life: 0.6, mark: 3.0, markMult: 3.0 },
        { name: 'Void Zone', key: 'Q', type: 'zone', dmg: 1, radius: 70, mana: 20, cd: 6, duration: 3, tickRate: 0.5, slow: 0.6 },
      ]
    },
    formB: {
      name: 'Blade',
      color: '#DC2626',
      moveSpeed: 175,
      spells: [
        { name: 'Hex Slash', key: 'LMB', type: 'cone', dmg: 2.5, range: 55, angle: 1.5, mana: 2, cd: 0.25, life: 0 },
        { name: 'Shadow Leap', key: 'RMB', type: 'leap', dmg: 2, aoeR: 50, mana: 15, cd: 4, life: 0 },
        { name: 'Whirlwind', key: 'Q', type: 'nova', dmg: 3, radius: 60, mana: 18, cd: 5, life: 0 },
      ]
    },
    switchCd: 3.5,
    switchBuff: { duration: 1.0, dmgMult: 1.5, armor: 2 }
  },
  spells: []  // Empty — spells come from stanceForms
}
```

---

## Mechanic 5: Tether Mechanics

### Overview

Tether abilities create a persistent connection between the player and a target (enemy or ally). The tether provides continuous effects (damage, healing, CC) as long as both entities remain within tether range. Moving out of range breaks the tether, wasting the ability.

This is one of the strongest anti-kiting mechanics because it explicitly requires maintaining proximity to an enemy. The player must stay dangerously close for the payoff.

### Type System Changes

**New SpellType value:**
```typescript
// Add to SpellType enum in types.ts
Tether = 'tether',    // sustained connection to target
```

**New SpellDef fields:**
```typescript
// Add to SpellDef interface in types.ts
tetherRange?: number;       // Maximum tether range (100-300 units). Beyond this, tether breaks.
tetherDmg?: number;         // Damage per tick while tethered
tetherHeal?: number;        // Healing per tick while tethered (for drain tethers)
tetherTickRate?: number;    // Tick interval in seconds (0.2-0.5)
tetherDuration?: number;    // Max tether duration (2-6 seconds)
tetherReward?: {            // Bonus for maintaining tether for full duration
  stun?: number;            // Stun the target
  dmgBurst?: number;        // Burst damage on completion
  healBurst?: number;       // Burst heal on completion
  slow?: number;            // Apply slow on completion
}
```

**New Player fields:**
```typescript
// Add to Player interface in types.ts
tetheredTo?: number;         // Entity ID of tethered target (-1 = none)
tetherTimer?: number;        // Time remaining on tether
tetherSpellIdx?: number;     // Which spell slot created the tether
```

### System Changes

**`src/systems/combat.ts` — castSpell():**
- For `SpellType.Tether`: find nearest enemy within `tetherRange`. If found, set `p.tetheredTo = enemyId`, `p.tetherTimer = tetherDuration`
- If no enemy in range: spell fizzles, refund 50% mana

**New system: `src/systems/tether-system.ts`** (priority 25, after spells, before AOE):
- Each frame for each player with active tether:
  - Calculate distance to tethered target
  - If distance > `tetherRange`: break tether, no reward
  - If target is dead: break tether, partial reward (50% of completion reward)
  - Apply `tetherDmg` and `tetherHeal` per tick (based on `tetherTickRate`)
  - Decrement `tetherTimer` by `dt`
  - If `tetherTimer <= 0`: apply `tetherReward`, break tether

**`src/rendering/` — tether visuals:**
- Draw a pulsing line between player and tethered target
- Line color: red for damage tethers, green for drain tethers, blue for CC tethers
- Line opacity decreases as tether nears break range
- Completion reward: particle burst at both ends

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| tetherRange | 120 — 250 | 120 = melee-adjacent, extremely dangerous. 250 = medium range, manageable |
| tetherDmg | 1.0 — 3.0 per tick | Total DPS should exceed LMB DPS to justify the risk |
| tetherHeal | 0.5 — 2.0 per tick | Sustain reward for staying close |
| tetherTickRate | 0.25 — 0.5s | Fast enough to feel continuous |
| tetherDuration | 2.0 — 5.0s | 2s = quick commitment, 5s = all-in |
| tetherReward stun | 1.0 — 2.5s | The completion reward must feel like a huge payoff |
| Mana cost | 15 — 30 | High cost since the ability is sustained value |

### Class Applications

**Existing classes to retrofit:**
- **Necromancer** — RMB Death Coil gains a tether variant: `Life Siphon` (tether range 180, 1.5 dmg/tick, 1.0 heal/tick, 3s duration, reward: 3 dmg burst + 2 HP heal). Replaces the single-hit drain with a sustained drain that requires staying close.
- **Chronomancer** — Q Time Lock gains a tether: tether range 200, 0 dmg/tick, 4s duration, reward: target stunned 2.5s + all enemies within 100 units slowed 50% for 3s. Chronomancer must maintain proximity to a single target for a massive CC payoff.

**New class identity:**
- **Graviturge** — Core identity is proximity damage aura + tether drain. RMB toggles a damage aura (zone). Q is a tether (range 200, 2 dps, 1 hp/s heal, 3s, reward: 2s stun). Ultimate tethers ALL enemies within 200 for 2s then stuns all.
- **Soulbinder** — RMB is a tether (range 250, slow 30%, 2s, reward: root 1.5s). LMB marks enemies. Q empowers ally. The tether-heavy kit forces close engagement.

### Upgrade Interactions

- **Iron Tether (new upgrade):** Tether range increased by +30 per stack. Max 3 stacks. More forgiving range.
- **Leech (new upgrade):** Tether healing increased by +0.5/tick per stack. Max 3 stacks. Sustain reward.
- **Existing "Vampirism":** Should also increase tether heal by 25%.

### Example: Graviturge Q — Event Horizon Tether

```typescript
{
  name: 'Event Horizon',
  key: 'Q',
  type: SpellType.Tether,
  dmg: 0,              // tether dmg handled separately
  mana: 22,
  cd: 8,
  life: 0,
  // NEW tether fields:
  tetherRange: 200,
  tetherDmg: 2.0,
  tetherHeal: 1.0,
  tetherTickRate: 0.3,
  tetherDuration: 3.0,
  tetherReward: {
    stun: 2.0,
    dmgBurst: 3.0,
    healBurst: 2.0,
  }
}
```

---

## Mechanic 6: Positional Bonuses

### Overview

Positional bonuses make the angle of attack matter. Hitting enemies from certain directions (behind, from the side, near a pillar, at close range) grants bonus damage or effects. This breaks kiting because optimal kiting creates a fixed spatial relationship (enemy chasing from behind), while positional bonuses reward approaching from specific angles.

### Type System Changes

**New ClassPassive fields:**
```typescript
// Add to ClassPassive in types.ts
backstab?: number;          // Bonus damage multiplier for hitting from behind (1.3-2.0)
proximityBonus?: {          // Damage bonus at close range
  range: number;            // Maximum range for bonus (60-120 units)
  dmgMult: number;          // Damage multiplier (1.2-1.5)
  aura?: number;            // Passive damage per second to enemies in range
};
flanking?: {                // Bonus for hitting from perpendicular angle
  angleTolerance: number;   // Radians of arc that counts as "flank" (0.3-0.8)
  dmgMult: number;          // Damage multiplier (1.3-1.8)
};
```

**New SpellDef fields:**
```typescript
// Add to SpellDef interface in types.ts
positionBonus?: {
  type: 'backstab' | 'proximity' | 'flanking' | 'pillar';
  mult: number;             // Damage multiplier when condition met
  range?: number;           // For proximity: max range
  pillarRange?: number;     // For pillar: max distance from nearest pillar
}
```

### System Changes

**`src/systems/combat.ts` — damage calculation:**
- On spell hit, calculate angle between spell travel direction and enemy facing direction
- **Backstab:** If `abs(angleDiff) < PI/4` (hitting from behind): apply `backstab` multiplier
- **Flanking:** If `abs(angleDiff - PI/2) < flanking.angleTolerance` (hitting from side): apply `flanking.dmgMult`
- **Proximity:** If distance between player and target < `proximityBonus.range`: apply `proximityBonus.dmgMult`
- **Pillar:** If nearest pillar is within `pillarRange` of target: apply `pillar.mult`

**Enemy facing direction:** Enemies already have `vx`/`vy` velocity. Facing = `atan2(vy, vx)`. For stationary enemies, use the angle toward their target player.

**`src/rendering/` — positional indicators:**
- Backstab: show a small directional arrow on enemies indicating their "back"
- Proximity: show a faint ring at `proximityBonus.range` around the player
- Pillar bonus: pillars glow faintly when a player with pillar bonus is nearby

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| backstab mult | 1.5x — 2.0x | Must be large enough to change behavior, not just a nice bonus |
| backstab angle | PI/4 (45 deg) | Generous enough to be achievable in real-time |
| proximity range | 60 — 120 units | 60 = melee adjacent, 120 = close but not suicidal |
| proximity dmgMult | 1.25x — 1.5x | Moderate reward — stacks with other multipliers |
| proximity aura | 0.5 — 1.5 dps | Passive damage for being close. Must be meaningful at wave 1, not trivial at wave 10 |
| flanking mult | 1.3x — 1.8x | Slightly less than backstab since flanking is easier |
| pillar range | 80 — 150 units | Forces fights near geometry |

### Class Applications

**Existing classes to retrofit:**
- **Berserker** — Add `proximityBonus: { range: 80, dmgMult: 1.3, aura: 1.0 }` to passive. Berserker already wants to be in melee; this rewards it with passive AOE damage and a multiplier.
- **Monk** — Add `backstab: 1.5` to passive. Monk's fast movement and dodge support repositioning behind enemies. The dodge chance (25%) makes close-range less risky.
- **Ranger** — Add individual spell `positionBonus: { type: 'pillar', mult: 1.5, pillarRange: 100 }` to LMB. Ranger is rewarded for using pillars as cover while sniping.

**New class identity:**
- **Bladecaller** — `backstab: 2.0` as core passive. The combo + kill-reset-dash kit is designed around getting behind enemies. Dash through, turn, combo from behind. This creates a figure-8 movement pattern through enemy groups.

### Upgrade Interactions

- **Assassin's Mark (new upgrade):** Backstab bonus increased by +0.3x per stack. Max 3 stacks. For backstab classes only.
- **Close Quarters (new upgrade):** Proximity bonus range increased by +20 per stack. Max 3 stacks. Also grants +1 armor while in proximity range.
- **Existing "Momentum":** Should synergize — grant proximity bonus when moving above 80% max speed (reward dash-ins, not camping).

---

## Mechanic 7: Alternative Resources

### Overview

Replace or supplement the universal mana pool with class-specific resources that decay, build, or cycle in ways that punish passive play. Mana sustains circle-kiting because mana regen (14/s) means infinite casting as long as you don't spam. Alternative resources force engagement pacing that conflicts with kiting.

### Type System Changes

**New ClassDefInput fields:**
```typescript
// Add to ClassDefInput in constants.ts
resource?: {
  type: 'ammo' | 'rage' | 'heat' | 'mana';  // 'mana' is the default
  // Ammo system:
  maxAmmo?: number;           // Magazine size (3-6)
  reloadTime?: number;        // Seconds to reload (1.5-3.0)
  lastShotBonus?: number;     // Damage multiplier for last shot in magazine (1.5-2.0)
  // Rage system:
  maxRage?: number;           // Max resource (100)
  ragePerHit?: number;        // Rage gained per ability hit (5-10)
  ragePerDamageTaken?: number; // Rage gained per HP lost (10-15)
  rageDecay?: number;         // Rage lost per second out of combat (3-8)
  rageThreshold?: number;     // Rage level for empowered abilities (50)
  // Heat system:
  maxHeat?: number;           // Max heat (100)
  heatPerCast?: number;       // Heat generated per LMB cast (8-15)
  heatDecay?: number;         // Heat lost per second (10-20)
  overheatDuration?: number;  // Seconds of forced cooldown at 100 heat (2-3)
  heatBonusThreshold?: number; // Heat level for bonus damage (70)
  heatBonusMult?: number;     // Damage multiplier above threshold (1.3-1.5)
}
```

**New Player fields:**
```typescript
// Add to Player interface in types.ts
ammo?: number;               // Current ammo count
reloading?: boolean;         // Currently reloading
reloadTimer?: number;        // Remaining reload time
rage?: number;               // Current rage level
rageActive?: boolean;        // Above rage threshold (empowered state)
heat?: number;               // Current heat level
overheated?: boolean;        // Overheated (cannot cast)
overheatTimer?: number;      // Remaining overheat duration
```

### System Changes

**`src/systems/combat.ts` — castSpell():**
- **Ammo:** Before LMB cast, check `p.ammo > 0`. Decrement on cast. If `p.ammo === 1` (last shot): apply `lastShotBonus` multiplier. If `p.ammo === 0`: begin reload (`p.reloading = true`, `p.reloadTimer = reloadTime`). During reload, LMB blocked.
- **Rage:** Abilities cost 0 mana. On hit, gain `ragePerHit`. On damage taken, gain `ragePerDamageTaken`. If `rage >= rageThreshold`: abilities gain empowered effects (defined per-spell, e.g. +50% damage, added stun). Rage decays at `rageDecay/s` when no damage dealt/received for 2 seconds.
- **Heat:** Each LMB cast adds `heatPerCast`. Heat decays at `heatDecay/s`. If `heat >= heatBonusThreshold`: damage multiplied by `heatBonusMult` (riding the edge is rewarded). If `heat >= maxHeat`: overheated for `overheatDuration` seconds (no LMB casting, heat rapidly drops to 0).

**`src/systems/physics.ts` — resource tick:**
- Ammo reload: decrement `reloadTimer`; when 0, set `p.ammo = maxAmmo`, `p.reloading = false`
- Rage decay: if no combat in 2s, `p.rage -= rageDecay * dt`
- Heat decay: `p.heat -= heatDecay * dt` (always decaying)
- Overheat recovery: decrement `overheatTimer`; when 0, `p.overheated = false`

**`src/rendering/` — resource UI:**
- Replace mana bar with resource-specific bar
- Ammo: show bullets/shells as discrete icons
- Rage: red bar that glows above threshold
- Heat: orange bar with danger zone marking

### Balance Values

| Resource | Key Parameter | Value | Rationale |
|----------|--------------|-------|-----------|
| Ammo | maxAmmo | 4-6 | 4 = tactical (Jhin), 6 = moderate |
| Ammo | reloadTime | 1.5-2.5s | Long enough to create vulnerability |
| Ammo | lastShotBonus | 1.5-2.0x | The "4th shot" fantasy |
| Rage | rageDecay | 5/s | ~20s from full to empty without combat |
| Rage | ragePerHit | 5-8 | Aggressive play fills bar in ~15 hits |
| Rage | rageThreshold | 50 | Empowered ~50% of the time during active combat |
| Heat | heatPerCast | 10-15 | Overheat in 7-10 rapid LMB casts |
| Heat | heatDecay | 12/s | Natural equilibrium around 40-60% heat at sustainable fire rates |
| Heat | overheatDuration | 2.0-2.5s | Punishing but not lethal |
| Heat | heatBonusMult | 1.3-1.5x | Reward for riding the edge |

### Class Applications

**Existing classes to retrofit:**
- **Berserker** — Replace mana with Rage. `maxRage: 100, ragePerHit: 8, ragePerDamageTaken: 12, rageDecay: 5, rageThreshold: 50`. Above 50 rage: all abilities deal +50% damage and Berserker gains +15% move speed. This directly punishes kiting (rage decays when running) and rewards brawling.
- **Engineer** — Replace mana with Heat. `maxHeat: 100, heatPerCast: 12, heatDecay: 15, overheatDuration: 2.5, heatBonusThreshold: 70, heatBonusMult: 1.4`. Turrets generate heat when firing. Overheating disables all turrets for 2.5s. This creates turret management: deploy turrets strategically, don't spam.

**New class identity:**
- **Cannoneer** — Ammo system. `maxAmmo: 4, reloadTime: 2.0, lastShotBonus: 1.5`. Combined with charge-up LMB (Mechanic 2), the Cannoneer fires 4 deliberate power shots, then has a 2s reload window. The reload window is when they're most vulnerable — use caltrops (Q) and concussive blast (RMB) for self-peel during reload.

### Upgrade Interactions

- **Extended Magazine (new upgrade, ammo only):** +1 max ammo per stack. Max 2.
- **Battle Fury (new upgrade, rage only):** Rage decay reduced by 30% per stack. Max 2.
- **Coolant (new upgrade, heat only):** Heat decay increased by 25% per stack. Max 3.
- **Existing mana upgrades:** Should be blocked for non-mana classes (show "incompatible" in upgrade selection UI).

---

## Mechanic 8: Mark/Detonate

### Overview

Mark/detonate is a two-step damage pattern. One ability applies a "mark" to enemies. A second ability (or the same ability in a different state) "detonates" marks for bonus damage. The detonation is significantly more powerful than either ability alone.

This breaks kiting because it forces deliberate two-step engagement: apply marks, then position for detonation. The timing window between marking and detonating creates intentional play.

### Type System Changes

**New SpellDef fields:**
```typescript
// Add to SpellDef interface in types.ts
applyMark?: {
  name: string;              // Mark identifier (e.g., 'frost', 'hex', 'soul')
  duration: number;          // Seconds before mark expires (2-5)
  maxStacks?: number;        // How many marks can stack (1-3, default 1)
  visual?: string;           // Color for mark indicator
};
detonateMark?: {
  name: string;              // Which mark to detonate (must match applyMark.name)
  dmgPerStack: number;       // Bonus damage per mark stack detonated (1-4)
  aoeOnDetonate?: number;    // AOE radius on detonation (0 = single target)
  spreadOnDetonate?: boolean; // Apply 1 mark to nearby enemies on detonation
  effectOnDetonate?: {       // Bonus effect on detonation
    stun?: number;
    slow?: number;
    heal?: number;           // Heal the player
  }
};
```

**New enemy fields (on enemy entity / EnemyPool):**
```typescript
// Add to enemy data
marks?: Map<string, { stacks: number; timer: number; owner: number }>;
// Or as SoA fields:
markName: string[];          // Active mark type
markStacks: number[];        // Stack count
markTimer: number[];         // Remaining duration
markOwner: number[];         // Player who applied it
```

### System Changes

**`src/systems/combat.ts` — on spell hit:**
- If spell has `applyMark`: add/increment mark on the hit enemy. If at `maxStacks`, refresh timer but don't add more.
- If spell has `detonateMark`: check target for matching marks. If found: deal `dmgPerStack * stacks` bonus damage. Apply `aoeOnDetonate` if set. Apply `spreadOnDetonate` (add 1 mark to enemies within 80 units). Apply `effectOnDetonate`. Remove marks from target.

**New system logic in enemy update:**
- Each frame: decrement mark timers. Remove expired marks.

**`src/rendering/` — mark visuals:**
- Marked enemies show a glowing ring with the mark color
- Stack count displayed as small dots (1-3)
- Detonation: satisfying burst particle effect
- Mark spread: visible arc connecting spread targets

### Balance Values

| Parameter | Recommended Range | Rationale |
|-----------|------------------|-----------|
| mark duration | 2.0 — 5.0s | 2s = tight window requiring quick follow-up. 5s = generous, for combo-heavy classes |
| maxStacks | 1 — 3 | 1 = simple mark/pop. 3 = rewards investment before detonating |
| dmgPerStack | 1.5 — 4.0 | At 3 stacks with 3.0/stack = 9.0 bonus damage. Must justify the setup cost |
| aoeOnDetonate | 0 — 80 | 0 = single target focus. 80 = satisfying AOE pop in groups |
| spreadOnDetonate | false / true | Enables chain reactions in dense waves |
| Mana cost (marker) | 4 — 8 | Low cost since it's setup, not payoff |
| Mana cost (detonator) | 10 — 18 | Higher cost for the payoff ability |

### Class Applications

**Existing classes to retrofit:**
- **Cryomancer** — LMB Ice Bolt applies `frost` mark (3s, max 3 stacks). RMB Frost Nova detonates: `dmgPerStack: 2.0, aoeOnDetonate: 60, effectOnDetonate: { stun: 0.3 per stack }`. This transforms Cryomancer from "spam slowing projectiles while kiting" to "stack 3 frost marks, position for Nova detonation, shatter for 6 bonus damage + 0.9s stun."
- **Stormcaller** — RMB Thunder applies `static` mark (4s, max 3). Existing passive "Static Charge" (stun every 5th hit) becomes: "detonate all static marks on 5th hit for chain lightning." This makes the 5th hit into a devastating moment rather than a small stun.
- **Paladin** — LMB Holy Bolt applies `judgment` mark (3s, max 1). Q Consecrate detonates all judgment marks in the zone for bonus damage + heal. This rewards Paladin for marking targets at range then placing Consecrate precisely.

**New class identity:**
- **Soulbinder** — Core identity is mark/detonate. LMB Soul Lash applies `soul` mark (3s, max 1). Marks cause the target to take 25% more damage from allies. Q empowers the ally to detonate marks on hit for bonus AOE. Ultimate tethers + marks all nearby enemies, then detonates all after 2s.

### Upgrade Interactions

- **Volatile Marks (new upgrade):** Mark detonation AOE increased by +20 radius per stack. Max 3.
- **Mark Persistence (new upgrade):** Mark duration increased by +1.0s per stack. Max 2.
- **Chain Reaction (new upgrade):** Mark spread on detonation is guaranteed (overrides `spreadOnDetonate: false`). Each spread applies at full stacks instead of 1.
- **Existing "Combo":** Should synergize — hitting a marked target with the "Combo" upgrade active doubles the detonation damage.

### Example: Cryomancer with Frost Mark/Shatter

```typescript
// LMB - applies frost marks
{
  name: 'Ice Bolt',
  key: 'LMB',
  type: SpellType.Projectile,
  dmg: 1.0,
  speed: 520,
  radius: 5,
  mana: 6,
  cd: 0.22,
  life: 0.7,
  slow: 0.6,
  // NEW mark fields:
  applyMark: {
    name: 'frost',
    duration: 3.0,
    maxStacks: 3,
    visual: '#88CCFF'
  }
}

// RMB - detonates frost marks
{
  name: 'Frost Nova',
  key: 'RMB',
  type: SpellType.Nova,
  dmg: 2.0,        // base damage
  radius: 80,
  mana: 14,
  cd: 4.0,
  life: 0,
  slow: 1.5,
  // NEW detonate fields:
  detonateMark: {
    name: 'frost',
    dmgPerStack: 2.0,       // +2.0 per stack = +6.0 at 3 stacks
    aoeOnDetonate: 60,
    spreadOnDetonate: true,
    effectOnDetonate: {
      stun: 0.3              // per stack = 0.9s at 3 stacks
    }
  }
}
```

---

## Mechanic Compatibility Matrix

Which mechanics can coexist on the same class? Some combinations reinforce each other; others conflict.

| | Channel | Charge | Combo | Stance | Tether | Position | Alt Resource | Mark/Det |
|---|---|---|---|---|---|---|---|---|
| **Channel** | — | Conflict (both use channelTimer) | Compatible | Compatible (per-form) | Conflict (both restrict movement) | Compatible | Compatible | Compatible |
| **Charge** | Conflict | — | Conflict (charge replaces combo rhythm) | Compatible (per-form) | Conflict | Compatible | Compatible | Compatible |
| **Combo** | Compatible | Conflict | — | Partial (combos per-form) | Compatible | Synergy (combo positioning) | Compatible | Synergy (combo applies marks) |
| **Stance** | Compatible | Compatible | Partial | — | Compatible (per-form) | Compatible | Partial (resource per-form?) | Compatible |
| **Tether** | Conflict | Conflict | Compatible | Compatible | — | Synergy (proximity = tether) | Compatible | Synergy (tether applies marks) |
| **Position** | Compatible | Compatible | Synergy | Compatible | Synergy | — | Compatible | Compatible |
| **Alt Resource** | Compatible | Compatible | Compatible | Partial | Compatible | Compatible | — | Compatible |
| **Mark/Det** | Compatible | Compatible | Synergy | Compatible | Synergy | Compatible | Compatible | — |

**Best combinations:**
- Combo + Position + Mark/Detonate (Bladecaller: combo from behind applies marks, finisher detonates)
- Tether + Position + Alt Resource/Rage (Graviturge: tether at close range, proximity bonus, rage builds from proximity)
- Charge + Alt Resource/Ammo + Position (Cannoneer: charged shots from ammo magazine, pillar bonus for cover shots)
- Stance + Combo (Hexblade: ranged form marks targets, melee form uses combo to detonate)

**Conflicting combinations to avoid:**
- Channel + Charge on the same spell slot (both use the hold-to-power paradigm)
- Channel + Tether on the same class (both restrict movement — double restriction feels bad)
- Charge + Combo (charge replaces the tap rhythm that combos need)

---

## Implementation Priority

Ordered by anti-kiting impact per code complexity:

### Priority 1: High Impact, Low Complexity

**1. Mark/Detonate** (Mechanic 8)
- **Impact:** Forces two-step engagement on every attack sequence
- **Complexity:** Low — add mark data to enemies, check on hit, trigger detonation. No new systems needed.
- **Retrofits:** Cryomancer, Stormcaller, Paladin immediately benefit
- **Estimated scope:** ~100 lines in combat.ts, ~30 lines in rendering

**2. Combo Chains** (Mechanic 3)
- **Impact:** Transforms LMB from hold-and-forget to rhythmic engagement
- **Complexity:** Low — combo counter on Player, damage scaling lookup, timeout reset
- **Retrofits:** Monk, Berserker, Knight immediately benefit
- **Estimated scope:** ~80 lines in combat.ts, ~20 lines in rendering

**3. Positional Bonuses** (Mechanic 6)
- **Impact:** Makes attack angle matter, breaking fixed kiting patterns
- **Complexity:** Low — angle calculation on hit, multiplier application
- **Retrofits:** Berserker (proximity), Monk (backstab), Ranger (pillar)
- **Estimated scope:** ~60 lines in combat.ts, ~40 lines in rendering

### Priority 2: High Impact, Medium Complexity

**4. Charge-Up System** (Mechanic 2)
- **Impact:** Directly converts standing-still time into damage
- **Complexity:** Medium — hold/release input detection, charge interpolation, speed reduction
- **Retrofits:** Ranger, Warlock
- **Estimated scope:** ~120 lines in combat.ts + physics.ts, ~50 lines in rendering

**5. Alternative Resources** (Mechanic 7)
- **Impact:** Rage system alone transforms Berserker into an anti-kiter
- **Complexity:** Medium — new resource tracking, UI replacement, ability gating
- **Retrofits:** Berserker (rage), Engineer (heat)
- **Estimated scope:** ~150 lines across combat.ts, physics.ts, ~60 lines in rendering

**6. Tether Mechanics** (Mechanic 5)
- **Impact:** Strongest positional constraint (must stay within range)
- **Complexity:** Medium — new SpellType, tether tracking system, break logic
- **Retrofits:** Necromancer, Chronomancer
- **Estimated scope:** New system file (~120 lines), ~40 lines in combat.ts, ~50 lines in rendering

### Priority 3: High Impact, High Complexity

**7. Channeled Casting** (Mechanic 1)
- **Impact:** Movement restriction during casting
- **Complexity:** High — input state management (hold vs release), channel interruption, beam sustain rework
- **Retrofits:** Stormcaller LMB, Berserker Ultimate
- **Estimated scope:** ~150 lines in combat.ts, ~40 lines in physics.ts, ~60 lines in rendering

**8. Stance Switching** (Mechanic 4)
- **Impact:** Most complex new mechanic — doubles a class's ability count
- **Complexity:** High — dual spell arrays, form toggle, UI for showing current form, cooldown persistence across forms, networking sync
- **Best for:** New classes (Hexblade) rather than retrofits
- **Estimated scope:** ~200 lines across combat.ts, constants.ts, ~80 lines in rendering, ~40 lines in network.ts

---

## Appendix: Consolidated New Type Definitions

### New SpellDef Fields (all optional)

```typescript
// Channeled Casting
channel?: number;
channelSlow?: number;
channelScale?: number;
channelTicks?: number;
channelBreak?: number;

// Charge-Up
chargeTime?: number;
chargeSlow?: number;
chargeMinDmg?: number;
chargeMaxDmg?: number;
chargePierce?: number;
chargeRadius?: number;

// Combo Chains
combo?: {
  steps: number;
  timeout: number;
  dmgScale: number[];
  effects: Record<number, { stun?: number; aoeR?: number; slow?: number; knockback?: number }>;
};

// Tether
tetherRange?: number;
tetherDmg?: number;
tetherHeal?: number;
tetherTickRate?: number;
tetherDuration?: number;
tetherReward?: {
  stun?: number;
  dmgBurst?: number;
  healBurst?: number;
  slow?: number;
};

// Positional Bonus (per-spell)
positionBonus?: {
  type: 'backstab' | 'proximity' | 'flanking' | 'pillar';
  mult: number;
  range?: number;
  pillarRange?: number;
};

// Mark/Detonate
applyMark?: {
  name: string;
  duration: number;
  maxStacks?: number;
  visual?: string;
};
detonateMark?: {
  name: string;
  dmgPerStack: number;
  aoeOnDetonate?: number;
  spreadOnDetonate?: boolean;
  effectOnDetonate?: { stun?: number; slow?: number; heal?: number };
};
```

### New Player Fields (all optional)

```typescript
// Channeled Casting / Charge-Up (shared)
channeling?: boolean;
channelTimer?: number;
channelSlot?: number;
channelAngle?: number;
chargeLevel?: number;

// Combo Chains
comboCount?: number;
comboTimer?: number;

// Stance Switching
currentForm?: 'A' | 'B';
formSwitchCd?: number;
formSwitchBuff?: number;

// Tether
tetheredTo?: number;
tetherTimer?: number;
tetherSpellIdx?: number;

// Alternative Resources
ammo?: number;
reloading?: boolean;
reloadTimer?: number;
rage?: number;
rageActive?: boolean;
heat?: number;
overheated?: boolean;
overheatTimer?: number;
```

### New ClassPassive Fields (all optional)

```typescript
backstab?: number;
proximityBonus?: { range: number; dmgMult: number; aura?: number };
flanking?: { angleTolerance: number; dmgMult: number };
```

### New ClassDefInput Fields (all optional)

```typescript
resource?: {
  type: 'ammo' | 'rage' | 'heat' | 'mana';
  maxAmmo?: number;
  reloadTime?: number;
  lastShotBonus?: number;
  maxRage?: number;
  ragePerHit?: number;
  ragePerDamageTaken?: number;
  rageDecay?: number;
  rageThreshold?: number;
  maxHeat?: number;
  heatPerCast?: number;
  heatDecay?: number;
  overheatDuration?: number;
  heatBonusThreshold?: number;
  heatBonusMult?: number;
};
stanceForms?: {
  formA: { name: string; spells: SpellDefInput[]; passive?: ClassPassive; moveSpeed?: number; color?: string };
  formB: { name: string; spells: SpellDefInput[]; passive?: ClassPassive; moveSpeed?: number; color?: string };
  switchCd: number;
  switchBuff?: { duration: number; dmgMult?: number; armor?: number };
};
```

### New SpellType Value

```typescript
Tether = 'tether'    // Add to SpellType enum
```

### New Upgrade Definitions (Summary)

| Upgrade | Mechanic | Effect | Stacks | For |
|---------|----------|--------|--------|-----|
| Unshakeable | Channel | +2 channelBreak threshold | 3 | Channelers |
| Quick Channel | Channel | -15% channel time (hyperbolic) | 3 | Channelers |
| Overcharge | Charge | +0.5s overcharge window, +1 pierce | 1 | Chargers |
| Steady Aim | Charge | +0.15 chargeSlow (move faster) | 3 | Chargers |
| Combo Extender | Combo | +1 combo step at 0.7x final dmg | 1 | Combo classes |
| Combo Memory | Combo | +0.5s combo timeout | 2 | Combo classes |
| Fluid Forms | Stance | -20% switch cooldown | 3 | Stance classes |
| Lingering Power | Stance | +1.0s switch buff duration | 2 | Stance classes |
| Iron Tether | Tether | +30 tether range | 3 | Tether classes |
| Leech | Tether | +0.5 tether heal/tick | 3 | Tether classes |
| Assassin's Mark | Position | +0.3x backstab multiplier | 3 | Backstab classes |
| Close Quarters | Position | +20 proximity range, +1 armor | 3 | Proximity classes |
| Extended Magazine | Resource | +1 max ammo | 2 | Ammo classes |
| Battle Fury | Resource | -30% rage decay | 2 | Rage classes |
| Coolant | Resource | +25% heat decay | 3 | Heat classes |
| Volatile Marks | Mark/Det | +20 detonation AOE radius | 3 | Mark classes |
| Mark Persistence | Mark/Det | +1.0s mark duration | 2 | Mark classes |
| Chain Reaction | Mark/Det | Guaranteed spread, full stacks | 1 | Mark classes |

---

## Appendix: Class Retrofit Summary

Quick reference for which existing classes gain which mechanics:

| Class | Mechanic(s) | Changes |
|-------|-------------|---------|
| **Berserker** | Combo + Proximity + Rage | LMB becomes 3-hit combo. Passive gains proximity aura. Mana replaced by Rage. |
| **Monk** | Combo + Backstab | LMB becomes 3-hit Chi combo. Passive gains backstab bonus. |
| **Stormcaller** | Channel + Mark/Detonate | LMB becomes sustained channel beam. RMB applies static marks. 5th-hit proc detonates marks. |
| **Ranger** | Charge-Up + Pillar Bonus | LMB becomes charge-up power shot. Gains pillar position bonus. |
| **Cryomancer** | Mark/Detonate | LMB applies frost marks. RMB detonates for shatter damage + stun. |
| **Necromancer** | Tether (RMB) or Stance Switch | RMB becomes life siphon tether. OR: two forms (Shadow Mage / Death Knight). |
| **Chronomancer** | Tether (Q) | Q becomes temporal tether with CC payoff on completion. |
| **Warlock** | Charge-Up (RMB) | RMB Shadow Bolt gains charge-up for AOE explosion. |
| **Knight** | Combo (RMB) | RMB becomes 2-hit Shield Bash combo (bash + thrust). |
| **Paladin** | Mark/Detonate | LMB applies judgment marks. Q Consecrate detonates marks in zone. |
| **Engineer** | Heat Resource | Mana replaced by Heat. Turrets generate heat. Overheat disables all turrets. |
| **Pyromancer** | (Unchanged) | Remains the baseline kiting class for comparison. |
| **Arcanist** | (Unchanged) | Blink mobility already provides a distinct pattern. |
| **Druid** | (Unchanged) | Summon management already provides some differentiation. |
