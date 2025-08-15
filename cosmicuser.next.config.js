const mountPath = process.env.COSMIC_MOUNT_PATH;
const computedBasePath = mountPath && mountPath !== "/" ? mountPath : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  ...(computedBasePath ? { basePath: computedBasePath } : {}),
};

module.exports = nextConfig;
