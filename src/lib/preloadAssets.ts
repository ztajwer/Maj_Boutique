import { PRODUCT_PATHS } from "@/data/products";

let productsPreloadStarted = false;

function preloadGltf(path: string) {
  if (typeof window === "undefined") return;
  void import("@react-three/drei").then(({ useGLTF }) => {
    useGLTF.preload(path);
  });
}

/** Kick off homepage assets — background is a static image. */
export function bootCriticalAssets() {
  if (typeof window === "undefined") return;
}

export function preloadTableAsset() {
  preloadGltf("/table-3d.glb");
}

export function preloadProductAssets() {
  if (productsPreloadStarted) return;
  productsPreloadStarted = true;
  PRODUCT_PATHS.forEach((path) => preloadGltf(path));
}

export function startDoorTransitionPreload() {
  preloadProductAssets();
}

export function startShopPreload() {
  preloadProductAssets();
}

export function prefetchShopChunk() {
  if (typeof window === "undefined") return;
  void import("@/components/shop/ShopCarouselView");
  void import("@/components/shop/ProductCarousel");
}
