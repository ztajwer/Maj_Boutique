"use client";

import { Component, type ReactNode } from "react";
import BoutiqueExperience from "./BoutiqueExperience";

class BoutiquePageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[BoutiquePage]", error.message);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="boutique-home flex flex-col items-center justify-center gap-4 bg-maj-cream">
          <p className="font-serif text-lg tracking-wide text-maj-brown">MAJ Boutique</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-sans text-[10px] uppercase tracking-[0.3em] text-maj-gold"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function BoutiquePage() {
  return (
    <BoutiquePageBoundary>
      <BoutiqueExperience />
    </BoutiquePageBoundary>
  );
}
