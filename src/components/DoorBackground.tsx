"use client";

interface DoorBackgroundProps {
  fadeProgress?: number;
}

export default function DoorBackground({ fadeProgress = 0 }: DoorBackgroundProps) {
  const doorFrameOpacity = Math.max(0, 0.92 - fadeProgress * 1.35);
  const vignetteOpacity = Math.max(0, 0.22 - fadeProgress * 0.28);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[2] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/door_bg.png)",
          opacity: doorFrameOpacity,
          transition: "opacity 0.4s ease-out",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[3]"
        style={{
          opacity: vignetteOpacity,
          background:
            "radial-gradient(ellipse 80% 74% at 50% 48%, transparent 44%, rgba(110,82,62,0.16) 100%)",
        }}
        aria-hidden
      />
    </>
  );
}
