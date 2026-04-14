# Class Differentiation Audit

## Executive Summary

Spellstorm's 14 wizard classes suffer from severe mechanical homogeneity: all 14 share identical base stats (8 HP, 100 mana, 190 move speed, 13 collision size), 10 of 14 rely on a projectile-based LMB as their primary damage source, and the universal kiting loop (circle enemies at 190 speed while firing LMB and charging ultimate) dominates regardless of class choice. The result is that class selection is largely cosmetic — a Pyromancer, Ranger, and Druid player will execute nearly identical moment-to-moment gameplay despite thematic differences.

## Methodology

This audit examines all 14 classes across the following dimensions:

- **Base stat uniformity** — HP, mana, move speed, and collision size for every class
- **Primary attack (LMB) mechanics** — damage type, speed, fire rate, and effective DPS
- **Ability kit composition** — how RMB, Q, and R abilities create (or fail to create) unique gameplay loops
- **Passive design** — whether passives encourage distinct playstyles or are passively consumed
- **Upgrade paths** — whether class upgrades reinforce a unique identity or generically boost stats
- **Effective DPS comparison** — computed from damage, cooldown, and mana efficiency to identify convergence
- **Positional requirements** — whether the class rewards specific positioning or defaults to kiting

All numbers reference the current live data from `src/constants.ts`.

## Root Causes of Sameness

### 1. Identical Base Stats Across All 14 Classes

Every class shares:

| Stat | Value |
|------|-------|
| HP | 8 |
| Max Mana | 100 |
| Move Speed | 190 |
| Collision Size | 13 |

A Berserker (described as a melee tank) has the same health pool as a Ranger (described as a mobile glass cannon). A Knight (described as a damage-absorbing protector) moves at the same speed as a Monk (described as a fast martial artist). There is zero stat-driven differentiation. Every class begins the game with identical survivability, mobility, and resource pools, so the only differentiator is spell kit — and as detailed below, those converge too.

**Impact:** Without stat variation, there is no mechanical reason to play a class at close range versus long range. The Berserker has no extra HP to justify melee risk. The Monk has no extra speed to reward hit-and-run. All classes default to the safest possible distance — maximum LMB range while circle-kiting.

### 2. LMB Convergence — 10 of 14 Classes Fire Projectiles

| Class | LMB Type | Dmg | Speed | CD | Mana | Effective DPS |
|-------|----------|-----|-------|----|------|---------------|
| Pyromancer | Projectile | 2 | 400 | 0.35 | 8 | 5.71 |
| Cryomancer | Projectile | 1 | 520 | 0.22 | 6 | 4.55 |
| Arcanist | Homing | 1.5 | 300 | 0.28 | 7 | 5.36 |
| Necromancer | Projectile | 1.5 | 360 | 0.35 | 8 | 4.29 |
| Chronomancer | Projectile | 1.5 | 480 | 0.25 | 6 | 6.00 |
| Knight | Projectile | 2 | 350 | 0.4 | 4 | 5.00 |
| Paladin | Projectile | 2 | 380 | 0.35 | 7 | 5.71 |
| Ranger | Projectile | 1.5 | 600 | 0.25 | 4 | 6.00 |
| Druid | Projectile | 1.5 | 380 | 0.32 | 6 | 4.69 |
| Warlock | Projectile | 3 | 260 | 0.5 | 10 | 6.00 |
| Monk | Projectile | 1 | 500 | 0.15 | 3 | 6.67 |
| Engineer | Homing | 1.5 | 350 | 0.3 | 5 | 5.00 |
| **Stormcaller** | **Beam** | 1.5 | — | 0.28 | 7 | 5.36 |
| **Berserker** | **Cone (melee)** | 3 | — | 0.35 | 2 | 8.57 |

Only 2 of 14 classes use a fundamentally different LMB mechanic:
- **Stormcaller** uses a beam (instant-hit, 320 range, no projectile travel)
- **Berserker** uses a melee cone (50 range, 1.5 rad angle)

The remaining 12 classes all fire a projectile (or homing projectile) that the player aims in a direction while kiting. The moment-to-moment experience of pressing LMB — aim cursor, fire, strafe — is mechanically identical across these classes. Damage values cluster tightly between 4.29 and 6.67 effective DPS, meaning even the numerical feel is similar.

**Note on Monk:** Despite having the lowest per-hit damage (1), the Monk's 0.15s cooldown gives it the highest raw DPS (6.67) and fastest fire rate of any class. However, since its LMB is still a projectile at 500 speed, the actual gameplay loop remains "fire projectile while kiting" — just with more clicks per second.

### 3. No Movement Differentiation

All 14 classes move at 190 units/second. The only movement modifiers are:

- **Chronomancer passive:** +10% speed for a nearby ally (not self)
- **Berserker passive:** +50% speed below 50% HP (conditional, dangerous to activate)
- **Arcanist RMB:** Blink (170 range teleport, but 2.5s CD and 18 mana)
- **Knight Q:** Charge (200 range blink, 3.5s CD and 20 mana)
- **Monk RMB:** Flying Kick (180 range leap, but goes toward enemies)

No class has a permanently higher base move speed. Since kiting is the dominant survival strategy and kiting effectiveness scales linearly with move speed, all classes have identical kiting power. This is arguably the single biggest driver of homogeneous gameplay.

### 4. Generic Upgrades Reward All Classes Equally

The shared upgrade pool (not audited in detail here, but referenced from the progression rebalance plan) offers damage %, speed %, HP, and mana bonuses that apply identically to all classes. When a Ranger and a Pyromancer both take "+15% damage," the kiting playstyle of both is equally reinforced. There are no upgrades that say "melee attacks gain X" or "stationary casting grants Y" — nothing that would pull classes toward their intended niche.

Class-specific upgrades exist but are offered alongside generics, and generics are often mathematically superior because they multiply the already-effective kiting baseline.

### 5. Q Abilities Are Optional in the Kiting Meta

Most Q abilities are either:
- **Zone/AoE placements** (Blizzard, Plague, Consecrate, Temporal Field) that require enemies to stand still — but kiting moves enemies constantly
- **Delayed AoEs** (Meteor, Thunder) with telegraphed delays enemies may walk out of
- **Utility** (Rewind, Charge, Spirit Wolf, Summon Imp) that don't change the core loop

The high mana costs (15-45) and long cooldowns (4-12s) mean Q abilities are used situationally rather than defining the rotation. The core loop remains LMB spam + occasional RMB + ultimate when charged.

### 6. Ultimate Homogeneity

All 14 ultimates require exactly 100 charge. With 5 charge per hit (standard), that is 20 hits to charge. At average fire rates of ~0.3s, ultimates are available roughly every 6 seconds of sustained fire. This cadence is identical for all classes, meaning every class has the same "ultimate rhythm" regardless of kit design. The ultimate becomes a periodic damage spike that interrupts but does not differentiate the kiting loop.

## Class-by-Class Analysis

---

### 1. Pyromancer

**Mechanical Identity (on paper):** Fire-themed burst damage dealer with DoT (burn) and AoE explosions.

**Actual Playstyle:** Fire projectile at 400 speed while kiting. Fireball explodes on hit (35 radius) and applies 2s burn, but the player does not need to position differently to benefit from these effects — they are automatic on-hit. Flame Wave (RMB) requires facing enemies at 110 range, briefly interrupting the kite. Meteor (Q) is a delayed AoE that works best on stationary or funneled enemies.

**Differentiation Rating: Weak**

**Key Issues:**
- LMB is a standard projectile with passive bonus effects (explode + burn). The player does nothing differently to activate these.
- Burn damage (4 over 2s = 2 DPS) is invisible in practice — it does not change how you play, just adds background damage.
- Flame Wave's 110 range is close enough to be risky at 8 HP, so players avoid it in favor of more LMB spam.
- Meteor's 0.8s delay means it misses moving enemies unless they are crowd-controlled by a teammate.
- Wildfire (burn spread) and Magma Armor (melee attackers burn) are passive effects requiring no player input.
- Effectively a "generic projectile class with fire skin."

---

### 2. Cryomancer

**Mechanical Identity (on paper):** Crowd control specialist who slows enemies and combos with Frostbite (+1 dmg to slowed).

**Actual Playstyle:** Fire fast ice projectiles (0.22s CD, fastest non-Monk LMB) while kiting. Slow is applied automatically on hit. Frostbite bonus damage is consumed automatically. The player kites and spams LMB identically to every other projectile class — the slow just makes kiting slightly easier.

**Differentiation Rating: Weak**

**Key Issues:**
- Slow (0.6s duration) is a passive on-hit effect. The player does not aim or time it; it just happens.
- Frostbite (+1 damage to slowed enemies) is also automatic. Combined DPS: (1 + 1) / 0.22 = 9.09 effective DPS against slowed targets — strong numerically but requires zero player skill expression.
- Freeze Breath (RMB, 120 range cone) is another "face enemies briefly" ability that interrupts safe kiting.
- Blizzard (Q, 90 radius zone) is powerful CC but does not change the Cryomancer's own loop — they still kite and LMB.
- Shatter (frozen enemies explode) is the most interesting upgrade but requires freeze, which only Freeze Breath and certain synergies provide — not the core LMB loop.
- The class that should feel like a "control mage" plays like a slightly stickier projectile kiter.

---

### 3. Stormcaller

**Mechanical Identity (on paper):** Instant-hit lightning strikes with stun procs and chaining.

**Actual Playstyle:** The beam LMB (320 range, instant hit, no travel time) creates a genuinely different aiming experience. Instead of leading targets, the Stormcaller tracks them directly. Ball Zap (RMB) is a slow-moving AoE ball that zaps nearby enemies autonomously. Thunder (Q) is a strong delayed AoE with stun. The passive (every 5th hit stuns 0.5s) rewards sustained fire.

**Differentiation Rating: Strong**

**Key Issues (minor):**
- Beam LMB still encourages kiting at range, just with different aim mechanics.
- Ball Zap is fire-and-forget, not requiring active management.
- Chain Lightning upgrade (beam bounces) is the strongest differentiator — it rewards hitting grouped enemies, encouraging deliberate aim into clusters rather than picking off singles.
- Overcharge (3rd spell 3x dmg) adds a spell-counting minigame that no other class has.
- Overall the strongest mechanical identity among ranged classes.

---

### 4. Arcanist

**Mechanical Identity (on paper):** Mobile spellcaster with homing projectiles and teleportation.

**Actual Playstyle:** Homing LMB (2.5 homing strength) means the Arcanist barely needs to aim — fire in the general direction and bolts curve to targets. Blink (RMB) is a 170-range teleport on 2.5s CD, providing unique repositioning. However, the core loop is still "fire homing projectiles while moving" — the homing just makes it more forgiving. Barrage (Q, 7 projectiles) is a burst window.

**Differentiation Rating: Moderate**

**Key Issues:**
- Homing LMB reduces skill expression rather than adding it — the class is "easier projectile kiter" rather than "different playstyle."
- Blink is genuinely unique and creates aggressive/evasive positioning options, but its 2.5s CD means it is used reactively (dodge danger) rather than offensively (blink in, burst, blink out).
- Phase Shift (blink explodes 4 dmg) is the most interesting upgrade — it turns blink into an offensive tool, but competes with generic damage upgrades.
- Arcane Echo (25% LMB echo) is entirely passive.
- The class has the tools for a "battle mage" identity but the 8 HP / 190 speed base stats make aggressive blink usage too risky.

---

### 5. Necromancer

**Mechanical Identity (on paper):** Dark sustain mage who drains life from enemies and raises minions.

**Actual Playstyle:** Fire drain projectiles while kiting. Soul Bolt (LMB) heals 1 HP on hit, which is meaningful given the 8 HP pool. Death Coil (RMB) is a homing drain nuke. The passive (kills heal 1 HP) adds sustain. Plague (Q) is a zone DoT. The class is "projectile kiter with built-in sustain."

**Differentiation Rating: Moderate**

**Key Issues:**
- Life drain on LMB is passive — no player decision involved, it just heals.
- Soul Harvest + drain means the Necromancer is the hardest class to kill through attrition, but this does not change the loop — it just makes kiting more forgiving.
- Raise Dead (25% kill chance to spawn ally) is the most distinctive mechanic — it creates an army over time. But minions are AI-controlled, not player-directed.
- Death Mark (+3x dmg below 20% HP) adds execute gameplay but is a passive check, not an active decision.
- Plague zone (Q) has the same "place and forget" issue as other zone abilities.
- The class fantasy of "necromancer commanding undead" is undermined by the summon being a passive kill proc rather than an active ability.

---

### 6. Chronomancer

**Mechanical Identity (on paper):** Time manipulation — haste allies, slow enemies, rewind mistakes.

**Actual Playstyle:** Fire fast projectiles (0.25s CD, 480 speed) while kiting. The LMB applies a micro-stun (0.15s) that is nearly imperceptible. Temporal Field (RMB) is a powerful slow zone but is placed and forgotten. Rewind (Q) is a panic button used once per emergency. The Haste Aura passive helps an ally, not the Chronomancer.

**Differentiation Rating: Weak**

**Key Issues:**
- LMB is a fast projectile with a 0.15s stun — functionally identical to other projectile classes. The stun is too short to be felt.
- Temporal Field (2.5x slow for 3.5s) is strong CC but does not change the Chronomancer's own actions — they still kite and LMB.
- Rewind (restore HP/mana snapshot) is the most unique ability in the game conceptually, but with a 12s CD and 45 mana cost, it is a once-per-fight panic button rather than a rotation-defining ability.
- Haste Aura (+10% speed for nearby ally) is invisible in solo play and barely noticeable in co-op.
- Time Loop (death rewind) is powerful but entirely passive — the player does not activate it.
- Haste Zone (RMB buffs allies 2x speed) is the best upgrade for co-op differentiation, but in solo the class has almost no unique identity.
- The class that should feel like "manipulating the flow of time" plays like a generic fast-attacking mage.

---

### 7. Knight

**Mechanical Identity (on paper):** Tank who absorbs damage, stuns enemies, and protects allies.

**Actual Playstyle:** Fire shield projectiles (pierce 1) while kiting. Shield Rush (RMB, 100-range leap + 1.5s stun) is a strong engagement tool but requires closing to melee range at 8 HP. Charge (Q, 200-range blink) provides mobility. Bulwark (25% damage reduction) is the strongest passive defensive ability.

**Differentiation Rating: Moderate**

**Key Issues:**
- Shield Throw is a projectile with pierce — mechanically identical to other projectile LMBs except for passing through one target.
- Shield Rush creates a genuinely unique "dive in, stun, get out" pattern — but with only 8 HP and no extra armor, diving is extremely risky. The class is designed as a tank but has no tank stats.
- Charge (Q) is a blink with no damage — purely utility. It pairs well with Shield Rush (charge in, stun, charge out) but the double mana cost (15 + 20 = 35) is steep.
- Fortress (+5 armor when stationary) directly conflicts with the kiting meta — standing still is death.
- Rally (RMB boosts ally 30% dmg/spd) is a strong co-op upgrade but requires the Knight to be near allies.
- Bulwark (25% DR) is meaningful: 8 HP with 25% DR is effectively 10.67 HP — the highest effective HP of any class. But this only matters if you get hit, and kiting avoids hits.
- The class would be strong with 12-15 HP and 160 speed. At 8 HP / 190 speed, it is a slightly tankier projectile kiter.

---

### 8. Berserker

**Mechanical Identity (on paper):** Melee brawler who gets stronger as HP drops.

**Actual Playstyle:** The only true melee class. Axe Swing (cone, 50 range, 1.5 rad angle) requires being in enemy faces. Fury (+50% damage and speed below 50% HP) creates a high-risk, high-reward dynamic. Leap Slam (Q) is a gap closer. Throwing Axe (RMB) provides ranged poke.

**Differentiation Rating: Strong**

**Key Issues:**
- Axe Swing's 50 range forces fundamentally different positioning — the Berserker cannot kite at distance.
- Fury's +50% speed (190 → 285) at low HP is the only substantial move speed modifier in the game, creating a dramatically different feel.
- 8 HP is catastrophically low for a melee class. Fury activates at 4 HP or below — one hit from death against many enemies.
- The class has the highest theoretical DPS (8.57 base, 12.86 with Fury) but the lowest survivability when using it.
- Throwing Axe (RMB, 500 speed projectile) is a concession that the melee loop is too dangerous — many Berserker players default to RMB spam at range, which makes the class a slower Ranger.
- Whirlwind (360° LMB) and Bloodlust (+2 HP on kill) are strong melee-reinforcing upgrades.
- The class genuinely plays differently **when players commit to melee**, but the game punishes melee so harshly that many revert to ranged RMB kiting.

---

### 9. Paladin

**Mechanical Identity (on paper):** Support healer who protects allies and deals bonus damage to CC'd enemies.

**Actual Playstyle:** Fire smite projectiles (explode 25 radius) while kiting. Holy Shield (RMB) protects an ally but does no damage. Consecrate (Q) is a heal/damage zone. Aura of Light (2 HP/s to nearby ally) is a powerful passive heal.

**Differentiation Rating: Moderate**

**Key Issues:**
- In co-op, the Paladin has meaningful differentiation: Aura of Light (2 HP/s), Holy Shield, and Consecrate healing create a genuine support identity.
- In solo play, Aura of Light does nothing, Holy Shield has no target, and the Paladin is just "Pyromancer with slightly smaller explosions."
- Smite (LMB) is a standard exploding projectile — identical feel to Pyromancer's Fireball.
- Divine Smite (+3 dmg to stunned/slowed) encourages combo play but relies on the Paladin or an ally providing CC first.
- Guardian Angel (RMB heals 3 HP) and Wrath of Heaven (LMB stuns 0.5s) add interesting layers but are upgrade-gated.
- The class is a poster child for "co-op identity exists, solo identity does not."

---

### 10. Ranger

**Mechanical Identity (on paper):** Long-range DPS with fast attacks and high mobility.

**Actual Playstyle:** Fire arrows (fastest projectile: 600 speed, 0.25s CD) while kiting. Eagle Eye (+30% range, crits at max range) rewards staying at distance. Volley (RMB, 4 arrows) is a burst window. Trap (Q) provides area denial.

**Differentiation Rating: Weak**

**Key Issues:**
- The Ranger is the most generic class: fire projectile, stay at range, kite. This is literally what every class already does — the Ranger just does it with the fastest and longest-range projectile.
- Eagle Eye's max-range crit is interesting on paper but since all classes already operate at max range while kiting, it is a passive DPS increase with no gameplay change.
- Arrow speed (600) is the highest in the game, making it the easiest projectile to land. This reduces skill expression.
- Trap (Q) is placed on the ground — good for funneling but does not change the Ranger's own actions.
- Multi-Shot (LMB fires 3) is a direct DPS increase that reinforces the existing loop.
- Headhunter (+50% crit to full HP) rewards target-switching but is a passive bonus.
- Evasive Roll (dodge on RMB) is the most interesting upgrade — it adds a dodge mechanic — but is locked behind an upgrade choice.
- The Ranger's identity is "the default playstyle, but slightly better at it." This makes it feel like the baseline all other classes should be compared against.

---

### 11. Druid

**Mechanical Identity (on paper):** Nature hybrid: summons, heals, and DoT.

**Actual Playstyle:** Fire thorn projectiles (burn 3 + slow 0.4) while kiting. Entangle (RMB) is a root zone. Spirit Wolf (Q) summons an AI companion. Regrowth (1 HP/10s) is negligible sustain.

**Differentiation Rating: Weak**

**Key Issues:**
- Thorn Shot is a projectile with burn and slow — automatic on-hit effects that do not change player behavior.
- Regrowth (1 HP per 10 seconds) is the weakest passive in the game. At 8 HP, this heals the full pool in 80 seconds — far too slow to matter in combat.
- Entangle (root zone, no damage) is a strong CC tool but the Druid still just kites and LMBs around it.
- Spirit Wolf (Q) is an AI summon the player does not control — it fights on its own.
- Pack Leader (wolves +50%) reinforces the summon identity but wolves are still AI-controlled.
- Thorns (+2 contact damage) requires enemies to hit the Druid — contradicting the kiting playstyle.
- Nature's Bounty (kills → heal zone) is passive.
- The Druid is split between summoner, healer, and DoT dealer but excels at none. In practice it plays as a slightly slower projectile kiter with a pet.

---

### 12. Warlock

**Mechanical Identity (on paper):** High risk/reward caster who trades HP for mana and deals heavy damage.

**Actual Playstyle:** Fire slow, heavy Shadow Bolts (260 speed, 3 dmg, 0.5s CD) while kiting. Dark Pact (30% mana refund but costs 1 HP per cast) creates a genuine resource tension. Drain Life (RMB, beam) provides sustain. Summon Imp (Q) adds an AI companion.

**Differentiation Rating: Moderate**

**Key Issues:**
- Dark Pact is the most mechanically interesting passive in the game: every spell cast costs 1 HP but refunds 30% mana. This creates constant risk/reward decisions about when to cast vs. conserve.
- Shadow Bolt's slow speed (260, slowest LMB) means the Warlock must lead targets more than other classes — a subtle but real aiming difference.
- Drain Life (RMB beam) is a second beam-type attack in the game (alongside Stormcaller), providing a different feel for sustain.
- However, the core loop is still "fire projectile while kiting" — just with HP cost anxiety.
- Corruption (stacking DoT on LMB) is a strong identity upgrade that rewards sustained fire on single targets.
- Soul Siphon (drain +100%) makes the Warlock nearly unkillable during Drain Life.
- The class has the strongest "risk management" identity but it still resolves as projectile kiting with a health bar that ticks down.

---

### 13. Monk

**Mechanical Identity (on paper):** Fast melee martial artist with dodge and combo potential.

**Actual Playstyle:** Fire the fastest projectiles in the game (0.15s CD, 500 speed) while kiting. Inner Peace (25% dodge) is entirely passive. Flying Kick (RMB) is a gap closer that goes toward enemies. Chi Burst (Q) is a small heal zone.

**Differentiation Rating: Moderate**

**Key Issues:**
- Despite the "melee martial artist" description, Chi Blast (LMB) is a ranged projectile. The Monk plays as a ranged class.
- The 0.15s fire rate (fastest in the game) creates a distinct "machine gun" feel with constant inputs — this is the primary differentiator.
- Inner Peace (25% dodge) is powerful but invisible — the player does nothing to activate it.
- Flying Kick (RMB, 180 range leap, 4 dmg) is designed for melee engagement but going toward enemies at 8 HP is risky.
- Chi Burst (Q, heal zone, 40 radius, 2 HP/s) is tiny and stationary — it conflicts with the kiting loop.
- Combo Master (3rd hit AoE) adds a rhythm-counting element that is unique and interesting.
- Seven-Star Strike (RMB bonus per target) rewards diving into groups — but again, 8 HP.
- The Monk should be the game's fast melee class but is actually its fastest ranged class. The melee fantasy is a lie.

---

### 14. Engineer

**Mechanical Identity (on paper):** Turret-building area controller.

**Actual Playstyle:** Deploy Turret (RMB, 15s duration, 120 radius, fires every 0.8s) then fire homing wrenches (LMB) while kiting near turret. Mine Field (Q, 3 mines) provides area denial. The turret-centric gameplay is genuinely different from other classes.

**Differentiation Rating: Strong**

**Key Issues:**
- Deploy Turret creates a unique "anchor point" dynamic — the Engineer wants to fight near their turret for maximum combined DPS, discouraging pure kiting circles.
- Turret duration (15s) and cooldown (6s) mean the Engineer always has a turret active, creating persistent area control.
- Mine Field (3 mines, 4 dmg each) adds trap-based area denial that rewards map awareness and prediction.
- Overclock (turrets fire 20% faster) is a passive but reinforces the turret identity.
- Wrench Throw (homing 1.0) has the weakest homing in the game — it curves slightly but still requires rough aim.
- Rocket Turret (+2 dmg, +AoE) and Chain Mines (chain explosions) are strong identity-reinforcing upgrades.
- Repair Bot (turrets heal 1 HP/s) adds an interesting risk/reward: stay near turret for heals or kite away and lose sustain.
- The Engineer's weakness is that turrets are stationary in a game about movement. If enemies overwhelm the turret position, the Engineer must abandon it and becomes a generic homing-projectile kiter.

---

## Differentiation Tier List

### Tier 1 — Strong Identity (plays fundamentally differently)

| Class | Reason |
|-------|--------|
| **Stormcaller** | Only beam-LMB in the game; instant-hit changes aiming fundamentals. Chain Lightning rewards cluster targeting. Overcharge adds spell-counting minigame. Static (stun every 5th hit) rewards sustained fire tracking. |
| **Berserker** | Only melee-LMB in the game; 50-range cone forces close combat. Fury (+50% dmg/speed at low HP) creates unique risk/reward. Highest theoretical DPS (12.86 with Fury). Only class with a movement speed steroid. |
| **Engineer** | Only turret-builder; anchor-point gameplay opposes kiting. Persistent area control via 15s turrets. Mine Field adds prediction-based area denial. Repair Bot creates "stay near turret" risk/reward. |

### Tier 2 — Moderate Identity (unique elements but defaults to kiting)

| Class | Reason |
|-------|--------|
| **Arcanist** | Blink (RMB) is unique repositioning tool. Homing LMB reduces aim requirement — different feel but same loop. Phase Shift upgrade creates "blink offense" option. |
| **Monk** | Fastest fire rate (0.15s) creates "machine gun" feel. 25% dodge is invisible but impactful. Combo Master adds rhythm element. But described as melee, plays as ranged. |
| **Knight** | Shield Rush stun (1.5s) is strongest non-ultimate CC. Bulwark (25% DR) gives highest effective HP. But 8 base HP prevents actual tanking. Charge+Rush dive combo exists but is suicidal. |
| **Paladin** | Genuine support identity in co-op (2 HP/s aura, shield, heal zone). Completely generic in solo. Divine Smite rewards CC combos. |
| **Warlock** | Dark Pact (HP cost for mana) is most interesting resource mechanic in the game. Drain Life beam provides unique sustain channel. Slow LMB (260 speed) changes aiming. |
| **Necromancer** | Drain sustain creates "unkillable kiter" identity. Raise Dead summons are unique army-building mechanic. But all sustain/summons are passive — no active decisions. |

### Tier 3 — Weak Identity (virtually interchangeable projectile kiter)

| Class | Reason |
|-------|--------|
| **Pyromancer** | Fireball is a projectile with auto-explode and auto-burn. No mechanical difference from other projectile LMBs. Flame Wave's 110 range is too risky at 8 HP. Fire theme is cosmetic only. |
| **Cryomancer** | Ice Shard is a projectile with auto-slow. Frostbite bonus is auto-consumed. Blizzard zone is placed and forgotten. Slow makes kiting easier but does not change the kiting loop. |
| **Ranger** | Literally the default kiting playstyle but with the best projectile stats (600 speed, 0.25s CD). Eagle Eye is a passive range/crit bonus. Trap is placed and forgotten. No active mechanic changes gameplay. |
| **Druid** | Thorn Shot is a projectile with auto-burn + auto-slow. Regrowth is the weakest passive (1 HP/10s). Spirit Wolf is AI-controlled. Nature's Bounty is passive. Split identity, excels at nothing. |
| **Chronomancer** | Time Bolt is a fast projectile with imperceptible 0.15s stun. Temporal Field is placed and forgotten. Rewind is a panic button. Haste Aura helps ally, not self. Time manipulation fantasy is unfulfilled. |

---

## Recommendations

### Priority 1: Differentiate Base Stats (Highest Impact, Lowest Effort)

This single change would have the largest impact on class feel. Proposed direction:

| Archetype | HP | Move Speed | Mana | Rationale |
|-----------|----|------------|------|-----------|
| Glass Cannon (Pyro, Cryo, Storm, Chrono) | 6 | 195 | 110 | Squishy but fast and high-resource |
| Battle Mage (Arcanist, Warlock, Necro) | 8 | 190 | 100 | Balanced (current baseline) |
| Support (Paladin, Druid) | 9 | 185 | 110 | Slightly tanky, slower, high mana for heals |
| Melee (Berserker, Monk) | 12 | 210 | 80 | High HP to survive close range, fast, low mana |
| Tank (Knight) | 15 | 170 | 80 | Very tanky, slow, low mana |
| Specialist (Engineer, Ranger) | 7 | 195 | 90 | Fragile but mobile |

This creates immediate mechanical differentiation: a Knight at 170 speed cannot kite as effectively as a Ranger at 195, pushing the Knight toward its intended "stand and fight" identity. A Berserker at 12 HP can actually survive melee range. A Pyromancer at 6 HP must respect danger zones.

### Priority 2: Diversify LMB Mechanics

The 10 projectile-LMB classes need mechanical variation, not just number tweaks:

- **Pyromancer:** Change LMB to a short-range flamethrower (continuous cone, ~100 range). Rewards aggressive positioning and synergizes with burn theme.
- **Cryomancer:** Add "freeze stacks" — 3 consecutive hits on same target freezes for 1s. Rewards target focus over spray.
- **Ranger:** Add a charge mechanic — hold LMB for higher damage/pierce. Rewards timing over spam.
- **Druid:** Change LMB to a pet command — LMB directs wolves to attack a target. Primary DPS comes from summons, not personal projectiles.
- **Chronomancer:** Make LMB accelerate over time — consecutive hits on same target increase fire rate. Rewards sustained commitment to one target.
- **Monk:** Change Chi Blast to a melee combo chain (punch-punch-kick) at 80 range. Fulfill the melee fantasy.

### Priority 3: Make Q Abilities Rotation-Defining

Q abilities should be integral to the class loop, not optional cooldowns:

- Reduce Q cooldowns by 30-50% across the board
- Reduce Q mana costs by 20-30%
- Add Q-LMB synergies: e.g., Pyromancer Meteor leaves a fire zone that doubles Fireball damage when shot through it
- Make some Q abilities toggles or stances rather than one-shot effects

### Priority 4: Vary Ultimate Charge Rates

Instead of uniform 100 charge / 5 per hit, differentiate:

| Class | Charge Required | Charge Method |
|-------|----------------|---------------|
| Berserker | 80 | +8 per melee hit (rewards risk) |
| Engineer | 120 | +3 per turret hit (slow but passive) |
| Paladin | 80 | +5 per hit, +10 per ally healed (rewards support) |
| Warlock | 60 | +5 per hit, costs 2 HP to activate (risk/reward) |
| Others | 100 | Standard +5 per hit |

### Priority 5: Add Movement Archetypes

Introduce permanent movement modifiers tied to class identity:

- **Monk:** 220 base speed, +10% after dodge proc (fast skirmisher)
- **Knight:** 170 base speed, cannot be knocked back (immovable)
- **Berserker:** 180 base speed, +50% at low HP (unchanged Fury)
- **Ranger:** 200 base speed, +15% for 2s after landing a max-range crit
- **Chronomancer:** 190 base speed, all allies in aura gain +15% speed (support identity)

### Priority 6: Rework Tier 3 Class Kits

The five Tier 3 classes (Pyromancer, Cryomancer, Ranger, Druid, Chronomancer) need the most work. Each should have at least one mechanic that changes the moment-to-moment decision-making:

- **Pyromancer** needs a reason to be close (flamethrower) or a unique combo (burn-stacking into a detonation).
- **Cryomancer** needs an active freeze mechanic that rewards skill (e.g., shatter combo: slow → freeze → shatter for burst).
- **Ranger** needs a charged shot or aimed-shot mechanic that rewards precision over spam.
- **Druid** needs active pet control or a shapeshifting mechanic that changes their LMB.
- **Chronomancer** needs time manipulation to be felt — e.g., rewinding projectiles, time-echoing abilities, or a "fast-forward" stance that doubles fire rate but drains HP.

---

## Appendix: DPS and Mana Efficiency Comparison

### Raw LMB DPS (damage / cooldown)

| Rank | Class | DPS | Notes |
|------|-------|-----|-------|
| 1 | Berserker | 8.57 | Melee only, 50 range |
| 2 | Monk | 6.67 | Fastest fire rate (0.15s), lowest per-hit (1) |
| 3 | Chronomancer | 6.00 | Fast projectile, micro-stun |
| 4 | Ranger | 6.00 | Fastest projectile (600 speed) |
| 5 | Warlock | 6.00 | Slowest projectile (260 speed), highest per-hit (3) |
| 6 | Pyromancer | 5.71 | + explosion + burn |
| 7 | Paladin | 5.71 | + explosion (25 radius) |
| 8 | Arcanist | 5.36 | Homing |
| 9 | Stormcaller | 5.36 | Beam (instant hit) |
| 10 | Knight | 5.00 | Pierce 1 |
| 11 | Engineer | 5.00 | Weak homing (1.0) |
| 12 | Druid | 4.69 | + burn + slow |
| 13 | Cryomancer | 4.55 | + slow (but +1 dmg via Frostbite = 9.09 effective) |
| 14 | Necromancer | 4.29 | + drain 1 HP |

### Mana Efficiency (damage per mana spent)

| Rank | Class | Dmg/Mana | Notes |
|------|-------|----------|-------|
| 1 | Berserker | 1.50 | 3 dmg / 2 mana |
| 2 | Ranger | 0.375 | 1.5 dmg / 4 mana |
| 3 | Knight | 0.50 | 2 dmg / 4 mana |
| 4 | Monk | 0.33 | 1 dmg / 3 mana |
| 5 | Warlock | 0.30 | 3 dmg / 10 mana |
| 6 | Engineer | 0.30 | 1.5 dmg / 5 mana |
| 7 | Paladin | 0.286 | 2 dmg / 7 mana |
| 8 | Pyromancer | 0.25 | 2 dmg / 8 mana |
| 9 | Druid | 0.25 | 1.5 dmg / 6 mana |
| 10 | Chronomancer | 0.25 | 1.5 dmg / 6 mana |
| 11 | Arcanist | 0.214 | 1.5 dmg / 7 mana |
| 12 | Stormcaller | 0.214 | 1.5 dmg / 7 mana |
| 13 | Necromancer | 0.188 | 1.5 dmg / 8 mana |
| 14 | Cryomancer | 0.167 | 1 dmg / 6 mana (but Frostbite raises effective to 0.33) |

### Mana Drain Rate (mana consumed per second of continuous fire)

| Rank | Class | Mana/s | Seconds to Drain 100 Mana |
|------|-------|--------|---------------------------|
| 1 | Monk | 20.0 | 5.0s |
| 2 | Cryomancer | 27.3 | 3.7s |
| 3 | Chronomancer | 24.0 | 4.2s |
| 4 | Pyromancer | 22.9 | 4.4s |
| 5 | Arcanist | 25.0 | 4.0s |
| 6 | Stormcaller | 25.0 | 4.0s |
| 7 | Paladin | 20.0 | 5.0s |
| 8 | Warlock | 20.0 | 5.0s |
| 9 | Druid | 18.75 | 5.3s |
| 10 | Necromancer | 22.9 | 4.4s |
| 11 | Engineer | 16.67 | 6.0s |
| 12 | Ranger | 16.0 | 6.25s |
| 13 | Knight | 10.0 | 10.0s |
| 14 | Berserker | 5.71 | 17.5s |

**Key insight:** Knight and Berserker have dramatically better mana efficiency, but this advantage is invisible because all classes rarely run out of mana during normal kiting gameplay. Mana efficiency only matters if mana is scarce — which it currently is not at 100 base mana for all classes.
