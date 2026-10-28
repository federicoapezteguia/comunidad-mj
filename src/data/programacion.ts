// ============================================================
// Grilla de la FM 99.9 para el recuadro "Al aire ahora" de la portada.
// dias: 0 = domingo, 1 = lunes … 6 = sábado.
// desde / hasta en hora de Argentina, formato 'HH:MM' ('24:00' = medianoche).
// Un programa que pasa la medianoche se carga en dos tramos.
// Cuando ningún programa coincide, se muestra RELLENO.
// ============================================================

export type Programa = {
  nombre: string;
  conductores?: string;
  dias: number[];
  desde: string;
  hasta: string;
};

export const RELLENO = { nombre: 'Música Comunidad FAN', conductores: 'Los temas que suenan, las 24 horas' };

export const PROGRAMACION: Programa[] = [];
