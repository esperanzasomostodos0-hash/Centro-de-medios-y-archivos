import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Key, 
  Phone, 
  Briefcase,
  Users
} from 'lucide-react';
import { UserProfile, UserRole, OperativeArea } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUsersUpdated: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [passwordPin, setPasswordPin] = useState('1234');
  const [role, setRole] = useState<UserRole>('CARGADOR_DATOS');
  const [assignedArea, setAssignedArea] = useState<OperativeArea>('DEPORTES Y ACCIÓN SOCIAL');
  const [position, setPosition] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setUsername('');
    setPasswordPin('1234');
    setRole('CARGADOR_DATOS');
    setAssignedArea('DEPORTES Y ACCIÓN SOCIAL');
    setPosition('');
    setTelefono('');
    setErrorMsg('');
    setIsAddingUser(false);
    setEditingUserId(null);
  };

  const handleStartEdit = (user: UserProfile) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPasswordPin(user.passwordPin);
    setRole(user.role);
    setAssignedArea((user.assignedArea as OperativeArea) || 'DEPORTES Y ACCIÓN SOCIAL');
    setPosition(user.position);
    setTelefono(user.telefono || '');
    setIsAddingUser(true);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      setErrorMsg('Nombre y usuario son obligatorios.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate username if new
    if (!editingUserId) {
      const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        setErrorMsg(`El usuario o DNI "${cleanUsername}" ya existe en el sistema.`);
        return;
      }
    }

    const newUser: UserProfile = {
      id: editingUserId || 'user-' + Date.now(),
      name: name.trim(),
      username: cleanUsername,
      passwordPin: passwordPin.trim() || '1234',
      role,
      assignedArea: role === 'CARGADOR_DATOS' || role === 'SOLICITANTE' || role === 'SECRETARIO' ? assignedArea : undefined,
      position: position.trim() || `Personal de ${assignedArea}`,
      telefono: telefono.trim(),
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    const updated = StorageService.saveUser(newUser, currentUser);
    setUsers(updated);
    onUsersUpdated();
    resetForm();
  };

  const handleDelete = (user: UserProfile) => {
    if (user.username === '49993070') {
      setErrorMsg('La cuenta del Coordinador General Almada Eduardo Thomas está protegida y no puede eliminarse.');
      return;
    }

    const updated = StorageService.deleteUser(user.id, currentUser);
    setUsers(updated);
    onUsersUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between border-b border-[#0D472C]/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D472C] text-[#F9F6EC] shadow-xs">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-archival text-lg font-bold text-[#0D472C]">
                  Gestión y Alta de Usuarios de la Oficina
                </h3>
                <span className="text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2 py-0.5 rounded border border-[#0D472C]/20">
                  Panel Exclusivo Admin
                </span>
              </div>
              <p className="text-xs text-[#162B1F]/70">
                Coordinador General: Almada Eduardo Thomas (49993070)
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
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Top actions */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-700">
            Personal Registrado: <strong>{users.length} usuarios activos</strong>
          </span>

          {!isAddingUser && (
            <button
              onClick={() => {
                resetForm();
                setIsAddingUser(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-3.5 py-2 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] shadow transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Crear Nuevo Usuario</span>
            </button>
          )}
        </div>

        {/* Create / Edit Form */}
        {isAddingUser && (
          <div className="mb-6 rounded-2xl border-2 border-[#0D472C]/30 bg-[#FAF7F0] p-5 shadow-inner">
            <h4 className="font-archival text-sm font-bold text-[#0D472C] mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              {editingUserId ? 'Editar Datos del Usuario' : 'Formulario de Alta de Nuevo Usuario'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ezequiel Villalba / Micaela"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Usuario / DNI de Acceso *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: ezequiel.villalba o 42198000"
                    className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contraseña / PIN *
                  </label>
                  <input
                    type="text"
                    value={passwordPin}
                    onChange={(e) => setPasswordPin(e.target.value)}
                    placeholder="1234"
                    className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#0D472C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rol en la Oficina *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRole(newRole);
                      if (newRole === 'VISITANTE') {
                        setPosition('Consulta Pública de Talleres y Cartelera');
                      }
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
                  >
                    <option value="CARGADOR_DATOS">CARGADOR DE DATOS (Solo su área asignada)</option>
                    <option value="SOLICITANTE">SOLICITANTE (Pedidos de su área)</option>
                    <option value="SECRETARIO">SECRETARIO / ENCARGADO (Todos los folios)</option>
                    <option value="ADMIN">ADMIN (Coordinador General - Todo)</option>
                    <option value="VISITANTE">VISITANTE (Sin área - Solo consulta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rama Operativa / Equipo *
                  </label>
                  {role === 'VISITANTE' ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900 font-semibold">
                      Sin área asignada (Solo acceso público)
                    </div>
                  ) : role === 'ADMIN' || role === 'SECRETARIO' ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-[11px] text-emerald-950 font-semibold">
                      Oficina Central (Todas las Áreas)
                    </div>
                  ) : (
                    <select
                      value={assignedArea}
                      onChange={(e) => setAssignedArea(e.target.value as OperativeArea)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0D472C]"
                    >
                      {OPERATIVE_AREAS.map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cargo / Función Específica
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ej: Referente de Torneos y Acción Social"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 03757-15421001"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-5 py-2 text-xs font-bold text-[#F9F6EC] hover:bg-[#165B3A] shadow transition cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingUserId ? 'Guardar Cambios' : 'Dar de Alta Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Users Table */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Usuario (Login)</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Área Asignada</th>
                  <th className="p-3">Cargo / Contacto</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isHeadAdmin = u.username === '49993070';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          {isHeadAdmin && <span title="Coordinador General">👑</span>}
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[#0D472C] font-bold">
                        {u.username}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            u.role === 'ADMIN'
                              ? 'bg-emerald-900 text-amber-200'
                              : u.role === 'CARGADOR_DATOS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.role === 'SOLICITANTE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-gray-700 font-medium">
                        {u.assignedArea || 'General'}
                      </td>
                      <td className="p-3 text-[11px] text-gray-500">
                        <div>{u.position}</div>
                        {u.telefono && <div className="font-mono text-[10px] text-gray-400">{u.telefono}</div>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(u)}
                            title="Editar usuario"
                            className="p-1.5 text-gray-600 hover:text-[#0D472C] hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {!isHeadAdmin && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Dar de baja usuario"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
