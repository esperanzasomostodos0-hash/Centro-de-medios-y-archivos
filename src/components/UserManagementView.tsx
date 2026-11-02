import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Key, 
  Phone, 
  Lock, 
  History,
  Sparkles,
  Search
} from 'lucide-react';
import { UserProfile, UserRole, OperativeArea } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { StorageService, AuditLogEntry } from '../services/storageService';

interface UserManagementViewProps {
  currentUser: UserProfile;
  onUsersUpdated: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => StorageService.getAuditLogs());
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [passwordPin, setPasswordPin] = useState('');
  const [role, setRole] = useState<UserRole>('CARGADOR_DATOS');
  const [assignedArea, setAssignedArea] = useState<OperativeArea>('DEPORTES Y ACCIÓN SOCIAL');
  const [position, setPosition] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="rounded-2xl border-2 border-[#0D472C]/30 bg-white p-12 text-center my-6">
        <Lock className="mx-auto h-12 w-12 text-amber-700" />
        <h3 className="font-archival mt-3 text-lg font-bold text-[#0D472C]">
          Acceso Restringido a Coordinación General
        </h3>
        <p className="mt-2 text-xs text-gray-600 max-w-md mx-auto">
          La gestión de personal y credenciales de acceso solo puede ser operada por el Coordinador General (Almada Eduardo Thomas).
        </p>
      </div>
    );
  }

  const resetForm = () => {
    setName('');
    setUsername('');
    setPasswordPin('');
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
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !username.trim()) {
      setErrorMsg('Nombre y usuario son obligatorios.');
      return;
    }
    if (!editingUserId && !passwordPin.trim()) {
      setErrorMsg('Debe definir una contraseña o PIN inicial para el usuario.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check duplicate username if new
    if (!editingUserId) {
      const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
      if (exists) {
        setErrorMsg(`El usuario "${cleanUsername}" ya existe en el sistema. Elija otro nombre de usuario.`);
        return;
      }
    }

    const targetUser: UserProfile = {
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

    const updated = StorageService.saveUser(targetUser, currentUser);
    setUsers(updated);
    setAuditLogs(StorageService.getAuditLogs());
    onUsersUpdated();
    setSuccessMsg(editingUserId ? `Usuario "${targetUser.name}" actualizado con éxito.` : `Usuario "${targetUser.name}" creado con éxito. Ya puede iniciar sesión.`);
    resetForm();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDelete = (user: UserProfile) => {
    if (user.username === '49993070') {
      setErrorMsg('La cuenta de Coordinación General Almada Eduardo Thomas está protegida y no puede eliminarse.');
      return;
    }

    const updated = StorageService.deleteUser(user.id, currentUser);
    setUsers(updated);
    setAuditLogs(StorageService.getAuditLogs());
    onUsersUpdated();
    setSuccessMsg(`Usuario ${user.name} dado de baja.`);
    setDeleteConfirmId(null);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.assignedArea && u.assignedArea.toLowerCase().includes(q)) ||
      u.position.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D472C]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-archival text-xl font-bold text-[#0D472C]">
              Gestión de Personal y Cuentas de Acceso
            </h2>
            <span className="text-[10px] font-bold bg-[#E8F3ED] text-[#0D472C] px-2.5 py-0.5 rounded border border-[#0D472C]/20">
              Coordinador: Almada Eduardo Thomas
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Administración oficial de credenciales, roles y asignación de equipos de trabajo
          </p>
        </div>

        {!isAddingUser && (
          <button
            onClick={() => {
              resetForm();
              setIsAddingUser(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#165B3A] transition cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs text-emerald-900 font-bold shadow-xs">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form: Add or Edit User */}
      {isAddingUser && (
        <div className="rounded-2xl border-2 border-[#0D472C]/30 bg-[#FFFDF8] p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
            <h3 className="font-archival text-base font-bold text-[#0D472C] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span>{editingUserId ? 'Modificar Datos de Usuario' : 'Alta de Nuevo Personal en la Oficina'}</span>
            </h3>
            <button
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Ezequiel Villalba / Cami Rodríguez"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Usuario o DNI de Acceso *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: ezequiel.v o 42109844"
                  className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Contraseña de Acceso *
                </label>
                <input
                  type="text"
                  value={passwordPin}
                  onChange={(e) => setPasswordPin(e.target.value)}
                  placeholder={editingUserId ? 'Dejar vacía para no cambiar' : 'Ej: clave2024'}
                  className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#0D472C]"
                  required={!editingUserId}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Rol Reglamentario *
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
                  <option value="CARGADOR_DATOS">CARGADOR DE DATOS (Solo su área operativa asignada)</option>
                  <option value="SOLICITANTE">SOLICITANTE (Pedidos de su área operativa)</option>
                  <option value="SECRETARIO">SECRETARIO / ENCARGADO (Acceso a todos los folios y archivos)</option>
                  <option value="ADMIN">ADMINISTRADOR GENERAL (Acceso y control total - Almada E. Thomas)</option>
                  <option value="VISITANTE">VISITANTE (Sin área - Solo consulta pública)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Área Operativa Asignada *
                </label>
                {role === 'VISITANTE' ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 font-medium">
                    <span className="font-bold block">Sin área asignada</span>
                    <span className="text-[11px] text-amber-800">El rol visitante no pertenece a ningún área operativa y solo accede a documentos públicos y cartelera comunitaria.</span>
                  </div>
                ) : role === 'ADMIN' || role === 'SECRETARIO' ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-950 font-medium">
                    <span className="font-bold block">Oficina Central (Todas las Áreas)</span>
                    <span className="text-[11px] text-emerald-800">Acceso institucional a los 15 folios, actas y correspondencia general.</span>
                  </div>
                ) : (
                  <div>
                    <select
                      value={assignedArea}
                      onChange={(e) => setAssignedArea(e.target.value as OperativeArea)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-[#0D472C] focus:ring-2 focus:ring-[#0D472C]"
                    >
                      {OPERATIVE_AREAS.map((a) => (
                        <option key={a.key} value={a.key}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                      El usuario solo podrá ver y gestionar información perteneciente a esta área.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Función / Cargo Específico
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ej: Referente de Deportes Barriales y Asistencias"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-[#0D472C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Teléfono o WhatsApp de Contacto
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#0D472C] px-5 py-2 text-xs font-bold text-white hover:bg-[#165B3A] shadow transition cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{editingUserId ? 'Guardar Cambios' : 'Confirmar Alta de Usuario'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Directory Table */}
      <div className="rounded-2xl border border-[#0D472C]/20 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-200 bg-[#FAF7F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#0D472C]" />
            <span className="text-xs font-bold text-[#0D472C] uppercase tracking-wider">
              Padrón de Personal Registrado ({users.length})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nombre o área..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0D472C]"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                <th className="p-3">Nombre</th>
                <th className="p-3">Usuario (Login)</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Rama Operativa</th>
                <th className="p-3">Cargo y Contacto</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => {
                const isHeadAdmin = u.username === '49993070';

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        {isHeadAdmin && <span title="Coordinador General">👑</span>}
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#0D472C]">
                      {u.username}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-emerald-950 text-amber-300 border border-amber-400/40'
                            : u.role === 'SECRETARIO'
                            ? 'bg-emerald-900 text-emerald-100'
                            : u.role === 'CARGADOR_DATOS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'SOLICITANTE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {u.role === 'ADMIN' ? '👑 ADMIN GENERAL' :
                         u.role === 'SECRETARIO' ? 'SECRETARIO OFICINA' :
                         u.role === 'CARGADOR_DATOS' ? 'CARGADOR DE ÁREA' :
                         u.role === 'SOLICITANTE' ? 'SOLICITANTE' :
                         'VISITANTE PÚBLICO'}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      {u.role === 'VISITANTE' ? (
                        <span className="text-gray-400 italic text-[11px]">— Sin Área (Público) —</span>
                      ) : u.role === 'ADMIN' || u.role === 'SECRETARIO' ? (
                        <span className="font-bold text-[#0D472C] text-[11px]">Oficina Central (Todas)</span>
                      ) : (
                        <span className="font-semibold text-gray-800 text-[11px]">{u.assignedArea}</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-gray-500">
                      <div>{u.position}</div>
                      {u.telefono && <div className="font-mono text-gray-400">{u.telefono}</div>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(u)}
                          title="Editar datos o cambiar clave"
                          className="p-1.5 text-gray-600 hover:text-[#0D472C] hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {!isHeadAdmin && (
                          <button
                            onClick={() => handleDelete(u)}
                            title="Dar de baja usuario"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Audit Log Section for Admin */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="font-archival text-sm font-bold text-[#0D472C] mb-2 flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>Registro de Auditoría de Movimientos y Accesos</span>
        </h3>
        <p className="text-[11px] text-gray-500 mb-3">
          Historial inmutable de aperturas de turno, altas de folios y cambios de estado en la oficina
        </p>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {auditLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-lg bg-[#FAF7F0] border border-gray-200 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-gray-900">{log.action}: </span>
                <span className="text-gray-700">{log.details}</span>
              </div>
              <div className="text-right text-[10px] text-gray-400 shrink-0 ml-3">
                <span>{log.userName} ({log.userRole})</span>
                <span className="block">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
