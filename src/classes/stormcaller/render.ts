import { WIZARD_SIZE } from '../../constants';
import { noise } from '../../rendering/draw-entities';
import { registerClassRender } from '../render';

registerClassRender('stormcaller', {
  drawUltAnim(ctx, x, y, _color, _glow, time, progress) {
    const S = WIZARD_SIZE;
    const alpha = progress * 0.8;
    const boltColors = ['#bb66ff', '#ffee88', '#ffffff'];
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    const numBolts = 7;
    for (let i = 0; i < numBolts; i++) {
      const angle = (i / numBolts) * Math.PI * 2 + noise(i * 37 + time * 10) * 0.5;
      const len = S * 3 * (1 - progress * 0.3);
      ctx.strokeStyle = boltColors[i % 3];
      ctx.beginPath();
      ctx.moveTo(x, y);
      let bx = x, by = y;
      const segs = 5;
      for (let s = 1; s <= segs; s++) {
        const t = s / segs;
        const jitter = noise(i * 13 + s * 7 + time * 20) * S * 0.5;
        bx = x + Math.cos(angle) * len * t + Math.cos(angle + Math.PI / 2) * jitter;
        by = y + Math.sin(angle) * len * t + Math.sin(angle + Math.PI / 2) * jitter;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  },
});
