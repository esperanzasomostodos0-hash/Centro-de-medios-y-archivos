import React, { useState } from 'react';
import { X, CheckCircle2, PenTool, Check, AlertCircle } from 'lucide-react';
import { MaterialLoan, UserProfile } from '../types';
import { SignatureModal } from './SignatureModal';

interface ReturnLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: MaterialLoan | null;
  currentUser: UserProfile;
  onConfirmReturn: (loanId: string, firmaDevolucionUrl: string, observaciones: string) => void;
}

export const ReturnLoanModal: React.FC<ReturnLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  currentUser,
  onConfirmReturn,
}) => {
  const [observaciones, setObservaciones] = useState<string>('Material verificado y devuelto en condiciones.');
  const [firmaUrl, setFirmaUrl] = useState<string>('');
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !loan) return null;

  const handleGenerateDigitalSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, 300, 100);
      ctx.strokeStyle = '#0D472C';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 292, 92);
      ctx.fillStyle = '#0D472C';
      ctx.font = 'italic bold 20px cursive, serif';
      ctx.fillText(currentUser.name, 20, 42);
      ctx.fillStyle = '#166534';
      ctx.font = '10px monospace';
      ctx.fillText(`DNI: ${currentUser.username} • RECEPCIÓN OFICIAL`, 20, 65);
      ctx.fillText(new Date().toLocaleDateString('es-AR') + ' - CMA PUERTO ESPERANZA', 20, 80);
      setFirmaUrl(canvas.toDataURL('image/png'));
      setErrorMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalFirma = firmaUrl;
    if (!finalFirma) {
      handleGenerateDigitalSignature();
      return;
    }
    onConfirmReturn(loan.id, finalFirma, observaciones.trim());
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="w-full max-w-lg rounded-2xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
          <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D472C] text-[#F9F6EC]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                  Acta de Devolución e Ingreso a Stock
                </h3>
                <p className="text-xs text-[#162B1F]/70">
                  Reincorporación física del material prestado
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

          <div className="mb-4 rounded-xl bg-[#FAF7F0] p-4 border border-[#0D472C]/20 text-xs space-y-1.5">
            <p><strong>Material:</strong> {loan.itemNombre} (Cantidad: {loan.cantidad})</p>
            <p><strong>Retirado por:</strong> {loan.solicitanteNombre} (DNI: {loan.solicitanteDni})</p>
            <p><strong>Área Operativa:</strong> {loan.areaOperativa}</p>
            <p><strong>Fecha Salida:</strong> {loan.fechaPrestamo} • <strong>Pactado:</strong> {loan.fechaDevolucionPactada}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estado de Recepción / Observaciones Físicas
              </label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                placeholder="Verificado estado de limpieza, integridad y cantidad..."
                required
              />
            </div>

            {/* Signature Box */}
            <div className="rounded-xl border border-[#0D472C]/40 bg-[#FAF7F0] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0D472C] flex items-center gap-1.5">
                  <PenTool className="h-4 w-4" />
                  FIRMA DIGITAL DE RECEPTOR DE ARCHIVO *
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(true)}
                  className="rounded bg-[#0D472C] px-3 py-1 text-xs font-bold text-white hover:bg-[#165B3A] transition cursor-pointer"
                >
                  {firmaUrl ? 'Cambiar Firma' : 'Firmar Recepción'}
                </button>
              </div>

              {firmaUrl ? (
                <div className="flex items-center gap-4 bg-white p-2.5 rounded-lg border border-[#0D472C]/30">
                  <img
                    src={firmaUrl}
                    alt="Firma Recepción"
                    className="h-14 max-w-[200px] object-contain border border-gray-200 rounded p-1 bg-[#FFFDF8]"
                  />
                  <div className="text-xs text-gray-700">
                    <p className="font-bold text-[#0D472C]">✓ Firma asentada</p>
                    <p className="text-[11px] text-gray-500">
                      Receptor: {currentUser.name} ({currentUser.role})
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-800 italic bg-amber-50 p-2.5 rounded border border-amber-200">
                  Haga clic en "Firmar Recepción" para validar el acta y reingresar las unidades al stock disponible.
                </p>
              )}
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
                Confirmar Devolución a Depósito
              </button>
            </div>
          </form>
        </div>
      </div>

      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(url) => {
          setFirmaUrl(url);
          setErrorMsg('');
        }}
        title="Firma Digital de Recepción y Control de Material"
        subtitle="Constancia de reingreso al inventario de Puerto Esperanza"
        signerName={currentUser.name}
      />
    </>
  );
};
