import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "https://api-uniraid.paragoniu.app", // or whatever port your backend runs on
    },
    allowedHosts: [
      "klaude.proficientia.me",
      "npm.proficientia.me",
      "localhost",
    ],
  },
  optimizeDeps: {
    include: ["qr-scanner", "qr-scanner/qr-scanner-worker.min.js"],
  },
});
