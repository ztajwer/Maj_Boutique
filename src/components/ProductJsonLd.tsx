import type { Product } from "@/data/products";
import { getProductJsonLd } from "@/lib/seo";

interface ProductJsonLdProps {
  product: Product;
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = getProductJsonLd(product);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
