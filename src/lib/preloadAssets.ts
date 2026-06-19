import { PRODUCT_PATHS } from "@/data/products";

const CRITICAL_IMAGES = ["/wh_logo.jpeg", "/door_bg.png", "/logo.png", "/star.png"] as const;
const DEFERRED_IMAGES = ["/background.png", "/bg.png"] as const;

let booted = false;
let productsPreloadStarted = false;
let dreiModule: typeof import("@react-three/drei") | null = null;

const warmCache = new Map<string, Promise<void>>();

async function getDrei() {
  if (!dreiModule) dreiModule = await import("@react-three/drei");
  return dreiModule;
}

export function warmFetch(url: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const cached = warmCache.get(url);
  if (cached) return cached;

  const promise = fetch(url, { cache: "force-cache" })
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

/** Runs immediately on page load — parallel, never blocks the 3s loader timer. */
export function bootCriticalAssets() {
  if (typeof window === "undefined" || booted) return;
  booted = true;

  CRITICAL_IMAGES.forEach((url) => void warmFetch(url));

  window.setTimeout(() => {
    DEFERRED_IMAGES.forEach((url) => void warmFetch(url));
  }, 200);

  void getDrei().then(({ useTexture }) => {
    useTexture.preload("/door_bg.png");
  });

  void import("@/components/DoorSceneCanvas");
  void import("@/components/jewelry/ShopExperience");
  void import("@/components/jewelry/JewelryHome");
  void import("@/components/jewelry/TableProducts");

  void import("@/lib/boutiqueAudio").then(({ preloadBoutiqueAudio }) => {
    preloadBoutiqueAudio();
  });

  window.setTimeout(() => {
    void warmFetch("/table-3d.glb");
    preloadGltf("/table-3d.glb");
    preloadProductAssets();
  }, 40);
}

export function bootAfterLoader() {
  void warmFetch("/background.png");
  void getDrei().then(({ useTexture }) => {
    useTexture.preload("/background.png");
  });
  preloadTableAsset();
  prefetchShopChunk();
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

  PRODUCT_PATHS.forEach((path, index) => {
    window.setTimeout(() => {
      void warmFetch(path);
      preloadGltf(path);
    }, index * 50);
  });
}

export function startDoorTransitionPreload() {
  prefetchShopChunk();
  preloadProductAssets();
  void warmFetch("/background.png");
}

export function startShopPreload() {
  prefetchShopChunk();
  preloadTableAsset();
}

export function prefetchShopChunk() {
  if (typeof window === "undefined") return;
  void import("@/components/jewelry/JewelryHome");
  void import("@/components/jewelry/ShopExperience");
  void import("@/components/jewelry/TableProducts");
}
