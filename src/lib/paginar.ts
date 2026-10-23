import { POR_PAGINA } from '../config';
import type { Nota } from './notas';

/** Arma las rutas paginadas: /base/ y /base/pagina/2/ ... */
export function rutasPaginadas<P extends Record<string, string>>(
  params: P,
  notas: Nota[],
  extra: Record<string, unknown> = {},
) {
  const total = Math.max(1, Math.ceil(notas.length / POR_PAGINA));
  return Array.from({ length: total }, (_, i) => ({
    params: { ...params, pagina: i === 0 ? undefined : `pagina/${i + 1}` },
    props: {
      notas: notas.slice(i * POR_PAGINA, (i + 1) * POR_PAGINA),
      pagina: i + 1,
      total,
      cantidad: notas.length,
      ...extra,
    },
  }));
}
