"use client";

import { useLayoutEffect, useRef, type MutableRefObject } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DOOR_ASSEMBLY_H } from "./GlassDoors";

const DISTANCE_PAD = 1.018;
const FOV = 40;

interface CinematicCameraProps {
  progressRef: MutableRefObject<number>;
}

export default function CinematicCamera({ progressRef }: CinematicCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const baseDistanceRef = useRef(3.35);
  const { size } = useThree();

  useLayoutEffect(() => {
    const cam = cameraRef.current;
    if (!cam) return;

    const aspect = size.width / size.height;
    const vFovRad = (FOV * Math.PI) / 180;
    const halfV = vFovRad / 2;
    const distForHeight = (DOOR_ASSEMBLY_H / 2 / Math.tan(halfV)) * DISTANCE_PAD;
    const distForWidth = (DOOR_ASSEMBLY_H * 0.52) / Math.tan(halfV) / aspect;
    const distance = Math.max(distForHeight, distForWidth);

    baseDistanceRef.current = distance;
    cam.fov = FOV;
    cam.position.set(0, 0, distance);
    cam.rotation.set(0, 0, 0);
    cam.lookAt(0, 0, 0);
    cam.near = 0.1;
    cam.far = 50;
    cam.updateProjectionMatrix();
  }, [size.width, size.height]);

  useFrame(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const p = progressRef.current;
    cam.position.z = baseDistanceRef.current - p * 0.32;
    cam.position.y = p * 0.045;
  });

  return (
    <PerspectiveCamera ref={cameraRef} makeDefault fov={FOV} position={[0, 0, 3.35]} near={0.1} far={50} />
  );
}
