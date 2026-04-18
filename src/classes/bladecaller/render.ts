import { WIZARD_SIZE } from '../../constants';
import { registerClassRender } from '../render';

registerClassRender('bladecaller', {
  drawUltAnim(ctx, x, y, _color, _glow, time, progress) {
    const S = WIZARD_SIZE;
    const alpha = progress * 0.8;
    const bladeColors = ['#cc3355', '#aa2244', '#ff4466'];
    const numBlades = 6;
    const slashLen = S * 3 * (1 - progress * 0.2);
    ctx.globalAlpha = alpha;
    for (let i = 0; i < numBlades; i++) {
      const bladeA = time * 8 + (i / numBlades) * Math.PI * 2 + progress * 4;
      ctx.strokeStyle = bladeColors[i % 3];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const sx = x + Math.cos(bladeA) * S * 0.3;
      const sy = y + Math.sin(bladeA) * S * 0.3;
      const ex = x + Math.cos(bladeA) * slashLen;
      const ey = y + Math.sin(bladeA) * slashLen;
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const trailA = bladeA - 0.3;
      ctx.lineTo(x + Math.cos(trailA) * slashLen * 0.8, y + Math.sin(trailA) * slashLen * 0.8);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }
  },
});
