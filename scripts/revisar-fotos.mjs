/**
 * Avisa cuándo dos notas cercanas en el tiempo comparten la misma foto.
 *
 * Repetir una foto de archivo meses después está bien; repetirla entre dos
 * notas de la misma semana se nota en la portada y en las recomendaciones.
 *
 *   node scripts/revisar-fotos.mjs          → avisa (no corta el build)
 *   node scripts/revisar-fotos.mjs --cortar → sale con error si hay repetidas
 */
import { readdirSync, readFileSync } from 'node:fs';

const DIAS = 45;
const CARPETA = 'src/content/notas';

const notas = [];
for (const archivo of readdirSync(CARPETA)) {
  if (!archivo.endsWith('.md')) continue;
  const texto = readFileSync(`${CARPETA}/${archivo}`, 'utf-8').slice(0, 2000);
  const foto = texto.match(/^foto:\s*\.\/img\/(\S+)/m)?.[1];
  const fecha = texto.match(/^fecha:\s*["']?([\dT:+-]{10,})/m)?.[1];
  if (foto && fecha) notas.push({ archivo, foto, fecha: new Date(fecha) });
}

const porFoto = new Map();
for (const n of notas) {
  if (!porFoto.has(n.foto)) porFoto.set(n.foto, []);
  porFoto.get(n.foto).push(n);
}

const choques = [];
for (const [foto, lista] of porFoto) {
  if (lista.length < 2) continue;
  lista.sort((a, b) => b.fecha - a.fecha);
  for (let i = 0; i < lista.length - 1; i++) {
    const dias = (lista[i].fecha - lista[i + 1].fecha) / 86400000;
    if (dias <= DIAS) choques.push({ foto, dias: Math.round(dias), a: lista[i], b: lista[i + 1] });
  }
}

if (choques.length === 0) {
  console.log(`Fotos: ninguna repetida entre notas de menos de ${DIAS} días.`);
  process.exit(0);
}

choques.sort((x, y) => y.a.fecha - x.a.fecha);
console.log(`\nFotos repetidas entre notas cercanas (${choques.length}):\n`);
for (const c of choques) {
  console.log(`  ${c.foto}  (${c.dias} días de diferencia)`);
  console.log(`     ${c.a.fecha.toISOString().slice(0, 10)}  ${c.a.archivo}`);
  console.log(`     ${c.b.fecha.toISOString().slice(0, 10)}  ${c.b.archivo}\n`);
}

if (process.argv.includes('--cortar')) process.exit(1);
