import type { NextConfig } from "next";

// Allow mounting the app at a subpath in Webflow Cloud without changing
// Next.js or React versions. When NEXT_PUBLIC_BASE_PATH is set (e.g. "/app"),
// Next.js will serve the app under that base path. Locally, you can leave it unset.
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH;

// Export a function to ensure a fresh, mutable config object (some builders
// mutate config, which can fail if the exported object is frozen)
const nextConfig = (_phase: string, { defaultConfig }: { defaultConfig: NextConfig }): NextConfig => {
  return {
    ...defaultConfig,
    basePath: configuredBasePath && configuredBasePath !== "/" ? configuredBasePath : undefined,
    // Cloudflare/Webflow Cloud typically requires unoptimized images
    images: { unoptimized: true },
  };
};

export default nextConfig;

