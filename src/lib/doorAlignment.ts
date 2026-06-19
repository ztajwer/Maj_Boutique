/** Calibrated to door_bg.png (1536×1024). */
export const DOOR_VIEW = {
  panelW: 1.46,
  panelH: 2.99,
  gap: 0.011,
  offsetY: -0.056,
  offsetZ: 0.003,
  heightFraction: 0.634,
  widthFraction: 0.47,
  fov: 40,
  distancePad: 1.0,
} as const;

export const DOOR_ASSEMBLY_H = DOOR_VIEW.panelH + 0.1;

/** Slight vertical nudge on tall/narrow viewports. */
export function doorOffsetY(aspect: number): number {
  if (aspect < 0.72) return DOOR_VIEW.offsetY + 0.012;
  if (aspect > 1.85) return DOOR_VIEW.offsetY - 0.008;
  return DOOR_VIEW.offsetY;
}
