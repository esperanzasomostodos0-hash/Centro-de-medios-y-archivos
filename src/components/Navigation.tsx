import { 
  Home,
  Building2,
  Folder, 
  Package, 
  Layers,
  Bell,
  ClipboardList,
  FileText, 
  Users, 
  SendHorizontal, 
  Coins, 
  Calendar, 
  QrCode,
  Lock,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { canUserAccessTab } from '../utils/permissions';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: UserProfile;
  pendingRequestsCount: number;
  activeLoansCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  pendingRequestsCount,
  activeLoansCount,
}) => {
  const tabs = [
    {
      id: 'home',
      label: 'Inicio',
      icon: Home,
      description: 'Panel central institucional',
    },
    {
      id: 'my_area',
      label: currentUser.role === 'ADMIN' ? 'Gestión de Áreas' : 'Mi Área',
      icon: Building2,
      description: 'Actas, materiales, pedidos y papeles',
    },
    {
      id: 'shelves',
      label: '15 Folios',
      icon: Folder,
      description: 'Papeles en estantes físicos',
    },
    {
      id: 'institutional_inventory',
      label: 'Inventario Sede',
      icon: Package,
      description: 'Sede Central y Espacio Esperanza',
    },
    {
      id: 'shelves_mgmt',
      label: 'Estantes Físicos',
      icon: Layers,
      description: 'Organización de estantes 1, 2, 3...',
    },
    {
      id: 'notices',
      label: 'Avisos & Alertas',
      icon: Bell,
      description: 'Comunicaciones de Coordinación',
    },
    {
      id: 'inscriptions',
      label: 'Convocatorias',
      icon: ClipboardList,
      description: 'Inscripción por equipos y talleres',
    },
    {
      id: 'documents',
      label: 'Archivo',
      icon: FileText,
      description: 'Buscador y foliado documental',
    },
    {
      id: 'kids',
      label: 'Niñez',
      icon: Users,
      description: 'Padrón y tutores',
    },
    {
      id: 'inventory',
      label: 'Préstamos',
      icon: Package,
      badge: activeLoansCount > 0 ? `${activeLoansCount}` : undefined,
      description: 'Firma digital de retiros',
    },
    {
      id: 'requests',
      label: 'Pedidos',
      icon: SendHorizontal,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
      description: 'Solicitudes de insumos',
    },
    {
      id: 'budget',
      label: 'Balance & Caja',
      icon: Coins,
      adminOnly: true,
      description: 'Exclusivo Coordinación General',
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: Calendar,
      description: 'Eventos comunitarios',
    },
    {
      id: 'qr_lookup',
      label: 'QR Estante',
      icon: QrCode,
      description: 'Buscador de estante físico',
    },
    {
      id: 'users',
      label: 'Personal',
      icon: UserCheck,
      adminOnly: true,
      description: 'Alta y control de usuarios',
    },
  ];

  return (
    <nav className="bg-[#FFFDF8] border-b border-[#0D472C]/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto py-2 gap-1.5 scrollbar-none">
        {tabs.map((tab) => {
          // Check permissions for this tab
          if (!canUserAccessTab(currentUser, tab.id)) {
            return null;
          }

          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#0D472C] text-[#F9F6EC] shadow-sm'
                  : 'text-gray-700 hover:bg-[#E8F3ED] hover:text-[#0D472C]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-amber-400 text-gray-900' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
