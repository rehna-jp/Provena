import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // webpack: (config) => {
  //   config.externals.push('pino-pretty', 'lokijs', 'encoding');
  //   return config;
  // },
  // Enable if you need image optimization
  turbopack:{},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
