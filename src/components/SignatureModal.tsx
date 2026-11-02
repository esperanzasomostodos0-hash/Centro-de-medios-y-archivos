import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title: string;
  subtitle?: string;
  signerName: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  subtitle,
  signerName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        clearCanvas();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0D472C'; // Brand green ink
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#FFFDF8] border-2 border-[#0D472C] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0D472C] text-[#F9F6EC]">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-archival text-lg font-bold text-[#0D472C]">{title}</h3>
              <p className="text-xs text-[#162B1F]/70">{subtitle || 'Firma de puño y letra sobre la pantalla'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4">
          <div className="mb-2 flex items-center justify-between text-xs text-[#162B1F]/80">
            <span>Firmante: <strong className="text-[#0D472C]">{signerName}</strong></span>
            <span className="italic text-gray-500">Use el dedo en móviles o mouse en PC</span>
          </div>

          <div className="relative rounded-xl border-2 border-dashed border-[#0D472C]/40 bg-[#FAF7F0] overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              className="w-full touch-none cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="pointer-events-none absolute bottom-4 left-6 right-6 border-b border-gray-300 text-right">
              <span className="text-[10px] text-gray-400">Línea de firma</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1.5 rounded-lg border border-[#0D472C]/30 px-3 py-2 text-xs font-medium text-[#0D472C] hover:bg-[#E8F3ED] transition"
          >
            <RotateCcw className="h-4 w-4" />
            Borrar / Repetir
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!hasSignature}
              onClick={handleConfirm}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-md transition ${
                hasSignature
                  ? 'bg-[#0D472C] hover:bg-[#165B3A] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Check className="h-4 w-4" />
              Asentar Firma Digital
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
