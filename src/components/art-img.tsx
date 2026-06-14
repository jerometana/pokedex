import Image from "./img";

export function ArtImg({
  src,
  alt,
  sizes,
  quality = 70,
  loading,
  fetchPriority,
}: {
  src: string;
  alt: string;
  sizes: string;
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
      loading={loading}
      fetchPriority={fetchPriority}
      style={{ objectFit: "contain" }}
      quality={quality}
    />
  );
}
