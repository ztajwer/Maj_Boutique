import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import AssetBoot from "@/components/AssetBoot";
import SeoJsonLd from "@/components/SeoJsonLd";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const CRITICAL_IMAGE_URLS = ["/logo.png", "/door_bg.png", "/star.png"];
const DEFERRED_IMAGE_URLS = ["/background.png", "/bg.png"];

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  themeColor: "#FAF6F1",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/door_bg.png",
        width: 1536,
        height: 1024,
        alt: `${siteConfig.name} — luxury boutique entrance`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/door_bg.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preload" href="/logo.png" as="image" type="image/png" fetchPriority="high" />
        <link rel="preload" href="/door_bg.png" as="image" type="image/png" fetchPriority="high" />
        <link rel="preload" href="/star.png" as="image" type="image/png" />
        <link rel="preload" href="/door-chime.mp3" as="fetch" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var c=${JSON.stringify(CRITICAL_IMAGE_URLS)};var d=${JSON.stringify(DEFERRED_IMAGE_URLS)};for(var i=0;i<c.length;i++){fetch(c[i],{cache:"force-cache",priority:"high"}).catch(function(){});}setTimeout(function(){for(var j=0;j<d.length;j++){fetch(d[j],{cache:"force-cache"}).catch(function(){});}},300);})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AssetBoot />
        <SeoJsonLd />
        {children}
      </body>
    </html>
  );
}
