import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/royal_beacon/',
  server: {
    open: true,
  },
  build: {
    outDir: 'build',
  },
});
