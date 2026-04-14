# League of Legends Archetype Research for Spellstorm Class Design

> Research document analyzing LoL champion subclasses, transferable mechanics, and new class concepts for Spellstorm's wizard roster. Focus: mechanics that break the circle-kiting meta and create genuinely distinct playstyles.

---

## Table of Contents

1. [Champion Archetype Categories](#1-champion-archetype-categories)
2. [Transferable Mechanics](#2-transferable-mechanics)
3. [Anti-Kiting Mechanic Ideas](#3-anti-kiting-mechanic-ideas)
4. [Recommended New Class Concepts](#4-recommended-new-class-concepts)
5. [Mechanics That Don't Translate Well](#5-mechanics-that-dont-translate-well)

---

## 1. Champion Archetype Categories

League of Legends classifies champions into subclasses that each imply a specific relationship with space, time, and risk. Below is each subclass mapped to its Spellstorm translation potential.

### Mages

| LoL Subclass | Core Identity | LoL Examples | Spellstorm Translation |
|---|---|---|---|
| **Burst Mage** | Dump full rotation in 1-2 seconds for lethal damage, then wait on cooldowns | Syndra, Lux, Annie, Veigar | Natural fit. Most existing casters already lean this way. The key missing piece is that burst mages should feel *empty* after their rotation -- punished for spamming, rewarded for timing. Currently all Spellstorm classes can spam LMB indefinitely. |
| **Battle Mage** | Sustained damage at medium range, tanky enough to stay in the fight. DPS scales with time-in-combat, not burst windows. | Swain, Ryze, Cassiopeia, Vladimir, Karthus | The most under-represented archetype in Spellstorm. Battle mages want to stand in the thick of enemies, dealing consistent AOE while sustaining through drain or shields. Warlock partially fills this role but its HP-cost mechanic pushes toward hit-and-run, not sustained brawling. A true battle mage would need an aura/proximity damage model and self-healing that scales with nearby enemies. |
| **Artillery Mage** | Extreme range, high damage skillshots, fragile if caught. Fights from off-screen. | Xerath, Vel'Koz, Ziggs, Lux (partially) | Partially filled by Ranger and Stormcaller. Translation challenge: Spellstorm's room sizes (1000x700) limit meaningful range differences. An artillery class would need charge-up mechanics (hold LMB to increase range/damage) and long wind-up ultimates that force standing still -- directly anti-kiting. |

### Assassins

| LoL Subclass | Core Identity | LoL Examples | Spellstorm Translation |
|---|---|---|---|
| **Burst Assassin** | Get in, kill one target, get out. High mobility, lethal single-target, fragile. | Zed, LeBlanc, Talon, Katarina, Akali | Arcanist has the mobility (Blink) but lacks the "kill window" feel. A true assassin needs a mark/execute mechanic: abilities that deal bonus damage to a specific marked target, not AOE spam. The return-to-safety pattern (Zed shadow, LeBlanc distortion snap-back) is directly implementable with the existing Rewind spell type. |
| **Skirmisher Assassin** | Extended fights rather than instant burst. Sustained evasion and damage. | Fiora, Yasuo, Yone, Master Yi | Monk partially covers this with dodge and melee. Missing: the parry/riposte pattern (Fiora) where timing a defensive ability in reaction to an enemy attack creates a counter-attack window. Also missing: conditional mobility resets (Yasuo dash requires a target, Katarina shunpo requires a dagger). |

### Supports

| LoL Subclass | Core Identity | LoL Examples | Spellstorm Translation |
|---|---|---|---|
| **Enchanter** | Buff allies, debuff enemies. Heals, shields, movement speed boosts. | Lulu, Janna, Nami, Sona, Soraka | Paladin and Chronomancer cover healing and haste. Missing: polymorph/transform effects on enemies (Lulu W), knockback displacement (Janna ult), and the "aura DJ" feel (Sona) where just being near allies passively empowers them. In a 2-player co-op game, enchanter playstyle is viable but needs the support player to have enough solo combat ability to not feel useless. |
| **Catcher** | Land a key skillshot to initiate. CC-heavy, playmaking. | Thresh, Blitzcrank, Morgana, Pyke | Partially covered by Cryomancer (CC) and Druid (Entangle). Missing: the hook/grab displacement mechanic -- pulling an enemy toward you or to a specific location. In PvE wave survival, a "catcher" would excel at isolating dangerous enemies (bosses, ranged enemies) from the pack by displacing them. |

### Tanks

| LoL Subclass | Core Identity | LoL Examples | Spellstorm Translation |
|---|---|---|---|
| **Vanguard** | Engage initiator. Dives into the enemy team with hard CC. | Leona, Malphite, Nautilus, Amumu | Knight partially covers this with Shield Rush and Charge. Missing: the "magnetic" engage pattern where the tank's gap-closer stuns everything it passes through, and the team follows up. In co-op PvE, a vanguard needs an aggro/taunt mechanic that forces enemies to attack them instead of the squishy ally. Knight has `tauntAura` as an upgrade, but it should be a core identity mechanic. |
| **Warden** | Defensive protector. Peels for allies, creates safe zones. | Braum, Tahm Kench, Taric, Shen | Not represented in Spellstorm. Wardens differ from vanguards: instead of diving in, they stand ground and make their position safe. Braum's shield (blocks projectiles from a facing direction), Taric's ult (invulnerability zone), and Shen's spirit blade (directional defense) all create gameplay around facing and positioning. This is the strongest archetype gap in Spellstorm. |

### Marksmen

| LoL Subclass | Core Identity | LoL Examples | Spellstorm Translation |
|---|---|---|---|
| **Marksman** | Sustained ranged DPS through auto-attacks. Fragile, positioning-dependent, scales with items/time. | Jinx, Caitlyn, Ashe, Jhin, Graves, Aphelios | Ranger is the closest analogue. Missing: the ammo/reload system (Jhin 4 bullets, Graves 2 shells), the attack-move kiting pattern that LoL marksmen master, and on-hit effect stacking. Jhin's "4th shot execute" is a perfect mechanic for Spellstorm -- every 4th primary attack deals massive bonus damage, creating a rhythm rather than mindless spam. |

### Fighters

| LoL Subclass | Core Identity | LoL Examples | Spellstorm Translation |
|---|---|---|---|
| **Diver** | Mobile melee with gap-closers. Gets in and stays in. Less tanky than vanguards, more damage. | Vi, Camille, Irelia, Diana | Berserker partially covers this with Leap Slam. Missing: the lockdown pattern -- a diver's gap-closer should root or slow themselves AND the target, creating a committed fight rather than hit-and-run. Vi's ult (unstoppable charge to a target) and Camille's ult (hexagonal cage) force a 1v1. |
| **Juggernaut** | Slow, tanky, devastating in melee. Kited easily but terrifying if they reach you. | Darius, Garen, Illaoi, Mordekaiser, Nasus | Not represented as a player class. The juggernaut fantasy for PvE is a wizard who moves slowly but has a massive "kill aura" -- enemies that get close take escalating damage. Nasus Q stacking (permanent damage scaling from kills) is a perfect PvE mechanic. Darius's bleed-stack execute (5 stacks = massive damage) creates combo gameplay. |
| **Skirmisher** | Extended 1v1 duelist. Sustained damage, defensive tools that reward mechanics. | Fiora, Jax, Tryndamere, Yasuo | Monk partially covers this. Missing: the parry/riposte window (Fiora W), the "last stand" invulnerability (Tryndamere R), and the conditional defense that rewards reading enemy attacks. |

---

## 2. Transferable Mechanics

### 2.1 Resource Gating

**What it is in LoL:** Many champions use alternatives to mana -- energy (regenerates fast, caps at 200), rage (builds from combat, decays out of combat), health costs (Vladimir, Mordekaiser), ammo systems (Jhin's 4 bullets, Graves' 2 shells), or no resource at all (Garen, Katarina).

**Champions:** Jhin (4 bullets with a powerful 4th shot), Graves (2 shells, must reload), Gnar (rage bar that forces transformation), Renekton/Shyvana (rage empowers abilities), Vladimir (HP cost with healing reward), Katarina/Garen (resourceless, gated by cooldowns alone).

**Spellstorm translation:** Currently all 14 classes share the same mana pool (100 mana, 14/s regen). Alternative resources would immediately differentiate playstyles:

- **Ammo system (Jhin/Graves):** Primary attack has 4-6 charges that deplete on each shot. The last shot in the magazine deals 2x damage and applies a special effect. Reload takes 1.5 seconds of not shooting. This directly breaks circle-kiting because the reload window creates vulnerability -- players must time their engagements around magazine cycles. Implementable by tracking a counter on the Player object and gating the LMB spell behind it.
- **Rage system (Renekton/Gnar):** No mana. Instead, a rage bar (0-100) that fills on dealing/taking damage and decays at 5/s out of combat. Abilities are free but gain empowered effects above 50 rage. This rewards aggressive play and punishes passive kiting because rage decays.
- **Health cost with refund (Vladimir):** Already partially implemented via Warlock's Dark Pact. Could be expanded: Q costs HP but heals double if it hits. This creates a risk/reward loop where missing hurts and hitting heals, making accuracy matter more than spam.
- **Combo points (Rogue-style, seen in Katarina daggers):** Abilities generate "marks" or "charges" on the player. A finisher ability consumes all marks for scaling damage. This forces players to weave abilities in sequence rather than spamming one button.

**Why it breaks circle-kiting:** Resource gating forces pacing. Ammo systems create reload windows where players must reposition or dodge. Rage systems reward staying in combat. Health costs make spamming dangerous.

---

### 2.2 Combo Systems

**What it is in LoL:** Certain champions have abilities that chain together in specific sequences for amplified effect. The order and timing of ability use matters more than just pressing everything off cooldown.

**Champions:** Riven (Q is a 3-part combo, each press is a different attack ending in a knockup), LeBlanc (can snap back to distortion origin within 4s), Zed (can swap to shadow positions, combo is W-shadow, Q through shadow, E, R for death mark), Qiyana (abilities change element based on terrain touched), Irelia (Q resets on marked targets).

**Spellstorm translation:**

- **Sequenced primary attack (Riven Q):** LMB cycles through 3 different attacks on successive presses -- e.g., slash, thrust, slam. The 3rd hit has bonus damage and a stun. This turns LMB from "hold and kite" into "time your 3rd hit on a priority target." Implementable by tracking a combo counter on the Player that resets after 2 seconds of not attacking.
- **Snap-back positioning (LeBlanc W):** Cast RMB to dash forward and deal damage. Within 3 seconds, press RMB again to snap back to the origin point. This already exists as the Rewind spell type but could be more central to a class identity -- the snap-back being the primary mobility rather than an emergency heal.
- **Shadow/echo combo (Zed):** Place a shadow (like a ward) at your position. Abilities fired also fire from the shadow's position. Reactivate to swap with the shadow. Enemies hit by both the player AND shadow version take bonus damage. This creates spatial puzzles mid-combat. Implementable by spawning a "shadow entity" and duplicating spell origins.

**Why it breaks circle-kiting:** Combo systems reward engagement timing over movement efficiency. A Riven-style 3-hit combo means players want to land the 3rd hit on a clump of enemies, which requires positioning, not just circling.

---

### 2.3 Stacking Mechanics

**What it is in LoL:** Passive effects that accumulate permanent or semi-permanent power through specific actions. The champion grows stronger in a unique way as the game progresses.

**Champions:** Nasus (Q kills permanently increase Q damage -- infinite scaling), Veigar (hitting abilities permanently increases AP, killing champions grants bonus AP), Kindred (hunting marked jungle camps grants permanent attack range and on-hit damage), Senna (collecting mist from dead units grants AD, range, and crit), Thresh (collecting souls grants armor and AP), Cho'Gath (R kills grant permanent HP and size).

**Spellstorm translation:**

- **Kill-stacking damage (Nasus Q):** A specific ability (e.g., Q) gains +0.5 permanent damage per kill made with that ability. By wave 10, a player who has been farming with Q instead of LMB has a devastating Q. This creates a meaningful choice: use your best ability for clear speed now, or invest in Q stacks for late-game power. Implementation: a `_qStacks` counter on Player that adds to Q's damage in the spell system.
- **Ability-hit scaling (Veigar):** Every ability hit grants +0.1 permanent spell damage (capped at +5 per wave to prevent runaway scaling). Rewards accuracy over spam since mana limits total casts. This already partially exists via the upgrade system but as a passive would differentiate a class.
- **Soul/essence collection (Thresh/Senna):** Enemies drop collectible essence orbs on death. Walking over them grants small permanent stat boosts (mix of damage, speed, and HP). This forces the player to break kiting patterns to collect orbs that spawn at death locations, not at the player's position.

**Why it breaks circle-kiting:** Stacking mechanics reward specific behaviors (last-hitting with a particular ability, collecting drops at enemy death positions) that conflict with optimal kiting paths.

---

### 2.4 Transformation / Stance Switching

**What it is in LoL:** Champions that have two (or more) complete ability sets and can switch between them, effectively being two champions in one.

**Champions:** Nidalee (human form = ranged poke/utility, cougar form = melee burst/mobility), Jayce (hammer = melee CC/burst, cannon = ranged poke/speed gate), Elise (human = ranged CC/poke, spider = melee sustain/gap-close), Gnar (mini = ranged kiting/speed, mega = melee tank/CC -- transformation forced by rage bar), Kayn (assassin form OR bruiser form, chosen permanently mid-game based on who you've been fighting).

**Spellstorm translation:**

- **Stance switching (Nidalee/Jayce):** R key (or a dedicated toggle) switches between two spell sets. Form A is ranged with poke/utility, Form B is melee with burst/sustain. Each form has its own LMB, RMB, and Q. The stance switch itself could have a short cooldown (3-4 seconds) to prevent spam-swapping. This effectively doubles the class's complexity and creates two distinct kiting patterns per class. Implementation: store two `SpellDef[]` arrays and swap `cls.spells` on toggle. The Player already tracks `cd[]` per slot, so cooldowns carry across forms.
- **Forced transformation (Gnar):** A rage/energy bar fills during combat. At 100, the character involuntarily transforms into a powerful melee form for 8 seconds, then snaps back to ranged form with the bar empty. This creates dramatic tempo shifts where the player switches from kiting to diving. The transformation could grant bonus HP, melee range abilities, and a powerful slam on transformation.
- **Permanent evolution choice (Kayn):** After wave 5, the player is offered a permanent form choice based on their playstyle. If they've been taking damage (tanking), they evolve into a bruiser with sustain. If they've been dealing damage from range, they evolve into an artillery form with longer range. This extends the upgrade system with a one-time fork.

**Why it breaks circle-kiting:** Stance-switching forces the player to alternate between two fundamentally different spatial patterns. Forced transformation (Gnar) is especially anti-kite because the player must commit to melee during the transformed state.

---

### 2.5 Zone Control

**What it is in LoL:** Creating persistent entities or areas that control enemy movement and provide sustained value at a fixed location.

**Champions:** Heimerdinger (3 turrets + empowered mega-turret), Zyra (seeds grow into plants that attack), Orianna (The Ball -- all abilities orbit around a movable anchor point), Azir (summons sand soldiers at locations, auto-attacks through them), Gangplank (barrel chains that require timing to detonate), Shaco (Jack in the Box traps that fear and attack), Teemo (invisible mushroom traps).

**Spellstorm translation:**

- **Turret fortress (Heimerdinger):** Engineer already has turrets but they're fire-and-forget zones. A Heimerdinger-style class would have turret *placement* as the core identity: LMB fires through the nearest turret (turrets amplify your shots), RMB repositions a turret, Q deploys a new turret (max 3), and Ultimate supercharges all turrets. The player's damage scales with turret setup quality, not personal kiting. Implementation: turrets are already Zone entities with `_turret` flag; add a "fire through turret" mechanic that spawns a spell from the turret's position aimed at the player's cursor.
- **Anchor-point mage (Orianna):** All abilities center on a movable "orb" entity rather than the player's position. LMB moves the orb to cursor location (dealing damage along the path), RMB creates a zone at the orb's location, Q pulls enemies toward the orb, Ultimate detonates the orb for massive AOE. The player positions the orb, then positions themselves safely. This creates a dual-positioning puzzle. Implementation: a persistent entity (similar to a Zone but controllable) that the spell system references as origin point.
- **Timed detonation chains (Gangplank barrels):** Place barrels on the ground (Q). Shoot a barrel with LMB to detonate it. Barrels near each other chain-explode. Damage scales with how many barrels are in the chain. This creates setup-payoff gameplay: place barrels during kiting, then detonate the whole chain when enemies clump on them.

**Why it breaks circle-kiting:** Zone control roots the player's power to specific locations. The player must orbit their zones rather than just kiting in open space. Moving too far from turrets/orbs/barrels means losing most of their damage.

---

### 2.6 Skillshot Patterns

**What it is in LoL:** Unique projectile behaviors beyond straight-line shots that create distinctive aiming challenges and reward mastery.

**Champions:** Lux (Q passes through and binds first 2 enemies hit), Vel'Koz (geometry mage -- Q splits at 90-degree angles on reactivation), Zoe (paddle star -- Q travels out then returns, dealing more damage the further it traveled), Draven (spinning axes -- auto-attacks bounce back to a catch location, catching them resets the auto), Sivir (Q boomerang that damages out and back), Ekko (Q boomerang that slows going out and stuns coming back).

**Spellstorm translation:**

- **Splitting projectiles (Vel'Koz Q):** LMB fires a projectile. Press LMB again while it's in flight to split it into two projectiles that fly perpendicular to the original path. This turns every shot into a micro-decision: fire straight for direct hits, or split for area coverage. Implementation: track the in-flight spell and on second LMB press, despawn it and spawn two new spells at 90-degree angles.
- **Return-trip projectiles (Zoe Q / Ekko Q):** The boomerang upgrade already exists in Spellstorm. The Zoe twist: the projectile deals damage based on total distance traveled, not just flat damage. Fire it backwards first, then redirect it through enemies for maximum damage. This rewards creative angles. Implementation: track `spell.age * spell.speed` as distance and scale damage accordingly.
- **Catch mechanics (Draven axes):** Primary attacks bounce off enemies and land at a predicted location (indicated by a marker). Walking over the landing spot "catches" the axe, resetting the primary cooldown and granting bonus damage on the next attack. This creates a rhythm: shoot, move to catch spot, shoot, move to catch spot. The kiting pattern becomes dictated by axe bounce locations, not just enemy positions.

**Why it breaks circle-kiting:** Complex skillshot patterns require the player to think about projectile trajectories, not just "aim at nearest enemy." Catch mechanics force specific movement patterns.

---

### 2.7 Dash / Mobility Patterns

**What it is in LoL:** Different champions have fundamentally different relationships with mobility. Some have free dashes, some have conditional dashes, some have dashes that reset on specific conditions.

**Champions:** Katarina (Shunpo -- blink to target location; resets on takedown), Yasuo (dash through enemy units, same unit can't be dashed through twice), Akali (two dashes -- first is free, second requires hitting E on a marked target), Kassadin (short blink on low cooldown that costs increasing mana per use), Zed (can swap to shadow position), Fizz (untargetable hop on E).

**Spellstorm translation:**

- **Kill-reset blinks (Katarina):** Blink to target location. If you get a kill within 2 seconds, blink cooldown resets. This turns the assassin into a chain-killing machine in dense waves but leaves them stranded (on cooldown) if they blink in and fail to kill. Risk/reward mobility. Implementation: check for kills in the `updatePlayers` system and reset `cd[1]` (RMB slot) on kill. The `killResetCD` upgrade already does this for primary; extend it to be class-intrinsic for RMB.
- **Target-gated dashes (Yasuo):** Dash is only usable when aimed at an enemy. Can't dash through the same enemy twice within 6 seconds. This forces forward/aggressive movement through enemy formations rather than backward kiting. Implementation: the dash spell checks for enemies in the dash path and only fires if one exists; mark dashed-through enemies with a timer.
- **Escalating cost blinks (Kassadin):** Short-range blink on 3-second cooldown. Each use within 10 seconds doubles the mana cost (12 -> 24 -> 48 -> 96). Encourages deliberate use rather than spam. This is especially interesting for Arcanist's existing Blink identity.

**Why it breaks circle-kiting:** Conditional and reset-gated mobility forces players toward enemies (target-gated dash) or creates commitment decisions (escalating costs). Kill-resets reward aggressive play over defensive kiting.

---

### 2.8 Crowd Control Chaining

**What it is in LoL:** Kits designed around layered CC -- one ability sets up another. The sequence of CC application matters for maximum lockdown duration.

**Champions:** Leona (passive marks enemies, allies proc marks for bonus damage; Q stun, E gap-close, R AOE stun), Thresh (hook pull into flay knockback into box slow), Nautilus (passive root on first auto, Q hook, E slow, R point-and-click knockup), Amumu (Q gap-close stun into W aura into R AOE root).

**Spellstorm translation:**

- **Mark-and-proc system (Leona passive):** Abilities apply a "mark" to enemies. The partner player's attacks on marked enemies deal bonus damage and trigger a stun. This creates co-op synergy where one player sets up and the other executes. In solo play, different abilities can proc each other's marks (LMB marks, RMB procs). Implementation: add a `_marked` timer and `_markOwner` to enemy entities; proc check in the damage calculation.
- **Layered CC kit:** A class designed around CC chaining rather than damage. LMB applies slow, RMB applies root to slowed enemies (upgrade: stun), Q pulls all rooted enemies to cursor position, Ultimate freezes all CC'd enemies for 3 seconds. Damage comes from the enemies being held still for the ally to destroy. In solo, the CC-focused class would need moderate base damage to be viable.

**Why it breaks circle-kiting:** CC chaining requires sequence management (slow first, THEN root, THEN pull) which demands ability ordering rather than spam. The class's power comes from locking enemies down at specific locations, not from kiting.

---

### 2.9 Pet / Summon Management

**What it is in LoL:** Champions who derive significant power from controlling or managing separate AI-controlled entities.

**Champions:** Annie (Tibbers -- massive bear with aura damage, controllable after summon via R recast), Ivern (Daisy -- tanky golem that follows Ivern's commands, every 3rd attack knocks up), Malzahar (voidlings that spawn from ability casts and swarm the target), Yorick (ghouls from graves + The Maiden, a persistent companion that splits-pushes), Zyra (plants that grow from seeds and attack nearby enemies), Heimerdinger (turrets as described above).

**Spellstorm translation:**

- **Controllable ultimate summon (Annie Tibbers):** Necromancer's Army of Dead is fire-and-forget. An Annie-style summon would be a single powerful entity that persists until killed and can be commanded: Ultimate summons it, recast Ultimate to move it to a target location. The summon has its own HP bar and deals AOE damage around itself. This creates a "two-body" problem where the player manages both their own positioning and the summon's positioning.
- **Swarm from abilities (Malzahar):** Each ability cast spawns a small minion at the target location. Minions persist for 8 seconds and auto-attack the nearest enemy. Having 3+ minions alive empowers the player's abilities. This rewards sustained casting (keeping minion count high) rather than burst.
- **Grave/corpse mechanic (Yorick):** When enemies die, they leave "graves" (visible markers). An ability consumes nearby graves to spawn allied ghouls, one per grave. This creates a feedback loop with wave survival: big enemy waves = lots of graves = lots of ghouls. The player wants to kill enemies in clumps to maximize grave density.

**Why it breaks circle-kiting:** Pet management adds a second (or multiple) entity to track. The player must position both themselves and their summons, which conflicts with mindless kiting patterns.

---

### 2.10 Terrain Interaction

**What it is in LoL:** Abilities that create, destroy, or interact with terrain features, changing the battlefield geometry.

**Champions:** Anivia (W creates an impassable ice wall), Taliyah (ult creates a massive wall; passive gives movement speed near walls), Trundle (E pillar knocks up and creates impassable terrain), Bard (E creates a portal through any wall), Jarvan IV (R creates a circular arena), Ornn (pillar + terrain-empowered abilities).

**Spellstorm translation:**

- **Wall creation (Anivia W):** RMB places a short ice wall (2-3 pillar-widths) that blocks enemy movement for 5 seconds. This fundamentally changes the room's geometry mid-combat. Enemies must path around the wall, which creates funneling for AOE. Implementation: spawn 2-3 Pillar entities in a line at the target location, with a timer to remove them.
- **Arena creation (Jarvan R):** Ultimate creates a circular wall of pillars around the player's current position, trapping nearby enemies inside with the player. The player and enemies must fight within the arena for 5 seconds. This is the ultimate anti-kite mechanic: it removes the ability to kite entirely for a window.
- **Terrain-empowered abilities (Taliyah/Ornn):** Abilities deal bonus damage or gain bonus effects when used near pillars. A projectile that passes near a pillar splits into 3. A dash that ends at a wall deals bonus impact damage. This makes the room's pillars strategically important rather than just obstacles.

**Why it breaks circle-kiting:** Terrain creation changes the arena shape, forcing new pathing. Arena abilities force commitment to close-range combat. Terrain-empowerment makes players seek specific positions rather than open space.

---

### 2.11 Mark / Detonate Patterns

**What it is in LoL:** A two-step damage pattern where one ability applies a "mark" to an enemy, and a second ability or auto-attack "detonates" the mark for bonus damage.

**Champions:** Zoe (E Sleepy Trouble Bubble applies drowsy/sleep, next damage source deals double damage), Akali (passive -- abilities mark enemies, auto-attacks on marked enemies deal bonus damage and restore energy), Kindred (passive marks a target for bonus on-hit damage), Diana (passive -- every 3rd auto deals bonus AOE; abilities apply moonlight mark, R consumes marks for damage), Ekko (passive -- 3 hits proc a massive speed burst and bonus damage).

**Spellstorm translation:**

- **Apply-then-detonate (Zoe E):** RMB fires a skill shot that applies "sleep" to the first enemy hit (2-second delay, then 1.5s stun). The FIRST damage source on a sleeping enemy deals 2x damage. This creates setup/payoff: land RMB, wait for sleep, then hit with your biggest ability. Implementation: add a `_sleepTimer` and `_sleepVulnerable` flag to enemies; check vulnerability in damage calculation.
- **3-hit proc (Ekko passive / Diana passive):** Every 3rd ability hit on the same enemy triggers a bonus effect (AOE burst, speed boost, bonus damage). A hit counter per enemy per player tracks this. This rewards focused fire on single targets and creates a rhythm of "3 hits, pop, 3 hits, pop." Implementation: `_hitCountByPlayer` map on enemy entities; proc check on every damage event.
- **Mark spread (Brand passive):** Abilities apply a stack (up to 3). At 3 stacks, the target detonates, dealing AOE damage and applying 1 stack to all nearby enemies. This creates chain reactions in dense enemy packs. Implementation: track `_brandStacks` on enemies; on reaching 3, trigger AOE that applies 1 stack to nearby enemies.

**Why it breaks circle-kiting:** Mark/detonate forces a two-step engagement. Players can't just spam; they must apply the mark AND follow up. The timing window between mark and detonate creates deliberate play.

---

### 2.12 Channeling and Charge-Up

**What it is in LoL:** Abilities that require standing still or holding a key to build up power. The longer the charge, the more powerful the effect. Interrupted by damage or CC.

**Champions:** Xerath (Q charge increases range, R channels 3-5 long-range shots), Varus (Q hold increases range and damage), Vi (Q charge increases dash range and damage), Sion (Q charge increases AOE size and damage, R channels a long-distance charge), Pantheon (E channels a directional shield), Jhin (R channels 4 long-range sniper shots).

**Spellstorm translation:**

- **Charge-up primary (Varus Q / Xerath Q):** Hold LMB to charge. A growing indicator shows the charge level. Release to fire. Minimum charge fires a weak short-range shot. Maximum charge (held 1.5s) fires a piercing long-range high-damage shot. Movement speed reduced by 40% while charging. This transforms LMB from rapid-fire to deliberate power shots. Implementation: track a `_chargeTimer` on Player; on LMB hold, increment timer; on release, fire spell with damage/range scaled by charge. Player system applies speed reduction during charge.
- **Channeled ultimate (Xerath R / Jhin R):** Ultimate roots the player in place and grants 4 long-range targeted shots over 4 seconds. Each shot is aimed independently. This is a massive anti-kiting commitment: the player is stationary and vulnerable but deals devastating ranged damage. The team dynamic shifts to the ally protecting the channeling player.
- **Wind-up slam (Sion Q):** Q begins charging. An AOE indicator grows from small to large over 2 seconds. Release to slam. Enemies in the zone are stunned for longer the more charged the slam was. This rewards patience in melee and creates "will they stay in the zone?" tension.

**Why it breaks circle-kiting:** Channeling directly opposes kiting by requiring the player to stand still. Movement speed reduction during charge-up means committing to a position. The power reward must be significant enough to justify the risk.

---

### 2.13 Tether Mechanics

**What it is in LoL:** Abilities that create a connection between the caster and a target (or location). The effect persists as long as the tether holds (both entities within range). Moving out of range breaks the tether.

**Champions:** Karma (W -- tether to enemy, if maintained for 2s, root and heal), Morgana (R -- AOE tether to all nearby enemies, if maintained for 2s, stun), Fiddlesticks (W -- drain tether, channels damage and healing), LeBlanc (E -- chain tether, if maintained, root), Nocturne (E -- fear tether, if maintained, fear).

**Spellstorm translation:**

- **Drain tether (Fiddlesticks W):** RMB tethers to nearest enemy within range. While tethered (must stay within 150 units), deal continuous damage and heal. Moving too far breaks the tether. The player is incentivized to stay dangerously close to an enemy for the sustained healing. Implementation: track `_tetherTargetId` and `_tetherTimer` on Player; in the player update system, check distance each frame, apply damage/heal tick, break if distance > 150.
- **Root tether (Karma W / Morgana R):** Cast an ability on an enemy. A visible tether connects you. If you maintain proximity (within 200 units) for 2 seconds, the enemy is rooted for 2 seconds. If you break range, nothing happens and the ability is wasted. This forces aggressive positioning to earn the root payoff.
- **AOE tether ultimate (Morgana R):** Ultimate tethers all enemies within range (120 units). After 2 seconds, all tethered enemies are stunned for 2 seconds. The player must survive in the middle of the enemy pack for 2 seconds to get the payoff. This is an extremely high-commitment anti-kite ability.

**Why it breaks circle-kiting:** Tethers explicitly require maintaining proximity. The player must stay close to enemies for the effect to work, directly opposing the kiting instinct.

---

### 2.14 Clone / Illusion

**What it is in LoL:** Creating duplicates of the champion that confuse enemies or deal damage. Clones may be controllable or autonomous.

**Champions:** Shaco (R creates a controllable clone that deals reduced damage and explodes on death), LeBlanc (passive spawns a clone when low HP, clone mimics last ability), Wukong (W creates a stationary clone and stealths the real Wukong), Neeko (passive disguises as an ally champion).

**Spellstorm translation:**

- **Decoy clone (Wukong W):** Press RMB to leave a clone at your position and become invisible for 1.5 seconds. The clone stands still and draws enemy aggro. After 1.5 seconds, the clone explodes for AOE damage. This is a defensive/offensive tool: escape a tight spot while dealing damage. Implementation: spawn a "fake player" entity (visually identical) that enemies target (override AI targeting); after timer, despawn clone and deal AOE. Apply a transparency effect to the real player for the stealth duration.
- **Combat clone (Shaco R):** Ultimate creates a clone that mirrors your movement and attacks. The clone has 50% of your HP and deals 50% damage. On death, the clone explodes. Enemies attack the clone instead of you. This effectively doubles your DPS for the clone's lifetime while providing a damage sponge.

**Why it breaks circle-kiting:** Clones provide an alternative to kiting -- instead of running from enemies, the player uses the clone to absorb aggro while attacking from a static position. The clone management creates a distinct playstyle.

---

### 2.15 Directional Abilities

**What it is in LoL:** Abilities where the champion's facing direction or position relative to enemies determines the effect. These create gameplay around rotational positioning.

**Champions:** Braum (E shield -- blocks all projectiles from the faced direction, reduces damage), Yasuo (W Wind Wall -- creates a wall that blocks enemy projectiles for 4 seconds), Shen (W Spirit Refuge -- zone around spirit blade where allies dodge auto-attacks), Fiora (passive -- vital points appear on specific sides of enemy champions; hitting vitals deals bonus damage), Cassiopeia (R -- enemies facing Cassiopeia are stunned, enemies facing away are slowed).

**Spellstorm translation:**

- **Directional shield (Braum E):** An ability that creates a shield in the direction the player is facing. Enemy projectiles from that direction are blocked. This is massively impactful in a game with ranged enemies (skeletons, necros, demons, archlord) and creates a "body-blocking" role. The shielding player must face the incoming fire, which means they can't be kiting away. Implementation: create a cone/arc check for incoming enemy projectiles based on player angle; destroy matching projectiles.
- **Positional vulnerability (Fiora vitals):** Enemies have a "weak point" marker on one side (N/S/E/W). Hitting the enemy from the weak point side deals 2x damage. The weak point rotates to a new side after being hit. This forces the player to position around enemies rather than kiting in one direction. Implementation: add `_vitalAngle` to enemy entities; in damage calculation, compare the angle of the incoming spell vs the vital angle; rotate vital on proc.
- **Facing-dependent CC (Cassiopeia R):** Ultimate deals damage in a cone. Enemies in the cone facing toward the player are stunned for 2 seconds. Enemies facing away are slowed. This rewards positioning behind enemies or in front of charging enemies.

**Why it breaks circle-kiting:** Directional abilities make the angle of approach matter. Players must consider not just distance but facing and relative position, adding a layer of spatial reasoning that circle-kiting ignores.

---

### 2.16 Catch / Hook Patterns

**What it is in LoL:** Long-range displacement abilities that pull enemies toward the caster or pull the caster toward enemies. Landing the hook is the key skill expression.

**Champions:** Blitzcrank (Q -- long-range hook that pulls enemy to Blitzcrank), Thresh (Q -- hook that pulls Thresh to the enemy on recast), Pyke (Q -- hold to charge a hook, tap for short-range stab), Nautilus (Q -- hooks to terrain if it hits a wall, hooks enemy if it hits a champion), Darius (E -- cone-shaped pull that yanks all enemies in front closer).

**Spellstorm translation:**

- **Enemy pull (Blitzcrank Q):** RMB fires a long-range projectile. If it hits an enemy, that enemy is yanked to the player's position, stunned for 0.5 seconds. This isolates dangerous enemies (ranged casters, bosses) from the pack for focused killing. In dense waves, pulling one enemy is less useful, but pulling a boss or elite out of a group is powerful. Implementation: on hit, teleport the enemy entity to the player's position (with a brief travel animation); apply stun.
- **Grapple-to-enemy (Thresh Q):** RMB fires a hook. If it hits, the player can recast RMB to dash to the hooked enemy. This is an offensive gap-closer that rewards landing a skillshot. Unlike Blink, which is always available, this dash is conditional on hitting a target.
- **AOE pull (Darius E):** Q pulls all enemies within a cone in front of the player toward the player by ~50 units and slows them. This is a CC/positioning tool that brings enemies closer rather than pushing them away. Anti-kiting by definition: the player is pulling enemies to themselves.

**Why it breaks circle-kiting:** Hooks pull enemies TO the player (or pull the player TO enemies), which is the opposite of kiting. The class's power fantasy is "I bring the fight to me" rather than "I run away while shooting."

---

### 2.17 Adaptive / Evolving Kits

**What it is in LoL:** Abilities that permanently change or evolve during the match based on player choices or game state.

**Champions:** Kayn (absorbs orbs from fighting melee champions or ranged champions; at threshold, chooses Shadow Assassin form or Darkin bruiser form), Kha'Zix (gets evolution points at levels 6/11/16; chooses one ability to evolve each time, changing its behavior permanently), Aphelios (cycles through 5 weapons, each with different abilities; the order creates different combos), Viktor (uses gold to upgrade abilities one at a time, each gaining a significant bonus effect).

**Spellstorm translation:**

- **Ability evolution (Kha'Zix):** At levels 5, 10, and 15, the player chooses one of their 3 non-ultimate abilities to "evolve." Evolution adds a significant mechanical change, not just numbers. Examples: LMB evolves to fire 3 projectiles instead of 1. RMB evolves to leave a damaging zone at the dash destination. Q evolves to have double radius and half cooldown. The player shapes their class identity through evolution choices. This is partially covered by the upgrade system, but class-specific evolutions that fundamentally alter ability behavior would be more impactful.
- **Weapon cycling (Aphelios):** The class has 4-5 "elements" that cycle. LMB always attacks but the element determines the effect: Fire (burn DOT), Ice (slow), Lightning (chain to nearby), Arcane (bonus homing), Void (piercing). Element rotates every 15 seconds or every 20 LMB shots. RMB does a special attack based on current element. This creates constantly shifting gameplay within a single class.
- **Playstyle-reactive evolution (Kayn):** Track player behavior across waves. If the player has been primarily using LMB and staying at range, offer a "Sniper" evolution. If they've been using abilities and fighting close, offer a "Battlemage" evolution. The evolution permanently alters stats and ability behaviors. This rewards commitment to a playstyle.

**Why it breaks circle-kiting:** Evolving kits create mid-run decision points that can branch into non-kiting playstyles. A melee evolution on a previously ranged class would completely change movement patterns.

---

### 2.18 Aura / Proximity Effects

**What it is in LoL:** Passive effects that benefit nearby allies or debuff nearby enemies based on proximity alone.

**Champions:** Taric (Bastion -- links to ally, ally gets bonus armor; Taric's abilities also cast from the linked ally's position), Sona (auras that cycle between damage, speed, and heal based on last ability used), Janna (passive -- bonus movement speed for nearby allies), Sunfire Aegis/Radiance (item -- deals damage to nearby enemies per second).

**Spellstorm translation:**

- **Aura DJ (Sona):** Each ability cast changes the player's active aura for 3 seconds. LMB cast = damage aura (nearby enemies take 1 dps). RMB cast = speed aura (nearby ally gains +20% move speed). Q cast = heal aura (nearby ally heals 1 HP/s). This creates a rhythm of swapping auras to provide what the team needs. Implementation: track `_activeAura` type on Player; in the player update system, apply the aura effect in an AOE each frame.
- **Link-casting (Taric Bastion):** RMB links to the ally player. While linked, the player's LMB and Q also cast from the ally's position (at reduced effectiveness). This creates long-range utility by using the ally as a spell turret. The linked player must stay within range (300 units) of the ally. Implementation: when casting LMB/Q, also spawn a second spell at the linked player's position aimed at the caster's cursor direction.
- **Damage aura (Sunfire):** Passive: deal 1 damage per second to all enemies within 80 units. Upgraded: 2 dps. This is simple but forces proximity. A class with damage aura + sustain would want to stand in the middle of enemy packs, not kite.

**Why it breaks circle-kiting:** Proximity effects only work when close to allies or enemies. An aura-based class must maintain specific distances rather than maximizing separation.

---

### 2.19 Spell Weaving

**What it is in LoL:** Champions designed around alternating between abilities and auto-attacks, where each empowers the other.

**Champions:** Ezreal (each ability hit reduces all cooldowns by 1.5s; Q applies on-hit effects like auto-attacks), Lucian (passive -- after each ability, next auto-attack fires twice), Twisted Fate (W empowers next auto-attack with color-coded effects), Kog'Maw (W empowers autos with bonus range and on-hit damage for 8s).

**Spellstorm translation:**

Spellstorm already has a `spellWeaving` upgrade that grants bonus damage when alternating ability slots. This could be a core class identity:

- **Weaver class identity:** Passive: every ability cast empowers the next LMB shot to deal 2x damage and apply the previous ability's effect. LMB after RMB = double damage + RMB's slow. LMB after Q = double damage + Q's stun. This forces the player to alternate: Q, LMB, RMB, LMB, Q, LMB, never just holding LMB. Implementation: the `spellWeaving` system already tracks `lastSpellSlot`; extend it to apply the previous ability's modifiers to the next LMB cast.
- **Cooldown cascading (Ezreal):** Each ability hit reduces all other ability cooldowns by 0.5 seconds. This rewards using ALL abilities in rotation rather than camping on LMB. The more abilities you land, the faster everything comes back. This synergizes with the `cdCascade` upgrade already in the game.

**Why it breaks circle-kiting:** Spell weaving forces ability rotation. Players must use multiple keys in sequence rather than holding one. The mental load of tracking which ability to use next prevents autopilot kiting.

---

### 2.20 Ricochet / Bounce

**What it is in LoL:** Projectiles or effects that bounce between enemies or off terrain, dealing damage to multiple targets.

**Champions:** Sivir (Q boomerang -- out and back; W -- auto-attacks bounce to nearby enemies), Brand (R -- fireball bounces between nearby enemies up to 5 times, prioritizing champions), Miss Fortune (Q -- shot bounces off first target to hit a target behind, second target takes bonus damage), Ryze (E -- flux bounces to nearby enemies and marks them, all Ryze abilities deal bonus damage to fluxed targets).

**Spellstorm translation:**

- **Prioritized bouncing (Brand R):** Ultimate fires a projectile at the nearest enemy. On hit, it bounces to the nearest enemy within 120 units, up to 5 bounces. Each bounce deals 80% of the previous hit's damage. If no enemy is within bounce range, the projectile returns to the player (and can be "caught" for a mana refund). This is devastating in dense packs and weak against spread-out enemies. Implementation: the `ricochet` and `chainHit` mechanics already exist; combine them into a core ability with bounce logic in the spell update system.
- **Geometry bounce (MF Q):** LMB fires a shot. If it hits an enemy, a second shot fires from that enemy toward the nearest enemy behind it, dealing 1.5x damage. This rewards lining up shots so the bounce hits high-value targets (e.g., a squishy behind a tank). Implementation: on LMB hit, spawn a new spell from the hit enemy's position aimed at the nearest enemy behind it (relative to the original shot direction).
- **Mark-and-bounce (Ryze E):** RMB hits an enemy and applies a mark that spreads to nearby enemies. LMB on a marked enemy deals bonus damage and the mark spreads further. This creates a "paint, then detonate" pattern in dense waves.

**Why it breaks circle-kiting:** Bounce mechanics reward dense enemy groupings. Instead of spreading enemies out via kiting, the player wants enemies clumped for maximum bounces. This incentivizes standing ground or even luring enemies together.

---

## 3. Anti-Kiting Mechanic Ideas

The core problem: most Spellstorm classes devolve into circle-kiting while spamming LMB and occasionally pressing Ultimate. Below are mechanics specifically designed to force different movement and engagement patterns.

### 3.1 Channeled Abilities That Reward Standing Still

| Mechanic | How It Works | Why It's Anti-Kite |
|---|---|---|
| **Charge-up LMB** | Hold LMB to charge for 0.5-2s. Release for scaled damage/range. 40% move speed while charging. | Players must stop or slow down to charge. Power reward must exceed the cost of standing still. |
| **Channeled Ultimate** | Ultimate roots player for 4s, granting 4 long-range targeted shots. Each shot is individually aimed. | Complete immobilization for massive power. Team play: ally must protect the channeler. |
| **Meditation heal** | Q channels a self-heal over 3 seconds. Interrupted by taking damage. Standing in a safe zone heals faster. | Players must find safe moments to heal rather than kiting while regenerating. |
| **Turret mode** | RMB toggles "turret mode": player is rooted but gains +100% fire rate and +50% damage. | Opt-in immobilization for massive DPS boost. Creates a "stand and deliver" playstyle. |

### 3.2 Combo Sequences That Require Precise Timing

| Mechanic | How It Works | Why It's Anti-Kite |
|---|---|---|
| **3-hit LMB combo** | LMB cycles through 3 attacks. 3rd hit deals 3x damage + AOE. Combo resets after 2s of not attacking. | Players must maintain attack rhythm, which requires staying in range. Running away resets the combo. |
| **Ability-sequence empowerment** | Using abilities in the order LMB->RMB->Q within 3s triggers a bonus "finisher" effect (AOE burst). | Forces full rotation usage, not just LMB spam. Rotation requires different ranges/positions per ability. |
| **Cancel windows** | RMB has a 0.5s wind-up. Pressing LMB during wind-up cancels into a special counter-attack. | Requires watching enemy animations and reacting, not just moving in circles. |

### 3.3 Positional Requirements

| Mechanic | How It Works | Why It's Anti-Kite |
|---|---|---|
| **Weak point system** | Enemies have a directional "vital" marker. Hitting from the vital side deals 2x damage. Vital rotates on hit. | Forces repositioning around enemies, not just maintaining distance. |
| **Backstab bonus** | Attacking enemies from behind (relative to their facing) deals +50% damage. | Rewards flanking, which requires cutting across enemy paths rather than running away. |
| **Proximity bonus** | Abilities deal 25% more damage to enemies within 80 units. Passive aura deals 1 dps. | Rewards close range, directly opposing kiting distance. |
| **Formation bonus** | Co-op: standing within 100 units of ally grants both players +20% damage. | Forces both players to hold a position together rather than kiting independently. |

### 3.4 Resource Systems That Punish Spam

| Mechanic | How It Works | Why It's Anti-Kite |
|---|---|---|
| **Ammo magazine** | LMB has 4 shots. Last shot deals 2x. Reload takes 1.5s of not shooting. | Reload window creates vulnerability; players must time engagements. |
| **Overheat** | Each LMB cast adds heat. Above 80% heat, bonus damage. At 100%, overheated for 2s (no casting). | Spam leads to enforced downtime. Managed casting is rewarded. |
| **Rage (decaying)** | No mana. Rage builds on hit/damage taken, decays at 5/s. Abilities empowered above 50 rage. | Running away = rage decays = weaker. Staying in combat = stronger. |
| **HP cost with scaling** | Abilities cost HP. Damage dealt scales with missing HP. Kills heal. | Creates a risk spiral: the more you spend, the stronger but more vulnerable you become. |

### 3.5 Charge-Up Mechanics

| Mechanic | How It Works | Why It's Anti-Kite |
|---|---|---|
| **Power shot** | Hold LMB 0-2s. Damage: 1x at 0s, 3x at 2s. Pierces at max charge. | Direct incentive to stand still for 2s. |
| **Earthquake stomp** | Hold Q 0-2s. AOE radius: 40 at 0s, 120 at 2s. Stun: 0.5s at 0s, 2s at 2s. | Melee zone control that rewards patience. |
| **Bombardment** | Ultimate: stand still for 5s, calling down escalating meteor strikes. Move to cancel early. | Maximum power requires maximum commitment to standing still. |

### 3.6 Tether Ranges That Force Engagement Distance

| Mechanic | How It Works | Why It's Anti-Kite |
|---|---|---|
| **Drain tether** | RMB tethers to enemy within 150 units. DPS + healing while tethered. Breaks at >150 units. | Must stay dangerously close to heal. |
| **Fear tether** | Q tethers to enemy. After 2s of maintained proximity (<200 units), enemy is feared for 3s. | Aggressive positioning for 2s earns a powerful CC payoff. |
| **Empowerment tether** | Passive links to ally within 200 units. Both gain +15% damage while linked. | Both players must stay together, preventing independent kiting. |
| **Soul chain** | Ability chains all enemies within 120 units. After 3s, all chained enemies take AOE damage. Moving out of range breaks chains. | Must stand in the middle of an enemy group for 3s for the payoff. |

---

## 4. Recommended New Class Concepts

Based on the archetype analysis and transferable mechanics, here are 8 new class concepts that would each bring a genuinely different playstyle to Spellstorm.

---

### 4.1 Graviturge (Battle Mage / Juggernaut)

**Key mechanic:** Proximity damage aura + tether-based sustain (Swain, Mordekaiser, Fiddlesticks)

**How the abilities feel:**
- **LMB (Gravity Bolt):** Short-range projectile (range ~160 units) that pulls enemies 30 units toward the player on hit. Low damage, fast fire rate. Each hit increases the player's "gravity field" intensity.
- **RMB (Singularity):** Toggle: creates a damage aura around the player (80 unit radius). Deals 1.5 dps to all enemies inside. Drains mana at 8/s while active. Enemies in the aura are slowed by 20%.
- **Q (Event Horizon):** Tether ability. Target an enemy within 200 units. A tether connects you for up to 3 seconds. While tethered, deal 2 dps to the target and heal 1 HP/s. If maintained for 3s, the target is stunned for 2s. Breaks if distance exceeds 200 units.
- **Ultimate (Gravitational Collapse):** Massive AOE pull. All enemies within 200 units are yanked to the player's position and stunned for 1.5s. The player gains a 4-second shield equal to 50% of their max HP.

**Kiting pattern:** The opposite of kiting. Graviturge wants to be surrounded. Their damage and healing scale with proximity and enemy density. Pulling enemies toward you and standing in the middle of a pack is the optimal play. This is a fundamentally new spatial relationship: getting closer to danger makes you stronger.

**LoL inspiration:** Swain's demonic aura, Mordekaiser's passive, Fiddlesticks' drain, Amumu's despair aura.

---

### 4.2 Bladecaller (Skirmisher / Assassin)

**Key mechanic:** 3-hit combo system + kill-reset mobility (Riven, Katarina, Irelia)

**How the abilities feel:**
- **LMB (Blade Combo):** 3-part melee combo. Press 1: forward slash (cone, 1 dmg). Press 2: cross cut (wider cone, 1.5 dmg). Press 3: execution strike (narrow, 3 dmg + stun 0.5s). Combo resets after 1.5s of not attacking. The rhythm is fast: ~0.3s between presses.
- **RMB (Shadow Step):** Short dash (120 units) that deals damage to enemies in the path. If Shadow Step kills an enemy, its cooldown resets instantly. This creates chain-dashing through waves of weak enemies.
- **Q (Blade Toss):** Throw a blade to target location. The blade stays embedded for 5s. Recast Q to dash to the blade's location, dealing AOE damage on arrival. This is a long-range gap closer with a setup phase.
- **Ultimate (Thousand Cuts):** Become untargetable for 0.5s, then unleash a flurry of 12 slashes in rapid succession in a cone, each dealing 1.5 damage. Total: 18 damage over 1.5 seconds if all hit.

**Kiting pattern:** Bladecaller does NOT kite. They dash through enemies, landing combos, chaining kills for mobility resets. The movement pattern is through the wave, not around it. If they can't kill fast enough, they're stuck with no dash and die. High risk, high reward melee that feels completely different from Berserker's straightforward cleave.

**LoL inspiration:** Riven's Q combo, Katarina's Shunpo reset, Irelia's Q reset on marked targets, Yasuo's E through enemies.

---

### 4.3 Architect (Zone Controller)

**Key mechanic:** Anchor-point casting + zone setup/payoff (Orianna, Azir, Gangplank)

**How the abilities feel:**
- **LMB (Command: Attack):** Fire a projectile from the player's Construct (a persistent movable entity on the field) toward the cursor. The Construct auto-aims at the nearest enemy if cursor is near it. Moderate damage, moderate fire rate. If no Construct is deployed, LMB fires normally from the player.
- **RMB (Command: Move):** Send the Construct to a target location. The Construct damages and slows enemies it passes through on the way. Travel time is ~0.5s. The Construct persists indefinitely at its destination until commanded again.
- **Q (Command: Protect):** The Construct generates a zone (80 unit radius) for 4 seconds that shields the player and ally within it (+2 damage reduction) and deals 1 dps to enemies inside.
- **Ultimate (Command: Shockwave):** The Construct detonates, pulling all enemies within 150 units toward it and dealing massive AOE damage (6 + enemies hit). This is the Orianna R payoff -- the setup is positioning the Construct, the payoff is the team-fight-winning pull + burst.

**Kiting pattern:** Architect kites around their Construct, not around enemies. The optimal pattern is to place the Construct in a choke point or enemy path, then orbit the Construct at medium range while LMB fires FROM the Construct. The player's position is separated from their damage source, creating a dual-positioning puzzle.

**LoL inspiration:** Orianna's Ball (all abilities center on it), Azir's sand soldiers, Heimerdinger's turret fortress.

---

### 4.4 Hexblade (Stance Switcher / Hybrid)

**Key mechanic:** Stance switching between ranged mage and melee fighter (Nidalee, Jayce, Elise)

**How the abilities feel:**

*Ranged Form (Caster):*
- **LMB:** Arcane bolts, moderate damage, long range (standard caster behavior)
- **RMB:** Mark enemy with Hex Curse (3s duration, next melee hit on cursed enemy deals 3x damage)
- **Q:** AOE debuff zone that reduces enemy speed and damage

*Melee Form (Blade):*
- **LMB:** Fast melee cone slash, moderate damage, short range
- **RMB:** Leap to target location (Leap spell type, deals AOE damage on landing)
- **Q:** Spinning strike (Nova, hits all nearby enemies)

- **Ultimate (Shift):** Switches between forms. 3-second cooldown. Switching forms grants 1 second of 50% damage reduction. In addition, the first ability used after switching forms is empowered: in melee form, first LMB after switching deals 2x damage; in ranged form, first LMB after switching pierces.

**Kiting pattern:** Two alternating patterns. In ranged form, the player kites and applies Hex Curse to high-value targets. They switch to melee form, leap to the cursed target for massive damage, spin to hit surrounding enemies, then switch back to ranged form to kite again. The rhythm is: kite -> mark -> switch -> dive -> kill -> switch -> kite. Each form change creates a distinct movement phase.

**LoL inspiration:** Nidalee (ranged poke -> cougar burst), Jayce (cannon poke -> hammer all-in), Elise (human CC -> spider execute).

---

### 4.5 Warden (Directional Tank / Protector)

**Key mechanic:** Directional shield + facing-based abilities (Braum, Yasuo Wind Wall, Shen)

**How the abilities feel:**
- **LMB (Mace Strike):** Short-range melee projectile (range ~100). Slow fire rate but high damage (3 per hit). Enemies hit are marked for 3s. Allied damage to marked enemies deals +1 bonus.
- **RMB (Aegis):** Hold RMB to raise a directional shield in the facing direction. While held: block all enemy projectiles from the front arc (120 degrees), reduce melee damage from the front by 75%, move at 50% speed. The shield has 10 "charges" -- each blocked projectile consumes 1 charge. Recharges over 5 seconds when not held. This is the Braum shield.
- **Q (Bastion):** Target the ally. For 4 seconds, create a damage-absorbing link. 30% of damage the ally takes is redirected to the Warden. While Bastion is active, the Warden's LMB also fires from the ally's position.
- **Ultimate (Unbreakable):** Create a massive shield dome (150 unit radius) at the player's position. For 3 seconds, all allies inside take 0 damage. Enemies inside are slowed by 50%. The Warden cannot move during the dome.

**Kiting pattern:** Warden does not kite. They position themselves between enemies and the ally, face the incoming threat, and tank. Movement is about interposing -- getting between the danger and the squishy -- not about creating distance. The RMB shield requires facing the threat, which means turning toward enemies, not away. This is the most radical departure from circle-kiting in the entire roster.

**LoL inspiration:** Braum's Unbreakable shield, Shen's Spirit Refuge, Taric's Bastion link-casting, Pantheon's directional shield.

---

### 4.6 Cannoneer (Artillery / Marksman)

**Key mechanic:** Charge-up primary + ammo system + channeled ultimate (Xerath, Jhin, Varus)

**How the abilities feel:**
- **LMB (Power Shot):** Hold to charge (0-1.5s). Quick tap fires a weak shot (1 dmg, 300 range). Full charge fires a devastating shot (4 dmg, 600 range, pierces 2 enemies). Movement speed reduced by 40% while charging. A visible charge indicator grows. Magazine: 4 shots. 4th shot always deals 1.5x damage regardless of charge. After 4 shots, 2-second reload (no shooting).
- **RMB (Concussive Blast):** Fire a slow-moving explosive shell that detonates on impact or after 1.5s. The detonation deals AOE damage and knocks enemies away from the blast center. Used for self-peel.
- **Q (Caltrops):** Drop caltrops at current position. Enemies walking over them take damage and are slowed for 3 seconds. Lingers for 8 seconds. Used to create safe zones behind the player while repositioning.
- **Ultimate (Barrage):** Root yourself for 4 seconds. Gain 4 ultra-long-range shots (800 range, 5 dmg each, 80 unit AOE on impact). Each shot is aimed independently at cursor. This is the Jhin/Xerath sniper fantasy.

**Kiting pattern:** Cannoneer's kiting is interrupted by charge-up windows and reload pauses. The optimal pattern is: charge-up a power shot while walking, fire, walk, charge, fire. The reload phase forces the player to use caltrops and concussive blast for defense. During Ultimate, the player is completely stationary and must rely on prior caltrop placement and ally protection. The rhythm is deliberate and methodical, not spam.

**LoL inspiration:** Jhin's 4-shot system and 4th shot execute, Xerath's R channeled artillery, Varus Q charge-up, Caitlyn's headshot system.

---

### 4.7 Soulbinder (Catcher / Enchanter)

**Key mechanic:** Tether CC + mark/detonate + ally empowerment (Thresh, Karma, Leona)

**How the abilities feel:**
- **LMB (Soul Lash):** Medium-range beam (200 units) that deals 1.5 damage and applies a Soul Mark to the target for 3 seconds. Soul-marked enemies take 25% more damage from the ally player. Fast fire rate.
- **RMB (Spirit Chain):** Fire a tether at target enemy (250 range). If it connects, the enemy is linked for 2 seconds. While linked: enemy is slowed by 30%. If the Soulbinder maintains proximity (<250 units) for the full 2 seconds, the enemy is rooted for 1.5 seconds. If the tether breaks (distance > 250), 50% of the mana is refunded.
- **Q (Empowerment):** Target the ally. For 5 seconds, the ally's abilities trigger Soul Mark detonations on marked enemies (bonus 2 damage per detonation, AOE to nearby enemies). If no ally is in range, self-cast: next 3 LMB shots have homing.
- **Ultimate (Soul Storm):** All enemies within 200 units are tethered. After 2 seconds, all enemies still within range are stunned for 2 seconds and take 4 damage. Enemies that leave the range before 2 seconds are freed. The Soulbinder gains a shield equal to the number of enemies stunned x 2.

**Kiting pattern:** Soulbinder's gameplay revolves around maintaining tether ranges. They must stay within 250 units of tethered enemies (too close for safe kiting) and within range of the ally (for empowerment). Their movement pattern is "hold position at tether range" rather than "circle at maximum distance." The 2-second tether commitment creates windows where the Soulbinder must stand their ground.

**LoL inspiration:** Karma W tether, Morgana R AOE tether, Leona passive marks, Thresh lantern (ally utility).

---

### 4.8 Invoker (Adaptive / Evolving Kit)

**Key mechanic:** Element cycling + ability evolution through play (Aphelios, Kha'Zix, Udyr, Invoker from Dota 2)

**How the abilities feel:**
- **LMB (Invoke):** Fires a projectile infused with the current element. Cycles between 4 elements every 10 seconds or after 15 LMB shots:
  - Fire: 2 dmg, burn for 2s
  - Ice: 1.5 dmg, slow for 1s
  - Lightning: 1.5 dmg, chains to 1 nearby enemy
  - Void: 2.5 dmg, pierces 1 enemy
- **RMB (Elemental Burst):** Consumes the current element for a powerful burst ability:
  - Fire RMB: Flame wave cone (Pyromancer-style)
  - Ice RMB: Freeze nova (all enemies within 100 units stunned 1s)
  - Lightning RMB: Chain lightning beam to 3 targets
  - Void RMB: Short-range blink that damages enemies at origin and destination
- **Q (Convergence):** Combines the current and next element for a special effect:
  - Fire+Ice: Steam cloud (zone, 80 radius, 3s, blind enemies: reduces their attack accuracy)
  - Ice+Lightning: Frozen lightning (cone, shatters frozen enemies for 2x damage)
  - Lightning+Void: Rift bolt (long-range piercing beam, 400 range)
  - Void+Fire: Chaotic explosion (AOE delayed, 100 radius, 0.6s delay, 5 damage)
- **Ultimate (Elemental Mastery):** Freezes the current element for 15 seconds, preventing rotation. Empowers all abilities with that element: 50% more damage, bonus effects doubled. Additionally, grants the player the passive benefit of the locked element:
  - Fire: +2 burn damage
  - Ice: enemies near player slowed by 20%
  - Lightning: +1 chain target on all hits
  - Void: all projectiles pierce +1

**Evolution mechanic:** At levels 5, 10, and 15, the player can permanently upgrade one element (chosen from the two most-used). Upgraded elements gain enhanced effects (e.g., Fire upgrade: burn spreads to nearby enemies; Ice upgrade: slowed enemies take +1 damage).

**Kiting pattern:** Invoker's kiting changes every 10 seconds based on the active element. Fire element encourages aggressive AOE. Ice element enables kiting with slows. Lightning rewards targeting clumps. Void rewards line-up shots. The player must adapt their positioning to whatever element is currently active, preventing a single autopilot pattern.

**LoL inspiration:** Aphelios's weapon cycling, Udyr's stance dance, Kha'Zix evolution choices. Additionally inspired by Dota 2's Invoker for the element combination concept.

---

## 5. Mechanics That DON'T Translate Well

### Lane Control / Last-Hitting
**LoL mechanic:** Timing auto-attacks to get the killing blow on minions for gold income.
**Why it doesn't work:** Spellstorm has no lane phase, no income-from-last-hits, and waves of enemies all aggressively chase players. There are no passive "minion" entities to farm. The closest equivalent (soul/essence collection from kills) is already suggested above but doesn't require last-hit timing precision.

### Vision Control / Fog of War
**LoL mechanic:** Placing and denying wards, controlling information about enemy positions.
**Why it doesn't work:** Spellstorm rooms are single-screen (1000x700) with full visibility. There is no fog of war. While dungeon room exploration has some "what's in the next room?" tension, real-time ward gameplay doesn't apply.

### Itemization Paths / Build Diversity
**LoL mechanic:** Choosing between different item build paths each game based on matchups and game state (e.g., armor vs. magic resist, burst vs. sustained damage).
**Why it doesn't work:** Spellstorm uses a wave-based upgrade selection system that already provides build diversity. However, the upgrade system is random-offer rather than shop-based, so the LoL concept of "rushing a specific item" doesn't translate. The existing shop system (potions, charms, etc.) is too simple for meaningful itemization branching.

### Macro Strategy / Split-Pushing
**LoL mechanic:** Deciding when to group as 5 vs. splitting the map with 1-3-1 or 4-1 configurations.
**Why it doesn't work:** Spellstorm is 2-player co-op in a single room. There are no lanes or map-wide decisions. While dungeon exploration involves room choice, there is no "split vs. group" macro decision during combat.

### Counter-Picking / Champion Select Mind Games
**LoL mechanic:** Choosing your champion in response to the enemy team's picks for favorable matchups.
**Why it doesn't work:** Spellstorm is PvE. Enemies are waves of predetermined types. There is no opponent making pick decisions. Class selection is cooperative (both players choose, ideally complementary classes).

### Cooldown-Dependent Engagement Windows (Ultimate Timers)
**LoL mechanic:** Teams track the enemy's ultimate cooldowns to decide when to fight. A team without ultimates avoids fights.
**Why it doesn't work in PvE:** Enemies don't have ultimates to track. The wave survival format means enemies are always coming regardless. However, the player's ultimate timing is meaningful -- saving Ultimate for boss waves or dense spawns is already a gameplay decision.

### Skillshot Dodging / Juking
**LoL mechanic:** Dodging enemy abilities through unpredictable movement patterns.
**Why it partially works:** Spellstorm enemies do fire projectiles (skeletons, necros, demons, archlord), and dodging them is part of gameplay. However, LoL's juke patterns (changing direction to make an opponent miss a skillshot) are less relevant because AI doesn't adapt to fake movements. Enemy projectile dodging is more about predictive movement than reactive juking.

### Experience Leads / Level Advantages
**LoL mechanic:** Being 1-2 levels ahead of the opponent gives stat advantages that define the power dynamic.
**Why it doesn't work:** Spellstorm levels are a progression mechanic, not a competitive advantage. Both players level at their own pace. There is no "ahead" or "behind" relative to another player. The XP system is cooperative.

### Teleport / Global Abilities
**LoL mechanic:** Abilities that affect the entire map (Twisted Fate R, Shen R, Teleport summoner spell).
**Why it doesn't work:** Single-room combat. "Global" has no meaning in a 1000x700 arena. Dungeon-wide abilities (affecting other rooms) could be interesting but would require significant system changes.

### Minion Wave Management
**LoL mechanic:** Controlling how fast minion waves push by manipulating which minions die first, freezing waves near your tower, or building up slow-pushes.
**Why it doesn't work:** Spellstorm enemy waves spawn on timers and chase players. There is no concept of "managing" the wave's push/pull. Enemies cannot be "frozen" in a favorable position (they always advance). The closest equivalent is zone control that funnels enemies, which IS transferable and is addressed in Section 2.5.

---

## Appendix: Quick Reference — Mechanic-to-Class Mapping

| Mechanic | Existing Spellstorm Class | Proposed New Class |
|---|---|---|
| Circle-kiting + LMB spam | Pyromancer, Cryomancer, Arcanist, Ranger | (Addressed by all new classes) |
| Proximity damage aura | (None) | Graviturge |
| 3-hit combo + kill-reset dash | Monk (partial) | Bladecaller |
| Anchor-point casting | Engineer (partial - turrets) | Architect |
| Stance switching | (None) | Hexblade |
| Directional shield + body-blocking | Knight (partial) | Warden |
| Charge-up + ammo system | (None) | Cannoneer |
| Tether CC + mark/detonate | (None) | Soulbinder |
| Element cycling + evolution | (None) | Invoker |
| Drain tether sustain | Warlock (partial - Drain Life) | Graviturge |
| Setup/payoff zone control | Engineer (partial) | Architect |
| Stacking permanent damage | (None) | (Passive option for any class) |
| Clone/decoy | (None) | (Potential Arcanist evolution) |
| Terrain creation | (None) | (Potential Cryomancer evolution) |
