import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $components: 'src/lib/components',
      $types: 'src/lib/types',
      $stores: 'src/lib/stores',
      $mock: 'src/lib/mock',
      $three: 'src/lib/three',
      $api: 'src/lib/api',
      $websocket: 'src/lib/websocket'
    }
  }
};

export default config;
