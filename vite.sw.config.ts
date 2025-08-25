/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  build: {
    target: 'esnext',
    copyPublicDir: false,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        // So that the resulting file isn't called index.js
        'firebase-messaging-sw': resolve(__dirname, 'firebase-messaging-sw.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
