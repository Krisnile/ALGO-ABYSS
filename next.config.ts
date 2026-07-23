import type { NextConfig } from "next";

const isStaticExport = process.env.DEPLOY_TARGET === "static";

const nextConfig: NextConfig = {
  // Cloudflare Pages receives a fully static `out` directory, while Vercel
  // and self-hosted servers use the compact standalone Node.js package.
  output: isStaticExport ? "export" : "standalone",
};

export default nextConfig;
