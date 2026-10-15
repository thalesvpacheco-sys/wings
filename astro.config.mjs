// @ts-check
import { defineConfig } from "astro/config";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://wingsbr.app",
  output: "static",
  build: {
    // CSS pequeno vai inline no HTML; o restante vira arquivo com hash.
    inlineStylesheets: "auto",
  },
});
