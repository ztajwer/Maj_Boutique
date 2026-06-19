import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { products } from "@/data/products";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: `Shop Collection | ${siteConfig.name}`,
  description:
    "Browse the MAJ Boutique luxury jewelry collection — crowns, pendants, necklaces, cuffs, and designer accessories crafted with gold finishes and atelier detail.",
  path: "/shop",
  keywords: [
    ...siteConfig.keywords,
    "shop jewelry",
    "buy luxury jewelry",
    "MAJ collection",
  ],
});

export default function ShopIndexPage() {
  return (
    <main className="min-h-screen bg-maj-cream px-6 py-12 text-maj-brown sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans text-[10px] uppercase tracking-[0.45em] text-maj-gold">
          MAJ Boutique
        </p>
        <h1 className="mt-3 font-display text-4xl font-light tracking-[0.12em]">
          Luxury Jewelry Collection
        </h1>
        <p className="mt-4 font-sans text-sm font-light leading-relaxed text-maj-brown/80">
          Explore our curated pieces — each available in an immersive 3D view with
          full product details, materials, and pricing.
        </p>

        <nav aria-label="Product collection" className="mt-10">
          <ul className="space-y-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/"
          className="mt-10 inline-block font-sans text-[10px] uppercase tracking-[0.38em] text-maj-gold hover:text-maj-brown"
        >
          ← Enter the boutique experience
        </Link>
      </div>
    </main>
  );
}
