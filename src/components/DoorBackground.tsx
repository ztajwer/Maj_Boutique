"use client";

interface DoorBackgroundProps {
  fadeProgress?: number;
}

export default function DoorBackground({ fadeProgress = 0 }: DoorBackgroundProps) {
  const opacity = Math.max(0, 1 - fadeProgress * 1.08);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[2] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/door_bg.png)",
          opacity,
          transition: "opacity 0.5s ease-out",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[3]"
        style={{
          opacity: opacity * 0.38,
          background:
            "radial-gradient(ellipse 78% 72% at 50% 48%, transparent 38%, rgba(26,20,16,0.28) 100%)",
        }}
        aria-hidden
      />
    </>
  );
}
