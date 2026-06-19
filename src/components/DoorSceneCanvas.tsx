"use client";

import { Suspense, type MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { configureRenderer } from "@/lib/configureRenderer";
import { getCanvasDprRange, isSafari } from "@/lib/device";
import type { DoorAnimState } from "@/lib/doorEngine";
import CinematicCamera from "./CinematicCamera";
import GlassDoors from "./GlassDoors";
import DoorSceneLighting from "./DoorSceneLighting";
import LoadingBridge from "./LoadingBridge";
import DoorSceneBoundary from "./DoorSceneBoundary";
import BoutiqueEnvironment from "./BoutiqueEnvironment";

function DoorSceneContent({
  progressRef,
  animRef,
  brightness,
}: {
  progressRef: MutableRefObject<number>;
  animRef: MutableRefObject<DoorAnimState>;
  brightness: number;
}) {
  return (
    <>
      <CinematicCamera progressRef={progressRef} />
      <GlassDoors progressRef={progressRef} animRef={animRef} />
      <Suspense fallback={null}>
        <BoutiqueEnvironment variant="lobby" environmentIntensity={0.85} />
        <DoorSceneLighting brightness={brightness} />
      </Suspense>
    </>
  );
}

interface DoorSceneCanvasProps {
  progressRef: MutableRefObject<number>;
  animRef: MutableRefObject<DoorAnimState>;
  brightness: number;
  opacity: number;
  blurred: boolean;
}

export default function DoorSceneCanvas({
  progressRef,
  animRef,
  brightness,
  opacity,
  blurred,
}: DoorSceneCanvasProps) {
  return (
    <div
      className={`door-scene fixed inset-0 z-[8] transition-[filter,opacity] duration-700 ease-out ${
        blurred ? "door-scene--blurred" : ""
      }`}
      style={{ opacity, pointerEvents: "none" }}
    >
      <DoorSceneBoundary>
        <Canvas
          dpr={getCanvasDprRange()}
          frameloop="always"
          gl={{
            antialias: !isSafari(),
            alpha: true,
            powerPreference: "high-performance",
          }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => configureRenderer(gl, { exposure: isSafari() ? 1.1 : 1.16 })}
        >
          <LoadingBridge />
          <DoorSceneContent progressRef={progressRef} animRef={animRef} brightness={brightness} />
        </Canvas>
      </DoorSceneBoundary>
    </div>
  );
}
