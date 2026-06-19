"use client";

import { useLayoutEffect, useRef, type MutableRefObject } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DOOR_VIEW } from "@/lib/doorAlignment";

const FOV = DOOR_VIEW.fov;

interface CinematicCameraProps {
  progressRef: MutableRefObject<number>;
}

export default function CinematicCamera({ progressRef }: CinematicCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const baseDistanceRef = useRef(3.35);
  const { size } = useThree();

  const totalDoorW = DOOR_VIEW.panelW * 2 + DOOR_VIEW.gap;

  useLayoutEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;

    const aspect = size.width / size.height;
    const vFovRad = (FOV * Math.PI) / 180;
    const halfV = vFovRad / 2;
    const tanHalf = Math.tan(halfV);

    const distForHeight =
      (DOOR_VIEW.panelH / (DOOR_VIEW.heightFraction * 2 * tanHalf)) * DOOR_VIEW.distancePad;
    const distForWidth =
      (totalDoorW / (DOOR_VIEW.widthFraction * 2 * tanHalf * aspect)) * DOOR_VIEW.distancePad;
    const distance = Math.max(distForHeight, distForWidth);

    baseDistanceRef.current = distance;
    cam.fov = FOV;
    cam.position.set(0, DOOR_VIEW.offsetY * 0.15, distance);
    cam.rotation.set(0, 0, 0);
    cam.lookAt(0, DOOR_VIEW.offsetY * 0.15, 0);
    cam.near = 0.1;
    cam.far = 50;
    cam.updateProjectionMatrix();
  }, [size.width, size.height, totalDoorW]);

  useFrame(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const p = progressRef.current;
    const lookY = DOOR_VIEW.offsetY * 0.15;
    cam.position.z = baseDistanceRef.current - p * 0.32;
    cam.position.y = lookY + p * 0.045;
    cam.lookAt(0, lookY + p * 0.02, 0);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={FOV}
      position={[0, 0, 3.35]}
      near={0.1}
      far={50}
    />
  );
}
