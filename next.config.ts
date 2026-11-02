import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // Server-side sqlite native binary support
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
