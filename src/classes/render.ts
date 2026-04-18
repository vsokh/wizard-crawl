import type { Player } from '../types';

export interface ClassRender {
  drawBody?: (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, angle: number,
    color: string, glow: string, time: number,
    player?: { hp: number; maxHp: number; _furyActive: boolean }
  ) => void;

  drawUltAnim?: (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    color: string, glow: string,
    time: number, progress: number
  ) => void;

  drawWeapon?: (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, angle: number,
    color: string, S: number
  ) => void;

  /** Overlay pass (e.g. stealth alpha). Runs after body, before weapon. */
  drawOverlay?: (
    ctx: CanvasRenderingContext2D,
    p: Player, time: number
  ) => void;
}

const RENDER_REGISTRY: Record<string, ClassRender> = {};

export function registerClassRender(clsKey: string, render: ClassRender): void {
  RENDER_REGISTRY[clsKey] = render;
}

export function getClassRender(clsKey: string): ClassRender | undefined {
  return RENDER_REGISTRY[clsKey];
}
