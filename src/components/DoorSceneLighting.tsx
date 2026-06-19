"use client";

/** Soft boutique lighting — satin champagne doors like door_bg.png */
export default function DoorSceneLighting({ brightness = 0 }: { brightness?: number }) {
  const b = brightness;

  return (
    <>
      <ambientLight intensity={0.72 + b * 0.35} color="#FFF9F5" />
      <hemisphereLight args={["#FFF6EE", "#E8DDD4", 0.38 + b * 0.22]} />
      <directionalLight position={[0, 6, 5]} intensity={0.82 + b * 0.45} color="#FFF8F2" />
      <directionalLight position={[-3.5, 2.5, 4]} intensity={0.28 + b * 0.18} color="#F0E0D4" />
      <directionalLight position={[3.5, 2.5, 4]} intensity={0.28 + b * 0.18} color="#F0E0D4" />
      <pointLight position={[0, 1.8, 2.5]} intensity={0.45 + b * 0.22} color="#F8EDE4" distance={10} decay={2} />
    </>
  );
}
