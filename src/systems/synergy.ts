import { GameState } from '../state';
import { Player, SpellType } from '../types';

// ═══════════════════════════════════
//       CLASS SYNERGY SYSTEM
// ═══════════════════════════════════

export interface SynergyDef {
  name: string;
  desc: string;
  classes: [string, string];  // two class keys that trigger this synergy
  color: string;              // glow/theme color
  bonuses: [string, string];  // human-readable bonus for classes[0], classes[1]
  apply: (state: GameState, p1: Player, p2: Player) => void;  // p1 is first class match, p2 is second
}

export const SYNERGIES: SynergyDef[] = [
  // 1. Pyromancer + Cryomancer = "Elemental Clash"
  {
    name: 'Elemental Clash',
    desc: 'Opposing elements amplify each other. All spells deal bonus damage.',
    classes: ['pyromancer', 'cryomancer'],
    color: '#ff88cc',
    bonuses: ['+1 dmg to all spells', '+1 dmg to all spells'],
    apply: (_state, p1, p2) => {
      for (const s of p1.cls.spells) s.dmg += 1;
      for (const s of p2.cls.spells) s.dmg += 1;
    },
  },

  // 2. Pyromancer + Stormcaller = "Firestorm"
  {
    name: 'Firestorm',
    desc: 'Fire and lightning intertwine. Fire stuns, lightning ignites.',
    classes: ['pyromancer', 'stormcaller'],
    color: '#ff8844',
    bonuses: ['+0.3 stun on all spells', '+1 burn on all spells'],
    apply: (_state, p1, p2) => {
      // Pyromancer: spells gain +0.3 stun
      for (const s of p1.cls.spells) s.stun += 0.3;
      // Stormcaller: spells gain +1 burn
      for (const s of p2.cls.spells) s.burn += 1;
    },
  },

  // 3. Cryomancer + Stormcaller = "Frozen Lightning"
  {
    name: 'Frozen Lightning',
    desc: 'Ice conducts lightning. Ice chains, lightning freezes.',
    classes: ['cryomancer', 'stormcaller'],
    color: '#88aaff',
    bonuses: ['Projectiles gain chain lightning', '+0.4 slow on all spells'],
    apply: (_state, p1, p2) => {
      // Cryomancer: projectile spells without zap gain chain lightning
      for (const s of p1.cls.spells) {
        if (s.type === SpellType.Projectile && !s.zap) {
          s.zap = 60;
          s.zapRate = 0.6;
        }
      }
      // Stormcaller: spells gain +0.4 slow
      for (const s of p2.cls.spells) s.slow += 0.4;
    },
  },

  // 4. Knight + Paladin = "Holy Bulwark"
  {
    name: 'Holy Bulwark',
    desc: 'Sacred defenders unite. Both gain bonus health and armor.',
    classes: ['knight', 'paladin'],
    color: '#ddeeff',
    bonuses: ['+2 max HP, +1 armor', '+2 max HP, +1 armor'],
    apply: (_state, p1, p2) => {
      p1.maxHp += 2; p1.hp += 2; p1.armor += 1;
      p2.maxHp += 2; p2.hp += 2; p2.armor += 1;
    },
  },

  // 5. Berserker + Necromancer = "Blood Pact"
  {
    name: 'Blood Pact',
    desc: 'A dark bond forged in blood. All attacks drain life.',
    classes: ['berserker', 'necromancer'],
    color: '#cc4444',
    bonuses: ['+15% life steal, +1 drain', '+15% life steal, +1 drain'],
    apply: (_state, p1, p2) => {
      p1.lifeSteal += 0.15;
      p2.lifeSteal += 0.15;
      for (const s of p1.cls.spells) s.drain += 1;
      for (const s of p2.cls.spells) s.drain += 1;
    },
  },

  // 6. Arcanist + Chronomancer = "Time Warp"
  {
    name: 'Time Warp',
    desc: 'Time bends to arcane will. Move faster, cast faster.',
    classes: ['arcanist', 'chronomancer'],
    color: '#ff88dd',
    bonuses: ['+15% move speed, \u221215% cooldowns', '+15% move speed, \u221215% cooldowns'],
    apply: (_state, p1, p2) => {
      p1.moveSpeed *= 1.15;
      p2.moveSpeed *= 1.15;
      for (const s of p1.cls.spells) s.cd *= 0.85;
      for (const s of p2.cls.spells) s.cd *= 0.85;
    },
  },

  // 7. Ranger + Engineer = "Arsenal"
  {
    name: 'Arsenal',
    desc: 'Arrows pierce, turrets dominate. Superior firepower.',
    classes: ['ranger', 'engineer'],
    color: '#aacc44',
    bonuses: ['+2 pierce on all spells', 'Turrets gain +1 dmg, +5s duration'],
    apply: (_state, p1, p2) => {
      // Ranger: +2 pierce on all spells
      for (const s of p1.cls.spells) s.pierce += 2;
      // Engineer: zone spells (turrets) get +1 dmg and +5 duration
      for (const s of p2.cls.spells) {
        if (s.type === SpellType.Zone) {
          s.dmg += 1;
          s.duration += 5;
        }
      }
    },
  },

  // 8. Druid + Warlock = "Dark Nature"
  {
    name: 'Dark Nature',
    desc: 'Nature corrupted by shadow. All magic drains life force.',
    classes: ['druid', 'warlock'],
    color: '#66aa66',
    bonuses: ['+1 HP regen, +1 drain', '+1 HP regen, +1 drain'],
    apply: (_state, p1, p2) => {
      p1.hpRegen += 1;
      p2.hpRegen += 1;
      for (const s of p1.cls.spells) s.drain += 1;
      for (const s of p2.cls.spells) s.drain += 1;
    },
  },

  // 9. Monk + Paladin = "Inner Light"
  {
    name: 'Inner Light',
    desc: 'Spiritual harmony. The monk evades, the paladin heals.',
    classes: ['monk', 'paladin'],
    color: '#ffeedd',
    bonuses: ['+15% dodge chance', 'Zone spells gain +1 heal'],
    apply: (_state, p1, p2) => {
      // Monk: +15% dodge chance
      p1.dodgeChance += 0.15;
      // Paladin: zone spells get +1 heal
      for (const s of p2.cls.spells) {
        if (s.type === SpellType.Zone) s.heal += 1;
      }
    },
  },

  // 10. Necromancer + Warlock = "Dark Covenant"
  {
    name: 'Dark Covenant',
    desc: 'Twin masters of death. Drain effects are doubled.',
    classes: ['necromancer', 'warlock'],
    color: '#7733aa',
    bonuses: ['2\u00d7 drain, +2 max mana', '2\u00d7 drain, +2 max mana'],
    apply: (_state, p1, p2) => {
      // Double all drain values on spells
      for (const s of p1.cls.spells) s.drain *= 2;
      for (const s of p2.cls.spells) s.drain *= 2;
      // +2 maxMana and +2 mana for both
      p1.maxMana += 2; p1.mana += 2;
      p2.maxMana += 2; p2.mana += 2;
    },
  },
];

/** Get all synergies involving a class */
export function getSynergiesForClass(cls: string): { synergy: SynergyDef; partnerClass: string }[] {
  const results: { synergy: SynergyDef; partnerClass: string }[] = [];
  for (const syn of SYNERGIES) {
    if (syn.classes[0] === cls) results.push({ synergy: syn, partnerClass: syn.classes[1] });
    else if (syn.classes[1] === cls) results.push({ synergy: syn, partnerClass: syn.classes[0] });
  }
  return results;
}

/** Find matching synergy for a class pair (order-independent) */
export function getSynergy(cls1: string, cls2: string): SynergyDef | null {
  for (const syn of SYNERGIES) {
    if (
      (syn.classes[0] === cls1 && syn.classes[1] === cls2) ||
      (syn.classes[0] === cls2 && syn.classes[1] === cls1)
    ) {
      return syn;
    }
  }
  return null;
}

/** Apply synergies to game state after players are created. Only works if 2 players with a matching pair. */
export function applySynergies(state: GameState): void {
  if (state.players.length < 2) return;

  const p0 = state.players[0];
  const p1 = state.players[1];
  const syn = getSynergy(p0.clsKey, p1.clsKey);
  if (!syn) return;

  // Determine which player maps to classes[0] and classes[1]
  let first: Player;
  let second: Player;
  if (p0.clsKey === syn.classes[0]) {
    first = p0;
    second = p1;
  } else {
    first = p1;
    second = p0;
  }

  syn.apply(state, first, second);
  state.activeSynergy = { name: syn.name, desc: syn.desc, color: syn.color };
  state.synergyBannerTimer = 4; // show banner for 4 seconds
}
