// Lista fija de etiquetas. Usar siempre estas, así no aparecen variantes
// ("concejo", "HCD", "Concejo Deliberante") para lo mismo.
// Para sumar una: agregar una línea  clave: 'Nombre visible',

export const ETIQUETAS = {
  municipio: 'Municipio',
  concejo: 'Concejo Deliberante',
  policiales: 'Policiales',
  'transito': 'Tránsito',
  deportes: 'Deportes',
  futbol: 'Fútbol',
  basquet: 'Básquet',
  agro: 'Agro',
  economia: 'Economía',
  educacion: 'Educación',
  salud: 'Salud',
  sociedad: 'Sociedad',
  cultura: 'Cultura',
  eventos: 'Eventos',
  clima: 'Clima',
  obras: 'Obras',
  instituciones: 'Instituciones',
  empresas: 'Empresas',
  gobierno: 'Gobierno',
  politica: 'Política',
  cuarteto: 'Cuarteto',
  estrenos: 'Estrenos',
  shows: 'Shows',
  entrevistas: 'Entrevistas',
  'cine-y-series': 'Cine y series',
  turismo: 'Turismo',
  automovilismo: 'Automovilismo',
  atletismo: 'Atletismo',
  transporte: 'Transporte',
  industria: 'Industria',
  religion: 'Religión',
  seguridad: 'Seguridad',
  tecnologia: 'Tecnología',
  folclore: 'Folclore',
  series: 'Series',
  novelas: 'Novelas',
  television: 'Televisión',
  famosos: 'Famosos',
  virales: 'Virales',
  plataformas: 'Plataformas',
} as const;

export type EtiquetaId = keyof typeof ETIQUETAS;
export const ETIQUETA_IDS = Object.keys(ETIQUETAS) as [EtiquetaId, ...EtiquetaId[]];

// Localidades de la región (páginas propias para captar búsquedas locales)
export const LOCALIDADES = {
  'marcos-juarez': 'Marcos Juárez',
  leones: 'Leones',
  'general-roca': 'General Roca',
  'monte-buey': 'Monte Buey',
  'cruz-alta': 'Cruz Alta',
  'camilo-aldao': 'Camilo Aldao',
  inriville: 'Inriville',
  'corral-de-bustos': 'Corral de Bustos',
  saira: 'Saira',
  'los-surgentes': 'Los Surgentes',
  'isla-verde': 'Isla Verde',
  'arias': 'Arias',
  'bell-ville': 'Bell Ville',
  'cordoba-capital': 'Córdoba Capital',
  'maria-juana': 'María Juana',
} as const;

export type LocalidadId = keyof typeof LOCALIDADES;
export const LOCALIDAD_IDS = Object.keys(LOCALIDADES) as [LocalidadId, ...LocalidadId[]];
