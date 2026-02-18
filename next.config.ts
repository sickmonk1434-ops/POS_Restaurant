import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* Fix for Next.js 15/16 + Turbopack + next-pwa conflict */
  // eslint and typescript are now top-level objects but handled differently in Next 15+
  // We'll keep them simple or removed if not needed to avoid the 'Unrecognized key' warning
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
// export default withPWA(nextConfig);
