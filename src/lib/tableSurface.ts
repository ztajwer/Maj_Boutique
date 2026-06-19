import * as THREE from "three";

export type TableSurfaceAnchor = {
  x: number;
  y: number;
  z: number;
};

/** Glass display tier in table-root local space (excludes bust / rim hits). */
const GLASS_Y_MIN = 0.045;
const GLASS_Y_MAX = 0.152;

const rayOrigin = new THREE.Vector3();
const rayDirection = new THREE.Vector3(0, -1, 0);
const faceNormal = new THREE.Vector3();

function pickGlassHit(
  hits: THREE.Intersection[],
  tableRoot: THREE.Object3D,
  x: number,
): TableSurfaceAnchor | null {
  for (const hit of hits) {
    if (!hit.face) continue;

    faceNormal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
    if (faceNormal.y < 0.62) continue;

    const local = tableRoot.worldToLocal(hit.point.clone());
    if (local.y < GLASS_Y_MIN || local.y > GLASS_Y_MAX) continue;

    return { x, y: local.y, z: local.z };
  }

  return null;
}

/** Raycast the table GLB to find glass-surface anchors for each product slot. */
export function measureTableSurfaceAnchors(
  scene: THREE.Object3D,
  tableRoot: THREE.Object3D,
  xOffsets: readonly number[],
): TableSurfaceAnchor[] {
  scene.updateMatrixWorld(true);
  tableRoot.updateMatrixWorld(true);

  const raycaster = new THREE.Raycaster();
  const anchors: TableSurfaceAnchor[] = [];

  for (const x of xOffsets) {
    let anchor: TableSurfaceAnchor | null = null;

    for (let z = -0.02; z <= 0.1; z += 0.015) {
      rayOrigin.set(x, 4, z);
      tableRoot.localToWorld(rayOrigin);
      raycaster.set(rayOrigin, rayDirection);

      const hit = pickGlassHit(raycaster.intersectObject(scene, true), tableRoot, x);
      if (!hit) continue;

      if (!anchor || hit.y < anchor.y) {
        anchor = hit;
      }
    }

    if (anchor) anchors.push(anchor);
  }

  if (anchors.length === xOffsets.length) return anchors;

  const fallbackY =
    anchors.reduce((sum, anchor) => sum + anchor.y, 0) / Math.max(anchors.length, 1);

  return xOffsets.map((x) => {
    const found = anchors.find((anchor) => Math.abs(anchor.x - x) < 0.001);
    if (found) return found;

    const left = anchors.filter((anchor) => anchor.x < x).sort((a, b) => b.x - a.x)[0];
    const right = anchors.filter((anchor) => anchor.x > x).sort((a, b) => a.x - b.x)[0];
    const y = left && right ? (left.y + right.y) * 0.5 : fallbackY;
    const z = left && right ? (left.z + right.z) * 0.5 : anchors[0]?.z ?? 0.05;

    return { x, y, z };
  });
}

export function getVisibleBox(object: THREE.Object3D) {
  const box = new THREE.Box3();
  const temp = new THREE.Box3();

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible) return;
    temp.setFromObject(mesh);
    box.union(temp);
  });

  if (box.isEmpty()) {
    return new THREE.Box3().setFromObject(object);
  }

  return box;
}

/** Pivot + scale bounds — jewelry silhouette without display-card padding. */
export function getJewelryPlacementBox(object: THREE.Object3D) {
  const box = getVisibleBox(object);
  if (box.isEmpty()) return box;

  const size = box.getSize(new THREE.Vector3());
  if (size.y <= 0.001) return box;

  return new THREE.Box3(
    new THREE.Vector3(
      box.min.x + size.x * 0.1,
      box.min.y,
      box.min.z + size.z * 0.1,
    ),
    new THREE.Vector3(
      box.max.x - size.x * 0.1,
      box.max.y - size.y * 0.06,
      box.max.z - size.z * 0.1,
    ),
  );
}
