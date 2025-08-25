/// <reference types="vitest" />

import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [solidPlugin(), tsconfigPaths(), basicSsl()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  test: {
    setupFiles: ['./vitest-setup.ts'],
  },
});
