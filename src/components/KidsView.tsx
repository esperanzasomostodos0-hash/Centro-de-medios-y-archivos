import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Edit3, 
  Heart, 
  FileText,
  UserCheck
} from 'lucide-react';
import { KidProfile, OperativeArea, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface KidsViewProps {
  kids: KidProfile[];
  currentUser: UserProfile;
  initialAreaFilter?: OperativeArea | 'TODAS';
  onOpenNewKid: () => void;
  onEditKid: (kid: KidProfile) => void;
  onViewDocFolio: (folio: string) => void;
}

export const KidsView: React.FC<KidsViewProps> = ({
  kids,
  currentUser,
  initialAreaFilter = 'TODAS',
  onOpenNewKid,
  onEditKid,
  onViewDocFolio,
}) => {
  const [selectedArea, setSelectedArea] = useState<OperativeArea | 'TODAS'>(initialAreaFilter);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [authFilter, setAuthFilter] = useState<string>('TODOS');

  const filteredKids = useMemo(() => {
    return kids.filter((k) => {
      if (selectedArea !== 'TODAS' && !k.areasParticipa.includes(selectedArea)) {
        return false;
      }
      if (statusFilter !== 'TODOS' && k.estado !== statusFilter) {
        return false;
      }
      if (authFilter === 'FIRMADA' && !k.autorizacionFirmada) {
        return false;
      }
      if (authFilter === 'PENDIENTE' && k.autorizacionFirmada) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const full = `${k.nombre} ${k.apellido} ${k.dni} ${k.tutorNombre} ${k.direccion}`.toLowerCase();
        if (!full.includes(q)) return false;
      }
      return true;
    });
  }, [kids, selectedArea, statusFilter, authFilter, searchQuery]);

  const canViewFullList = currentUser.role === 'ADMIN' || currentUser.role === 'CARGADOR_DATOS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <h2 className="font-archival text-xl font-bold text-[#0D472C]">
            Fichas de Niñez y Adolescencia
          </h2>
          <p className="text-xs text-gray-600">
            {canViewFullList 
              ? 'Padrón unificado de participantes vinculados a las áreas operativas con estado de autorización física'
              : 'Inscripción de niños y adolescentes a eventos específicos del área operativa'}
          </p>
        </div>

        <button
          onClick={onOpenNewKid}
          className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Inscribir Niño/a a Evento de Área</span>
        </button>
      </div>

      {!canViewFullList && (
        <div className="rounded-3xl border-2 border-emerald-600/30 bg-[#E8F3ED] p-6 text-xs text-emerald-950 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold bg-[#0D472C] text-white px-2 py-0.5 rounded uppercase">
              Secretario / Encargado de Área
            </span>
            <span className="font-bold text-[#0D472C]">Módulo Habilitado para Inscripciones</span>
          </div>
          <p className="leading-relaxed">
            Por política institucional de protección y privacidad de datos de menores, la consulta de la lista completa del padrón está reservada a <strong>Coordinación General y Cargador de Datos</strong>.
          </p>
          <p className="leading-relaxed">
            Puedes dar de alta nuevas inscripciones para las actividades y eventos de tu área haciendo clic en el botón superior o a continuación:
          </p>
          <button
            onClick={onOpenNewKid}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D472C] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Completar Ficha de Inscripción con Datos de Evento y Tutor</span>
          </button>
        </div>
      )}

      {/* Filter controls & List - only rendered if canViewFullList */}
      {canViewFullList && (
        <>
          <div className="rounded-2xl border border-[#0D472C]/20 bg-white p-4 shadow-xs space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, apellido, DNI o tutor..."
                className="w-full rounded-xl border border-gray-300 bg-[#FFFDF8] pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#0D472C] uppercase mb-1">
              Área Operativa en que participa
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 font-medium focus:ring-2 focus:ring-[#0D472C]"
            >
              <option value="TODAS">Todas las Áreas</option>
              {OPERATIVE_AREAS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Autorización de Padres
            </label>
            <select
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-[#0D472C]"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="FIRMADA">✓ Autorización Firmada en Archivo</option>
              <option value="PENDIENTE">⚠️ Autorización Pendiente / Faltante</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Estado de Asistencia
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-[#0D472C]"
            >
              <option value="TODOS">Todos</option>
              <option value="Activo">Activo</option>
              <option value="En Pausa">En Pausa</option>
              <option value="Egresado">Egresado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Kid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKids.map((kid) => {
          return (
            <div
              key={kid.id}
              className="rounded-2xl border border-[#0D472C]/25 bg-white p-5 shadow-xs hover:border-[#0D472C] hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header card with name & age */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div>
                    <h3 className="font-archival text-base font-bold text-gray-900 leading-tight">
                      {kid.nombre} {kid.apellido}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-bold text-[#0D472C]">
                        DNI {kid.dni}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        • {kid.edad} años ({kid.genero})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      kid.estado === 'Activo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {kid.estado}
                  </span>
                </div>

                {/* ÁREAS EN LAS QUE PARTICIPA (VINCULACIÓN CLAVE) */}
                <div className="my-2.5">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block mb-1">
                    ÁREAS OPERATIVAS VINCULADAS
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {kid.areasParticipa.map((area) => (
                      <span
                        key={area}
                        className="text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 rounded border border-[#0D472C]/20"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Talleres */}
                <div className="text-xs text-gray-700 bg-[#FAF7F0] p-2 rounded-lg border border-gray-200 space-y-1">
                  <p><strong>Talleres:</strong> {kid.talleresActuales.join(', ') || 'Sin talleres asignados'}</p>
                  <p className="text-[11px] text-gray-500">
                    Asistencias este mes: <strong>{kid.asistenciasMes} jornadas</strong>
                  </p>
                </div>

                {/* AUTORIZACIÓN DE PADRES & ARCHIVO FÍSICO */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1 text-xs">
                  {kid.autorizacionFirmada ? (
                    <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span className="text-[11px] font-bold">Autorización de Padres en Archivo</span>
                      </div>
                      {kid.folioAutorizacion && (
                        <button
                          onClick={() => onViewDocFolio(kid.folioAutorizacion!)}
                          title="Buscar folio de autorización"
                          className="font-mono text-[10px] font-bold text-[#0D472C] underline"
                        >
                          {kid.folioAutorizacion}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-300">
                      <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                      <span className="text-[11px] font-bold">
                        ⚠️ Falta autorización física de los padres
                      </span>
                    </div>
                  )}

                  {/* Tutor contact info */}
                  <div className="text-[11px] text-gray-600 space-y-0.5 pt-1">
                    <p className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-gray-400" />
                      Tutor: <strong>{kid.tutorNombre}</strong> ({kid.tutorParentesco})
                    </p>
                    {kid.tutorTelefono && (
                      <p className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {kid.tutorTelefono}
                      </p>
                    )}
                    {kid.direccion && (
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {kid.direccion}
                      </p>
                    )}
                  </div>

                  {/* Medical alert if any */}
                  {kid.alergiasMedicas && (
                    <div className="bg-red-50/60 p-1.5 rounded text-[10px] text-red-900 border border-red-200/60">
                      <strong>Salud:</strong> {kid.alergiasMedicas}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {currentUser.role !== 'VISITANTE' && (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditKid(kid)}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar Ficha
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  )}
</div>
);
};
