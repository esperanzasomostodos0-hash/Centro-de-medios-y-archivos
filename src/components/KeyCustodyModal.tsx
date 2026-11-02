import React, { useState } from 'react';
import { 
  Key, 
  Plus, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  User, 
  Check, 
  AlertCircle,
  X,
  Lock,
  Unlock
} from 'lucide-react';
import { KeyCustodyLog, UserProfile } from '../types';
import { StorageService } from '../services/storageService';

interface KeyCustodyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const KeyCustodyModal: React.FC<KeyCustodyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [logs, setLogs] = useState<KeyCustodyLog[]>(() => StorageService.getKeyCustodyLogs());
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [responsableNombre, setResponsableNombre] = useState(currentUser.name);
  const [accion, setAccion] = useState<KeyCustodyLog['accion']>('Apertura de Oficina');
  const [llaveEstado, setLlaveEstado] = useState<KeyCustodyLog['llaveEstado']>('En Custodia de Almada');
  const [observaciones, setObservaciones] = useState('');

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsableNombre.trim()) {
      showNotification('error', 'El nombre del responsable es obligatorio.');
      return;
    }

    const newLog: KeyCustodyLog = {
      id: 'key-' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsableNombre: responsableNombre.trim(),
      accion,
      observaciones: observaciones.trim() || 'Registro oficial de acceso.',
      llaveEstado,
    };

    const updated = StorageService.saveKeyCustodyLog(newLog, currentUser);
    setLogs(updated);
    setIsAdding(false);
    setObservaciones('');
    showNotification('success', 'Registro de llave y acceso asentado correctamente.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FFFDF8] border-2 border-amber-600 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-md">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-archival text-base font-bold text-white">
                Custodia de Llaves y Control de Acceso
              </h3>
              <p className="text-[11px] text-amber-100">
                Sección 10 del Proyecto Institucional • Resguardo y Apertura de Oficina
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-amber-100 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {notificationMsg && (
            <div className={`p-3 rounded-xl font-bold flex items-center gap-2 ${
              notificationMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
            }`}>
              {notificationMsg.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{notificationMsg.text}</span>
            </div>
          )}

          {/* Current Key Status Card */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Último Estado de Llave:</span>
              <div className="font-bold text-gray-900 text-sm mt-0.5 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-700" />
                <span>{logs[0]?.llaveEstado || 'En Custodia de Almada'}</span>
              </div>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                Última acción: {logs[0]?.accion || 'Apertura de Oficina'} por {logs[0]?.responsableNombre || 'Almada Eduardo Thomas'}
              </span>
            </div>

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Asentar Movimiento</span>
              </button>
            )}
          </div>

          {/* Form */}
          {isAdding && (
            <form onSubmit={handleSave} className="p-4 rounded-2xl border-2 border-amber-400 bg-white space-y-3 animate-in fade-in">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>Registrar Entrada / Salida / Traspaso de Llave</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Responsable *</label>
                  <input
                    type="text"
                    value={responsableNombre}
                    onChange={(e) => setResponsableNombre(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Acción Realizada *</label>
                  <select
                    value={accion}
                    onChange={(e) => setAccion(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-300 p-2 text-xs font-semibold"
                  >
                    <option value="Apertura de Oficina">Apertura de Oficina</option>
                    <option value="Cierre y Bloqueo de Oficina">Cierre y Bloqueo de Oficina</option>
                    <option value="Traspaso de Llave">Traspaso de Llave</option>
                    <option value="Revisión de Seguridad y Candados">Revisión de Seguridad y Candados</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Estado de la Llave *</label>
                <select
                  value={llaveEstado}
                  onChange={(e) => setLlaveEstado(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 p-2 text-xs font-semibold"
                >
                  <option value="En Custodia de Almada">En Custodia de Almada Eduardo Thomas</option>
                  <option value="En Custodia de Pablo">En Custodia de Pablo González</option>
                  <option value="En Custodia de Renzo">En Custodia de Renzo Vázquez</option>
                  <option value="En Custodia de Demian">En Custodia de Demian</option>
                  <option value="En Tablero Seguro">En Tablero Seguro de la Sede</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observaciones / Novedades</label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Se guardó cámara en caja con candado. Ventana cerrada correctamente."
                  className="w-full rounded-xl border border-gray-300 p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          )}

          {/* History */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">
              Historial de Custodia y Accesos ({logs.length})
            </h4>

            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{log.accion}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded">
                      {log.llaveEstado}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">{log.observaciones}</p>
                </div>
                <div className="text-right text-[10px] text-gray-400 font-mono shrink-0">
                  <div className="font-bold text-gray-700">{log.responsableNombre}</div>
                  <div>{log.fecha} • {log.hora} hs</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
