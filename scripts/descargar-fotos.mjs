// Descarga las fotos de Wikimedia Commons listadas en src/data/fotos-remotas.json
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
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons)}?width=1600`;
  const r = await fetch(url, {
    headers: { 'User-Agent': 'ComunidadFanMJ/1.0 (https://comunidad.rokmarketing.com; sitio de noticias)' },
    redirect: 'follow',
  });
  if (!r.ok) {
    console.error(`No se pudo descargar ${commons}: ${r.status}`);
    process.exitCode = 1;
    continue;
  }
  await writeFile(ruta, Buffer.from(await r.arrayBuffer()));
  console.log(`Descargada: ${local}`);
  nuevas++;
}
console.log(`Fotos nuevas: ${nuevas}`);
