"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlassDoorsProps {
  progressRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}

/** Sized to align with door_bg.png framing in CinematicCamera. */
export const PANEL_W = 1.18;
export const PANEL_H = 2.78;
export const DOOR_ASSEMBLY_H = PANEL_H + 0.24;
const PANEL_D = 0.048;
const MAX_OPEN = Math.PI * 0.44;
const GAP = 0.014;

/** Champagne rose-gold satin — matched to door_bg.png */
const CHAMPAGNE = "#D4B48A";
const CHAMPAGNE_LIGHT = "#E2C9A4";
const CHAMPAGNE_SOFT = "#C9A67E";
const MULLION = "#DBC49E";
const FRAME_DARK = "#1A1410";

const INSET_X = 0.09;
const INSET_Y = 0.11;
const FACE_W = PANEL_W - INSET_X * 2;
const FACE_H = PANEL_H - INSET_Y * 2;

function ChampagneMat({
  color = CHAMPAGNE,
  roughness = 0.42,
  envIntensity = 0.72,
}: {
  color?: string;
  roughness?: number;
  envIntensity?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.86}
      roughness={roughness}
      envMapIntensity={envIntensity}
      clearcoat={0.22}
      clearcoatRoughness={0.18}
      reflectivity={0.55}
    />
  );
}

function DarkFrameMat() {
  return (
    <meshPhysicalMaterial
      color={FRAME_DARK}
      metalness={0.45}
      roughness={0.62}
      envMapIntensity={0.18}
    />
  );
}

function MullionBar({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <ChampagneMat color={MULLION} roughness={0.34} envIntensity={0.65} />
    </mesh>
  );
}

/** Horizontal T-bar handle at the meeting stile — like door_bg.png */
function TBarHandle({ side }: { side: "left" | "right" }) {
  const meetX = side === "left" ? PANEL_W / 2 - 0.055 : -PANEL_W / 2 + 0.055;
  const barShift = side === "left" ? 0.045 : -0.045;
  const z = PANEL_D / 2 + 0.011;

  return (
    <group position={[meetX, -0.015, z]}>
      <mesh position={[barShift, 0, 0]}>
        <boxGeometry args={[0.11, 0.014, 0.016]} />
        <ChampagneMat color={CHAMPAGNE_LIGHT} roughness={0.32} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.013, 0.055, 0.014]} />
        <ChampagneMat color={CHAMPAGNE_LIGHT} roughness={0.32} />
      </mesh>
    </group>
  );
}

function DoorGrid({ z }: { z: number }) {
  const hPositions = [FACE_H * 0.28, -FACE_H * 0.28];

  return (
    <group>
      <MullionBar position={[0, 0, z]} size={[0.007, FACE_H, 0.009]} />
      {hPositions.map((y) => (
        <MullionBar key={y} position={[0, y, z]} size={[FACE_W, 0.007, 0.009]} />
      ))}
    </group>
  );
}

function DoorPanel({
  side,
  targetAngleRef,
  animRef,
}: {
  side: "left" | "right";
  targetAngleRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}) {
  const pivotRef = useRef<THREE.Group>(null);
  const angle = useRef(0);

  const hingeX = side === "left" ? -(PANEL_W + GAP / 2) : PANEL_W + GAP / 2;
  const panelCenterX = side === "left" ? PANEL_W / 2 : -PANEL_W / 2;
  const openDir = side === "left" ? -1 : 1;
  const faceZ = PANEL_D / 2 + 0.003;

  useFrame((_, delta) => {
    if (!pivotRef.current) return;
    const target = targetAngleRef.current * openDir;
    const phase = animRef?.current.phase;
    if (phase === "complete") {
      angle.current = target;
    } else {
      const follow = phase === "opening" ? 20 : 10;
      angle.current = THREE.MathUtils.lerp(angle.current, target, Math.min(1, delta * follow));
    }
    pivotRef.current.rotation.y = angle.current;
  });

  return (
    <group position={[hingeX, 0, 0]}>
      <group ref={pivotRef}>
        <group position={[panelCenterX, 0, 0]}>
          {/* Dark recessed outer frame */}
          <mesh position={[0, 0, -0.004]}>
            <boxGeometry args={[PANEL_W + 0.02, PANEL_H + 0.02, PANEL_D + 0.008]} />
            <DarkFrameMat />
          </mesh>

          {/* Champagne door leaf */}
          <mesh>
            <boxGeometry args={[PANEL_W, PANEL_H, PANEL_D]} />
            <ChampagneMat />
          </mesh>

          {/* Inner satin face — slightly lighter */}
          <mesh position={[0, 0, faceZ - 0.006]}>
            <boxGeometry args={[FACE_W, FACE_H, 0.004]} />
            <ChampagneMat color={CHAMPAGNE_LIGHT} roughness={0.38} />
          </mesh>

          {/* Raised grid — 6 panels per leaf */}
          <DoorGrid z={faceZ} />

          <TBarHandle side={side} />
        </group>
      </group>
    </group>
  );
}

function DoorFrame() {
  const totalW = PANEL_W * 2 + GAP + 0.12;

  return (
    <group>
      {/* Wide champagne transom header */}
      <mesh position={[0, PANEL_H / 2 + 0.13, 0.006]}>
        <boxGeometry args={[totalW + 0.08, 0.09, 0.036]} />
        <ChampagneMat color={CHAMPAGNE_LIGHT} roughness={0.36} />
      </mesh>

      {/* Dark recess above door leaves */}
      <mesh position={[0, PANEL_H / 2 + 0.065, 0.002]}>
        <boxGeometry args={[totalW, 0.028, 0.042]} />
        <DarkFrameMat />
      </mesh>

      {/* Side jambs */}
      <mesh position={[-(PANEL_W + GAP / 2 + 0.028), 0, 0.004]}>
        <boxGeometry args={[0.028, PANEL_H + 0.1, 0.05]} />
        <DarkFrameMat />
      </mesh>
      <mesh position={[PANEL_W + GAP / 2 + 0.028, 0, 0.004]}>
        <boxGeometry args={[0.028, PANEL_H + 0.1, 0.05]} />
        <DarkFrameMat />
      </mesh>

      {/* Floor threshold */}
      <mesh position={[0, -PANEL_H / 2 - 0.012, 0.05]}>
        <boxGeometry args={[totalW + 0.06, 0.012, 0.03]} />
        <ChampagneMat color={CHAMPAGNE_SOFT} roughness={0.45} />
      </mesh>
    </group>
  );
}

export default function GlassDoors({ progressRef, animRef }: GlassDoorsProps) {
  const leftTargetRef = useRef(0);
  const rightTargetRef = useRef(0);

  useFrame(() => {
    const p = progressRef.current;
    leftTargetRef.current = p * MAX_OPEN;
    const delayed = Math.max(0, (p - 0.06) / 0.94);
    rightTargetRef.current = delayed * MAX_OPEN;
  });

  return (
    <group position={[0, 0, 0]}>
      <DoorFrame />
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
    </group>
  );
}
