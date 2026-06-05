import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '10.252.45.71',
    // https: false,
    cors: false,
    hmr: {
        host: '10.252.45.71',
    }
  }
});

