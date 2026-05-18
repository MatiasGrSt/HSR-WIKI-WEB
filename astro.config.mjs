import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  site: 'https://www.astralwiki.com',
  integrations: [react(), sitemap()],
});