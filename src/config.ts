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
  frecuencia: '99.9',
  direccion: '[DIRECCIÓN]', // ej. 'San Martín 123'
  codigoPostal: '2580',
  telefono: '[TELÉFONO]',
  // WhatsApp: solo números con 549 + código de área sin 0 + número sin 15
  whatsapp: '5493416660326', // saludos y mensajes para la radio
  whatsappVisible: '341 666-0326',
  whatsappMensaje: '¡Hola Comunidad FAN! ', // va al estudio central de Rosario
  whatsappComercial: '5493517604328', // contacto comercial / publicidad
  whatsappComercialVisible: '351 760-4328',
  email: '[EMAIL]',

  // Reproductor en vivo de la señal
  reproductor: 'https://comunidadmj.miradio.ar/',
  // Señal de audio directa (suena dentro del sitio)
  stream: 'https://server.streamcasthd.com:8504/stream',
  // Stream en video (YouTube)
  youtubeVivo: 'https://www.youtube.com/@ComunidadFAN',

  // Redes de la señal local (dejar vacío lo que no exista)
  redes: {
    instagram: 'https://www.instagram.com/comunidadfan.mj/',
    facebook: '',
    youtube: 'https://www.youtube.com/@ComunidadFAN',
    tiktok: '',
    x: '',
  },

  // Logo de la señal (PNG transparente)
  logoSenal: {
    src: '/img/fm-99-9-marcos-juarez-comunidad-fan.png',
    alt: 'Logo FM 99.9 Marcos Juárez, Comunidad FAN',
    titulo: 'FM 99.9 Marcos Juárez – Comunidad FAN, radio en vivo',
    w: 498,
    h: 555,
  },

  // Sitio madre
  red: 'https://comunidad.fan/',
};

export type SeccionId =
  | 'marcos-juarez'
  | 'cordoba'
  | 'nacionales'
  | 'espectaculos'
  | 'deportes'
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
  deportes: {
    nombre: 'Deportes',
    titulo: 'Deportes: Marcos Juárez, Córdoba y el país',
    descripcion:
      'Deportes de Marcos Juárez y la región: fútbol de la Liga Bellvillense, automovilismo, atletismo y clubes, más Belgrano, Talleres, Instituto y la Selección.',
    enMenu: true,
  },
  musica: {
    nombre: 'Música',
    titulo: 'Música: estrenos, shows y cuarteto',
    descripcion:
      'Estrenos, lanzamientos, recitales en Córdoba y la región, cuarteto y artistas cordobeses. Con el Ranking FAN.',
    enMenu: true,
  },
  espectaculos: {
    nombre: 'Espectáculos',
    titulo: 'Espectáculos: series, novelas, famosos y virales',
    descripcion:
      'Novedades de series, novelas, plataformas, televisión, famosos y los virales del momento, con todo lo que se comenta en Córdoba y el país.',
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
