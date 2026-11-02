import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  Key, 
  Camera, 
  FolderArchive, 
  Printer, 
  Download, 
  X,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  BookOpen,
  Lock,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  AlertCircle,
  Edit2,
  Save,
  FileCheck,
  Clock,
  Briefcase,
  ChevronRight,
  Coins
} from 'lucide-react';
import { 
  UserProfile, 
  SafeBoxRecord, 
  ImplementationStage, 
  InstitutionalEvaluationConstancia 
} from '../types';
import { StorageService } from '../services/storageService';

interface InstitutionalProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
}

export const InstitutionalProjectModal: React.FC<InstitutionalProjectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'DOCUMENTO' | 'CAJA_VALORES' | 'ETAPAS' | 'EVALUACION'>('DOCUMENTO');
  const [selectedSection, setSelectedSection] = useState<number>(1);

  // Safe box state
  const [safeBoxRecords, setSafeBoxRecords] = useState<SafeBoxRecord[]>([]);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [newTipo, setNewTipo] = useState<SafeBoxRecord['tipoMovimiento']>('Ingreso de Efectivo');
  const [newConcepto, setNewConcepto] = useState('');
  const [newMonto, setNewMonto] = useState<number | ''>('');
  const [newElemento, setNewElemento] = useState('');
  const [newPersonaEntrega, setNewPersonaEntrega] = useState('');
  const [newPersonaRecepcion, setNewPersonaRecepcion] = useState('Almada Eduardo Thomas (Admin)');
  const [newAutorizadoPor, setNewAutorizadoPor] = useState('Almada Eduardo Thomas');
  const [newComprobanteRef, setNewComprobanteRef] = useState('');
  const [newObservaciones, setNewObservaciones] = useState('');

  // Implementation stages state
  const [stages, setStages] = useState<ImplementationStage[]>([]);

  // Section 25 Evaluation state
  const [evaluation, setEvaluation] = useState<InstitutionalEvaluationConstancia>({
    fechaRecepcion: '2026-10-19',
    autoridadReceptora: 'Autoridades y Responsables de la Sede',
    decision: 'Aprobada',
    condicionesAcordadas: 'Uso de la habitación para Centro de Medios y Archivos con custodia exclusiva de llaves por el equipo de cuatro integrantes, supervisión periódica e informes de gestión.',
    observaciones: 'El proyecto responde a una necesidad concreta de organización administrativa, resguardo patrimonial y soporte técnico a todas las áreas de la sede.',
  });
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSafeBoxRecords(StorageService.getSafeBoxRecords());
      setStages(StorageService.getImplementationStages());
      setEvaluation(StorageService.getInstitutionalEvaluation());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const pdfUrl = '/assets/aistudio/Proyecto_Centro_de_Medios_y_Archivos_dc75236f.pdf';

  // Safe Box Balances
  const totalEfectivoIngresos = safeBoxRecords
    .filter(r => r.tipoMovimiento === 'Ingreso de Efectivo')
    .reduce((acc, curr) => acc + (curr.montoEfectivo || 0), 0);

  const totalEfectivoEgresos = safeBoxRecords
    .filter(r => r.tipoMovimiento === 'Egreso de Efectivo')
    .reduce((acc, curr) => acc + (curr.montoEfectivo || 0), 0);

  const saldoEfectivoEnCaja = Math.max(0, totalEfectivoIngresos - totalEfectivoEgresos);

  const objetosEnCustodiaActiva = safeBoxRecords.filter(
    r => r.tipoMovimiento === 'Guarda de Elemento de Valor' && r.estado === 'En Custodia'
  ).length;

  const getActorUser = (): UserProfile => {
    if (currentUser) return currentUser;
    return {
      id: 'almada',
      username: '49993070',
      passwordPin: '4999',
      name: 'Almada Eduardo Thomas',
      role: 'ADMIN',
      position: 'Coordinador General & Desarrollador Web',
      assignedArea: 'TECNOLOGÍA Y MEDIOS',
      activo: true,
      creadoEn: new Date().toISOString(),
    };
  };

  const handleSaveSafeBoxRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcepto.trim()) return;

    const record: SafeBoxRecord = {
      id: 'sb-' + Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      tipoMovimiento: newTipo,
      concepto: newConcepto.trim(),
      montoEfectivo: newMonto ? Number(newMonto) : undefined,
      elementoValorDetalle: newElemento.trim() || undefined,
      responsableEntrega: newPersonaEntrega.trim() || (currentUser?.name || 'Solicitante Autorizado'),
      responsableRecepcion: newPersonaRecepcion.trim(),
      autorizadoPor: newAutorizadoPor.trim(),
      comprobanteRef: newComprobanteRef.trim() || undefined,
      estado: newTipo === 'Retiro de Elemento de Valor' ? 'Entregado / Rendido' : 'En Custodia',
      observaciones: newObservaciones.trim() || 'Movimiento asentado en el Centro de Medios y Archivos',
    };

    const userForAudit = getActorUser();
    const updated = StorageService.saveSafeBoxRecord(record, userForAudit);
    setSafeBoxRecords(updated);
    setIsNewRecordModalOpen(false);

    // Reset form
    setNewConcepto('');
    setNewMonto('');
    setNewElemento('');
    setNewPersonaEntrega('');
    setNewComprobanteRef('');
    setNewObservaciones('');
    setSaveSuccessMsg('Movimiento de caja fuerte asentado en el libro oficial');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleToggleStageStatus = (stageId: number) => {
    const updated = stages.map(s => {
      if (s.id === stageId) {
        const nextStatus: ImplementationStage['estado'] = 
          s.estado === 'Pendiente' ? 'En Progreso' : s.estado === 'En Progreso' ? 'Completada' : 'Pendiente';
        const nextProg = nextStatus === 'Completada' ? 100 : nextStatus === 'En Progreso' ? 50 : 0;
        return { ...s, estado: nextStatus, progresoPorcentaje: nextProg };
      }
      return s;
    });

    const userForAudit = getActorUser();
    const saved = StorageService.updateImplementationStages(updated, userForAudit);
    setStages(saved);
  };

  const handleSaveEvaluation = () => {
    const userForAudit = getActorUser();
    StorageService.saveInstitutionalEvaluation(evaluation, userForAudit);
    setIsEditingEvaluation(false);
    setSaveSuccessMsg('Constancia y dictamen de autoridades actualizado');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-[#FFFDF8] border-2 border-[#0D472C] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 print:border-none print:shadow-none print:max-h-full print:rounded-none">
        
        {/* Top Header with Seal and Direct Actions */}
        <div className="bg-[#0D472C] text-white p-4 sm:p-5 flex items-start justify-between gap-3 border-b-2 border-emerald-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-400 text-gray-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Building2 className="h-6 w-6 text-[#0D472C]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-mono font-bold bg-amber-400 text-gray-950 px-2 py-0.5 rounded uppercase">
                  Proyecto Institucional Completo (19 Páginas)
                </span>
                <span className="text-xs text-emerald-200">Puerto Esperanza • Octubre de 2026</span>
              </div>
              <h2 className="font-archival text-base sm:text-xl font-black text-[#F9F6EC] leading-tight">
                CENTRO DE MEDIOS Y ARCHIVOS
              </h2>
              <p className="text-[11px] text-emerald-100">
                Presentado por Almada Eduardo Thomas, Pablo González, Renzo Vázquez y Demian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* Direct PDF Download Button */}
            <a
              href={pdfUrl}
              download="Proyecto_Centro_de_Medios_y_Archivos.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-gray-950 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-sm border border-amber-500"
              title="Descargar documento PDF oficial original de 19 páginas"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Descargar PDF Original</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border border-emerald-700"
              title="Imprimir documento del proyecto"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-900 transition cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Success toast if triggered */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-gray-200 bg-[#FAF7F0] text-xs font-bold overflow-x-auto print:hidden shrink-0">
          <button
            onClick={() => setActiveTab('DOCUMENTO')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DOCUMENTO'
                ? 'border-[#0D472C] text-[#0D472C]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Documento Completo (25 Secciones)</span>
          </button>

          <button
            onClick={() => setActiveTab('CAJA_VALORES')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CAJA_VALORES'
                ? 'border-[#0D472C] text-[#0D472C]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Lock className="h-4 w-4 text-amber-600" />
            <span>Caja Fuerte y Custodia de Valores (Sec. 11)</span>
            {saldoEfectivoEnCaja > 0 && (
              <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-mono">
                ${saldoEfectivoEnCaja.toLocaleString()}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ETAPAS')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ETAPAS'
                ? 'border-[#0D472C] text-[#0D472C]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="h-4 w-4 text-blue-600" />
            <span>6 Etapas de Implementación (Sec. 19)</span>
          </button>

          <button
            onClick={() => setActiveTab('EVALUACION')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'EVALUACION'
                ? 'border-[#0D472C] text-[#0D472C]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileCheck className="h-4 w-4 text-purple-600" />
            <span>Constancia y Resolución (Sec. 25)</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
              {evaluation.decision}
            </span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-gray-800 leading-relaxed grow">
          
          {/* TAB 1: DOCUMENTO COMPLETO (25 SECCIONES) */}
          {activeTab === 'DOCUMENTO' && (
            <div className="space-y-6">
              
              {/* Callout to download PDF or view summary */}
              <div className="bg-gradient-to-r from-emerald-900 to-[#0D472C] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-bold uppercase bg-amber-400 text-gray-950 px-2 py-0.5 rounded">
                    Archivo Original Adjunto
                  </span>
                  <h4 className="font-archival text-sm sm:text-base font-bold text-amber-100">
                    Proyecto Institucional - Documento Oficial de 19 Páginas
                  </h4>
                  <p className="text-[11px] text-emerald-100 max-w-xl">
                    Contiene las 25 secciones detalladas, antecedentes del 19 de octubre de 2026, diseño de la oficina, reglamento de acceso restringido, caja fuerte, titularidad de bienes y constancia final para las autoridades.
                  </p>
                </div>
                <a
                  href={pdfUrl}
                  download="Proyecto_Centro_de_Medios_y_Archivos.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-400 hover:bg-amber-300 text-gray-950 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shrink-0 transition shadow cursor-pointer border border-amber-500"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar Archivo PDF</span>
                </a>
              </div>

              {/* Quick Jump Selector for 25 Sections */}
              <div className="bg-[#FAF7F0] p-3 rounded-2xl border border-amber-200/80 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="font-bold text-gray-700 whitespace-nowrap">Ir a Sección:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { num: 1, title: '1. Presentación' },
                    { num: 2, title: '2. Antecedentes' },
                    { num: 4, title: '4. Objetivo General' },
                    { num: 5, title: '5. Objetivos (15)' },
                    { num: 6, title: '6. Equipo (4)' },
                    { num: 7, title: '7. Sectores (5)' },
                    { num: 9, title: '9. Titularidad Bienes' },
                    { num: 10, title: '10. Llaves' },
                    { num: 11, title: '11. Caja Fuerte' },
                    { num: 12, title: '12. Acondicionamiento' },
                    { num: 13, title: '13. Muebles Madera' },
                    { num: 15, title: '15. Acceso Restringido' },
                    { num: 17, title: '17. Sitio Web' },
                    { num: 19, title: '19. 6 Etapas' },
                    { num: 21, title: '21. Informes y Supervisión' },
                    { num: 24, title: '24. Solicitud' },
                    { num: 25, title: '25. Constancia' },
                  ].map((s) => (
                    <button
                      key={s.num}
                      onClick={() => {
                        setSelectedSection(s.num);
                        const el = document.getElementById(`sec-${s.num}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                        selectedSection === s.num
                          ? 'bg-[#0D472C] text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Presentación del Proyecto */}
              <section id="sec-1" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    1. Presentación del Proyecto
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 1-2</span>
                </div>
                <p>
                  Por medio del presente documento, nos dirigimos respetuosamente a las autoridades y responsables de la sede con el propósito de solicitar la autorización para la utilización, acondicionamiento y puesta en funcionamiento de una habitación actualmente destinada al almacenamiento de distintos elementos, con el objetivo de transformarla en una oficina institucional denominada <strong>CENTRO DE MEDIOS Y ARCHIVOS</strong>.
                </p>
                <p>
                  La iniciativa surge de la necesidad de mejorar la organización interna, fortalecer la administración de la información, preservar la documentación producida por las distintas áreas y disponer de un espacio físico seguro en el que puedan resguardarse los equipos, materiales y elementos de uso habitual.
                </p>
                <p>
                  La propuesta combina la <strong>conservación física de documentos y elementos</strong> mediante un sistema de archivo e inventario ordenado en estanterías rotuladas, y la <strong>digitalización de la información</strong> a través de este sistema web desarrollado por Almada Eduardo Thomas.
                </p>
              </section>

              {/* 2. Antecedentes y Estado Inicial */}
              <section id="sec-2" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    2. Antecedentes y Estado Inicial de la Habitación (19 de Octubre de 2026)
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 2-3</span>
                </div>
                <p>
                  El día <strong>19 de octubre de 2026</strong>, a partir de una observación de la sede desde una perspectiva organizativa y administrativa, comenzamos a identificar distintas posibilidades para mejorar el aprovechamiento de los espacios disponibles.
                </p>
                <p>
                  Durante esa observación se constató la existencia de una habitación que actualmente contiene diversos objetos que requieren clasificación: carteles, banderas, mesas, cajas con materiales impresos y elementos de trabajo.
                </p>
                <p className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950 font-medium">
                  <strong>Regla de respeto previo:</strong> Antes de retirar, reubicar o descartar cualquier objeto de la habitación, se consultará previamente a las autoridades de la sede y a las personas que habitualmente utilizan o tienen asignados dichos elementos, garantizando que nada sea trasladado sin conocimiento y conformidad.
                </p>
              </section>

              {/* 3 & 4. Denominación y Objetivo General */}
              <section id="sec-4" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    3. Denominación del Espacio & 4. Objetivo General
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 3-4</span>
                </div>
                <p>
                  El espacio se denominará formalmente: <strong>CENTRO DE MEDIOS Y ARCHIVOS</strong>.
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-semibold">
                  Objetivo General: Crear, acondicionar y poner en funcionamiento una oficina institucional denominada Centro de Medios y Archivos, destinada a centralizar la documentación, registrar las actividades, organizar los archivos físicos y digitales, administrar los recursos de uso común y garantizar condiciones adecuadas de conservación, seguridad y control para todas las áreas que funcionan en la sede.
                </div>
              </section>

              {/* 5. 15 Objetivos Específicos */}
              <section id="sec-5" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    5. Objetivos Específicos (15 Objetivos Detallados)
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 4-5</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "1. Organizar y clasificar la documentación producida por las distintas áreas.",
                    "2. Crear un archivo físico que conserve originales, copias e informes de manera ordenada.",
                    "3. Desarrollar un sistema digital de registro, consulta y respaldo mediante un sitio web institucional.",
                    "4. Mantener un inventario actualizado de equipos técnicos: cámaras, micrófonos, cables, memorias.",
                    "5. Registrar ingresos, egresos, préstamos y devoluciones de materiales con firmas responsables.",
                    "6. Establecer un lugar seguro con cerradura para conservar equipos de valor y fondos de eventos.",
                    "7. Crear un sistema de identificación de estantes y carpetas para facilitar la búsqueda rápida.",
                    "8. Registrar actividades, torneos, capacitaciones, proyectos y resoluciones de las áreas.",
                    "9. Facilitar la redacción y conservación de actas, notas institucionales y balances periódicos.",
                    "10. Mejorar la coordinación inter-área mediante procedimientos claros de pedido y préstamo.",
                    "11. Aprovechar maderas y materiales existentes en la sede para fabricar muebles y escritorios.",
                    "12. Reducir la dispersión de recursos y la necesidad de trasladar equipos a domicilios particulares.",
                    "13. Promover hábitos de orden, cuidado, responsabilidad y conservación del patrimonio común.",
                    "14. Garantizar que la documentación reservada y datos sensibles no queden expuestos a terceros.",
                    "15. Establecer un sistema operativo sustentable que se mantenga y mejore con el tiempo."
                  ].map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-gray-800">{obj}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. Integrantes y Responsables */}
              <section id="sec-6" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    6. Integrantes y Responsables del Proyecto (4 Integrantes)
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 5-7</span>
                </div>
                <p>
                  El proyecto se estructura sobre un equipo de trabajo reducido de <strong>cuatro personas</strong> para garantizar la asignación precisa de responsabilidades y evitar la dispersión:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border-2 border-emerald-700">
                    <span className="text-[10px] font-bold bg-amber-400 text-gray-950 px-2 py-0.5 rounded uppercase">
                      Coordinación General & Web
                    </span>
                    <h5 className="font-bold text-gray-900 mt-1">Almada Eduardo Thomas</h5>
                    <p className="text-[11px] text-gray-600">
                      Desarrollador del sitio web oficial, diseño de la base de datos centralizada, administración de la plataforma y custodia general.
                    </p>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold block mt-1">D.N.I. 49993070 • Rol ADMIN</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">
                      Acondicionamiento & Muebles
                    </span>
                    <h5 className="font-bold text-gray-900 mt-1">Pablo González</h5>
                    <p className="text-[11px] text-gray-600">
                      Reorganización física, carpintería con maderas de la sede, ensamblado de estanterías, inventario patrimonial.
                    </p>
                    <span className="text-[10px] font-mono text-gray-700 font-bold block mt-1">Rol CARGADOR_DATOS</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">
                      Equipos Técnicos & Medios
                    </span>
                    <h5 className="font-bold text-gray-900 mt-1">Renzo Vázquez</h5>
                    <p className="text-[11px] text-gray-600">
                      Custodia de cámaras, micrófonos, memorias y cables; control estricto de préstamos y verificación del estado al reintegrar.
                    </p>
                    <span className="text-[10px] font-mono text-gray-700 font-bold block mt-1">Rol CARGADOR_DATOS</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">
                      Archivo Físico & Seguridad
                    </span>
                    <h5 className="font-bold text-gray-900 mt-1">Demian</h5>
                    <p className="text-[11px] text-gray-600">
                      Clasificación de carpetas, rotulación, archivo de notas y actas en papel, custodia física de cerraduras y llaves.
                    </p>
                    <span className="text-[10px] font-mono text-gray-700 font-bold block mt-1">Rol CARGADOR_DATOS</span>
                  </div>
                </div>
              </section>

              {/* 7. Organización Espacial */}
              <section id="sec-7" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    7. Organización Espacial y Distribución de Sectores
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 7-8</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900 block font-archival">7.1. Área de Documentación Institucional:</strong>
                    Actas de reuniones, resoluciones, notas formales, expedientes, proyectos y constancias con folios únicos de 15 categorías.
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900 block font-archival">7.2. Área de Eventos y Actividades:</strong>
                    Cronogramas, planillas de inscriptos a torneos de deportes o eventos de niñez, solicitudes de insumos y balances posteriores.
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900 block font-archival">7.3. Área de Medios y Producción Audiovisual:</strong>
                    Espacio protegido para cámaras fotográficas, micrófonos inalámbricos, tarjetas de memoria, cables, trípodes y cargadores.
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900 block font-archival">7.4. Área de Administración y Contabilidad:</strong>
                    Registro contable de presupuestos, comprobantes de gastos e ingresos, rindiendo cuentas formalmente ante las autoridades.
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <strong className="text-gray-900 block font-archival">7.5. Área de Archivo Digital:</strong>
                    Plataforma web sincronizada en tiempo real desarrollada por Almada con roles protegidos y respaldos continuos.
                  </div>
                </div>
              </section>

              {/* 9. Titularidad de Bienes */}
              <section id="sec-9" className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-600 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-emerald-950 uppercase tracking-wide">
                    9. Sistema de Inventario y Distinción Obligatoria de Titularidad
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-800">Pág. 9-10</span>
                </div>
                <p className="text-emerald-900 text-[11px]">
                  El proyecto establece una cláusula legal y patrimonial expresa: <strong>ningún elemento se considerará propiedad de la institución por el solo hecho de encontrarse dentro de la oficina</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] mt-2">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-300">
                    <strong className="text-emerald-900 block font-bold">1. Propiedad Institucional</strong>
                    Bienes adquiridos con fondos de la sede o donados a la institución de manera formal.
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-300">
                    <strong className="text-amber-900 block font-bold">2. Prestado por Integrante</strong>
                    Equipos aportados voluntariamente (cámaras, herramientas, maderas) que continúan siendo de su dueño.
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-blue-300">
                    <strong className="text-blue-900 block font-bold">3. Custodia Temporal</strong>
                    Materiales en tránsito para eventos determinados que deben ser restituidos al finalizar.
                  </div>
                </div>
              </section>

              {/* 10. Seguridad y Llaves */}
              <section id="sec-10" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    10. Seguridad Física y Custodia de Llaves
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 10-11</span>
                </div>
                <p>
                  Para preservar los equipos de valor, se solicitará autorización formal para revisar o cambiar la cerradura de la puerta de la habitación. Las llaves quedarán bajo la custodia de los <strong>cuatro integrantes responsables</strong>, registrándose cada apertura y cierre en el libro de novedades.
                </p>
              </section>

              {/* 11. Caja Fuerte y Custodia de Valores */}
              <section id="sec-11" className="p-4 bg-amber-50/70 rounded-2xl border-2 border-amber-400 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-amber-700" />
                    <span>11. Propuesta de Caja Fuerte y Custodia de Valores</span>
                  </h3>
                  <span className="font-mono text-[10px] text-amber-800">Pág. 11-12</span>
                </div>
                <p className="text-amber-950 text-[11px]">
                  Como parte de los aportes de seguridad, <strong>Almada Eduardo Thomas facilita en calidad de préstamo una caja fuerte</strong> para ser instalada en la oficina, con el propósito de custodiar:
                </p>
                <ul className="list-disc pl-5 text-[11px] text-amber-900 space-y-1">
                  <li><strong>Fondos en efectivo de eventos:</strong> Inscripciones a torneos de deportes, venta de entradas a actividades o recaudaciones transitorias.</li>
                  <li><strong>Elementos de especial valor:</strong> Tarjetas bancarias institucionales, talonarios de cheques, sellos oficiales o documentos notariales de la sede.</li>
                  <li><strong>Registro estricto:</strong> Todo ingreso o egreso de dinero u objetos de valor se asienta en el libro con fecha, hora, concepto, firma de quien entrega y firma del responsable custodio.</li>
                </ul>
              </section>

              {/* 12 & 13. Acondicionamiento y Mobiliario en Madera */}
              <section id="sec-12" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    12. Acondicionamiento & 13. Mobiliario en Madera de Elaboración Propia
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 12-14</span>
                </div>
                <p>
                  El equipo realizará trabajos de limpieza profunda, acondicionamiento de paredes, iluminación y tomas eléctricas.
                </p>
                <p>
                  Aprovechando maderas existentes en desuso dentro de la sede, <strong>Pablo González y el equipo construirán artesanalmente</strong>: un escritorio principal de trabajo, estanterías reforzadas con divisiones rotuladas y compartimentos de seguridad con cerrojo.
                </p>
              </section>

              {/* 15. Régimen de Acceso Restringido */}
              <section id="sec-15" className="p-4 bg-red-50/50 rounded-2xl border border-red-300 space-y-2">
                <div className="flex items-center justify-between border-b border-red-200 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-red-950 uppercase tracking-wide">
                    15. Régimen de Acceso Restringido y Autorizaciones
                  </h3>
                  <span className="font-mono text-[10px] text-red-800">Pág. 14-15</span>
                </div>
                <p className="text-red-950 text-[11px]">
                  La oficina <strong>no funcionará como sala de estar ni espacio de paso libre</strong>. El acceso está restringido al equipo responsable y autoridades de la sede. Los integrantes de otras áreas que precisen materiales o consultas serán atendidos por los encargados mediante ventanilla o mesa de atención.
                </p>
              </section>

              {/* 17. Desarrollo del Sitio Web Oficial */}
              <section id="sec-17" className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-emerald-950 uppercase tracking-wide">
                    17. Desarrollo del Sitio Web Oficial por Almada Eduardo Thomas
                  </h3>
                  <span className="font-mono text-[10px] text-emerald-800">Pág. 15-16</span>
                </div>
                <p className="text-emerald-950 text-[11px]">
                  Almada Eduardo Thomas diseñó y programó esta plataforma digital completa sin costo para la sede, integrando:
                </p>
                <ul className="list-disc pl-5 text-[11px] text-emerald-900 space-y-1">
                  <li>Sistema de 15 Folios documentales con impresión y códigos QR.</li>
                  <li>Módulos específicos por área (Deportes, Niñez, Cultura, Prensa, etc.).</li>
                  <li>Control de préstamos con firma digital obligatoria al retirar y devolver.</li>
                  <li>Base centralizada persistente accesible desde computadoras o celulares autorizados.</li>
                  <li>Régimen estricto de roles: Administrador, Cargador de Datos y Secretario.</li>
                </ul>
              </section>

              {/* 21. Transparencia y Rendición de Cuentas */}
              <section id="sec-21" className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    21. Transparencia, Informes y Supervisión de Autoridades
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 17-18</span>
                </div>
                <p>
                  El Centro de Medios y Archivos presentará informes periódicos de gestión a las autoridades de la sede, detallando: documentos incorporados, estado del inventario de bienes, préstamos devueltos y pendientes, balance de ingresos/egresos y novedades operativas.
                </p>
              </section>

              {/* 24 & 25. Solicitud Formal y Constancia */}
              <section id="sec-24" className="p-4 bg-[#FAF7F0] rounded-2xl border-2 border-[#0D472C] space-y-2">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                  <h3 className="font-archival text-sm font-bold text-[#0D472C] uppercase tracking-wide">
                    24. Solicitud Formal de Autorización & 25. Constancia
                  </h3>
                  <span className="font-mono text-[10px] text-gray-400">Pág. 18-19</span>
                </div>
                <p>
                  Por todo lo expuesto, los firmantes solicitan a las autoridades y responsables de la sede la autorización para:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-gray-800">
                  <li>Disponer de la habitación para destinarla a oficina Centro de Medios y Archivos.</li>
                  <li>Realizar las tareas de limpieza, clasificación y acondicionamiento necesarias.</li>
                  <li>Utilizar maderas y materiales en desuso de la sede para fabricar mobiliario.</li>
                  <li>Implementar el sistema de acceso restringido, custodia de llaves y caja fuerte.</li>
                  <li>Adoptar oficialmente el sitio web institucional como sistema de gestión.</li>
                </ol>
                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-gray-600 font-medium">Almada Eduardo Thomas • Pablo González • Renzo Vázquez • Demian</span>
                  <button
                    onClick={() => setActiveTab('EVALUACION')}
                    className="px-3 py-1.5 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white font-bold text-xs transition cursor-pointer"
                  >
                    Ver Constancia de Resolución Oficial (Sec. 25) →
                  </button>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: CAJA FUERTE Y CUSTODIA DE VALORES (SECCIÓN 11) */}
          {activeTab === 'CAJA_VALORES' && (
            <div className="space-y-5">
              
              {/* Informative Header */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-archival text-sm font-bold text-amber-950">
                        Sección 11: Propuesta de Caja Fuerte y Custodia de Valores
                      </h3>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        Facilitada en préstamo por <strong>Almada Eduardo Thomas</strong> para resguardo de fondos de eventos, inscripciones a torneos y objetos de especial importancia.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsNewRecordModalOpen(true)}
                    className="bg-[#0D472C] hover:bg-[#165B3A] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Registrar Movimiento / Valor</span>
                  </button>
                </div>

                {/* Balances summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-amber-200">
                  <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Efectivo en Caja Fuerte</span>
                    <strong className="text-base sm:text-lg font-mono font-black text-emerald-800">
                      ${saldoEfectivoEnCaja.toLocaleString()} ARS
                    </strong>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Fondos de eventos e inscripciones</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Objetos en Custodia</span>
                    <strong className="text-base sm:text-lg font-mono font-black text-amber-900">
                      {Math.max(0, objetosEnCustodiaActiva)} Artículos
                    </strong>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Tarjetas, sellos y documentos</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Movimientos</span>
                    <strong className="text-base sm:text-lg font-mono font-black text-gray-800">
                      {safeBoxRecords.length} Asientos
                    </strong>
                    <span className="text-[10px] text-gray-500 block mt-0.5">Asentados con firma responsable</span>
                  </div>
                </div>
              </div>

              {/* Form Modal for new Safe Box Record */}
              {isNewRecordModalOpen && (
                <div className="p-4 bg-white rounded-2xl border-2 border-amber-400 shadow-lg animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="font-archival text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <span>Nuevo Registro en Caja Fuerte y Valores</span>
                    </h4>
                    <button
                      onClick={() => setIsNewRecordModalOpen(false)}
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveSafeBoxRecord} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Tipo de Movimiento *
                        </label>
                        <select
                          value={newTipo}
                          onChange={(e) => setNewTipo(e.target.value as any)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white font-bold"
                        >
                          <option value="Ingreso de Efectivo">Ingreso de Efectivo (Evento / Recaudación)</option>
                          <option value="Egreso de Efectivo">Egreso de Efectivo (Gasto Autorizado)</option>
                          <option value="Guarda de Elemento de Valor">Guarda de Elemento de Valor (Tarjeta / Documento / Llave)</option>
                          <option value="Retiro de Elemento de Valor">Retiro de Elemento de Valor Custodiado</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Concepto o Motivo *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Inscripciones Torneo Relámpago Deportes"
                          value={newConcepto}
                          onChange={(e) => setNewConcepto(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                        />
                      </div>

                      {(newTipo === 'Ingreso de Efectivo' || newTipo === 'Egreso de Efectivo') && (
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Monto en Efectivo ($ ARS) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            required
                            placeholder="Monto en pesos"
                            value={newMonto}
                            onChange={(e) => setNewMonto(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white font-mono font-bold"
                          />
                        </div>
                      )}

                      {(newTipo === 'Guarda de Elemento de Valor' || newTipo === 'Retiro de Elemento de Valor') && (
                        <div>
                          <label className="text-[11px] font-bold text-gray-700 block mb-1">
                            Detalle del Objeto o Tarjeta de Valor *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Tarjeta de Débito Institucional / Llave Maestra / Sello"
                            value={newElemento}
                            onChange={(e) => setNewElemento(e.target.value)}
                            className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Persona que Entrega *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nombre y DNI de quien entrega"
                          value={newPersonaEntrega}
                          onChange={(e) => setNewPersonaEntrega(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Responsable que Recibe / Custodia
                        </label>
                        <select
                          value={newPersonaRecepcion}
                          onChange={(e) => setNewPersonaRecepcion(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white"
                        >
                          <option value="Almada Eduardo Thomas (Admin)">Almada Eduardo Thomas (Admin)</option>
                          <option value="Pablo González (Equipo CMA)">Pablo González (Equipo CMA)</option>
                          <option value="Renzo Vázquez (Equipo CMA)">Renzo Vázquez (Equipo CMA)</option>
                          <option value="Demian (Equipo CMA)">Demian (Equipo CMA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Autorizado Por
                        </label>
                        <input
                          type="text"
                          value={newAutorizadoPor}
                          onChange={(e) => setNewAutorizadoPor(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Nº de Comprobante / Recibo Ref
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: REC-2026-004 / SOBRE-01"
                          value={newComprobanteRef}
                          onChange={(e) => setNewComprobanteRef(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          Observaciones o Condiciones del Depósito
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Detalles adicionales, número de sobre o precinto, condiciones de reintegro..."
                          value={newObservaciones}
                          onChange={(e) => setNewObservaciones(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsNewRecordModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="h-4 w-4" />
                        <span>Guardar en Libro de Caja Fuerte</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Records Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-archival text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Libro Oficial de Ingresos, Egresos y Custodia de Valores
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {safeBoxRecords.length} asientos
                  </span>
                </div>

                {safeBoxRecords.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 space-y-2">
                    <Lock className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-xs">No hay movimientos registrados en la caja fuerte aún.</p>
                    <p className="text-[11px] text-gray-400">
                      Utilice el botón superior para asentar el primer ingreso de fondos de eventos u objeto de valor.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-[#FAF7F0] text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Fecha y Hora</th>
                          <th className="p-2.5">Tipo</th>
                          <th className="p-2.5">Concepto / Detalle</th>
                          <th className="p-2.5">Monto / Valor</th>
                          <th className="p-2.5">Entrega / Recibe</th>
                          <th className="p-2.5">Autorizado Por</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {safeBoxRecords.map((r) => {
                          const isIngreso = r.tipoMovimiento === 'Ingreso de Efectivo';
                          const isEgreso = r.tipoMovimiento === 'Egreso de Efectivo';
                          return (
                            <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-2.5 whitespace-nowrap font-mono text-gray-600">
                                {r.fecha} {r.hora}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1 ${
                                  isIngreso
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : isEgreso
                                    ? 'bg-red-100 text-red-900 border border-red-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}>
                                  {isIngreso && <ArrowDownLeft className="h-3 w-3 text-emerald-700" />}
                                  {isEgreso && <ArrowUpRight className="h-3 w-3 text-red-700" />}
                                  {!isIngreso && !isEgreso && <Lock className="h-3 w-3 text-amber-700" />}
                                  <span>{r.tipoMovimiento}</span>
                                </span>
                              </td>
                              <td className="p-2.5 max-w-xs">
                                <strong className="text-gray-900 block">{r.concepto}</strong>
                                {r.elementoValorDetalle && (
                                  <span className="text-[10px] text-gray-500 block">
                                    Elemento: {r.elementoValorDetalle}
                                  </span>
                                )}
                                {r.observaciones && (
                                  <span className="text-[10px] text-gray-400 italic block">
                                    "{r.observaciones}"
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 whitespace-nowrap font-mono font-bold">
                                {r.montoEfectivo ? (
                                  <span className={isIngreso ? 'text-emerald-700' : 'text-red-700'}>
                                    {isIngreso ? '+' : '-'}${r.montoEfectivo.toLocaleString()} ARS
                                  </span>
                                ) : (
                                  <span className="text-amber-800">Custodia física</span>
                                )}
                              </td>
                              <td className="p-2.5 text-gray-700">
                                <div>Entrega: <strong>{r.responsableEntrega}</strong></div>
                                <div className="text-[10px] text-gray-500">Recibe: {r.responsableRecepcion}</div>
                              </td>
                              <td className="p-2.5 text-gray-800">
                                <div className="font-semibold">{r.autorizadoPor}</div>
                                <span className="text-[9px] text-emerald-700 font-mono block">
                                  ✓ Conforme y archivado
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: 6 ETAPAS DE IMPLEMENTACIÓN (SECCIÓN 19) */}
          {activeTab === 'ETAPAS' && (
            <div className="space-y-4">
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-amber-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-archival text-sm font-bold text-gray-900">
                      Sección 19: Plan de Implementación en Seis Etapas
                    </h3>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Cronograma secuencial y ordenado para la puesta en marcha de la oficina y el sistema digital.
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-[#0D472C] text-xs font-bold px-3 py-1 rounded-xl border border-emerald-300">
                    6 Etapas Oficiales
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {stages.map((stage) => {
                  const isDone = stage.estado === 'Completada';
                  const inProgress = stage.estado === 'En Progreso';
                  return (
                    <div
                      key={stage.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                          : inProgress
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : 'bg-white border-gray-200 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : inProgress
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {stage.id}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                {stage.numero}
                              </span>
                              <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                                isDone
                                  ? 'bg-emerald-200 text-emerald-950'
                                  : inProgress
                                  ? 'bg-amber-200 text-amber-950'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {stage.estado}
                              </span>
                            </div>
                            <h4 className="font-archival text-sm font-bold text-gray-900">
                              {stage.titulo}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-bold text-gray-700">
                            {stage.progresoPorcentaje}%
                          </span>
                          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'CARGADOR_DATOS') && (
                            <button
                              onClick={() => handleToggleStageStatus(stage.id)}
                              className="text-[10px] bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                              title="Cambiar estado de la etapa"
                            >
                              Cambiar Estado
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone ? 'bg-emerald-600' : inProgress ? 'bg-amber-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${stage.progresoPorcentaje}%` }}
                        />
                      </div>

                      {/* Sub-actions list */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-gray-700">
                        {stage.acciones.map((acc, i) => (
                          <div key={i} className="flex items-start gap-1.5 bg-white/80 p-1.5 rounded-lg border border-gray-200/60">
                            <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isDone ? 'text-emerald-700' : 'text-gray-400'}`} />
                            <span>{acc}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center justify-between text-[10px] text-gray-500">
                        <span>Responsables: {stage.responsables.join(', ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CONSTANCIA Y RESOLUCIÓN OFICIAL (SECCIÓN 25) */}
          {activeTab === 'EVALUACION' && (
            <div className="space-y-5">
              
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border-2 border-purple-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded uppercase">
                      Sección 25 del Proyecto Oficial
                    </span>
                    <h3 className="font-archival text-sm sm:text-base font-bold text-gray-900 mt-1">
                      Constancia Oficial de Recepción y Evaluación del Proyecto
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      Instrumento formal donde las autoridades de la sede asientan su dictamen institucional, condiciones y observaciones.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsEditingEvaluation(!isEditingEvaluation)}
                      className="bg-purple-900 hover:bg-purple-800 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>{isEditingEvaluation ? 'Ver Constancia' : 'Editar Dictamen'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-xl font-bold text-xs border border-gray-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editing Form */}
              {isEditingEvaluation ? (
                <div className="p-4 bg-white rounded-2xl border border-gray-300 space-y-3">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide border-b border-gray-100 pb-1">
                    Cargar Resolución de las Autoridades
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Dictamen / Decisión Institucional *
                      </label>
                      <select
                        value={evaluation.decision}
                        onChange={(e) => setEvaluation({ ...evaluation, decision: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white font-bold"
                      >
                        <option value="Aprobada">Aprobada (Conforme a la propuesta presentada)</option>
                        <option value="Aprobada con modificaciones o condiciones">Aprobada con modificaciones o condiciones</option>
                        <option value="Pendiente de evaluación">Pendiente de evaluación</option>
                        <option value="No aprobada">No aprobada</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Fecha de Recepción / Dictamen *
                      </label>
                      <input
                        type="date"
                        value={evaluation.fechaRecepcion}
                        onChange={(e) => setEvaluation({ ...evaluation, fechaRecepcion: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Autoridad / Comisión Receptora *
                      </label>
                      <input
                        type="text"
                        value={evaluation.autoridadReceptora}
                        onChange={(e) => setEvaluation({ ...evaluation, autoridadReceptora: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Condiciones y Compromisos Acordados
                      </label>
                      <textarea
                        rows={3}
                        value={evaluation.condicionesAcordadas}
                        onChange={(e) => setEvaluation({ ...evaluation, condicionesAcordadas: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Observaciones Institucionales de la Sede
                      </label>
                      <textarea
                        rows={3}
                        value={evaluation.observaciones}
                        onChange={(e) => setEvaluation({ ...evaluation, observaciones: e.target.value })}
                        className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveEvaluation}
                      className="px-5 py-2 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar Resolución Institucional</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Formal Certificate Layout (Printable) */
                <div className="p-6 bg-white rounded-3xl border-2 border-[#0D472C] shadow-md space-y-5 print:border-none print:shadow-none">
                  
                  {/* Certificate Top Header */}
                  <div className="text-center border-b-2 border-emerald-950 pb-4">
                    <div className="inline-block p-2 rounded-2xl bg-amber-400 text-gray-950 font-black mb-2 shadow-xs">
                      <Building2 className="h-8 w-8 text-[#0D472C]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-widest block">
                      SEDE INSTITUCIONAL • PUERTO ESPERANZA
                    </span>
                    <h2 className="font-archival text-lg sm:text-2xl font-black text-gray-950 tracking-wide mt-1">
                      CONSTANCIA OFICIAL DE RECEPCIÓN Y EVALUACIÓN
                    </h2>
                    <p className="text-xs text-gray-600 font-serif italic mt-0.5">
                      Proyecto: Creación, Acondicionamiento y Puesta en Funcionamiento del Centro de Medios y Archivos
                    </p>
                  </div>

                  {/* Decision Banner */}
                  <div className={`p-4 rounded-2xl border text-center ${
                    evaluation.decision === 'Aprobada'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : evaluation.decision === 'Aprobada con modificaciones o condiciones'
                      ? 'bg-amber-50 border-amber-400 text-amber-950'
                      : 'bg-gray-50 border-gray-300 text-gray-800'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1">
                      Resolución Institucional de la Autoridad:
                    </span>
                    <strong className="text-xl sm:text-2xl font-archival font-black uppercase tracking-wider block">
                      {evaluation.decision}
                    </strong>
                    <span className="text-xs text-gray-600 block mt-1 font-mono">
                      Fecha de Dictamen: {evaluation.fechaRecepcion}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <strong className="text-gray-900 block font-archival mb-1 text-[11px]">
                        Autoridad / Comisión Responsable de la Sede:
                      </strong>
                      <p>{evaluation.autoridadReceptora}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <strong className="text-gray-900 block font-archival mb-1 text-[11px]">
                        Condiciones y Compromisos Acordados:
                      </strong>
                      <p>{evaluation.condicionesAcordadas}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <strong className="text-gray-900 block font-archival mb-1 text-[11px]">
                        Observaciones Generales de la Sede:
                      </strong>
                      <p>{evaluation.observaciones}</p>
                    </div>
                  </div>

                  {/* Signatures Block */}
                  <div className="pt-6 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-[10px]">
                    <div className="border-t border-gray-400 pt-2">
                      <span className="font-bold block text-gray-900">Almada Eduardo Thomas</span>
                      <span className="text-gray-500">Coordinador General & Web</span>
                    </div>
                    <div className="border-t border-gray-400 pt-2">
                      <span className="font-bold block text-gray-900">Pablo González</span>
                      <span className="text-gray-500">Acondicionamiento y Mobiliario</span>
                    </div>
                    <div className="border-t border-gray-400 pt-2">
                      <span className="font-bold block text-gray-900">Renzo Vázquez</span>
                      <span className="text-gray-500">Equipos y Medios</span>
                    </div>
                    <div className="border-t border-gray-400 pt-2">
                      <span className="font-bold block text-gray-900">Demian</span>
                      <span className="text-gray-500">Archivo Físico y Llaves</span>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">
                      Documento Registrado en el Sistema Centralizado del Centro de Medios y Archivos • Versión Oficial
                    </span>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#FAF7F0] p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="text-[11px] text-gray-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
            <span>Centro de Medios y Archivos • Sistema Centralizado Oficial • Octubre 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download="Proyecto_Centro_de_Medios_y_Archivos.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0D472C] hover:underline font-bold text-xs flex items-center gap-1 mr-2"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar PDF</span>
            </a>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0D472C] hover:bg-[#165B3A] text-white font-bold transition cursor-pointer shadow-xs"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
