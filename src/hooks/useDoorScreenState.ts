"use client";

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { doorEngine } from "@/lib/doorEngine";

export { scrollKickFromPixels, scrollKickFromWheel } from "@/lib/doorEngine";

function subscribe(listener: () => void) {
  return doorEngine.subscribe(listener);
}

function getSnapshot() {
  return doorEngine.progress;
}

function getPhaseSnapshot() {
  return doorEngine.phase;
}

export function useDoorScreenState(ready: boolean) {
  const doorProgress = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  const phase = useSyncExternalStore(subscribe, getPhaseSnapshot, () => "waiting" as const);

  const entered = phase === "complete";
  const engage = useCallback((kick = 0.06) => doorEngine.engage(kick), []);

  useLayoutEffect(() => {
    doorEngine.setReady(ready);
  }, [ready]);

  useEffect(() => {
    return () => {
      doorEngine.setReady(false);
    };
  }, []);

  const brightness = Math.min(1, Math.max(0, (doorProgress - 0.06) / 0.7));
  const canvasOpacity = Math.min(1, Math.max(0, 1 - (doorProgress - 0.42) / 0.52));

  return {
    progressRef: doorEngine.progressRef,
    animRef: { current: doorEngine.anim },
    doorProgress,
    entered,
    phase,
    brightness,
    canvasOpacity,
    engage,
  };
}
