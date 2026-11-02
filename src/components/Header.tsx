import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserCheck, 
  Users, 
  Eye, 
  Download, 
  Upload, 
  RotateCcw, 
  Smartphone, 
  Search, 
  Wifi, 
  WifiOff, 
  UserCog,
  LogOut,
  Building2,
  Bell,
  Cloud,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { UserProfile, UserRole, OfficeNotice } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { StorageService } from '../services/storageService';

interface HeaderProps {
  currentUser: UserProfile;
  onSearchFolio: (query: string) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonString: string) => void;
  onResetFactory: () => void;
  onOpenUserManagement: () => void;
  onLogout: () => void;
  onOpenDigitize?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSearchFolio,
  onExportBackup,
  onImportBackup,
  onResetFactory,
  onOpenUserManagement,
  onLogout,
  onOpenDigitize,
  onNavigateTab,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [searchVal, setSearchVal] = useState('');
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notices, setNotices] = useState<OfficeNotice[]>(() => {
    try {
      return StorageService.getNotices();
    } catch {
      return [];
    }
  });

  // Listen to data change events for live notices & sync
  useEffect(() => {
    const handleSync = () => {
      try {
        setNotices(StorageService.getNotices());
      } catch {}
    };
    window.addEventListener('cma_data_changed', handleSync);
    return () => window.removeEventListener('cma_data_changed', handleSync);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearchFolio(searchVal.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Determine which notices are targeted to current user and unread
  const isForCurrentUser = (notice: OfficeNotice): boolean => {
    if (currentUser.role === 'ADMIN') return true;
    if (notice.destinatarioTipo === 'TODOS' || !notice.destinatarioTipo) {
      if (notice.areaDestino === 'TODAS') return true;
      return currentUser.assignedArea === notice.areaDestino;
    }
    if (notice.destinatarioTipo === 'AREA') {
      return currentUser.assignedArea === notice.areaDestino;
    }
    if (notice.destinatarioTipo === 'SELECCIONADOS' || notice.destinatarioTipo === 'INDIVIDUAL') {
      return (
        notice.destinatariosIds?.includes(currentUser.id) ||
        notice.destinatariosIds?.includes(currentUser.username) ||
        false
      );
    }
    return true;
  };

  const hasRead = (notice: OfficeNotice): boolean => {
    return Boolean(
      notice.leidoPor?.some((r) => r.userId === currentUser.id || r.userId === currentUser.username)
    );
  };

  const relevantNotices = notices.filter(isForCurrentUser);
  const unreadNotices = relevantNotices.filter((n) => !hasRead(n));
  const unreadCount = unreadNotices.length;

  const handleMarkAsRead = (noticeId: string) => {
    const updated = StorageService.markNoticeAsRead(noticeId, currentUser);
    setNotices(updated);
  };

  const requestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Centro de Medios y Archivos', {
        body: 'Notificaciones activadas. Recibirás avisos institucionales oficiales en este dispositivo.',
        icon: '/assets/aistudio/7b7d3321-35c1-4d47-9d2f-28cfcd4eb5e9_72fa0376.jpg',
      });
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: '👑 COORDINADOR GENERAL', color: 'bg-emerald-950 text-amber-300 border-amber-400/40' };
      case 'SECRETARIO':
        return { label: 'SECRETARIO DE OFICINA', color: 'bg-emerald-800 text-white border-emerald-600' };
      case 'CARGADOR_DATOS':
        return { label: `CARGADOR (${currentUser.assignedArea?.split(' ')[0] || 'ÁREA'})`, color: 'bg-emerald-900 text-white border-emerald-700' };
      case 'SOLICITANTE':
        return { label: `SOLICITANTE (${currentUser.assignedArea?.split(' ')[0] || 'ÁREA'})`, color: 'bg-amber-900 text-amber-100 border-amber-800' };
      case 'VISITANTE':
        return { label: 'CONSULTA PÚBLICA (SIN ÁREA)', color: 'bg-stone-700 text-stone-100 border-stone-600' };
    }
  };

  const roleMeta = getRoleLabel(currentUser.role);

  return (
    <header className="border-b-2 border-[#0D472C] bg-[#FFFDF8] shadow-sm sticky top-0 z-40">
      {/* Top bar for connectivity status and institution branding */}
      <div className="bg-[#0D472C] text-[#F9F6EC] px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase text-[10px]">
            CENTRO DE MEDIOS Y ARCHIVOS • PUERTO ESPERANZA
          </span>
          {/* Real-time Centralized sync badge */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-emerald-950/80 text-emerald-200 border border-emerald-700/60 px-2 py-0.5 rounded-full">
            <Cloud className="h-3 w-3 text-emerald-400" />
            <span>Centralizado en Vivo</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-200 text-[10px]">
                <Wifi className="h-3 w-3" /> Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300 text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded">
                <WifiOff className="h-3 w-3" /> Modo Sin Conexión
              </span>
            )}
          </div>

          {/* Admin Tools */}
          {currentUser.role === 'ADMIN' && (
            <div className="flex items-center gap-1.5 border-l border-emerald-700/60 pl-2">
              <button
                onClick={onOpenUserManagement}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-2 py-0.5 rounded transition flex items-center gap-1 text-[11px] font-bold shadow-xs cursor-pointer"
                title="Administrar usuarios y personal de la oficina"
              >
                <UserCog className="h-3.5 w-3.5" />
                <span>Personal</span>
              </button>
              <button
                onClick={onExportBackup}
                title="Exportar copia de seguridad del archivo"
                className="hidden md:flex hover:text-amber-200 transition items-center gap-1 text-[10px] cursor-pointer"
              >
                <Download className="h-3 w-3" /> Copia Respaldo
              </button>
              <label className="hidden md:flex hover:text-amber-200 transition items-center gap-1 text-[10px] cursor-pointer">
                <Upload className="h-3 w-3" /> Restaurar
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={onResetFactory}
                title="Restablecer datos de inicio"
                className="hidden md:flex hover:text-red-300 transition items-center gap-1 text-[10px] cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Base
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/7b7d3321-35c1-4d47-9d2f-28cfcd4eb5e9_72fa0376.jpg"
            alt="Centro de Medios y Archivos"
            className="h-12 w-auto rounded border border-[#0D472C]/40 shadow-xs object-cover"
          />
          <div>
            <h1 className="font-archival text-base sm:text-lg font-black text-[#0D472C] tracking-tight leading-tight">
              CENTRO DE MEDIOS Y ARCHIVOS
            </h1>
            <p className="text-[11px] font-semibold text-gray-700 flex items-center gap-1">
              <span>Puerto Esperanza</span>
              <span className="text-[#0D472C]">●</span>
              <span className="italic text-[#0D472C] font-normal">Esperanza somos TODOS • Huella Verde</span>
            </p>
          </div>
        </div>

        {/* Action icons, Bell, Search & User profile with Logout */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Direct "Subir Papel / Digitalizar" button */}
          {currentUser.role !== 'VISITANTE' && onOpenDigitize && (
            <button
              onClick={onOpenDigitize}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] hover:bg-[#165B3A] text-[#F9F6EC] px-3 py-1.5 text-xs font-bold shadow-sm transition cursor-pointer"
              title="Sacar foto o subir papel a los folios de los estantes"
            >
              <span className="text-sm">📸</span>
              <span>Subir Papel</span>
            </button>
          )}

          {/* Quick Folio Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative grow sm:grow-0">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar Folio..."
              className="font-mono-tag w-full sm:w-32 md:w-40 rounded-lg border border-gray-300 bg-[#FAF7F0] pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          </form>

          {/* NOTIFICATION CENTER BELL WITH UNREAD BADGE */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="relative p-2 rounded-xl bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 transition cursor-pointer border border-gray-200"
              title="Centro de Notificaciones y Avisos"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Dropdown */}
            {showNotifDrawer && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border-2 border-amber-600 z-50 p-4 text-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-gray-900 text-sm">Avisos y Alertas</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full">
                      {unreadCount} sin leer
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifDrawer(false)}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {unreadNotices.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                      <p className="font-semibold text-[11px]">Estás al día</p>
                      <p className="text-[10px] text-gray-400">No tienes comunicados pendientes de lectura.</p>
                    </div>
                  ) : (
                    unreadNotices.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border ${
                          n.nivel === 'URGENTE' ? 'bg-red-50 border-red-200' : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            n.nivel === 'URGENTE' ? 'bg-red-600 text-white' : 'bg-amber-400 text-gray-950'
                          }`}>
                            {n.nivel}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{n.fecha} {n.hora}</span>
                        </div>
                        <div className="font-bold text-gray-900 leading-tight mb-1">{n.titulo}</div>
                        <div className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mb-2">{n.mensaje}</div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{n.creadoPor}</span>
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-300 px-2 py-0.5 rounded cursor-pointer"
                          >
                            ✓ Marcar leído
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t flex items-center justify-between gap-2">
                  <button
                    onClick={requestBrowserNotification}
                    className="text-[10px] font-bold text-gray-600 hover:text-black underline cursor-pointer"
                  >
                    Activar en Navegador
                  </button>
                  {onNavigateTab && (
                    <button
                      onClick={() => {
                        setShowNotifDrawer(false);
                        onNavigateTab('notices');
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-950 cursor-pointer"
                    >
                      <span>Ver todas ({notices.length})</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#165B3A] shadow-xs transition cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {/* Logged in User Profile Info + Direct Logout */}
          <div className="flex items-center gap-2 bg-white border border-[#0D472C]/25 rounded-xl px-2.5 py-1.5 shadow-xs">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
              </div>
            </div>

            {/* DIRECT Logout button */}
            <button
              onClick={() => onLogout()}
              title="Cerrar Sesión de la Oficina"
              className="flex items-center gap-1 py-1 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition cursor-pointer text-xs font-bold border border-red-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border-2 border-[#0D472C]">
            <h3 className="text-base font-bold text-[#0D472C]">Instalar en iPhone o iPad</h3>
            <p className="mt-2 text-xs text-gray-700 leading-relaxed">
              1. En Safari, toque el botón <strong>Compartir</strong>.<br /><br />
              2. Deslice hacia abajo y seleccione <strong>"Agregar al inicio"</strong>.<br /><br />
              3. La app quedará instalada para operar de manera directa en su dispositivo.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-[#0D472C] py-2 text-xs font-bold text-white hover:bg-[#165B3A] transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
