// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// URL pública. En Vercel se rellena sola con el dominio de producción del proyecto.
// Si usas dominio propio, define SITE_URL en las variables de entorno de Vercel.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://poyagorda.vercel.app');

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
