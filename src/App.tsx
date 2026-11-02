import React, { useState, useEffect } from 'react';
import { 
  ArchiveDocument, 
  KidProfile, 
  InventoryItem, 
  MaterialLoan, 
  AreaRequest, 
  BudgetRecord, 
  OfficeEvent, 
  UserProfile, 
  OperativeArea 
} from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LoginScreen } from './components/LoginScreen';
import { UserManagementView } from './components/UserManagementView';
import { UserManagementModal } from './components/UserManagementModal';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { KidsView } from './components/KidsView';
import { InventoryView } from './components/InventoryView';
import { RequestsView } from './components/RequestsView';
import { BudgetView } from './components/BudgetView';
import { CalendarView } from './components/CalendarView';
import { QRLookupView } from './components/QRLookupView';
import { OfficeShelvesView } from './components/OfficeShelvesView';
import { DigitizePaperModal } from './components/DigitizePaperModal';
import { OfficeFolioCategory, OfficeNotice } from './types';
import { INITIAL_NOTICES } from './data/mockData';

// Modals
import { DocumentModal } from './components/DocumentModal';
import { FolioPrintModal } from './components/FolioPrintModal';
import { KidModal } from './components/KidModal';
import { LoanModal } from './components/LoanModal';
import { ReturnLoanModal } from './components/ReturnLoanModal';
import { RequestModal } from './components/RequestModal';
import { BudgetModal } from './components/BudgetModal';

// New Real Office Management Views
import { HomeHubView } from './components/HomeHubView';
import { AreaManagementView } from './components/AreaManagementView';
import { InstitutionalInventoryView } from './components/InstitutionalInventoryView';
import { ShelvesManagementView } from './components/ShelvesManagementView';
import { NoticesAlertsView } from './components/NoticesAlertsView';
import { AreaFormsView } from './components/AreaFormsView';
import { canUserAccessTab } from './utils/permissions';

export default function App() {
  // Authentication session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getActiveSession());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => StorageService.getUsers());

  // Navigation tab (starts at central home hub)
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeAreaFilter, setActiveAreaFilter] = useState<OperativeArea | 'TODAS'>('TODAS');

  // Guard navigation against unauthorized tab URLs/states
  useEffect(() => {
    if (currentUser && !canUserAccessTab(currentUser, currentTab)) {
      setCurrentTab('home');
    }
  }, [currentUser, currentTab]);

  // Central server synchronization on mount and event subscription
  useEffect(() => {
    StorageService.pullLatestFromServer();

    const refreshData = () => {
      setDocuments(StorageService.getDocuments());
      setKids(StorageService.getKids());
      setInventory(StorageService.getInventory());
      setLoans(StorageService.getLoans());
      setRequests(StorageService.getRequests());
      setBudget(StorageService.getBudget());
      setEvents(StorageService.getEvents());
      try {
        setNotices(StorageService.getNotices());
      } catch {}
      setAllUsers(StorageService.getUsers());
    };

    window.addEventListener('cma_data_changed', refreshData);
    return () => window.removeEventListener('cma_data_changed', refreshData);
  }, []);

  // Digitize paper modal states
  const [isDigitizeModalOpen, setIsDigitizeModalOpen] = useState(false);
  const [digitizeTargetFolio, setDigitizeTargetFolio] = useState<OfficeFolioCategory>('Actas y reuniones');

  // Archive and operational data
  const [documents, setDocuments] = useState<ArchiveDocument[]>(() => StorageService.getDocuments());
  const [kids, setKids] = useState<KidProfile[]>(() => StorageService.getKids());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => StorageService.getInventory());
  const [loans, setLoans] = useState<MaterialLoan[]>(() => StorageService.getLoans());
  const [requests, setRequests] = useState<AreaRequest[]>(() => StorageService.getRequests());
  const [budget, setBudget] = useState<BudgetRecord[]>(() => StorageService.getBudget());
  const [events, setEvents] = useState<OfficeEvent[]>(() => StorageService.getEvents());
  const [notices, setNotices] = useState<OfficeNotice[]>(() => {
    try {
      if (typeof StorageService.getNotices === 'function') {
        return StorageService.getNotices();
      }
    } catch (e) {
      console.warn('StorageService.getNotices fallback:', e);
    }
    return INITIAL_NOTICES;
  });

  // Strict Balance Calculation: "No se puede sacar más plata de lo que hay"
  const totalIngresos = budget.filter((b) => b.tipo === 'Ingreso').reduce((acc, curr) => acc + curr.monto, 0);
  const totalGastos = budget.filter((b) => b.tipo === 'Gasto').reduce((acc, curr) => acc + curr.monto, 0);
  const availableBalance = Math.max(0, totalIngresos - totalGastos);

  // Modal states
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ArchiveDocument | null>(null);

  const [isFolioPrintModalOpen, setIsFolioPrintModalOpen] = useState(false);
  const [printingDoc, setPrintingDoc] = useState<ArchiveDocument | null>(null);

  const [isKidModalOpen, setIsKidModalOpen] = useState(false);
  const [editingKid, setEditingKid] = useState<KidProfile | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isReturnLoanModalOpen, setIsReturnLoanModalOpen] = useState(false);
  const [returningLoan, setReturningLoan] = useState<MaterialLoan | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Login handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setAllUsers(StorageService.getUsers());
    if (typeof StorageService.getNotices === 'function') {
      setNotices(StorageService.getNotices());
    }
    setCurrentTab('home');
    showToast(`Bienvenido a la oficina, ${user.name}`);
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    showToast('Sesión cerrada. Ingrese nuevamente con su usuario.');
  };

  // Switch User from dropdown
  const handleSwitchUser = (user: UserProfile) => {
    StorageService.setActiveSession(user);
    setCurrentUser(user);
    showToast(`Sesión activa: ${user.name} (${user.role})`);
    if (user.role === 'VISITANTE' && (currentTab === 'budget' || currentTab === 'requests')) {
      setCurrentTab('dashboard');
    }
  };

  const handleUsersUpdated = () => {
    setAllUsers(StorageService.getUsers());
    showToast('Padrón de usuarios de la oficina actualizado');
  };

  // Document actions
  const handleSaveDoc = (doc: ArchiveDocument) => {
    if (!currentUser) return;
    const updated = StorageService.saveDocument(doc, currentUser);
    setDocuments(updated);
    showToast(`Folio ${doc.codigoFolio} guardado en ${doc.estanteFisico}`);
    setPrintingDoc(doc);
    setIsFolioPrintModalOpen(true);
  };

  const handleDeleteDoc = (id: string) => {
    if (!currentUser) return;
    const updated = StorageService.deleteDocument(id, currentUser);
    setDocuments(updated);
    showToast('Documento eliminado del archivo');
  };

  // Kid actions
  const handleSaveKid = (kid: KidProfile) => {
    if (!currentUser) return;
    const updated = StorageService.saveKid(kid, currentUser);
    setKids(updated);
    showToast(`Ficha de ${kid.nombre} ${kid.apellido} guardada`);
  };

  // Loan actions with signature
  const handleCreateLoan = (newLoan: MaterialLoan) => {
    if (!currentUser) return;
    const result = StorageService.createLoan(newLoan, currentUser);
    setLoans(result.loans);
    setInventory(result.inventory);
    showToast(`Préstamo asentado con firma digital: ${newLoan.itemNombre}`);
  };

  const handleReturnLoan = (loanId: string, firmaDevolucionUrl: string, observaciones: string) => {
    if (!currentUser) return;
    const result = StorageService.returnLoan(loanId, firmaDevolucionUrl, observaciones, currentUser);
    setLoans(result.loans);
    setInventory(result.inventory);
    showToast('Devolución asentada y reingresada al stock de inventario');
  };

  // Request actions
  const handleSaveRequest = (req: AreaRequest) => {
    if (!currentUser) return;
    const updated = StorageService.saveRequest(req, currentUser);
    setRequests(updated);
    showToast(`Solicitud ${req.codigo} enviada`);
  };

  const handleUpdateStatus = (reqId: string, status: AreaRequest['estado'], responseNote: string) => {
    if (!currentUser) return;
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    const updatedReq: AreaRequest = {
      ...req,
      estado: status,
      respuestaAdmin: responseNote,
      fechaRespuesta: new Date().toISOString().split('T')[0],
    };
    const updatedList = StorageService.saveRequest(updatedReq, currentUser);
    setRequests(updatedList);
    showToast(`Pedido ${req.codigo}: marcado como ${status}`);
  };

  // Budget actions with strict balance restriction
  const handleSaveBudget = (record: BudgetRecord) => {
    if (!currentUser) return;
    if (record.tipo === 'Gasto' && record.monto > availableBalance) {
      showToast(`⚠️ Error: Fondos insuficientes. El saldo disponible es de $${availableBalance.toLocaleString()} ARS.`);
      return;
    }
    const updated = StorageService.saveBudgetRecord(record, currentUser);
    setBudget(updated);
    showToast(`Asiento contable registrado: $${record.monto.toLocaleString()}`);
  };

  // Navigation helpers
  const handleSearchFolio = (query: string) => {
    setCurrentTab('documents');
  };

  const handleViewDocFolio = (folio: string) => {
    setCurrentTab('qr_lookup');
  };

  const handleSelectArea = (area: OperativeArea) => {
    setActiveAreaFilter(area);
    setCurrentTab('documents');
  };

  // Backup handlers
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullArchiveJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Respaldo_Centro_Medios_Puerto_Esperanza_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Respaldo institucional descargado exitosamente');
  };

  const handleImportBackup = (jsonStr: string) => {
    if (!currentUser) return;
    const success = StorageService.importFullArchiveJSON(jsonStr, currentUser);
    if (success) {
      setAllUsers(StorageService.getUsers());
      setDocuments(StorageService.getDocuments());
      setKids(StorageService.getKids());
      setInventory(StorageService.getInventory());
      setLoans(StorageService.getLoans());
      setRequests(StorageService.getRequests());
      setBudget(StorageService.getBudget());
      setEvents(StorageService.getEvents());
      showToast('Copia de seguridad restaurada correctamente');
    } else {
      showToast('Error al importar el archivo JSON');
    }
  };

  const handleResetFactory = () => {
    if (!currentUser) return;
    if (confirm('¿Restablecer los datos base oficiales de Puerto Esperanza?')) {
      StorageService.resetToDefault(currentUser);
      setAllUsers(StorageService.getUsers());
      setDocuments(StorageService.getDocuments());
      setKids(StorageService.getKids());
      setInventory(StorageService.getInventory());
      setLoans(StorageService.getLoans());
      setRequests(StorageService.getRequests());
      setBudget(StorageService.getBudget());
      setEvents(StorageService.getEvents());
      showToast('Se restablecieron los registros base del centro');
    }
  };

  // If user is not logged in, render the login screen!
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingRequestsCount = requests.filter((r) => r.estado === 'Pendiente').length;
  const activeLoansCount = loans.filter((l) => l.estado === 'En Curso').length;

  const handleSavePaper = (doc: ArchiveDocument) => {
    if (!currentUser) return;
    const updated = StorageService.saveDocument(doc, currentUser);
    setDocuments(updated);
    showToast(`✓ Papel guardado y digitalizado en "${doc.folioNombre || 'Folio'}"`);
  };

  return (
    <div className="min-h-screen bg-[#F9F6EC] text-[#162B1F] flex flex-col font-sans selection:bg-[#0D472C] selection:text-white">
      {/* Header with official seal, profile info & session control */}
      <Header
        currentUser={currentUser}
        onSearchFolio={handleSearchFolio}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetFactory={handleResetFactory}
        onOpenUserManagement={() => setCurrentTab('users')}
        onLogout={handleLogout}
        onOpenDigitize={() => {
          setDigitizeTargetFolio('Actas y reuniones');
          setIsDigitizeModalOpen(true);
        }}
        onNavigateTab={setCurrentTab}
      />

      {/* Navigation Tabs */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'documents') {
            setActiveAreaFilter('TODAS');
          }
        }}
        currentUser={currentUser}
        pendingRequestsCount={pendingRequestsCount}
        activeLoansCount={activeLoansCount}
      />

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 py-6">
        {currentTab === 'home' && (
          <HomeHubView
            currentUser={currentUser}
            notices={notices}
            onNavigateTab={setCurrentTab}
            availableBalance={availableBalance}
          />
        )}

        {currentTab === 'my_area' && (
          <AreaManagementView
            currentUser={currentUser}
            onOpenDigitizeFolio={(initialArea) => {
              if (initialArea === 'DEPORTES Y ACCIÓN SOCIAL') {
                setDigitizeTargetFolio('Deportes');
              } else if (initialArea === 'CULTURA Y EVENTOS') {
                setDigitizeTargetFolio('Cultura y eventos');
              } else if (initialArea === 'AMBIENTE Y PROTECCIÓN ANIMAL') {
                setDigitizeTargetFolio('Ambiente y proteccion animal');
              } else if (initialArea === 'PRENSA, REDES Y COMUNICACIÓN') {
                setDigitizeTargetFolio('Prensa redes y comunicacion');
              } else {
                setDigitizeTargetFolio('Actas y reuniones');
              }
              setIsDigitizeModalOpen(true);
            }}
            onViewDocDetail={(doc) => {
              setEditingDoc(doc);
              setIsDocModalOpen(true);
            }}
          />
        )}

        {currentTab === 'shelves' && (
          <OfficeShelvesView
            documents={documents}
            currentUser={currentUser}
            onOpenDigitizeFolio={(folioName) => {
              setDigitizeTargetFolio(folioName);
              setIsDigitizeModalOpen(true);
            }}
            onPrintFolioLabel={(doc) => {
              setPrintingDoc(doc);
              setIsFolioPrintModalOpen(true);
            }}
            onViewDocDetail={(doc) => {
              setEditingDoc(doc);
              setIsDocModalOpen(true);
            }}
          />
        )}

        {currentTab === 'institutional_inventory' && (
          <InstitutionalInventoryView currentUser={currentUser} />
        )}

        {currentTab === 'shelves_mgmt' && (
          <ShelvesManagementView currentUser={currentUser} />
        )}

        {currentTab === 'notices' && (
          <NoticesAlertsView currentUser={currentUser} />
        )}

        {currentTab === 'inscriptions' && (
          <AreaFormsView currentUser={currentUser} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            documents={documents}
            kids={kids}
            inventory={inventory}
            loans={loans}
            requests={requests}
            events={events}
            currentUser={currentUser}
            onSelectArea={handleSelectArea}
            onNavigateTab={setCurrentTab}
            onOpenNewDoc={() => {
              setEditingDoc(null);
              setIsDocModalOpen(true);
            }}
            onOpenNewKid={() => {
              setEditingKid(null);
              setIsKidModalOpen(true);
            }}
            onOpenNewLoan={() => setIsLoanModalOpen(true)}
            onOpenNewRequest={() => setIsRequestModalOpen(true)}
          />
        )}

        {currentTab === 'documents' && (
          <DocumentsView
            documents={documents}
            currentUser={currentUser}
            initialAreaFilter={activeAreaFilter}
            onOpenNewDoc={() => {
              setEditingDoc(null);
              setIsDocModalOpen(true);
            }}
            onEditDoc={(doc) => {
              setEditingDoc(doc);
              setIsDocModalOpen(true);
            }}
            onDeleteDoc={handleDeleteDoc}
            onPrintFolio={(doc) => {
              setPrintingDoc(doc);
              setIsFolioPrintModalOpen(true);
            }}
          />
        )}

        {currentTab === 'kids' && (
          <KidsView
            kids={kids}
            currentUser={currentUser}
            onOpenNewKid={() => {
              setEditingKid(null);
              setIsKidModalOpen(true);
            }}
            onEditKid={(kid) => {
              setEditingKid(kid);
              setIsKidModalOpen(true);
            }}
            onViewDocFolio={handleViewDocFolio}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            loans={loans}
            currentUser={currentUser}
            onOpenNewLoan={() => setIsLoanModalOpen(true)}
            onOpenReturnLoan={(loan) => {
              setReturningLoan(loan);
              setIsReturnLoanModalOpen(true);
            }}
          />
        )}

        {currentTab === 'requests' && (
          <RequestsView
            requests={requests}
            currentUser={currentUser}
            onOpenNewRequest={() => setIsRequestModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetView
            budget={budget}
            currentUser={currentUser}
            onOpenNewBudget={() => setIsBudgetModalOpen(true)}
            onViewDocFolio={handleViewDocFolio}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            events={events}
            currentUser={currentUser}
            onEventsUpdated={(updated) => setEvents(updated)}
          />
        )}

        {currentTab === 'qr_lookup' && (
          <QRLookupView
            documents={documents}
            inventory={inventory}
            kids={kids}
            onPrintFolio={(doc) => {
              setPrintingDoc(doc);
              setIsFolioPrintModalOpen(true);
            }}
          />
        )}

        {currentTab === 'users' && currentUser.role === 'ADMIN' && (
          <UserManagementView
            currentUser={currentUser}
            onUsersUpdated={handleUsersUpdated}
          />
        )}
      </main>

      {/* Institutional footer */}
      <footer className="border-t border-[#0D472C]/20 bg-[#FFFDF8] py-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0D472C]">CENTRO DE MEDIOS Y ARCHIVOS</span>
            <span>• Puerto Esperanza • Esperanza somos TODOS • Huella Verde</span>
          </div>
          <span className="text-[11px] text-gray-400">
            Coordinador General: Almada Eduardo Thomas • Resguardo Institucional
          </span>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#0D472C] text-[#F9F6EC] px-4 py-3 shadow-xl border border-emerald-500 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Management Modal for Admin */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={currentUser}
        onUsersUpdated={handleUsersUpdated}
      />

      {/* Modals */}
      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleSaveDoc}
        currentUser={currentUser}
        initialDoc={editingDoc}
        kidsList={kids}
      />

      <FolioPrintModal
        isOpen={isFolioPrintModalOpen}
        onClose={() => setIsFolioPrintModalOpen(false)}
        document={printingDoc}
      />

      <KidModal
        isOpen={isKidModalOpen}
        onClose={() => setIsKidModalOpen(false)}
        onSave={handleSaveKid}
        currentUser={currentUser}
        initialKid={editingKid}
      />

      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        inventory={inventory}
        currentUser={currentUser}
        onSubmitLoan={handleCreateLoan}
      />

      <ReturnLoanModal
        isOpen={isReturnLoanModalOpen}
        onClose={() => setIsReturnLoanModalOpen(false)}
        loan={returningLoan}
        currentUser={currentUser}
        onConfirmReturn={handleReturnLoan}
      />

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={currentUser}
        onSubmit={handleSaveRequest}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentUser={currentUser}
        availableBalance={availableBalance}
        onSubmit={handleSaveBudget}
      />

      <DigitizePaperModal
        isOpen={isDigitizeModalOpen}
        onClose={() => setIsDigitizeModalOpen(false)}
        onSavePaper={handleSavePaper}
        currentUser={currentUser}
        initialFolio={digitizeTargetFolio}
      />
    </div>
  );
}
