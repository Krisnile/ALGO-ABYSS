import type { NextConfig } from "next";

const isStaticExport = process.env.DEPLOY_TARGET === "static";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Cloudflare Pages receives a fully static `out` directory, while Vercel
  // and self-hosted servers use the compact standalone Node.js package.
  output: isStaticExport ? "export" : "standalone",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: isStaticExport,
};

export default nextConfig;
