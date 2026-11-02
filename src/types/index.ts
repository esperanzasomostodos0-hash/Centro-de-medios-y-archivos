export type OperativeArea = 
  | 'DEPORTES Y ACCIÓN SOCIAL'
  | 'CULTURA Y EVENTOS'
  | 'AMBIENTE Y PROTECCIÓN ANIMAL'
  | 'PRENSA, REDES Y COMUNICACIÓN'
  | 'SALUD Y BIENESTAR'
  | 'NIÑEZ Y ADOLESCENCIA'
  | 'TECNOLOGÍA Y MEDIOS';

export type AdministrativeType =
  | 'ACTAS Y REUNIONES'
  | 'INVENTARIO'
  | 'EVENTOS'
  | 'CARTELES'
  | 'PROYECTOS'
  | 'NOTAS Y RESOLUCIONES'
  | 'PRESUPUESTO, RECAUDACIÓN Y BALANCE'
  | 'INFORME'
  | 'PLANIFICACIÓN'
  | 'REGISTRO';

export type OfficeFolioCategory =
  | 'Actas y reuniones'
  | 'Inventario'
  | 'Eventos'
  | 'Carteles'
  | 'Proyectos'
  | 'Notas y resolucion'
  | 'Presupuesto recaudacion y balance'
  | 'Informe'
  | 'Planificacion'
  | 'Registro'
  | 'Deportes'
  | 'Accion social'
  | 'Cultura y eventos'
  | 'Ambiente y proteccion animal'
  | 'Prensa redes y comunicacion';

export interface OfficeFolioInfo {
  id: string;
  name: OfficeFolioCategory;
  estanteDefault: string;
  color: string;
  icon: string;
  descripcion: string;
  categoriaTipo: 'ADMINISTRATIVO' | 'OPERATIVO';
}

export type UserRole = 
  | 'ADMIN' 
  | 'SECRETARIO'
  | 'CARGADOR_DATOS' 
  | 'SOLICITANTE' 
  | 'VISITANTE';

export interface UserProfile {
  id: string;
  username: string; // e.g. "49993070" for Almada Eduardo Thomas
  passwordPin: string; // PIN / password for office access
  name: string;
  role: UserRole;
  assignedArea?: OperativeArea; // Required for CARGADOR_DATOS & SOLICITANTE
  position: string;
  telefono?: string;
  activo: boolean;
  creadoEn: string;
}

export interface ArchiveDocument {
  id: string;
  codigoFolio: string; // e.g. "FOLIO-ACT-2024-001"
  titulo: string;
  folioNombre?: OfficeFolioCategory; // uno de los 15 folios de los estantes
  numeroHoja?: string; // e.g. "Hoja 01", "Folio 12"
  areaOperativa: OperativeArea;
  tipoAdministrativo: AdministrativeType;
  subtipoDetalle?: string; // Sub-item from WhatsApp list
  anio: number;
  estanteFisico: string; // e.g. "Estante 1 - Balda A"
  fecha: string;
  autor: string;
  descripcion: string;
  soporteFisico: 'Original Manuscrito' | 'Planilla Impresa' | 'Expediente Cosido' | 'Carpeta Colgante' | 'Fotografía Papel' | 'Afiche / Cartel';
  visibilidad: 'Público' | 'Uso Interno' | 'Confidencial Coordinación';
  fotoUrl?: string; // Foto escaneada / digitalizada del papel
  chicosVinculados?: string[]; // IDs de fichas
  etiquetas: string[];
  creadoEn: string;
}

export interface KidProfile {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  tutorNombre: string;
  tutorParentesco: string;
  tutorTelefono: string;
  direccion: string;
  autorizacionFirmada: boolean;
  folioAutorizacion?: string;
  areasParticipa: OperativeArea[];
  talleresActuales: string[];
  alergiasMedicas: string;
  fechaInscripcion: string;
  asistenciasMes: number;
  estado: 'Activo' | 'En Pausa' | 'Egresado';
  fotoUrl?: string;
  notas: string;
}

export interface InventoryItem {
  id: string;
  codigo: string;
  nombre: string;
  areaOperativa: OperativeArea;
  categoria: string;
  stockTotal: number;
  stockDisponible: number;
  estanteUbicacion: string;
  estadoConservacion: 'Excelente' | 'Bueno' | 'Regular' | 'A Reparar';
  valorEstimado?: number;
  observaciones: string;
}

export interface MaterialLoan {
  id: string;
  itemId: string;
  itemNombre: string;
  areaOperativa: OperativeArea;
  cantidad: number;
  actividadDestino?: string; // Para qué actividad o producción se retira (Sec. 7.3)
  accesoriosIncluidos?: string; // e.g. "Cables, baterías, memoria SD 64GB"
  solicitanteNombre: string;
  solicitanteDni: string;
  solicitanteTelefono: string;
  fechaPrestamo: string;
  fechaDevolucionPactada: string;
  fechaDevolucionReal?: string;
  estado: 'En Curso' | 'Devuelto' | 'Atrasado';
  estadoDevolucionCondiciones?: string; // En qué condiciones regresa
  firmaRetiroUrl: string; // data URL base64
  firmaDevolucionUrl?: string; // data URL base64
  observacionesSalida: string;
  observacionesDevolucion?: string;
}

export interface AreaRequest {
  id: string;
  codigo: string;
  areaSolicitante: OperativeArea;
  tipoSolicitud: 'Material de Inventario' | 'Diseño e Impresión Cartel' | 'Partida Presupuestaria' | 'Uso de Espacio / Salón' | 'Equipamiento Técnico';
  solicitanteNombre: string;
  fechaSolicitud: string;
  urgencia: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  descripcion: string;
  cantidadEstimada?: string;
  estado: 'Pendiente' | 'Aprobado' | 'Entregado' | 'Rechazado';
  respuestaAdmin?: string;
  fechaRespuesta?: string;
}

export interface BudgetRecord {
  id: string;
  fecha: string;
  tipo: 'Ingreso' | 'Gasto';
  categoria: 'Partida Institucional Central' | 'Fondo Cooperador Comunitario' | 'Compra Insumos Deporte' | 'Materiales Cultura y Arte' | 'Botiquín e Higiene' | 'Hardware y Conectividad' | 'Refrigerio Talleres' | 'Impresión y Carteles Difusión' | 'Ambiente y Rescate Animal';
  areaOperativa: OperativeArea | 'GENERAL';
  concepto: string;
  monto: number;
  folioComprobante: string;
  estanteFactura: string;
  aprobadoPor: string;
}

export interface OfficeEvent {
  id: string;
  titulo: string;
  areaOperativa: OperativeArea;
  fecha: string;
  hora: string;
  lugar: string;
  descripcion: string;
  responsable: string;
  esPublico: boolean;
  aficheUrl?: string;
  participantesEsperados: number;
}

// Custom Physical Shelves in the Office
export interface OfficeShelf {
  id: string;
  numero: number;
  nombre: string;
  ubicacion: string; // e.g. "Sede Central - Pared Norte"
  descripcion: string;
  capacidadCarpetas: number;
  foliosAsignados: OfficeFolioCategory[];
  creadoEn: string;
}

export type TitularidadBien = 
  | 'Propiedad Institucional (Sede)'
  | 'Material Prestado por Integrante'
  | 'Custodia Temporal (en Tránsito)';

// Institutional Inventory (Sede Central + Espacio Esperanza Somos Todos + Centro de Medios)
export interface InstitutionalInventoryItem {
  id: string;
  codigo: string; // e.g. "INV-ESP-2024-001"
  articulo: string;
  marcaYModelo?: string; // e.g. "Sony A6400 / Micrófono Rode"
  accesoriosAsociados?: string; // e.g. "Cables, baterías, memoria SD 64GB, bolso"
  titularidad?: TitularidadBien;
  propietarioOPrestador?: string; // Si es prestado por un integrante
  responsableCustodia?: string; // Persona responsable de su resguardo
  personaQueInventaria: string;
  dia: string; // e.g. "Lunes", "Martes"
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  espacioUbicacion: 'SEDE CENTRAL' | 'ESPACIO ESPERANZA SOMOS TODOS' | 'GALPÓN TALLERES' | 'CANCHA / EXTERIOR';
  estanteAsignado?: string;
  areaAsignada: OperativeArea | 'GENERAL INSTITUCIONAL';
  categoria: 'Deportes' | 'Audio y Tecnología' | 'Mobiliario' | 'Arte y Pinturas' | 'Sanidad y Rescate' | 'Herramientas' | 'Cámaras y Prensa' | 'Varios';
  cantidad: number;
  estado: 'Excelente' | 'Bueno' | 'Regular' | 'A Reparar' | 'Baja';
  observaciones: string;
  registradoPorUsuario: string;
}

// Key Custody and Office Security (Section 10)
export interface KeyCustodyLog {
  id: string;
  fecha: string;
  hora: string;
  responsableNombre: string;
  accion: 'Apertura de Oficina' | 'Cierre y Bloqueo de Oficina' | 'Traspaso de Llave' | 'Revisión de Seguridad y Candados';
  observaciones: string;
  llaveEstado: 'En Custodia de Almada' | 'En Custodia de Pablo' | 'En Custodia de Renzo' | 'En Custodia de Demian' | 'En Tablero Seguro';
}

// Safe Box and Values Custody (Section 11 - Propiedad de Almada Eduardo Thomas facilitada en préstamo)
export interface SafeBoxRecord {
  id: string;
  tipoMovimiento: 'Ingreso de Efectivo' | 'Egreso de Efectivo' | 'Guarda de Elemento de Valor' | 'Retiro de Elemento de Valor';
  concepto: string; // e.g. "Recaudación de Evento", "Tarjetas de memoria master", "Dinero de inscripciones"
  montoEfectivo?: number;
  elementoValorDetalle?: string;
  responsableEntrega: string;
  responsableRecepcion: string;
  autorizadoPor: string;
  fecha: string;
  hora: string;
  comprobanteRef?: string;
  estado: 'En Custodia' | 'Entregado / Rendido';
  observaciones: string;
}

// 6 Implementation Stages (Section 19)
export interface ImplementationStage {
  id: number;
  numero: string;
  titulo: string;
  acciones: string[];
  estado: 'Pendiente' | 'En Progreso' | 'Completada';
  responsables: string[];
  progresoPorcentaje: number;
}

// Official Institutional Evaluation Certificate (Section 25)
export interface InstitutionalEvaluationConstancia {
  fechaRecepcion: string;
  autoridadReceptora: string;
  decision: 'Pendiente de evaluación' | 'Aprobada' | 'Aprobada con modificaciones o condiciones' | 'No aprobada';
  condicionesAcordadas: string;
  observaciones: string;
  firmaAutoridadUrl?: string;
  fechaResolucion?: string;
}

// Area Actas & Sessions
export interface AreaActa {
  id: string;
  codigo: string; // e.g. "ACT-DEP-2024-01"
  areaOperativa: OperativeArea;
  titulo: string;
  fecha: string;
  horaInicio: string;
  lugar: string;
  temarioOrdenDelDia: string;
  participantesPresentes: string[];
  acuerdosYResoluciones: string;
  redactadaPor: string;
  firmadaPorAdmin: boolean;
  adjuntoFotoUrl?: string;
  creadaEn: string;
}

export interface NoticeReadReceipt {
  userId: string;
  userName: string;
  leidoEn: string;
}

// Admin Notices and Alerts to Users
export interface OfficeNotice {
  id: string;
  titulo: string;
  mensaje: string;
  nivel: 'INFO' | 'IMPORTANTE' | 'URGENTE';
  areaDestino: OperativeArea | 'TODAS';
  destinatarioTipo?: 'TODOS' | 'AREA' | 'INDIVIDUAL' | 'SELECCIONADOS';
  destinatariosIds?: string[];
  destinatariosNombres?: string[];
  leidoPor?: NoticeReadReceipt[];
  urgente?: boolean;
  creadoPor: string;
  fecha: string;
  hora: string;
  activo: boolean;
}

// Area Inscription Forms (Torneos de fútbol, hockey, show de talentos, etc.)
export interface AreaInscriptionForm {
  id: string;
  areaOperativa: OperativeArea;
  titulo: string; // e.g. "Ficha de inscripción por equipo - Torneo de Fútbol 7"
  deporteOActividad: string; // e.g. "Fútbol", "Hockey", "Talentos Artísticos", "Pintura"
  nombreEvento: string; // e.g. "Copa Esperanza 2024"
  fechaEvento: string;
  lugarEvento: string;
  montoInscripcion: number; // 0 for free
  descripcion: string;
  habilitada: boolean; // Admin can enable/disable
  maxEquipos?: number;
  creadaPor: string;
  creadaEn: string;
}

export interface InscriptionSubmission {
  id: string;
  formId: string;
  nombreEquipo: string;
  areaOperativa: OperativeArea;
  categoriaODivision: string;
  nombreDelegadoOEncargado: string;
  dniDelegado: string;
  telefonoDelegado: string;
  numeroParticipantes: number;
  montoAbonado: number;
  estadoPago: 'Pendiente' | 'Abonado' | 'Exento';
  comprobanteFolio?: string;
  fechaInscripcion: string;
  notas: string;
}
