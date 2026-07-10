import { defineConfig } from "vite";

import lezer from "unplugin-lezer/vite";

export default defineConfig({
  plugins: [lezer()],
});
