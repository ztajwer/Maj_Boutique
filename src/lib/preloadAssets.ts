import { PRODUCT_PATHS } from "@/data/products";

export const ASSET_URLS = [
  "/background.png",
  "/door_bg.png",
  "/logo.png",
  "/star.png",
  "/table-3d.glb",
  ...PRODUCT_PATHS,
] as const;

let booted = false;
let productsPreloadStarted = false;
let dreiModule: typeof import("@react-three/drei") | null = null;

const warmCache = new Map<string, Promise<void>>();

async function getDrei() {
  if (!dreiModule) dreiModule = await import("@react-three/drei");
  return dreiModule;
}

/** Parallel HTTP warm — all assets at once. */
export function warmFetch(url: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const cached = warmCache.get(url);
  if (cached) return cached;

  const promise = fetch(url, { cache: "force-cache", priority: "high" } as RequestInit)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      await res.arrayBuffer();
    })
    .catch(() => undefined);

  warmCache.set(url, promise);
  return promise;
}

function preloadGltf(path: string) {
  if (typeof window === "undefined") return;
  void getDrei().then(({ useGLTF }) => {
    useGLTF.preload(path);
  });
}

/** Fire every asset download in parallel — call as early as possible. */
export function warmAllAssets() {
  if (typeof window === "undefined") return;
  ASSET_URLS.forEach((url) => void warmFetch(url));
}

/** Images, audio, GLBs, and JS chunks — parallel. */
export function bootCriticalAssets() {
  if (typeof window === "undefined" || booted) return;
  booted = true;

  warmAllAssets();

  preloadGltf("/table-3d.glb");
  PRODUCT_PATHS.forEach(preloadGltf);

  void import("@/components/DoorSceneCanvas");
  void import("@/components/jewelry/JewelryHome");
  void import("@/components/jewelry/ShopExperience");
  void import("@/components/jewelry/TableProducts");

  void import("@/lib/boutiqueAudio").then(({ preloadBoutiqueAudio }) => {
    preloadBoutiqueAudio();
  });
}

export function waitForTableReady(): Promise<void> {
  return warmFetch("/table-3d.glb");
}

export function preloadTableAsset() {
  void warmFetch("/table-3d.glb");
  preloadGltf("/table-3d.glb");
}

export function preloadProductAssets() {
  if (productsPreloadStarted) return;
  productsPreloadStarted = true;
  PRODUCT_PATHS.forEach((path) => {
    void warmFetch(path);
    preloadGltf(path);
  });
}

export function startDoorTransitionPreload() {
  prefetchShopChunk();
}

export function startShopPreload() {
  prefetchShopChunk();
}

export function prefetchShopChunk() {
  if (typeof window === "undefined") return;
  void import("@/components/jewelry/JewelryHome");
  void import("@/components/jewelry/ShopExperience");
  void import("@/components/jewelry/TableProducts");
}
