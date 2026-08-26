import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/cli',
    '@rspack/core',
    '@rspack/binding',
    'esbuild',
  ],
  experimental: {
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
