import type { Product } from "@/data/products";
import { products } from "@/data/products";
import { siteConfig } from "@/lib/site";

const baseUrl = siteConfig.url;

export function getOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: siteConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: siteConfig.description,
    sameAs: siteConfig.sameAs,
  };
}

export function getWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: siteConfig.name,
    url: baseUrl,
    description: siteConfig.description,
    publisher: { "@id": `${baseUrl}/#organization` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getStoreJsonLd() {
  return {
    "@type": "Store",
    "@id": `${baseUrl}/#store`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    image: `${baseUrl}/logo.png`,
    priceRange: "$$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card",
    parentOrganization: { "@id": `${baseUrl}/#organization` },
  };
}

export function getProductListJsonLd() {
  return {
    "@type": "ItemList",
    "@id": `${baseUrl}/#collection`,
    name: `${siteConfig.name} Collection`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/shop/${product.slug}`,
      name: product.name,
    })),
  };
}

export function getHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationJsonLd(),
      getWebSiteJsonLd(),
      getStoreJsonLd(),
      getProductListJsonLd(),
    ],
  };
}

export function getProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationJsonLd(),
      getWebSiteJsonLd(),
      {
        "@type": "Product",
        "@id": `${baseUrl}/shop/${product.slug}#product`,
        name: product.name,
        description: product.description,
        image: `${baseUrl}/logo.png`,
        sku: product.id,
        category: product.category,
        material: product.material,
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        offers: {
          "@type": "Offer",
          url: `${baseUrl}/shop/${product.slug}`,
          priceCurrency: product.currency,
          price: product.price,
          availability: "https://schema.org/InStock",
          seller: { "@id": `${baseUrl}/#organization` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: `${baseUrl}/shop`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: `${baseUrl}/shop/${product.slug}`,
          },
        ],
      },
    ],
  };
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}) {
  const url = `${baseUrl}${path}`;

  return {
    title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: "/door_bg.png",
          width: 1536,
          height: 1024,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: ["/door_bg.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
