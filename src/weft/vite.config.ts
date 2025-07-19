import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        strudel: resolve(import.meta.dirname, "src/strudel.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: /@strudel\/.+/,
    },
    sourcemap: true,
  },
});
