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
export function relacionadas(nota: Nota, todas: Nota[], cantidad = 4): Nota[] {
  const etis = new Set(nota.data.etiquetas);
  return todas
    .filter((n) => n.id !== nota.id && !n.data.patrocinado)
    .map((n) => {
      let puntos = 0;
      if (n.data.seccion === nota.data.seccion) puntos += 2;
      if (nota.data.localidad && n.data.localidad === nota.data.localidad) puntos += 1;
      for (const e of n.data.etiquetas) if (etis.has(e)) puntos += 3;
      return { n, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || b.n.data.fecha.getTime() - a.n.data.fecha.getTime())
    .slice(0, cantidad)
    .map((x) => x.n);
}

/** Minutos de lectura aproximados. */
export function minutosLectura(texto = ''): number {
  return Math.max(1, Math.round(texto.split(/\s+/).length / 220));
}
