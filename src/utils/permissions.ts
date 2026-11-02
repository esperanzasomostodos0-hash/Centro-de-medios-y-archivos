import { UserProfile, OfficeFolioCategory, ArchiveDocument, OperativeArea } from '../types';

/**
 * Role-Based Access Control (RBAC) & Segregation of Duties for the Office
 * 
 * Reglas Institucionales de Puerto Esperanza:
 * 1. ADMIN Y COORDINADOR GENERAL (Almada Eduardo Thomas, 49993070):
 *    - Acceso total: Puede hacer todo, borrar todo, editar todo, crear todo y ver todo en toda la app.
 * 2. CARGADOR DE DATOS:
 *    - Puede ver y cargar datos en Inventario de la Sede.
 *    - Puede ver y cargar datos a los estantes físicos y 15 folios.
 *    - Puede ver la planilla de inscriptos en Convocatorias.
 *    - Puede ver y gestionar el Archivo documental.
 *    - Puede ver la lista completa de Niñez e inscribir.
 *    - Puede ver todos los préstamos y el apartado completo de préstamos.
 *    - Puede ver y gestionar Pedidos de materiales.
 *    - Puede agregar, editar y eliminar fechas en el Calendario.
 *    - Puede ver el QR de Estante.
 * 3. SECRETARIO / ENCARGADO:
 *    - No ve folios, no ve archivo, no ve inventario sede, no ve estantes, no ve pedidos, no ve QR.
 *    - En Niñez: NO ve la lista global de niños, solo puede inscribir a niños a eventos de su área.
 *    - En Préstamos: Solo puede pedir insumos y ver su propio historial.
 *    - En Convocatorias: Puede ver convocatorias e inscribir, pero NO ve la planilla de inscriptos.
 * 4. SOLICITANTE:
 *    - Puede pedir materiales y ver su propio historial de préstamos.
 *    - Puede consultar avisos, cartelera y convocatorias públicas.
 * 5. VISITANTE:
 *    - NO puede ver los folios ni los estantes.
 *    - Solo ve Inicio, Avisos, Cartelera pública y Convocatorias (sin planilla de inscriptos).
 */

export const isAdmin = (user?: UserProfile | null): boolean => {
  return user?.role === 'ADMIN';
};

export const isCargadorDatosOrAdmin = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'CARGADOR_DATOS';
};

export const isSecretarioOrAdmin = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'SECRETARIO';
};

/**
 * Tab-level authorization
 */
export const canUserAccessTab = (user: UserProfile, tabId: string): boolean => {
  // 1. Admin / Coordinador General: tiene TODOS pero TODOS los apartados
  if (user.role === 'ADMIN') return true;

  // 2. Home e Inicio: accesible para todos
  if (tabId === 'home') return true;

  // 3. Exclusivo Coordinador General (Admin)
  if (tabId === 'users' || tabId === 'budget') {
    return false;
  }

  // 4. Folios y Estantes: NO para Visitantes. Solo Cargador de Datos y Admin
  if (tabId === 'shelves') {
    return user.role === 'CARGADOR_DATOS';
  }

  // 5. Inventario de la Sede: Solo Cargador de Datos y Admin
  if (tabId === 'institutional_inventory') {
    return user.role === 'CARGADOR_DATOS';
  }

  // 6. Gestión de Estantes Físicos: Solo Cargador de Datos y Admin
  if (tabId === 'shelves_mgmt') {
    return user.role === 'CARGADOR_DATOS';
  }

  // 7. Archivo Documental: Solo Cargador de Datos y Admin
  if (tabId === 'documents') {
    return user.role === 'CARGADOR_DATOS';
  }

  // 8. Pedidos de Materiales: Solo Cargador de Datos y Admin
  if (tabId === 'requests') {
    return user.role === 'CARGADOR_DATOS';
  }

  // 9. QR de Estante: Solo Cargador de Datos y Admin
  if (tabId === 'qr_lookup') {
    return user.role === 'CARGADOR_DATOS';
  }

  // 10. Niñez: Solo Cargador de Datos, Admin y Secretario (Secretario en modo restringido sin lista)
  if (tabId === 'kids') {
    return user.role === 'CARGADOR_DATOS' || user.role === 'SECRETARIO';
  }

  // 11. Convocatorias: Todos pueden verlas
  if (tabId === 'inscriptions') {
    return true;
  }

  // 12. Préstamos: Todos pueden acceder (restringido a su propio historial para no-cargadores)
  if (tabId === 'inventory') {
    return true;
  }

  // 13. Calendario: Todos pueden ver el calendario
  if (tabId === 'calendar') {
    return true;
  }

  // 14. Avisos y Alertas: Todos pueden ver los avisos
  if (tabId === 'notices') {
    return true;
  }

  // 15. Mi Área: Solo para usuarios con área asignada (Visitante no tiene área)
  if (tabId === 'my_area') {
    return user.role !== 'VISITANTE' && Boolean(user.assignedArea);
  }

  return false;
};

/**
 * Permission helpers for granular view behaviors
 */

// Calendario: agregar, editar y eliminar fechas solo Cargador de Datos y Admin
export const canUserManageCalendar = (user?: UserProfile | null): boolean => {
  return isCargadorDatosOrAdmin(user);
};

// Convocatorias: la planilla de inscriptos solo la ve el Cargador de Datos y Admin
export const canUserViewInscriptionSubmissions = (user?: UserProfile | null): boolean => {
  return isCargadorDatosOrAdmin(user);
};

// Niñez: la lista general solo la ve Cargador de Datos y Admin. Secretario solo inscribe a eventos de área.
export const canUserViewFullKidsList = (user?: UserProfile | null): boolean => {
  return isCargadorDatosOrAdmin(user);
};

// Préstamos: todos los pedidos y el apartado completo solo lo ve Cargador de Datos y Admin
export const canUserViewAllLoans = (user?: UserProfile | null): boolean => {
  return isCargadorDatosOrAdmin(user);
};

// Inventario Sede: ver y cargar datos solo Cargador de Datos y Admin
export const canUserManageInstitutionalInventory = (user?: UserProfile | null): boolean => {
  return isCargadorDatosOrAdmin(user);
};

// Estantes: ver y cargar datos solo Cargador de Datos y Admin
export const canUserManageShelves = (user?: UserProfile | null): boolean => {
  return isCargadorDatosOrAdmin(user);
};

// Borrado definitivo general: solo Admin
export const canUserDeleteAnything = (user?: UserProfile | null): boolean => {
  return isAdmin(user);
};

/**
 * Folios autorizados para el usuario
 */
export const getAllowedFoliosForUser = (user: UserProfile): OfficeFolioCategory[] => {
  if (user.role === 'ADMIN' || user.role === 'CARGADOR_DATOS') {
    return [
      'Actas y reuniones',
      'Inventario',
      'Eventos',
      'Carteles',
      'Proyectos',
      'Notas y resolucion',
      'Presupuesto recaudacion y balance',
      'Informe',
      'Planificacion',
      'Registro',
      'Deportes',
      'Accion social',
      'Cultura y eventos',
      'Ambiente y proteccion animal',
      'Prensa redes y comunicacion',
    ];
  }

  if (user.role === 'VISITANTE') {
    return []; // El visitante no puede ver folios
  }

  // Filtrado por área
  const area = user.assignedArea;
  switch (area) {
    case 'PRENSA, REDES Y COMUNICACIÓN':
      return ['Prensa redes y comunicacion', 'Carteles', 'Eventos', 'Informe', 'Planificacion'];
    case 'DEPORTES Y ACCIÓN SOCIAL':
      return ['Deportes', 'Accion social', 'Eventos', 'Inventario', 'Informe'];
    case 'CULTURA Y EVENTOS':
      return ['Cultura y eventos', 'Eventos', 'Carteles', 'Proyectos', 'Informe'];
    case 'AMBIENTE Y PROTECCIÓN ANIMAL':
      return ['Ambiente y proteccion animal', 'Proyectos', 'Eventos', 'Informe'];
    case 'SALUD Y BIENESTAR':
      return ['Eventos', 'Informe', 'Proyectos', 'Inventario'];
    case 'NIÑEZ Y ADOLESCENCIA':
      return ['Deportes', 'Cultura y eventos', 'Eventos', 'Informe', 'Proyectos'];
    case 'TECNOLOGÍA Y MEDIOS':
      return ['Prensa redes y comunicacion', 'Inventario', 'Proyectos', 'Informe'];
    default:
      return ['Informe', 'Eventos', 'Carteles'];
  }
};

export const canUserAccessFolio = (user: UserProfile, folioName: OfficeFolioCategory): boolean => {
  if (user.role === 'VISITANTE') return false;
  const allowed = getAllowedFoliosForUser(user);
  return allowed.includes(folioName);
};

export const canUserUploadToFolio = (user: UserProfile, folioName: OfficeFolioCategory): boolean => {
  if (user.role === 'VISITANTE') return false;
  if (user.role === 'ADMIN' || user.role === 'CARGADOR_DATOS') return true;
  if (user.role === 'SOLICITANTE') return false;
  return canUserAccessFolio(user, folioName);
};

export const canUserViewDocument = (user: UserProfile, doc: ArchiveDocument): boolean => {
  if (user.role === 'ADMIN' || user.role === 'CARGADOR_DATOS') return true;
  if (user.role === 'VISITANTE') return false; // El archivo no lo ve el visitante
  if (doc.visibilidad === 'Público') return true;
  return doc.areaOperativa === user.assignedArea;
};

export const canUserEditDocument = (user: UserProfile, doc: ArchiveDocument): boolean => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'CARGADOR_DATOS' && (doc.areaOperativa === user.assignedArea || !doc.areaOperativa)) {
    return true;
  }
  return false;
};

export const canUserDeleteDocument = (user: UserProfile): boolean => {
  return user.role === 'ADMIN';
};
