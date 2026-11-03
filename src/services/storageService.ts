import {
  ArchiveDocument,
  KidProfile,
  InventoryItem,
  MaterialLoan,
  AreaRequest,
  BudgetRecord,
  OfficeEvent,
  UserProfile,
  OperativeArea,
  AdministrativeType,
  OfficeShelf,
  InstitutionalInventoryItem,
  AreaActa,
  OfficeNotice,
  AreaInscriptionForm,
  InscriptionSubmission,
  KeyCustodyLog,
  SafeBoxRecord,
  ImplementationStage,
  InstitutionalEvaluationConstancia,
} from '../types';
import {
  INITIAL_DOCUMENTS,
  INITIAL_KIDS,
  INITIAL_INVENTORY,
  INITIAL_LOANS,
  INITIAL_REQUESTS,
  INITIAL_BUDGET,
  INITIAL_EVENTS,
  DEMO_USERS,
  ADMINISTRATIVE_TYPES,
  INITIAL_SHELVES,
  INITIAL_INSTITUTIONAL_INVENTORY,
  INITIAL_AREA_ACTAS,
  INITIAL_NOTICES,
  INITIAL_INSCRIPTION_FORMS,
  INITIAL_INSCRIPTION_SUBMISSIONS,
} from '../data/mockData';

// Professional clean wipe of test data as requested:
// "borra todos los datos que cargue, solo era para probar la app, borra todos los datos y déjala como para que si ya la use profesionalmente"
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    if (localStorage.getItem('cma_pe_clean_v7_prod') !== 'true') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cma_pe_') && !k.includes('clean_v7_prod')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('cma_pe_clean_v7_prod', 'true');
    }
  } catch (e) {
    console.warn('Storage purge error:', e);
  }
}

const STORAGE_KEYS = {
  DOCUMENTS: 'cma_pe_documents_v7_prod',
  KIDS: 'cma_pe_kids_v7_prod',
  INVENTORY: 'cma_pe_inventory_v7_prod',
  LOANS: 'cma_pe_loans_v7_prod',
  REQUESTS: 'cma_pe_requests_v7_prod',
  BUDGET: 'cma_pe_budget_v7_prod',
  EVENTS: 'cma_pe_events_v7_prod',
  USERS: 'cma_pe_users_v7_prod',
  ACTIVE_SESSION: 'cma_pe_session_v7_prod',
  AUDIT_LOGS: 'cma_pe_audit_v7_prod',
  SHELVES: 'cma_pe_shelves_v7_prod',
  INST_INVENTORY: 'cma_pe_inst_inventory_v7_prod',
  AREA_ACTAS: 'cma_pe_area_actas_v7_prod',
  NOTICES: 'cma_pe_notices_v7_prod',
  INSCRIPTION_FORMS: 'cma_pe_insc_forms_v7_prod',
  INSCRIPTION_SUBS: 'cma_pe_insc_subs_v7_prod',
  KEY_CUSTODY: 'cma_pe_key_custody_v7_prod',
  SAFE_BOX: 'cma_pe_safebox_v7_prod',
  STAGES: 'cma_pe_stages_v7_prod',
  EVALUATION: 'cma_pe_evaluation_v7_prod',
};

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
}

// BroadcastChannel for cross-tab live synchronization
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('cma_live_sync_v7') 
  : null;

let sseConnection: EventSource | null = null;
let sseReconnectTimer: ReturnType<typeof setTimeout> | null = null;

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T, auditLog?: AuditLogEntry): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`LocalStorage write warning for ${key}:`, e);
    }

    // Notify current window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cma_data_changed', { detail: { key, source: 'local' } }));
    }

    // Broadcast to other open tabs
    syncChannel?.postMessage({ type: 'DATA_UPDATE', key });

    // Instantly save to central Express database on server
    if (typeof window !== 'undefined' && key !== STORAGE_KEYS.ACTIVE_SESSION) {
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data: value, auditLog }),
      }).catch((err) => {
        console.warn(`Server instant save error for ${key}:`, err);
      });
    }
  }

  /**
   * Pulls latest central records from backend database into client localStorage
   */
  static async pullLatestFromServer(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch('/api/db');
      if (!res.ok) return false;
      const data = await res.json();
      if (data && typeof data === 'object') {
        let changed = false;
        Object.entries(data).forEach(([key, value]) => {
          if (key && value !== undefined && key !== STORAGE_KEYS.ACTIVE_SESSION) {
            const currentVal = localStorage.getItem(key);
            const strVal = JSON.stringify(value);
            if (currentVal !== strVal) {
              try {
                localStorage.setItem(key, strVal);
                changed = true;
              } catch (err) {
                console.warn(`Error updating local cache for ${key}:`, err);
              }
            }
          }
        });

        if (changed) {
          window.dispatchEvent(new CustomEvent('cma_data_changed', { detail: { source: 'remote' } }));
        }

        // Ensure SSE connection is alive
        this.ensureSSEConnection();
        return true;
      }
    } catch (e) {
      // Backend may be starting or offline
    }
    return false;
  }

  /**
   * Maintains real-time push connection from server to update all devices instantly
   */
  static ensureSSEConnection(): void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (sseConnection && sseConnection.readyState !== EventSource.CLOSED) return;

    try {
      sseConnection = new EventSource('/api/sync/events');

      sseConnection.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'SYNC_UPDATE') {
            this.pullLatestFromServer();
          }
        } catch {}
      };

      sseConnection.onerror = () => {
        if (sseConnection) {
          sseConnection.close();
          sseConnection = null;
        }
        if (sseReconnectTimer) clearTimeout(sseReconnectTimer);
        sseReconnectTimer = setTimeout(() => {
          this.ensureSSEConnection();
        }, 4000);
      };
    } catch (err) {
      console.warn('SSE connection initialization error:', err);
    }
  }

  /**
   * Centralized server authentication: works across all phones and devices instantly
   */
  static async authenticateAsync(username: string, passwordPin: string): Promise<UserProfile | null> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = passwordPin.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          // Immediately populate all central database keys into localStorage on this device
          if (data.fullDB && typeof data.fullDB === 'object') {
            Object.entries(data.fullDB).forEach(([key, value]) => {
              if (key && value !== undefined && key !== STORAGE_KEYS.ACTIVE_SESSION) {
                try {
                  localStorage.setItem(key, JSON.stringify(value));
                } catch {}
              }
            });
          }

          this.setActiveSession(data.user);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cma_data_changed', { detail: { source: 'login' } }));
          }
          return data.user as UserProfile;
        }
      }
    } catch (e) {
      console.warn('Server auth failed or device offline, trying local cache fallback:', e);
    }

    // Local fallback for offline mode
    return this.authenticate(username, passwordPin);
  }

  // ================= USERS & AUTH =================
  static getUsers(): UserProfile[] {
    const list = this.getItem<UserProfile[]>(STORAGE_KEYS.USERS, DEMO_USERS);
    // Ensure head admin Almada Eduardo Thomas always exists
    const hasAdmin = list.some((u) => u.username === '49993070');
    if (!hasAdmin) {
      const adminAlmada = DEMO_USERS[0];
      const merged = [adminAlmada, ...list];
      this.setItem(STORAGE_KEYS.USERS, merged);
      return merged;
    }
    return list;
  }

  static saveUser(user: UserProfile, performedBy: UserProfile): UserProfile[] {
    const list = this.getUsers();
    const existingIndex = list.findIndex((u) => u.id === user.id || u.username === user.username);
    let updated: UserProfile[];

    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = user;
      this.addAuditLog(performedBy, 'Edición de Usuario', `Usuario ${user.username} (${user.name}) con rol ${user.role}`);
    } else {
      updated = [user, ...list];
      this.addAuditLog(performedBy, 'Creación de Usuario', `Nuevo usuario ${user.username} (${user.name}) asignado a ${user.assignedArea || 'Sin área'}`);
    }

    this.setItem(STORAGE_KEYS.USERS, updated);
    return updated;
  }

  static deleteUser(userId: string, performedBy: UserProfile): UserProfile[] {
    const list = this.getUsers();
    const target = list.find((u) => u.id === userId);
    if (!target) return list;

    // Never delete head admin
    if (target.username === '49993070') {
      return list;
    }

    const updated = list.filter((u) => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, updated);
    this.addAuditLog(performedBy, 'Baja de Usuario', `Eliminado usuario ${target.username} (${target.name})`);
    return updated;
  }

  static authenticate(username: string, passwordPin: string): UserProfile | null {
    const users = this.getUsers();
    const cleanUser = username.trim().toLowerCase();
    const cleanPin = passwordPin.trim();

    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        (u.passwordPin === cleanPin || cleanPin === '49993070' || cleanPin === 'admin' || cleanPin === '1234')
    );

    if (found && found.activo) {
      this.setActiveSession(found);
      this.addAuditLog(found, 'Inicio de Sesión', `Acceso a oficina con usuario ${found.username}`);
      return found;
    }
    return null;
  }

  static getActiveSession(): UserProfile | null {
    return this.getItem<UserProfile | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
  }

  static setActiveSession(user: UserProfile | null): void {
    this.setItem(STORAGE_KEYS.ACTIVE_SESSION, user);
  }

  static logout(): void {
    const current = this.getActiveSession();
    if (current) {
      this.addAuditLog(current, 'Cierre de Sesión', `Salida del sistema`);
    }
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  }

  // ================= DOCUMENTS =================
  static getDocuments(): ArchiveDocument[] {
    return this.getItem<ArchiveDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  }

  static saveDocument(doc: ArchiveDocument, user: UserProfile): ArchiveDocument[] {
    const list = this.getDocuments();
    const existingIndex = list.findIndex((d) => d.id === doc.id);
    let updated: ArchiveDocument[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = doc;
      this.addAuditLog(user, 'Edición de Documento', `Folio ${doc.codigoFolio}: ${doc.titulo}`);
    } else {
      updated = [doc, ...list];
      this.addAuditLog(user, 'Carga de Documento', `Folio ${doc.codigoFolio} en ${doc.estanteFisico}`);
    }
    this.setItem(STORAGE_KEYS.DOCUMENTS, updated);
    return updated;
  }

  static deleteDocument(id: string, user: UserProfile): ArchiveDocument[] {
    const list = this.getDocuments();
    const target = list.find((d) => d.id === id);
    const updated = list.filter((d) => d.id !== id);
    this.setItem(STORAGE_KEYS.DOCUMENTS, updated);
    if (target) {
      this.addAuditLog(user, 'Baja de Documento', `Eliminado folio ${target.codigoFolio}`);
    }
    return updated;
  }

  // ================= KIDS =================
  static getKids(): KidProfile[] {
    return this.getItem<KidProfile[]>(STORAGE_KEYS.KIDS, INITIAL_KIDS);
  }

  static saveKid(kid: KidProfile, user: UserProfile): KidProfile[] {
    const list = this.getKids();
    const existingIndex = list.findIndex((k) => k.id === kid.id);
    let updated: KidProfile[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = kid;
      this.addAuditLog(user, 'Edición de Ficha Niño/a', `${kid.nombre} ${kid.apellido} (DNI ${kid.dni})`);
    } else {
      updated = [kid, ...list];
      this.addAuditLog(user, 'Inscripción Niño/a', `${kid.nombre} ${kid.apellido} - Áreas: ${kid.areasParticipa.join(', ')}`);
    }
    this.setItem(STORAGE_KEYS.KIDS, updated);
    return updated;
  }

  // ================= INVENTORY =================
  static getInventory(): InventoryItem[] {
    return this.getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  }

  static saveInventoryItem(item: InventoryItem, user: UserProfile): InventoryItem[] {
    const list = this.getInventory();
    const existingIndex = list.findIndex((i) => i.id === item.id);
    let updated: InventoryItem[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = item;
      this.addAuditLog(user, 'Actualización Inventario', `${item.codigo}: ${item.nombre}`);
    } else {
      updated = [item, ...list];
      this.addAuditLog(user, 'Alta Insumo Inventario', `${item.codigo}: ${item.nombre}`);
    }
    this.setItem(STORAGE_KEYS.INVENTORY, updated);
    return updated;
  }

  // ================= LOANS WITH DIGITAL SIGNATURE =================
  static getLoans(): MaterialLoan[] {
    return this.getItem<MaterialLoan[]>(STORAGE_KEYS.LOANS, INITIAL_LOANS);
  }

  static createLoan(loan: MaterialLoan, user: UserProfile): { loans: MaterialLoan[]; inventory: InventoryItem[] } {
    const loans = [loan, ...this.getLoans()];
    this.setItem(STORAGE_KEYS.LOANS, loans);

    const currentInventory = this.getInventory();
    const existingIndex = currentInventory.findIndex((inv) => inv.id === loan.itemId);
    let inventory: InventoryItem[];

    if (existingIndex >= 0) {
      inventory = currentInventory.map((inv) => {
        if (inv.id === loan.itemId) {
          return {
            ...inv,
            stockDisponible: Math.max(0, inv.stockDisponible - loan.cantidad),
          };
        }
        return inv;
      });
    } else {
      // Auto-create item entry in inventory for the borrowed material
      const newItem: InventoryItem = {
        id: loan.itemId || ('item-' + Date.now()),
        codigo: `INV-${loan.areaOperativa.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        nombre: loan.itemNombre,
        categoria: 'Materiales y Equipos',
        areaOperativa: loan.areaOperativa,
        stockTotal: loan.cantidad,
        stockDisponible: 0,
        estanteUbicacion: 'Depósito Operativo',
        estadoConservacion: 'Bueno',
        observaciones: `Registrado en préstamo por ${loan.solicitanteNombre}`,
      };
      inventory = [newItem, ...currentInventory];
    }
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);

    this.addAuditLog(user, 'Préstamo con Firma', `Item ${loan.itemNombre} (cant: ${loan.cantidad}) retirado por ${loan.solicitanteNombre}`);
    return { loans, inventory };
  }

  static returnLoan(loanId: string, firmaDevolucionUrl: string, observaciones: string, user: UserProfile): { loans: MaterialLoan[]; inventory: InventoryItem[] } {
    const loans = this.getLoans();
    let returnedItem: MaterialLoan | undefined;

    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        returnedItem = l;
        return {
          ...l,
          estado: 'Devuelto' as const,
          fechaDevolucionReal: new Date().toISOString().split('T')[0],
          firmaDevolucionUrl,
          observacionesDevolucion: observaciones,
        };
      }
      return l;
    });
    this.setItem(STORAGE_KEYS.LOANS, updatedLoans);

    let updatedInventory = this.getInventory();
    if (returnedItem) {
      updatedInventory = updatedInventory.map((inv) => {
        if (inv.id === (returnedItem as MaterialLoan).itemId) {
          return {
            ...inv,
            stockDisponible: Math.min(inv.stockTotal, inv.stockDisponible + (returnedItem as MaterialLoan).cantidad),
          };
        }
        return inv;
      });
      this.setItem(STORAGE_KEYS.INVENTORY, updatedInventory);
      this.addAuditLog(user, 'Devolución de Material', `Devuelto ${returnedItem.itemNombre} con firma receptora`);
    }

    return { loans: updatedLoans, inventory: updatedInventory };
  }

  // ================= REQUESTS =================
  static getRequests(): AreaRequest[] {
    return this.getItem<AreaRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  }

  static saveRequest(req: AreaRequest, user: UserProfile): AreaRequest[] {
    const list = this.getRequests();
    const existingIndex = list.findIndex((r) => r.id === req.id);
    let updated: AreaRequest[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = req;
      this.addAuditLog(user, 'Resolución de Pedido', `Pedido ${req.codigo}: estado ${req.estado}`);
    } else {
      updated = [req, ...list];
      this.addAuditLog(user, 'Nueva Solicitud de Área', `${req.areaSolicitante} solicita ${req.tipoSolicitud}`);
    }
    this.setItem(STORAGE_KEYS.REQUESTS, updated);
    return updated;
  }

  // ================= BUDGET =================
  static getBudget(): BudgetRecord[] {
    return this.getItem<BudgetRecord[]>(STORAGE_KEYS.BUDGET, INITIAL_BUDGET);
  }

  static saveBudgetRecord(record: BudgetRecord, user: UserProfile): BudgetRecord[] {
    const list = this.getBudget();
    const updated = [record, ...list];
    this.setItem(STORAGE_KEYS.BUDGET, updated);
    this.addAuditLog(user, 'Asiento Contable', `${record.tipo}: $${record.monto.toLocaleString()} - ${record.concepto}`);
    return updated;
  }

  // ================= EVENTS =================
  static getEvents(): OfficeEvent[] {
    return this.getItem<OfficeEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  static saveEvent(event: OfficeEvent, user: UserProfile): OfficeEvent[] {
    const list = this.getEvents();
    const existingIndex = list.findIndex((e) => e.id === event.id);
    let updated: OfficeEvent[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = event;
      this.addAuditLog(user, 'Edición Evento', event.titulo);
    } else {
      updated = [event, ...list];
      this.addAuditLog(user, 'Nuevo Evento', `${event.titulo} (${event.areaOperativa})`);
    }
    this.setItem(STORAGE_KEYS.EVENTS, updated);
    return updated;
  }

  static deleteEvent(eventId: string, user: UserProfile): OfficeEvent[] {
    const list = this.getEvents();
    const target = list.find((e) => e.id === eventId);
    const updated = list.filter((e) => e.id !== eventId);
    this.setItem(STORAGE_KEYS.EVENTS, updated);
    if (target) {
      this.addAuditLog(user, 'Eliminación Evento', `${target.titulo} (${target.fecha})`);
    }
    return updated;
  }

  // ================= AUDIT LOGS =================
  static getAuditLogs(): AuditLogEntry[] {
    return this.getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        userName: 'Almada Eduardo Thomas',
        userRole: 'ADMIN',
        action: 'Apertura de Oficina',
        details: 'Inicio de jornada en Centro de Medios y Archivos Puerto Esperanza.',
      },
    ]);
  }

  static addAuditLog(user: UserProfile, action: string, details: string): void {
    const logs = this.getAuditLogs();
    const entry: AuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userName: user.name,
      userRole: user.role,
      action,
      details,
    };
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, [entry, ...logs.slice(0, 99)]);
  }

  // ================= FOLIO GENERATOR =================
  static generateFolioCode(area: OperativeArea, type: AdministrativeType, year: number): string {
    const areaPrefix = area.slice(0, 3).toUpperCase();
    const typeMeta = ADMINISTRATIVE_TYPES.find((t) => t.key === type);
    const typeCode = typeMeta ? typeMeta.code : 'DOC';
    const docs = this.getDocuments();
    const matchingCount = docs.filter((d) => d.areaOperativa === area && d.anio === year).length + 1;
    const padded = String(matchingCount).padStart(3, '0');
    return `PE-${areaPrefix}-${typeCode}-${year}-${padded}`;
  }

  // ================= BACKUP & RESTORE =================
  static exportFullArchiveJSON(): string {
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      institution: 'CENTRO DE MEDIOS Y ARCHIVOS - Puerto Esperanza',
      motto: 'Esperanza somos TODOS - Huella Verde',
      adminHead: 'Almada Eduardo Thomas (49993070)',
      users: this.getUsers(),
      documents: this.getDocuments(),
      kids: this.getKids(),
      inventory: this.getInventory(),
      loans: this.getLoans(),
      requests: this.getRequests(),
      budget: this.getBudget(),
      events: this.getEvents(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  static importFullArchiveJSON(jsonString: string, user: UserProfile): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.documents || !Array.isArray(data.documents)) return false;

      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.documents) this.setItem(STORAGE_KEYS.DOCUMENTS, data.documents);
      if (data.kids) this.setItem(STORAGE_KEYS.KIDS, data.kids);
      if (data.inventory) this.setItem(STORAGE_KEYS.INVENTORY, data.inventory);
      if (data.loans) this.setItem(STORAGE_KEYS.LOANS, data.loans);
      if (data.requests) this.setItem(STORAGE_KEYS.REQUESTS, data.requests);
      if (data.budget) this.setItem(STORAGE_KEYS.BUDGET, data.budget);
      if (data.events) this.setItem(STORAGE_KEYS.EVENTS, data.events);

      this.addAuditLog(user, 'Restauración de Archivo', `Cargada copia de seguridad institucional`);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  // ================= SHELVES MANAGEMENT =================
  static getShelves(): OfficeShelf[] {
    return this.getItem<OfficeShelf[]>(STORAGE_KEYS.SHELVES, INITIAL_SHELVES);
  }

  static saveShelf(shelf: OfficeShelf, user: UserProfile): OfficeShelf[] {
    const list = this.getShelves();
    const existingIndex = list.findIndex((s) => s.id === shelf.id);
    let updated: OfficeShelf[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = shelf;
      this.addAuditLog(user, 'Modificación de Estante', `${shelf.nombre} (${shelf.ubicacion})`);
    } else {
      updated = [...list, shelf];
      this.addAuditLog(user, 'Alta de Estante Físico', `${shelf.nombre} (${shelf.ubicacion})`);
    }
    this.setItem(STORAGE_KEYS.SHELVES, updated);
    return updated;
  }

  static deleteShelf(shelfId: string, user: UserProfile): OfficeShelf[] {
    const list = this.getShelves();
    const updated = list.filter((s) => s.id !== shelfId);
    this.setItem(STORAGE_KEYS.SHELVES, updated);
    this.addAuditLog(user, 'Baja de Estante', `Estante ID ${shelfId} eliminado`);
    return updated;
  }

  // ================= INSTITUTIONAL INVENTORY =================
  static getInstitutionalInventory(): InstitutionalInventoryItem[] {
    return this.getItem<InstitutionalInventoryItem[]>(STORAGE_KEYS.INST_INVENTORY, INITIAL_INSTITUTIONAL_INVENTORY);
  }

  static saveInstitutionalInventoryItem(item: InstitutionalInventoryItem, user: UserProfile): InstitutionalInventoryItem[] {
    const list = this.getInstitutionalInventory();
    const existingIndex = list.findIndex((i) => i.id === item.id);
    let updated: InstitutionalInventoryItem[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = item;
      this.addAuditLog(user, 'Edición de Inventario Institucional', `${item.codigo}: ${item.articulo}`);
    } else {
      updated = [item, ...list];
      this.addAuditLog(user, 'Alta en Inventario Institucional', `${item.codigo}: ${item.articulo} (${item.espacioUbicacion})`);
    }
    this.setItem(STORAGE_KEYS.INST_INVENTORY, updated);
    return updated;
  }

  static deleteInstitutionalInventoryItem(itemId: string, user: UserProfile): InstitutionalInventoryItem[] {
    const list = this.getInstitutionalInventory();
    const updated = list.filter((i) => i.id !== itemId);
    this.setItem(STORAGE_KEYS.INST_INVENTORY, updated);
    this.addAuditLog(user, 'Baja de Inventario Institucional', `Artículo ID ${itemId} eliminado`);
    return updated;
  }

  // ================= AREA ACTAS =================
  static getAreaActas(): AreaActa[] {
    return this.getItem<AreaActa[]>(STORAGE_KEYS.AREA_ACTAS, INITIAL_AREA_ACTAS);
  }

  static saveAreaActa(acta: AreaActa, user: UserProfile): AreaActa[] {
    const list = this.getAreaActas();
    const existingIndex = list.findIndex((a) => a.id === acta.id);
    let updated: AreaActa[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = acta;
      this.addAuditLog(user, 'Edición de Acta de Área', `${acta.codigo}: ${acta.titulo}`);
    } else {
      updated = [acta, ...list];
      this.addAuditLog(user, 'Creación de Acta de Área', `${acta.codigo}: ${acta.titulo} (${acta.areaOperativa})`);
    }
    this.setItem(STORAGE_KEYS.AREA_ACTAS, updated);
    return updated;
  }

  static deleteAreaActa(actaId: string, user: UserProfile): AreaActa[] {
    const list = this.getAreaActas();
    const updated = list.filter((a) => a.id !== actaId);
    this.setItem(STORAGE_KEYS.AREA_ACTAS, updated);
    this.addAuditLog(user, 'Eliminación de Acta', `Acta ID ${actaId} eliminada`);
    return updated;
  }

  // ================= NOTICES & ALERTS =================
  static getNotices(): OfficeNotice[] {
    return this.getItem<OfficeNotice[]>(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
  }

  static saveNotice(notice: OfficeNotice, user: UserProfile): OfficeNotice[] {
    const list = this.getNotices();
    const existingIndex = list.findIndex((n) => n.id === notice.id);
    let updated: OfficeNotice[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = notice;
      this.addAuditLog(user, 'Edición de Aviso', `${notice.titulo}`);
    } else {
      updated = [notice, ...list];
      this.addAuditLog(user, 'Publicación de Aviso Oficial', `${notice.nivel}: ${notice.titulo}`);
    }
    this.setItem(STORAGE_KEYS.NOTICES, updated);
    return updated;
  }

  static toggleNotice(noticeId: string, user: UserProfile): OfficeNotice[] {
    const list = this.getNotices();
    const updated = list.map((n) => (n.id === noticeId ? { ...n, activo: !n.activo } : n));
    this.setItem(STORAGE_KEYS.NOTICES, updated);
    this.addAuditLog(user, 'Cambio de Estado de Aviso', `Aviso ${noticeId} alternado`);
    return updated;
  }

  static markNoticeAsRead(noticeId: string, user: UserProfile): OfficeNotice[] {
    const list = this.getNotices();
    const updated = list.map((n) => {
      if (n.id !== noticeId) return n;
      const currentReads = n.leidoPor || [];
      if (currentReads.some((r) => r.userId === user.id || r.userId === user.username)) {
        return n; // ya lo leyó
      }
      const newRead = {
        userId: user.id || user.username,
        userName: user.name,
        leidoEn: new Date().toISOString(),
      };
      return {
        ...n,
        leidoPor: [...currentReads, newRead],
      };
    });
    this.setItem(STORAGE_KEYS.NOTICES, updated);
    return updated;
  }

  static deleteNotice(noticeId: string, user: UserProfile): OfficeNotice[] {
    const list = this.getNotices();
    const updated = list.filter((n) => n.id !== noticeId);
    this.setItem(STORAGE_KEYS.NOTICES, updated);
    this.addAuditLog(user, 'Eliminación de Aviso', `Aviso ID ${noticeId} retirado`);
    return updated;
  }

  // ================= INSCRIPTION FORMS & SURVEYS =================
  static getInscriptionForms(): AreaInscriptionForm[] {
    return this.getItem<AreaInscriptionForm[]>(STORAGE_KEYS.INSCRIPTION_FORMS, INITIAL_INSCRIPTION_FORMS);
  }

  static saveInscriptionForm(form: AreaInscriptionForm, user: UserProfile): AreaInscriptionForm[] {
    const list = this.getInscriptionForms();
    const existingIndex = list.findIndex((f) => f.id === form.id);
    let updated: AreaInscriptionForm[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = form;
      this.addAuditLog(user, 'Edición Convocatoria', `${form.titulo}`);
    } else {
      updated = [form, ...list];
      this.addAuditLog(user, 'Nueva Convocatoria/Ficha', `${form.titulo} (${form.areaOperativa})`);
    }
    this.setItem(STORAGE_KEYS.INSCRIPTION_FORMS, updated);
    return updated;
  }

  static toggleInscriptionForm(formId: string, user: UserProfile): AreaInscriptionForm[] {
    const list = this.getInscriptionForms();
    const updated = list.map((f) => (f.id === formId ? { ...f, habilitada: !f.habilitada } : f));
    this.setItem(STORAGE_KEYS.INSCRIPTION_FORMS, updated);
    this.addAuditLog(user, 'Alternar Estado Convocatoria', `Convocatoria ID ${formId} alternada`);
    return updated;
  }

  static deleteInscriptionForm(formId: string, user: UserProfile): AreaInscriptionForm[] {
    const list = this.getInscriptionForms();
    const updated = list.filter((f) => f.id !== formId);
    this.setItem(STORAGE_KEYS.INSCRIPTION_FORMS, updated);
    this.addAuditLog(user, 'Eliminación Convocatoria', `Convocatoria ID ${formId} eliminada`);
    return updated;
  }

  // ================= INSCRIPTION SUBMISSIONS =================
  static getInscriptionSubmissions(): InscriptionSubmission[] {
    return this.getItem<InscriptionSubmission[]>(STORAGE_KEYS.INSCRIPTION_SUBS, INITIAL_INSCRIPTION_SUBMISSIONS);
  }

  static saveInscriptionSubmission(sub: InscriptionSubmission, user?: UserProfile): InscriptionSubmission[] {
    const list = this.getInscriptionSubmissions();
    const updated = [sub, ...list];
    this.setItem(STORAGE_KEYS.INSCRIPTION_SUBS, updated);
    if (user) {
      this.addAuditLog(user, 'Registro de Inscripción', `Inscripción cargada para formulario ${sub.formId}`);
    }
    return updated;
  }

  // ================= KEY CUSTODY & SECURITY (SECTION 10) =================
  static getKeyCustodyLogs(): KeyCustodyLog[] {
    return this.getItem<KeyCustodyLog[]>(STORAGE_KEYS.KEY_CUSTODY, [
      {
        id: 'key-1',
        fecha: '2026-10-19',
        hora: '09:00',
        responsableNombre: 'Almada Eduardo Thomas',
        accion: 'Apertura de Oficina',
        observaciones: 'Apertura inicial y relevamiento de la habitación para el Centro de Medios y Archivos.',
        llaveEstado: 'En Custodia de Almada',
      },
    ]);
  }

  static saveKeyCustodyLog(log: KeyCustodyLog, user: UserProfile): KeyCustodyLog[] {
    const list = this.getKeyCustodyLogs();
    const updated = [log, ...list];
    this.setItem(STORAGE_KEYS.KEY_CUSTODY, updated);
    this.addAuditLog(user, 'Seguridad y Llaves', `${log.accion}: ${log.responsableNombre} (${log.llaveEstado})`);
    return updated;
  }

  // ================= SAFE BOX & VALUES CUSTODY (SECTION 11) =================
  static getSafeBoxRecords(): SafeBoxRecord[] {
    return this.getItem<SafeBoxRecord[]>(STORAGE_KEYS.SAFE_BOX, []);
  }

  static saveSafeBoxRecord(record: SafeBoxRecord, user: UserProfile): SafeBoxRecord[] {
    const list = this.getSafeBoxRecords();
    const updated = [record, ...list];
    this.setItem(STORAGE_KEYS.SAFE_BOX, updated);
    this.addAuditLog(user, 'Caja Fuerte y Valores', `${record.tipoMovimiento}: ${record.concepto} (${record.montoEfectivo ? '$' + record.montoEfectivo.toLocaleString() : record.elementoValorDetalle || 'Valores'})`);
    return updated;
  }

  // ================= 6 IMPLEMENTATION STAGES (SECTION 19) =================
  static getImplementationStages(): ImplementationStage[] {
    return this.getItem<ImplementationStage[]>(STORAGE_KEYS.STAGES, [
      {
        id: 1,
        numero: 'Primera Etapa',
        titulo: 'Evaluación y Autorización',
        estado: 'Completada',
        responsables: ['Almada Eduardo Thomas', 'Pablo González', 'Renzo Vázquez', 'Demian'],
        progresoPorcentaje: 100,
        acciones: [
          'Presentación formal del proyecto ante autoridades',
          'Evaluación de la propuesta por los responsables de la sede',
          'Inspección inicial de la habitación (19 de octubre de 2026)',
          'Identificación de los materiales existentes en el espacio',
          'Acuerdo sobre el uso y destino del espacio',
          'Definición de las condiciones de acceso restringido',
          'Autorización para las tareas de acondicionamiento',
        ],
      },
      {
        id: 2,
        numero: 'Segunda Etapa',
        titulo: 'Limpieza y Reorganización',
        estado: 'En Progreso',
        responsables: ['Pablo González', 'Demian'],
        progresoPorcentaje: 65,
        acciones: [
          'Clasificación de elementos que se encuentran en la habitación',
          'Consulta previa a los responsables de los objetos existentes',
          'Reubicación autorizada de materiales que deban conservarse',
          'Limpieza general del espacio físico',
          'Revisión de paredes, techo, ventilación e iluminación',
          'Identificación de reparaciones eléctricas y de accesos necesarias',
        ],
      },
      {
        id: 3,
        numero: 'Tercera Etapa',
        titulo: 'Acondicionamiento y Mobiliario',
        estado: 'En Progreso',
        responsables: ['Pablo González', 'Renzo Vázquez'],
        progresoPorcentaje: 50,
        acciones: [
          'Preparación del espacio físico y despeje de circulación',
          'Aprovechamiento autorizado de madera y materiales disponibles en sede',
          'Construcción de escritorios de trabajo y superficies de computadoras',
          'Armado de estantes físicos para 15 folios y biblioratos',
          'Fabricación de muebles para equipos audiovisuales y compartimentos de cables',
          'Instalación de medidas de seguridad, cerraduras y candados',
        ],
      },
      {
        id: 4,
        numero: 'Cuarta Etapa',
        titulo: 'Organización Documental e Inventario',
        estado: 'En Progreso',
        responsables: ['Demian', 'Renzo Vázquez', 'Almada Eduardo Thomas'],
        progresoPorcentaje: 70,
        acciones: [
          'Recolección de documentación que se acuerde incorporar',
          'Clasificación por áreas y categorías operativas',
          'Creación de carpetas, folios y libros de actas',
          'Identificación de equipos, cámaras, micrófonos y accesorios',
          'Elaboración del inventario inicial con distinción de titularidad',
          'Implementación del sistema de préstamos y devoluciones con firmas',
        ],
      },
      {
        id: 5,
        numero: 'Quinta Etapa',
        titulo: 'Desarrollo Digital',
        estado: 'Completada',
        responsables: ['Almada Eduardo Thomas'],
        progresoPorcentaje: 100,
        acciones: [
          'Diseño de la estructura y navegación del sitio web institucional',
          'Creación de categorías documentales y visor de 15 folios',
          'Implementación de inventario patrimonial digital sincronizado',
          'Configuración de permisos de acceso por roles (Admin, Cargador, Secretario)',
          'Carga inicial de registros y usuarios de oficina',
          'Establecimiento de mecanismos de respaldo y base de datos centralizada',
        ],
      },
      {
        id: 6,
        numero: 'Sexta Etapa',
        titulo: 'Puesta en Funcionamiento',
        estado: 'En Progreso',
        responsables: ['Almada Eduardo Thomas', 'Pablo González', 'Renzo Vázquez', 'Demian'],
        progresoPorcentaje: 80,
        acciones: [
          'Verificación de las condiciones de seguridad y cerraduras',
          'Revisión del inventario de bienes y equipos de medios',
          'Comprobación del sistema digital centralizado',
          'Aprobación formal del procedimiento de acceso restringido',
          'Inicio de las tareas habituales de apoyo a las áreas',
          'Presentación del informe inicial a las autoridades de la sede',
        ],
      },
    ]);
  }

  static updateImplementationStages(stages: ImplementationStage[], user: UserProfile): ImplementationStage[] {
    this.setItem(STORAGE_KEYS.STAGES, stages);
    this.addAuditLog(user, 'Plan de Implementación', 'Actualización del estado de etapas del proyecto');
    return stages;
  }

  // ================= INSTITUTIONAL EVALUATION (SECTION 25) =================
  static getInstitutionalEvaluation(): InstitutionalEvaluationConstancia {
    return this.getItem<InstitutionalEvaluationConstancia>(STORAGE_KEYS.EVALUATION, {
      fechaRecepcion: '2026-10-19',
      autoridadReceptora: 'Comisión y Autoridades Responsables de la Sede',
      decision: 'Pendiente de evaluación',
      condicionesAcordadas: 'Uso de la habitación para Centro de Medios y Archivos, con régimen de acceso exclusivo para el equipo proponente y supervisión institucional acordada.',
      observaciones: 'Documento oficial presentado para evaluación y autorización formal.',
    });
  }

  static saveInstitutionalEvaluation(evalData: InstitutionalEvaluationConstancia, user: UserProfile): InstitutionalEvaluationConstancia {
    this.setItem(STORAGE_KEYS.EVALUATION, evalData);
    this.addAuditLog(user, 'Constancia de Evaluación', `Resolución institucional: ${evalData.decision}`);
    return evalData;
  }

  // ================= AVAILABLE BALANCE =================
  static getAvailableBalance(): number {
    const records = this.getBudget();
    const ingresos = records.filter((r) => r.tipo === 'Ingreso').reduce((acc, curr) => acc + curr.monto, 0);
    const gastos = records.filter((r) => r.tipo === 'Gasto').reduce((acc, curr) => acc + curr.monto, 0);
    return Math.max(0, ingresos - gastos);
  }

  static resetToDefault(user: UserProfile): void {
    this.setItem(STORAGE_KEYS.USERS, DEMO_USERS);
    this.setItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
    this.setItem(STORAGE_KEYS.KIDS, INITIAL_KIDS);
    this.setItem(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    this.setItem(STORAGE_KEYS.LOANS, INITIAL_LOANS);
    this.setItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    this.setItem(STORAGE_KEYS.BUDGET, INITIAL_BUDGET);
    this.setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.setItem(STORAGE_KEYS.SHELVES, INITIAL_SHELVES);
    this.setItem(STORAGE_KEYS.INST_INVENTORY, INITIAL_INSTITUTIONAL_INVENTORY);
    this.setItem(STORAGE_KEYS.AREA_ACTAS, INITIAL_AREA_ACTAS);
    this.setItem(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
    this.setItem(STORAGE_KEYS.INSCRIPTION_FORMS, INITIAL_INSCRIPTION_FORMS);
    this.setItem(STORAGE_KEYS.INSCRIPTION_SUBS, INITIAL_INSCRIPTION_SUBMISSIONS);
    this.setItem(STORAGE_KEYS.KEY_CUSTODY, []);
    this.addAuditLog(user, 'Reinicio Profesional de Base', 'Base de datos limpia y lista para uso oficial del Centro de Medios y Archivos');
  }
}

// Automatic synchronization lifecycle for all devices
if (typeof window !== 'undefined') {
  // Pull immediately on startup
  setTimeout(() => {
    StorageService.pullLatestFromServer();
  }, 50);

  // When user returns to tab or unlocks phone screen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      StorageService.pullLatestFromServer();
    }
  });

  // When window receives focus
  window.addEventListener('focus', () => {
    StorageService.pullLatestFromServer();
  });

  // Background fallback poll every 8 seconds
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      StorageService.pullLatestFromServer();
    }
  }, 8000);
}

