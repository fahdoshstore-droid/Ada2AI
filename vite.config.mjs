import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "client/src") },
      { find: "@shared", replacement: path.resolve(__dirname, "shared") },
      // Redirect bare 'shiki' import to slim version (only 15 languages, not 235)
      // The /^shiki$/ regex ensures only EXACT `from 'shiki'` matches,
      // NOT `shiki/engine/javascript` or `shiki/langs/bash.mjs`
      { find: /^shiki$/, replacement: path.resolve(__dirname, "client/src/lib/shiki-slim.ts") },
    ],
  },
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client/public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split heavy vendor libraries into separate lazy-loaded chunks
          if (id.includes("node_modules/shiki/")) return "shiki";
          if (id.includes("node_modules/recharts/")) return "recharts";
          if (id.includes("node_modules/mermaid/") || id.includes("node_modules/@mermaid/")) return "mermaid";
          if (id.includes("node_modules/cytoscape")) return "cytoscape";
          if (id.includes("node_modules/framer-motion/")) return "framer-motion";
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
  },
});