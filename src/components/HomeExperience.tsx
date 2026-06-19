"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
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

async function assetsAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/table-3d.glb", { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

/** Simple homepage — zooming background + centered table with products. */
export default function HomeExperience() {
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let active = true;

    void assetsAvailable().then((ok) => {
      if (!active) return;
      if (!ok) {
        console.warn("[HomeExperience] table-3d.glb not found — showing background only.");
        return;
      }
      preloadTableAsset();
      preloadProductAssets();
      setShowTable(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <HomeErrorBoundary>
      <div className="shop-shell shop-room-bg fixed inset-0">
        <BoutiqueBackground />
        <div className="relative z-[10] h-full w-full">
          {showTable ? <JewelryHome visible /> : null}
        </div>
      </div>
    </HomeErrorBoundary>
  );
}
