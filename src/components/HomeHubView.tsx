import React, { useState } from 'react';
import { 
  Building2, 
  Folder, 
  Package, 
  Layers, 
  Bell, 
  ClipboardList, 
  Coins, 
  Users, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles,
  Trophy,
  Palette,
  Leaf,
  Camera,
  HeartPulse,
  SendHorizontal,
  QrCode,
  BookOpen,
  Key
} from 'lucide-react';
import { UserProfile, OfficeNotice, OperativeArea } from '../types';
import { canUserAccessTab } from '../utils/permissions';
import { InstitutionalProjectModal } from './InstitutionalProjectModal';
import { KeyCustodyModal } from './KeyCustodyModal';

interface HomeHubViewProps {
  currentUser: UserProfile;
  notices: OfficeNotice[];
  onNavigateTab: (tab: string) => void;
  availableBalance: number;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  currentUser,
  notices,
  onNavigateTab,
  availableBalance,
}) => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isKeyCustodyModalOpen, setIsKeyCustodyModalOpen] = useState(false);

  // Filter active notices intended for this user or all
  const activeAlerts = notices.filter((n) => {
    if (!n.activo) return false;
    if (n.areaDestino === 'TODAS') return true;
    return currentUser.assignedArea === n.areaDestino;
  });

  const getAreaIcon = (area?: OperativeArea) => {
    switch (area) {
      case 'DEPORTES Y ACCIÓN SOCIAL': return Trophy;
      case 'CULTURA Y EVENTOS': return Palette;
      case 'AMBIENTE Y PROTECCIÓN ANIMAL': return Leaf;
      case 'PRENSA, REDES Y COMUNICACIÓN': return Camera;
      case 'SALUD Y BIENESTAR': return HeartPulse;
      default: return Building2;
    }
  };

  const AreaIcon = getAreaIcon(currentUser.assignedArea);

  // Cards definitions
  const hubCards = [
    {
      id: 'my_area',
      title: currentUser.role === 'ADMIN' ? 'Gestión de Áreas Operativas' : `Apartado Oficial: ${currentUser.assignedArea || 'Mi Área'}`,
      description: currentUser.role === 'ADMIN' 
        ? 'Supervisión de actas, sesiones, materiales y pedidos de cada una de las áreas.' 
        : 'Actas de sesiones, inventario propio, subir documentos/fotos y realizar pedidos de insumos.',
      icon: AreaIcon,
      color: 'bg-[#0D472C]',
      textColor: 'text-white',
      badge: currentUser.role === 'ADMIN' ? 'Todas las Áreas' : 'Tu Espacio de Trabajo',
      visible: canUserAccessTab(currentUser, 'my_area'),
    },
    {
      id: 'shelves',
      title: '15 Folios en Estanterías',
      description: 'Digitalización con foto y resguardo físico de los 15 folios oficiales en estantes.',
      icon: Folder,
      color: 'bg-[#15803D]',
      textColor: 'text-white',
      badge: 'Archivo Físico',
      visible: canUserAccessTab(currentUser, 'shelves'),
    },
    {
      id: 'institutional_inventory',
      title: 'Inventario Institucional y Medios',
      description: 'Inventariado completo de Sede Central y Espacio Esperanza (marca, modelo, accesorios, titularidad institucional vs prestado y responsable).',
      icon: Package,
      color: 'bg-[#166534]',
      textColor: 'text-white',
      badge: 'Patrimonio y Equipos',
      visible: canUserAccessTab(currentUser, 'institutional_inventory'),
    },
    {
      id: 'shelves_mgmt',
      title: 'Gestión de Estantes Físicos',
      description: 'Editar nombres de estantes, crear nuevos, eliminar y organizar los folios y objetos que contendrá cada estante.',
      icon: Layers,
      color: 'bg-[#0F766E]',
      textColor: 'text-white',
      badge: 'Mobiliario y Organización',
      visible: canUserAccessTab(currentUser, 'shelves_mgmt'),
    },
    {
      id: 'notices',
      title: 'Avisos y Alertas Institucionales',
      description: currentUser.role === 'ADMIN' 
        ? 'Enviar alertas, notificaciones y avisos urgentes a las áreas o a toda la oficina con seguimiento de lectura.' 
        : 'Consultar comunicados y avisos oficiales emitidos por Coordinación General y confirmar lectura.',
      icon: Bell,
      color: 'bg-amber-600',
      textColor: 'text-white',
      badge: activeAlerts.length > 0 ? `${activeAlerts.length} activos` : undefined,
      visible: canUserAccessTab(currentUser, 'notices'),
    },
    {
      id: 'inscriptions',
      title: 'Fichas de Inscripción y Convocatorias',
      description: 'Convocatorias por área: torneos de fútbol por equipo, hockey infantil, shows de talentos, jornadas ambientales y eventos.',
      icon: ClipboardList,
      color: 'bg-[#0369A1]',
      textColor: 'text-white',
      badge: 'Equipos y Eventos',
      visible: canUserAccessTab(currentUser, 'inscriptions'),
    },
    {
      id: 'documents',
      title: 'Archivo General Documental',
      description: 'Búsqueda por código de folio, fecha, año y soporte físico con etiquetas QR.',
      icon: FileText,
      color: 'bg-[#334155]',
      textColor: 'text-white',
      badge: 'Buscador Central',
      visible: canUserAccessTab(currentUser, 'documents'),
    },
    {
      id: 'kids',
      title: 'Niñez y Adolescencia',
      description: currentUser.role === 'SECRETARIO'
        ? 'Inscripción de niños a eventos y actividades específicas del área operativa.'
        : 'Padrón unificado de participantes, autorizaciones físicas de padres y fichas de salud.',
      icon: Users,
      color: 'bg-[#15803D]',
      textColor: 'text-white',
      badge: currentUser.role === 'SECRETARIO' ? 'Inscripción a Eventos' : 'Padrón Institucional',
      visible: canUserAccessTab(currentUser, 'kids'),
    },
    {
      id: 'inventory',
      title: 'Préstamos con Firma Digital',
      description: 'Retiro y firma de materiales deportivos, sonido, cámaras, micrófonos y herramientas con acta y control de devolución.',
      icon: Package,
      color: 'bg-[#166534]',
      textColor: 'text-white',
      badge: 'Firma Digital',
      visible: canUserAccessTab(currentUser, 'inventory'),
    },
    {
      id: 'requests',
      title: 'Pedidos de Materiales',
      description: 'Gestión y aprobación de solicitudes de insumos y recursos operativos presentadas por las áreas.',
      icon: SendHorizontal,
      color: 'bg-[#0F766E]',
      textColor: 'text-white',
      badge: 'Insumos & Recursos',
      visible: canUserAccessTab(currentUser, 'requests'),
    },
    {
      id: 'qr_lookup',
      title: 'Localizador QR de Estante',
      description: 'Búsqueda por código QR y visualización de la posición física de cajas y expedientes en baldas.',
      icon: QrCode,
      color: 'bg-[#0E7490]',
      textColor: 'text-white',
      badge: 'Escaneo Físico',
      visible: canUserAccessTab(currentUser, 'qr_lookup'),
    },
    {
      id: 'calendar',
      title: 'Calendario y Cartelera',
      description: 'Cronograma oficial de torneos, festivales comunitarios, muestras y jornadas.',
      icon: Calendar,
      color: 'bg-[#475569]',
      textColor: 'text-white',
      badge: 'Agenda Comunitaria',
      visible: canUserAccessTab(currentUser, 'calendar'),
    },
    {
      id: 'budget',
      title: 'Presupuesto y Balance Contable',
      description: 'Control de caja con bloqueo automático: no permite egresos mayores al saldo disponible en caja.',
      icon: Coins,
      color: 'bg-[#064E3B]',
      textColor: 'text-white',
      badge: `Saldo: $${availableBalance.toLocaleString('es-AR')}`,
      visible: canUserAccessTab(currentUser, 'budget'),
    },
    {
      id: 'users',
      title: 'Personal y Control de Roles',
      description: 'Exclusivo del Coordinador General: alta, modificación de contraseñas y bajas de usuarios.',
      icon: Users,
      color: 'bg-[#1E293B]',
      textColor: 'text-white',
      badge: 'Exclusivo Admin',
      visible: canUserAccessTab(currentUser, 'users'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-[#0D472C] text-[#F9F6EC] p-6 sm:p-7 shadow-lg border-2 border-emerald-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
                Panel de Inicio Institucional
              </span>
              <span className="text-xs text-emerald-200">Puerto Esperanza</span>
              <span className="text-xs font-semibold bg-emerald-900 px-2.5 py-0.5 rounded border border-emerald-700">
                {currentUser.role === 'ADMIN' ? '👑 Coordinador General' : currentUser.assignedArea || 'Acceso Público'}
              </span>
            </div>

            <h1 className="font-archival text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Bienvenido, {currentUser.name}
            </h1>
            <p className="text-xs text-emerald-100 max-w-xl mt-1.5 leading-relaxed">
              Seleccione a continuación el apartado que desea consultar o gestionar. Cada área y usuario cuenta con su espacio reservado de trabajo.
            </p>

            {/* Quick Institutional Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-emerald-800/80">
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 px-3.5 py-2 text-xs font-bold shadow-md transition cursor-pointer active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                <span>Proyecto Institucional de la Oficina</span>
              </button>

              <button
                onClick={() => setIsKeyCustodyModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-white px-3.5 py-2 text-xs font-bold border border-emerald-700 shadow-xs transition cursor-pointer active:scale-95"
              >
                <Key className="h-4 w-4 text-amber-300" />
                <span>Custodia de Llaves & Accesos</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 shrink-0 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Tu Usuario</span>
              <span className="font-mono text-sm font-bold text-white">{currentUser.username}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white text-[#0D472C] flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="h-6 w-6 text-[#0D472C]" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner if any */}
      {activeAlerts.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Avisos y Alertas Oficiales ({activeAlerts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs font-bold text-amber-900 underline hover:text-black cursor-pointer"
            >
              Ver todos los avisos →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {activeAlerts.slice(0, 2).map((notice) => (
              <div
                key={notice.id}
                onClick={() => onNavigateTab('notices')}
                className="p-3 bg-white rounded-xl border border-amber-300 shadow-xs cursor-pointer hover:border-amber-500 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    notice.nivel === 'URGENTE' ? 'bg-red-600 text-white' :
                    notice.nivel === 'IMPORTANTE' ? 'bg-amber-500 text-gray-950' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {notice.nivel}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{notice.fecha}</span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 truncate">{notice.titulo}</h4>
                <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{notice.mensaje}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Grid (Buttons for each section) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-archival text-lg font-bold text-[#0D472C]">
            Apartados del Centro de Medios y Archivos
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Acceso según permisos asignados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubCards
            .filter((c) => c.visible)
            .map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => onNavigateTab(card.id)}
                  className="rounded-2xl border-2 border-gray-200/80 bg-white p-5 shadow-xs hover:border-[#0D472C] hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Top row with icon & badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-md ${card.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {card.badge && (
                        <span className="text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2.5 py-1 rounded-lg border border-[#0D472C]/20 font-mono">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-archival text-base font-black text-gray-900 group-hover:text-[#0D472C] transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Bottom button indicator */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#0D472C] group-hover:translate-x-1 transition-transform">
                    <span>Ingresar al apartado</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Official Project Modal */}
      <InstitutionalProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Key Custody Modal */}
      <KeyCustodyModal
        isOpen={isKeyCustodyModalOpen}
        onClose={() => setIsKeyCustodyModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
