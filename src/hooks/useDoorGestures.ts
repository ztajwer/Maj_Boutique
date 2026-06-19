"use client";

import { useEffect, useRef } from "react";
import { doorEngine, scrollKickFromPixels, scrollKickFromWheel } from "@/lib/doorEngine";

interface UseDoorGesturesOptions {
  active: boolean;
  onEngaged?: (kick: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function useDoorGestures({ active, onEngaged, scrollRef }: UseDoorGesturesOptions) {
  const onEngagedRef = useRef(onEngaged);
  onEngagedRef.current = onEngaged;

  const tryEngage = (kick: number) => {
    if (doorEngine.engage(kick)) {
      onEngagedRef.current?.(kick);
    }
  };

  useEffect(() => {
    if (!active) return;

    const onWheel = (e: WheelEvent) => {
      if (doorEngine.phase !== "waiting" && doorEngine.phase !== "opening") return;
      e.preventDefault();
      tryEngage(scrollKickFromWheel(e.deltaY));
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (doorEngine.phase !== "waiting" && doorEngine.phase !== "opening") return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = Math.abs(y - touchY);
      if (delta > 1) {
        e.preventDefault();
        tryEngage(scrollKickFromPixels(delta));
        touchY = y;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        tryEngage(0.07);
      }
    };

    const onScroll = () => {
      const top = scrollRef.current?.scrollTop ?? 0;
      if (top > 0) tryEngage(scrollKickFromPixels(top));
    };

    const opts = { capture: true, passive: false } as const;
    document.addEventListener("wheel", onWheel, opts);
    document.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    document.addEventListener("touchmove", onTouchMove, opts);
    document.addEventListener("keydown", onKeyDown);
    const el = scrollRef.current;
    el?.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("wheel", onWheel, opts);
      document.removeEventListener("touchstart", onTouchStart, { capture: true });
      document.removeEventListener("touchmove", onTouchMove, opts);
      document.removeEventListener("keydown", onKeyDown);
      el?.removeEventListener("scroll", onScroll);
    };
  }, [active, scrollRef]);
}
