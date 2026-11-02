import React from 'react';
import { 
  Trophy, 
  HeartPulse, 
  Smile, 
  Users, 
  Sparkles, 
  Palette, 
  Cpu, 
  FileText, 
  Package, 
  Calendar, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  OperativeArea, 
  ArchiveDocument, 
  KidProfile, 
  InventoryItem, 
  MaterialLoan, 
  AreaRequest, 
  OfficeEvent, 
  UserProfile 
} from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface DashboardViewProps {
  documents: ArchiveDocument[];
  kids: KidProfile[];
  inventory: InventoryItem[];
  loans: MaterialLoan[];
  requests: AreaRequest[];
  events: OfficeEvent[];
  currentUser: UserProfile;
  onSelectArea: (area: OperativeArea) => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewDoc: () => void;
  onOpenNewKid: () => void;
  onOpenNewLoan: () => void;
  onOpenNewRequest: () => void;
}

const getAreaIcon = (area: OperativeArea) => {
  switch (area) {
    case 'DEPORTES Y ACCIÓN SOCIAL': return Trophy;
    case 'CULTURA Y EVENTOS': return Palette;
    case 'AMBIENTE Y PROTECCIÓN ANIMAL': return Sparkles;
    case 'PRENSA, REDES Y COMUNICACIÓN': return FileText;
    case 'SALUD Y BIENESTAR': return HeartPulse;
    case 'NIÑEZ Y ADOLESCENCIA': return Users;
    case 'TECNOLOGÍA Y MEDIOS': return Cpu;
    default: return Trophy;
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  kids,
  inventory,
  loans,
  requests,
  events,
  currentUser,
  onSelectArea,
  onNavigateTab,
  onOpenNewDoc,
  onOpenNewKid,
  onOpenNewLoan,
  onOpenNewRequest,
}) => {
  // Aggregate stats per operative area
  const areaStats = OPERATIVE_AREAS.map((area) => {
    const areaKids = kids.filter((k) => k.areasParticipa.includes(area.key));
    const areaDocs = documents.filter((d) => d.areaOperativa === area.key);
    const areaInventory = inventory.filter((i) => i.areaOperativa === area.key);
    const activeLoans = loans.filter((l) => l.areaOperativa === area.key && l.estado === 'En Curso');
    const pendingReqs = requests.filter((r) => r.areaSolicitante === area.key && r.estado === 'Pendiente');
    const upcomingEvents = events.filter((e) => e.areaOperativa === area.key);

    return {
      area,
      kidsCount: areaKids.length,
      docsCount: areaDocs.length,
      inventoryStock: areaInventory.reduce((acc, curr) => acc + curr.stockTotal, 0),
      activeLoansCount: activeLoans.length,
      pendingReqsCount: pendingReqs.length,
      upcomingEventsCount: upcomingEvents.length,
    };
  });

  const totalActiveLoans = loans.filter((l) => l.estado === 'En Curso').length;
  const totalPendingRequests = requests.filter((r) => r.estado === 'Pendiente').length;
  const kidsWithoutAuth = kids.filter((k) => !k.autorizacionFirmada).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice for Active Role */}
      <div className="rounded-2xl border border-[#0D472C]/30 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0D472C] bg-[#E8F3ED] px-2.5 py-1 rounded-md border border-[#0D472C]/20 inline-block mb-1">
            PANEL DE GESTIÓN INTEGRAL • RAMA OPERATIVA Y ADMINISTRATIVA
          </span>
          <h2 className="font-archival text-xl font-bold text-[#0D472C]">
            Centro de Medios y Archivos de Puerto Esperanza
          </h2>
          <p className="text-xs text-gray-600 mt-0.5 max-w-2xl leading-relaxed">
            Aquí convergen las <strong>7 áreas comunitarias</strong> de atención a niños y adolescentes con los <strong>10 tipos de resguardo administrativo</strong> (actas, inventario, cartelería, informes y balances).
          </p>
        </div>

        {/* Quick action buttons depending on role */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role !== 'VISITANTE' && (
            <button
              onClick={onOpenNewDoc}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Cargar Folio Físico</span>
            </button>
          )}

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={onOpenNewKid}
              className="flex items-center gap-1.5 rounded-lg border border-[#0D472C] bg-white px-3.5 py-2 text-xs font-bold text-[#0D472C] hover:bg-[#E8F3ED] transition cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Inscribir Niño/a</span>
            </button>
          )}

          {(currentUser.role === 'ADMIN' || currentUser.role === 'CARGADOR_DATOS') && (
            <button
              onClick={onOpenNewLoan}
              className="flex items-center gap-1.5 rounded-lg border border-[#0D472C]/40 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition cursor-pointer"
            >
              <Package className="h-4 w-4" />
              <span>Prestar Material</span>
            </button>
          )}

          {currentUser.role === 'SOLICITANTE' && (
            <button
              onClick={onOpenNewRequest}
              className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-800 transition cursor-pointer"
            >
              <Clock className="h-4 w-4" />
              <span>Hacer Pedido al Archivo</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Indicator Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => onNavigateTab('kids')}
          className="rounded-2xl border border-[#0D472C]/20 bg-white p-4 shadow-xs hover:border-[#0D472C] hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Chicos en Talleres</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3ED] text-[#0D472C]">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono-tag text-2xl sm:text-3xl font-black text-[#0D472C]">
              {kids.length}
            </span>
            <span className="text-xs text-gray-500">participantes activos</span>
          </div>
          {kidsWithoutAuth > 0 && (
            <span className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
              ⚠️ {kidsWithoutAuth} sin autorización de padres
            </span>
          )}
        </div>

        <div 
          onClick={() => onNavigateTab('documents')}
          className="rounded-2xl border border-[#0D472C]/20 bg-white p-4 shadow-xs hover:border-[#0D472C] hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Folios Archivados</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3ED] text-[#0D472C]">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono-tag text-2xl sm:text-3xl font-black text-[#0D472C]">
              {documents.length}
            </span>
            <span className="text-xs text-gray-500">con estante físico y QR</span>
          </div>
          <span className="mt-2 text-[10px] text-gray-500 block truncate">
            Último: {documents[0]?.codigoFolio || 'Sin folios'}
          </span>
        </div>

        <div 
          onClick={() => onNavigateTab('inventory')}
          className="rounded-2xl border border-[#0D472C]/20 bg-white p-4 shadow-xs hover:border-[#0D472C] hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Préstamos en Curso</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F3ED] text-[#0D472C]">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono-tag text-2xl sm:text-3xl font-black text-[#0D472C]">
              {totalActiveLoans}
            </span>
            <span className="text-xs text-gray-500">con firma digital</span>
          </div>
          <span className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
            {inventory.length} insumos inventariados
          </span>
        </div>

        <div 
          onClick={() => onNavigateTab('requests')}
          className="rounded-2xl border border-[#0D472C]/20 bg-white p-4 shadow-xs hover:border-[#0D472C] hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Pedidos por Áreas</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono-tag text-2xl sm:text-3xl font-black text-amber-800">
              {totalPendingRequests}
            </span>
            <span className="text-xs text-gray-500">pendientes de aprobación</span>
          </div>
          <span className="mt-2 text-[10px] text-gray-500 block">
            {requests.length} solicitudes históricas
          </span>
        </div>
      </div>

      {/* DASHBOARD POR ÁREA OPERATIVA (DETALLE COMPLETO SOLICITADO) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-archival text-base sm:text-lg font-bold text-[#0D472C]">
              Dashboard por Área Operativa (Trabajo con la Gente)
            </h3>
            <p className="text-xs text-gray-600">
              Supervisión de participantes, documentos archivados, materiales e iniciativas de cada equipo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areaStats.map((item) => {
            const Icon = getAreaIcon(item.area.key);
            const isUserAssigned = currentUser.assignedArea === item.area.key;

            return (
              <div
                key={item.area.key}
                className={`rounded-2xl border bg-white p-4 transition shadow-xs hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                  isUserAssigned
                    ? 'border-[#0D472C] ring-2 ring-[#0D472C]/20'
                    : 'border-[#0D472C]/20 hover:border-[#0D472C]'
                }`}
              >
                {/* Top strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: item.area.color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs"
                        style={{ backgroundColor: item.area.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-archival text-sm font-bold text-gray-900 leading-tight">
                          {item.area.label}
                        </h4>
                        <span className="text-[10px] font-semibold text-gray-500 block">
                          Rama Operativa
                        </span>
                      </div>
                    </div>

                    {isUserAssigned && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#0D472C] text-white px-2 py-0.5 rounded">
                        Tu Área
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 min-h-[32px] mb-3 leading-relaxed">
                    {item.area.description}
                  </p>

                  {/* Quantitative Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-[#FAF7F0] p-2.5 rounded-xl border border-gray-200 text-center mb-3">
                    <div>
                      <span className="font-mono-tag text-lg font-black text-[#0D472C] block">
                        {item.kidsCount}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">
                        Chicos
                      </span>
                    </div>
                    <div className="border-x border-gray-200">
                      <span className="font-mono-tag text-lg font-black text-[#0D472C] block">
                        {item.docsCount}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">
                        Folios
                      </span>
                    </div>
                    <div>
                      <span className="font-mono-tag text-lg font-black text-[#0D472C] block">
                        {item.inventoryStock}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">
                        Stock
                      </span>
                    </div>
                  </div>

                  {/* Operational badges */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {item.activeLoansCount > 0 ? (
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        📦 {item.activeLoansCount} préstamos activos
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        Sin préstamos activos
                      </span>
                    )}

                    {item.pendingReqsCount > 0 && (
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                        ⚠️ {item.pendingReqsCount} pedido pendiente
                      </span>
                    )}

                    {item.upcomingEventsCount > 0 && (
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-medium">
                        📅 {item.upcomingEventsCount} evento agendado
                      </span>
                    )}
                  </div>

                  {/* Team Members from WhatsApp */}
                  {item.area.encargados && item.area.encargados.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 text-[10px] text-gray-600 flex items-center justify-between">
                      <span className="font-semibold text-gray-500">Equipo:</span>
                      <span className="font-bold text-[#0D472C]">
                        {item.area.encargados.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectArea(item.area.key)}
                    className="text-xs font-bold text-[#0D472C] hover:text-[#165B3A] flex items-center gap-1 cursor-pointer"
                  >
                    Ver archivo de {item.area.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] text-gray-400">
                    Puerto Esperanza
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Physical Archive Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Folios */}
        <div className="rounded-2xl border border-[#0D472C]/20 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <div>
              <h3 className="font-archival text-sm font-bold text-[#0D472C]">
                Últimos Folios Físicos Asentados
              </h3>
              <p className="text-[11px] text-gray-500">Con código de estante y tipo administrativo</p>
            </div>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs font-bold text-[#0D472C] hover:underline"
            >
              Ver todos ({documents.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-2.5 rounded-xl bg-[#FFFDF8] border border-gray-200 hover:border-[#0D472C]/40 transition flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tag text-xs font-black text-[#0D472C] bg-[#E8F3ED] px-1.5 py-0.5 rounded">
                      {doc.codigoFolio}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                      {doc.areaOperativa}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {doc.tipoAdministrativo}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 line-clamp-1">
                    {doc.titulo}
                  </p>
                  <span className="text-[10px] text-amber-800 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {doc.estanteFisico}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[10px] text-gray-400 block">{doc.fecha}</span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase">{doc.soporteFisico}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Community Events */}
        <div className="rounded-2xl border border-[#0D472C]/20 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <div>
              <h3 className="font-archival text-sm font-bold text-[#0D472C]">
                Próximos Talleres y Eventos Comunitarios
              </h3>
              <p className="text-[11px] text-gray-500">Cartelera pública y cronograma de actividades</p>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-bold text-[#0D472C] hover:underline"
            >
              Ver cartelera completa
            </button>
          </div>

          <div className="space-y-2.5">
            {events.slice(0, 3).map((eve) => (
              <div
                key={eve.id}
                className="p-3 rounded-xl bg-[#FFFDF8] border border-gray-200 hover:border-[#0D472C]/40 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white bg-[#0D472C] px-2 py-0.5 rounded">
                    {eve.areaOperativa}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-700">
                    📅 {eve.fecha} • {eve.hora}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug">
                  {eve.titulo}
                </h4>
                <p className="text-[11px] text-gray-600 line-clamp-1">
                  📍 {eve.lugar} — {eve.descripcion}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                  <span>Resp: {eve.responsable}</span>
                  <span className="font-semibold text-[#0D472C]">
                    Esperados: ~{eve.participantesEsperados} vecinos/chicos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
