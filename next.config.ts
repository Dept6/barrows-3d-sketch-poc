import type { NextConfig } from "next";

// Allow mounting the app at a subpath in Webflow Cloud without changing
// Next.js or React versions. When NEXT_PUBLIC_BASE_PATH is set (e.g. "/app"),
// Next.js will serve the app under that base path. Locally, you can leave it unset.
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  basePath: configuredBasePath && configuredBasePath !== "/" ? configuredBasePath : undefined,
};

export default nextConfig;

