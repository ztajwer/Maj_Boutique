"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { products } from "@/data/products";
import {
  getProductSlotLayouts,
  PRODUCT_SIZE_PX,
  type ProductSlotLayout,
} from "@/lib/shopLayout";

const ProductThumbCanvas = dynamic(() => import("./ProductThumbCanvas"), {
  ssr: false,
  loading: () => <div className="product-thumb-canvas product-thumb-canvas--loading" />,
});

export type CarouselSpeed = "pause" | "fast" | "medium" | "slow";

const SPEED_MS: Record<Exclude<CarouselSpeed, "pause">, number> = {
  fast: 2800,
  medium: 5200,
  slow: 9000,
};

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

export default function ProductCarousel({
  speed,
  onSelect,
}: {
  speed: CarouselSpeed;
  onSelect?: (slug: string) => void;
}) {
  const { width, height } = useViewportSize();
  const [activeIndex, setActiveIndex] = useState(2);

  const slots = useMemo<ProductSlotLayout[]>(() => {
    if (width <= 0 || height <= 0) return [];
    return getProductSlotLayouts(width, height);
  }, [width, height]);

  useEffect(() => {
    if (speed === "pause" || products.length < 2) return;

    const duration = SPEED_MS[speed];
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, duration);

    return () => window.clearInterval(timer);
  }, [speed]);

  const handleSelect = useCallback(
    (slug: string) => {
      onSelect?.(slug);
      window.location.assign(`/shop/${slug}`);
    },
    [onSelect],
  );

  if (slots.length === 0) return null;

  return (
    <div className="product-carousel" aria-label="Jewelry collection">
      {products.map((product, index) => {
        const slot = slots[product.tableSlot];
        if (!slot) return null;
        const isActive = index === activeIndex;

        return (
          <button
            key={product.id}
            type="button"
            className={`product-carousel__item ${isActive ? "product-carousel__item--active" : ""}`}
            style={{
              left: `${slot.x}px`,
              top: `${slot.y}px`,
              width: `${PRODUCT_SIZE_PX}px`,
              height: `${PRODUCT_SIZE_PX}px`,
            }}
            onClick={() => handleSelect(product.slug)}
            aria-label={product.name}
          >
            <span className="product-carousel__ring">
              {isActive ? (
                <ProductThumbCanvas url={product.glbPath} />
              ) : (
                <span className="product-carousel__placeholder" aria-hidden />
              )}
            </span>
            <span className="product-carousel__label">{product.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CarouselSpeedControl({
  speed,
  onSpeedChange,
}: {
  speed: CarouselSpeed;
  onSpeedChange: (speed: CarouselSpeed) => void;
}) {
  const options: CarouselSpeed[] = ["pause", "fast", "medium", "slow"];

  return (
    <div className="carousel-speed" role="group" aria-label="Carousel speed">
      <p className="carousel-speed__title">Carousel Speed</p>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={options.indexOf(speed)}
        className="carousel-speed__slider"
        onChange={(e) => onSpeedChange(options[Number(e.target.value)] ?? "medium")}
        aria-label="Carousel speed slider"
      />
      <div className="carousel-speed__pills">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`carousel-speed__pill ${speed === option ? "carousel-speed__pill--active" : ""}`}
            onClick={() => onSpeedChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
