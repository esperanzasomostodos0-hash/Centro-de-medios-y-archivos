import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Folder, 
  Calendar,
  Layers,
  Eye,
  Trash2
} from 'lucide-react';
import { ArchiveDocument, UserProfile, OfficeFolioCategory, OfficeFolioInfo } from '../types';
import { OFFICE_SHELF_FOLIOS } from '../data/mockData';
import { canUserUploadToFolio, getAllowedFoliosForUser, isSecretarioOrAdmin } from '../utils/permissions';

interface DigitizePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePaper: (doc: ArchiveDocument) => void;
  currentUser: UserProfile;
  initialFolio?: OfficeFolioCategory;
}

export const DigitizePaperModal: React.FC<DigitizePaperModalProps> = ({
  isOpen,
  onClose,
  onSavePaper,
  currentUser,
  initialFolio = 'Actas y reuniones',
}) => {
  const allowedUploadFolios = useMemo(() => {
    return OFFICE_SHELF_FOLIOS.filter((f) => canUserUploadToFolio(currentUser, f.name));
  }, [currentUser]);

  // Ensure default folio is allowed for this user
  const effectiveInitialFolio = useMemo(() => {
    if (canUserUploadToFolio(currentUser, initialFolio)) {
      return initialFolio;
    }
    return allowedUploadFolios[0]?.name || 'Carteles';
  }, [initialFolio, allowedUploadFolios, currentUser]);

  const [selectedFolio, setSelectedFolio] = useState<OfficeFolioCategory>(effectiveInitialFolio);
  const [titulo, setTitulo] = useState('');
  const [numeroHoja, setNumeroHoja] = useState('Folio 01');
  const [estanteFisico, setEstanteFisico] = useState('');
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [autor, setAutor] = useState(currentUser.name);
  const [descripcion, setDescripcion] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update shelf whenever folio changes or modal opens
  useEffect(() => {
    setSelectedFolio(effectiveInitialFolio);
    const folioInfo = OFFICE_SHELF_FOLIOS.find((f) => f.name === effectiveInitialFolio);
    if (folioInfo) {
      setEstanteFisico(folioInfo.estanteDefault);
    }
  }, [effectiveInitialFolio, isOpen]);

  const handleFolioChange = (folioName: OfficeFolioCategory) => {
    setSelectedFolio(folioName);
    const folioInfo = OFFICE_SHELF_FOLIOS.find((f) => f.name === folioName);
    if (folioInfo) {
      setEstanteFisico(folioInfo.estanteDefault);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSampleScan = () => {
    // Generates a clean archival mock scan canvas if no camera is available
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background paper texture
    ctx.fillStyle = '#FDFCF7';
    ctx.fillRect(0, 0, 600, 800);

    // Border
    ctx.strokeStyle = '#0D472C';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 760);
    ctx.strokeStyle = '#8B6F47';
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, 548, 748);

    // Header
    ctx.fillStyle = '#0D472C';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CENTRO DE MEDIOS Y ARCHIVOS', 300, 70);
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText('Puerto Esperanza • Folio Oficial Digitalizado', 300, 95);

    // Folio details
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#1A2E22';
    ctx.fillText(`FOLIO: ${selectedFolio.toUpperCase()}`, 50, 150);
    ctx.fillText(`N° HOJA: ${numeroHoja || 'S/N'}`, 50, 180);
    ctx.fillText(`ESTANTE: ${estanteFisico}`, 50, 210);
    ctx.fillText(`FECHA: ${fecha}`, 50, 240);
    ctx.fillText(`TITULO: ${titulo || 'Documento de Oficina'}`, 50, 270);

    // Divider
    ctx.strokeStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(50, 290);
    ctx.lineTo(550, 290);
    ctx.stroke();

    // Notes
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    const textDesc = descripcion || 'Documento físico original archivado en el estante correspondiente de la oficina.';
    ctx.fillText(textDesc.slice(0, 50), 50, 330);
    if (textDesc.length > 50) {
      ctx.fillText(textDesc.slice(50, 110), 50, 355);
    }

    // Official Stamp
    ctx.save();
    ctx.translate(430, 670);
    ctx.rotate(-0.08);
    ctx.strokeStyle = '#0D472C';
    ctx.lineWidth = 3;
    ctx.strokeRect(-90, -35, 180, 70);
    ctx.fillStyle = '#0D472C';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ARCHIVO OFICIAL', 0, -10);
    ctx.fillText('PUERTO ESPERANZA', 0, 8);
    ctx.font = '10px sans-serif';
    ctx.fillText(fecha, 0, 22);
    ctx.restore();

    setFotoPreview(canvas.toDataURL('image/jpeg', 0.85));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!titulo.trim()) {
      setErrorMsg('Por favor ingrese el título o asunto del papel a digitalizar.');
      return;
    }

    setIsSubmitting(true);

    // Map folio to compatible operative area & admin type for search & legacy views
    const folioInfo = OFFICE_SHELF_FOLIOS.find((f) => f.name === selectedFolio);
    const isOperative = folioInfo?.categoriaTipo === 'OPERATIVO';

    const cleanCode = `FOLIO-${selectedFolio.substring(0, 3).toUpperCase()}-${anio}-${Date.now().toString().slice(-4)}`;

    const newDoc: ArchiveDocument = {
      id: 'doc-' + Date.now(),
      codigoFolio: cleanCode,
      titulo: titulo.trim(),
      folioNombre: selectedFolio,
      numeroHoja: numeroHoja.trim() || 'Folio 01',
      areaOperativa: isOperative 
        ? (selectedFolio === 'Deportes' ? 'DEPORTES Y ACCIÓN SOCIAL' :
           selectedFolio === 'Accion social' ? 'DEPORTES Y ACCIÓN SOCIAL' :
           selectedFolio === 'Cultura y eventos' ? 'CULTURA Y EVENTOS' :
           selectedFolio === 'Ambiente y proteccion animal' ? 'AMBIENTE Y PROTECCIÓN ANIMAL' :
           'PRENSA, REDES Y COMUNICACIÓN')
        : (currentUser.assignedArea || 'DEPORTES Y ACCIÓN SOCIAL'),
      tipoAdministrativo: !isOperative
        ? (selectedFolio === 'Actas y reuniones' ? 'ACTAS Y REUNIONES' :
           selectedFolio === 'Inventario' ? 'INVENTARIO' :
           selectedFolio === 'Eventos' ? 'EVENTOS' :
           selectedFolio === 'Carteles' ? 'CARTELES' :
           selectedFolio === 'Proyectos' ? 'PROYECTOS' :
           selectedFolio === 'Notas y resolucion' ? 'NOTAS Y RESOLUCIONES' :
           selectedFolio === 'Presupuesto recaudacion y balance' ? 'PRESUPUESTO, RECAUDACIÓN Y BALANCE' :
           selectedFolio === 'Informe' ? 'INFORME' :
           selectedFolio === 'Planificacion' ? 'PLANIFICACIÓN' :
           'REGISTRO')
        : 'INFORME',
      anio,
      estanteFisico: estanteFisico.trim() || folioInfo?.estanteDefault || 'Estante 1',
      fecha,
      autor: autor.trim() || currentUser.name,
      descripcion: descripcion.trim() || `Papel archivado en el folio ${selectedFolio}.`,
      soporteFisico: 'Original Manuscrito',
      visibilidad: 'Uso Interno',
      fotoUrl: fotoPreview || undefined,
      etiquetas: [selectedFolio, numeroHoja, 'Oficina Puerto Esperanza'],
      creadoEn: new Date().toISOString(),
    };

    setTimeout(() => {
      onSavePaper(newDoc);
      setIsSubmitting(false);
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-5 sm:p-6 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D472C] text-[#F9F6EC] shadow-xs">
              <Camera className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                Subir y Digitalizar Papel a Folio
              </h3>
              <p className="text-xs text-gray-600">
                Resguardo físico y captura digital para los 15 folios de los estantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
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
          {/* STEP 1: SELECT FOLIO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#0D472C] uppercase tracking-wider">
                1. Seleccione el Folio de los Estantes *
              </label>
              <span className="text-[10px] font-bold text-gray-500">
                {isSecretarioOrAdmin(currentUser) 
                  ? 'Coordinación: 15 folios disponibles' 
                  : `Habilitados para ${currentUser.assignedArea}: ${allowedUploadFolios.length} folios`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-[#FAF7F0] rounded-xl border border-gray-300">
              {allowedUploadFolios.map((folio: OfficeFolioInfo) => {
                const isSelected = selectedFolio === folio.name;
                return (
                  <button
                    key={folio.id}
                    type="button"
                    onClick={() => handleFolioChange(folio.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D472C] text-white shadow-xs font-bold'
                        : 'bg-white text-gray-800 hover:bg-emerald-50 border border-gray-200'
                    }`}
                  >
                    <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-300' : 'text-[#0D472C]'}`} />
                    <span className="truncate">{folio.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: PHOTO / SCAN UPLOAD */}
          <div>
            <label className="block text-xs font-bold text-[#0D472C] uppercase tracking-wider mb-1.5">
              2. Foto o Escaneo del Papel Físico
            </label>
            <div className="rounded-xl border-2 border-dashed border-[#0D472C]/40 bg-[#FAF7F0] p-4 text-center">
              {fotoPreview ? (
                <div className="space-y-3">
                  <div className="relative mx-auto max-h-60 max-w-sm overflow-hidden rounded-lg border border-gray-300 shadow">
                    <img
                      src={fotoPreview}
                      alt="Papel digitalizado"
                      className="w-full object-contain max-h-56"
                    />
                    <button
                      type="button"
                      onClick={() => setFotoPreview(null)}
                      className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white shadow hover:bg-red-700 cursor-pointer"
                      title="Quitar foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Papel capturado correctamente
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* Camera capture for mobile */}
                  <label className="flex items-center gap-2 rounded-xl bg-[#0D472C] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <span>Sacar Foto con Celular</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>

                  {/* File upload from computer or gallery */}
                  <label className="flex items-center gap-2 rounded-xl bg-white border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition cursor-pointer">
                    <Upload className="h-4 w-4 text-[#0D472C]" />
                    <span>Subir Imagen / PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>

                  {/* Sample generator */}
                  <button
                    type="button"
                    onClick={handleGenerateSampleScan}
                    className="text-xs text-[#0D472C] hover:underline font-semibold cursor-pointer py-1"
                  >
                    Simular escaneo de prueba
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Título o Asunto del Papel *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Acta de Reunión con Profes / Planilla de Asistencia"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C] font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  N° de Hoja / Folio
                </label>
                <input
                  type="text"
                  value={numeroHoja}
                  onChange={(e) => setNumeroHoja(e.target.value)}
                  placeholder="Ej: Folio 01 / Hoja 12"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C] font-mono font-bold text-[#0D472C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C] font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estante Físico de la Oficina
              </label>
              <input
                type="text"
                value={estanteFisico}
                onChange={(e) => setEstanteFisico(e.target.value)}
                placeholder="Ej: Estante 1 - Balda A"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Fecha del Papel
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Descripción o Contenido del Papel (Opcional)
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Resumen de lo que dice el papel, acuerdos, firmantes o detalles de importancia..."
              className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs focus:ring-2 focus:ring-[#0D472C]"
            />
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-5 py-2 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar y Digitalizar en Folio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
