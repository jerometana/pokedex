import type { CSSProperties } from "react";

// Drop-in replacement for next/image in a pure-static Astro build.
// Renders a plain <img> of the remote sprite (served + cached by the
// GitHub CDN). Next-only props (quality, sizes, unoptimized) are accepted
// and ignored so call sites don't need to change.
export default function Image({
  src,
  alt,
  fill,
  width,
  height,
  loading,
  fetchPriority,
  className,
  style,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  style?: CSSProperties;
}) {
  const fillStyle: CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
    : {};
  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={loading ?? "lazy"}
      fetchPriority={fetchPriority}
      decoding="async"
      className={className}
      style={{ ...fillStyle, ...style }}
    />
  );
}
