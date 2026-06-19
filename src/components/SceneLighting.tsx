"use client";

import { Suspense } from "react";
import { ContactShadows } from "@react-three/drei";
import BoutiqueEnvironment from "./BoutiqueEnvironment";

function EnvironmentMap({ intensity }: { intensity: number }) {
  return (
    <BoutiqueEnvironment
      variant="apartment"
      environmentIntensity={0.4 + intensity * 0.4}
    />
  );
}

interface SceneLightingProps {
  brightness?: number;
  /** Fast boot — lights only, no HDR fetch. */
  lite?: boolean;
}

export default function SceneLighting({ brightness = 0, lite = false }: SceneLightingProps) {
  const b = brightness;

  return (
    <>
      <ambientLight intensity={0.48 + b * 0.45} color="#FFF9F5" />
      <hemisphereLight args={["#FFFFFF", "#E8DDD4", 0.34 + b * 0.28]} />

      <directionalLight
        position={[0, 7, 5]}
        intensity={0.9 + b * 0.65}
        color="#FFF8F2"
        castShadow={!lite}
        shadow-mapSize={lite ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
      />

      <directionalLight position={[-3, 2, 4]} intensity={0.32 + b * 0.24} color="#FFD878" />
      <directionalLight position={[3, 2, 4]} intensity={0.32 + b * 0.24} color="#FFD878" />
      <pointLight position={[0, 1.2, 1.8]} intensity={0.55 + b * 0.35} color="#E8C872" distance={8} />

      {!lite && (
        <>
          <pointLight position={[0, 3.5, 2.5]} intensity={0.35 + b * 0.35} color="#FFF5EB" distance={12} />
          <Suspense fallback={null}>
            <EnvironmentMap intensity={b} />
          </Suspense>
          <ContactShadows
            position={[0, -1.42, 0.12]}
            opacity={0.3 + b * 0.14}
            scale={7}
            blur={2.4}
            far={2.2}
            color="#4A3728"
          />
        </>
      )}
    </>
  );
}
