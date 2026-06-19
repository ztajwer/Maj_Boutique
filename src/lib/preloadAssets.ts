import { PRODUCT_PATHS } from "@/data/products";

let productsPreloadStarted = false;
let dreiModule: typeof import("@react-three/drei") | null = null;

const warmCache = new Map<string, Promise<void>>();

async function getDrei() {
  if (!dreiModule) dreiModule = await import("@react-three/drei");
  return dreiModule;
}

function warmFetch(url: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const cached = warmCache.get(url);
  if (cached) return cached;

  const promise = fetch(url, { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      await res.arrayBuffer();
    })
    .catch(() => {
      /* non-blocking — decode may still succeed via useGLTF */
    });

  warmCache.set(url, promise);
  return promise;
}

function preloadGltf(path: string) {
  if (typeof window === "undefined") return;
  void getDrei().then(({ useGLTF }) => {
    useGLTF.preload(path);
  });
}

/** Images + door scene + table — starts during loader. */
export function bootCriticalAssets() {
  if (typeof window === "undefined") return;

  void warmFetch("/table-3d.glb");
  void warmFetch("/door_bg.png");
  void warmFetch("/background.png");

  preloadGltf("/table-3d.glb");

  void import("@/components/DoorSceneCanvas");
  void import("@/components/jewelry/JewelryHome");
  void import("@/components/jewelry/ShopExperience");
}

/** Resolves when the table GLB is in the HTTP cache (loader can proceed). */
export function waitForTableReady(): Promise<void> {
  return warmFetch("/table-3d.glb");
}

export function preloadTableAsset() {
  void warmFetch("/table-3d.glb");
  preloadGltf("/table-3d.glb");
}

/** Stagger product downloads so the table appears first, then jewelry fills in. */
export function preloadProductAssets() {
  if (productsPreloadStarted) return;
  productsPreloadStarted = true;

  PRODUCT_PATHS.forEach((path, index) => {
    window.setTimeout(() => {
      void warmFetch(path);
      preloadGltf(path);
    }, index * 300);
  });
}

export function startDoorTransitionPreload() {
  preloadProductAssets();
  prefetchShopChunk();
}

export function startShopPreload() {
  preloadProductAssets();
  prefetchShopChunk();
}

export function prefetchShopChunk() {
  if (typeof window === "undefined") return;
  void import("@/components/jewelry/JewelryHome");
  void import("@/components/jewelry/ShopExperience");
  void import("@/components/jewelry/TableProducts");
}
