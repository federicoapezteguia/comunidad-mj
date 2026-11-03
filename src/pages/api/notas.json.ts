import type { APIRoute } from 'astro';
import { getNoticias, urlNota, volanta } from '../../lib/notas';

// Índice de notas para el contador de "Lo más leído" (lo usa /api/visitas.php)
export const GET: APIRoute = async () => {
  const notas = await getNoticias();
  const indice = Object.fromEntries(
    notas.slice(0, 300).map((n) => [n.id, { titulo: n.data.titulo, url: urlNota(n), volanta: volanta(n), fecha: n.data.fecha.toISOString() }]),
  );
  return new Response(JSON.stringify(indice), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
