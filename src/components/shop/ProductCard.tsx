import Link from "next/link";
import type { Product } from "@/data/products";
import { formatProductPrice } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

const GLITTER_SPECS = [
  { left: "18%", delay: "0s", size: 7, drift: -8 },
  { left: "42%", delay: "0.15s", size: 9, drift: 6 },
  { left: "68%", delay: "0.3s", size: 8, drift: -4 },
  { left: "82%", delay: "0.45s", size: 6, drift: 10 },
  { left: "30%", delay: "0.55s", size: 10, drift: -12 },
  { left: "55%", delay: "0.7s", size: 7, drift: 5 },
] as const;

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/shop/${product.slug}`} className="product-card">
      <span className="product-card__glitter" aria-hidden="true">
        {GLITTER_SPECS.map((dot, i) => (
          <span
            key={i}
            className="product-card__glitter-dot"
            style={{
              left: dot.left,
              animationDelay: dot.delay,
              width: dot.size,
              height: dot.size,
              ["--glitter-drift" as string]: `${dot.drift}px`,
            }}
          />
        ))}
      </span>
      <div className="product-card__content">
        <p className="font-sans text-[9px] uppercase tracking-[0.35em] text-maj-gold/80">
          {product.category}
        </p>
        <h2 className="mt-1 font-display text-xl font-light tracking-[0.1em] text-maj-brown">
          {product.name}
        </h2>
        <p className="mt-1 font-sans text-xs text-maj-brown/70">{product.tagline}</p>
        <p className="mt-2 font-display text-sm tracking-[0.08em] text-maj-brown">
          {formatProductPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
