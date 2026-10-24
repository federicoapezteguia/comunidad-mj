// Descarga las fotos (Wikimedia Commons o URLs de Comunidad FAN) listadas en src/data/fotos-remotas.json
// que todavía no estén en src/content/notas/img/. Lo ejecuta la publicación automática.
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';

const lista = JSON.parse(await readFile('src/data/fotos-remotas.json', 'utf8'));
const destino = 'src/content/notas/img/';
let nuevas = 0;
await mkdir(destino, { recursive: true });

for (const [local, commons] of Object.entries(lista)) {
  if (local.startsWith('_')) continue;
  const ruta = destino + local;
  try {
    await access(ruta);
    continue; // ya está
  } catch {}
  // Puede ser un archivo de Wikimedia Commons o una dirección completa (fotos de la red Comunidad FAN)
  const url = commons.startsWith('http')
    ? commons
    : `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons)}?width=1600`;
  const esCommons = !commons.startsWith('http');
  const headers = esCommons
    ? { 'User-Agent': 'ComunidadFanMJ/1.0 (https://comunidad.rokmarketing.com; sitio de noticias)' }
    : {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        Referer: new URL(url).origin + '/',
      };
  let r;
  try {
    r = await fetch(url, { headers, redirect: 'follow' });
  } catch (e) {
    console.warn(`AVISO: error de red con ${local}: ${e.message}`);
    continue;
  }
  if (!r.ok) {
    console.warn(`AVISO: no se pudo descargar ${local} (${r.status}) desde ${url}`);
    continue;
  }
  await writeFile(ruta, Buffer.from(await r.arrayBuffer()));
  console.log(`Descargada: ${local}`);
  nuevas++;
}
console.log(`Fotos nuevas: ${nuevas}`);
