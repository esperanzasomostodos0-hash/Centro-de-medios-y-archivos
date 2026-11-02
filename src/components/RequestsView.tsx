import React, { useState } from 'react';
import { 
  SendHorizontal, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Plus, 
  ShieldCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { AreaRequest, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface RequestsViewProps {
  requests: AreaRequest[];
  currentUser: UserProfile;
  onOpenNewRequest: () => void;
  onUpdateStatus: (reqId: string, status: AreaRequest['estado'], responseNote: string) => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  currentUser,
  onOpenNewRequest,
  onUpdateStatus,
}) => {
  const [activeReqId, setActiveReqId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // If user is SOLICITANTE, filter to their area as required: "Solo ve lo suyo y el estado de su pedido"
  const visibleRequests = requests.filter((r) => {
    if (currentUser.role === 'SOLICITANTE' && currentUser.assignedArea) {
      return r.areaSolicitante === currentUser.assignedArea;
    }
    return true;
  });

  const handleResolve = (status: AreaRequest['estado']) => {
    if (!activeReqId) return;
    onUpdateStatus(activeReqId, status, responseText.trim());
    setActiveReqId(null);
    setResponseText('');
  };

  const getUrgencyBadge = (urg: AreaRequest['urgencia']) => {
    switch (urg) {
      case 'Urgente': return 'bg-red-100 text-red-800 border-red-300';
      case 'Alta': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Media': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Baja': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (st: AreaRequest['estado']) => {
    switch (st) {
      case 'Pendiente': return 'bg-amber-100 text-amber-900 border-amber-400';
      case 'Aprobado': return 'bg-emerald-100 text-emerald-900 border-emerald-400';
      case 'Entregado': return 'bg-green-700 text-white border-green-800';
      case 'Rechazado': return 'bg-red-100 text-red-900 border-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <h2 className="font-archival text-xl font-bold text-[#0D472C]">
            Módulo de Solicitudes y Pedidos por Áreas
          </h2>
          <p className="text-xs text-gray-600">
            Circuito interno: Solicitantes piden insumos, cartelería o fondos • Coordinación General aprueba y gestiona
          </p>
        </div>

        {currentUser.role !== 'VISITANTE' && (
          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Solicitud de Área</span>
          </button>
        )}
      </div>

      {currentUser.role === 'SOLICITANTE' && (
        <div className="rounded-xl bg-[#E8F3ED] p-3.5 border border-[#0D472C]/30 text-xs text-[#0D472C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>
              Vista restringida al área: <strong>{currentUser.assignedArea}</strong>. Aquí sigues el estado en tiempo real de tus pedidos.
            </span>
          </div>
          <span className="font-bold">
            {visibleRequests.filter((r) => r.estado === 'Pendiente').length} en espera
          </span>
        </div>
      )}

      {/* Requests list */}
      <div className="space-y-4">
        {visibleRequests.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#0D472C]/30 bg-white p-12 text-center">
            <SendHorizontal className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="font-archival mt-3 text-base font-bold text-gray-700">
              No hay solicitudes registradas
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Presione "Nueva Solicitud de Área" para pedir insumos a inventario o carteles a diseño.
            </p>
          </div>
        ) : (
          visibleRequests.map((req) => {
            const isPending = req.estado === 'Pendiente';
            const isAdmin = currentUser.role === 'ADMIN';

            return (
              <div
                key={req.id}
                className="rounded-2xl border border-[#0D472C]/20 bg-white p-5 shadow-xs transition hover:shadow-md space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tag text-xs font-bold text-[#0D472C] bg-[#E8F3ED] px-2 py-0.5 rounded">
                      {req.codigo}
                    </span>
                    <span className="text-xs font-bold text-white bg-[#0D472C] px-2.5 py-0.5 rounded">
                      {req.areaSolicitante}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {req.tipoSolicitud}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getUrgencyBadge(req.urgencia)}`}>
                      Urgencia: {req.urgencia}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusBadge(req.estado)}`}>
                      {req.estado}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {req.descripcion}
                  </p>
                  {req.cantidadEstimada && (
                    <span className="mt-1 text-[11px] font-mono text-[#0D472C] font-bold block">
                      Estimado pedido: {req.cantidadEstimada}
                    </span>
                  )}
                </div>

                {/* Resolution note from admin if exists */}
                {req.respuestaAdmin && (
                  <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#0D472C]/20 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#0D472C] mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Resolución de Coordinación General ({req.fechaRespuesta}):</span>
                    </div>
                    <p className="text-gray-700 italic">
                      "{req.respuestaAdmin}"
                    </p>
                  </div>
                )}

                {/* Footer and Admin actions */}
                <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                  <span>
                    Solicitado por: <strong>{req.solicitanteNombre}</strong> el {req.fechaSolicitud}
                  </span>

                  {isAdmin && isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveReqId(req.id);
                          setResponseText('Aprobado. Se asignan insumos del depósito central.');
                        }}
                        className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-800 transition cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Aprobar Solicitud
                      </button>
                      <button
                        onClick={() => {
                          setActiveReqId(req.id);
                          setResponseText('Rechazado temporalmente por falta de cupo presupuestario.');
                        }}
                        className="flex items-center gap-1 rounded-lg border border-red-300 text-red-700 px-3 py-1 text-xs font-bold hover:bg-red-50 transition cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {isAdmin && req.estado === 'Aprobado' && (
                    <button
                      onClick={() => onUpdateStatus(req.id, 'Entregado', req.respuestaAdmin || 'Entregado en mano.')}
                      className="flex items-center gap-1 rounded-lg bg-[#0D472C] px-3 py-1 text-xs font-bold text-white hover:bg-[#165B3A] transition cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Marcar como Entregado
                    </button>
                  )}
                </div>

                {/* Admin Modal Prompt when resolving */}
                {activeReqId === req.id && (
                  <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-300 space-y-2">
                    <label className="block text-xs font-bold text-gray-700">
                      Observación / Mensaje al Solicitante de {req.areaSolicitante}:
                    </label>
                    <input
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs"
                      placeholder="Indique fecha de entrega o motivo de la resolución..."
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setActiveReqId(null)}
                        className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleResolve('Aprobado')}
                        className="bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs hover:bg-emerald-800"
                      >
                        Confirmar Aprobación
                      </button>
                      <button
                        onClick={() => handleResolve('Rechazado')}
                        className="bg-red-700 text-white font-bold px-3 py-1 rounded text-xs hover:bg-red-800"
                      >
                        Confirmar Rechazo
                      </button>
                    </div>
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
