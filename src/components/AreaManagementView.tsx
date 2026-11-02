import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Palette, 
  Leaf, 
  Camera, 
  HeartPulse, 
  Users, 
  Cpu, 
  Plus, 
  FileText, 
  Package, 
  SendHorizontal, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Upload, 
  Eye, 
  AlertCircle,
  FileCheck2,
  FolderOpen,
  Printer,
  X
} from 'lucide-react';
import { 
  UserProfile, 
  OperativeArea, 
  AreaActa, 
  InstitutionalInventoryItem, 
  AreaRequest, 
  ArchiveDocument 
} from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface AreaManagementViewProps {
  currentUser: UserProfile;
  onOpenDigitizeFolio: (initialArea?: OperativeArea) => void;
  onViewDocDetail: (doc: ArchiveDocument) => void;
}

export const AreaManagementView: React.FC<AreaManagementViewProps> = ({
  currentUser,
  onOpenDigitizeFolio,
  onViewDocDetail,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  // If user is non-admin, lock them to their assigned area
  const [selectedArea, setSelectedArea] = useState<OperativeArea>(() => {
    if (!isAdmin && currentUser.assignedArea) {
      return currentUser.assignedArea;
    }
    return 'DEPORTES Y ACCIÓN SOCIAL';
  });

  const [activeSubTab, setActiveSubTab] = useState<'actas' | 'objetos' | 'pedidos' | 'documentos'>('actas');

  // Data states from StorageService
  const [actas, setActas] = useState<AreaActa[]>(() => StorageService.getAreaActas());
  const [inventoryItems, setInventoryItems] = useState<InstitutionalInventoryItem[]>(() => StorageService.getInstitutionalInventory());
  const [requests, setRequests] = useState<AreaRequest[]>(() => StorageService.getRequests());
  const [documents, setDocuments] = useState<ArchiveDocument[]>(() => StorageService.getDocuments());

  // Form states for creating an Acta
  const [isCreatingActa, setIsCreatingActa] = useState(false);
  const [actaTitulo, setActaTitulo] = useState('');
  const [actaFecha, setActaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [actaHora, setActaHora] = useState('18:00');
  const [actaLugar, setActaLugar] = useState('Sede Puerto Esperanza');
  const [actaTemario, setActaTemario] = useState('');
  const [actaParticipantes, setActaParticipantes] = useState('');
  const [actaAcuerdos, setActaAcuerdos] = useState('');
  const [actaFotoUrl, setActaFotoUrl] = useState<string | null>(null);
  const [viewingActa, setViewingActa] = useState<AreaActa | null>(null);

  // Form states for making a Request (Pedido)
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [reqTipo, setReqTipo] = useState<AreaRequest['tipoSolicitud']>('Material de Inventario');
  const [reqDescripcion, setReqDescripcion] = useState('');
  const [reqCantidad, setReqCantidad] = useState('');
  const [reqUrgencia, setReqUrgencia] = useState<AreaRequest['urgencia']>('Media');

  // Form state for Admin adding item to area
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemArticulo, setItemArticulo] = useState('');
  const [itemCodigo, setItemCodigo] = useState('');
  const [itemCantidad, setItemCantidad] = useState(1);
  const [itemEstado, setItemEstado] = useState<InstitutionalInventoryItem['estado']>('Excelente');
  const [itemUbicacion, setItemUbicacion] = useState<InstitutionalInventoryItem['espacioUbicacion']>('SEDE CENTRAL');
  const [itemObservaciones, setItemObservaciones] = useState('');

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Filter items for current selected area
  const areaActas = useMemo(() => actas.filter((a) => a.areaOperativa === selectedArea), [actas, selectedArea]);
  const areaInventory = useMemo(() => inventoryItems.filter((i) => i.areaAsignada === selectedArea), [inventoryItems, selectedArea]);
  const areaRequests = useMemo(() => requests.filter((r) => r.areaSolicitante === selectedArea), [requests, selectedArea]);
  const areaDocuments = useMemo(() => documents.filter((d) => d.areaOperativa === selectedArea), [documents, selectedArea]);

  // Handle Create Acta (encargado can upload/create, admin can create)
  const handleSaveActa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actaTitulo.trim()) {
      showNotification('error', 'El título o asunto del acta es obligatorio');
      return;
    }

    const newActa: AreaActa = {
      id: 'acta-' + Date.now(),
      codigo: `ACT-${selectedArea.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`,
      areaOperativa: selectedArea,
      titulo: actaTitulo.trim(),
      fecha: actaFecha,
      horaInicio: actaHora,
      lugar: actaLugar.trim(),
      temarioOrdenDelDia: actaTemario.trim(),
      participantesPresentes: actaParticipantes.split(',').map((p) => p.trim()).filter(Boolean),
      acuerdosYResoluciones: actaAcuerdos.trim(),
      redactadaPor: currentUser.name,
      firmadaPorAdmin: isAdmin,
      adjuntoFotoUrl: actaFotoUrl || undefined,
      creadaEn: new Date().toISOString(),
    };

    const updated = StorageService.saveAreaActa(newActa, currentUser);
    setActas(updated);

    // Also register as an official Archive Document under folio "Actas y reuniones"
    const newDoc: ArchiveDocument = {
      id: 'doc-acta-' + Date.now(),
      codigoFolio: newActa.codigo,
      titulo: newActa.titulo,
      areaOperativa: selectedArea,
      tipoAdministrativo: 'ACTAS Y REUNIONES',
      subtipoDetalle: 'Actas de reuniones de comisión / equipo',
      anio: new Date().getFullYear(),
      estanteFisico: 'Estante 1 - Balda A',
      folioNombre: 'Actas y reuniones',
      fecha: newActa.fecha,
      autor: currentUser.name,
      descripcion: `Sesión de ${selectedArea}. Lugar: ${newActa.lugar}. Temario: ${newActa.temarioOrdenDelDia || 'Tratamiento de temas operativos'}. Resoluciones: ${newActa.acuerdosYResoluciones || 'Acuerdos tomados en sesión'}.`,
      soporteFisico: 'Original Manuscrito',
      visibilidad: 'Uso Interno',
      etiquetas: ['Acta', selectedArea, 'Reunión'],
      fotoUrl: newActa.adjuntoFotoUrl,
      creadoEn: new Date().toISOString(),
    };
    const updatedDocs = StorageService.saveDocument(newDoc, currentUser);
    setDocuments(updatedDocs);

    setIsCreatingActa(false);
    setActaTitulo('');
    setActaTemario('');
    setActaParticipantes('');
    setActaAcuerdos('');
    setActaFotoUrl(null);
    setViewingActa(newActa);
    showNotification('success', `✓ Acta "${newActa.codigo}" creada y archivada. Visualizando acta oficial.`);
  };

  const handleDeleteActa = (actaId: string) => {
    if (!isAdmin) {
      showNotification('error', 'Solo el Coordinador General (Admin) puede eliminar actas oficiales.');
      return;
    }
    const updated = StorageService.deleteAreaActa(actaId, currentUser);
    setActas(updated);
    showNotification('success', 'Acta eliminada del archivo de área');
  };

  // Handle Make Request (Pedido)
  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqDescripcion.trim()) {
      showNotification('error', 'Debe detallar qué materiales o insumos solicita.');
      return;
    }

    const newReq: AreaRequest = {
      id: 'req-' + Date.now(),
      codigo: `PED-${selectedArea.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      areaSolicitante: selectedArea,
      tipoSolicitud: reqTipo,
      solicitanteNombre: currentUser.name,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      urgencia: reqUrgencia,
      descripcion: reqDescripcion.trim(),
      cantidadEstimada: reqCantidad.trim() || undefined,
      estado: 'Pendiente',
    };

    const updated = StorageService.saveRequest(newReq, currentUser);
    setRequests(updated);
    setIsCreatingRequest(false);
    setReqDescripcion('');
    setReqCantidad('');
    showNotification('success', `Pedido ${newReq.codigo} enviado a Coordinación General para aprobación.`);
  };

  // Handle Admin Add Item to Area
  const handleSaveAreaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!itemArticulo.trim()) {
      showNotification('error', 'El nombre del artículo es obligatorio');
      return;
    }

    const newItem: InstitutionalInventoryItem = {
      id: 'inv-' + Date.now(),
      codigo: itemCodigo.trim() || `INV-${selectedArea.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      articulo: itemArticulo.trim(),
      personaQueInventaria: currentUser.name,
      dia: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date().getDay()],
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      espacioUbicacion: itemUbicacion,
      areaAsignada: selectedArea,
      categoria: 'Varios',
      cantidad: Number(itemCantidad) || 1,
      estado: itemEstado,
      observaciones: itemObservaciones.trim(),
      registradoPorUsuario: currentUser.username,
    };

    const updated = StorageService.saveInstitutionalInventoryItem(newItem, currentUser);
    setInventoryItems(updated);
    setIsAddingItem(false);
    setItemArticulo('');
    setItemCodigo('');
    setItemCantidad(1);
    setItemObservaciones('');
    showNotification('success', `Artículo asignado al área ${selectedArea}`);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!isAdmin) {
      showNotification('error', 'Solo el Coordinador General (Admin) puede dar de baja objetos del área.');
      return;
    }
    const updated = StorageService.deleteInstitutionalInventoryItem(itemId, currentUser);
    setInventoryItems(updated);
    showNotification('success', 'Objeto dado de baja');
  };

  const getAreaColor = (area: OperativeArea) => {
    const meta = OPERATIVE_AREAS.find((a) => a.key === area);
    return meta?.color || '#0D472C';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div 
        className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
        style={{ backgroundColor: getAreaColor(selectedArea) }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded uppercase">
                Apartado Oficial por Área
              </span>
              <span className="text-xs text-white/80">Puerto Esperanza</span>
              <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded font-semibold border border-white/20">
                {isAdmin ? 'Modo Coordinación (Control Total)' : `Encargado: ${currentUser.name}`}
              </span>
            </div>

            <h1 className="font-archival text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {selectedArea}
            </h1>
            <p className="text-xs text-white/90 max-w-xl mt-1.5 leading-relaxed">
              Gestión exclusiva de actas, sesiones, objetos inventariados, pedidos de insumos y documentos resguardados para esta área.
            </p>
          </div>

          {/* Quick Upload / Request actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreatingRequest(true)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 px-4 py-2.5 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <SendHorizontal className="h-4 w-4" />
              <span>Pedir Materiales / Insumos</span>
            </button>

            <button
              onClick={() => setIsCreatingActa(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-gray-100 text-[#0D472C] px-4 py-2.5 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Redactar Acta / Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Area Selector Tabs (Only Admin can switch between areas; non-admin is locked to their area) */}
      {isAdmin ? (
        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 uppercase px-2 shrink-0">
            Cambiar Área Operativa:
          </span>
          {OPERATIVE_AREAS.map((area) => (
            <button
              key={area.key}
              onClick={() => setSelectedArea(area.key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedArea === area.key
                  ? 'bg-[#0D472C] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-950 font-bold">
          <span>Área Operativa Asignada: <strong>{currentUser.assignedArea}</strong></span>
          <span className="text-[11px] font-normal text-emerald-800">Segregación activa: solo puedes ver y gestionar tu área.</span>
        </div>
      )}

      {/* Notification Toast */}
      {notificationMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in ${
          notificationMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
        }`}>
          {notificationMsg.type === 'success' ? <Check className="h-4 w-4 text-emerald-700" /> : <AlertCircle className="h-4 w-4 text-red-700" />}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Subtabs for this Area: Actas | Objetos | Pedidos | Documentos */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSubTab('actas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'actas'
              ? 'bg-[#0D472C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Actas y Sesiones ({areaActas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('objetos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'objetos'
              ? 'bg-[#0D472C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Objetos y Materiales del Área ({areaInventory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pedidos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'pedidos'
              ? 'bg-[#0D472C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
          <span>Pedidos y Solicitudes ({areaRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('documentos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'documentos'
              ? 'bg-[#0D472C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Documentos y Fotos ({areaDocuments.length})</span>
        </button>
      </div>

      {/* 1. ACTAS Y SESIONES */}
      {activeSubTab === 'actas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-archival text-base font-bold text-[#0D472C]">
                Libro de Actas y Sesiones de {selectedArea}
              </h3>
              <p className="text-xs text-gray-500">
                Registro de reuniones oficiales, firmas de asistencia, acuerdos y decisiones tomadas.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingActa(!isCreatingActa)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isCreatingActa ? 'Cancelar' : 'Nueva Acta de Sesión'}</span>
            </button>
          </div>

          {/* Form to Create Acta */}
          {isCreatingActa && (
            <div className="rounded-2xl border-2 border-[#0D472C] bg-[#FFFDF8] p-5 sm:p-6 shadow-md animate-in fade-in">
              <h4 className="font-archival text-sm font-bold text-[#0D472C] mb-3 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5" />
                <span>Formulario Oficial de Acta / Sesión</span>
              </h4>

              <form onSubmit={handleSaveActa} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Título o Asunto Principal de la Reunión *
                  </label>
                  <input
                    type="text"
                    value={actaTitulo}
                    onChange={(e) => setActaTitulo(e.target.value)}
                    placeholder="Ej: Sesión Ordinaria: Planificación del Torneo y Horarios de Canchas"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#0D472C]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={actaFecha}
                      onChange={(e) => setActaFecha(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Hora de Inicio</label>
                    <input
                      type="time"
                      value={actaHora}
                      onChange={(e) => setActaHora(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Lugar de la Sesión</label>
                    <input
                      type="text"
                      value={actaLugar}
                      onChange={(e) => setActaLugar(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Orden del Día / Temas Tratados
                  </label>
                  <textarea
                    rows={2}
                    value={actaTemario}
                    onChange={(e) => setActaTemario(e.target.value)}
                    placeholder="1. Puntos a tratar en el orden del día..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Participantes Presentes (Separar por comas)
                  </label>
                  <input
                    type="text"
                    value={actaParticipantes}
                    onChange={(e) => setActaParticipantes(e.target.value)}
                    placeholder="Ej: Ezequiel Villalba, Micaela, Almada Eduardo Thomas"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Acuerdos, Decisiones y Resoluciones Tomadas
                  </label>
                  <textarea
                    rows={3}
                    value={actaAcuerdos}
                    onChange={(e) => setActaAcuerdos(e.target.value)}
                    placeholder="Detalle de resoluciones aprobadas, compromisos y tareas asignadas..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsCreatingActa(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white font-bold shadow-md cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Guardar y Asentar Acta</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Actas List */}
          {areaActas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-10 text-center text-gray-500 text-xs">
              <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <span>Aún no hay actas registradas para {selectedArea}. Presione "Nueva Acta de Sesión" para asentar la primera.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {areaActas.map((acta) => (
                <div
                  key={acta.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-[#0D472C] transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-[#E8F3ED] text-[#0D472C] px-2.5 py-0.5 rounded border border-[#0D472C]/20">
                        {acta.codigo}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {acta.fecha} ({acta.horaInicio} hs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {acta.firmadaPorAdmin ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="h-3 w-3" /> Firmada por Coordinación
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pendiente Firma
                        </span>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteActa(acta.id)}
                          title="Eliminar acta (Solo Admin)"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-archival text-sm font-bold text-gray-900">{acta.titulo}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Lugar: <strong>{acta.lugar}</strong> • Redactada por: {acta.redactadaPor}</p>
                  </div>

                  {acta.temarioOrdenDelDia && (
                    <div className="bg-[#FAF7F0] p-3 rounded-xl text-xs text-gray-700">
                      <strong className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Orden del Día:</strong>
                      <p>{acta.temarioOrdenDelDia}</p>
                    </div>
                  )}

                  {acta.acuerdosYResoluciones && (
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                      <strong className="block text-[11px] uppercase tracking-wider text-emerald-900 mb-1">Acuerdos y Resoluciones:</strong>
                      <p>{acta.acuerdosYResoluciones}</p>
                    </div>
                  )}

                  {acta.participantesPresentes.length > 0 && (
                    <div className="text-[11px] text-gray-500 flex flex-wrap gap-1 items-center">
                      <span className="font-bold">Presentes:</span>
                      {acta.participantesPresentes.map((p, idx) => (
                        <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-mono">Folio: Actas y reuniones • Estante 1</span>
                    <button
                      onClick={() => setViewingActa(acta)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D472C] text-white text-xs font-bold hover:bg-[#165B3A] transition shadow-xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ver Acta Completa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. OBJETOS Y MATERIALES DEL ÁREA */}
      {activeSubTab === 'objetos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-archival text-base font-bold text-[#0D472C]">
                Equipamiento y Objetos Asignados a {selectedArea}
              </h3>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Como Coordinador puede cargar, editar o dar de baja materiales de esta área.' : 'Los encargados de área pueden visualizar el inventario y solicitar reposición.'}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{isAddingItem ? 'Cancelar' : 'Cargar Objeto al Área'}</span>
              </button>
            )}
          </div>

          {/* Form for Admin to add item */}
          {isAddingItem && isAdmin && (
            <div className="rounded-2xl border-2 border-[#0D472C] bg-[#FFFDF8] p-5 shadow-md">
              <h4 className="font-archival text-sm font-bold text-[#0D472C] mb-3">
                Cargar Objeto / Material al Área de {selectedArea}
              </h4>
              <form onSubmit={handleSaveAreaItem} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Nombre del Artículo *</label>
                    <input
                      type="text"
                      value={itemArticulo}
                      onChange={(e) => setItemArticulo(e.target.value)}
                      placeholder="Ej: Juego de 10 Pelotas / Micrófono Inalámbrico"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Código Patrimonial</label>
                    <input
                      type="text"
                      value={itemCodigo}
                      onChange={(e) => setItemCodigo(e.target.value)}
                      placeholder="Ej: INV-DEP-010"
                      className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-bold text-[#0D472C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={itemCantidad}
                      onChange={(e) => setItemCantidad(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Estado</label>
                    <select
                      value={itemEstado}
                      onChange={(e) => setItemEstado(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    >
                      <option value="Excelente">Excelente</option>
                      <option value="Bueno">Bueno</option>
                      <option value="Regular">Regular</option>
                      <option value="A Reparar">A Reparar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ubicación / Sede</label>
                    <select
                      value={itemUbicacion}
                      onChange={(e) => setItemUbicacion(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    >
                      <option value="SEDE CENTRAL">SEDE CENTRAL</option>
                      <option value="ESPACIO ESPERANZA SOMOS TODOS">ESPACIO ESPERANZA SOMOS TODOS</option>
                      <option value="GALPÓN TALLERES">GALPÓN TALLERES</option>
                      <option value="CANCHA / EXTERIOR">CANCHA / EXTERIOR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Observaciones</label>
                  <input
                    type="text"
                    value={itemObservaciones}
                    onChange={(e) => setItemObservaciones(e.target.value)}
                    placeholder="Detalles sobre estado, donación o uso..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0D472C] text-white font-bold shadow cursor-pointer"
                  >
                    Guardar Objeto
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {areaInventory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 rounded">
                      {item.codigo}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {item.estado}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-gray-900">{item.articulo}</h4>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{item.espacioUbicacion}</span>
                  </div>
                  {item.observaciones && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.observaciones}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-3 text-xs">
                  <span className="font-mono font-bold text-gray-800">
                    Stock: {item.cantidad} unidades
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Dar de baja este objeto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PEDIDOS Y SOLICITUDES DE INSUMOS */}
      {activeSubTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-archival text-base font-bold text-[#0D472C]">
                Pedidos de Insumos y Materiales de {selectedArea}
              </h3>
              <p className="text-xs text-gray-500">
                Los encargados solicitan pelotas, pinturas, carteles o partidas; el Admin aprueba y entrega.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingRequest(!isCreatingRequest)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{isCreatingRequest ? 'Cancelar' : 'Hacer Nuevo Pedido'}</span>
            </button>
          </div>

          {/* Form for Request */}
          {isCreatingRequest && (
            <div className="rounded-2xl border-2 border-amber-500 bg-[#FFFDF8] p-5 shadow-md">
              <h4 className="font-archival text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                <SendHorizontal className="h-5 w-5" />
                <span>Formulario de Solicitud Interna de Insumos</span>
              </h4>

              <form onSubmit={handleSaveRequest} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tipo de Solicitud *</label>
                    <select
                      value={reqTipo}
                      onChange={(e) => setReqTipo(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    >
                      <option value="Material de Inventario">Material de Inventario (Pelotas, Herramientas, etc.)</option>
                      <option value="Diseño e Impresión Cartel">Diseño e Impresión de Cartelería / Afiches</option>
                      <option value="Partida Presupuestaria">Partida Presupuestaria / Fondos</option>
                      <option value="Uso de Espacio / Salón">Uso de Espacio o Cancha</option>
                      <option value="Equipamiento Técnico">Equipamiento Técnico (Sonido, Micrófonos, Proyector)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Urgencia</label>
                    <select
                      value={reqUrgencia}
                      onChange={(e) => setReqUrgencia(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    >
                      <option value="Baja">Baja (Para próximas semanas)</option>
                      <option value="Media">Media (Próximos días)</option>
                      <option value="Alta">Alta (Fin de semana / Evento)</option>
                      <option value="Urgente">Urgente (Inmediata)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Descripción del Pedido y Justificación *
                  </label>
                  <textarea
                    rows={3}
                    value={reqDescripcion}
                    onChange={(e) => setReqDescripcion(e.target.value)}
                    placeholder="Detalle exactamente lo que necesita y para qué taller o actividad se utilizará..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cantidad Estimada</label>
                  <input
                    type="text"
                    value={reqCantidad}
                    onChange={(e) => setReqCantidad(e.target.value)}
                    placeholder="Ej: 5 pelotas, 2 cajas de témperas, 100 afiches impresos"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRequest(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow cursor-pointer"
                  >
                    Enviar Pedido a Coordinación
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Requests */}
          <div className="space-y-3">
            {areaRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
                      {req.codigo}
                    </span>
                    <span className="font-bold text-xs text-gray-900">{req.tipoSolicitud}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    req.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' :
                    req.estado === 'Entregado' ? 'bg-blue-100 text-blue-800' :
                    req.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {req.estado}
                  </span>
                </div>

                <p className="text-xs text-gray-700 mb-2">{req.descripcion}</p>
                {req.cantidadEstimada && (
                  <p className="text-xs text-gray-500">Cantidad: <strong>{req.cantidadEstimada}</strong></p>
                )}

                <div className="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
                  <span>Pedido por: {req.solicitanteNombre} ({req.fechaSolicitud})</span>
                  <span className="font-semibold text-gray-600">Urgencia: {req.urgencia}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DOCUMENTOS Y FOTOS DEL ÁREA */}
      {activeSubTab === 'documentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-archival text-base font-bold text-[#0D472C]">
                Documentos y Fotos Digitalizadas de {selectedArea}
              </h3>
              <p className="text-xs text-gray-500">
                Planillas de inscripción, fotos de actividades y notas archivadas.
              </p>
            </div>

            <button
              onClick={() => onOpenDigitizeFolio(selectedArea)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Subir Foto o Papel a esta Área</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {areaDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onViewDocDetail(doc)}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs hover:border-[#0D472C] hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 rounded">
                      {doc.codigoFolio}
                    </span>
                    <span className="text-[11px] text-gray-400">{doc.fecha}</span>
                  </div>

                  {doc.fotoUrl && (
                    <div className="h-28 w-full rounded-xl overflow-hidden mb-2 bg-gray-50 border border-gray-200">
                      <img src={doc.fotoUrl} alt={doc.titulo} className="h-full w-full object-cover" />
                    </div>
                  )}

                  <h4 className="font-bold text-xs text-gray-900 leading-snug">{doc.titulo}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{doc.descripcion}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 mt-2">
                  <span>Estante: {doc.estanteFisico}</span>
                  <span className="text-[#0D472C] font-bold">Ver Ficha →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* VIEWING ACTA DETAIL MODAL */}
      {viewingActa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 sm:p-8 my-8 space-y-5 animate-in fade-in">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#0D472C]/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-[#0D472C] text-white flex items-center justify-center shrink-0 shadow-md">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase bg-[#E8F3ED] text-[#0D472C] px-2.5 py-0.5 rounded border border-[#0D472C]/20">
                    {viewingActa.codigo}
                  </span>
                  <h3 className="font-archival text-lg sm:text-xl font-black text-gray-950 mt-1 leading-tight">
                    {viewingActa.titulo}
                  </h3>
                  <span className="text-xs text-[#0D472C] font-bold">
                    Área: {viewingActa.areaOperativa}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingActa(null)}
                className="text-gray-400 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#FAF7F0] p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-700">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Fecha</span>
                <span className="font-bold font-mono">📅 {viewingActa.fecha}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Horario</span>
                <span className="font-bold">⏰ {viewingActa.horaInicio} hs</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Lugar</span>
                <span className="font-bold truncate block">📍 {viewingActa.lugar}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Redactada Por</span>
                <span className="font-bold text-[#0D472C] truncate block">✍️ {viewingActa.redactadaPor}</span>
              </div>
            </div>

            {/* Orden del día */}
            {viewingActa.temarioOrdenDelDia && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0D472C]" />
                  Orden del Día / Temario
                </h4>
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 text-xs text-gray-800 whitespace-pre-line leading-relaxed">
                  {viewingActa.temarioOrdenDelDia}
                </div>
              </div>
            )}

            {/* Acuerdos y Resoluciones */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#0D472C] uppercase tracking-wider flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#0D472C]" />
                Acuerdos, Decisiones y Resoluciones Tomadas
              </h4>
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-300 text-xs text-emerald-950 font-medium whitespace-pre-line leading-relaxed shadow-xs">
                {viewingActa.acuerdosYResoluciones || 'Sin resoluciones asentadas.'}
              </div>
            </div>

            {/* Participantes Presentes */}
            {viewingActa.participantesPresentes.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Participantes y Asistencia Registrada ({viewingActa.participantesPresentes.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingActa.participantesPresentes.map((p, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-xl text-xs font-semibold border border-gray-200"
                    >
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Photo if exists */}
            {viewingActa.adjuntoFotoUrl && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Documento / Acta Física Escaneada
                </h4>
                <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-64 bg-gray-50 flex items-center justify-center">
                  <img
                    src={viewingActa.adjuntoFotoUrl}
                    alt="Acta Física"
                    className="max-h-64 w-auto object-contain"
                  />
                </div>
              </div>
            )}

            {/* Official Certification Footer */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0D472C] shrink-0" />
                <span>
                  Asentada en el libro de actas oficial • <strong>Centro de Medios y Archivos</strong> Puerto Esperanza
                </span>
              </div>
              <span className="font-mono text-[10px] text-gray-500">
                Folio: Actas y reuniones • Estante 1
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Acta</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingActa(null)}
                className="px-6 py-2 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
