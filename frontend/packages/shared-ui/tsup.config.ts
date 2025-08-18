import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    'react', 
    'react-dom', 
    'use-sync-external-store',
    'use-sync-external-store/shim',
    'use-sync-external-store/shim/with-selector'
  ],
  banner: {
    js: '"use client";',
  },
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  noExternal: [],
  platform: 'browser',
  target: 'es2020',
});