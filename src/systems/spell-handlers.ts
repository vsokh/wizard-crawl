import { Player, SpellDef, SpellType } from '../types';
import { GameState } from '../state';

/**
 * Spell handler registry. Each SpellType can register a handler that runs
 * inside castSpell after mana/cooldown are paid and before the legacy chain.
 *
 * Handlers return true when they handle the cast; false/void falls through.
 *
 * Only types with a registered handler are dispatched this way today. The rest
 * remain in the legacy if/else chain in combat.ts pending per-type migration.
 */
export type SpellHandler = (
  state: GameState,
  p: Player,
  def: SpellDef,
  idx: number,
  angle: number,
  cos: number,
  sin: number,
) => boolean | void;

const SPELL_HANDLERS: Partial<Record<SpellType, SpellHandler>> = {};

export function registerSpellHandler(type: SpellType, handler: SpellHandler): void {
  SPELL_HANDLERS[type] = handler;
}

export function dispatchSpell(
  state: GameState,
  p: Player,
  def: SpellDef,
  idx: number,
  angle: number,
  cos: number,
  sin: number,
): boolean {
  const h = SPELL_HANDLERS[def.type];
  if (!h) return false;
  return h(state, p, def, idx, angle, cos, sin) === true;
}
