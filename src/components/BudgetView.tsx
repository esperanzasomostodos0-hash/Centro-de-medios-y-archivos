import React, { useState } from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  DollarSign, 
  MapPin, 
  FileSpreadsheet, 
  ShieldAlert, 
  Building2,
  Lock
} from 'lucide-react';
import { BudgetRecord, UserProfile } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';

interface BudgetViewProps {
  budget: BudgetRecord[];
  currentUser: UserProfile;
  onOpenNewBudget: () => void;
  onViewDocFolio: (folio: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budget,
  currentUser,
  onOpenNewBudget,
  onViewDocFolio,
}) => {
  const [filterType, setFilterType] = useState<'TODOS' | 'Ingreso' | 'Gasto'>('TODOS');
  const [selectedArea, setSelectedArea] = useState<string>('TODAS');

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="rounded-2xl border-2 border-[#0D472C]/30 bg-white p-12 text-center my-6">
        <Lock className="mx-auto h-12 w-12 text-amber-700" />
        <h3 className="font-archival mt-3 text-lg font-bold text-[#0D472C]">
          Acceso Restringido a Coordinación General
        </h3>
        <p className="mt-2 text-xs text-gray-600 max-w-md mx-auto">
          El módulo de <strong>Presupuesto, Recaudación y Balance</strong> está reservado exclusivamente para el perfil <strong>ADMIN</strong> de acuerdo al protocolo administrativo del Centro de Medios.
        </p>
      </div>
    );
  }

  const totalIngresos = budget
    .filter((b) => b.tipo === 'Ingreso')
    .reduce((acc, curr) => acc + curr.monto, 0);

  const totalGastos = budget
    .filter((b) => b.tipo === 'Gasto')
    .reduce((acc, curr) => acc + curr.monto, 0);

  const balanceNeto = totalIngresos - totalGastos;

  const filteredBudget = budget.filter((b) => {
    if (filterType !== 'TODOS' && b.tipo !== filterType) return false;
    if (selectedArea !== 'TODAS' && b.areaOperativa !== selectedArea) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-archival text-xl font-bold text-[#0D472C]">
              Presupuesto, Recaudación y Balance
            </h2>
            <span className="text-[10px] font-bold bg-amber-900 text-amber-200 px-2 py-0.5 rounded border border-amber-700">
              RESERVADO ADMIN
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Control de partidas institucionales, fondos cooperadores y facturación archivada en estantería física
          </p>
        </div>

        <button
          onClick={onOpenNewBudget}
          className="flex items-center gap-1.5 rounded-lg bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Asentar Ingreso / Gasto</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">Total Ingresos</span>
            <TrendingUp className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="mt-2 font-mono-tag text-2xl font-black text-emerald-900">
            ${totalIngresos.toLocaleString()} ARS
          </div>
          <span className="text-[10px] text-emerald-700">Partidas y fondos cooperadores</span>
        </div>

        {/* Total Gastos */}
        <div className="rounded-2xl border border-red-300 bg-red-50/70 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-900 uppercase">Total Egresos / Compras</span>
            <TrendingDown className="h-5 w-5 text-red-700" />
          </div>
          <div className="mt-2 font-mono-tag text-2xl font-black text-red-900">
            ${totalGastos.toLocaleString()} ARS
          </div>
          <span className="text-[10px] text-red-700">Insumos de arte, deporte y refrigerios</span>
        </div>

        {/* Balance Neto */}
        <div className="rounded-2xl border border-[#0D472C] bg-[#FFFDF8] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0D472C] uppercase">Balance Disponible</span>
            <Coins className="h-5 w-5 text-[#0D472C]" />
          </div>
          <div className="mt-2 font-mono-tag text-2xl font-black text-[#0D472C]">
            ${balanceNeto.toLocaleString()} ARS
          </div>
          <span className="text-[10px] text-gray-500">Superávit contable de la oficina</span>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#0D472C]/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-600">Filtrar por tipo:</span>
          <button
            onClick={() => setFilterType('TODOS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'TODOS' ? 'bg-[#0D472C] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('Ingreso')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'Ingreso' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Ingresos
          </button>
          <button
            onClick={() => setFilterType('Gasto')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'Gasto' ? 'bg-red-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Gastos
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-600">Área Imputada:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="rounded-lg border border-gray-300 p-1.5 font-semibold text-[#0D472C]"
          >
            <option value="TODAS">Todas las Áreas</option>
            <option value="GENERAL">GENERAL</option>
            {OPERATIVE_AREAS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounting Records Table */}
      <div className="rounded-2xl border border-[#0D472C]/20 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                <th className="p-3">Fecha</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Área</th>
                <th className="p-3">Concepto & Categoría</th>
                <th className="p-3">Folio Comprobante Físico</th>
                <th className="p-3">Ubicación Estante</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBudget.map((rec) => {
                const isIngreso = rec.tipo === 'Ingreso';

                return (
                  <tr key={rec.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-mono text-gray-600 whitespace-nowrap">
                      {rec.fecha}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          isIngreso
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rec.tipo}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {rec.areaOperativa}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900 leading-tight">
                        {rec.concepto}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {rec.categoria} • Autorizado por: {rec.aprobadoPor}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] font-bold text-[#0D472C]">
                      <button
                        onClick={() => onViewDocFolio(rec.folioComprobante)}
                        className="underline hover:text-black cursor-pointer"
                        title="Buscar en archivo documental"
                      >
                        {rec.folioComprobante}
                      </button>
                    </td>
                    <td className="p-3 text-[11px] text-amber-900 font-medium">
                      📍 {rec.estanteFactura}
                    </td>
                    <td
                      className={`p-3 text-right font-mono text-sm font-black whitespace-nowrap ${
                        isIngreso ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {isIngreso ? '+' : '-'}${rec.monto.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
