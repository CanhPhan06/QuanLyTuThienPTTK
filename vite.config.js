import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Prevent vite from obscuring rust errors
  clearScreen: false,

  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 5173,
    strictPort: true,
  },

  // Env variables starting with the item of `envPrefix` will be exposed
  // in tauri's source code through `import.meta.env`.
  envPrefix: ["VITE_", "TAURI_"],
});
