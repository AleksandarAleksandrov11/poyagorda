// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// URL pública canónica. Por defecto, el dominio de producción. Se puede cambiar con SITE_URL en Vercel.
const site = process.env.SITE_URL || 'https://poyagorda.com';

export default defineConfig({
  site,
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !/\/(confirmado|enlace-caducado|404)$/.test(page),
    }),
  ],
});
