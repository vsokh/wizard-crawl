// Gradient cache — avoids re-creating identical CanvasGradient objects each frame.
// Keyed by a string encoding of geometry params + color stops.

type Stop = [number, string];

const cache = new Map<string, CanvasGradient>();
const MAX_SIZE = 512;

export function radGrad(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, r0: number,
  x1: number, y1: number, r1: number,
  stops: Stop[]
): CanvasGradient {
  const key = `R${x0},${y0},${r0},${x1},${y1},${r1};${stops.length}`;
  // Append stop info to key only when needed for uniqueness
  let fullKey = key;
  for (let i = 0; i < stops.length; i++) fullKey += `;${stops[i][0]}${stops[i][1]}`;

  let g = cache.get(fullKey);
  if (g) return g;

  if (cache.size >= MAX_SIZE) cache.clear();
  g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
  cache.set(fullKey, g);
  return g;
}

export function linGrad(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number,
  x1: number, y1: number,
  stops: Stop[]
): CanvasGradient {
  const key = `L${x0},${y0},${x1},${y1}`;
  let fullKey = key;
  for (let i = 0; i < stops.length; i++) fullKey += `;${stops[i][0]}${stops[i][1]}`;

  let g = cache.get(fullKey);
  if (g) return g;

  if (cache.size >= MAX_SIZE) cache.clear();
  g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
  cache.set(fullKey, g);
  return g;
}

export function clearGradCache(): void {
  cache.clear();
}
