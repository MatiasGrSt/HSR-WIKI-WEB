import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node'; // <--- Asegúrate de que esto esté

export default defineConfig({
  output: 'server', // <--- ESTO ES CRÍTICO
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [react()],
});