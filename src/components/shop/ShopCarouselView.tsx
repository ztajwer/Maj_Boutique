"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doorEngine } from "@/lib/doorEngine";
import ProductCarousel, { CarouselSpeedControl, type CarouselSpeed } from "./ProductCarousel";

interface ShopCarouselViewProps {
  visible?: boolean;
}

export default function ShopCarouselView({ visible = true }: ShopCarouselViewProps) {
  const [speed, setSpeed] = useState<CarouselSpeed>("medium");
  const touchStartY = useRef(0);

  const handleStepBack = useCallback(() => {
    doorEngine.stepBack();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY < -28) handleStepBack();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? 0;
      if (endY - touchStartY.current > 72) handleStepBack();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleStepBack, visible]);

  return (
    <div
      className="shop-carousel-shell"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="shop-carousel-shell__brand">
        <img src="/logo.png" alt="MAJ Boutique" className="shop-carousel-shell__logo" draggable={false} />
      </div>

      <button type="button" className="shop-carousel-shell__back" onClick={handleStepBack}>
        Swipe down to step back
      </button>

      <ProductCarousel speed={speed} />

      <CarouselSpeedControl speed={speed} onSpeedChange={setSpeed} />
    </div>
  );
}
