/** Calibrated to door_bg.png (1536×1024). */
export const DOOR_VIEW = {
  panelW: 1.45,
  panelH: 2.98,
  gap: 0.012,
  offsetY: -0.058,
  offsetZ: 0.003,
  heightFraction: 0.632,
  widthFraction: 0.468,
  fov: 40,
  distancePad: 1.0,
} as const;

export const DOOR_ASSEMBLY_H = DOOR_VIEW.panelH + 0.1;
