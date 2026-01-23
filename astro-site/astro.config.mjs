// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://jjnordhealth.github.io',
  base: '/nordhealth.ai_launchable',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
