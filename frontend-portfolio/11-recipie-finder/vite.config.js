import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5176,
    strictPort: true,
  },
  preview: {
    host: 'localhost',
    port: 4176,
    strictPort: true,
  },
  clearScreen: false,
});
