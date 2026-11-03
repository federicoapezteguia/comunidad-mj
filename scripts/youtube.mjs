// Descarga los últimos videos del canal de YouTube de Comunidad FAN (feed RSS público)
// y los guarda en src/data/youtube.json. Si falla, deja el archivo anterior como está.
import { readFile, writeFile } from 'node:fs/promises';

const CANAL = 'https://www.youtube.com/@ComunidadFAN';
const SALIDA = 'src/data/youtube.json';
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; ComunidadFAN-MJ/1.0)', 'Accept-Language': 'es-AR,es;q=0.9' };

async function traer(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.text();
}

const decodificar = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

try {
  let anterior = null;
  try { anterior = JSON.parse(await readFile(SALIDA, 'utf8')); } catch {}
  let canalId = anterior?.canalId;
  if (!canalId) {
    const html = await traer(CANAL);
    canalId = html.match(/"(?:channelId|externalId)":"(UC[\w-]{22})"/)?.[1] || html.match(/channel\/(UC[\w-]{22})/)?.[1];
    if (!canalId) throw new Error('No se encontró el ID del canal');
  }
  const xml = await traer(`https://www.youtube.com/feeds/videos.xml?channel_id=${canalId}`);
  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: e.match(/<yt:videoId>([^<]+)/)?.[1],
    titulo: decodificar(e.match(/<title>([^<]*)/)?.[1] ?? ''),
    fecha: e.match(/<published>([^<]+)/)?.[1],
  })).filter((v) => v.id && !/#shorts?\b/i.test(v.titulo)).slice(0, 12);
  if (!videos.length) throw new Error('El feed no trajo videos');
  const nuevo = { canalId, videos };
  if (JSON.stringify(nuevo) !== JSON.stringify(anterior)) {
    await writeFile(SALIDA, JSON.stringify(nuevo, null, 2) + '\n');
    console.log(`YouTube: ${videos.length} videos actualizados`);
  } else console.log('YouTube: sin videos nuevos');
} catch (e) {
  console.log('YouTube: no se pudo actualizar (' + e.message + '), se mantienen los videos anteriores');
}
