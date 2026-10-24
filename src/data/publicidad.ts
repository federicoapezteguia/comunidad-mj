// ============================================================
// Banners publicitarios.
// Para cargar uno: subir la imagen a /public/banners/ y agregar
// un objeto en la lista del espacio que corresponda.
// Si un espacio no tiene banners vigentes, se muestra el aviso
// "Publicitá acá" que lleva a /publicidad/.
// ============================================================

export type EspacioId = 'superior' | 'lateral' | 'lateral-largo' | 'en-nota' | 'campanas' | 'horizontal';

export const MEDIDAS: Record<EspacioId, { w: number; h: number; wMovil?: number; hMovil?: number }> = {
  superior: { w: 970, h: 90, wMovil: 320, hMovil: 100 },
  lateral: { w: 300, h: 250 },
  'lateral-largo': { w: 300, h: 600 },
  'en-nota': { w: 300, h: 250 },
  campanas: { w: 1920, h: 550, wMovil: 800, hMovil: 450 },
  horizontal: { w: 900, h: 225, wMovil: 800, hMovil: 400 },
};

export type Banner = {
  anunciante: string;
  imagen: string; // ruta dentro de /public, ej. '/banners/super-lopez.webp' (sin medidas en el nombre: los bloqueadores de anuncios ocultan archivos como 300x600)
  imagenMovil?: string;
  enlace?: string; // opcional: sin enlace, el banner no lleva a ningún lado
  w?: number; // medida real de la imagen (si no coincide con el espacio)
  h?: number;
  desde?: string; // 'AAAA-MM-DD'
  hasta?: string; // 'AAAA-MM-DD'
};

// 'en-nota': cada nota muestra un solo anunciante (rotan por nota, no se cruzan rubros).
export const BANNERS: Record<EspacioId, Banner[]> = {
  superior: [
    {
      anunciante: 'La Paulina – Disproal SRL, distribuidor oficial (Tortugas, Santa Fe)',
      imagen: '/banners/la-paulina-disproal-franja.webp',
      imagenMovil: '/banners/la-paulina-disproal-franja-movil.webp',
    },
  ],
  lateral: [
    {
      anunciante: 'ROK – Desarrollo y diseño de sitios web',
      imagen: '/banners/rok-desarrollo-diseno-sitios-web.webp',
      enlace: 'https://agenciarok.com.ar',
      w: 600,
      h: 600,
    },
    {
      anunciante: "Los Tano's – Parrilla y comedor",
      imagen: '/banners/los-tanos-parrilla-comedor.webp',
      enlace: 'https://www.instagram.com/lostanosmsjz/',
      w: 600,
      h: 600,
    },
  ],
  'lateral-largo': [],
  'en-nota': [
    {
      anunciante: 'LD Performance Automotores – usados, 0 km y taller (San Marcos Sud)',
      imagen: '/banners/ld-performance-cuadrado.webp',
      enlace: 'https://ldperformance.com.ar',
    },
    {
      anunciante: 'Meyer Automotores – Ruta 9 y Las Colonias, Marcos Juárez',
      imagen: '/banners/meyer-automotores-marcos-juarez.webp',
      enlace: 'https://www.instagram.com/meyerautos.msjz/',
      w: 600,
      h: 600,
    },
  ],
  campanas: [
    {
      anunciante: 'Unicornio Viajes – Volá hacia tus sueños',
      imagen: '/banners/unicornio-viajes.webp',
      imagenMovil: '/banners/unicornio-viajes-movil.webp',
      enlace: 'https://unicornioviajes.tur.ar/',
      w: 1920,
      h: 480,
    },
  ],
  horizontal: [
    {
      anunciante: 'Farmacia Bosio-Scortichini – H. Yrigoyen 1296',
      imagen: '/banners/farmacia-bosio-scortichini.webp',
      imagenMovil: '/banners/farmacia-bosio-scortichini-movil.webp',
      enlace: 'https://www.instagram.com/farmacia.bosioscortichini/',
    },
  ],
};
