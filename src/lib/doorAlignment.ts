/** Calibrated to door_bg.png (1536×1024) — door opening in image space. */
export const DOOR_BG_SIZE = { w: 1536, h: 1024 } as const;

/** Fraction of door_bg image occupied by the door opening (measured). */
export const DOOR_OPENING = {
  /** Each leaf width as fraction of image width */
  leafWidth: 0.188,
  centerGap: 0.013,
  /** Leaf height as fraction of image height */
  leafHeight: 0.628,
  /** Vertical center of opening (0 = top, 1 = bottom) */
  centerY: 0.484,
} as const;

export const DOOR_VIEW = {
  panelW: 1.42,
  panelH: 2.96,
  gap: 0.014,
  offsetY: -0.062,
  offsetZ: 0.002,
  /** Visible height fraction the door leaves should occupy */
  heightFraction: 0.628,
  /** Visible width fraction for both leaves + gap */
  widthFraction: 0.462,
  fov: 40,
  distancePad: 1.0,
} as const;

export const DOOR_ASSEMBLY_H = DOOR_VIEW.panelH + 0.12;
