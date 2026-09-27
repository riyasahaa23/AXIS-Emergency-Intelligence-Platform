import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $components: path.resolve(__dirname, './src/lib/components'),
      $types: path.resolve(__dirname, './src/lib/types'),
      $stores: path.resolve(__dirname, './src/lib/stores'),
      $mock: path.resolve(__dirname, './src/lib/mock'),
      $three: path.resolve(__dirname, './src/lib/three'),
      $api: path.resolve(__dirname, './src/lib/api'),
      $websocket: path.resolve(__dirname, './src/lib/websocket')
    }
  }
});
