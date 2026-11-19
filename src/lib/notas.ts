import { getCollection, type CollectionEntry } from 'astro:content';
import { SECCIONES, SITE, type SeccionId } from '../config';
import { ETIQUETAS, LOCALIDADES } from '../data/etiquetas';

export type Nota = CollectionEntry<'notas'>;

/** Todas las notas publicadas, de la más nueva a la más vieja. */
export async function getNotas(): Promise<Nota[]> {
  const ahora = Date.now();
  const notas = await getCollection(
    'notas',
    ({ data }) => !data.borrador && data.fecha.getTime() <= ahora + 5 * 60_000,
  );
  return notas.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

/** Notas periodísticas (sin publinotas). */
export async function getNoticias(): Promise<Nota[]> {
  return (await getNotas()).filter((n) => !n.data.patrocinado);
}

export function urlNota(n: Nota): string {
  return `/${n.data.seccion}/${n.id}/`;
}

export function volanta(n: Nota): string {
  if (n.data.patrocinado) return 'Contenido de marca';
  if (n.data.volanta) return n.data.volanta;
  const e = n.data.etiquetas[0];
  return e ? ETIQUETAS[e] : SECCIONES[n.data.seccion as SeccionId].nombre;
}

const fmtFecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: SITE.zonaHoraria,
});
const fmtHora = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: SITE.zonaHoraria,
});
const fmtCorta = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  timeZone: SITE.zonaHoraria,
});

export const fecha = (d: Date) => fmtFecha.format(d);
export const hora = (d: Date) => fmtHora.format(d);
export const fechaCorta = (d: Date) => fmtCorta.format(d);

export const nombreEtiqueta = (id: string) => ETIQUETAS[id as keyof typeof ETIQUETAS] ?? id;
export const nombreLocalidad = (id: string) => LOCALIDADES[id as keyof typeof LOCALIDADES] ?? id;

/** Notas relacionadas: misma sección y etiquetas en común. */
/** Palabras de un título que sirven para comparar, sin las que se repiten en todas. */
const COMUNES = new Set([
  'marcos', 'juarez', 'cordoba', 'ciudad', 'nueva', 'nuevo', 'nuevas', 'nuevos',
  'para', 'desde', 'hasta', 'sobre', 'entre', 'como', 'cuando', 'donde', 'tras',
  'este', 'esta', 'estos', 'estas', 'todos', 'todas',
]);

function clavesTitulo(t: string): Set<string> {
  return new Set(
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((p) => p.length > 3 && !COMUNES.has(p)),
  );
}

/** Dos notas que cuentan casi lo mismo: no tienen que aparecer juntas. */
function casiIguales(a: Nota, b: Nota): boolean {
  const fa = (a.data.foto as any)?.src ?? a.data.foto;
  const fb = (b.data.foto as any)?.src ?? b.data.foto;
  if (fa && fa === fb) return true;
  const pa = clavesTitulo(a.data.titulo);
  const pb = clavesTitulo(b.data.titulo);
  if (pa.size < 2 || pb.size < 2) return false;
  let comunes = 0;
  for (const p of pa) if (pb.has(p)) comunes += 1;
  return comunes >= 2 && comunes / Math.min(pa.size, pb.size) >= 0.5;
}

/**
 * Notas para recomendar. Pesa el tema (sección, localidad y etiquetas) pero
 * sobre todo que sean recientes: una nota de hace un mes casi nunca le gana a
 * una de esta semana. Descarta las que repiten foto o cuentan casi lo mismo.
 */
export function relacionadas(nota: Nota, todas: Nota[], cantidad = 4, excluir: Nota[] = []): Nota[] {
  const etis = new Set(nota.data.etiquetas);
  const fuera = new Set(excluir.map((n) => n.id));
  const ahora = Date.now();

  const puntuadas = todas
    .filter((n) => n.id !== nota.id && !n.data.patrocinado && !fuera.has(n.id))
    .map((n) => {
      let puntos = 0;
      if (n.data.seccion === nota.data.seccion) puntos += 2;
      if (nota.data.localidad && n.data.localidad === nota.data.localidad) puntos += 1;
      for (const e of n.data.etiquetas) if (etis.has(e)) puntos += 3;
      // Frescura: lo de hoy suma 9 y va perdiendo un punto por día.
      const dias = Math.max(0, (ahora - n.data.fecha.getTime()) / 86400000);
      puntos += Math.max(0, 9 - dias);
      return { n, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || b.n.data.fecha.getTime() - a.n.data.fecha.getTime());

  const elegidas: Nota[] = [];
  for (const { n } of puntuadas) {
    if (elegidas.length >= cantidad) break;
    if (casiIguales(nota, n)) continue;
    if (elegidas.some((e) => casiIguales(e, n))) continue;
    elegidas.push(n);
  }
  return elegidas;
}

/** Minutos de lectura aproximados. */
export function minutosLectura(texto = ''): number {
  return Math.max(1, Math.round(texto.split(/\s+/).length / 220));
}

/** Notas de la región: sección Región o notas de otras localidades de la zona (no Marcos Juárez ni la capital). */
export function esRegion(n: Nota): boolean {
  const l = n.data.localidad;
  return n.data.seccion === 'region' || (!!l && l !== 'marcos-juarez' && l !== 'cordoba-capital' && n.data.seccion !== 'contenido-de-marca');
}
