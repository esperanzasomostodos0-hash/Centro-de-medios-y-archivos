import React, { useState } from 'react';
import { X, PackageCheck, AlertCircle, PenTool, Check, Sparkles } from 'lucide-react';
import { InventoryItem, MaterialLoan, OperativeArea, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { SignatureModal } from './SignatureModal';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  currentUser: UserProfile;
  onSubmitLoan: (loan: MaterialLoan) => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  inventory,
  currentUser,
  onSubmitLoan,
}) => {
  const hasInventory = inventory.length > 0;
  const [selectedItemId, setSelectedItemId] = useState<string>(hasInventory ? inventory[0]?.id : 'CUSTOM');
  const [customItemNombre, setCustomItemNombre] = useState<string>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [solicitanteNombre, setSolicitanteNombre] = useState<string>(currentUser.name);
  const [solicitanteDni, setSolicitanteDni] = useState<string>(currentUser.username !== 'visitante' ? currentUser.username : '');
  const [solicitanteTelefono, setSolicitanteTelefono] = useState<string>(currentUser.telefono || '');
  const [areaOperativa, setAreaOperativa] = useState<OperativeArea>(
    currentUser.assignedArea || 'DEPORTES Y ACCIÓN SOCIAL'
  );
  const [fechaDevolucionPactada, setFechaDevolucionPactada] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [observacionesSalida, setObservacionesSalida] = useState<string>('');
  const [actividadDestino, setActividadDestino] = useState<string>('');
  const [accesoriosIncluidos, setAccesoriosIncluidos] = useState<string>('');
  const [firmaUrl, setFirmaUrl] = useState<string>('');
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const isCustom = !hasInventory || selectedItemId === 'CUSTOM';
  const currentItem = hasInventory && !isCustom ? inventory.find((i) => i.id === selectedItemId) : null;

  const handleGenerateDigitalSignature = () => {
    // Generate a formal digital signature seal
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, 300, 100);
      
      // Border
      ctx.strokeStyle = '#0D472C';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 292, 92);
      
      // Signature text
      ctx.fillStyle = '#0D472C';
      ctx.font = 'italic bold 20px cursive, serif';
      ctx.fillText(solicitanteNombre.trim() || currentUser.name, 20, 42);
      
      ctx.fillStyle = '#166534';
      ctx.font = '10px monospace';
      ctx.fillText(`DNI: ${solicitanteDni.trim() || currentUser.username} • ${new Date().toLocaleDateString('es-AR')}`, 20, 65);
      ctx.fillText('FIRMA DIGITAL REGISTRADA - CMA PUERTO ESPERANZA', 20, 80);
      
      setFirmaUrl(canvas.toDataURL('image/png'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalItemNombre = '';
    let finalItemId = '';

    if (isCustom) {
      if (!customItemNombre.trim()) {
        setErrorMsg('Por favor ingrese el nombre del material o equipo a prestar.');
        return;
      }
      finalItemNombre = customItemNombre.trim();
      finalItemId = 'item-' + Date.now();
    } else {
      if (!currentItem) {
        setErrorMsg('Debe seleccionar un material del inventario.');
        return;
      }
      if (cantidad <= 0 || (currentItem.stockDisponible > 0 && cantidad > currentItem.stockDisponible)) {
        setErrorMsg(`Cantidad inválida. Stock disponible: ${currentItem.stockDisponible}`);
        return;
      }
      finalItemNombre = currentItem.nombre;
      finalItemId = currentItem.id;
    }

    if (!solicitanteNombre.trim()) {
      setErrorMsg('Indique el nombre de la persona responsable del préstamo.');
      return;
    }

    // Auto-stamp digital signature if not yet set
    let finalFirmaUrl = firmaUrl;
    if (!finalFirmaUrl) {
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
        ctx.fillText(solicitanteNombre.trim(), 20, 42);
        ctx.fillStyle = '#166534';
        ctx.font = '10px monospace';
        ctx.fillText(`DNI: ${solicitanteDni.trim() || currentUser.username} • ${new Date().toLocaleDateString('es-AR')}`, 20, 65);
        ctx.fillText('FIRMA DIGITAL REGISTRADA - CMA PUERTO ESPERANZA', 20, 80);
        finalFirmaUrl = canvas.toDataURL('image/png');
      }
    }

    const newLoan: MaterialLoan = {
      id: 'loan-' + Date.now(),
      itemId: finalItemId,
      itemNombre: finalItemNombre,
      areaOperativa,
      cantidad: Math.max(1, cantidad),
      solicitanteNombre: solicitanteNombre.trim(),
      solicitanteDni: solicitanteDni.trim() || currentUser.username,
      solicitanteTelefono: solicitanteTelefono.trim() || 'S/D',
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucionPactada,
      estado: 'En Curso',
      actividadDestino: actividadDestino.trim() || observacionesSalida.trim() || undefined,
      accesoriosIncluidos: accesoriosIncluidos.trim() || undefined,
      firmaRetiroUrl: finalFirmaUrl,
      observacionesSalida: observacionesSalida.trim(),
    };

    onSubmitLoan(newLoan);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="w-full max-w-xl rounded-3xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
          <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D472C] text-[#F9F6EC]">
                <PackageCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                  Solicitud y Acta de Préstamo de Material
                </h3>
                <p className="text-xs text-[#162B1F]/70">
                  Control de insumos e inventario con acta y firma digital
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
            {/* Material Selector or Free Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Material o Equipo a Prestar *
              </label>

              {hasInventory ? (
                <div className="space-y-2">
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      setCantidad(1);
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  >
                    {inventory.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.codigo} - {item.nombre} (Disponibles: {item.stockDisponible} de {item.stockTotal})
                      </option>
                    ))}
                    <option value="CUSTOM">+ Solicitar otro material o equipo no listado...</option>
                  </select>

                  {isCustom && (
                    <input
                      type="text"
                      value={customItemNombre}
                      onChange={(e) => setCustomItemNombre(e.target.value)}
                      placeholder="Ej: 10 Pelotas de Fútbol N° 5 / Consola de Audio / 30 Sillas"
                      className="w-full rounded-xl border border-emerald-600 bg-emerald-50/50 px-3 py-2 text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                      required
                    />
                  )}

                  {currentItem && (
                    <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <span>📍 Ubicación: {currentItem.estanteUbicacion}</span>
                      <span className="font-bold text-[#0D472C]">
                        Área: {currentItem.areaOperativa}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customItemNombre}
                    onChange={(e) => setCustomItemNombre(e.target.value)}
                    placeholder="Ej: 12 Pelotas de fútbol / Set de micrófonos / Mesas y sillas"
                    className="w-full rounded-xl border border-[#0D472C] bg-white px-3 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                    required
                  />
                  <span className="text-[11px] text-gray-500 block">
                    Indica el material que requieres retirar para la actividad de tu área.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cantidad a Prestar *
                </label>
                <input
                  type="number"
                  min={1}
                  max={currentItem && currentItem.stockDisponible > 0 ? currentItem.stockDisponible : 999}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Área Destino / Taller *
                </label>
                <select
                  value={areaOperativa}
                  onChange={(e) => setAreaOperativa(e.target.value as OperativeArea)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                >
                  {OPERATIVE_AREAS.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Requester fields */}
            <div className="rounded-2xl border border-gray-200 bg-[#FAF7F0] p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D472C] block">
                Datos del Responsable Solicitante
              </span>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  value={solicitanteNombre}
                  onChange={(e) => setSolicitanteNombre(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    D.N.I. del Solicitante *
                  </label>
                  <input
                    type="text"
                    value={solicitanteDni}
                    onChange={(e) => setSolicitanteDni(e.target.value)}
                    placeholder="Número de D.N.I."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={solicitanteTelefono}
                    onChange={(e) => setSolicitanteTelefono(e.target.value)}
                    placeholder="03757-15..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Fecha Devolución Pactada *
                </label>
                <input
                  type="date"
                  value={fechaDevolucionPactada}
                  onChange={(e) => setFechaDevolucionPactada(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Destino / Actividad del Préstamo
                </label>
                <input
                  type="text"
                  value={observacionesSalida}
                  onChange={(e) => setObservacionesSalida(e.target.value)}
                  placeholder="Ej: Torneo barrial / Grabación de entrevista / Jornada"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Accesorios Retirados con el Equipo (Sec. 7.3)
              </label>
              <input
                type="text"
                value={accesoriosIncluidos}
                onChange={(e) => setAccesoriosIncluidos(e.target.value)}
                placeholder="Ej: Trípode, cable HDMI, tarjeta SD 64GB, 2 baterías y bolso"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
              />
            </div>

            {/* Digital Signature Box */}
            <div className="rounded-2xl border-2 border-[#0D472C]/40 bg-[#FAF7F0] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-[#0D472C] flex items-center gap-1.5">
                  <PenTool className="h-4 w-4" />
                  FIRMA DIGITAL DE RETIRO Y CONFORMIDAD *
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleGenerateDigitalSignature}
                    className="rounded-lg bg-emerald-800 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-900 transition cursor-pointer"
                  >
                    Firma Automática
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignModalOpen(true)}
                    className="rounded-lg bg-[#0D472C] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#165B3A] transition cursor-pointer"
                  >
                    Dibujar en Pantalla
                  </button>
                </div>
              </div>

              {firmaUrl ? (
                <div className="flex items-center gap-4 bg-white p-2.5 rounded-xl border border-[#0D472C]/30 shadow-xs">
                  <img
                    src={firmaUrl}
                    alt="Firma Digital"
                    className="h-14 max-w-[220px] object-contain border border-gray-200 rounded p-1 bg-[#FFFDF8]"
                  />
                  <div className="text-xs text-gray-700">
                    <p className="font-bold text-[#0D472C]">✓ Firma asentada</p>
                    <p className="text-[11px] text-gray-500">
                      Responsable: <strong>{solicitanteNombre}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 border border-dashed border-gray-300 rounded-xl bg-white/70">
                  <p className="text-xs text-gray-500">
                    Haga clic en <strong>"Dibujar en Pantalla"</strong> o <strong>"Firma Automática"</strong> para validar el préstamo.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0D472C]/20">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#165B3A] transition cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Confirmar y Retirar Material</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Signature canvas modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(dataUrl) => setFirmaUrl(dataUrl)}
        title="Firma Digital de Recepción de Material"
        subtitle="Dibuje su firma con el dedo o mouse para constatar el retiro del equipamiento"
        signerName={solicitanteNombre}
      />
    </>
  );
};
