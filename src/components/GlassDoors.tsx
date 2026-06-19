"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface GlassDoorsProps {
  progressRef: MutableRefObject<number>;
  animRef?: MutableRefObject<{ phase: string }>;
}

/** Sized to align with door_bg.png framing in CinematicCamera. */
export const PANEL_W = 1.18;
export const PANEL_H = 2.78;
export const DOOR_ASSEMBLY_H = PANEL_H + 0.24;
const PANEL_D = 0.042;
const MAX_OPEN = Math.PI * 0.44;
const GAP = 0.016;

/** Rose-gold champagne palette — matched to boutique interior */
const CHAMPAGNE = "#D4B48A";
const CHAMPAGNE_LIGHT = "#E8D4B0";
const CHAMPAGNE_SOFT = "#C9A67E";
const CHAMPAGNE_DEEP = "#8E6E52";
const MULLION = "#DBC49E";

const INSET_X = 0.088;
const INSET_Y = 0.105;
const FACE_W = PANEL_W - INSET_X * 2;
const FACE_H = PANEL_H - INSET_Y * 2;

useTexture.preload("/background.png");

function RoseGoldMat({
  color = CHAMPAGNE,
  roughness = 0.28,
  envIntensity = 0.88,
  metalness = 0.92,
}: {
  color?: string;
  roughness?: number;
  envIntensity?: number;
  metalness?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      envMapIntensity={envIntensity}
      clearcoat={0.35}
      clearcoatRoughness={0.12}
      reflectivity={0.72}
    />
  );
}

function GlassPane({ width, height }: { width: number; height: number }) {
  return (
    <mesh renderOrder={1}>
      <boxGeometry args={[width, height, 0.014]} />
      <meshPhysicalMaterial
        color="#FFFDF9"
        metalness={0}
        roughness={0.028}
        transmission={0.97}
        thickness={0.018}
        ior={1.52}
        transparent
        opacity={0.12}
        attenuationColor="#F0E4D4"
        attenuationDistance={6}
        envMapIntensity={1.15}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
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
    <mesh position={position} renderOrder={3}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={MULLION}
        metalness={0.92}
        roughness={0.22}
        envMapIntensity={0.78}
        clearcoat={0.35}
        clearcoatRoughness={0.12}
        reflectivity={0.72}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}

/** Boutique interior visible through glass — matches background.png */
export function DoorInteriorView() {
  const texture = useTexture("/background.png");
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = texture.image as HTMLImageElement | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 16 / 9;
  const planeH = 3.85;
  const planeW = Math.min(planeH * aspect, 6.8);

  return (
    <group position={[0, 0.04, -2.65]} renderOrder={-20}>
      <mesh renderOrder={-20}>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={texture} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]} renderOrder={-19}>
        <planeGeometry args={[planeW * 0.92, planeH * 0.88]} />
        <meshBasicMaterial
          color="#FFF6EE"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/** Horizontal T-bar handle at the meeting stile */
function TBarHandle({ side }: { side: "left" | "right" }) {
  const meetX = side === "left" ? PANEL_W / 2 - 0.052 : -PANEL_W / 2 + 0.052;
  const barShift = side === "left" ? 0.042 : -0.042;
  const z = PANEL_D / 2 + 0.014;

  return (
    <group position={[meetX, -0.012, z]} renderOrder={4}>
      <mesh position={[barShift, 0, 0]}>
        <boxGeometry args={[0.108, 0.013, 0.014]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.2} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.012, 0.052, 0.013]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.2} />
      </mesh>
    </group>
  );
}

function DoorGrid({ z }: { z: number }) {
  const hPositions = [FACE_H * 0.28, -FACE_H * 0.28];

  return (
    <group>
      <MullionBar position={[0, 0, z]} size={[0.006, FACE_H, 0.008]} />
      {hPositions.map((y) => (
        <MullionBar key={y} position={[0, y, z]} size={[FACE_W, 0.006, 0.008]} />
      ))}
    </group>
  );
}

/** Rose-gold frame rails around the glass inset */
function PanelFrame({ faceZ }: { faceZ: number }) {
  const halfW = PANEL_W / 2;
  const halfH = PANEL_H / 2;
  const railD = PANEL_D;

  return (
    <group renderOrder={0}>
      <mesh position={[0, halfH - INSET_Y / 2, 0]}>
        <boxGeometry args={[PANEL_W, INSET_Y, railD]} />
        <RoseGoldMat />
      </mesh>
      <mesh position={[0, -halfH + INSET_Y / 2, 0]}>
        <boxGeometry args={[PANEL_W, INSET_Y, railD]} />
        <RoseGoldMat color={CHAMPAGNE_SOFT} roughness={0.32} />
      </mesh>
      <mesh position={[-halfW + INSET_X / 2, 0, 0]}>
        <boxGeometry args={[INSET_X, PANEL_H - INSET_Y * 2, railD]} />
        <RoseGoldMat />
      </mesh>
      <mesh position={[halfW - INSET_X / 2, 0, 0]}>
        <boxGeometry args={[INSET_X, PANEL_H - INSET_Y * 2, railD]} />
        <RoseGoldMat />
      </mesh>

      {/* Inner bevel — warm bronze recess, not black */}
      <mesh position={[0, 0, -0.003]}>
        <boxGeometry args={[PANEL_W + 0.014, PANEL_H + 0.014, PANEL_D + 0.004]} />
        <RoseGoldMat color={CHAMPAGNE_DEEP} roughness={0.38} envIntensity={0.55} metalness={0.78} />
      </mesh>

      {/* Outer polished edge highlight */}
      <mesh position={[0, 0, faceZ - 0.002]}>
        <boxGeometry args={[PANEL_W + 0.006, PANEL_H + 0.006, 0.006]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.18} envIntensity={0.95} />
      </mesh>
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
  const faceZ = PANEL_D / 2 + 0.005;

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
          <PanelFrame faceZ={faceZ} />

          <group position={[0, 0, faceZ]}>
            <GlassPane width={FACE_W} height={FACE_H} />
          </group>

          <DoorGrid z={faceZ + 0.008} />
          <TBarHandle side={side} />
        </group>
      </group>
    </group>
  );
}

function DoorFrame() {
  const totalW = PANEL_W * 2 + GAP + 0.12;

  return (
    <group renderOrder={0}>
      {/* Transom crown */}
      <mesh position={[0, PANEL_H / 2 + 0.13, 0.008]}>
        <boxGeometry args={[totalW + 0.1, 0.095, 0.038]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.22} />
      </mesh>
      <mesh position={[0, PANEL_H / 2 + 0.13, 0.024]}>
        <boxGeometry args={[totalW + 0.06, 0.07, 0.012]} />
        <RoseGoldMat color={CHAMPAGNE} roughness={0.26} />
      </mesh>

      {/* Warm recessed lintel */}
      <mesh position={[0, PANEL_H / 2 + 0.062, 0.002]}>
        <boxGeometry args={[totalW, 0.026, 0.04]} />
        <RoseGoldMat color={CHAMPAGNE_DEEP} roughness={0.4} envIntensity={0.5} metalness={0.75} />
      </mesh>

      {/* Side jambs — rose-gold pillars */}
      <mesh position={[-(PANEL_W + GAP / 2 + 0.03), 0, 0.006]}>
        <boxGeometry args={[0.032, PANEL_H + 0.1, 0.052]} />
        <RoseGoldMat color={CHAMPAGNE_SOFT} roughness={0.3} />
      </mesh>
      <mesh position={[PANEL_W + GAP / 2 + 0.03, 0, 0.006]}>
        <boxGeometry args={[0.032, PANEL_H + 0.1, 0.052]} />
        <RoseGoldMat color={CHAMPAGNE_SOFT} roughness={0.3} />
      </mesh>

      {/* Jamb inner accents */}
      <mesh position={[-(PANEL_W + GAP / 2 + 0.014), 0, 0.028]}>
        <boxGeometry args={[0.008, PANEL_H + 0.04, 0.006]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.18} />
      </mesh>
      <mesh position={[PANEL_W + GAP / 2 + 0.014, 0, 0.028]}>
        <boxGeometry args={[0.008, PANEL_H + 0.04, 0.006]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.18} />
      </mesh>

      {/* Floor threshold */}
      <mesh position={[0, -PANEL_H / 2 - 0.014, 0.048]}>
        <boxGeometry args={[totalW + 0.08, 0.014, 0.034]} />
        <RoseGoldMat color={CHAMPAGNE_SOFT} roughness={0.35} />
      </mesh>
      <mesh position={[0, -PANEL_H / 2 - 0.006, 0.062]}>
        <boxGeometry args={[totalW + 0.04, 0.006, 0.018]} />
        <RoseGoldMat color={CHAMPAGNE_LIGHT} roughness={0.2} />
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
      <DoorInteriorView />
      <DoorFrame />
      <DoorPanel side="left" targetAngleRef={leftTargetRef} animRef={animRef} />
      <DoorPanel side="right" targetAngleRef={rightTargetRef} animRef={animRef} />
    </group>
  );
}
