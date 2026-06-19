import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductJsonLd from "@/components/ProductJsonLd";
import ProductDetailShell from "@/components/jewelry/ProductDetailShell";
import { getAllProductSlugs, getProductBySlug, formatProductPrice } from "@/data/products";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return buildPageMetadata({
    title: `${product.name} — ${product.tagline}`,
    description: `${product.description} ${product.material}. Price: ${formatProductPrice(product.price)}.`,
    path: `/shop/${product.slug}`,
    keywords: [
      ...siteConfig.keywords,
      product.name,
      product.category,
      product.tagline,
      "luxury jewelry",
    ],
    type: "article",
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <main className="min-h-screen bg-maj-cream">
        <h1 className="sr-only">
          {product.name} — {product.tagline} | {siteConfig.name}
        </h1>
        <p className="sr-only">{product.description}</p>
        <ProductDetailShell product={product} />
      </main>
    </>
  );
}
