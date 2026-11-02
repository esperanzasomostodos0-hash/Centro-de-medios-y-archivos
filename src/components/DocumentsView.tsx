import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Trash2, 
  Edit3, 
  Plus, 
  MapPin, 
  QrCode, 
  Lock, 
  Sparkles,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  ArchiveDocument, 
  OperativeArea, 
  AdministrativeType, 
  UserProfile 
} from '../types';
import { OPERATIVE_AREAS, ADMINISTRATIVE_TYPES } from '../data/mockData';
import { 
  canUserViewDocument, 
  canUserEditDocument, 
  canUserDeleteDocument, 
  isSecretarioOrAdmin 
} from '../utils/permissions';

interface DocumentsViewProps {
  documents: ArchiveDocument[];
  currentUser: UserProfile;
  initialAreaFilter?: OperativeArea | 'TODAS';
  onOpenNewDoc: () => void;
  onEditDoc: (doc: ArchiveDocument) => void;
  onDeleteDoc: (id: string) => void;
  onPrintFolio: (doc: ArchiveDocument) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentUser,
  initialAreaFilter = 'TODAS',
  onOpenNewDoc,
  onEditDoc,
  onDeleteDoc,
  onPrintFolio,
}) => {
  // If user is restricted to an area, default to that area
  const defaultArea = (!isSecretarioOrAdmin(currentUser) && currentUser.assignedArea) 
    ? currentUser.assignedArea 
    : initialAreaFilter;

  const [selectedArea, setSelectedArea] = useState<OperativeArea | 'TODAS'>(defaultArea);
  const [selectedType, setSelectedType] = useState<AdministrativeType | 'TODOS'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('TODOS');
  const [selectedSupport, setSelectedSupport] = useState<string>('TODOS');

  // Available years from dataset
  const years = useMemo(() => {
    const set = new Set<number>();
    documents.forEach((d) => set.add(d.anio));
    return Array.from(set).sort((a, b) => b - a);
  }, [documents]);

  // Filtered documents strictly enforcing "NO TODOS VEN TODO"
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Strict user-level access check
      if (!canUserViewDocument(currentUser, doc)) {
        return false;
      }

      if (selectedArea !== 'TODAS' && doc.areaOperativa !== selectedArea) {
        return false;
      }

      if (selectedType !== 'TODOS' && doc.tipoAdministrativo !== selectedType) {
        return false;
      }

      if (selectedYear !== 'TODOS' && doc.anio !== Number(selectedYear)) {
        return false;
      }

      if (selectedSupport !== 'TODOS' && doc.soporteFisico !== selectedSupport) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchFolio = doc.codigoFolio.toLowerCase().includes(q);
        const matchTitle = doc.titulo.toLowerCase().includes(q);
        const matchShelf = doc.estanteFisico.toLowerCase().includes(q);
        const matchDesc = doc.descripcion.toLowerCase().includes(q);
        const matchTags = doc.etiquetas.some((t) => t.toLowerCase().includes(q));
        if (!matchFolio && !matchTitle && !matchShelf && !matchDesc && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [documents, selectedArea, selectedType, selectedYear, selectedSupport, searchQuery, currentUser]);

  const canEdit = (doc: ArchiveDocument) => canUserEditDocument(currentUser, doc);
  const canDelete = canUserDeleteDocument(currentUser);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <h2 className="font-archival text-xl font-bold text-[#0D472C]">
            Archivo Físico y Gestión Documental
          </h2>
          <p className="text-xs text-gray-600">
            Resguardo de expedientes con vinculación doble (Área Operativa + Tipo Administrativo)
          </p>
        </div>

        {currentUser.role !== 'VISITANTE' && (
          <button
            onClick={onOpenNewDoc}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Cargar Nuevo Folio Físico</span>
          </button>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="rounded-2xl border border-[#0D472C]/20 bg-white p-4 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código de folio (PE-DEP-INF), título, estante físico o contenido..."
            className="w-full rounded-xl border border-gray-300 bg-[#FFFDF8] pl-9 pr-4 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {/* Dropdowns Row: Rama Operativa + Rama Administrativa + Año + Soporte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Rama Operativa */}
          <div>
            <label className="block text-[11px] font-bold text-[#0D472C] uppercase mb-1">
              Rama Operativa (Gente)
            </label>
            {currentUser.role === 'VISITANTE' ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs font-bold text-amber-900">
                Consulta Pública (Sin Área)
              </div>
            ) : !isSecretarioOrAdmin(currentUser) && currentUser.assignedArea ? (
              <div className="rounded-lg border border-[#0D472C]/30 bg-emerald-50 p-2 text-xs font-bold text-[#0D472C]">
                {currentUser.assignedArea}
                <span className="block text-[10px] text-gray-500 font-normal">Filtro exclusivo de su área</span>
              </div>
            ) : (
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 font-medium focus:ring-2 focus:ring-[#0D472C]"
              >
                <option value="TODAS">Todas las Áreas Operativas</option>
                {OPERATIVE_AREAS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Rama Administrativa */}
          <div>
            <label className="block text-[11px] font-bold text-[#0D472C] uppercase mb-1">
              Rama Administrativa (Tipo)
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 font-medium focus:ring-2 focus:ring-[#0D472C]"
            >
              <option value="TODOS">Todos los Tipos Administrativos</option>
              {ADMINISTRATIVE_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} ({t.code})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Año */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Año del Folio
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-[#0D472C]"
            >
              <option value="TODOS">Todos los Años</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  Año {y}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Soporte Físico */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Soporte Físico Real
            </label>
            <select
              value={selectedSupport}
              onChange={(e) => setSelectedSupport(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 focus:ring-2 focus:ring-[#0D472C]"
            >
              <option value="TODOS">Cualquier Soporte Físico</option>
              <option value="Expediente Cosido">Expediente Cosido</option>
              <option value="Original Manuscrito">Original Manuscrito</option>
              <option value="Planilla Impresa">Planilla Impresa</option>
              <option value="Carpeta Colgante">Carpeta Colgante</option>
              <option value="Afiche / Cartel">Afiche / Cartel</option>
              <option value="Fotografía Papel">Fotografía Papel</option>
            </select>
          </div>
        </div>

        {/* Quick combination buttons (e.g. INFORME de DEPORTES, INVENTARIO de ARTE) */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-gray-500 font-semibold mr-1">Filtros rápidos de la oficina:</span>
          <button
            onClick={() => { setSelectedArea('DEPORTES Y ACCIÓN SOCIAL'); setSelectedType('INFORME'); }}
            className="rounded bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 font-bold hover:bg-[#d0e7db] transition cursor-pointer"
          >
            ⚽ INFORME de Deportes
          </button>
          <button
            onClick={() => { setSelectedArea('CULTURA Y EVENTOS'); setSelectedType('CARTELES'); }}
            className="rounded bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 font-bold hover:bg-[#d0e7db] transition cursor-pointer"
          >
            🎭 CARTELES de Cultura
          </button>
          <button
            onClick={() => { setSelectedArea('AMBIENTE Y PROTECCIÓN ANIMAL'); setSelectedType('PROYECTOS'); }}
            className="rounded bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 font-bold hover:bg-[#d0e7db] transition cursor-pointer"
          >
            🌱 PROYECTO de Ambiente
          </button>
          <button
            onClick={() => { setSelectedArea('PRENSA, REDES Y COMUNICACIÓN'); setSelectedType('ACTAS Y REUNIONES'); }}
            className="rounded bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 font-bold hover:bg-[#d0e7db] transition cursor-pointer"
          >
            📸 ACTAS de Prensa
          </button>
          <button
            onClick={() => { setSelectedArea('TODAS'); setSelectedType('TODOS'); setSelectedYear('TODOS'); setSelectedSupport('TODOS'); setSearchQuery(''); }}
            className="text-gray-500 hover:text-black underline ml-auto text-[10px]"
          >
            Restablecer filtros
          </button>
        </div>
      </div>

      {/* RESULTS COUNT & STATUS */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Mostrando <strong>{filteredDocs.length}</strong> documentos archivados
          {selectedArea !== 'TODAS' && ` en área ${selectedArea}`}
          {selectedType !== 'TODOS' && ` de tipo ${selectedType}`}
        </span>
        {currentUser.role === 'CARGADOR_DATOS' && (
          <span className="text-[#0D472C] font-semibold">
            Solo puedes modificar documentos de tu área: {currentUser.assignedArea}
          </span>
        )}
      </div>

      {/* DOCUMENT CARDS GRID */}
      {filteredDocs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#0D472C]/30 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="font-archival mt-3 text-base font-bold text-gray-700">
            No se encontraron documentos con estos criterios
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Ajuste los filtros o presione "Cargar Nuevo Folio Físico" para registrarlo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const userCanEdit = canEdit(doc);
            const userCanDelete = canDelete;

            return (
              <div
                key={doc.id}
                className="rounded-2xl border border-[#0D472C]/25 bg-white p-5 shadow-xs hover:border-[#0D472C] hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Bar with Folio Code & Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono-tag text-sm font-black text-[#0D472C] bg-[#E8F3ED] px-2.5 py-1 rounded-md border border-[#0D472C]/20 inline-block">
                        {doc.codigoFolio}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono ml-2">
                        Año {doc.anio}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-white bg-[#0D472C] px-2 py-0.5 rounded">
                        {doc.areaOperativa}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {doc.tipoAdministrativo}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-archival text-sm font-bold text-gray-900 leading-snug">
                    {doc.titulo}
                  </h3>
                  {doc.subtipoDetalle && (
                    <span className="text-[10px] text-[#0D472C] font-semibold bg-[#E8F3ED] px-2 py-0.5 rounded inline-block mt-1">
                      • {doc.subtipoDetalle}
                    </span>
                  )}
                  <p className="text-xs text-gray-600 mt-1 line-clamp-3 leading-relaxed">
                    {doc.descripcion}
                  </p>

                  {/* Physical Shelf Location: HIGH VISIBILITY */}
                  <div className="mt-3 bg-[#FAF7F0] p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-800 shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 block">
                          UBICACIÓN FÍSICA EN ESTANTERÍA
                        </span>
                        <span className="font-mono-tag text-xs font-bold text-amber-950">
                          {doc.estanteFisico}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {doc.soporteFisico}
                    </span>
                  </div>

                  {/* Tags & Metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    {doc.etiquetas.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {doc.visibilidad !== 'Público' && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-0.5 border border-amber-200">
                        <Lock className="h-2.5 w-2.5" /> {doc.visibilidad}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-gray-400">
                    <span>Cargado por: <strong>{doc.autor}</strong> ({doc.fecha})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Print QR Label button */}
                    <button
                      onClick={() => onPrintFolio(doc)}
                      title="Imprimir etiqueta oficial con QR y código de estante"
                      className="flex items-center gap-1 rounded-lg bg-[#E8F3ED] text-[#0D472C] px-2.5 py-1 text-xs font-bold hover:bg-[#d2eadb] transition cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Etiqueta QR</span>
                    </button>

                    {userCanEdit && (
                      <button
                        onClick={() => onEditDoc(doc)}
                        title="Editar datos de archivo"
                        className="p-1.5 text-gray-600 hover:text-[#0D472C] hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}

                    {userCanDelete && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Confirma eliminar el folio ${doc.codigoFolio}? Esta acción quedará registrada en auditoría.`)) {
                            onDeleteDoc(doc.id);
                          }
                        }}
                        title="Eliminar folio (Solo Admin)"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
