import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Solfai frontend (Lovable UI, ported from TanStack Start to a plain Vite SPA).
// Builds to ./dist, which the Express backend serves as the primary UI.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // In dev, proxy API calls to the Express backend so the SPA and API share an origin.
    proxy: {
      "/api": "http://localhost:3000",
      "/sw.js": "http://localhost:3000",
    },
  },
});
