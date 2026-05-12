import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/master/sprites/pokemon/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [50, 70, 85],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [48, 64, 96, 128, 192, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
};

export default nextConfig;
