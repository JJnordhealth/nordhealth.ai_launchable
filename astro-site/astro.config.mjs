// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Use env var for base path - allows GitHub Pages to set /nordhealth.ai_launchable
const base = process.env.ASTRO_BASE || '';

// https://astro.build/config
export default defineConfig({
  site: 'https://nordhealth.ai',
  base: base,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fi: 'fi',
          no: 'nb',
          dk: 'da'
        }
      }
    })
  ]
});
