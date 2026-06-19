"use client";

import { Component, useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import BoutiqueBackground from "@/components/BoutiqueBackground";
import { preloadProductAssets, preloadTableAsset } from "@/lib/preloadAssets";

const JewelryHome = dynamic(() => import("@/components/jewelry/JewelryHome"), {
  ssr: false,
  loading: () => null,
});

class HomeErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[HomeExperience]", error.message);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="shop-shell shop-room-bg fixed inset-0">
          <BoutiqueBackground />
        </div>
      );
    }
    return this.props.children;
  }
}

/** Simple homepage — zooming background + centered table with products. */
export default function HomeExperience() {
  useEffect(() => {
    preloadTableAsset();
    preloadProductAssets();
  }, []);

  return (
    <HomeErrorBoundary>
      <div className="shop-shell shop-room-bg fixed inset-0">
        <BoutiqueBackground />
        <div className="relative z-[10] h-full w-full">
          <JewelryHome visible />
        </div>
      </div>
    </HomeErrorBoundary>
  );
}
