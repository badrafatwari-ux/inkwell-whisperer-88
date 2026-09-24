// @lovable.dev/vite-tanstack-config already includes the standard plugins — do NOT add them manually.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // Static single-page output so the app can be bundled into Android via Capacitor.
    spa: { enabled: true, prerender: { outputPath: "/index.html" } },
  },
});
