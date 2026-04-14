import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid eval-based source maps so strict CSP policies do not trigger
      // "unsafe-eval" console errors while running next dev.
      config.devtool = 'source-map';
    }

    return config;
  },
};

export default nextConfig;
