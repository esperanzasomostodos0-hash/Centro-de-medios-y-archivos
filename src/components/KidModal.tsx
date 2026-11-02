import React, { useState, useEffect } from 'react';
import { X, User, Check, AlertCircle, Sparkles } from 'lucide-react';
import { KidProfile, OperativeArea, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface KidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kid: KidProfile) => void;
  currentUser: UserProfile;
  initialKid?: KidProfile | null;
}

export const KidModal: React.FC<KidModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  initialKid,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edad, setEdad] = useState<number>(10);
  const [genero, setGenero] = useState('Masculino');
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorParentesco, setTutorParentesco] = useState('Madre');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [autorizacionFirmada, setAutorizacionFirmada] = useState(true);
  const [folioAutorizacion, setFolioAutorizacion] = useState('');
  const [areasParticipa, setAreasParticipa] = useState<OperativeArea[]>(['DEPORTES Y ACCIÓN SOCIAL']);
  const [talleresText, setTalleresText] = useState('');
  const [alergiasMedicas, setAlergiasMedicas] = useState('');
  const [estado, setEstado] = useState<KidProfile['estado']>('Activo');
  const [notas, setNotas] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialKid) {
      setNombre(initialKid.nombre);
      setApellido(initialKid.apellido);
      setDni(initialKid.dni);
      setFechaNacimiento(initialKid.fechaNacimiento);
      setEdad(initialKid.edad);
      setGenero(initialKid.genero);
      setTutorNombre(initialKid.tutorNombre);
      setTutorParentesco(initialKid.tutorParentesco);
      setTutorTelefono(initialKid.tutorTelefono);
      setDireccion(initialKid.direccion);
      setAutorizacionFirmada(initialKid.autorizacionFirmada);
      setFolioAutorizacion(initialKid.folioAutorizacion || '');
      setAreasParticipa(initialKid.areasParticipa);
      setTalleresText(initialKid.talleresActuales.join(', '));
      setAlergiasMedicas(initialKid.alergiasMedicas);
      setEstado(initialKid.estado);
      setNotas(initialKid.notas);
    } else {
      setNombre('');
      setApellido('');
      setDni('');
      setFechaNacimiento('');
      setEdad(10);
      setGenero('Masculino');
      setTutorNombre('');
      setTutorParentesco('Madre');
      setTutorTelefono('');
      setDireccion('');
      setAutorizacionFirmada(true);
      setFolioAutorizacion(`PE-AUT-${new Date().getFullYear()}-${Math.floor(Math.random() * 800 + 100)}`);
      setAreasParticipa(['DEPORTES Y ACCIÓN SOCIAL']);
      setTalleresText('Fútbol Infantil');
      setAlergiasMedicas('Ninguna declarada.');
      setEstado('Activo');
      setNotas('');
    }
    setErrorMsg('');
  }, [initialKid, isOpen]);

  if (!isOpen) return null;

  const toggleArea = (area: OperativeArea) => {
    if (areasParticipa.includes(area)) {
      if (areasParticipa.length === 1) return; // Keep at least one
      setAreasParticipa(areasParticipa.filter((a) => a !== area));
    } else {
      setAreasParticipa([...areasParticipa, area]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) {
      setErrorMsg('Nombre y apellido son obligatorios.');
      return;
    }
    if (!dni.trim()) {
      setErrorMsg('DNI del participante es obligatorio.');
      return;
    }
    if (areasParticipa.length === 0) {
      setErrorMsg('Debe seleccionar al menos un Área Operativa en la que participa.');
      return;
    }

    const kid: KidProfile = {
      id: initialKid ? initialKid.id : 'kid-' + Date.now(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      fechaNacimiento,
      edad: Number(edad) || 10,
      genero,
      tutorNombre: tutorNombre.trim(),
      tutorParentesco: tutorParentesco.trim(),
      tutorTelefono: tutorTelefono.trim(),
      direccion: direccion.trim(),
      autorizacionFirmada,
      folioAutorizacion: autorizacionFirmada ? (folioAutorizacion || 'PE-AUT-S/N') : 'PENDIENTE',
      areasParticipa,
      talleresActuales: talleresText.split(',').map((t) => t.trim()).filter(Boolean),
      alergiasMedicas: alergiasMedicas.trim(),
      fechaInscripcion: initialKid ? initialKid.fechaInscripcion : new Date().toISOString().split('T')[0],
      asistenciasMes: initialKid ? initialKid.asistenciasMes : 0,
      estado,
      notas: notas.trim(),
    };

    onSave(kid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D472C] text-[#F9F6EC]">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                {initialKid ? 'Editar Ficha Individual' : 'Nueva Ficha de Niño / Adolescente'}
              </h3>
              <p className="text-xs text-[#162B1F]/70">
                Padrón comunitario de participantes y autorización parental
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
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Thiago Agustín"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ramírez"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">DNI *</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="52.341.902"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#0D472C]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Edad (Años)</label>
              <input
                type="number"
                min={3}
                max={25}
                value={edad}
                onChange={(e) => setEdad(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Nacimiento</label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Estado en Centro</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as KidProfile['estado'])}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              >
                <option value="Activo">Activo (Asistiendo)</option>
                <option value="En Pausa">En Pausa (Licencia / Trámite)</option>
                <option value="Egresado">Egresado</option>
              </select>
            </div>
          </div>

          {/* ÁREAS OPERATIVAS DONDE PARTICIPA */}
          <div className="rounded-xl bg-[#E8F3ED]/70 border border-[#0D472C]/30 p-4">
            <label className="block text-xs font-bold text-[#0D472C] mb-2 flex items-center gap-1.5 uppercase">
              <Sparkles className="h-4 w-4" />
              Áreas Operativas donde participa (Seleccione una o varias) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {OPERATIVE_AREAS.map((area) => {
                const isSelected = areasParticipa.includes(area.key);
                return (
                  <button
                    key={area.key}
                    type="button"
                    onClick={() => toggleArea(area.key)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D472C] text-white border-[#0D472C] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span>{area.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Talleres específicos actuales (separados por coma)
              </label>
              <input
                type="text"
                value={talleresText}
                onChange={(e) => setTalleresText(e.target.value)}
                placeholder="Ej: Fútbol Sub-11, Robótica Inicial, Muralismo"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>
          </div>

          {/* Parental Authorization & Tutor */}
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D472C] uppercase tracking-wide">
                Datos del Tutor y Autorización de Padres
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autorizacionFirmada}
                  onChange={(e) => setAutorizacionFirmada(e.target.checked)}
                  className="rounded text-[#0D472C] focus:ring-[#0D472C] h-4 w-4"
                />
                <span className="text-xs font-bold text-gray-800">
                  ¿Autorización física firmada en archivo?
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Tutor</label>
                <input
                  type="text"
                  value={tutorNombre}
                  onChange={(e) => setTutorNombre(e.target.value)}
                  placeholder="Silvia Ramírez"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Parentesco</label>
                <input
                  type="text"
                  value={tutorParentesco}
                  onChange={(e) => setTutorParentesco(e.target.value)}
                  placeholder="Madre / Padre / Tutor"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono Contacto</label>
                <input
                  type="text"
                  value={tutorTelefono}
                  onChange={(e) => setTutorTelefono(e.target.value)}
                  placeholder="03757-15492811"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección / Barrio</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Barrio Esperanza Norte, Mz 14 Lote 3"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Folio Físico de Autorización Archivada
                </label>
                <input
                  type="text"
                  value={folioAutorizacion}
                  onChange={(e) => setFolioAutorizacion(e.target.value)}
                  placeholder="PE-AUT-2024-019"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Health & notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ficha Médica / Alergias / Medicación
              </label>
              <textarea
                rows={2}
                value={alergiasMedicas}
                onChange={(e) => setAlergiasMedicas(e.target.value)}
                placeholder="Alergia a penicilina, asma, aptitud física..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Observaciones generales de los profes
              </label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Horarios de retiro, transporte, participación destacada..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"
              />
            </div>
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
              Guardar Ficha en Archivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
