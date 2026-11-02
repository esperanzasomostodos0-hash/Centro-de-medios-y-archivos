import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Eye, 
  Sparkles,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { OfficeEvent, OperativeArea, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface CalendarViewProps {
  events: OfficeEvent[];
  currentUser: UserProfile;
  initialAreaFilter?: OperativeArea | 'TODAS';
  onEventsUpdated?: (events: OfficeEvent[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  currentUser,
  initialAreaFilter = 'TODAS',
  onEventsUpdated,
}) => {
  const [selectedArea, setSelectedArea] = useState<OperativeArea | 'TODAS'>(initialAreaFilter);
  const [localEvents, setLocalEvents] = useState<OfficeEvent[]>(events);

  // Can manage: Admin & Cargador de Datos
  const canManageCalendar = currentUser.role === 'ADMIN' || currentUser.role === 'CARGADOR_DATOS';

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form fields
  const [formTitulo, setFormTitulo] = useState('');
  const [formArea, setFormArea] = useState<OperativeArea>('DEPORTES Y ACCIÓN SOCIAL');
  const [formFecha, setFormFecha] = useState('');
  const [formHora, setFormHora] = useState('');
  const [formLugar, setFormLugar] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formResponsable, setFormResponsable] = useState(currentUser.name);
  const [formEsPublico, setFormEsPublico] = useState(true);
  const [formParticipantes, setFormParticipantes] = useState(50);
  const [errorMsg, setErrorMsg] = useState('');

  const currentList = events.length > 0 ? events : localEvents;

  // Filter visible events
  const visibleEvents = currentList.filter((e) => {
    if (currentUser.role === 'VISITANTE' && !e.esPublico) return false;
    if (selectedArea !== 'TODAS' && e.areaOperativa !== selectedArea) return false;
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setFormTitulo('');
    setFormArea(currentUser.assignedArea || 'DEPORTES Y ACCIÓN SOCIAL');
    setFormFecha(new Date().toISOString().split('T')[0]);
    setFormHora('15:00 a 18:00 hs');
    setFormLugar('Sede Central Puerto Esperanza');
    setFormDescripcion('');
    setFormResponsable(currentUser.name);
    setFormEsPublico(true);
    setFormParticipantes(40);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: OfficeEvent) => {
    setEditingEventId(e.id);
    setFormTitulo(e.titulo);
    setFormArea(e.areaOperativa);
    setFormFecha(e.fecha);
    setFormHora(e.hora);
    setFormLugar(e.lugar);
    setFormDescripcion(e.descripcion);
    setFormResponsable(e.responsable);
    setFormEsPublico(e.esPublico);
    setFormParticipantes(e.participantesEsperados);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCalendar) return;

    if (!formTitulo.trim() || !formFecha || !formLugar.trim()) {
      setErrorMsg('Título, fecha y lugar son requeridos.');
      return;
    }

    const eventPayload: OfficeEvent = {
      id: editingEventId || 'eve-' + Date.now(),
      titulo: formTitulo.trim(),
      areaOperativa: formArea,
      fecha: formFecha,
      hora: formHora.trim() || 'Horario a confirmar',
      lugar: formLugar.trim(),
      descripcion: formDescripcion.trim() || 'Actividad programada por el Centro de Medios y Archivos.',
      responsable: formResponsable.trim() || currentUser.name,
      esPublico: formEsPublico,
      participantesEsperados: Number(formParticipantes) || 0,
    };

    const updated = StorageService.saveEvent(eventPayload, currentUser);
    setLocalEvents(updated);
    if (onEventsUpdated) {
      onEventsUpdated(updated);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string, titulo: string) => {
    if (!canManageCalendar) return;
    if (window.confirm(`¿Estás seguro de eliminar el evento "${titulo}" del calendario?`)) {
      const updated = StorageService.deleteEvent(id, currentUser);
      setLocalEvents(updated);
      if (onEventsUpdated) {
        onEventsUpdated(updated);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <h2 className="font-archival text-xl font-bold text-[#0D472C]">
            Calendario de Eventos y Actividades
          </h2>
          <p className="text-xs text-gray-600">
            Jornadas de salud, torneos barriales, muestras de arte, ferias y reuniones de comisión
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Area filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value as any)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
          >
            <option value="TODAS">Todas las Áreas</option>
            {OPERATIVE_AREAS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>

          {/* New Event Button (Admin & Cargador de Datos only) */}
          {canManageCalendar && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Evento</span>
            </button>
          )}
        </div>
      </div>

      {/* Role permission info banner */}
      {!canManageCalendar && (
        <div className="rounded-2xl border border-gray-300 bg-white p-3.5 text-xs text-gray-600 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#0D472C] shrink-0" />
            <span>
              <strong>Modo Consulta Pública:</strong> Puedes consultar las fechas y cronogramas comunitarios. La carga, edición y eliminación de eventos en el calendario oficial está a cargo de Coordinación General y Cargador de Datos.
            </span>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {visibleEvents.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[#0D472C]/30 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-sm font-bold text-gray-700">No hay eventos programados en el calendario</h3>
          <p className="text-xs text-gray-500 mt-1">
            {canManageCalendar 
              ? 'Haz clic en "Nuevo Evento" para agendar una jornada comunitaria, torneo o taller.'
              : 'Próximamente se publicarán nuevas fechas de actividades en Puerto Esperanza.'}
          </p>
          {canManageCalendar && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Agendar Primer Evento</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleEvents.map((e) => (
            <div
              key={e.id}
              className="rounded-3xl border border-[#0D472C]/25 bg-white p-5 shadow-xs hover:border-[#0D472C] hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <span className="text-xs font-bold text-white bg-[#0D472C] px-2.5 py-0.5 rounded">
                    {e.areaOperativa}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-800 bg-[#FAF7F0] px-2 py-0.5 rounded border border-gray-200">
                      📅 {e.fecha}
                    </span>
                    {e.esPublico ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Público
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Interno
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-archival text-base font-bold text-gray-900 mt-2 leading-snug">
                  {e.titulo}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {e.descripcion}
                </p>

                <div className="mt-3 space-y-1 text-xs text-gray-700 bg-[#FAF7F0] p-3 rounded-xl border border-gray-200">
                  <p className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-[#0D472C]" />
                    Horario: {e.hora}
                  </p>
                  <p className="flex items-center gap-1.5 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-[#0D472C]" />
                    Lugar: {e.lugar}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    Responsable: <strong>{e.responsable}</strong> • Asistencia prevista: ~{e.participantesEsperados} personas
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#0D472C]">
                  Centro de Medios y Archivos
                </span>

                {canManageCalendar && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(e)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(e.id, e.titulo)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                      title="Eliminar del calendario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#0D472C]/30 my-8">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-[#0D472C] px-2 py-0.5 rounded">
                  Calendario Institucional
                </span>
                <h3 className="font-archival text-base font-bold text-gray-900 mt-1">
                  {editingEventId ? 'Editar Evento en el Calendario' : 'Agendar Nuevo Evento'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-900 text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ej: Torneo Relámpago de Fútbol Infantil / Muestra de Danzas"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Área Organizadora</label>
                  <select
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value as any)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-bold"
                  >
                    {OPERATIVE_AREAS.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={(e) => setFormFecha(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Horario</label>
                  <input
                    type="text"
                    value={formHora}
                    onChange={(e) => setFormHora(e.target.value)}
                    placeholder="Ej: 16:00 a 19:30 hs"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lugar de Realización *</label>
                  <input
                    type="text"
                    value={formLugar}
                    onChange={(e) => setFormLugar(e.target.value)}
                    placeholder="Ej: Polideportivo / Salón de Usos Múltiples"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Responsable / Coordinador</label>
                  <input
                    type="text"
                    value={formResponsable}
                    onChange={(e) => setFormResponsable(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Convocatoria Estimada (personas)</label>
                  <input
                    type="number"
                    min={1}
                    value={formParticipantes}
                    onChange={(e) => setFormParticipantes(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tipo de Evento</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      checked={formEsPublico}
                      onChange={() => setFormEsPublico(true)}
                    />
                    <span>Abierto al Público / Vecinos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      checked={!formEsPublico}
                      onChange={() => setFormEsPublico(false)}
                    />
                    <span>Interno / Equipo de Trabajo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Descripción / Objetivos</label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Detalles sobre el evento, equipamiento a utilizar y cronograma..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white font-bold shadow cursor-pointer"
                >
                  {editingEventId ? 'Guardar Cambios' : 'Agendar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
