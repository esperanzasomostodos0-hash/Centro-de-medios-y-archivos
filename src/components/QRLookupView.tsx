import React, { useState } from 'react';
import { 
  QrCode, 
  Search, 
  MapPin, 
  FileText, 
  Printer, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ArchiveDocument, InventoryItem, KidProfile } from '../types';

interface QRLookupViewProps {
  documents: ArchiveDocument[];
  inventory: InventoryItem[];
  kids: KidProfile[];
  onPrintFolio: (doc: ArchiveDocument) => void;
}

export const QRLookupView: React.FC<QRLookupViewProps> = ({
  documents,
  inventory,
  kids,
  onPrintFolio,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [searchedCode, setSearchedCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedCode(inputCode.trim().toUpperCase());
  };

  const matchedDoc = documents.find(
    (d) => d.codigoFolio.toUpperCase() === searchedCode || d.id === searchedCode
  );

  const matchedInv = inventory.find(
    (i) => i.codigo.toUpperCase() === searchedCode || i.id === searchedCode
  );

  const matchedKid = kids.find(
    (k) => (k.folioAutorizacion && k.folioAutorizacion.toUpperCase() === searchedCode) || k.dni.replace(/\./g, '') === searchedCode.replace(/\./g, '')
  );

  const sampleFolios = [
    'PE-DEP-INF-2024-001',
    'PE-ART-INV-2024-012',
    'PE-SAL-EVE-2024-008',
    'PE-NIN-ACT-2024-023',
    'PE-AUT-2024-019',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#0D472C]/20 pb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D472C] text-[#F9F6EC] mb-2 shadow-md">
          <QrCode className="h-6 w-6" />
        </div>
        <h2 className="font-archival text-xl sm:text-2xl font-bold text-[#0D472C]">
          Localizador Físico por Folio y Escáner QR
        </h2>
        <p className="text-xs text-gray-600 max-w-lg mx-auto mt-1">
          Ingrese el código del folio físico o escanee la etiqueta pegada en carpetas y cajas para saber al instante en qué estante y balda se encuentra en la oficina.
        </p>
      </div>

      {/* Input bar */}
      <div className="rounded-2xl border-2 border-[#0D472C]/30 bg-white p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative grow">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Ej: PE-DEP-INF-2024-001 o PE-AUT-2024-019..."
              className="font-mono-tag w-full rounded-xl border border-gray-300 bg-[#FFFDF8] pl-10 pr-4 py-3 text-sm font-bold text-[#0D472C] focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0D472C] px-6 py-3 text-xs font-bold text-white hover:bg-[#165B3A] transition shadow cursor-pointer shrink-0"
          >
            <QrCode className="h-4 w-4" />
            <span>Localizar Ubicación</span>
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 font-semibold">Probar folios reales archivados:</span>
          {sampleFolios.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setInputCode(sample);
                setSearchedCode(sample);
              }}
              className="font-mono-tag bg-[#E8F3ED] text-[#0D472C] px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-[#d5ebdf] transition cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* RESULT DISPLAY */}
      {searchedCode && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          {matchedDoc && (
            <div className="rounded-2xl border-2 border-[#0D472C] bg-[#FFFDF8] p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      EXPEDIENTE LOCALIZADO EN ARCHIVO CENTRAL
                    </span>
                    <span className="font-mono-tag text-lg font-black text-[#0D472C]">
                      {matchedDoc.codigoFolio}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onPrintFolio(matchedDoc)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#165B3A] transition cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir Etiqueta QR</span>
                </button>
              </div>

              {/* EXACT PHYSICAL LOCATION CARD */}
              <div className="rounded-xl bg-[#0D472C] text-[#F9F6EC] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-green-200 block font-bold">
                    UBICACIÓN FÍSICA EN ESTANTE (OFICINA REAL)
                  </span>
                  <p className="font-mono-tag text-lg font-black text-white mt-0.5">
                    📍 {matchedDoc.estanteFisico}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-green-200 block">Soporte</span>
                  <span className="text-xs font-bold">{matchedDoc.soporteFisico}</span>
                </div>
              </div>

              {/* Document Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FAF7F0] p-3 rounded-xl border border-gray-200 space-y-1">
                  <p><strong>Título:</strong> {matchedDoc.titulo}</p>
                  <p><strong>Área Operativa:</strong> {matchedDoc.areaOperativa}</p>
                  <p><strong>Tipo Administrativo:</strong> {matchedDoc.tipoAdministrativo}</p>
                  <p><strong>Año:</strong> {matchedDoc.anio}</p>
                </div>

                <div className="bg-[#FAF7F0] p-3 rounded-xl border border-gray-200 space-y-1">
                  <p><strong>Responsable:</strong> {matchedDoc.autor}</p>
                  <p><strong>Fecha de archivo:</strong> {matchedDoc.fecha}</p>
                  <p><strong>Confidencialidad:</strong> {matchedDoc.visibilidad}</p>
                  <p className="text-gray-600 line-clamp-2">
                    <strong>Síntesis:</strong> {matchedDoc.descripcion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {matchedKid && !matchedDoc && (
            <div className="rounded-2xl border-2 border-amber-600/60 bg-[#FFFDF8] p-6 shadow-lg space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <CheckCircle2 className="h-5 w-5 text-amber-700" />
                <h3 className="font-archival text-base font-bold text-gray-900">
                  Ficha de Niño/a con Autorización {matchedKid.folioAutorizacion}
                </h3>
              </div>
              <p className="text-xs">
                <strong>Participante:</strong> {matchedKid.nombre} {matchedKid.apellido} (DNI {matchedKid.dni})
              </p>
              <p className="text-xs">
                <strong>Tutor Responsable:</strong> {matchedKid.tutorNombre} ({matchedKid.tutorTelefono})
              </p>
              <p className="text-xs">
                <strong>Áreas donde participa:</strong> {matchedKid.areasParticipa.join(', ')}
              </p>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900">
                📍 <strong>Ubicación física de la autorización firmada:</strong> Archivador de Autorizaciones 2024 - Letra {matchedKid.apellido.charAt(0)}
              </div>
            </div>
          )}

          {!matchedDoc && !matchedKid && (
            <div className="rounded-2xl border border-dashed border-red-300 bg-red-50/50 p-8 text-center text-xs text-red-800">
              <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
              <p className="font-bold text-sm">Folio "{searchedCode}" no encontrado</p>
              <p className="mt-1 text-gray-600">
                Verifique que el código esté escrito correctamente o búsquelo en la pestaña "Archivo Documental".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
