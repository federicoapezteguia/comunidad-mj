import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const staging = __STAGING__;
  const cuerpo = staging
    ? `# Sitio en etapa de prueba: no indexar\nUser-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: /buscar/\n\nSitemap: ${new URL('sitemap-index.xml', site)}\nSitemap: ${new URL('news-sitemap.xml', site)}\n`;
  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
