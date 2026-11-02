import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  PenTool, 
  FileText, 
  Search, 
  AlertTriangle,
  MapPin,
  Sparkles
} from 'lucide-react';
import { InventoryItem, MaterialLoan, OperativeArea, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface InventoryViewProps {
  inventory: InventoryItem[];
  loans: MaterialLoan[];
  currentUser: UserProfile;
  initialAreaFilter?: OperativeArea | 'TODAS';
  onOpenNewLoan: () => void;
  onOpenReturnLoan: (loan: MaterialLoan) => void;
  onOpenNewItem?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  loans,
  currentUser,
  initialAreaFilter = 'TODAS',
  onOpenNewLoan,
  onOpenReturnLoan,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'loans'>('stock');
  const [selectedArea, setSelectedArea] = useState<OperativeArea | 'TODAS'>(initialAreaFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const canViewAllLoans = currentUser.role === 'ADMIN' || currentUser.role === 'CARGADOR_DATOS';

  // Filter inventory
  const filteredStock = inventory.filter((item) => {
    if (selectedArea !== 'TODAS' && item.areaOperativa !== selectedArea) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.nombre.toLowerCase().includes(q) ||
        item.codigo.toLowerCase().includes(q) ||
        item.estanteUbicacion.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter loans - strictly personal for standard users as requested
  const filteredLoans = loans.filter((loan) => {
    if (!canViewAllLoans) {
      const matchName = loan.solicitanteNombre.toLowerCase().includes(currentUser.name.toLowerCase());
      const matchDni = Boolean(loan.solicitanteDni && loan.solicitanteDni === currentUser.username);
      if (!matchName && !matchDni) return false;
    }
    if (selectedArea !== 'TODAS' && loan.areaOperativa !== selectedArea) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loan.itemNombre.toLowerCase().includes(q) ||
        loan.solicitanteNombre.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeLoansCount = loans.filter((l) => l.estado === 'En Curso').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <h2 className="font-archival text-xl font-bold text-[#0D472C]">
            Inventario y Módulo de Préstamos con Firma Digital
          </h2>
          <p className="text-xs text-gray-600">
            Resguardo de equipamiento institucional (pelotas, pinturas, notebooks, instrumentos) y actas de salida
          </p>
        </div>

        {currentUser.role !== 'VISITANTE' && (
          <button
            onClick={onOpenNewLoan}
            className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
          >
            <PenTool className="h-4 w-4" />
            <span>Nuevo Préstamo con Firma</span>
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-[#E8F3ED] p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-[#0D472C] shadow-xs'
                : 'text-gray-600 hover:text-[#0D472C]'
            }`}
          >
            Stock de Materiales ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'loans'
                ? 'bg-white text-[#0D472C] shadow-xs'
                : 'text-gray-600 hover:text-[#0D472C]'
            }`}
          >
            Actas de Préstamos con Firma ({loans.length})
            {activeLoansCount > 0 && (
              <span className="bg-[#0D472C] text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {activeLoansCount} activos
              </span>
            )}
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar material o solicitante..."
            className="w-48 sm:w-60 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#0D472C]"
          />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value as any)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
          >
            <option value="TODAS">Todas las Áreas</option>
            {OPERATIVE_AREAS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW A: STOCK TABLE & CARDS */}
      {activeTab === 'stock' && (
        filteredStock.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[#0D472C]/30 bg-white p-10 text-center space-y-3">
            <Package className="h-12 w-12 text-[#0D472C]/40 mx-auto" />
            <h3 className="font-archival text-base font-bold text-gray-800">
              No hay materiales registrados en inventario aún
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Puedes solicitar o retirar cualquier material para tu área completando el acta de préstamo con firma digital.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenNewLoan}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0D472C] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#165B3A] transition cursor-pointer"
              >
                <PenTool className="h-4 w-4" />
                <span>Pedir Préstamo de Material con Firma Digital</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStock.map((item) => {
            const isLowStock = item.stockDisponible === 0;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#0D472C]/25 bg-white p-5 shadow-xs hover:border-[#0D472C] hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono-tag text-xs font-black text-[#0D472C] bg-[#E8F3ED] px-2 py-0.5 rounded border border-[#0D472C]/20">
                      {item.codigo}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-[#0D472C] px-2 py-0.5 rounded">
                      {item.areaOperativa}
                    </span>
                  </div>

                  <h3 className="font-archival text-sm font-bold text-gray-900 leading-snug">
                    {item.nombre}
                  </h3>
                  <span className="text-[11px] text-gray-500 block">
                    Categoría: {item.categoria} • Conservación: <strong>{item.estadoConservacion}</strong>
                  </span>

                  {/* Stock Metrics */}
                  <div className="mt-3 bg-[#FAF7F0] p-3 rounded-xl border border-gray-200 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="font-mono-tag text-xl font-black text-gray-800 block">
                        {item.stockTotal}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">
                        Stock Total
                      </span>
                    </div>
                    <div className="border-l border-gray-200">
                      <span
                        className={`font-mono-tag text-xl font-black block ${
                          isLowStock ? 'text-red-600' : 'text-[#0D472C]'
                        }`}
                      >
                        {item.stockDisponible}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">
                        Disponible Ahora
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                    <span>📍 {item.estanteUbicacion}</span>
                  </div>

                  {item.observaciones && (
                    <p className="mt-2 text-[11px] text-gray-500 italic">
                      {item.observaciones}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Puerto Esperanza CMA
                  </span>
                  {currentUser.role !== 'VISITANTE' && item.stockDisponible > 0 && (
                    <button
                      onClick={onOpenNewLoan}
                      className="flex items-center gap-1 rounded-lg bg-[#0D472C] px-3 py-1 text-xs font-bold text-white hover:bg-[#165B3A] transition cursor-pointer"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      Prestar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* VIEW B: ACTAS DE PRÉSTAMOS CON FIRMA DIGITAL */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {!canViewAllLoans && (
            <div className="rounded-2xl border-2 border-emerald-600/30 bg-[#E8F3ED] p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold block text-sm text-[#0D472C]">🔒 Historial Personal de Préstamos</span>
                <span className="text-gray-600">Visualizando únicamente los materiales solicitados por ti ({currentUser.name}). El apartado completo y la gestión de todos los préstamos está a cargo de Coordinación y Cargador de Datos.</span>
              </div>
              <button
                onClick={onOpenNewLoan}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
              >
                <PenTool className="h-4 w-4" />
                <span>Pedir Material</span>
              </button>
            </div>
          )}
          {filteredLoans.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#0D472C]/30 bg-white p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">No hay registros de préstamos activos con estos filtros.</p>
            </div>
          ) : (
            filteredLoans.map((loan) => {
              const isActive = loan.estado === 'En Curso';

              return (
                <div
                  key={loan.id}
                  className={`rounded-2xl border p-5 bg-white transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isActive
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-2 grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-white bg-[#0D472C] px-2 py-0.5 rounded">
                        {loan.areaOperativa}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isActive
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {loan.estado}
                      </span>
                      <span className="font-mono text-xs text-gray-500">
                        Fecha Salida: {loan.fechaPrestamo} • Pactada: {loan.fechaDevolucionPactada}
                      </span>
                    </div>

                    <h4 className="font-archival text-base font-bold text-gray-900 leading-snug">
                      {loan.cantidad}x {loan.itemNombre}
                    </h4>

                    <div className="text-xs text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF7F0] p-2.5 rounded-xl border border-gray-200">
                      <div>
                        <p><strong>Solicitante Profe:</strong> {loan.solicitanteNombre}</p>
                        <p className="text-gray-500">DNI: {loan.solicitanteDni} • Tel: {loan.solicitanteTelefono}</p>
                      </div>
                      <div>
                        <p><strong>Destino:</strong> {loan.observacionesSalida || 'Uso institucional'}</p>
                        {loan.fechaDevolucionReal && (
                          <p className="text-emerald-800 font-semibold">
                            ✓ Devuelto el: {loan.fechaDevolucionReal}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Preview Box */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <div className="text-center p-2 rounded-xl bg-white border border-[#0D472C]/30 shadow-xs">
                      <span className="text-[9px] uppercase font-bold text-[#0D472C] block mb-1">
                        FIRMA RETIRO
                      </span>
                      {loan.firmaRetiroUrl ? (
                        <img
                          src={loan.firmaRetiroUrl}
                          alt="Firma Retiro"
                          className="h-12 w-28 object-contain bg-[#FFFDF8] border border-gray-200 rounded p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">Sin firma</span>
                      )}
                    </div>

                    {loan.firmaDevolucionUrl && (
                      <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs">
                        <span className="text-[9px] uppercase font-bold text-emerald-900 block mb-1">
                          FIRMA RECEPCIÓN
                        </span>
                        <img
                          src={loan.firmaDevolucionUrl}
                          alt="Firma Devolución"
                          className="h-12 w-28 object-contain bg-white border border-emerald-200 rounded p-0.5"
                        />
                      </div>
                    )}

                    {isActive && currentUser.role !== 'VISITANTE' && (
                      <button
                        onClick={() => onOpenReturnLoan(loan)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#165B3A] shadow transition cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Asentar Devolución</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
