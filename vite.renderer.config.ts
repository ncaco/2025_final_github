import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  root: "src/renderer",
  plugins: [react()],
  resolve: {
    alias: {
      "@models": resolve(__dirname, "src/renderer/models"),
      "@services": resolve(__dirname, "src/renderer/services"),
      "@components": resolve(__dirname, "src/renderer/components")
    }
  },
  build: {
    outDir: "../../dist/renderer",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});


