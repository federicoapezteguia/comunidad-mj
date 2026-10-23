// ============================================================
// Datos del medio. Lo que está entre corchetes falta completar.
// ============================================================

export const SITE = {
  nombre: 'Comunidad FAN Marcos Juárez',
  nombreCorto: 'Comunidad FAN MJ',
  descripcion:
    'Noticias de Marcos Juárez, el sudeste de Córdoba y la actualidad nacional. Música, entrevistas y la radio en vivo de Comunidad FAN.',
  ciudad: 'Marcos Juárez',
  provincia: 'Córdoba',
  pais: 'AR',
  idioma: 'es-AR',
  zonaHoraria: 'America/Argentina/Cordoba',

  // --- Señal de radio ---
  frecuencia: '[FRECUENCIA]', // ej. '99.5'
  direccion: '[DIRECCIÓN]', // ej. 'San Martín 123'
  codigoPostal: '2580',
  telefono: '[TELÉFONO]',
  whatsapp: '', // solo números, ej. '5493472000000'
  email: '[EMAIL]',

  // Reproductor en vivo (el de la red Comunidad FAN)
  reproductor: 'https://player.cdnrad.com/comunidadfan',

  // Redes de la señal local (dejar vacío lo que no exista)
  redes: {
    instagram: '',
    facebook: '',
    youtube: 'https://www.youtube.com/@ComunidadFAN',
    tiktok: '',
    x: '',
  },

  // Sitio madre
  red: 'https://comunidad.fan/',
};

export type SeccionId =
  | 'marcos-juarez'
  | 'cordoba'
  | 'nacionales'
  | 'musica'
  | 'on-demand'
  | 'contenido-de-marca';

export const SECCIONES: Record<
  SeccionId,
  { nombre: string; titulo: string; descripcion: string; enMenu: boolean }
> = {
  'marcos-juarez': {
    nombre: 'Marcos Juárez',
    titulo: 'Noticias de Marcos Juárez hoy',
    descripcion:
      'Las noticias de Marcos Juárez: municipio, Concejo Deliberante, policiales, deportes, agro e instituciones de la ciudad y la región.',
    enMenu: true,
  },
  cordoba: {
    nombre: 'Córdoba',
    titulo: 'Noticias de Córdoba',
    descripcion:
      'Lo que pasa en la provincia de Córdoba y cómo impacta en el sudeste cordobés: gobierno, economía, agro, sociedad y cultura.',
    enMenu: true,
  },
  nacionales: {
    nombre: 'Nacionales',
    titulo: 'Actualidad nacional',
    descripcion:
      'Lo más importante de la actualidad argentina, resumido y con su impacto en Córdoba y Marcos Juárez.',
    enMenu: true,
  },
  musica: {
    nombre: 'Música',
    titulo: 'Música: estrenos, shows y cuarteto',
    descripcion:
      'Estrenos, lanzamientos, recitales en Córdoba y la región, cuarteto y artistas cordobeses. Con el Ranking FAN.',
    enMenu: true,
  },
  'on-demand': {
    nombre: 'On Demand',
    titulo: 'On Demand: entrevistas y videos',
    descripcion: 'Entrevistas, coberturas y momentos del aire de Comunidad FAN Marcos Juárez.',
    enMenu: true,
  },
  'contenido-de-marca': {
    nombre: 'Contenido de marca',
    titulo: 'Contenido de marca',
    descripcion: 'Notas presentadas por empresas e instituciones que acompañan a Comunidad FAN Marcos Juárez.',
    enMenu: false,
  },
};

export const SECCION_IDS = Object.keys(SECCIONES) as [SeccionId, ...SeccionId[]];

// Cantidad de notas por página en los listados
export const POR_PAGINA = 12;

// Etiquetas con menos notas que este número no se indexan en Google
export const MIN_NOTAS_INDEXAR = 3;
