import { 
  OperativeArea, 
  AdministrativeType, 
  ArchiveDocument, 
  KidProfile, 
  InventoryItem, 
  MaterialLoan, 
  AreaRequest, 
  BudgetRecord, 
  OfficeEvent,
  UserProfile,
  OfficeFolioInfo,
  OfficeShelf,
  InstitutionalInventoryItem,
  AreaActa,
  OfficeNotice,
  AreaInscriptionForm,
  InscriptionSubmission
} from '../types';

export const OFFICE_SHELF_FOLIOS: OfficeFolioInfo[] = [
  {
    id: 'actas-y-reuniones',
    name: 'Actas y reuniones',
    estanteDefault: 'Estante 1 - Balda A',
    color: '#0D472C',
    icon: 'FileText',
    descripcion: 'Lo oficial de cada reunión: actas de comisión, asistencia firmada, orden del día y acuerdos.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'inventario',
    name: 'Inventario',
    estanteDefault: 'Estante 1 - Balda B',
    color: '#1B5E20',
    icon: 'Package',
    descripcion: 'Muebles, equipos, herramientas, altas y bajas, fotos de estado y fichas de préstamos.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'eventos',
    name: 'Eventos',
    estanteDefault: 'Estante 1 - Balda C',
    color: '#2E7D32',
    icon: 'Calendar',
    descripcion: 'Cronogramas, listas de participantes, permisos institucionales, presupuesto y rendición.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'carteles',
    name: 'Carteles',
    estanteDefault: 'Estante 2 - Balda A',
    color: '#33691E',
    icon: 'Image',
    descripcion: 'Diseños de carteles y flyers, fechas y lugares de difusión, bocetos y versiones digitales con QR.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'proyectos',
    name: 'Proyectos',
    estanteDefault: 'Estante 2 - Balda B',
    color: '#15803D',
    icon: 'FolderGit2',
    descripcion: 'Formularios de proyectos en curso, objetivos, beneficiarios, cronogramas y notas de presentación.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'notas-y-resolucion',
    name: 'Notas y resolucion',
    estanteDefault: 'Estante 2 - Balda C',
    color: '#0F766E',
    icon: 'Mail',
    descripcion: 'Correspondencia oficial: notas con número de entrada y salida, disposiciones y sellos.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'presupuesto-recaudacion-y-balance',
    name: 'Presupuesto recaudacion y balance',
    estanteDefault: 'Estante 3 - Balda A',
    color: '#047857',
    icon: 'Coins',
    descripcion: 'Presupuestos mensuales y anuales, facturas, comprobantes, tickets y balance final firmado.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'informe',
    name: 'Informe',
    estanteDefault: 'Estante 3 - Balda B',
    color: '#065F46',
    icon: 'ClipboardCheck',
    descripcion: 'Informes mensuales de actividades, eventos realizados, estadísticas de participantes y fotos.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'planificacion',
    name: 'Planificacion',
    estanteDefault: 'Estante 3 - Balda C',
    color: '#064E3B',
    icon: 'Target',
    descripcion: 'Planificación anual y trimestral, calendario de actividades, asignación de tareas y metas.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'registro',
    name: 'Registro',
    estanteDefault: 'Estante 4 - Balda A',
    color: '#115E59',
    icon: 'BookOpen',
    descripcion: 'Libro de registro de entrada/salida documental, visitas al archivo y entrega de materiales.',
    categoriaTipo: 'ADMINISTRATIVO',
  },
  {
    id: 'deportes',
    name: 'Deportes',
    estanteDefault: 'Estante 4 - Balda B',
    color: '#14532D',
    icon: 'Trophy',
    descripcion: 'Planillas de profes, torneos, listas de alumnos, fichas de jugadores y materiales deportivos.',
    categoriaTipo: 'OPERATIVO',
  },
  {
    id: 'accion-social',
    name: 'Accion social',
    estanteDefault: 'Estante 4 - Balda C',
    color: '#166534',
    icon: 'HeartHandshake',
    descripcion: 'Asistencia directa a familias de Puerto Esperanza, relevamientos barriales y fichas de ayuda.',
    categoriaTipo: 'OPERATIVO',
  },
  {
    id: 'cultura-y-eventos',
    name: 'Cultura y eventos',
    estanteDefault: 'Estante 5 - Balda A',
    color: '#1E3A8A',
    icon: 'Sparkles',
    descripcion: 'Talleres de arte, danza, música, festivales culturales y registro de exposiciones.',
    categoriaTipo: 'OPERATIVO',
  },
  {
    id: 'ambiente-y-proteccion-animal',
    name: 'Ambiente y proteccion animal',
    estanteDefault: 'Estante 5 - Balda B',
    color: '#15803D',
    icon: 'Trees',
    descripcion: 'Huella Verde, jornadas de castración y vacunación, rescates y plantación de árboles nativos.',
    categoriaTipo: 'OPERATIVO',
  },
  {
    id: 'prensa-redes-y-comunicacion',
    name: 'Prensa redes y comunicacion',
    estanteDefault: 'Estante 5 - Balda C',
    color: '#0369A1',
    icon: 'Camera',
    descripcion: 'Gacetillas, fotos de cobertura, archivo de publicaciones en redes y difusión comunitaria.',
    categoriaTipo: 'OPERATIVO',
  },
];

export const OPERATIVE_AREAS: { 
  key: OperativeArea; 
  label: string; 
  icon: string; 
  color: string; 
  bgSoft: string; 
  description: string;
  encargados: string[];
}[] = [
  { 
    key: 'DEPORTES Y ACCIÓN SOCIAL', 
    label: '⚽ Deportes y Acción Social', 
    icon: 'Trophy', 
    color: '#0D472C', 
    bgSoft: '#E8F3ED',
    description: 'Torneos barriales, escuelas formativas, apoyo social directo y contención comunitaria.',
    encargados: ['Ezequiel Villalba', 'Micaela']
  },
  { 
    key: 'CULTURA Y EVENTOS', 
    label: '🎭 Cultura y Eventos', 
    icon: 'Palette', 
    color: '#1E6B45', 
    bgSoft: '#E9F5EE',
    description: 'Festivales, talleres de artes escénicas, música, danzas y muestras culturales.',
    encargados: ['Cami Rodríguez', 'Mariel Rozas 👑']
  },
  { 
    key: 'AMBIENTE Y PROTECCIÓN ANIMAL', 
    label: '🌱 Ambiente y Protección Animal', 
    icon: 'Leaf', 
    color: '#137547', 
    bgSoft: '#EDF8F1',
    description: 'Huella Verde, reforestación con árboles nativos, rescate y jornadas de castración y bienestar animal.',
    encargados: ['Marcos Monzon', 'Santi']
  },
  { 
    key: 'PRENSA, REDES Y COMUNICACIÓN', 
    label: '📸 Prensa, Redes y Comunicación', 
    icon: 'Camera', 
    color: '#0A5C36', 
    bgSoft: '#E6F6ED',
    description: 'Registro audiovisual de todas las actividades, diseño de cartelería y flyers, difusión en redes y archivo de medios.',
    encargados: ['Celine Rodriguez']
  },
  { 
    key: 'SALUD Y BIENESTAR', 
    label: '❤️ Salud y Bienestar', 
    icon: 'HeartPulse', 
    color: '#1B5E3C', 
    bgSoft: '#EAF5EF',
    description: 'Jornadas de salud comunitaria, controles de libreta, talleres de primeros auxilios y nutrición.',
    encargados: ['Equipo Interdisciplinario']
  },
  { 
    key: 'NIÑEZ Y ADOLESCENCIA', 
    label: '👥 Niñez y Adolescencia', 
    icon: 'Smile', 
    color: '#27774F', 
    bgSoft: '#EBF7F0',
    description: 'Juegoteca, apoyo escolar, meriendas reforzadas, espacios de liderazgo y formación juvenil.',
    encargados: ['Equipo de Talleristas']
  },
  { 
    key: 'TECNOLOGÍA Y MEDIOS', 
    label: '💻 Tecnología y Medios', 
    icon: 'Cpu', 
    color: '#114B30', 
    bgSoft: '#E7F2EC',
    description: 'Alfabetización digital, robótica comunitaria, programación y streaming del Centro.',
    encargados: ['Laboratorio Digital']
  },
];

export const ADMINISTRATIVE_TYPES: { 
  key: AdministrativeType; 
  label: string; 
  code: string; 
  icon: string;
  subtipos: string[];
  descripcion: string;
}[] = [
  { 
    key: 'ACTAS Y REUNIONES', 
    label: '1. Actas y Reuniones', 
    code: 'ACT', 
    icon: 'FileText',
    descripcion: 'Lo oficial de cada reunión.',
    subtipos: [
      'Actas de reuniones de comisión / equipo',
      'Lista de asistencia firmada',
      'Orden del día',
      'Acuerdos y resoluciones tomadas'
    ]
  },
  { 
    key: 'INVENTARIO', 
    label: '2. Inventario Patrimonial', 
    code: 'INV', 
    icon: 'Package',
    descripcion: 'Todo lo que tienen y en qué estado está.',
    subtipos: [
      'Listado de muebles, equipos, herramientas',
      'Altas y bajas de materiales',
      'Fotos de estado de equipos',
      'Fichas de préstamos de materiales'
    ]
  },
  { 
    key: 'EVENTOS', 
    label: '3. Actividades y Eventos', 
    code: 'EVE', 
    icon: 'Calendar',
    descripcion: 'Todo el papel de cada actividad que organizan.',
    subtipos: [
      'Cronograma del evento',
      'Lista de participantes / inscriptos',
      'Permisos institucionales',
      'Presupuesto del evento y rendición'
    ]
  },
  { 
    key: 'CARTELES', 
    label: '4. Cartelería y Difusión', 
    code: 'CAR', 
    icon: 'Image',
    descripcion: 'Archivo de difusión física y digital.',
    subtipos: [
      'Diseños impresos de carteles y flyers',
      'Fecha y lugar donde se pegó / difundió',
      'Bocetos aprobados y descartados',
      'QR o links de la versión digital'
    ]
  },
  { 
    key: 'PROYECTOS', 
    label: '5. Proyectos Institucionales', 
    code: 'PRY', 
    icon: 'FolderGit2',
    descripcion: 'Ideas y proyectos en curso o presentados.',
    subtipos: [
      'Formulario del proyecto',
      'Objetivos, beneficiarios, cronograma',
      'Nota de presentación a autoridades',
      'Presupuesto estimado del proyecto'
    ]
  },
  { 
    key: 'NOTAS Y RESOLUCIONES', 
    label: '6. Notas y Resoluciones', 
    code: 'RES', 
    icon: 'Mail',
    descripcion: 'La correspondencia oficial del centro.',
    subtipos: [
      'Notas recibidas (con sello o fecha de entrada)',
      'Notas enviadas (con copia firmada de recibido)',
      'Resoluciones internas aprobadas',
      'Convenios o acuerdos firmados'
    ]
  },
  { 
    key: 'PRESUPUESTO, RECAUDACIÓN Y BALANCE', 
    label: '7. Presupuesto, Recaudación y Balance', 
    code: 'BAL', 
    icon: 'Coins',
    descripcion: 'La plata y administración contable.',
    subtipos: [
      'Presupuesto anual / mensual',
      'Comprobantes de compra, facturas, tickets',
      'Planilla de recaudación de eventos / cuotas',
      'Balance y rendición final con firma'
    ]
  },
  { 
    key: 'INFORME', 
    label: '8. Informes de Gestión', 
    code: 'INF', 
    icon: 'FileSpreadsheet',
    descripcion: 'Lo que se informa hacia arriba.',
    subtipos: [
      'Informes mensuales de actividades',
      'Informes de eventos realizados',
      'Estadísticas: cantidad de participantes, etc.',
      'Fotos como evidencia del informe'
    ]
  },
  { 
    key: 'PLANIFICACIÓN', 
    label: '9. Planificación', 
    code: 'PLA', 
    icon: 'Layers',
    descripcion: 'Lo que se va a hacer.',
    subtipos: [
      'Planificación anual y trimestral',
      'Calendario de actividades',
      'Distribución de tareas por persona',
      'Metas y evaluación'
    ]
  },
  { 
    key: 'REGISTRO', 
    label: '10. Registros y Control Diario', 
    code: 'REG', 
    icon: 'ClipboardCheck',
    descripcion: 'Control diario de la oficina.',
    subtipos: [
      'Libro de registro de entrada/salida de documentación',
      'Registro de personas que usaron el archivo',
      'Registro de llamadas o visitas importantes',
      'Registro de entrega de materiales'
    ]
  },
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-admin-almada',
    username: '49993070',
    passwordPin: '49993070',
    name: 'Almada Eduardo Thomas',
    role: 'ADMIN',
    position: 'Coordinador General, Desarrollador Web y Administrador del Centro de Medios y Archivos',
    telefono: '03757-15499930',
    activo: true,
    creadoEn: '2026-10-19T00:00:00Z',
  },
  {
    id: 'user-pablo-gonzalez',
    username: 'pablo.gonzalez',
    passwordPin: '1234',
    name: 'Pablo González',
    role: 'CARGADOR_DATOS',
    assignedArea: 'TECNOLOGÍA Y MEDIOS',
    position: 'Equipo Fundador Centro de Medios y Archivos • Registro y Muebles',
    telefono: '03757-15433211',
    activo: true,
    creadoEn: '2026-10-19T00:00:00Z',
  },
  {
    id: 'user-renzo-vazquez',
    username: 'renzo.vazquez',
    passwordPin: '1234',
    name: 'Renzo Vázquez',
    role: 'CARGADOR_DATOS',
    assignedArea: 'TECNOLOGÍA Y MEDIOS',
    position: 'Equipo Fundador Centro de Medios y Archivos • Producción Técnica y Audiovisual',
    telefono: '03757-15433212',
    activo: true,
    creadoEn: '2026-10-19T00:00:00Z',
  },
  {
    id: 'user-demian',
    username: 'demian',
    passwordPin: '1234',
    name: 'Demian',
    role: 'CARGADOR_DATOS',
    assignedArea: 'TECNOLOGÍA Y MEDIOS',
    position: 'Equipo Fundador Centro de Medios y Archivos • Archivo y Custodia de Equipos',
    telefono: '03757-15433213',
    activo: true,
    creadoEn: '2026-10-19T00:00:00Z',
  },
  {
    id: 'user-ezequiel-villalba',
    username: 'ezequiel.villalba',
    passwordPin: '1234',
    name: 'Ezequiel Villalba',
    role: 'CARGADOR_DATOS',
    assignedArea: 'DEPORTES Y ACCIÓN SOCIAL',
    position: 'Coordinador de Deportes y Acción Social',
    telefono: '03757-15421001',
    activo: true,
    creadoEn: '2024-01-10T10:00:00Z',
  },
  {
    id: 'user-micaela',
    username: 'micaela',
    passwordPin: '1234',
    name: 'Micaela',
    role: 'CARGADOR_DATOS',
    assignedArea: 'DEPORTES Y ACCIÓN SOCIAL',
    position: 'Tallerista y Referente de Acción Social',
    telefono: '03757-15421002',
    activo: true,
    creadoEn: '2024-01-10T10:00:00Z',
  },
  {
    id: 'user-cami-rodriguez',
    username: 'cami.rodriguez',
    passwordPin: '1234',
    name: 'Cami Rodríguez',
    role: 'CARGADOR_DATOS',
    assignedArea: 'CULTURA Y EVENTOS',
    position: 'Gestión Cultural y Producción de Eventos',
    telefono: '03757-15510203',
    activo: true,
    creadoEn: '2024-01-12T10:00:00Z',
  },
  {
    id: 'user-mariel-rozas',
    username: 'mariel.rozas',
    passwordPin: '1234',
    name: 'Mariel Rozas 👑',
    role: 'SECRETARIO',
    assignedArea: 'CULTURA Y EVENTOS',
    position: 'Secretaria de Cultura y Muestras Artísticas',
    telefono: '03757-15510204',
    activo: true,
    creadoEn: '2024-01-12T10:00:00Z',
  },
  {
    id: 'user-marcos-monzon',
    username: 'marcos.monzon',
    passwordPin: '1234',
    name: 'Marcos Monzon',
    role: 'CARGADOR_DATOS',
    assignedArea: 'AMBIENTE Y PROTECCIÓN ANIMAL',
    position: 'Encargado de Ambiente y Huella Verde',
    telefono: '03757-15630304',
    activo: true,
    creadoEn: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-santi',
    username: 'santi',
    passwordPin: '1234',
    name: 'Santi',
    role: 'SOLICITANTE',
    assignedArea: 'AMBIENTE Y PROTECCIÓN ANIMAL',
    position: 'Brigada Verde y Logística de Rescate Animal',
    telefono: '03757-15630305',
    activo: true,
    creadoEn: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-celine-rodriguez',
    username: 'celine.rodriguez',
    passwordPin: '1234',
    name: 'Celine Rodriguez',
    role: 'CARGADOR_DATOS',
    assignedArea: 'PRENSA, REDES Y COMUNICACIÓN',
    position: 'Diseño Gráfico, Prensa y Difusión Digital',
    telefono: '03757-15740405',
    activo: true,
    creadoEn: '2024-01-18T10:00:00Z',
  },
  {
    id: 'user-visitante-comunidad',
    username: 'visitante',
    passwordPin: '1234',
    name: 'Consulta Comunitaria / Vecinos',
    role: 'VISITANTE',
    position: 'Consulta Pública de Talleres y Cartelera',
    activo: true,
    creadoEn: '2024-01-01T00:00:00Z',
  },
];

export const INITIAL_SHELVES: OfficeShelf[] = [
  {
    id: 'shelf-1',
    numero: 1,
    nombre: 'Estante 1 - Coordinación General y Resoluciones',
    ubicacion: 'Sede Central - Sector Administrativo A',
    descripcion: 'Contiene los folios oficiales de reuniones, resoluciones, inventario patrimonial y proyectos centrales.',
    capacidadCarpetas: 15,
    foliosAsignados: ['Actas y reuniones', 'Inventario', 'Eventos', 'Carteles', 'Proyectos'],
    creadoEn: '2024-01-01',
  },
  {
    id: 'shelf-2',
    numero: 2,
    nombre: 'Estante 2 - Finanzas, Planificación y Registros',
    ubicacion: 'Sede Central - Sector Administrativo B',
    descripcion: 'Archivador seguro de facturación, balance contable, libro de entradas/salidas y planificación anual.',
    capacidadCarpetas: 15,
    foliosAsignados: ['Notas y resolucion', 'Presupuesto recaudacion y balance', 'Informe', 'Planificacion', 'Registro'],
    creadoEn: '2024-01-01',
  },
  {
    id: 'shelf-3',
    numero: 3,
    nombre: 'Estante 3 - Áreas Operativas Comunitarias',
    ubicacion: 'Sede Central - Acceso Operativo',
    descripcion: 'Resguardo de planillas de deportes, acción comunitaria, cultura, ambiente Huella Verde y medios de comunicación.',
    capacidadCarpetas: 15,
    foliosAsignados: ['Deportes', 'Accion social', 'Cultura y eventos', 'Ambiente y proteccion animal', 'Prensa redes y comunicacion'],
    creadoEn: '2024-01-01',
  },
];

// All fictitious and mock sample data cleared cleanly for operational use
export const INITIAL_DOCUMENTS: ArchiveDocument[] = [];
export const INITIAL_KIDS: KidProfile[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];
export const INITIAL_LOANS: MaterialLoan[] = [];
export const INITIAL_REQUESTS: AreaRequest[] = [];
export const INITIAL_BUDGET: BudgetRecord[] = [];
export const INITIAL_EVENTS: OfficeEvent[] = [];
export const INITIAL_INSTITUTIONAL_INVENTORY: InstitutionalInventoryItem[] = [];
export const INITIAL_AREA_ACTAS: AreaActa[] = [];
export const INITIAL_NOTICES: OfficeNotice[] = [];
export const INITIAL_INSCRIPTION_FORMS: AreaInscriptionForm[] = [];
export const INITIAL_INSCRIPTION_SUBMISSIONS: InscriptionSubmission[] = [];
