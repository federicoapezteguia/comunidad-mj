// ============================================================
// Banners publicitarios.
// Para cargar uno: subir la imagen a /public/banners/ y agregar
// un objeto en la lista del espacio que corresponda.
// Si un espacio no tiene banners vigentes, se muestra el aviso
// "Publicitá acá" que lleva a /publicidad/.
// ============================================================

export type EspacioId = 'superior' | 'lateral' | 'lateral-largo' | 'en-nota' | 'campanas';

export const MEDIDAS: Record<EspacioId, { w: number; h: number; wMovil?: number; hMovil?: number }> = {
  superior: { w: 970, h: 90, wMovil: 320, hMovil: 100 },
  lateral: { w: 300, h: 250 },
  'lateral-largo': { w: 300, h: 600 },
  'en-nota': { w: 300, h: 250 },
  campanas: { w: 1920, h: 550, wMovil: 800, hMovil: 450 },
};

export type Banner = {
  anunciante: string;
  imagen: string; // ruta dentro de /public, ej. '/banners/super-lopez-970x90.webp'
  imagenMovil?: string;
  enlace: string;
  desde?: string; // 'AAAA-MM-DD'
  hasta?: string; // 'AAAA-MM-DD'
};

export const BANNERS: Record<EspacioId, Banner[]> = {
  superior: [],
  lateral: [],
  'lateral-largo': [],
  'en-nota': [],
  campanas: [],
};
