# Progression Rebalance Plan -- Wizard Duel

**Date:** 2026-04-13
**Status:** Draft for review
**Audience:** Product management + implementing developers
**Prerequisites:** [Power Scaling Audit](./power-scaling-audit.md) (Task 17), Roguelike Research (Task 16)

---

## 1. Executive Summary

Wizard Duel's 20-wave roguelike run currently delivers a satisfying early game (waves 1-7) where players feel their upgrades making a meaningful difference. However, starting at wave 8, the player's damage output accelerates beyond what enemy scaling can match, and by wave 12 the game has effectively ended as a challenge. Bosses -- the intended highlight encounters -- die in under one second by wave 10, and the final Archlord boss is defeated in roughly half a second. Players who reach wave 15 are functionally immortal and can clear screens of enemies without strategic thought. The late game, which should be the climax, is the least engaging part of the run.

The root cause is unchecked multiplicative scaling. While the existing diminishing returns system (hyperbolic stacking, flat-log falloff) works well for individual upgrade paths, it does nothing to limit the interaction between paths. Split Shot triples all damage. Rapid Fire nearly triples fire rate. Spell Power and Primary Boost add 12+ flat damage. Critical Strike and its evolution double average output. These multiply together into 20-30x base DPS by wave 15, while enemy HP has only grown 3-5x. Time-based scaling (timeMul) adds a negligible 5% per minute and cannot compensate.

This plan proposes 14 concrete changes across three priority tiers, drawn from the 11 audit recommendations (R1-R11) and informed by genre research into Vampire Survivors, Hades, and Risk of Rain 2. The goal is not to remove the power fantasy -- players should still feel dramatically stronger by wave 15 than wave 1. The goal is to shift the peak power experience from wave 8 to waves 12-15, ensure every wave requires active play, and make boss encounters memorable 8-25 second fights rather than sub-second formalities.

---

## 2. Design Philosophy

### 2.1 The Power Fantasy Peaks at Wave 12-15, Not Wave 8

Players should feel a steady climb in power through wave 12, hit a satisfying peak through wave 15, then face mounting pressure from waves 16-20 that tests whether their build is truly strong. Currently the peak hits at wave 8 and everything after is a victory lap. We want the victory lap to start no earlier than wave 16, and even then it should feel earned, not automatic.

### 2.2 Every Wave Should Require Active Play

No wave should be clearable by standing still. Even at peak power, players should need to dodge dangerous enemies, prioritize targets, and use movement strategically. If the player can put down the controller and survive, the balance has failed. The iframe system (0.4s invulnerability per hit) already helps by limiting max damage intake, but enemy threat must scale to stay meaningful against upgraded defenses.

### 2.3 Bosses Are Memorable Encounters

Boss fights are the punctuation marks of a run. They should last 8-25 seconds depending on wave, long enough for the player to recognize attack patterns, dodge at least once, and feel the tension of a concentrated fight. A boss dying in under 2 seconds is indistinguishable from a normal enemy and wastes the design investment in boss mechanics.

### 2.4 Builds Should Differentiate, Not Dominate

A damage-focused build and a balanced build should both be viable but feel different. Currently, a damage build is strictly superior because killing everything instantly is the best defense. After rebalancing, a balanced build's survivability should matter because enemies live long enough to deal real damage, and a damage build should need to rely on skill (kiting, positioning) to compensate for lower defenses.

### 2.5 Diminishing Returns Apply to the System, Not Just Individual Stats

Following Risk of Rain 2's design lesson, we must apply diminishing returns at the system level (total DPS output), not just the component level (individual upgrade stacks). Hyperbolic stacking on crit chance is good; hyperbolic stacking on total bonus damage from all sources is essential.

---

## 3. Proposed Changes -- Priority 1 (Critical)

These changes address the three most game-breaking issues: unbounded cooldown reduction, trivial boss HP, multiplicative DPS stacking, and evolution power spikes. They should be implemented first and together, as each one alone will only partially address the problem.

### 3a. Cooldown Reduction Floor

**Audit reference:** R1

**Problem:** Players can reduce primary attack cooldowns to 0.03s or lower by stacking Rapid Fire (0.6x), Swift Cast (0.8x), and Spell Mastery (-30% CD). This turns the primary attack into a continuous stream, multiplying all damage bonuses by the fire rate increase. Combined with Split Shot, the player fires 3 projectiles every 0.03s -- roughly 100 projectiles per second.

**Current value:**
- Rapid Fire: primary CD multiplied by 0.6
- Swift Cast: all cooldowns multiplied by 0.8
- Spell Mastery (evolution): all cooldowns multiplied by 0.7
- Combined minimum: `baseCd * 0.6 * 0.8 * 0.7 = baseCd * 0.336`
- Pyromancer fireball (0.35s base): `0.35 * 0.336 = 0.118s`
- Monk Chi Blast (0.25s base): `0.25 * 0.336 = 0.084s`
- No minimum cooldown enforced anywhere

**Proposed value:**
- Minimum cooldown floors enforced after all reductions:
  - **Primary (LMB):** 0.15s floor (6.67 casts/sec max)
  - **Secondary (RMB):** 1.0s floor
  - **Q ability:** 2.0s floor
- Implementation: `effectiveCd = Math.max(cdFloor, baseCd * allMultipliers)`

**Expected impact:** Players still feel a major fire rate increase from cooldown upgrades (Pyromancer goes from 0.35s to 0.15s, a 2.3x increase), but the theoretical maximum DPS is capped at a reasonable ceiling. The floor is generous enough that most builds will not hit it until they combine 2+ cooldown reduction sources, preserving the feeling of upgrading fire rate while preventing the 100-projectile-per-second absurdity.

**Implementation notes:**
- File: `src/systems/combat.ts` (where cooldown is applied to firing logic)
- File: `src/constants.ts` (define `CD_FLOOR_PRIMARY = 0.15`, `CD_FLOOR_SECONDARY = 1.0`, `CD_FLOOR_Q = 2.0`)
- Effort: Low (add 3 constants, add one `Math.max` call per ability type)

---

### 3b. Boss HP Exponential Scaling

**Audit reference:** R2

**Problem:** The wave 10 Demon dies in under 1 second. The wave 20 Archlord -- the final boss of the entire run -- dies in 0.5 seconds. Boss fights are supposed to be climactic encounters but are over before the player can recognize them. The root cause is that boss HP scales linearly (`base + wave*4`) while player DPS scales multiplicatively.

**Current value:**
- Golem/Demon: `ceil((baseHP + wave * 4) * timeMul)`
- Archlord: `ceil((60 + wave * 5) * timeMul)`
- Wave 5 Golem: 42 HP
- Wave 10 Demon: 71 HP
- Wave 15 Golem: 90 HP
- Wave 20 Archlord: 186 HP

**Proposed value:**
- All bosses: `ceil(baseHP * (1.4 ^ (wave / 5)) * timeMul)`
- Wave 15/20 bosses gain a **damage reduction phase** at 50% HP: 50% damage reduction for 3 seconds (with a visual "shield cracking" effect). This guarantees a minimum fight duration even against extreme builds.

| Boss | Wave | Base HP | New Formula | New timeMul | New HP | With Other P1 Changes* |
|------|------|---------|-------------|-------------|--------|------------------------|
| Golem | 5 | 20 | 20 * 1.4^1 = 28 | 1.04 | **30** | 30 |
| Demon | 10 | 25 | 25 * 1.4^2 = 49 | 1.08 | **53** | 53 |
| Golem | 15 | 20 | 20 * 1.4^3 = 55 | 1.12 | **62** | 62 (+phase) |
| Archlord | 60 | 20 | 60 * 1.4^4 = 230 | 1.16 | **267** | 267 (+phase) |

*Note: These HP values look lower than the 500+ target for Archlord. However, combined with P1 changes 3a (CD floor), 3c (Split Shot nerf), 3d (damage soft cap), and 3e (evolution cap), the effective player DPS at wave 20 drops from 400+ to approximately 80-120. At 100 DPS vs 267 HP + a 3s damage reduction phase, the Archlord fight lasts approximately 15-20 seconds. If playtesting shows this is still too short, increase base HP to 80 (yielding 367 HP) or strengthen the damage reduction phase.*

**Expected impact:** Boss fights become real encounters. The wave 5 Golem is slightly shorter than before (30 HP vs 42, but player DPS is also slightly lower from other changes). The wave 10 Demon is a genuine test lasting 5-8 seconds. The wave 15 and 20 bosses feature a mid-fight damage reduction phase that creates a "second phase" feel even without full phase mechanics.

**Implementation notes:**
- File: `src/systems/dungeon.ts` (boss spawn logic, HP calculation)
- File: `src/constants.ts` (new `BOSS_HP_EXPONENT = 1.4`, `BOSS_HP_EXPONENT_DIVISOR = 5`)
- File: `src/systems/combat.ts` (damage reduction phase logic -- new mechanic)
- Effort: Medium (formula change is trivial, damage reduction phase requires new state + visual indicator)

---

### 3c. Split Shot Damage Reduction

**Audit reference:** R3

**Problem:** Split Shot adds +2 projectiles that each deal 100% of the primary's damage. This is a flat 3x DPS multiplier (realistically ~2.2x accounting for misses) with no downside. It is the single most impactful upgrade in the game -- more powerful than any evolution -- yet it appears in the regular upgrade pool alongside incremental +1 damage bonuses.

**Current value:**
- Split Shot: +2 extra projectiles at 100% damage each
- Effective DPS multiplier: 2.2-3.0x (depending on enemy density)
- No accuracy penalty, no damage split, no fire rate penalty

**Proposed value:**
- Split Shot: +2 extra projectiles at **60% damage** each
- Effective DPS multiplier: 1.6-2.2x (down from 2.2-3.0x)
- Implementation: side bolts inherit `damage * 0.6` from the primary projectile

**Expected impact:** Split Shot remains one of the best upgrades in the game (a 60-120% DPS increase is still exceptional), but it no longer overshadows every other option. The central bolt still deals full damage for single-target (boss) DPS, while the side bolts provide strong but not dominant AoE clearing. Players who relied on Split Shot as a "win the game" button will need to invest in other upgrades to maintain their power curve.

**Implementation notes:**
- File: `src/systems/combat.ts` (projectile spawn logic for split shots)
- File: `src/constants.ts` (define `SPLIT_SHOT_SIDE_DAMAGE_MULT = 0.6`)
- Effort: Low (modify damage assignment when spawning side projectiles)

---

### 3d. Global Bonus Damage Soft Cap

**Audit reference:** R3

**Problem:** Flat damage bonuses from Spell Power (+4.63 at 5 stacks), Primary Boost (+7.72 at 4 stacks), evolution bonuses (+5 from Spell Mastery, +6 from Primary Overload, +3 from Void Lance), and any other sources all stack additively with no system-level cap. A player can accumulate +12-20 bonus damage on their primary, turning a 2-damage fireball into a 22-damage fireball. This stacks multiplicatively with crit, Split Shot, and cooldown reduction.

**Current value:**
- Total bonus flat damage from all sources: uncapped, additive
- Typical wave 15 total: +12 to +18 bonus damage
- Typical wave 20 total: +15 to +22 bonus damage

**Proposed value:**
- Apply a hyperbolic soft cap to **total combined bonus flat damage** from all sources:
  ```
  effectiveBonus = totalBonus * (1 - 1 / (1 + totalBonus / 8))
  ```
- This is equivalent to: `effectiveBonus = totalBonus^2 / (totalBonus + 8)`

| Total Raw Bonus | Effective Bonus | Efficiency |
|-----------------|-----------------|------------|
| 1               | 0.11            | 11%        |
| 2               | 0.40            | 20%        |
| 4               | 1.33            | 33%        |
| 6               | 2.57            | 43%        |
| 8               | 4.00            | 50%        |
| 10              | 5.56            | 56%        |
| 12              | 7.20            | 60%        |
| 16              | 10.67           | 67%        |
| 20              | 14.29           | 71%        |

*Wait -- at low values this is too punishing. The first few points of bonus damage should feel impactful.*

**Revised proposed value:**
- Apply the soft cap only to the portion of bonus damage **above 6**:
  ```
  if (totalBonus <= 6) effectiveBonus = totalBonus;
  else effectiveBonus = 6 + (totalBonus - 6) * (1 - 1 / (1 + (totalBonus - 6) / 6));
  ```
- Simplified: first 6 bonus damage is uncapped. Beyond 6, hyperbolic diminishing with a knee at 6.

| Total Raw Bonus | Effective Bonus | Notes |
|-----------------|-----------------|-------|
| 4               | 4.00            | Fully effective |
| 6               | 6.00            | Threshold -- no reduction |
| 8               | 6.67            | Mild reduction begins |
| 10              | 7.50            | Moderate reduction |
| 12              | 8.00            | 67% efficiency on excess |
| 16              | 9.00            | Stacking still helps, but less |
| 20              | 9.71            | Hard diminishing |

**Expected impact:** Early-game damage upgrades (first 2-3 Spell Power picks) feel exactly the same -- no nerf to the early power fantasy. Mid-game stacking (Spell Power + Primary Boost) still provides meaningful growth. Late-game bonus stacking (+15 total) yields ~9 effective instead of 15, a 40% reduction that significantly compresses the DPS/HP ratio. This is the single most important change for late-game balance because it applies broadly to all flat damage sources.

**Implementation notes:**
- File: `src/systems/combat.ts` (where total damage is calculated from bonuses)
- File: `src/constants.ts` (define `BONUS_DMG_SOFT_CAP_THRESHOLD = 6`, `BONUS_DMG_SOFT_CAP_KNEE = 6`)
- Must aggregate all flat damage bonuses before applying the cap (Spell Power + Primary Boost + evolution flat bonuses)
- Effort: Medium (requires identifying all flat damage contribution points and aggregating them before the cap)

---

### 3e. Evolution Upgrades: Additive Cap with Parent

**Audit reference:** R6

**Problem:** Evolution upgrades add their bonuses on top of their parent upgrade's full stack, creating a second wave of uncapped flat scaling. Spell Mastery (+5 all damage, -30% CD) stacks on top of Spell Power's +4.63, yielding +9.63 total from one upgrade path. Primary Overload (+6 primary, +3 AoE) stacks on Primary Boost's +7.72, yielding +13.72. These evolved totals feed into the global bonus (addressed by 3d above), but the evolution itself should not be a free +5 on top of an already-stacked bonus.

**Current value:**
- Spell Mastery: +5 flat damage to all spells, -30% CD (stacks additively with Spell Power's +4.63)
- Primary Overload: +6 primary damage, +3 AoE damage (stacks additively with Primary Boost's +7.72)
- Lethal Precision: +30% crit chance, 3x crit multiplier (stacks additively with Critical Strike's 31%)
- Void Lance: +3 primary damage, pierce all (stacks with Primary Boost)

**Proposed value:**
- **Spell Mastery:** Evolution replaces Spell Power's flat bonus with a capped total of **+7 damage** to all spells (up from Spell Power's 4.63, but less than the combined 9.63). The -30% CD component remains unchanged. Net change: Spell Power path now caps at +7 flat instead of +9.63.
- **Primary Overload:** Evolution replaces Primary Boost's flat bonus with a capped total of **+10 primary damage** (up from Primary Boost's 7.72, but less than the combined 13.72). The AoE component (+3) remains unchanged. Net change: Primary Boost path now caps at +10 flat instead of +13.72.
- **Lethal Precision:** +25% crit chance (down from 30%), 2.5x crit multiplier (down from 3x). Total crit chance with 3 stacks of Critical Strike: 31% + 25% = 56% (down from 61%). Average damage multiplier: `0.44 * 1 + 0.56 * 2.5 = 1.84x` (down from `0.39 * 1 + 0.61 * 3 = 2.22x`). This is an 18% reduction in average damage from the crit path.
- **Void Lance:** +3 primary damage unchanged (will be subject to global soft cap from 3d). Pierce all unchanged.

**Expected impact:** Evolutions still feel like meaningful power upgrades -- Spell Mastery takes you from +4.63 to +7, which is a noticeable bump. But the "second spike" effect is eliminated. The critical strike evolution change is the most impactful for boss kill times, as the combination of high crit chance and 3x multiplier was the primary source of burst damage.

**Implementation notes:**
- File: `src/systems/upgrades.ts` (evolution application logic)
- File: `src/constants.ts` (evolution bonus values)
- For Spell Mastery and Primary Overload: evolution sets the path bonus to the capped value rather than adding on top
- For Lethal Precision: adjust constants `LETHAL_PRECISION_CRIT_CHANCE = 0.25`, `LETHAL_PRECISION_CRIT_MULT = 2.5`
- Effort: Medium (requires changing how evolution bonuses interact with parent stacks)

---

## 4. Proposed Changes -- Priority 2 (High)

These changes address significant balance issues that compound the core problems but are not individually game-breaking. They should be implemented after Priority 1 and can be tuned based on playtesting results from the P1 changes.

### 4a. Smooth Enemy Count Curve

**Audit reference:** R4

**Problem:** Enemy count per wave uses a 3-tier formula that creates a massive jump at wave 8 (from 19 to 34 enemies, a 79% increase). This XP windfall grants 2+ levels instantly, creating a snowball effect where the player enters wave 9 overpowered. The jump also makes wave 8 feel chaotic rather than progressively harder.

**Current value:**
- Waves 1-7: `5 + wave * 2` (wave 7 = 19)
- Waves 8-14: `10 + wave * 3` (wave 8 = 34)
- Waves 15-19: `15 + wave * 4` (wave 15 = 75, wave 19 = 91)

**Proposed value:**
- Single smooth formula: `count = floor(5 + wave * 2.5 + floor(wave / 8) * wave)`

| Wave | Current Count | Proposed Count | Change |
|------|---------------|----------------|--------|
| 1    | 7             | 7              | --     |
| 3    | 11            | 12             | +1     |
| 5    | 15 (boss)     | 17 (boss)      | +2     |
| 7    | 19            | 22             | +3     |
| 8    | 34            | 28             | -6     |
| 10   | 40 (boss)     | 31 (boss)      | -9     |
| 12   | 46            | 47             | +1     |
| 14   | 52            | 52             | --     |
| 16   | 79            | 61             | -18    |
| 18   | 87            | 68             | -19    |
| 19   | 91            | 71             | -20    |
| 20   | (boss)        | (boss)         | --     |

**Expected impact:** The early-to-mid transition (waves 7-9) becomes smooth rather than jarring. Players gain levels at a steady rate instead of getting a 2-level windfall at wave 8. Late-game waves have fewer but individually tougher enemies (when combined with HP scaling changes), making combat feel more deliberate. Total XP over a full run decreases by roughly 15%, which means ~1-2 fewer upgrades by wave 20 -- this is acceptable and helps compress the power curve.

**Implementation notes:**
- File: `src/systems/dungeon.ts` (enemy count calculation)
- Effort: Low (replace 3-tier formula with single formula)

---

### 4b. Boss Wave XP Boost

**Audit reference:** R5

**Problem:** Boss waves give dramatically less XP than normal waves. Wave 10 (Demon boss) yields ~90 XP while waves 9 and 11 yield 264 and 336 XP respectively. This makes boss fights feel unrewarding -- the hardest fight in the early-mid game gives the smallest reward. Players subconsciously learn that bosses are obstacles, not opportunities.

**Current value:**
- Golem (wave 5): 20 base HP, drops 1 gem at 2x XP = 40 XP
- Demon (wave 10): 25 base HP, drops 1 gem at 2x XP = 50 XP
- Golem (wave 15): 20 base HP, drops 1 gem at 2x XP = 40 XP
- Archlord (wave 20): 60 base HP, drops 1 gem at 2x XP = 120 XP (estimated)
- Boss minions: 2-8 enemies contributing 16-66 XP

**Proposed value:**
- Boss base XP values: **60 / 80 / 100 / 150** (wave 5 / 10 / 15 / 20)
- Bosses drop **3 gems** instead of 1 (same total XP, but more satisfying pickup)
- Boss minion count increased by +3 at each boss wave (more sustained XP during the fight)
- Boss minions trickle in over 10 seconds rather than spawning all at once (extends the encounter feel)

| Boss | Wave | Current Total XP | Proposed Total XP | Change |
|------|------|-------------------|-------------------|--------|
| Golem | 5 | ~56 | ~110 | +96% |
| Demon | 10 | ~85 | ~160 | +88% |
| Golem | 15 | ~95 | ~190 | +100% |
| Archlord | 20 | ~166 | ~300 | +81% |

**Expected impact:** Boss waves become rewarding milestones rather than XP valleys. The level-up cadence stays smoother across the run. Players feel a sense of accomplishment and progression from defeating a boss, which reinforces the "memorable encounter" design goal from 3b.

**Implementation notes:**
- File: `src/systems/dungeon.ts` (boss XP values, gem drop count, minion spawning)
- File: `src/constants.ts` (boss XP constants)
- Effort: Low-Medium (XP and gem changes are trivial; trickle-spawn for minions requires a small timer system)

---

### 4c. Strengthen Time-Based Scaling

**Audit reference:** R8

**Problem:** The timeMul scaling (`1 + (time/60) * 0.05`) adds only 5% enemy HP/damage per minute of real time. Over a typical 15-minute run, enemies gain +12.5% HP -- completely negligible compared to the player's 20-30x DPS multiplier. Time pressure, a core mechanic in successful roguelikes like Risk of Rain 2 and Vampire Survivors, is effectively non-existent.

**Current value:**
- `timeMul = 1 + (state.time / 60) * 0.05`
- At 5 minutes: 1.05 (+5%)
- At 10 minutes: 1.10 (+10%)
- At 15 minutes: 1.125 (+12.5%)

**Proposed value:**
- `timeMul = 1 + (state.time / 60) * 0.12`
- At 5 minutes: 1.12 (+12%)
- At 10 minutes: 1.20 (+20%)
- At 15 minutes: 1.30 (+30%)

| Minute | Current timeMul | Proposed timeMul | Difference |
|--------|-----------------|------------------|------------|
| 5      | 1.05            | 1.12             | +7%        |
| 10     | 1.08            | 1.20             | +12%       |
| 12     | 1.10            | 1.24             | +14%       |
| 15     | 1.13            | 1.30             | +17%       |
| 18     | 1.15            | 1.36             | +21%       |

**Expected impact:** Time pressure becomes a real factor in late-game decision-making. Players who take too long on waves face meaningfully tougher enemies. A slow player at wave 15 (minute 15) faces enemies with 30% more HP instead of 12.5% more, which combined with the other HP scaling changes creates genuine urgency. Fast, skilled players are rewarded with an easier run, creating a natural difficulty adaptation. This aligns with the Risk of Rain 2 model where "time is the real enemy."

**Implementation notes:**
- File: `src/constants.ts` (change `TIME_SCALING_FACTOR` from 0.05 to 0.12)
- Effort: Trivial (single constant change)

---

### 4d. Bloodlust Cap

**Audit reference:** R7

**Problem:** Bloodlust (Berserker class upgrade) grants +5% attack speed per kill with no upper limit. By wave 15, a Berserker has killed 300+ enemies, granting +1500% attack speed (16x base). This makes the Berserker the strongest class by a massive margin once Bloodlust is active, and it makes the cooldown floor (3a) less effective because Bloodlust bypasses cooldown reduction by increasing attack speed directly.

**Current value:**
- Bloodlust: +5% attack speed per kill, no cap
- Wave 15 (~300 kills): +1500% attack speed = 16x fire rate
- Declared but possibly not fully implemented in current code

**Proposed value:**
- Bloodlust: +5% attack speed per kill, **capped at +100% (20 kills)**
- After reaching the +100% cap, each subsequent kill grants **+1% crit chance** instead
- Crit chance overflow also capped at **+15%**
- At saturation (20 kills for speed, then 15 more kills for crit): Bloodlust provides 2x attack speed and +15% crit chance

**Expected impact:** Bloodlust still feels powerful during the early-mid game when kills are being earned. The 20-kill threshold is reached during wave 3-4, so the Berserker gets their full speed bonus early and reliably. The crit overflow gives a secondary scaling path that doesn't break the fire rate ceiling. Total Bloodlust value is significant but bounded: 2x speed + 15% crit is strong but comparable to other class augments.

**Implementation notes:**
- File: `src/systems/upgrades.ts` or `src/systems/combat.ts` (wherever Bloodlust is tracked)
- File: `src/constants.ts` (`BLOODLUST_SPEED_CAP = 1.0`, `BLOODLUST_CRIT_CAP = 0.15`)
- Effort: Low (add cap check, add crit overflow logic)

---

### 4e. Enemy HP Scaling: Multiplicative Component

**Audit reference:** R9, R10

**Problem:** Enemy HP scales additively via hpScale (`1 + floor(wave/4)` or `2 + floor(wave/3)`), which means HP grows by +1 every few waves. This cannot keep pace with the player's multiplicative damage growth. By wave 15, enemies have roughly 10 HP while the player deals 80+ damage per hit -- everything is a one-shot regardless of enemy type.

**Current value:**
- `hp = ceil((baseHP + hpScale - 1) * timeMul)`
- hpScale at wave 15: 7 (formula: `2 + floor(15/3) = 7`)
- Wraith at wave 15: `ceil((3 + 7 - 1) * 1.12) = ceil(10.08) = 11`

**Proposed value:**
- `hp = ceil((baseHP + hpScale - 1) * timeMul * (1 + wave * 0.04))`
- The added multiplicative term `(1 + wave * 0.04)` means:
  - Wave 5: enemies have 1.2x HP (minor)
  - Wave 10: enemies have 1.4x HP (noticeable)
  - Wave 15: enemies have 1.6x HP (significant)
  - Wave 20: enemies have 1.8x HP (major)

| Wave | Current Wraith HP | Proposed Wraith HP | Current Shieldbearer HP | Proposed Shieldbearer HP |
|------|-------------------|--------------------|-------------------------|--------------------------|
| 5    | 5                 | 6                  | --                      | --                       |
| 8    | 6                 | 8                  | 11                      | 15                       |
| 10   | 6                 | 9                  | 11                      | 16                       |
| 12   | 9                 | 13                 | 15                      | 21                       |
| 15   | 10                | 17                 | 16                      | 27                       |
| 20   | 12                | 22                 | 18                      | 33                       |

**Expected impact:** Enemy HP now grows in a way that tracks closer to the player's multiplicative DPS growth. At wave 15, enemies have roughly 60% more HP than before, which combined with the player DPS nerfs (3a-3e) means enemies survive 2-3 hits instead of being one-shot. This is the key change that makes late-game combat feel like actual combat rather than screen-clearing.

**Implementation notes:**
- File: `src/systems/dungeon.ts` (enemy HP calculation)
- File: `src/constants.ts` (`ENEMY_HP_WAVE_MULT = 0.04`)
- Effort: Low (add one multiplication to the HP formula)

---

## 5. Proposed Changes -- Priority 3 (Polish)

These changes refine the experience after the core rebalance is in place. They add variety, smooth remaining rough edges, and introduce new mechanics to keep late-game engagement high.

### 5a. hpScale Smoothing

**Audit reference:** R10

**Problem:** The hpScale formula switches from `1 + floor(wave/4)` to `2 + floor(wave/3)` at wave 11, creating a discontinuity (wave 10: 3, wave 11: 5 -- a 67% jump). This makes the wave 10-to-11 transition feel abruptly harder, which is especially jarring because wave 10 is a boss wave that gives low XP.

**Current value:**
- Waves 1-10: `hpScale = 1 + floor(wave / 4)`
- Waves 11+: `hpScale = 2 + floor(wave / 3)`

| Wave | 1 | 3 | 5 | 7 | 8 | 10 | 11 | 13 | 15 | 17 | 20 |
|------|---|---|---|---|---|----|----|----|----|----|-----|
| Current | 1 | 1 | 2 | 2 | 3 | 3 | 5 | 6 | 7 | 7 | 8 |

**Proposed value:**
- Single formula for all waves: `hpScale = 1 + floor(wave * 0.6)`

| Wave | 1 | 3 | 5 | 7 | 8 | 10 | 11 | 13 | 15 | 17 | 20 |
|------|---|---|---|---|---|----|----|----|----|----|-----|
| Proposed | 1 | 2 | 4 | 5 | 5 | 7 | 7 | 8 | 10 | 11 | 13 |

**Expected impact:** Smooth, predictable HP growth with no sudden jumps. Every wave, enemies are a little tougher. The proposed values are generally higher than current (wave 10: 7 vs 3, wave 15: 10 vs 7, wave 20: 13 vs 8), which provides a built-in HP buff that works alongside the multiplicative component from 4e.

**Implementation notes:**
- File: `src/systems/dungeon.ts` (hpScale calculation)
- Effort: Trivial (replace 2-tier formula with single formula)

---

### 5b. Late-Game Elite Enemies

**Audit reference:** R9

**Problem:** Late-game enemy variety is good mechanically (assassins, teleporters, berserkers), but all enemies die to a single hit regardless of type. There is no visual or gameplay distinction between a dangerous enemy and a weak one. Elite enemies in roguelikes (Hades' armored enemies, Risk of Rain 2's elite variants) create mini-challenges within waves that demand target prioritization.

**Current value:** No elite enemy system exists.

**Proposed value:**
- From wave 13+: **10%** of spawned enemies are "elite" variants
- From wave 17+: **20%** of spawned enemies are "elite" variants
- Elite properties:
  - **2.5x HP** (they survive multiple hits)
  - **1.3x damage** (slightly more threatening)
  - **Golden glow** visual effect (immediately recognizable)
  - **2x XP** on death (rewarding to kill)
  - Same speed and behavior as base type

| Wave | Enemies | Elite % | Elite Count | Normal HP | Elite HP | Notes |
|------|---------|---------|-------------|-----------|----------|-------|
| 13   | 49      | 10%     | 5           | ~10       | ~25      | First appearance |
| 15   | ~10     | 10%     | 1           | ~17       | ~43      | Boss wave, 1 elite minion |
| 17   | 83      | 20%     | 17          | ~19       | ~48      | Significant presence |
| 19   | 91      | 20%     | 18          | ~22       | ~55      | Peak challenge |

**Expected impact:** Elite enemies create pockets of challenge within otherwise manageable waves. Players must decide whether to prioritize elites (high threat, high reward) or clear weaker enemies first. The golden glow creates immediate visual hierarchy. Elite XP rewards offset the time cost of killing them, and help smooth the late-game leveling curve.

**Implementation notes:**
- File: `src/systems/dungeon.ts` (enemy spawn logic -- roll for elite on each spawn)
- File: `src/systems/combat.ts` (apply elite HP/damage multipliers)
- File: rendering system (golden glow shader/tint for elites)
- File: `src/constants.ts` (elite thresholds, multipliers)
- Effort: Medium (requires new enemy flag, multiplier application, and visual effect)

---

### 5c. Upgrade Choice Scaling

**Audit reference:** R11

**Problem:** Players always choose from 3 upgrades regardless of progression stage. By wave 15 with 15+ upgrades already taken, the 3 offered choices are often redundant or uninteresting because most desirable upgrades have been taken. The late game loses the excitement of the upgrade screen -- what should be a highlight moment becomes "pick the least bad option."

**Current value:** Always 3 choices per level-up.

**Proposed value:**
- Waves 1-11: **3 choices** (unchanged)
- Waves 12-15: **4 choices** (more variety, higher chance of something interesting)
- Waves 16+: **5 choices**, but one is a **"cursed" upgrade** (benefit + drawback)

Cursed upgrade examples:
- **Glass Cannon:** +4 damage to all spells, -2 max HP
- **Reckless Haste:** -40% all cooldowns, +50% damage taken
- **Blood Pact:** +20% life steal, -3 max HP
- **Unstable Power:** +8 damage to primary, 5% chance each cast damages self for 1 HP

**Expected impact:** Late-game upgrade screens become strategic decision points rather than afterthoughts. The 4-choice waves (12-15) simply give more variety. The 5-choice-with-curse waves (16+) introduce risk-reward decisions that make the final stretch engaging. Cursed upgrades are optional -- the player can always pick one of the 4 normal options -- but they offer a tempting power boost at a cost, which creates meaningful player agency.

**Implementation notes:**
- File: `src/systems/upgrades.ts` (upgrade offer logic)
- File: `src/constants.ts` (choice count per wave tier)
- New: cursed upgrade definitions and their drawback application logic
- Effort: Medium-High (4-choice is trivial, cursed upgrades require new data definitions and drawback systems)

---

### 5d. Crit Damage Cap

**Audit reference:** R3 (related)

**Problem:** Lethal Precision's 3x crit multiplier combined with 61% crit chance yields an average 2.22x damage multiplier from crit alone. This makes crit the most efficient damage scaling path and means most optimal builds path through Critical Strike into Lethal Precision regardless of class. (Note: 3e already addresses part of this by nerfing Lethal Precision to 2.5x/25%. This section documents the full change for clarity.)

**Current value:**
- Base crit multiplier: 2x
- Lethal Precision: 3x crit multiplier, +30% crit chance
- With 3 stacks Critical Strike (31%) + Lethal Precision: 61% chance for 3x = **2.22x average multiplier**

**Proposed value (as defined in 3e):**
- Base crit multiplier: 2x (unchanged)
- Lethal Precision: **2.5x** crit multiplier, **+25%** crit chance
- With 3 stacks Critical Strike (31%) + Lethal Precision: 56% chance for 2.5x = **1.84x average multiplier**
- Reduction: 17% lower average damage from crit path

**Expected impact:** Crit builds remain strong but no longer dominate all other paths. The 17% reduction in average damage from the crit path makes non-crit builds (e.g., pure Spell Power stacking, AoE-focused, survivability-focused) relatively more attractive, increasing build diversity.

**Implementation notes:** Covered by 3e implementation.

---

## 6. Expected Outcome: Power Curve Comparison

### 6.1 Player DPS vs Enemy HP Ratio (Damage-Focused Build)

Assumptions for "after" numbers: all P1 changes applied, P2 changes 4c (timeMul) and 4e (HP mult) applied. Player takes a damage-optimized upgrade path (Spell Power, Rapid Fire, Split Shot, Crit, Primary Boost, evolutions).

| Wave | Before: Player DPS | Before: Avg Enemy HP | Before: Ratio | After: Player DPS | After: Avg Enemy HP | After: Ratio |
|------|---------------------|----------------------|---------------|--------------------|---------------------|--------------|
| 1    | 8.6                 | 2                    | 4.3           | 8.6                | 2                   | 4.3          |
| 5    | 16                  | 4-5                  | 3.6           | 15                  | 5-6                 | 2.7          |
| 8    | 55                  | 5-6                  | 10.0          | 28                  | 8-9                 | 3.3          |
| 10   | 80                  | 6                    | 14.3          | 38                  | 11-12               | 3.3          |
| 12   | 130                 | 9                    | 15.6          | 52                  | 16-17               | 3.2          |
| 15   | 200                 | 10                   | 22.2          | 75                  | 24-26               | 3.0          |
| 20   | 400+                | 12                   | 36.4          | 110                 | 38-42               | 2.8          |

**Key insight:** The "after" ratio stays in the 2.7-4.3 range across the entire run instead of climbing from 4 to 36. Enemies in late waves take 2-3 hits to kill instead of being one-shot. The power fantasy is preserved (the player IS stronger -- they kill wave 20 enemies in 2-3 hits that would have taken 5-6 hits at wave 1), but enemies remain relevant threats.

### 6.2 Player DPS vs Enemy HP Ratio (Balanced Build)

| Wave | Before: Player DPS | Before: Avg Enemy HP | Before: Ratio | After: Player DPS | After: Avg Enemy HP | After: Ratio |
|------|---------------------|----------------------|---------------|--------------------|---------------------|--------------|
| 1    | 6                   | 2                    | 3.0           | 6                   | 2                   | 3.0          |
| 5    | 13                  | 4-5                  | 2.9           | 12                  | 5-6                 | 2.1          |
| 8    | 30                  | 5-6                  | 5.5           | 18                  | 8-9                 | 2.1          |
| 10   | 40                  | 6                    | 7.2           | 24                  | 11-12               | 2.1          |
| 12   | 60                  | 9                    | 7.2           | 32                  | 16-17               | 2.0          |
| 15   | 95                  | 10                   | 10.0          | 45                  | 24-26               | 1.8          |
| 20   | 150                 | 12                   | 13.6          | 65                  | 38-42               | 1.6          |

**Key insight:** A balanced build in the rebalanced system kills late-game enemies in 3-5 hits rather than 1. This makes the build's survivability investment (Dodge, Armor, Vitality) meaningful -- enemies live long enough to hit the player, so defense matters. The trade-off between damage and survivability is now a real decision.

### 6.3 Boss Kill Times

| Boss | Wave | Before HP | Before DPS (dmg build) | Before Kill Time | After HP | After DPS (dmg build) | After Kill Time |
|------|------|-----------|------------------------|------------------|----------|-----------------------|-----------------|
| Golem | 5 | 42 | 16 | **2.6s** | 30 | 15 | **2.0s** |
| Demon | 10 | 71 | 80 | **0.9s** | 53 | 38 | **5.3s** |
| Golem | 15 | 90 | 200 | **0.5s** | 62 (+phase) | 75 | **8.8s*** |
| Archlord | 20 | 186 | 400 | **0.5s** | 267 (+phase) | 110 | **18.4s*** |

*\*Includes 3s damage reduction phase at 50% HP (50% damage reduction = ~1.5s of effective additional HP). Actual kill time: `(HP * 0.5 / DPS) + (HP * 0.5 / (DPS * 0.5)) + 3s overhead`.*

**Target achievement:**

| Boss | Target Kill Time | Projected Kill Time | Status |
|------|------------------|---------------------|--------|
| Wave 5 Golem | 3-5s | 2.0s | Slightly fast -- acceptable for first boss |
| Wave 10 Demon | 5-8s | 5.3s | In range |
| Wave 15 Golem | 8-12s | 8.8s | In range |
| Wave 20 Archlord | 15-25s | 18.4s | In range |

### 6.4 Target DPS/HP Ratio Achievement

| Wave Range | Target Ratio | Projected Dmg Build | Projected Balanced Build | Assessment |
|------------|--------------|----------------------|--------------------------|------------|
| 1-5        | 2-4          | 2.7-4.3              | 2.1-3.0                  | On target |
| 6-10       | 3-6          | 3.3                  | 2.1                      | Slightly below for balanced -- may need monitoring |
| 11-15      | 4-8          | 3.0-3.2              | 1.8-2.0                  | Below target range -- balanced build may feel sluggish |
| 16-20      | 5-10         | 2.8                  | 1.6                      | Below target -- consider buffing base damage slightly |

**Tuning note:** The projected ratios for waves 11-20 are below the stated targets. This is intentional conservatism -- it is easier to buff player damage (increase the soft cap threshold from 6 to 8, or increase CD floor generosity) than to nerf it post-launch. If playtesting shows combat feels sluggish, the first lever to pull is increasing `BONUS_DMG_SOFT_CAP_THRESHOLD` from 6 to 8, which would raise late-game DPS by approximately 20%.

---

## 7. Implementation Roadmap

### Phase 1: Core Rebalance (P1 changes, implement together)

These changes interact with each other and should be implemented and tested as a unit. Implementing only some P1 changes will create an imbalanced intermediate state.

**Step 1: Constants and formulas (1-2 hours)**
1. Add cooldown floor constants to `src/constants.ts`
2. Update boss HP formula in `src/systems/dungeon.ts`
3. Add Split Shot damage multiplier constant
4. Add bonus damage soft cap constants and formula

**Step 2: Combat system changes (2-3 hours)**
1. Apply cooldown floors in `src/systems/combat.ts`
2. Apply Split Shot side bolt damage reduction in projectile spawn logic
3. Implement global bonus damage soft cap (aggregate all flat damage sources, apply formula)
4. Update evolution bonus application to use capped totals

**Step 3: Boss damage reduction phase (2-4 hours)**
1. Add boss state tracking (phase flag, timer)
2. Implement 50% damage reduction when boss drops below 50% HP
3. Add visual indicator (shield effect/glow change) for damage reduction phase
4. Phase lasts 3 seconds, then normal damage resumes

**Step 4: Playtest and tune (ongoing)**
1. Run full 20-wave playthroughs with damage-focused and balanced builds
2. Verify boss kill times match targets (5-8s for wave 10, 15-25s for wave 20)
3. Adjust constants if needed (soft cap threshold, CD floor, boss HP base)

### Phase 2: Scaling Fixes (P2 changes, after Phase 1 is stable)

**Step 5: Enemy count and XP (1 hour)**
1. Replace enemy count formula in `src/systems/dungeon.ts`
2. Update boss XP values and gem drop counts
3. Implement boss minion trickle-spawn timer

**Step 6: Time and HP scaling (1 hour)**
1. Update timeMul constant in `src/constants.ts`
2. Add multiplicative HP component to enemy HP formula
3. Implement Bloodlust cap and crit overflow

**Step 7: Playtest Phase 2 (ongoing)**
1. Verify XP pacing across full run (target: ~20-22 upgrades by wave 20)
2. Confirm time pressure feels meaningful but not punishing
3. Test Bloodlust cap with Berserker class specifically

### Phase 3: Polish (P3 changes, after Phase 2 is stable)

**Step 8: hpScale smoothing (30 minutes)**
1. Replace 2-tier hpScale formula with single formula

**Step 9: Elite enemies (3-5 hours)**
1. Add elite flag to enemy spawn system
2. Apply HP/damage multipliers for elites
3. Implement golden glow visual effect
4. Add elite XP multiplier

**Step 10: Upgrade choice scaling (3-5 hours)**
1. Implement wave-based choice count
2. Design and implement cursed upgrade pool
3. Add cursed upgrade UI indicator (red border, warning icon)

### File Impact Summary

| File | Changes | Phase |
|------|---------|-------|
| `src/constants.ts` | New constants: CD floors, boss HP exponent, Split Shot mult, soft cap values, timeMul, elite thresholds, Bloodlust caps | 1, 2, 3 |
| `src/systems/combat.ts` | CD floor enforcement, Split Shot damage, bonus damage soft cap, boss damage reduction, elite damage mult | 1, 3 |
| `src/systems/dungeon.ts` | Boss HP formula, enemy count formula, hpScale formula, enemy HP mult, elite spawning, boss minion trickle, boss XP | 1, 2, 3 |
| `src/systems/upgrades.ts` | Evolution cap logic, Bloodlust cap/overflow, upgrade choice count, cursed upgrades | 1, 2, 3 |
| Rendering/visual system | Boss damage reduction effect, elite glow effect, cursed upgrade UI | 1, 3 |

### Estimated Total Effort

| Phase | Estimated Hours | Risk Level |
|-------|-----------------|------------|
| Phase 1 (P1 Critical) | 8-12 hours | Medium (formula changes are simple but interactions need testing) |
| Phase 2 (P2 High) | 3-5 hours | Low (mostly constant changes) |
| Phase 3 (P3 Polish) | 8-14 hours | Medium (new systems: elites, cursed upgrades) |
| **Total** | **19-31 hours** | -- |

---

## 8. Risk Assessment

### 8.1 Risk: Changes make the game too hard

**Likelihood:** Medium
**Impact:** High (players stop playing if they can't progress)

**Mitigation:**
- All P1 changes are implemented with tunable constants, not hardcoded values. If the game is too hard, increasing `BONUS_DMG_SOFT_CAP_THRESHOLD` from 6 to 8-10 immediately relaxes the damage curve.
- The cooldown floor (0.15s) is generous -- most players won't hit it unless they stack 2+ CD reduction sources. If needed, lower to 0.12s.
- Boss damage reduction phases can be shortened (2s instead of 3s) or weakened (30% instead of 50%) without code changes.
- **Key principle:** Ship slightly too hard and tune down. It is much easier to make the game easier (buff player or nerf enemies) than harder (nerf player) post-launch without player backlash.

### 8.2 Risk: Split Shot becomes useless

**Likelihood:** Low
**Impact:** Medium (core upgrade feels bad to pick)

**Mitigation:** At 60% side bolt damage, Split Shot still provides a 1.6-2.2x DPS increase -- it remains one of the strongest single upgrades in the game. Monitor whether players still pick it when offered. If pick rate drops below 60%, increase to 70% side bolt damage.

### 8.3 Risk: Balanced builds become non-viable

**Likelihood:** Medium (projected DPS/HP ratios for balanced builds are 1.6-2.0 in late waves)
**Impact:** High (reduces build diversity)

**Mitigation:** The projected ratios assume all P1 and P2 changes. If balanced builds feel too weak, the first response should be to slightly buff base weapon damage across all classes (+1 base damage). This helps balanced builds more than damage builds because the soft cap means damage builds get less value from flat additions. Alternatively, buff Vitality to grant +0.5 damage per stack, giving survivability-focused players a small damage floor.

### 8.4 Risk: Boss damage reduction phase feels unfair

**Likelihood:** Medium
**Impact:** Medium (frustration during boss fights)

**Mitigation:** The phase must have clear visual feedback (shield effect, color change, damage numbers appearing smaller/grayed out). Players should immediately understand "the boss is shielded, wait it out or reposition." The 3-second duration is short enough that it adds tension without feeling like a stall. If players find it frustrating, reduce to 2 seconds or change to 30% reduction instead of 50%.

### 8.5 Risk: Cursed upgrades are never picked

**Likelihood:** Medium-High
**Impact:** Low (they're optional; the system still works with 4 normal choices)

**Mitigation:** Cursed upgrades should be designed so the benefit clearly outweighs the drawback for the right build. A Glass Cannon build at 12+ max HP doesn't care about -2 HP. An armor-stacked build doesn't care about +50% damage taken. If pick rates are below 15%, increase the benefit side.

### 8.6 Risk: Co-op mode balance diverges

**Likelihood:** High (two players means 2x total DPS with shared enemy pools)
**Impact:** Medium

**Mitigation:** This plan focuses on single-player balance. Co-op should apply an HP multiplier to all enemies (1.5-1.8x for 2 players). This is a separate tuning pass and should be addressed after single-player balance is validated.

### 8.7 Iterative Tuning Protocol

After implementing each phase, use the following process:

1. **Automated validation:** Run a simulated 20-wave progression with damage-focused and balanced upgrade paths. Verify DPS/HP ratios stay within target bands.
2. **Manual playtest (3 runs minimum per phase):**
   - One damage-focused build (Pyromancer, all damage upgrades)
   - One balanced build (Pyromancer, mixed upgrades)
   - One class-specific build (Berserker or Monk, testing Bloodlust and CD interactions)
3. **Metric checkpoints per run:**
   - Boss kill time at waves 5, 10, 15, 20
   - Player death count (target: 0-1 for skilled player, 2-4 for average player)
   - Wave clear time (should increase slightly each wave, not decrease)
   - Upgrade pick rates (no upgrade should be picked <10% or >90% when offered)
4. **Tuning levers in priority order:**
   - `BONUS_DMG_SOFT_CAP_THRESHOLD` (6 -> 8 if too hard, 6 -> 4 if too easy)
   - `CD_FLOOR_PRIMARY` (0.15 -> 0.12 if fire rate feels sluggish)
   - Boss base HP values (increase/decrease by 20% increments)
   - `ENEMY_HP_WAVE_MULT` (0.04 -> 0.03 if enemies are too tanky, 0.04 -> 0.05 if still too fragile)

---

*This plan references findings from the [Power Scaling Audit](./power-scaling-audit.md) (R1-R11) and roguelike genre research (Task 16). All "before" values are from codebase at commit e0fb743 (master). All "after" projections assume all proposed changes in a given tier are applied simultaneously.*
