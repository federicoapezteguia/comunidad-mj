// Descarga las fotos (Wikimedia Commons o URLs de Comunidad FAN) listadas en src/data/fotos-remotas.json
// que todavía no estén en src/content/notas/img/. Lo ejecuta la publicación automática.
import { readFile, writeFile, access, mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

// Si la imagen es vertical o cuadrada (un flyer, una foto de celular), arma una portada 16:9:
// la misma imagen desenfocada de fondo y la original entera al centro.
// "buscar:texto" → primera imagen horizontal y grande de Wikimedia Commons para esa búsqueda
async function buscarEnCommons(q) {
  try {
    const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15'
      + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap');
    const r = await fetch(api, { headers: { 'User-Agent': 'ComunidadFanMJ/1.0 (sitio de noticias)' } });
    const j = await r.json();
    const paginas = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
    // primero una horizontal grande; si no hay, cualquiera razonable (las verticales se arman como portada)
    for (const horizontal of [true, false]) {
      for (const p of paginas) {
        const ii = p.imageinfo?.[0];
        if (ii && ii.width >= 800 && (!horizontal || ii.width >= ii.height) && /jpeg|png/.test(ii.mime)) {
          console.log(`Commons "${q}" → ${p.title}`);
          return ii.thumburl || ii.url;
        }
      }
    }
  } catch (e) { console.warn(`AVISO: búsqueda en Commons falló (${q}): ${e.message}`); }
  return null;
}

async function aPortada(buf) {
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height || meta.width / meta.height >= 1.3) return buf;
  const W = 1600, H = 900;
  const fondo = await sharp(buf).resize(W, H, { fit: 'cover' }).blur(30).modulate({ brightness: 0.7 }).toBuffer();
  const frente = await sharp(buf).resize({ height: H - 60 }).toBuffer();
  const fm = await sharp(frente).metadata();
  return sharp(fondo).composite([{ input: frente, left: Math.round((W - fm.width) / 2), top: 30 }]).jpeg({ quality: 84 }).toBuffer();
}

const lista = JSON.parse(await readFile('src/data/fotos-remotas.json', 'utf8'));
const destino = 'src/content/notas/img/';
let nuevas = 0;
const respaldos = [];
await mkdir(destino, { recursive: true });

for (const [local, commons] of Object.entries(lista)) {
  if (local.startsWith('_')) continue;
  const ruta = destino + local;
  try {
    await access(ruta);
    continue; // ya está
  } catch {}
  // Puede ser un archivo de Commons, una dirección completa o una lista de direcciones alternativas
  const fuentes = (Array.isArray(commons) ? commons : [commons]).map((c) =>
    c.startsWith('http') || c.startsWith('buscar:') ? c : `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(c)}?width=1600`,
  );
  let ok = false;
  for (let url of fuentes) {
    if (url.startsWith('buscar:')) url = await buscarEnCommons(url.slice(7).trim());
    if (!url) continue;
    const esCommons = url.includes('wikimedia.org');
    const headers = esCommons
      ? { 'User-Agent': 'ComunidadFanMJ/1.0 (https://comunidad.rokmarketing.com; sitio de noticias)' }
      : {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
          Referer: new URL(url).origin + '/',
        };
    try {
      const r = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(90000) });
      const tipo = r.headers.get('content-type') || '';
      if (!r.ok || !tipo.startsWith('image/')) {
        console.warn(`AVISO: ${local} no disponible (${r.status} ${tipo}) en ${url}`);
        continue;
      }
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 5000) { console.warn(`AVISO: ${local} demasiado chica en ${url}`); continue; }
      await writeFile(ruta, await aPortada(buf));
      console.log(`Descargada: ${local}`);
      nuevas++;
      ok = true;
      break;
    } catch (e) {
      console.warn(`AVISO: error de red con ${local} en ${url}: ${e.message}`);
    }
  }
  if (!ok) {
    // Para que la publicación no se corte: imagen institucional de respaldo (no se guarda en el repo)
    await copyFile('scripts/foto-respaldo.jpg', ruta);
    respaldos.push(ruta);
    console.warn(`RESPALDO: ${local} usa la imagen institucional`);
  }
}
await writeFile('/tmp/fotos-respaldo.txt', respaldos.join('\n'));
console.log(`Fotos nuevas: ${nuevas}`);
