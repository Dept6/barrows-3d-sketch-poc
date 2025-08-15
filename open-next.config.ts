import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  // When Webflow mounts your app at a subpath, COSMIC_MOUNT_PATH is provided.
  // OpenNext will respect Next's basePath at runtime.
  // Keep minimal; Cloudflare compatibility date is handled by the builder
});


