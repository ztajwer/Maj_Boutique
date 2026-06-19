"use client";

import dynamic from "next/dynamic";
import type { Product } from "@/data/products";

const ProductDetailExperience = dynamic(() => import("./ProductDetailExperience"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-maj-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="h-px w-28 animate-pulse bg-maj-gold/50" />
        <p className="font-sans text-[9px] uppercase tracking-[0.45em] text-maj-gold/60">
          Loading piece
        </p>
      </div>
    </div>
  ),
});

interface ProductDetailShellProps {
  product: Product;
}

export default function ProductDetailShell({ product }: ProductDetailShellProps) {
  return <ProductDetailExperience product={product} />;
}
