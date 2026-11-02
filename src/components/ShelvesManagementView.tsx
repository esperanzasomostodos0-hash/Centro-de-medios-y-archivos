import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Folder, 
  Package, 
  Check, 
  AlertCircle, 
  MapPin, 
  FileText, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { OfficeShelf, UserProfile, OfficeFolioCategory } from '../types';
import { OFFICE_SHELF_FOLIOS } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface ShelvesManagementViewProps {
  currentUser: UserProfile;
}

export const ShelvesManagementView: React.FC<ShelvesManagementViewProps> = ({
  currentUser,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const canManage = isAdmin || currentUser.role === 'CARGADOR_DATOS';

  const [shelves, setShelves] = useState<OfficeShelf[]>(() => StorageService.getShelves());
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);

  // Form states
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState(1);
  const [ubicacion, setUbicacion] = useState('Sede Central');
  const [descripcion, setDescripcion] = useState('');
  const [capacidadCarpetas, setCapacidadCarpetas] = useState(15);
  const [foliosAsignados, setFoliosAsignados] = useState<OfficeFolioCategory[]>([]);

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const resetForm = () => {
    setIsCreatingShelf(false);
    setEditingShelfId(null);
    setNombre('');
    setNumero(shelves.length + 1);
    setUbicacion('Sede Central');
    setDescripcion('');
    setCapacidadCarpetas(15);
    setFoliosAsignados([]);
  };

  const handleStartEdit = (shelf: OfficeShelf) => {
    setEditingShelfId(shelf.id);
    setNombre(shelf.nombre);
    setNumero(shelf.numero);
    setUbicacion(shelf.ubicacion);
    setDescripcion(shelf.descripcion);
    setCapacidadCarpetas(shelf.capacidadCarpetas);
    setFoliosAsignados(shelf.foliosAsignados || []);
    setIsCreatingShelf(true);
  };

  const handleToggleFolio = (folioName: OfficeFolioCategory) => {
    if (foliosAsignados.includes(folioName)) {
      setFoliosAsignados(foliosAsignados.filter((f) => f !== folioName));
    } else {
      setFoliosAsignados([...foliosAsignados, folioName]);
    }
  };

  const handleSaveShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      showNotification('error', 'Solo el Coordinador General o el Cargador de Datos pueden modificar o crear estantes.');
      return;
    }
    if (!nombre.trim()) {
      showNotification('error', 'El nombre del estante es obligatorio.');
      return;
    }

    const newShelf: OfficeShelf = {
      id: editingShelfId || 'shelf-' + Date.now(),
      numero: Number(numero) || 1,
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim() || 'Sede Central',
      descripcion: descripcion.trim(),
      capacidadCarpetas: Number(capacidadCarpetas) || 15,
      foliosAsignados,
      creadoEn: new Date().toISOString(),
    };

    const updated = StorageService.saveShelf(newShelf, currentUser);
    setShelves(updated);
    showNotification('success', editingShelfId ? `Estante "${newShelf.nombre}" modificado correctamente.` : `Nuevo estante "${newShelf.nombre}" creado.`);
    resetForm();
  };

  const handleDeleteShelf = (shelfId: string) => {
    if (!canManage) {
      showNotification('error', 'No tiene permisos para borrar estantes.');
      return;
    }
    const updated = StorageService.deleteShelf(shelfId, currentUser);
    setShelves(updated);
    showNotification('success', 'Estante eliminado.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#0F766E] text-white p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded uppercase">
                Mobiliario & Estanterías Físicas
              </span>
              <span className="text-xs text-emerald-100">Puerto Esperanza</span>
              <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded border border-white/20">
                {shelves.length} estantes registrados
              </span>
            </div>

            <h1 className="font-archival text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Gestión y Configuración de Estantes
            </h1>
            <p className="text-xs text-emerald-50 max-w-xl mt-1.5 leading-relaxed">
              Edite los nombres de los estantes físicos, agregue o elimine estantes, y defina con exactitud qué folios, actas y materiales se resguardan en cada uno.
            </p>
          </div>

          {canManage && !isCreatingShelf && (
            <button
              onClick={() => {
                resetForm();
                setIsCreatingShelf(true);
              }}
              className="flex items-center gap-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-950 px-5 py-3 text-xs font-bold shadow-md transition cursor-pointer self-start md:self-auto active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Nuevo Estante</span>
            </button>
          )}
        </div>
      </div>

      {notificationMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in ${
          notificationMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
        }`}>
          {notificationMsg.type === 'success' ? <Check className="h-4 w-4 text-emerald-700" /> : <AlertCircle className="h-4 w-4 text-red-700" />}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* FORM: CREATE OR EDIT SHELF */}
      {isCreatingShelf && canManage && (
        <div className="rounded-3xl border-2 border-[#0F766E] bg-[#FFFDF8] p-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-archival text-base font-bold text-[#0F766E] flex items-center gap-2">
              <Layers className="h-5 w-5" />
              <span>{editingShelfId ? 'Editar Estante y Asignación de Contenido' : 'Crear Nuevo Estante en la Oficina'}</span>
            </h3>
            <button onClick={resetForm} className="text-xs text-gray-500 hover:text-black underline cursor-pointer">
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveShelf} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Nombre Oficial del Estante *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Estante 1 - Coordinación General y Resoluciones"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#0F766E]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Número de Estante</label>
                <input
                  type="number"
                  min={1}
                  value={numero}
                  onChange={(e) => setNumero(Number(e.target.value))}
                  className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ubicación Física en la Sede</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Ej: Sede Central - Pared Este / Sector Deportes"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Capacidad Estimada de Carpetas</label>
                <input
                  type="number"
                  min={1}
                  value={capacidadCarpetas}
                  onChange={(e) => setCapacidadCarpetas(Number(e.target.value))}
                  className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Descripción y Contenido General</label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles sobre lo que se resguarda en este estante físico..."
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs"
              />
            </div>

            {/* ASSIGN WHAT GOES INTO THIS SHELF ("poner cosas en esos estantes") */}
            <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-bold text-[#0D472C] uppercase text-xs">
                  Folios Oficiales y Carpetas Asignadas a este Estante ({foliosAsignados.length})
                </label>
                <span className="text-[11px] text-gray-500">Marque los folios que se colocarán en este estante</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OFFICE_SHELF_FOLIOS.map((folio) => {
                  const isAssigned = foliosAsignados.includes(folio.name);
                  return (
                    <button
                      key={folio.id}
                      type="button"
                      onClick={() => handleToggleFolio(folio.name)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-left text-xs transition cursor-pointer border ${
                        isAssigned
                          ? 'bg-[#0D472C] text-white border-[#0D472C] font-bold shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Folder className={`h-3.5 w-3.5 shrink-0 ${isAssigned ? 'text-amber-300' : 'text-[#0D472C]'}`} />
                      <span className="truncate">{folio.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold shadow cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{editingShelfId ? 'Guardar Cambios de Estante' : 'Confirmar Creación de Estante'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHELVES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shelves.map((shelf) => (
          <div
            key={shelf.id}
            className="rounded-3xl border-2 border-gray-200/90 bg-white p-5 shadow-xs hover:border-[#0F766E] hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold bg-[#E8F3ED] text-[#0D472C] px-2.5 py-0.5 rounded-full border border-[#0D472C]/20">
                  Estante N° {shelf.numero}
                </span>

                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Capacidad: {shelf.capacidadCarpetas} carpetas
                </span>
              </div>

              <div className="flex items-start gap-3 mb-2">
                <div className="h-11 w-11 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-archival text-base font-black text-gray-900 leading-snug">
                    {shelf.nombre}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{shelf.ubicacion}</span>
                  </p>
                </div>
              </div>

              {shelf.descripcion && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                  {shelf.descripcion}
                </p>
              )}

              {/* Contenido / Folios que tiene este estante */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Folios y Cosas Resguardadas en este Estante ({shelf.foliosAsignados?.length || 0}):
                </span>

                {shelf.foliosAsignados && shelf.foliosAsignados.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {shelf.foliosAsignados.map((folio, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold bg-[#FAF7F0] text-[#0D472C] border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Folder className="h-3 w-3 text-amber-600" />
                        <span>{folio}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic block">
                    No se han asignado folios específicos a este estante todavía.
                  </span>
                )}
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleStartEdit(shelf)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editar Nombre y Cosas</span>
                </button>

                <button
                  onClick={() => handleDeleteShelf(shelf.id)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Eliminar este estante"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
