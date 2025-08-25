/// <reference types="vitest" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.sw.json'],
    }),
  ],
  build: {
    target: 'esnext',
    copyPublicDir: false,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'firebase-messaging-sw': resolve(__dirname, 'firebase-messaging-sw.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
