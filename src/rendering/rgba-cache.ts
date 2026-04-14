// ═══════════════════════════════════
//   Cached rgba() color string factory
// ═══════════════════════════════════
// Avoids per-frame string concatenation/template literal allocation.
// Numeric key: pack r(8), g(8), b(8), quantized-alpha(8) into one 32-bit number
// so Map lookup doesn't need a string key.

const _cache = new Map<number, string>();

export function rgba(r: number, g: number, b: number, a: number): string {
  const aq = Math.max(0, Math.min(100, (a * 100 + 0.5) | 0));
  const key = ((r & 0xff) << 24) | ((g & 0xff) << 16) | ((b & 0xff) << 8) | aq;
  let s = _cache.get(key);
  if (s === undefined) {
    s = `rgba(${r},${g},${b},${aq === 100 ? 1 : aq === 0 ? 0 : (aq / 100).toFixed(2)})`;
    _cache.set(key, s);
  }
  return s;
}
