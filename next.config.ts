import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(isDev && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "https://api.hezo.asia/api/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;
