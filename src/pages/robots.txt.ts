import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /confirmado\nDisallow: /enlace-caducado\n\nSitemap: ${new URL('/sitemap-index.xml', site)}\n`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
