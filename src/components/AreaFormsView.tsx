import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Trophy, 
  Sparkles,
  Phone,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AreaInscriptionForm, InscriptionSubmission, UserProfile, OperativeArea } from '../types';
import { OPERATIVE_AREAS } from '../data/mockData';
import { StorageService } from '../services/storageService';

interface AreaFormsViewProps {
  currentUser: UserProfile;
}

export const AreaFormsView: React.FC<AreaFormsViewProps> = ({
  currentUser,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const canViewSubmissions = currentUser.role === 'ADMIN' || currentUser.role === 'CARGADOR_DATOS';

  const [forms, setForms] = useState<AreaInscriptionForm[]>(() => StorageService.getInscriptionForms());
  const [submissions, setSubmissions] = useState<InscriptionSubmission[]>(() => StorageService.getInscriptionSubmissions());

  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] = useState<string | null>(null);

  // Form states for Admin creating a new Inscription form
  const [formArea, setFormArea] = useState<OperativeArea>('DEPORTES Y ACCIÓN SOCIAL');
  const [formTitulo, setFormTitulo] = useState('Ficha de inscripción por equipo');
  const [formDeporte, setFormDeporte] = useState('Fútbol 7');
  const [formEvento, setFormEvento] = useState('');
  const [formFecha, setFormFecha] = useState('');
  const [formLugar, setFormLugar] = useState('Polideportivo Puerto Esperanza');
  const [formMonto, setFormMonto] = useState<number>(0);
  const [formDescripcion, setFormDescripcion] = useState('');

  // Form states for Registering a Team / Participant
  const [registeringFormId, setRegisteringFormId] = useState<string | null>(null);
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [categoriaDivision, setCategoriaDivision] = useState('Libre');
  const [delegadoNombre, setDelegadoNombre] = useState('');
  const [delegadoDni, setDelegadoDni] = useState('');
  const [delegadoTelefono, setDelegadoTelefono] = useState('');
  const [numParticipantes, setNumParticipantes] = useState(10);
  const [estadoPago, setEstadoPago] = useState<InscriptionSubmission['estadoPago']>('Abonado');
  const [notasInscripcion, setNotasInscripcion] = useState('');

  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Handle Admin creating Inscription Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('error', 'Solo el Coordinador General puede crear convocatorias y fichas de inscripción.');
      return;
    }
    if (!formTitulo.trim() || !formEvento.trim() || !formFecha.trim()) {
      showNotification('error', 'Título, nombre del evento y fecha son campos obligatorios.');
      return;
    }

    const newForm: AreaInscriptionForm = {
      id: 'form-' + Date.now(),
      areaOperativa: formArea,
      titulo: formTitulo.trim(),
      deporteOActividad: formDeporte.trim(),
      nombreEvento: formEvento.trim(),
      fechaEvento: formFecha,
      lugarEvento: formLugar.trim(),
      montoInscripcion: Number(formMonto) || 0,
      descripcion: formDescripcion.trim() || 'Convocatoria oficial del Centro de Medios y Archivos.',
      habilitada: true,
      creadaPor: currentUser.name,
      creadaEn: new Date().toISOString().split('T')[0],
    };

    const updated = StorageService.saveInscriptionForm(newForm, currentUser);
    setForms(updated);
    setIsCreatingForm(false);
    setFormEvento('');
    setFormFecha('');
    setFormDescripcion('');
    showNotification('success', `Ficha de inscripción creada y habilitada para ${formArea}.`);
  };

  const handleToggleForm = (id: string) => {
    if (!isAdmin) return;
    const updated = StorageService.toggleInscriptionForm(id, currentUser);
    setForms(updated);
    showNotification('success', 'Estado de la convocatoria modificado.');
  };

  const handleDeleteForm = (id: string) => {
    if (!isAdmin) return;
    const updated = StorageService.deleteInscriptionForm(id, currentUser);
    setForms(updated);
    showNotification('success', 'Convocatoria eliminada.');
  };

  // Handle Registering a Team
  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringFormId) return;

    const parentForm = forms.find((f) => f.id === registeringFormId);
    if (!parentForm) return;

    if (!nombreEquipo.trim() || !delegadoNombre.trim()) {
      showNotification('error', 'Nombre del equipo y del encargado son requeridos.');
      return;
    }

    const newSub: InscriptionSubmission = {
      id: 'sub-' + Date.now(),
      formId: registeringFormId,
      nombreEquipo: nombreEquipo.trim(),
      areaOperativa: parentForm.areaOperativa,
      categoriaODivision: categoriaDivision.trim() || 'General',
      nombreDelegadoOEncargado: delegadoNombre.trim(),
      dniDelegado: delegadoDni.trim(),
      telefonoDelegado: delegadoTelefono.trim(),
      numeroParticipantes: Number(numParticipantes) || 1,
      montoAbonado: estadoPago === 'Abonado' ? parentForm.montoInscripcion : 0,
      estadoPago,
      fechaInscripcion: new Date().toISOString().split('T')[0],
      notas: notasInscripcion.trim(),
    };

    const updated = StorageService.saveInscriptionSubmission(newSub, currentUser);
    setSubmissions(updated);
    setRegisteringFormId(null);
    setNombreEquipo('');
    setDelegadoNombre('');
    setDelegadoDni('');
    setDelegadoTelefono('');
    setNotasInscripcion('');
    showNotification('success', `Equipo "${newSub.nombreEquipo}" inscripto con éxito.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#0369A1] text-white p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-amber-400 text-gray-950 px-2.5 py-0.5 rounded uppercase">
                Convocatorias & Encuestas por Área
              </span>
              <span className="text-xs text-sky-100">Puerto Esperanza</span>
              <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded border border-white/20">
                {forms.filter((f) => f.habilitada).length} habilitadas
              </span>
            </div>

            <h1 className="font-archival text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Fichas de Inscripción y Torneos
            </h1>
            <p className="text-xs text-sky-50 max-w-xl mt-1.5 leading-relaxed">
              Inscripción de equipos para torneos de fútbol, hockey formativo, shows de talentos culturales y jornadas de sanidad. El Coordinador General crea, habilita y administra los cupos y aranceles.
            </p>
          </div>

          {isAdmin && !isCreatingForm && (
            <button
              onClick={() => setIsCreatingForm(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-950 px-5 py-3 text-xs font-bold shadow-md transition cursor-pointer self-start md:self-auto active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Nueva Ficha / Torneo</span>
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

      {/* FORM: CREATE INSCRIPTION FORM (ADMIN ONLY) */}
      {isCreatingForm && isAdmin && (
        <div className="rounded-3xl border-2 border-[#0369A1] bg-[#FFFDF8] p-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-archival text-base font-bold text-[#0369A1] flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <span>Configurar y Lanzar Nueva Convocatoria de Inscripción</span>
            </h3>
            <button onClick={() => setIsCreatingForm(false)} className="text-xs text-gray-500 hover:text-black underline cursor-pointer">
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Área Operativa Destinada *</label>
                <select
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#0369A1]"
                >
                  {OPERATIVE_AREAS.map((a) => (
                    <option key={a.key} value={a.key}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Título de la Ficha * (Ej: Ficha de inscripción por equipo)
                </label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ej: Ficha de inscripción por equipo - Torneo de Fútbol 7"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#0369A1]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Deporte o Actividad Específica *
                </label>
                <input
                  type="text"
                  value={formDeporte}
                  onChange={(e) => setFormDeporte(e.target.value)}
                  placeholder="Ej: Fútbol 7 / Hockey / Show de Talentos"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre del Evento *</label>
                <input
                  type="text"
                  value={formEvento}
                  onChange={(e) => setFormEvento(e.target.value)}
                  placeholder="Ej: Torneo Primavera 2024"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Fecha del Evento *</label>
                <input
                  type="date"
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Lugar del Evento *</label>
                <input
                  type="text"
                  value={formLugar}
                  onChange={(e) => setFormLugar(e.target.value)}
                  placeholder="Ej: Polideportivo Puerto Esperanza"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Monto de Inscripción ($) (Poner 0 si es gratuito)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={formMonto}
                  onChange={(e) => setFormMonto(Number(e.target.value))}
                  placeholder="0"
                  className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-[#0369A1]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Descripción / Requisitos</label>
                <input
                  type="text"
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Reglas, número de integrantes, seguro o requisitos..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCreatingForm(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#0369A1] hover:bg-[#0284c7] text-white font-bold shadow cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Habilitar y Lanzar Convocatoria</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: REGISTER TEAM / PARTICIPANT IN A FORM */}
      {registeringFormId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFDF8] border-2 border-[#0369A1] shadow-2xl p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase bg-sky-100 text-[#0369A1] px-2 py-0.5 rounded">
                  Ficha Oficial de Inscripción
                </span>
                <h3 className="font-archival text-base font-bold text-gray-900 mt-1">
                  Registrar Equipo o Participante
                </h3>
              </div>
              <button
                onClick={() => setRegisteringFormId(null)}
                className="text-gray-400 hover:text-black font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmission} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Nombre del Equipo o Participante *
                </label>
                <input
                  type="text"
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  placeholder="Ej: Los Halcones / Solista Folclore"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoría / División</label>
                  <input
                    type="text"
                    value={categoriaDivision}
                    onChange={(e) => setCategoriaDivision(e.target.value)}
                    placeholder="Ej: Juvenil / Infantil / Libre"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">N° de Integrantes</label>
                  <input
                    type="number"
                    min={1}
                    value={numParticipantes}
                    onChange={(e) => setNumParticipantes(Number(e.target.value))}
                    className="font-mono w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nombre del Delegado / Tutor *</label>
                  <input
                    type="text"
                    value={delegadoNombre}
                    onChange={(e) => setDelegadoNombre(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    value={delegadoTelefono}
                    onChange={(e) => setDelegadoTelefono(e.target.value)}
                    placeholder="03757-15..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Estado del Pago de Inscripción</label>
                <select
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 font-bold"
                >
                  <option value="Abonado">Abonado (Comprobante al día)</option>
                  <option value="Pendiente">Pendiente de Pago</option>
                  <option value="Exento">Exento (Beca Comunitaria)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notas / Color de Camiseta</label>
                <input
                  type="text"
                  value={notasInscripcion}
                  onChange={(e) => setNotasInscripcion(e.target.value)}
                  placeholder="Detalles sobre el equipo o participación..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setRegisteringFormId(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#0369A1] hover:bg-[#0284c7] text-white font-bold shadow cursor-pointer"
                >
                  Confirmar Inscripción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIST OF FORMS */}
      <div className="space-y-4">
        {forms.map((form) => {
          const formSubs = submissions.filter((s) => s.formId === form.id);
          const isExpanded = selectedFormForSubmissions === form.id;

          return (
            <div
              key={form.id}
              className={`rounded-3xl border-2 bg-white p-5 sm:p-6 shadow-xs transition ${
                form.habilitada ? 'border-sky-300' : 'border-gray-200 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-[#E8F3ED] text-[#0D472C] px-2.5 py-0.5 rounded border border-[#0D472C]/20">
                    {form.areaOperativa}
                  </span>

                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {form.deporteOActividad}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    form.habilitada ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {form.habilitada ? '✓ Habilitada' : 'Pausada'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleToggleForm(form.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                          form.habilitada ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {form.habilitada ? 'Deshabilitar' : 'Habilitar'}
                      </button>

                      <button
                        onClick={() => handleDeleteForm(form.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition cursor-pointer"
                        title="Eliminar convocatoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Form Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-archival text-base sm:text-lg font-black text-gray-900">
                    {form.titulo}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1">
                    <span className="font-bold text-[#0D472C]">Evento: {form.nombreEvento}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {form.fechaEvento}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {form.lugarEvento}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{form.descripcion}</p>
                </div>

                {/* Registration button & Fee badge */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Arancel Inscripción</span>
                    <span className="font-mono font-black text-base text-[#0D472C]">
                      {form.montoInscripcion > 0 ? `$${form.montoInscripcion.toLocaleString('es-AR')}` : 'GRATUITO'}
                    </span>
                  </div>

                  {form.habilitada && (
                    <button
                      onClick={() => setRegisteringFormId(form.id)}
                      className="px-4 py-2 rounded-xl bg-[#0369A1] hover:bg-[#0284c7] text-white text-xs font-bold shadow transition cursor-pointer"
                    >
                      + Inscribir Equipo
                    </button>
                  )}
                </div>
              </div>

              {/* Inscriptions Accordion */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-700">
                  Equipos / Participantes Inscriptos: <strong>{formSubs.length}</strong>
                </span>

                {canViewSubmissions ? (
                  <button
                    onClick={() => setSelectedFormForSubmissions(isExpanded ? null : form.id)}
                    className="flex items-center gap-1 text-xs text-[#0369A1] font-bold hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Ocultar Planilla' : 'Ver Planilla de Inscriptos'}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                    🔒 Planilla de inscriptos exclusiva para Coordinación y Cargador de Datos
                  </span>
                )}
              </div>

              {/* Submissions Table when expanded (only for authorized users) */}
              {isExpanded && canViewSubmissions && (
                <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200">
                  {formSubs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Aún no hay equipos registrados en esta ficha.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b text-[10px] text-gray-600 uppercase font-bold">
                          <th className="p-2.5">Equipo / Participante</th>
                          <th className="p-2.5">División</th>
                          <th className="p-2.5">Delegado</th>
                          <th className="p-2.5">Contacto WhatsApp</th>
                          <th className="p-2.5">Integrantes</th>
                          <th className="p-2.5">Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {formSubs.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="p-2.5 font-bold text-gray-900">{sub.nombreEquipo}</td>
                            <td className="p-2.5 text-gray-600">{sub.categoriaODivision}</td>
                            <td className="p-2.5 text-gray-800">{sub.nombreDelegadoOEncargado}</td>
                            <td className="p-2.5 font-mono text-gray-600">{sub.telefonoDelegado}</td>
                            <td className="p-2.5 font-mono font-bold text-gray-900">{sub.numeroParticipantes}</td>
                            <td className="p-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                sub.estadoPago === 'Abonado' ? 'bg-emerald-100 text-emerald-800' :
                                sub.estadoPago === 'Exento' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {sub.estadoPago}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
