import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src",
      '@chattar/ui': path.resolve(__dirname, '../../shared/ui'),
      '@chattar/types': path.resolve(__dirname, '../../shared/types'),
    },
  },
});
