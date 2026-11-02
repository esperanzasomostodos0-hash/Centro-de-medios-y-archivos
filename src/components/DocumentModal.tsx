import React, { useState, useEffect } from 'react';
import { X, FileText, Check, AlertCircle, Sparkles, MapPin } from 'lucide-react';
import { 
  ArchiveDocument, 
  OperativeArea, 
  AdministrativeType, 
  UserProfile, 
  KidProfile 
} from '../types';
import { OPERATIVE_AREAS, ADMINISTRATIVE_TYPES } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: ArchiveDocument) => void;
  currentUser: UserProfile;
  initialDoc?: ArchiveDocument | null;
  kidsList: KidProfile[];
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  initialDoc,
  kidsList,
}) => {
  const defaultArea: OperativeArea = (currentUser.role === 'CARGADOR_DATOS' && currentUser.assignedArea) 
    ? (currentUser.assignedArea as OperativeArea)
    : 'DEPORTES Y ACCIÓN SOCIAL';

  const [areaOperativa, setAreaOperativa] = useState<OperativeArea>(defaultArea);
  const [tipoAdministrativo, setTipoAdministrativo] = useState<AdministrativeType>('INFORME');
  const [subtipoDetalle, setSubtipoDetalle] = useState<string>('Informes mensuales de actividades');
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [codigoFolio, setCodigoFolio] = useState<string>('');
  const [estanteFisico, setEstanteFisico] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [autor, setAutor] = useState<string>(currentUser.name);
  const [descripcion, setDescripcion] = useState<string>('');
  const [soporteFisico, setSoporteFisico] = useState<ArchiveDocument['soporteFisico']>('Expediente Cosido');
  const [visibilidad, setVisibilidad] = useState<ArchiveDocument['visibilidad']>('Uso Interno');
  const [selectedKids, setSelectedKids] = useState<string[]>([]);
  const [etiquetasText, setEtiquetasText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Selected administrative type metadata with WhatsApp subitems
  const currentTypeMeta = ADMINISTRATIVE_TYPES.find((t) => t.key === tipoAdministrativo) || ADMINISTRATIVE_TYPES[0];

  useEffect(() => {
    if (initialDoc) {
      setAreaOperativa(initialDoc.areaOperativa);
      setTipoAdministrativo(initialDoc.tipoAdministrativo);
      setSubtipoDetalle(initialDoc.subtipoDetalle || currentTypeMeta.subtipos[0]);
      setAnio(initialDoc.anio);
      setCodigoFolio(initialDoc.codigoFolio);
      setEstanteFisico(initialDoc.estanteFisico);
      setTitulo(initialDoc.titulo);
      setAutor(initialDoc.autor);
      setDescripcion(initialDoc.descripcion);
      setSoporteFisico(initialDoc.soporteFisico);
      setVisibilidad(initialDoc.visibilidad);
      setSelectedKids(initialDoc.chicosVinculados || []);
      setEtiquetasText(initialDoc.etiquetas.join(', '));
    } else {
      const assigned = (currentUser.role === 'CARGADOR_DATOS' && currentUser.assignedArea)
        ? (currentUser.assignedArea as OperativeArea)
        : 'DEPORTES Y ACCIÓN SOCIAL';
      setAreaOperativa(assigned);
      setTipoAdministrativo('INFORME');
      setSubtipoDetalle(ADMINISTRATIVE_TYPES.find((t) => t.key === 'INFORME')?.subtipos[0] || '');
      const currentYear = new Date().getFullYear();
      setAnio(currentYear);
      setCodigoFolio(StorageService.generateFolioCode(assigned, 'INFORME', currentYear));
      setEstanteFisico('Estante 1 - Balda A');
      setTitulo('');
      setAutor(currentUser.name);
      setDescripcion('');
      setSoporteFisico('Expediente Cosido');
      setVisibilidad('Uso Interno');
      setSelectedKids([]);
      setEtiquetasText('');
    }
    setErrorMsg('');
  }, [initialDoc, isOpen, currentUser]);

  const handleTypeChange = (newType: AdministrativeType) => {
    setTipoAdministrativo(newType);
    const meta = ADMINISTRATIVE_TYPES.find((t) => t.key === newType);
    if (meta && meta.subtipos.length > 0) {
      setSubtipoDetalle(meta.subtipos[0]);
    }
    if (!initialDoc) {
      setCodigoFolio(StorageService.generateFolioCode(areaOperativa, newType, anio));
    }
  };

  const handleAreaChange = (newArea: OperativeArea) => {
    setAreaOperativa(newArea);
    if (!initialDoc) {
      setCodigoFolio(StorageService.generateFolioCode(newArea, tipoAdministrativo, anio));
    }
  };

  const handleYearChange = (newYear: number) => {
    setAnio(newYear);
    if (!initialDoc) {
      setCodigoFolio(StorageService.generateFolioCode(areaOperativa, tipoAdministrativo, newYear));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setErrorMsg('Por favor ingrese el título del documento.');
      return;
    }

    const finalEstante = estanteFisico.trim() || 'Estante 1 - Balda A';
    const finalCodigo = codigoFolio.trim() || StorageService.generateFolioCode(areaOperativa, tipoAdministrativo, anio);

    const doc: ArchiveDocument = {
      id: initialDoc ? initialDoc.id : 'doc-' + Date.now(),
      codigoFolio: finalCodigo.toUpperCase(),
      titulo: titulo.trim(),
      areaOperativa,
      tipoAdministrativo,
      subtipoDetalle,
      anio,
      estanteFisico: finalEstante,
      fecha: initialDoc ? initialDoc.fecha : new Date().toISOString().split('T')[0],
      autor: autor.trim() || currentUser.name,
      descripcion: descripcion.trim(),
      soporteFisico,
      visibilidad,
      chicosVinculados: selectedKids,
      etiquetas: etiquetasText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      creadoEn: initialDoc ? initialDoc.creadoEn : new Date().toISOString(),
    };

    onSave(doc);
    onClose();
  };

  const isAreaLocked = currentUser.role === 'CARGADOR_DATOS' && currentUser.assignedArea;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D472C] text-[#F9F6EC]">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                {initialDoc ? 'Editar Documento de Archivo' : 'Carga Obligatoria de Documento'}
              </h3>
              <p className="text-xs text-[#162B1F]/70">
                Resguardo documental con foliado físico y estantería
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
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mandatory Branch Linking */}
          <div className="rounded-2xl bg-[#E8F3ED]/70 border border-[#0D472C]/30 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D472C] uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>VINCULACIÓN DOBLE REGLAMENTARIA (OBLIGATORIA)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. Rama Operativa (Equipo de Trabajo) *
                </label>
                <select
                  value={areaOperativa}
                  disabled={Boolean(isAreaLocked)}
                  onChange={(e) => handleAreaChange(e.target.value as OperativeArea)}
                  className="w-full rounded-xl border border-[#0D472C]/40 bg-white px-3 py-2 text-xs font-bold text-[#0D472C] focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                >
                  {OPERATIVE_AREAS.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
                {isAreaLocked && (
                  <span className="text-[10px] text-[#0D472C] mt-1 block font-semibold">
                    🔒 Rol Cargador: fijado a {currentUser.assignedArea}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Rama Administrativa (Tipo de Archivo) *
                </label>
                <select
                  value={tipoAdministrativo}
                  onChange={(e) => handleTypeChange(e.target.value as AdministrativeType)}
                  className="w-full rounded-xl border border-[#0D472C]/40 bg-white px-3 py-2 text-xs font-bold text-[#0D472C] focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                >
                  {ADMINISTRATIVE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label} ({t.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-item specific from WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subclasificación Oficial ({currentTypeMeta.label})
              </label>
              <select
                value={subtipoDetalle}
                onChange={(e) => setSubtipoDetalle(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0D472C]"
              >
                {currentTypeMeta.subtipos.map((st) => (
                  <option key={st} value={st}>
                    • {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Year + Physical Folio + Physical Shelf */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Año del Documento *
                </label>
                <input
                  type="number"
                  min={1990}
                  max={2035}
                  value={anio}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  4. Folio Físico *
                </label>
                <input
                  type="text"
                  value={codigoFolio}
                  onChange={(e) => setCodigoFolio(e.target.value)}
                  placeholder="PE-DEP-INF-2024-001"
                  className="font-mono-tag w-full rounded-xl border border-[#0D472C]/50 bg-[#FFFDF8] px-3 py-2 text-xs font-bold text-[#0D472C] focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#0D472C]" />
                  5. Estante Físico *
                </label>
                <input
                  type="text"
                  value={estanteFisico}
                  onChange={(e) => setEstanteFisico(e.target.value)}
                  placeholder="Estante A - Balda 1 - Caja 04"
                  className="w-full rounded-xl border border-amber-600/50 bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Content Details */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Título descriptivo del Documento *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Acta de asamblea general / Planilla de asistencia torneo de fútbol"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Responsable / Autor
              </label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Soporte Físico Real
              </label>
              <select
                value={soporteFisico}
                onChange={(e) => setSoporteFisico(e.target.value as ArchiveDocument['soporteFisico'])}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
              >
                <option value="Expediente Cosido">Expediente Cosido</option>
                <option value="Original Manuscrito">Original Manuscrito</option>
                <option value="Planilla Impresa">Planilla Impresa</option>
                <option value="Carpeta Colgante">Carpeta Colgante</option>
                <option value="Afiche / Cartel">Afiche / Cartel</option>
                <option value="Fotografía Papel">Fotografía Papel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nivel de Confidencialidad
              </label>
              <select
                value={visibilidad}
                onChange={(e) => setVisibilidad(e.target.value as ArchiveDocument['visibilidad'])}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
              >
                <option value="Uso Interno">Uso Interno del Personal</option>
                <option value="Público">Público (Cartelera / Comunidad)</option>
                <option value="Confidencial Coordinación">Confidencial Coordinación</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Descripción, síntesis u observaciones del contenido
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle de acuerdos, número de participantes, fechas o notas relevantes..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
            />
          </div>

          {/* Linking kids if applicable */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Vincular a Fichas de Niños / Adolescentes (opcional)
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 rounded-xl bg-gray-50 border border-gray-200">
              {kidsList.map((kid) => {
                const isSelected = selectedKids.includes(kid.id);
                return (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedKids(selectedKids.filter((id) => id !== kid.id));
                      } else {
                        setSelectedKids([...selectedKids, kid.id]);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D472C] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {kid.nombre} {kid.apellido} ({kid.edad}a)
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Etiquetas de búsqueda (separadas por comas)
            </label>
            <input
              type="text"
              value={etiquetasText}
              onChange={(e) => setEtiquetasText(e.target.value)}
              placeholder="Ej: Torneo, Vacunación, Asistencia, Presupuesto"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0D472C]/20">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-5 py-2 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] shadow-md transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Guardar y Generar Folio Físico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
