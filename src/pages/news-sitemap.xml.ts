import type { APIRoute } from 'astro';
import { getNoticias, urlNota } from '../lib/notas';
import { SITE } from '../config';

// Sitemap de Google News: solo noticias de las últimas 48 horas (sin publinotas).
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const limite = Date.now() - 48 * 3600_000;
  const notas = (await getNoticias()).filter((n) => n.data.fecha.getTime() >= limite);
  const items = notas
    .map(
      (n) => `  <url>
    <loc>${new URL(urlNota(n), site).href}</loc>
    <news:news>
      <news:publication><news:name>${esc(SITE.nombre)}</news:name><news:language>es</news:language></news:publication>
      <news:publication_date>${n.data.fecha.toISOString()}</news:publication_date>
      <news:title>${esc(n.data.titulo)}</news:title>
    </news:news>
  </url>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
