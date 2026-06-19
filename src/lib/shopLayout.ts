/** Layout math for aligning UI with `public/background.png` (1655×950). */

export const BACKGROUND_IMAGE = {
  width: 1655,
  height: 950,
  objectPositionX: 0.5,
  objectPositionY: 0.54,
} as const;

/** Glass table rim — pixel Y from top of the source image. */
export const TABLE_TOP_IMAGE_Y = 598;

/** Product centers on the curved table — pixel X in the source image. */
export const PRODUCT_SLOT_IMAGE_X = [355, 620, 828, 1035, 1300] as const;

export const PRODUCT_SIZE_PX = 130;
export const PRODUCT_LIFT_ABOVE_TABLE_PX = 10;

export type CoverMapping = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function getCoverMapping(containerW: number, containerH: number): CoverMapping {
  const scale = Math.max(
    containerW / BACKGROUND_IMAGE.width,
    containerH / BACKGROUND_IMAGE.height,
  );
  const renderedW = BACKGROUND_IMAGE.width * scale;
  const renderedH = BACKGROUND_IMAGE.height * scale;
  const offsetX = (containerW - renderedW) * BACKGROUND_IMAGE.objectPositionX;
  const offsetY = (containerH - renderedH) * BACKGROUND_IMAGE.objectPositionY;
  return { scale, offsetX, offsetY };
}

export function imagePointToViewport(
  x: number,
  y: number,
  mapping: CoverMapping,
): { x: number; y: number } {
  return {
    x: mapping.offsetX + x * mapping.scale,
    y: mapping.offsetY + y * mapping.scale,
  };
}

export type ProductSlotLayout = {
  x: number;
  y: number;
};

export function getProductSlotLayouts(
  containerW: number,
  containerH: number,
): ProductSlotLayout[] {
  const mapping = getCoverMapping(containerW, containerH);
  const tableTop = imagePointToViewport(
    BACKGROUND_IMAGE.width / 2,
    TABLE_TOP_IMAGE_Y,
    mapping,
  ).y;
  const productBottom = tableTop - PRODUCT_LIFT_ABOVE_TABLE_PX;
  const centerY = productBottom - PRODUCT_SIZE_PX / 2;

  return PRODUCT_SLOT_IMAGE_X.map((imageX) => ({
    x: imagePointToViewport(imageX, TABLE_TOP_IMAGE_Y, mapping).x,
    y: centerY,
  }));
}
