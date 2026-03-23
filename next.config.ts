import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  turbopack: {
    resolveAlias: {
      fs: './src/lib/empty.js',
    },
  },
};

export default nextConfig;
