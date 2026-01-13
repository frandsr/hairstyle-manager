import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Empty turbopack config to silence Next.js 16 warning about webpack config
  turbopack: {},
};

export default pwaConfig(nextConfig);
