import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { ArchiveDocument } from '../types';

interface FolioPrintModalProps {
  document: ArchiveDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FolioPrintModal: React.FC<FolioPrintModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !document) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrData = JSON.stringify({
    folio: document.codigoFolio,
    area: document.areaOperativa,
    tipo: document.tipoAdministrativo,
    estante: document.estanteFisico,
    anio: document.anio,
    institucion: 'CENTRO DE MEDIOS Y ARCHIVOS - Puerto Esperanza',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
        {/* Controls header (hidden on print) */}
        <div className="no-print flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D472C] text-[#F9F6EC]">
              <Printer className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-archival text-base font-bold text-[#0D472C]">
                Etiqueta Oficial de Folio Físico y QR
              </h3>
              <p className="text-xs text-[#162B1F]/70">
                Formato reglamentario para pegar en lomos de carpetas, cajas o estantes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-3.5 py-1.5 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] shadow transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Imprimir Etiqueta
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Badge Area */}
        <div
          id="printable-folio-badge"
          className="relative bg-[#FFFDF8] border-archival p-6 rounded-lg text-[#0D472C]"
        >
          {/* Corner ornaments */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#0D472C]" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#0D472C]" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#0D472C]" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#0D472C]" />

          {/* Header image banner matching photo */}
          <div className="mb-4 overflow-hidden rounded-md border border-[#0D472C]/40 bg-[#F9F6EC]">
            <img
              src="/assets/aistudio/7b7d3321-35c1-4d47-9d2f-28cfcd4eb5e9_72fa0376.jpg"
              alt="Centro de Medios y Archivos - Puerto Esperanza"
              className="w-full max-h-32 object-contain mx-auto"
            />
          </div>

          <div className="border-t-2 border-b-2 border-[#0D472C] py-2 mb-4 text-center">
            <span className="font-mono-tag text-xs tracking-widest text-[#0D472C]/80 uppercase">
              CÉDULA DE ARCHIVO Y RESGUARDO HISTÓRICO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Folio info */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  CÓDIGO DE FOLIO FÍSICO
                </span>
                <div className="font-mono-tag text-2xl font-black text-[#0D472C] tracking-tight bg-[#E8F3ED] px-3 py-1.5 rounded border border-[#0D472C]/30 inline-block mt-0.5">
                  {document.codigoFolio}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  TÍTULO DEL DOCUMENTO / EXPEDIENTE
                </span>
                <p className="font-bold text-sm text-gray-900 leading-snug">
                  {document.titulo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#0D472C]/20">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                    Área Operativa
                  </span>
                  <span className="font-bold text-[#0D472C]">
                    {document.areaOperativa}
                  </span>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#0D472C]/20">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                    Tipo Administrativo
                  </span>
                  <span className="font-bold text-[#0D472C]">
                    {document.tipoAdministrativo}
                  </span>
                </div>
              </div>

              {/* Physical Shelf - Key highlight */}
              <div className="bg-[#0D472C] text-[#F9F6EC] p-2.5 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-green-200 block">
                    UBICACIÓN FÍSICA OBLIGATORIA EN OFICINA
                  </span>
                  <span className="font-mono-tag font-bold text-sm text-white">
                    📍 {document.estanteFisico}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase text-green-200 block">Año</span>
                  <span className="font-bold text-base">{document.anio}</span>
                </div>
              </div>
            </div>

            {/* QR Code and official seal */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#FAF7F0] rounded-xl border border-[#0D472C]/30 text-center">
              <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-200">
                <QRCodeSVG
                  value={qrData}
                  size={128}
                  level="M"
                  includeMargin={false}
                  fgColor="#0D472C"
                />
              </div>
              <span className="font-mono-tag text-[10px] text-[#0D472C] font-bold mt-2">
                FOLIO QR ESCANEABLE
              </span>
              <p className="text-[9px] text-gray-500 max-w-[150px] leading-tight mt-0.5">
                Escanee con la cámara para auditar en sistema
              </p>
            </div>
          </div>

          {/* Footer signature line */}
          <div className="mt-6 pt-4 border-t border-dashed border-[#0D472C]/40 flex items-end justify-between text-[11px] text-gray-600">
            <div>
              <p><strong>Soporte:</strong> {document.soporteFisico}</p>
              <p><strong>Cargado por:</strong> {document.autor} ({document.fecha})</p>
            </div>
            <div className="text-center w-48">
              <div className="border-b border-[#0D472C] mb-1 pb-4 flex items-center justify-center text-[#0D472C]">
                <ShieldCheck className="h-5 w-5 mr-1" />
                <span className="text-[10px] font-bold">Resguardo Conforme</span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Firma y Sello Oficial
              </span>
            </div>
          </div>
        </div>

        {/* Action footnote */}
        <div className="no-print mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Consejo: Puede recortar e insertar esta etiqueta en la funda plástica del folio.</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-700 hover:text-black underline"
          >
            Cerrar vista
          </button>
        </div>
      </div>
    </div>
  );
};
