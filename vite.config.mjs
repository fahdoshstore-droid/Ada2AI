import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client/public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split shiki core into its own chunk so it can be lazy-loaded
          // by Streamdown's internal dynamic imports instead of being
          // bundled into the main chunk via @streamdown/code.
          if (id.includes("node_modules/shiki/")) {
            return "shiki";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: true,
  },
});