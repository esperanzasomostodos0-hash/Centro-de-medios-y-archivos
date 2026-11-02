import React, { useState } from 'react';
import { X, SendHorizontal, AlertCircle, Check } from 'lucide-react';
import { AreaRequest, OperativeArea, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmit: (request: AreaRequest) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  const [areaSolicitante, setAreaSolicitante] = useState<OperativeArea>(
    currentUser.assignedArea || 'CULTURA Y EVENTOS'
  );
  const [tipoSolicitud, setTipoSolicitud] = useState<AreaRequest['tipoSolicitud']>('Material de Inventario');
  const [urgencia, setUrgencia] = useState<AreaRequest['urgencia']>('Media');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadEstimada, setCantidadEstimada] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setErrorMsg('Debe detallar qué insumo o recurso necesita el área.');
      return;
    }

    const newReq: AreaRequest = {
      id: 'req-' + Date.now(),
      codigo: `SOL-${new Date().getFullYear()}-${Math.floor(Math.random() * 800 + 100)}`,
      areaSolicitante,
      tipoSolicitud,
      solicitanteNombre: currentUser.name,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      urgencia,
      descripcion: descripcion.trim(),
      cantidadEstimada: cantidadEstimada.trim(),
      estado: 'Pendiente',
    };

    onSubmit(newReq);
    onClose();
  };

  const isAreaLocked = currentUser.role === 'SOLICITANTE' && currentUser.assignedArea;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D472C] text-[#F9F6EC]">
              <SendHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                Nueva Solicitud de Recursos por Área
              </h3>
              <p className="text-xs text-[#162B1F]/70">
                Petición formal a inventario, diseño de medios o coordinación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Área Solicitante *
              </label>
              <select
                value={areaSolicitante}
                disabled={Boolean(isAreaLocked)}
                onChange={(e) => setAreaSolicitante(e.target.value as OperativeArea)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
              >
                {OPERATIVE_AREAS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tipo de Recurso *
              </label>
              <select
                value={tipoSolicitud}
                onChange={(e) => setTipoSolicitud(e.target.value as AreaRequest['tipoSolicitud'])}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              >
                <option value="Material de Inventario">Material de Inventario (Pelotas, insumos)</option>
                <option value="Diseño e Impresión Cartel">Diseño e Impresión Cartel (Flyers/Afiches)</option>
                <option value="Partida Presupuestaria">Partida Presupuestaria (Fondos para evento)</option>
                <option value="Uso de Espacio / Salón">Uso de Espacio / Salón Comunitario</option>
                <option value="Equipamiento Técnico">Equipamiento Técnico (Sonido/Computadoras)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nivel de Urgencia
              </label>
              <select
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value as AreaRequest['urgencia'])}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              >
                <option value="Baja">Baja (Próximas semanas)</option>
                <option value="Media">Media (Esta semana)</option>
                <option value="Alta">Alta (Próximas 48hs)</option>
                <option value="Urgente">Urgente (Para hoy / evento inmediato)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cantidad / Volumen Estimado
              </label>
              <input
                type="text"
                value={cantidadEstimada}
                onChange={(e) => setCantidadEstimada(e.target.value)}
                placeholder="Ej: 5 pelotas, 40 afiches, $50.000"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Descripción detallada de la necesidad y destino *
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explique para qué actividad se utilizará, quién lo retira y fecha del evento..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0D472C]/20">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-5 py-2 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] shadow-md transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Enviar Pedido a Coordinación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
