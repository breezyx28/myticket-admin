import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['src/test/setup.ts'],
    env: {
      VITE_API_BASE_URL: 'http://localhost:9999',
      VITE_ADMIN_READS_SOURCE: 'mock',
      VITE_ALLOW_DEMO_AUTH: 'true',
    },
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
