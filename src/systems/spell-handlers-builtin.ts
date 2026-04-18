import { SpellType } from '../types';
import { clamp, spawnParticles, netSfx } from '../state';
import { SfxName } from '../types';
import { WIZARD_SIZE, ROOM_WIDTH, ROOM_HEIGHT, TIMING } from '../constants';
import { registerSpellHandler } from './spell-handlers';

registerSpellHandler(SpellType.Blink, (state, p, def, _idx, _angle, cos, sin) => {
  const range = def.range ?? 0;
  p.x = clamp(p.x + cos * range, WIZARD_SIZE, ROOM_WIDTH - WIZARD_SIZE);
  p.y = clamp(p.y + sin * range, WIZARD_SIZE, ROOM_HEIGHT - WIZARD_SIZE);
  spawnParticles(state, p.x, p.y, def.color, 12);
  spawnParticles(state, p.x, p.y, def.color, 12);
  p.iframes = TIMING.IFRAME_BLINK;
  netSfx(state, SfxName.Blink);
  return true;
});
