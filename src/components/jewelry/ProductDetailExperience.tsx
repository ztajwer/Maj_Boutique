"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import { formatProductPrice, products } from "@/data/products";
import ProductViewer from "./ProductViewer";

interface ProductDetailExperienceProps {
  product: Product;
}

export default function ProductDetailExperience({ product }: ProductDetailExperienceProps) {
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <div className="product-detail-shell relative min-h-screen w-full overflow-hidden bg-maj-cream">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 28% 42%, rgba(201,162,125,0.14) 0%, transparent 58%), radial-gradient(ellipse 80% 60% at 78% 18%, rgba(255,251,247,0.75) 0%, transparent 52%), linear-gradient(180deg, #FAF6F1 0%, #F3EBE2 48%, #EBE0D4 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38] detail-bg-zoom"
        style={{
          backgroundImage: "url(/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "50% 54%",
          filter: "blur(2.0px) saturate(0.95)",
        }}
      />

      <header className="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-sans text-[10px] font-light uppercase tracking-[0.42em] text-maj-brown/75 transition-colors hover:text-maj-brown"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-maj-gold/25 bg-maj-white/50 transition group-hover:border-maj-gold/45">
            ←
          </span>
          Back to boutique
        </Link>

        <p className="hidden font-sans text-[9px] uppercase tracking-[0.5em] text-maj-gold/70 sm:block">
          MAJ Collection
        </p>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-[1400px] grid-cols-1 gap-0 px-4 pb-8 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center lg:gap-10 lg:pb-10">
        <section className="relative h-[52vh] min-h-[320px] lg:h-[min(78vh,760px)]">
          <div
            className="product-detail-stage absolute inset-0 overflow-hidden rounded-[1.75rem] border border-maj-white/70 shadow-[0_24px_80px_rgba(61,43,31,0.08)]"
            style={{ background: "transparent" }}
          >
            <ProductViewer glbPath={product.glbPath} />
          </div>

          <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-sans text-[8px] uppercase tracking-[0.42em] text-maj-gold/50 sm:text-[9px]">
            Drag to rotate · Scroll to zoom
          </p>
        </section>

        <aside
          className="product-detail-panel mt-5 flex flex-col justify-center rounded-[1.5rem] border border-maj-white/80 bg-maj-white/45 p-6 backdrop-blur-md sm:p-8 lg:mt-0"
          style={{ animation: "shopReveal 1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both" }}
        >
          <p className="font-sans text-[9px] font-light uppercase tracking-[0.55em] text-maj-gold/80 sm:text-[10px]">
            {product.category}
          </p>

          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-light leading-[0.95] tracking-[0.14em] text-maj-brown">
            {product.name}
          </h1>

          <p className="mt-2 font-display text-[clamp(0.9rem,1.6vw,1.05rem)] font-light italic tracking-[0.28em] text-maj-rose">
            {product.tagline}
          </p>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-maj-gold/60 to-transparent" />
            <div className="h-[5px] w-[5px] rotate-45 border border-maj-gold/70 bg-maj-white/60" />
          </div>

          <p className="font-sans text-[13px] font-light leading-[1.85] tracking-[0.04em] text-maj-brown/82 sm:text-[14px]">
            {product.description}
          </p>

          <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.32em] text-maj-brown-mid/70">
            {product.material}
          </p>

          <ul className="mt-5 space-y-2.5">
            {product.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2.5 font-sans text-[11px] font-light tracking-[0.08em] text-maj-brown/78"
              >
                <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-maj-gold/80" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-maj-gold/15 pt-6">
            <div>
              <p className="font-sans text-[9px] uppercase tracking-[0.42em] text-maj-gold/70">
                Price
              </p>
              <p className="mt-1 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-light tracking-[0.12em] text-maj-brown">
                {formatProductPrice(product.price, product.currency)}
              </p>
            </div>

            <button
              type="button"
              className="rounded-full border border-maj-gold/35 bg-maj-brown px-6 py-3 font-sans text-[10px] uppercase tracking-[0.38em] text-maj-white transition hover:bg-maj-brown-mid"
            >
              Inquire
            </button>
          </div>

          {related.length > 0 && (
            <div className="mt-8 border-t border-maj-gold/10 pt-6">
              <p className="mb-3 font-sans text-[9px] uppercase tracking-[0.45em] text-maj-gold/65">
                More from the collection
              </p>
              <div className="flex flex-wrap gap-2">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/shop/${item.slug}`}
                    className="rounded-full border border-maj-gold/20 bg-maj-white/55 px-3.5 py-2 font-sans text-[9px] uppercase tracking-[0.28em] text-maj-brown/75 transition hover:border-maj-gold/40 hover:text-maj-brown"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
