import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    outDir: "./docs", // for using as github pages
    emptyOutDir: true,
  },
  base: "./", // build with relative paths
});
