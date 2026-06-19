import { easeLuxuryOpen } from "@/lib/easing";

export const DOOR_OPEN_DURATION_S = 1.25;

export type DoorPhase = "waiting" | "opening" | "complete";

export interface DoorAnimState {
  phase: DoorPhase;
  startTimeMs: number;
  startProgress: number;
}

export function createDoorAnimState(): DoorAnimState {
  return { phase: "waiting", startTimeMs: 0, startProgress: 0 };
}

function openDurationMs(startProgress: number) {
  const remaining = 1 - startProgress;
  return DOOR_OPEN_DURATION_S * (0.8 + 0.2 * remaining) * 1000;
}

export function tickDoorAnimation(
  anim: DoorAnimState,
  nowMs: number,
): { phase: DoorPhase; progress: number } {
  if (anim.phase !== "opening") {
    return { phase: anim.phase, progress: anim.phase === "complete" ? 1 : 0 };
  }

  if (anim.startTimeMs === 0) anim.startTimeMs = nowMs;

  const durationMs = openDurationMs(anim.startProgress);
  const linearT = Math.min(1, Math.max(0, (nowMs - anim.startTimeMs) / durationMs));
  const eased = easeLuxuryOpen(linearT);
  const progress = anim.startProgress + (1 - anim.startProgress) * eased;

  if (linearT >= 1) {
    anim.phase = "complete";
    return { phase: "complete", progress: 1 };
  }

  return { phase: "opening", progress };
}

export function scrollKickFromWheel(deltaY: number) {
  return Math.min(0.14, 0.06 + Math.abs(deltaY) * 0.0004);
}

export function scrollKickFromPixels(pixels: number) {
  return Math.min(0.16, 0.06 + pixels * 0.00035);
}

type DoorListener = () => void;

/** Singleton door engine — animation never depends on React lifecycle. */
class DoorEngine {
  readonly progressRef = { current: 0 };
  readonly anim: DoorAnimState = createDoorAnimState();
  private listeners = new Set<DoorListener>();
  private raf = 0;
  private ready = false;

  subscribe(listener: DoorListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  setReady(value: boolean) {
    if (!value) {
      if (!this.ready) return;
      this.ready = false;
      this.reset();
      this.stopLoop();
      return;
    }

    if (this.ready) return;

    this.ready = true;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.anim.phase = "complete";
      this.progressRef.current = 1;
      this.notify();
      return;
    }
    this.reset();
    this.startLoop();
  }

  reset() {
    Object.assign(this.anim, createDoorAnimState());
    this.progressRef.current = 0;
    this.notify();
  }

  /** Reset to closed waiting state without disarming the engine. */
  resetWaiting() {
    if (this.anim.phase === "complete") return;
    this.reset();
    if (this.ready) this.ensureLoop();
  }

  /** Return from the shop view to the closed door state. */
  stepBack() {
    this.reset();
    if (this.ready) this.ensureLoop();
  }

  engage(kick = 0.06): boolean {
    if (!this.ready || this.anim.phase !== "waiting") {
      return this.anim.phase === "opening";
    }

    void kick;

    this.anim.phase = "opening";
    this.anim.startTimeMs = performance.now();
    this.anim.startProgress = 0;
    this.progressRef.current = 0;
    this.ensureLoop();
    this.notify();
    return true;
  }

  get phase() {
    return this.anim.phase;
  }

  get progress() {
    return this.progressRef.current;
  }

  private ensureLoop() {
    if (this.raf || !this.ready) return;

    const tick = () => {
      this.raf = 0;

      if (!this.ready) return;

      if (this.anim.phase === "opening") {
        const { phase, progress } = tickDoorAnimation(this.anim, performance.now());
        const changed = progress !== this.progressRef.current || phase !== "opening";
        this.progressRef.current = progress;
        if (changed) this.notify();

        if (phase === "complete") {
          this.notify();
          return;
        }
      }

      if (this.anim.phase !== "complete") {
        this.raf = requestAnimationFrame(tick);
      }
    };

    this.raf = requestAnimationFrame(tick);
  }

  private startLoop() {
    this.ensureLoop();
  }

  stopLoop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }
}

export const doorEngine = new DoorEngine();
