# Power Scaling Audit -- Wizard Duel (20-Wave Run)

**Date:** 2026-04-13
**Methodology:** Static analysis of game source code (constants.ts, dungeon.ts, combat.ts, physics.ts, upgrades system). All numbers derived from actual code, not playtesting.

---

## TL;DR -- Critical Findings

1. **Mid-game XP cliff (waves 8-10):** Enemy counts triple from wave 7 to 8 (19 -> 34), but XP thresholds also steepen. The player averages ~1.5 levels per wave in early game but drops to ~0.8 by wave 10. This creates a perceived stall right when enemies get harder.

2. **Late-game player DPS vastly outscales enemy HP:** A damage-focused build by wave 15 deals 15-25+ DPS per primary cast against enemies with 8-12 effective HP. The player one-shots nearly everything except bosses. Time-based scaling (timeMul) grows only ~0.75% per minute and cannot compensate.

3. **Survivability becomes trivial by wave 12-14:** With Dodge (3 stacks, 31%) + Armor (3 stacks, 3 reduction) + Life Steal, incoming damage is negligible. The iframe system (0.4s invulnerability per hit) limits true incoming damage to ~2.5 hits/second, and armor reduces most hits to 1 damage. Combined with 12+ max HP, the player is functionally immortal against non-boss enemies.

4. **Evolution upgrades are game-breaking:** Spell Mastery (+5 dmg all spells, -30% CD) and Lethal Precision (3x crit, +30% crit chance) are available around wave 10-12 and cause an immediate, massive power spike with no corresponding enemy scaling response.

5. **Boss HP does not keep pace:** The wave 20 Archlord has ~188 HP (with time scaling). A strong build deals 20-40+ damage per primary cast at 2-3 casts/second. The final boss dies in under 5 seconds, making the finale anticlimactic.

---

## 1. XP Accumulation & Level-Up Timing

### 1.1 XP Threshold Table

The XP system uses stepped-linear growth. Player starts at level 0 with `xpToNext = 20`.
After each level-up, `xpToNext += getXpStep(newLevel)`.

| Level | XP Step Added | Cumulative XP to Reach | XP to Next Level |
|-------|---------------|------------------------|------------------|
| 0->1  | --            | 20                     | 20               |
| 1->2  | +14           | 54                     | 34               |
| 2->3  | +14           | 102                    | 48               |
| 3->4  | +14           | 164                    | 62               |
| 4->5  | +14           | 240                    | 76               |
| 5->6  | +14           | 330                    | 90               |
| 6->7  | +18           | 438                    | 108              |
| 7->8  | +18           | 564                    | 126              |
| 8->9  | +18           | 708                    | 144              |
| 9->10 | +18           | 870                    | 162              |
| 10->11| +18           | 1050                   | 180              |
| 11->12| +25           | 1255                   | 205              |
| 12->13| +25           | 1485                   | 230              |
| 13->14| +25           | 1740                   | 255              |
| 14->15| +25           | 2020                   | 280              |
| 15->16| +25           | 2325                   | 305              |
| 16->17| +35           | 2665                   | 340              |
| 17->18| +35           | 3040                   | 375              |

### 1.2 Enemy Count & XP Per Wave

**Enemy count formulas (non-boss waves):**
- Waves 1-7: `5 + wave * 2`
- Waves 8-14: `10 + wave * 3`
- Waves 15-19: `15 + wave * 4`

**Boss waves (5, 10, 15):** boss + `2 + floor(wave/3)` minions
**Wave 20 (finale):** Archlord + 8 elites

**Average XP per enemy by wave** (weighted by spawn pool):

| Wave | Pool                                  | Avg XP/Enemy | Enemy Count | Boss? |
|------|---------------------------------------|--------------|-------------|-------|
| 1    | slime, bat                            | 3.0          | 7           | No    |
| 2    | slime, bat                            | 3.0          | 9           | No    |
| 3    | slime, bat, skeleton                  | 3.7          | 11          | No    |
| 4    | slime, bat, skeleton                  | 3.7          | 13          | No    |
| 5    | slime, bat, skeleton, wraith, spider, bomber | --    | Boss wave   | Golem |
| 6    | slime, bat, skeleton, wraith, spider, bomber | 5.2   | 17          | No    |
| 7    | slime, bat, skeleton, wraith, spider, bomber | 5.2   | 19          | No    |
| 8    | skeleton(x2), wraith(x2), spider, necro, shieldbearer, bomber, splitter | 7.0 | 34 | No |
| 9    | skeleton(x2), wraith(x2), spider, necro, shieldbearer, bomber, splitter | 7.0 | 37 | No |
| 10   | --                                    | --           | Boss wave   | Demon |
| 11   | skeleton, wraith(x2), spider, necro, shieldbearer, bomber, splitter, teleporter(x2) | 7.2 | 46 | No |
| 12   | skeleton, wraith(x2), spider, necro, shieldbearer, bomber, splitter, teleporter(x2) | 7.2 | 46 | No |
| 13   | late pool (with assassin, berserker, teleporter x2) | 7.8 | 49 | No |
| 14   | late pool                             | 7.8          | 52          | No    |
| 15   | --                                    | --           | Boss wave   | Golem |
| 16   | late pool                             | 7.8          | 79          | No    |
| 17   | late pool                             | 7.8          | 83          | No    |
| 18   | late pool                             | 7.8          | 87          | No    |
| 19   | late pool                             | 7.8          | 91          | No    |
| 20   | --                                    | --           | Boss wave   | Archlord |

**Late pool breakdown** (wave 13+): skeleton(5), wraith(8), necro(8), shieldbearer(10), assassin(8)x2, bomber(7), splitter(5), teleporter(10)x2, berserker(10)x2. Weighted avg = (5+8+8+10+8+8+7+5+10+10+10+10)/12 = **~7.8 XP**.

**Wave 5-7 pool**: slime(3), bat(3), skeleton(5), wraith(8), spider(5), bomber(7). Avg = (3+3+5+8+5+7)/6 = **~5.2 XP**.

**Wave 8-9 pool**: skeleton(5)x2, wraith(8)x2, spider(5), necro(8), shieldbearer(10), bomber(7), splitter(5). Avg = (5+5+8+8+5+8+10+7+5)/9 = **~6.8 XP**, rounded to 7.0.

### 1.3 Estimated XP Per Wave & Cumulative Level

Assumptions:
- Normal enemies drop their base XP split into ~4.5 gems (avg of 3-6). Each gem = ceil(xp/gemCount). Due to ceiling, total collected XP approximately equals base XP (slight rounding gain).
- Bosses drop 1 gem worth 2x their base XP.
- ~15% horde chance from wave 5+, adding 12 swarm_bat/slime (avg ~2.5 XP each = +30 XP). Expected value: 0.15 * 30 = **+4.5 XP/wave**.
- No XP Boost upgrade assumed (baseline path).
- Splitter deaths spawn 2 splitlings (2 XP each), adding ~4 XP per splitter killed. Included in later waves.

| Wave | Raw XP Gained | Horde EV | Total Wave XP | Cumulative XP | Level (end of wave) | Upgrades Available |
|------|---------------|----------|---------------|---------------|---------------------|--------------------|
| 1    | 7 * 3.0 = 21  | 0        | 21            | 21            | 1                   | 1                  |
| 2    | 9 * 3.0 = 27  | 0        | 27            | 48            | 1                   | 1                  |
| 3    | 11 * 3.7 = 41 | 0        | 41            | 89            | 1                   | 1                  |
| 4    | 13 * 3.7 = 48 | 0        | 48            | 137           | 2                   | 2                  |
| 5    | Golem(40) + 3 minions(~16) = 56 | 5 | 61   | 198           | 3                   | 3                  |
| 6    | 17 * 5.2 = 88 | 5        | 93            | 291           | 4                   | 4                  |
| 7    | 19 * 5.2 = 99 | 5        | 104           | 395           | 5                   | 5                  |
| 8    | 34 * 7.0 = 238| 5        | 243           | 638           | 7                   | 7                  |
| 9    | 37 * 7.0 = 259| 5        | 264           | 902           | 10                  | 10                 |
| 10   | Demon(50) + 5 minions(~35) = 85 | 5 | 90   | 992           | 10                  | 10                 |
| 11   | 46 * 7.2 = 331| 5        | 336           | 1328          | 12                  | 12                 |
| 12   | 46 * 7.2 = 331| 5        | 336           | 1664          | 13                  | 13                 |
| 13   | 49 * 7.8 = 382| 5        | 387           | 2051          | 15                  | 15                 |
| 14   | 52 * 7.8 = 406| 5        | 411           | 2462          | 16                  | 16                 |
| 15   | Golem(40) + 7 minions(~55) = 95 | 5 | 100  | 2562          | 16                  | 16                 |
| 16   | 79 * 7.8 = 616| 5        | 621           | 3183          | 18                  | 18                 |
| 17   | 83 * 7.8 = 647| 5        | 652           | 3835          | 20                  | 20                 |
| 18   | 87 * 7.8 = 679| 5        | 684           | 4519          | 22                  | 22                 |
| 19   | 91 * 7.8 = 710| 5        | 715           | 5234          | 23+                 | 23+                |
| 20   | Archlord(100) + 8 elites(~66) = 166 | 0 | 166 | 5400       | 24+                 | 24+                |

**Key observations:**
- Level 1 is reached during wave 1 (21 XP > 20 threshold). First upgrade at wave 1.
- Levels 2-5 are reached across waves 4-7 (one upgrade per wave).
- **Massive jump at wave 8:** Enemy count nearly doubles AND avg XP/enemy jumps from 5.2 to 7.0, yielding 243 XP (2+ levels in one wave).
- Boss waves (5, 10, 15) yield significantly less XP than the normal waves around them because they have far fewer total enemies.
- By wave 17-18, the player gains 600+ XP per wave but needs 340+ per level. Leveling slows to ~2 per wave.
- **Total upgrades over full run: ~24.** Each level-up triggers the upgrade screen.

### 1.4 XP Pacing Issues

**Issue: Boss waves are XP valleys.** Wave 10 gives only ~90 XP while waves 9 and 11 give 264 and 336 XP respectively. This feels punishing -- the hardest fight of the early-mid game gives the least reward.

**Issue: Wave 8 power spike.** Going from 19 enemies (wave 7) to 34 enemies (wave 8) with higher-XP types creates a massive XP burst that grants 2+ levels instantly. This is an upgrade windfall that makes wave 9-10 feel easier than they should be.

---

## 2. Player Power Trajectory

### 2.1 Base Stats Over Time

| Wave | Level | Max HP (base) | Max HP (with Vitality x2) | Mana Regen |
|------|-------|---------------|---------------------------|------------|
| 1    | 1     | 8             | 8                         | 14         |
| 4    | 2     | 8             | 8                         | 14         |
| 5    | 3     | 9 (+1 at L3)  | 13                        | 14         |
| 7    | 5     | 9             | 13                        | 14         |
| 9    | 10    | 11 (+1 at L6, L9) | 15                    | 14         |
| 12   | 13    | 12 (+1 at L12)| 16                        | 14         |
| 15   | 16    | 13 (+1 at L15)| 17                        | 14         |
| 20   | 24+   | 16 (+1 at L18, L21, L24) | 20+           | 14         |

HP growth: +1 every 3 levels = roughly +1 HP every 2 waves. With Vitality upgrade (max 5 stacks, diminishing after 3), a dedicated survivability build adds +2, +2, +2, +1.7, +1.5 = ~9.2 extra max HP.

### 2.2 Damage-Focused Build ("Glass Cannon" Path)

Assumed upgrade priority (using Pyromancer as reference, base LMB = 2 dmg, 0.35s CD):

| Upgrade # | Choice              | Effect on Primary DPS                   | Primary Dmg | Effective CD | Est. DPS |
|-----------|---------------------|-----------------------------------------|-------------|--------------|----------|
| Base      | --                  | 2 dmg, 0.35s CD                        | 2           | 0.35         | 5.7      |
| 1 (W1)   | Spell Power (1)     | +1 dmg all spells                       | 3           | 0.35         | 8.6      |
| 2 (W4)   | Rapid Fire          | Primary CD * 0.6                        | 3           | 0.21         | 14.3     |
| 3 (W5)   | Critical Strike (1) | 13% chance for 2x                       | 3 * 1.13    | 0.21         | 16.1     |
| 4 (W6)   | Spell Power (2)     | +1 dmg all spells                       | 4 * 1.13    | 0.21         | 21.5     |
| 5 (W7)   | Split Shot          | +2 extra projectiles                    | 4 * 1.13 * 3| 0.21        | 64.6*    |
| 6 (W8a)  | Spell Power (3)     | +1 dmg (full value, stack 3)            | 5 * 1.13 * 3| 0.21        | 80.7*    |
| 7 (W8b)  | Critical Strike (2) | 23% crit chance                         | 5 * 1.23 * 3| 0.21        | 87.9*    |
| 8 (W9a)  | Primary Boost (1)   | +2 dmg to primary                       | 7 * 1.23 * 3| 0.21        | 123.0*   |
| 9 (W9b)  | Spell Power (4)     | +0.86 dmg (diminished, stack 4)         | 7.86*1.23*3 | 0.21        | 138.1*   |
| 10 (W10)  | Critical Strike (3)| 31% crit chance                         | 7.86*1.31*3 | 0.21        | 147.3*   |

*\* Theoretical max DPS assumes all 3 split shots hit. In practice, ~60-80% hit rate on split shots against scattered enemies. Realistic DPS multiplier from split shot is ~2.2x rather than 3x.*

**Realistic damage-focused DPS at key waves:**

| Wave | Level | Approx Upgrades | Realistic Primary DPS | Notes |
|------|-------|------------------|-----------------------|-------|
| 1    | 1     | 1                | 8-9                   | Spell Power |
| 5    | 3     | 3                | 16-18                 | + Rapid Fire, Crit |
| 8    | 7     | 7                | 50-65                 | Split Shot + more stacks |
| 10   | 10    | 10               | 80-100                | Approaching evolution territory |
| 12   | 13    | 13               | 120-160               | Possible Spell Mastery evolution |
| 15   | 16    | 16               | 180-250+              | Multiple evolutions stacking |
| 20   | 24    | 24               | 300-500+              | Fully stacked, absurd |

### 2.3 Balanced Build Path

Assumed upgrade choices: mix of damage + survivability (Spell Power x2, Rapid Fire, Vitality x2, Dodge x2, Armor x1, Crit x1, misc utility).

| Wave | Level | Primary DPS (realistic) | Max HP | Dodge % | Armor | Effective HP* |
|------|-------|-------------------------|--------|---------|-------|---------------|
| 1    | 1     | 6-7                     | 8      | 0%      | 0     | 8.0           |
| 5    | 3     | 12-15                   | 11     | 0%      | 0     | 11.0          |
| 8    | 7     | 25-35                   | 13     | 13%     | 1     | 19.5          |
| 10   | 10    | 35-45                   | 14     | 23%     | 1     | 23.4          |
| 12   | 13    | 50-70                   | 16     | 23%     | 2     | 33.3          |
| 15   | 16    | 80-110                  | 18     | 31%     | 2     | 41.7          |
| 20   | 24    | 120-180                 | 22+    | 31%     | 3     | 63.8+         |

*\*Effective HP = maxHP / (1 - dodgeChance), adjusted for armor reducing each hit by flat amount. Against 2-damage enemies with 2 armor, each hit does 1 damage, so effective HP doubles again. Dodge stacks: 1=13%, 2=23%, 3=31% (hyperbolic).*

### 2.4 Upgrade Scaling Deep Dive

**Hyperbolic stacking formula: `1 - 1/(1 + acc)`**

| Stacks | Crit (0.15/stack) | Dodge (0.15/stack) | Life Steal (0.05/stack) | XP Boost (0.30/stack) |
|--------|-------------------|--------------------|-------------------------|-----------------------|
| 1      | 13.0%             | 13.0%              | 4.8%                    | 23.1%                 |
| 2      | 23.1%             | 23.1%              | 9.1%                    | 37.5%                 |
| 3 (max)| 31.0%             | 31.0%              | 13.0%                   | 47.4%                 |

**Flat diminishing: full value stacks 1-3, then `baseValue * ln(4)/ln(stacks+1)`**

| Stacks | Spell Power (+1) | Primary Boost (+2) | Armor (+1)  | Piercing (+1)  |
|--------|------------------|--------------------|-------------|----------------|
| 1      | +1.00            | +2.00              | +1.00       | +1.00          |
| 2      | +1.00            | +2.00              | +1.00       | +1.00          |
| 3      | +1.00            | +2.00              | +1.00       | +1.00          |
| 4      | +0.86            | +1.72              | +0.86       | +0.86          |
| 5 (max)| +0.77            | +1.54 (max 4)      | --          | --             |

Total Spell Power (5 stacks): 1+1+1+0.86+0.77 = **+4.63 dmg** to all spells.
Total Primary Boost (4 stacks): 2+2+2+1.72 = **+7.72 dmg** to primary.

Combined: a fully stacked primary does base + 4.63 + 7.72 = **base + 12.35 damage** from these two upgrades alone.

---

## 3. Enemy Effective Durability Trajectory

### 3.1 Enemy HP Scaling

**HP scaling formula:** `ceil((baseHP + hpScale - 1) * timeMul)`
- `hpScale`: waves 1-10 = `1 + floor(wave/4)`, waves 11+ = `2 + floor(wave/3)`
- `timeMul`: `1 + (time/60) * 0.05` -- assuming ~45s per wave, time at wave W start ~ (W-1)*45s

| Wave | hpScale | timeMul (est.) | Slime HP (base 2) | Skeleton HP (base 3) | Wraith HP (base 3) | Shieldbearer HP (base 8) |
|------|---------|----------------|--------------------|-----------------------|---------------------|--------------------------|
| 1    | 1       | 1.00           | 2                  | 3                     | --                  | --                       |
| 3    | 1       | 1.02           | 3                  | 4                     | --                  | --                       |
| 5    | 2       | 1.04           | 4                  | 5                     | 5                   | --                       |
| 7    | 2       | 1.05           | 4                  | 5                     | 5                   | --                       |
| 8    | 3       | 1.06           | 5                  | 6                     | 6                   | 11                       |
| 10   | 3       | 1.08           | 5                  | 6                     | 6                   | 11                       |
| 12   | 6       | 1.10           | 8                  | 9                     | 9                   | 15                       |
| 14   | 6       | 1.11           | 8                  | 10                    | 10                  | 15                       |
| 15   | 7       | 1.12           | 9                  | 10                    | 10                  | 16                       |
| 17   | 7       | 1.13           | 9                  | 11                    | 11                  | 16                       |
| 19   | 8       | 1.15           | 11                 | 12                    | 12                  | 18                       |
| 20   | 8       | 1.16           | 11                 | 12                    | 12                  | 18                       |

### 3.2 Boss HP

**Formula:** `ceil((baseHP + wave * 4) * timeMul)` for golem/demon, `ceil((60 + wave * 5) * timeMul)` for archlord.

| Wave | Boss Type | Base HP | Scaled HP | timeMul | Final HP |
|------|-----------|---------|-----------|---------|----------|
| 5    | Golem     | 20      | 20+20=40  | 1.04    | 42       |
| 10   | Demon     | 25      | 25+40=65  | 1.08    | 71       |
| 15   | Golem     | 20      | 20+60=80  | 1.12    | 90       |
| 20   | Archlord  | 60      | 60+100=160| 1.16    | 186      |

### 3.3 Enemy DPS Toward Player

Enemy damage is affected by `_dmgMul` (= timeMul at spawn time) and attack cooldowns.

**Average enemy DPS per individual enemy at key waves:**

| Enemy Type    | Base Dmg | Atk CD | Base DPS | Wave 10 (x1.08) | Wave 15 (x1.12) | Wave 20 (x1.16) |
|---------------|----------|--------|----------|------------------|------------------|------------------|
| Slime         | 1        | 1.0    | 1.0      | 1.08             | 1.12             | 1.16             |
| Bat           | 1        | 0.7    | 1.43     | 1.54             | 1.60             | 1.66             |
| Skeleton      | 1        | 1.4    | 0.71     | 0.77             | 0.80             | 0.83             |
| Wraith        | 2        | 0.8    | 2.50     | 2.70             | 2.80             | 2.90             |
| Assassin      | 3        | 1.2    | 2.50     | 2.70             | 2.80             | 2.90             |
| Shieldbearer  | 2        | 1.5    | 1.33     | 1.44             | 1.49             | 1.55             |
| Berserker     | 3        | 1.0    | 3.00     | 3.24             | 3.36             | 3.48             |

**Note:** Berserkers have the `enrage` flag: `1 + (1 - hp/maxHp) * 1.5` speed multiplier. At 50% HP they move 1.75x faster; at 25% HP they move 2.125x faster, dramatically increasing threat. However, damage is not directly scaled by enrage (only speed, which affects engagement rate).

**Total incoming DPS from all enemies per wave** (rough estimate, assumes ~50% of enemies are in attack range at once):

| Wave | Enemy Count | Avg Per-Enemy DPS | Active % | Total Incoming DPS | With 2 Armor | With 2 Armor + 30% Dodge |
|------|-------------|-------------------|----------|--------------------|--------------|--------------------------| 
| 1    | 7           | 1.0               | 40%      | 2.8                | 1.4          | 1.0                      |
| 5    | ~6 (boss wave) | 1.5            | 50%      | 4.5                | 2.5          | 1.8                      |
| 8    | 34          | 1.8               | 35%      | 21.4               | 9.5          | 6.7                      |
| 12   | 46          | 2.0               | 30%      | 27.6               | 13.8         | 9.7                      |
| 15   | ~10 (boss)  | 2.5               | 50%      | 12.5               | 7.5          | 5.3                      |
| 17   | 83          | 2.3               | 25%      | 47.7               | 27.0         | 18.9                     |
| 19   | 91          | 2.5               | 25%      | 56.9               | 33.2         | 23.2                     |

**Important caveat:** These incoming DPS numbers assume the player stands still. In practice, kiting reduces active enemies to 20-30%. Also, the 0.4s iframe after each hit dramatically limits true incoming damage to ~2.5 hits/second max regardless of enemy count.

**Actual maximum incoming DPS (iframe-limited):** 2.5 hits/sec * avg 2 dmg * timeMul = ~5-6 raw DPS at wave 15. With 2 armor: ~2.5 DPS. With dodge: ~1.75 DPS.

---

## 4. Power Ratio Analysis

### 4.1 Player DPS vs Enemy HP (Damage-Focused Build)

| Wave | Player DPS (primary) | Avg Enemy HP | Hits to Kill | Kill Time (s) | Ratio (DPS/HP) |
|------|----------------------|--------------|--------------|---------------|-----------------|
| 1    | 8.6                  | 2            | 1            | 0.35          | 4.3             |
| 3    | 8.6                  | 3-4          | 1-2          | 0.35-0.70     | 2.5             |
| 5    | 16                   | 4-5          | 1            | 0.21          | 3.6             |
| 7    | 16                   | 4-5          | 1            | 0.21          | 3.6             |
| 8    | 55                   | 5-6          | 1            | 0.21          | 10.0            |
| 10   | 80                   | 6            | 1            | 0.21          | 14.3            |
| 12   | 130                  | 9            | 1            | 0.21          | 15.6            |
| 15   | 200                  | 10           | 1            | 0.21          | 22.2            |
| 17   | 300                  | 11           | 1            | 0.21          | 30.0            |
| 20   | 400+                 | 12           | 1            | 0.21          | 36.4+           |

### 4.2 Player DPS vs Enemy HP (Balanced Build)

| Wave | Player DPS (primary) | Avg Enemy HP | Hits to Kill | Kill Time (s) | Ratio (DPS/HP) |
|------|----------------------|--------------|--------------|---------------|-----------------|
| 1    | 6                    | 2            | 1            | 0.35          | 3.0             |
| 5    | 13                   | 4-5          | 1            | 0.35          | 2.9             |
| 8    | 30                   | 5-6          | 1            | 0.35          | 5.5             |
| 10   | 40                   | 6            | 1            | 0.35          | 7.2             |
| 12   | 60                   | 9            | 1            | 0.35          | 7.2             |
| 15   | 95                   | 10           | 1            | 0.35          | 10.0            |
| 20   | 150                  | 12           | 1            | 0.21          | 13.6            |

### 4.3 Conceptual Power Curve

```
DPS / Enemy HP Ratio
40 |                                                          D
   |                                                     D
35 |                                                D
   |
30 |                                           D
   |
25 |
   |                                      D
20 |
   |                               D
15 |                          D         B
   |                     D         B
10 |                D         B
   |           D         B
 5 |      D    B    B
   | D  B
 1 |B
   +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--
     1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20
                              Wave

     D = Damage-focused build    B = Balanced build
```

**The tipping point is wave 8.** This is where the DPS/HP ratio begins accelerating away from 1. Before wave 8, the ratio stays in the 2.5-4.0 range (enemies take 1-2 hits). After wave 8, it climbs monotonically -- enemies are always one-shot, and the overkill grows each wave.

### 4.4 Boss Survivability

| Boss       | Wave | HP  | Dmg Build DPS | Kill Time | Balanced DPS | Kill Time |
|------------|------|-----|---------------|-----------|--------------|-----------|
| Golem      | 5    | 42  | 16            | 2.6s      | 13           | 3.2s      |
| Demon      | 10   | 71  | 80            | 0.9s      | 40           | 1.8s      |
| Golem      | 15   | 90  | 200           | 0.5s      | 95           | 0.9s      |
| Archlord   | 20   | 186 | 400           | 0.5s      | 150          | 1.2s      |

**The wave 10 Demon already dies in under 1 second on a damage build. The Archlord finale lasts about half a second.** This is a major design problem.

---

## 5. Specific Breakpoints & Findings

### 5.1 Critical Breakpoints

**Wave 1, Level 1:** Player picks first upgrade. A single Spell Power turns the Pyromancer's fireball from 2 -> 3 damage, which is enough to one-shot bats (1 HP) and two-shot slimes (2 HP). This feels appropriately powerful for the opening wave.

**Wave 5, Level 3 (3 upgrades):** With Spell Power + Rapid Fire + any third pick, primary DPS reaches ~16. The Golem boss (42 HP) takes about 2.5 seconds to kill. This is a reasonable boss fight difficulty.

**Wave 8, Level 7 (7 upgrades):** THIS IS THE BREAK POINT. With Split Shot (available by upgrade 5), every primary cast hits 3 targets. Combined with Spell Power stacks and Rapid Fire, the player is clearing 34 enemies with DPS far exceeding their HP. Most enemies die in a single hit. The wave feels trivially easy despite the jump in enemy count.

**Wave 10, Level 10 (10 upgrades):** Enough stacks for Critical Strike (max 3) at 31% crit chance. The Demon boss (71 HP) melts in under 1 second. Evolution upgrades start becoming available (Spell Power max 5 reached, Crit max 3 reached). Getting Spell Mastery (+5 all dmg, -30% CD) or Lethal Precision (3x crit, +30% chance) causes a second massive power spike.

**Wave 12-13, Level 13 (13 upgrades):** Invulnerability threshold. A balanced build with Dodge x2 (23%), Armor x2 (2), Vitality x2 (+4 HP), and Life Steal has:
- 16 max HP
- 23% dodge (2 stacks) or 31% with 3 stacks by wave 15
- 2 armor (reduces most hits to 1)
- ~9% life steal (2 stacks)
- Primary kills heal via vampirism
- The iframe system limits incoming hits to ~2.5/sec
- Net survivability: incoming 2.5 * 0.77 * max(1, dmg-2) = ~1.9 DPS taken, offset by life steal + vampirism healing

The player essentially cannot die unless they stand perfectly still in a swarm. By wave 15 (Dodge x3, Armor x3), this becomes even more pronounced.

**Wave 15-16, Level 16 (16 upgrades):** Trivial wave. Every non-boss enemy dies to a single primary cast (even split-shot side bolts kill on their own). With 80+ enemies per wave, the wave becomes a "screen clearing" exercise with zero strategic decision-making.

### 5.2 Most Broken Upgrade Combinations

**Tier S (Game-Breaking):**

1. **Split Shot + Spell Power (5) + Rapid Fire + Spell Mastery (evolution)**
   - 3 projectiles, each dealing base + 4.63 + 5 = ~12+ damage, every 0.15s
   - Total theoretical DPS: 240+ by wave 12
   - Trivializes all content including bosses

2. **Lethal Precision (evolution) + Critical Strike (3) + Primary Boost (4) + Primary Overload (evolution)**
   - 61% crit chance (31% base + 30% from Lethal Precision)
   - 3x crit multiplier
   - Primary deals base + 12.35 + 6 = ~20+ damage
   - Average hit: 20 * (0.39*1 + 0.61*3) = ~44 damage per projectile
   - Crits deal 60+ damage, one-shotting everything including boss minions

3. **Bloodlust (Berserker) + Rapid Fire + Kill Reset CD**
   - Each kill permanently increases attack speed by 5%
   - By 50 kills, attack speed has increased by 250%
   - Combined with kill-reset-CD, the berserker fires essentially continuously
   - This is arguably the most broken single combo because it scales without limit

**Tier A (Very Strong):**

4. **Dodge (3) + Armor (4) + Fortress (evolution) + Second Wind**
   - 31% dodge + 4 base armor + 3 evolution armor = 7 armor
   - Most enemies deal 1-3 damage, reduced to 1 by armor
   - With dodge, effective incoming DPS is ~0.5
   - Second Wind provides a safety net
   - Essentially immortal

5. **Chain Hit (3) + Chain Annihilation (evolution) + Split Shot**
   - Each projectile hit chains to 4+ enemies at full damage
   - With 3 split-shot projectiles, a single cast chains to 12+ enemies
   - In dense waves (15+), this creates cascading kill chains

### 5.3 Where Diminishing Returns Succeed

The hyperbolic stacking formula (`1 - 1/(1+acc)`) successfully prevents any single stat from reaching 100%. Even with maximum stacks:
- Crit caps at 31% (3 stacks of 0.15) -- reasonable, not overwhelming on its own
- Dodge caps at 31% (3 stacks of 0.15) -- strong but not invincible
- Life Steal caps at 13% (3 stacks of 0.05) -- meaningful but not dominant

The flat diminishing returns also work reasonably for individual stackable upgrades. Stack 4+ of Spell Power gives only 0.86 instead of 1.0.

### 5.4 Where Diminishing Returns Fail

1. **Cross-upgrade multiplication is not diminished.** While each individual upgrade has diminishing returns, combining Split Shot (3x projectiles) * Spell Power (+4.63) * Primary Boost (+7.72) * Rapid Fire (0.6x CD) * Critical Strike (31% for 2x) results in multiplicative scaling that dwarfs the individual diminishing returns. The total DPS multiplier from 10 upgrades is roughly 15-20x base, while enemy HP has only scaled 3-4x.

2. **Evolution upgrades bypass the diminishing curve.** Spell Mastery grants a flat +5 damage to ALL spells with no diminishing returns. This is stronger than the entire 5-stack diminished Spell Power chain (4.63). Similarly, Lethal Precision adds a flat +30% crit chance on top of the hyperbolic-capped 31%, pushing total crit to 61%.

3. **No diminishing returns on cooldown reduction.** Rapid Fire (0.6x), Swift Cast (0.8x), and Full Rotation (0.33x for 3s) multiply together: 0.6 * 0.8 = 0.48x base CD. This means the primary fires every 0.17s (Pyro) or 0.12s (Monk Chi Blast with 0.15 base). Cooldown stacking has no cap or diminishment.

4. **Split Shot has zero diminishing returns.** It is a flat 2x-3x damage multiplier (depending on hit rate) with no counterbalancing cost or limitation. There is no "accuracy penalty" or "damage split" for multi-shot.

### 5.5 Comparison to Task 16 Research

The task 16 research noted the old system had:
- **NO diminishing returns** (fixed) -- now using hyperbolic and flat-log scaling
- **Exponential XP thresholds** (fixed) -- now using stepped-linear

**Assessment of fixes:**

| Problem Identified | Fix Applied | Sufficient? |
|--------------------|-------------|-------------|
| No diminishing returns on stats | Hyperbolic stacking | YES for individual stats |
| Exponential XP curves | Stepped-linear thresholds | MOSTLY -- early game pacing is good, but wave 8 XP burst creates a spike |
| No multiplicative scaling cap | Not addressed | NO -- cross-upgrade multiplication remains unbounded |
| Linear enemy HP scaling | hpScale + timeMul | NO -- grows additively while player DPS grows multiplicatively |
| Boss HP scaling | wave*4 or wave*5 linear | NO -- completely inadequate vs multiplicative player DPS |
| Cooldown stacking | Not addressed | NO -- unlimited multiplicative CD reduction |

---

## 6. Recommendations Summary

### Priority 1: Critical (Game-Breaking)

**R1. Cap or diminish cooldown reduction stacking.**
Currently, Rapid Fire (0.6x) and Swift Cast (0.8x) multiply freely. Apply the same hyperbolic formula or set a minimum CD floor (e.g., 0.15s for primary, 1.5s for secondary).

**R2. Scale boss HP exponentially or add phase mechanics.**
Current boss HP formula `(base + wave*4) * timeMul` grows linearly. Suggestion: `base * (1.3 ^ (wave/5)) * timeMul` or add damage immunity phases. The Archlord should have at minimum 500+ effective HP by wave 20, not 186.

**R3. Apply diminishing returns to cross-upgrade DPS multiplication.**
The core problem is Split Shot * Spell Power * Crit * CD reduction. Options:
- Split Shot bolts deal reduced damage (e.g., side bolts at 60% damage)
- Cap total bonus damage from upgrades (e.g., max +8 from all flat dmg sources combined)
- Introduce a global DPS soft cap using the hyperbolic formula on total bonus damage

### Priority 2: High (Significant Balance Issues)

**R4. Fix the wave 8 enemy count jump.**
Going from 19 enemies (wave 7) to 34 (wave 8) is a 79% increase. Smooth this: waves 1-14 could use `5 + wave * 2.5` (rounding), giving wave 7 = 23, wave 8 = 25, wave 14 = 40. This removes the sudden XP windfall at wave 8.

**R5. Boss waves should give more XP.**
Wave 10 (boss) gives ~90 XP while waves 9 and 11 give 260+ XP each. Increase boss XP to 50-80 (base, so 100-160 with 2x gem), or add bonus minions that trickle in during the boss fight.

**R6. Cap or limit evolution upgrade stacking with other flat bonuses.**
Spell Mastery (+5 all) should not stack additively with Spell Power (+4.63). Options:
- Make evolution upgrades replace their parent effect (not add on top)
- Apply the flat-diminishing formula to the total combined bonus

**R7. Address Bloodlust (Berserker) infinite scaling.**
+5% attack speed per kill with no cap means by wave 15 (300+ kills), attack speed is 15x or higher. Add a cap (e.g., max 100% bonus = 2x speed from Bloodlust).

### Priority 3: Medium (Polish)

**R8. Time-based scaling (timeMul) is too weak.**
`1 + (time/60) * 0.05` = only +5% per minute. A 15-minute run gives +0.75% per minute effective. This should be at least 2-3x stronger (0.10-0.15 per minute) to create meaningful time pressure.

**R9. Late-game enemy variety does not compensate for power scaling.**
While assassins, teleporters, and berserkers are more dangerous mechanically, their HP does not keep up. A wave 17 assassin (2 base HP + 7 hpScale = 9 * 1.13 = ~11 HP) dies to any stray projectile. Consider adding elite/champion enemy variants in waves 15+ with 2-3x base HP and visual indicators.

**R10. hpScale formula has a discontinuity at wave 11.**
- Wave 10: `1 + floor(10/4)` = 3
- Wave 11: `2 + floor(11/3)` = 5
This is a jump from 3 to 5 (67% increase in bonus HP). While this helps, the jump is abrupt. Smooth the transition or document it as intentional difficulty spike.

**R11. Consider upgrade pick count scaling.**
Currently the player always picks from 3 upgrades. In late game (wave 15+), where the player has 15+ upgrades, many offered upgrades are redundant or irrelevant. Consider offering 4-5 choices in late game, or introducing "rare" upgrade tiers that only appear after wave 12.

### Summary Severity Matrix

| Issue | Impact | Effort to Fix | Priority |
|-------|--------|---------------|----------|
| Multiplicative DPS stacking (R3) | Critical | Medium | P1 |
| Boss HP too low (R2) | Critical | Low | P1 |
| CD reduction unbounded (R1) | High | Low | P1 |
| Wave 8 count jump (R4) | Medium | Low | P2 |
| Boss wave XP deficit (R5) | Medium | Low | P2 |
| Evolution balance (R6) | High | Medium | P2 |
| Bloodlust infinite (R7) | High | Low | P2 |
| timeMul too weak (R8) | Medium | Low | P3 |
| Late-game enemy HP (R9) | Medium | Medium | P3 |
| hpScale discontinuity (R10) | Low | Low | P3 |
| Upgrade pick scaling (R11) | Low | Medium | P3 |

---

*Audit performed against codebase at commit e0abbca (master). All values extracted from `src/constants.ts`, `src/systems/dungeon.ts`, `src/systems/combat.ts`, `src/systems/physics.ts`, and `src/systems/upgrades.ts`.*
