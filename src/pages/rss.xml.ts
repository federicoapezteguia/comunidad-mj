import type { APIRoute } from 'astro';
import { getNoticias, urlNota } from '../lib/notas';
import { SITE, SECCIONES, type SeccionId } from '../config';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const notas = (await getNoticias()).slice(0, 40);
  const items = notas
    .map((n) => {
      const url = new URL(urlNota(n), site).href;
      return `    <item>
      <title>${esc(n.data.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(n.data.bajada)}</description>
      <category>${esc(SECCIONES[n.data.seccion as SeccionId].nombre)}</category>
      <pubDate>${n.data.fecha.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.nombre)}</title>
    <link>${new URL('/', site).href}</link>
    <description>${esc(SITE.descripcion)}</description>
    <language>es-ar</language>
    <atom:link href="${new URL('/rss.xml', site).href}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
