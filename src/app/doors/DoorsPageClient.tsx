"use client";

import dynamic from "next/dynamic";

const BoutiqueExperience = dynamic(() => import("@/components/BoutiqueExperience"), {
  ssr: false,
  loading: () => (
    <div className="boutique-home flex items-center justify-center bg-maj-cream">
      <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-maj-gold">MAJ Boutique</p>
    </div>
  ),
});

export default function DoorsPageClient() {
  return <BoutiqueExperience skipLoader />;
}
