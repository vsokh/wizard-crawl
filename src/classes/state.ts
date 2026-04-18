import { Player } from '../types';

/**
 * Per-class typed state bags. Accessed via getClassState<T>(p, key).
 *
 * Today's underscore-prefixed Player fields still exist for back-compat.
 * New class-specific state should live in one of the interfaces below.
 */

export interface StormcallerState {
  discharge: { shield: number; channelDetStacks: number };
  thunderGod: number;
  stormTimer: number;
}

export interface BladecallerState {
  lastShadowStep: number;
  rushSpeed: number;
  stealth: number;
  critPending: boolean;
  stealthShield: number;
  bladeFlurry: number;
  bladeFlurryTick: number;
}

export interface BerserkerState {
  rage: number;
  rageDmgMul: number;
  furyActive: boolean;
  proximityAuraTick: number;
  bloodlustStacks: number;
}

export interface ChronomancerState {
  snapTimer: number;
  rewindSnap: { hp: number; mana: number } | null;
  hasteBonus: boolean;
  hasteTimer: number;
  timeStopTimer: number;
  timeLoopUsed: boolean;
}

export interface PaladinState {
  auraTick: number;
  holyShield: number;
  resurrectionCd: number;
}

export interface KnightState {
  shieldWall: number;
}

export interface ArchitectState {
  fortified: boolean;
}

export interface WardenState {
  facingDR: boolean;
  wardenDR: number;
  invulnTimer: number;
}

export interface RangerState {
  eagleEyeStreak: number;
  eagleEyeTimer: number;
}

export interface CannoneerState {
  cannonShots: number;
  chargeLevel: number;
  chargeSlot: number;
}

export interface TidecallerState {
  summonCount: number;
}

export interface HexbladeState {
  currentForm: 'A' | 'B';
  formSwitchCd: number;
  formSwitchBuff: number;
  formDmgMult: number;
  formArmor: number;
}

export interface ClassStateByKey {
  stormcaller: StormcallerState;
  bladecaller: BladecallerState;
  berserker: BerserkerState;
  chronomancer: ChronomancerState;
  paladin: PaladinState;
  knight: KnightState;
  architect: ArchitectState;
  warden: WardenState;
  ranger: RangerState;
  cannoneer: CannoneerState;
  tidecaller: TidecallerState;
  hexblade: HexbladeState;
}

export type ClassStateBag = Partial<{ [K in keyof ClassStateByKey]: ClassStateByKey[K] }>;

const FACTORIES: { [K in keyof ClassStateByKey]: () => ClassStateByKey[K] } = {
  stormcaller: () => ({ discharge: { shield: 0, channelDetStacks: 0 }, thunderGod: 0, stormTimer: 0 }),
  bladecaller: () => ({ lastShadowStep: -Infinity, rushSpeed: 0, stealth: 0, critPending: false, stealthShield: 0, bladeFlurry: 0, bladeFlurryTick: 0 }),
  berserker:   () => ({ rage: 0, rageDmgMul: 1, furyActive: false, proximityAuraTick: 0, bloodlustStacks: 0 }),
  chronomancer:() => ({ snapTimer: 0, rewindSnap: null, hasteBonus: false, hasteTimer: 0, timeStopTimer: 0, timeLoopUsed: false }),
  paladin:     () => ({ auraTick: 0, holyShield: 0, resurrectionCd: 0 }),
  knight:      () => ({ shieldWall: 0 }),
  architect:   () => ({ fortified: false }),
  warden:      () => ({ facingDR: false, wardenDR: 0, invulnTimer: 0 }),
  ranger:      () => ({ eagleEyeStreak: 0, eagleEyeTimer: 0 }),
  cannoneer:   () => ({ cannonShots: 0, chargeLevel: 0, chargeSlot: -1 }),
  tidecaller:  () => ({ summonCount: 0 }),
  hexblade:    () => ({ currentForm: 'A', formSwitchCd: 0, formSwitchBuff: 0, formDmgMult: 1, formArmor: 0 }),
};

/** Lazy-initialized per-class state bag. Called from state.ts on player creation. */
export function initClassState(clsKey: string): ClassStateBag {
  const bag: ClassStateBag = {};
  const factory = (FACTORIES as Record<string, () => object>)[clsKey];
  if (factory) (bag as Record<string, object>)[clsKey] = factory();
  return bag;
}

export function getClassState<K extends keyof ClassStateByKey>(
  p: Player,
  key: K,
): ClassStateByKey[K] | undefined {
  return p.classState?.[key];
}

/** Get-or-create the class state bag for the player's active class. */
export function ensureClassState<K extends keyof ClassStateByKey>(
  p: Player,
  key: K,
): ClassStateByKey[K] {
  if (!p.classState) p.classState = {};
  const existing = p.classState[key] as ClassStateByKey[K] | undefined;
  if (existing) return existing;
  const fresh = FACTORIES[key]();
  p.classState[key] = fresh;
  return fresh;
}
