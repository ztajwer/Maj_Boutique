"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { preloadProductAssets, preloadTableAsset } from "@/lib/preloadAssets";

const ShopExperience = dynamic(() => import("@/components/jewelry/ShopExperience"), {
  ssr: false,
  loading: () => (
    <div className="boutique-home flex items-center justify-center bg-maj-cream">
      <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-maj-gold/80">MAJ Boutique</p>
    </div>
  ),
});

/** Simple homepage — zooming background + centered table with products. */
export default function HomeExperience() {
  useEffect(() => {
    preloadTableAsset();
    preloadProductAssets();
  }, []);

  return <ShopExperience visible showBackground />;
}
