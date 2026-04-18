export const MAX_WAVES = 20;

export function upgradeChoiceCount(wave: number): number {
  if (wave >= 12) return 4;
  return 3;
}

export const HEALTH_DROP_CHANCE = 0.18;

export function healthPickupAmount(wave: number): number {
  if (wave >= 15) return 4;
  if (wave >= 8) return 3;
  return 2;
}

export function scaledHealthDropChance(wave: number): number {
  const base = 0.18;
  if (wave <= 10) return base;
  return base + (wave - 10) * 0.01;
}

export const HP_LEVEL_INTERVAL = 3;

export const XP_BASE_THRESHOLD = 28;
export const XP_STEPS: [number, number][] = [
  [5, 22],
  [10, 28],
  [15, 38],
  [Infinity, 50],
];
export function getXpStep(level: number): number {
  for (const [maxLvl, step] of XP_STEPS) {
    if (level <= maxLvl) return step;
  }
  return XP_STEPS[XP_STEPS.length - 1][1];
}

export function goldDropBonus(wave: number): number {
  if (wave >= 15) return 3;
  if (wave >= 8) return 2;
  if (wave >= 4) return 1;
  return 0;
}

export function waveClearGold(wave: number): number {
  const base = 5 + wave * 3;
  return Math.round(base);
}

export interface ShopItemDef {
  id: string;
  name: string;
  desc: string;
  basePrice: number;
  priceIncrease: number;
  maxBuys: number;
  color: string;
}

export const SHOP_ITEMS: ShopItemDef[] = [
  { id: 'heal', name: 'Health Potion', desc: 'Restore 3 HP', basePrice: 8, priceIncrease: 2, maxBuys: 0, color: '#44cc55' },
  { id: 'maxhp', name: 'Vitality Charm', desc: '+2 Max HP', basePrice: 30, priceIncrease: 15, maxBuys: 5, color: '#cc4444' },
  { id: 'dmgboost', name: 'Power Shard', desc: '+1 spell damage (this wave)', basePrice: 15, priceIncrease: 5, maxBuys: 0, color: '#cc8833' },
  { id: 'shield', name: 'Ward Stone', desc: 'Block next 2 hits', basePrice: 20, priceIncrease: 5, maxBuys: 0, color: '#4488cc' },
  { id: 'speed', name: 'Swift Boots', desc: '+15% move speed (permanent)', basePrice: 25, priceIncrease: 20, maxBuys: 3, color: '#88cc44' },
];

export const BOSS_WAVE_XP: Record<number, number> = { 5: 65, 10: 90, 15: 110, 20: 150 };
