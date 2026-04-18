import { CLASSES } from './defs';

export type ResourceKind = 'mana' | 'static';

export interface ClassTheme {
  primary: string;
  glow: string;
  accent: string;
  resource: ResourceKind;
  resourceColor: string;
}

const OVERRIDES: Partial<Record<string, Partial<ClassTheme>>> = {
  stormcaller: { accent: '#cc88ff', resource: 'static', resourceColor: '#cc88ff' },
  bladecaller: { accent: '#ff4466' },
  pyromancer:  { accent: '#ffaa55' },
  cryomancer:  { accent: '#88ddff' },
  arcanist:    { accent: '#ff88cc' },
  necromancer: { accent: '#77dd77' },
  chronomancer:{ accent: '#ffdd66' },
  knight:      { accent: '#ccddee' },
  berserker:   { accent: '#ff6644' },
  paladin:     { accent: '#ffeeaa' },
  ranger:      { accent: '#aadd55' },
  druid:       { accent: '#66cc55' },
  warlock:     { accent: '#aa55cc' },
  monk:        { accent: '#ffee99' },
  engineer:    { accent: '#ffaa55' },
  graviturge:  { accent: '#8866cc' },
  architect:   { accent: '#55ccdd' },
  hexblade:    { accent: '#9977dd' },
  warden:      { accent: '#77aacc' },
  cannoneer:   { accent: '#ddaa55' },
  soulbinder:  { accent: '#77ccaa' },
  invoker:     { accent: '#ffaa66' },
  tidecaller:  { accent: '#55aadd' },
  voidweaver:  { accent: '#cc66ee' },
};

function build(): Record<string, ClassTheme> {
  const out: Record<string, ClassTheme> = {};
  for (const [key, def] of Object.entries(CLASSES)) {
    const over = OVERRIDES[key] || {};
    const primary = def.color;
    out[key] = {
      primary,
      glow: def.glow,
      accent: over.accent ?? primary,
      resource: over.resource ?? 'mana',
      resourceColor: over.resourceColor ?? '#4488ff',
    };
  }
  return out;
}

export const CLASS_THEME: Record<string, ClassTheme> = build();

export function themeFor(clsKey: string): ClassTheme {
  return CLASS_THEME[clsKey] ?? {
    primary: '#888888', glow: '#555555', accent: '#888888',
    resource: 'mana', resourceColor: '#4488ff',
  };
}
