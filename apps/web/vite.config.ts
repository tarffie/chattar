/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['chattar.homelab'],
    proxy: {
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
      '@chattar/ui': path.resolve(__dirname, '../../shared/ui'),
      '@chattar/types': path.resolve(__dirname, '../../shared/types'),
    },
  },
});
