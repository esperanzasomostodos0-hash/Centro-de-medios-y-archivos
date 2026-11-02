import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Send, 
  AlertCircle,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { OfficeNotice, UserProfile, OperativeArea } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface NoticesAlertsViewProps {
  currentUser: UserProfile;
}

export const NoticesAlertsView: React.FC<NoticesAlertsViewProps> = ({
  currentUser,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const [notices, setNotices] = useState<OfficeNotice[]>(() => StorageService.getNotices());
  const [allUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [isCreatingNotice, setIsCreatingNotice] = useState(false);
  const [filterMode, setFilterMode] = useState<'TODOS' | 'MIS_AVISOS' | 'NO_LEIDOS'>('TODOS');
  const [expandedReceiptsNoticeId, setExpandedReceiptsNoticeId] = useState<string | null>(null);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [nivel, setNivel] = useState<OfficeNotice['nivel']>('IMPORTANTE');
  const [destinatarioTipo, setDestinatarioTipo] = useState<'TODOS' | 'AREA' | 'SELECCIONADOS'>('TODOS');
  const [areaDestino, setAreaDestino] = useState<OperativeArea>('DEPORTES Y ACCIÓN SOCIAL');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('error', 'Solo el Coordinador General puede emitir avisos y alertas oficiales.');
      return;
    }
    if (!titulo.trim() || !mensaje.trim()) {
      showNotification('error', 'El título y el mensaje del aviso son obligatorios.');
      return;
    }

    if (destinatarioTipo === 'SELECCIONADOS' && selectedUserIds.length === 0) {
      showNotification('error', 'Seleccione al menos un integrante de la lista.');
      return;
    }

    const selectedMembers = allUsers.filter((u) => selectedUserIds.includes(u.id));

    const newNotice: OfficeNotice = {
      id: 'not-' + Date.now(),
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      nivel,
      areaDestino: destinatarioTipo === 'AREA' ? areaDestino : 'TODAS',
      destinatarioTipo,
      destinatariosIds: destinatarioTipo === 'SELECCIONADOS' ? selectedUserIds : undefined,
      destinatariosNombres: destinatarioTipo === 'SELECCIONADOS' ? selectedMembers.map((m) => m.name) : undefined,
      leidoPor: [
        {
          userId: currentUser.id || currentUser.username,
          userName: currentUser.name,
          leidoEn: new Date().toISOString(),
        },
      ],
      creadoPor: currentUser.name + ' (Coordinación)',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activo: true,
      urgente: nivel === 'URGENTE',
    };

    const updated = StorageService.saveNotice(newNotice, currentUser);
    setNotices(updated);
    setIsCreatingNotice(false);
    setTitulo('');
    setMensaje('');
    setNivel('IMPORTANTE');
    setDestinatarioTipo('TODOS');
    setSelectedUserIds([]);
    showNotification('success', 'Aviso y alerta emitidos correctamente en el sistema central.');
  };

  const handleToggleNotice = (id: string) => {
    if (!isAdmin) return;
    const updated = StorageService.toggleNotice(id, currentUser);
    setNotices(updated);
    showNotification('success', 'Estado de la alerta modificado');
  };

  const handleDeleteNotice = (id: string) => {
    if (!isAdmin) return;
    const updated = StorageService.deleteNotice(id, currentUser);
    setNotices(updated);
    showNotification('success', 'Aviso eliminado del historial');
  };

  const handleMarkAsRead = (noticeId: string) => {
    const updated = StorageService.markNoticeAsRead(noticeId, currentUser);
    setNotices(updated);
    showNotification('success', 'Marcado como leído.');
  };

  // Check if current user is an intended recipient
  const isForCurrentUser = (notice: OfficeNotice): boolean => {
    if (isAdmin) return true;
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

  const hasUserRead = (notice: OfficeNotice, user: UserProfile): boolean => {
    return Boolean(
      notice.leidoPor?.some((r) => r.userId === user.id || r.userId === user.username)
    );
  };

  // Filter notices for display
  const visibleNotices = notices.filter((n) => {
    if (!isForCurrentUser(n) && !isAdmin) return false;
    if (filterMode === 'MIS_AVISOS') {
      return isForCurrentUser(n);
    }
    if (filterMode === 'NO_LEIDOS') {
      return isForCurrentUser(n) && !hasUserRead(n, currentUser);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-amber-600 text-white p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-white text-gray-950 px-2.5 py-0.5 rounded uppercase">
                Comunicación Institucional Centralizada
              </span>
              <span className="text-xs text-amber-100">Puerto Esperanza</span>
              <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded border border-white/20">
                {visibleNotices.filter((n) => n.activo).length} alertas vigentes
              </span>
            </div>

            <h1 className="font-archival text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Avisos, Alertas y Comunicaciones Internas
            </h1>
            <p className="text-xs text-amber-50 max-w-xl mt-1.5 leading-relaxed">
              Emisión de directivas oficiales para todo el equipo, áreas operativas o integrantes seleccionados, con confirmación de lectura en tiempo real.
            </p>
          </div>

          {isAdmin && !isCreatingNotice && (
            <button
              onClick={() => setIsCreatingNotice(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-white text-amber-950 hover:bg-amber-100 px-5 py-3 text-xs font-bold shadow-md transition cursor-pointer self-start md:self-auto active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Emitir Nuevo Aviso o Alerta</span>
            </button>
          )}
        </div>
      </div>

      {notificationMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in ${
          notificationMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
        }`}>
          {notificationMsg.type === 'success' ? <Check className="h-4 w-4 text-emerald-700" /> : <AlertCircle className="h-4 w-4 text-red-700" />}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterMode === 'TODOS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Todos ({notices.length})
          </button>
          <button
            onClick={() => setFilterMode('MIS_AVISOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterMode === 'MIS_AVISOS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dirigidos a Mí ({notices.filter(isForCurrentUser).length})
          </button>
          <button
            onClick={() => setFilterMode('NO_LEIDOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterMode === 'NO_LEIDOS'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pendientes de Lectura ({notices.filter((n) => isForCurrentUser(n) && !hasUserRead(n, currentUser)).length})
          </button>
        </div>

        <div className="text-[11px] text-gray-500 font-semibold">
          Usuario actual: <span className="font-bold text-gray-800">{currentUser.name}</span>
        </div>
      </div>

      {/* FORM: EMIT NEW NOTICE / ALERT (ADMIN ONLY) */}
      {isCreatingNotice && isAdmin && (
        <div className="rounded-3xl border-2 border-amber-600 bg-[#FFFDF8] p-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-archival text-base font-bold text-amber-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              <span>Redactar y Emitir Comunicado Oficial</span>
            </h3>
            <button
              onClick={() => setIsCreatingNotice(false)}
              className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Título o Asunto de la Alerta *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Cierre de Entrega de Planillas de Asistencia del Mes"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nivel de Prioridad *</label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="INFO">Informativo (General)</option>
                  <option value="IMPORTANTE">Importante (Atención requerida)</option>
                  <option value="URGENTE">Urgente / Alerta Máxima (Acción inmediata)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Modalidad de Destinatarios *</label>
                <select
                  value={destinatarioTipo}
                  onChange={(e) => setDestinatarioTipo(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value="TODOS">Todo el Personal / Equipo General</option>
                  <option value="AREA">Por Área Operativa Específica</option>
                  <option value="SELECCIONADOS">Integrantes Específicos (Seleccionar)</option>
                </select>
              </div>
            </div>

            {/* If Destinatario Tipo is AREA */}
            {destinatarioTipo === 'AREA' && (
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                <label className="block font-bold text-emerald-900 mb-1">Seleccionar Área Destino *</label>
                <select
                  value={areaDestino}
                  onChange={(e) => setAreaDestino(e.target.value as OperativeArea)}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  {OPERATIVE_AREAS.map((a) => (
                    <option key={a.key} value={a.key}>{a.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* If Destinatario Tipo is SELECCIONADOS */}
            {destinatarioTipo === 'SELECCIONADOS' && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <label className="block font-bold text-amber-950 mb-2">
                  Seleccionar Integrantes que deben recibir y leer este aviso:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {allUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 font-bold text-amber-950'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                        <div className="truncate">
                          <div>{user.name}</div>
                          <div className="text-[10px] text-gray-500 font-normal">{user.position}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div className="text-[11px] text-amber-800 font-semibold mt-2">
                  {selectedUserIds.length} integrantes seleccionados
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Cuerpo del Mensaje / Directiva *
              </label>
              <textarea
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escriba aquí los detalles, plazos, requerimientos o instrucciones para el personal..."
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCreatingNotice(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Emitir Comunicado a las Áreas</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* NOTICES LIST */}
      <div className="space-y-4">
        {visibleNotices.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 text-xs">
            <Bell className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <span>No hay avisos o alertas en este momento para la vista seleccionada.</span>
          </div>
        ) : (
          visibleNotices.map((notice) => {
            const userRead = hasUserRead(notice, currentUser);
            const totalReads = notice.leidoPor?.length || 0;
            const isReceiptsExpanded = expandedReceiptsNoticeId === notice.id;

            return (
              <div
                key={notice.id}
                className={`rounded-2xl border-2 bg-white p-5 shadow-xs transition ${
                  notice.activo ? (notice.nivel === 'URGENTE' ? 'border-red-300 bg-red-50/20' : 'border-amber-300') : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      notice.nivel === 'URGENTE' ? 'bg-red-600 text-white' :
                      notice.nivel === 'IMPORTANTE' ? 'bg-amber-500 text-gray-950 font-black' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {notice.nivel}
                    </span>

                    <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {notice.fecha} ({notice.hora} hs)
                    </span>

                    <span className="text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 rounded">
                      {notice.destinatarioTipo === 'SELECCIONADOS'
                        ? `Destinado a ${notice.destinatariosNombres?.length || 0} integrantes específicos`
                        : notice.destinatarioTipo === 'AREA'
                        ? `Área: ${notice.areaDestino}`
                        : 'Para todo el equipo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Read status button for current user */}
                    {userRead ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Leído por vos</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(notice.id)}
                        className="flex items-center gap-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Marcar como leído</span>
                      </button>
                    )}

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleNotice(notice.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                            notice.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {notice.activo ? 'Activa' : 'Pausada'}
                        </button>

                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                          title="Eliminar aviso"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-archival text-base font-bold text-gray-900 mb-1">
                  {notice.titulo}
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                  {notice.mensaje}
                </p>

                {/* Specific recipients list tags if any */}
                {notice.destinatariosNombres && notice.destinatariosNombres.length > 0 && (
                  <div className="mb-3 p-2 rounded-xl bg-gray-50 border border-gray-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-gray-500 mr-1">Dirigido a:</span>
                    {notice.destinatariosNombres.map((name, i) => (
                      <span key={i} className="bg-white px-2 py-0.5 rounded-md border text-gray-700 font-medium">
                        {name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer with Read Receipt Tracking Accordion */}
                <div className="border-t pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500">
                  <div>
                    <span>Emitido por: <strong className="text-gray-700">{notice.creadoPor}</strong></span>
                  </div>

                  {/* Read receipts button */}
                  <button
                    onClick={() => setExpandedReceiptsNoticeId(isReceiptsExpanded ? null : notice.id)}
                    className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 cursor-pointer self-start sm:self-auto"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Seguimiento de lectura ({totalReads} leídos)</span>
                    {isReceiptsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Expanded Read Receipts Drawer */}
                {isReceiptsExpanded && (
                  <div className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs animate-in fade-in">
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Integrantes que confirmaron lectura ({totalReads}):</span>
                    </h4>

                    {notice.leidoPor && notice.leidoPor.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {notice.leidoPor.map((rec, i) => (
                          <div key={i} className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-between">
                            <span className="font-bold text-gray-800 text-[11px]">{rec.userName}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(rec.leidoEn).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}{' '}
                              {new Date(rec.leidoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-500 italic">
                        Ningún integrante ha marcado este comunicado todavía.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
