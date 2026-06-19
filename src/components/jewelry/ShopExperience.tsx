"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import BoutiqueBackground from "@/components/BoutiqueBackground";

const JewelryHome = dynamic(() => import("./JewelryHome"), {
  ssr: false,
  loading: () => null,
});

class ShopErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-maj-cream">
          <button
            type="button"
            className="h-10 w-10 rounded-full border border-maj-gold/35"
            aria-label="Reload"
            onClick={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

interface ShopExperienceProps {
  visible?: boolean;
  showBackground?: boolean;
}

export default function ShopExperience({ visible = true, showBackground = true }: ShopExperienceProps) {
  return (
    <ShopErrorBoundary>
      <div
        className={`shop-shell fixed inset-0 z-[40] ${showBackground ? "shop-room-bg" : ""}`}
        style={{
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
          transition: "opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {showBackground && <BoutiqueBackground />}
        <div className="relative z-[10] h-full w-full">
          <JewelryHome visible={visible} />
        </div>
      </div>
    </ShopErrorBoundary>
  );
}
