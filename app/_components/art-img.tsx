import Image from "next/image";

export function ArtImg({
  src,
  alt,
  sizes,
  preload = false,
  quality = 70,
  loading,
  fetchPriority,
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  quality?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      loading={loading}
      fetchPriority={fetchPriority}
      style={{ objectFit: "contain" }}
      quality={quality}
    />
  );
}
