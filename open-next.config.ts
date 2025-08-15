import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  // When Webflow mounts your app at a subpath, COSMIC_MOUNT_PATH is provided.
  // OpenNext will respect Next's basePath at runtime.
  workers: {
    compatibilityDate: "2024-12-01",
  },
});


