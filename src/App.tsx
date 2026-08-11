/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PageTitle } from './components/logs/PageTitle';
import { Tabs } from './components/logs/Tabs';
import { SearchBar } from './components/logs/SearchBar';
import { FilterBar } from './components/logs/FilterBar';
import { Histogram } from './components/logs/Histogram';
import { LogTable } from './components/logs/LogTable';
import { SavedQueriesModal } from './components/logs/SavedQueriesModal';
import { HelpModal } from './components/ui/HelpModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { UserManagementModal } from './components/users/UserManagementModal';
import { logoutFirebase } from './lib/firebase';
import { LoginView } from './components/auth/LoginView';
import { generateInitialLogs, parseChecklistRowToLogEvent, SAVED_QUERIES_MOCK } from './data/mockLogs';
import { fetchSheetData } from './services/sheetService';
import { LogEvent, FilterState, SavedQuery } from './types/log';
import { extractLabInfo, sortLogsMostRecentFirst, getAvailableLabs } from './utils/labUtils';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    role: 'admin' | 'operator';
    name: string;
    uid?: string;
    email?: string;
  } | null>(null);

  // Navigation & Project state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string>('customer1-staging');

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Modals state
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Tabs state ('query' | 'saved' | 'recent' | 'livetail')
  const [activeTab, setActiveTab] = useState<string>('query');

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSheetLoading, setIsSheetLoading] = useState<boolean>(false);
  const [lastSheetSync, setLastSheetSync] = useState<string | null>(null);

  // Notification banner state for deletions
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Helper to determine if a log is in red (critical/error/defective)
  const isRedLog = (log: LogEvent) => {
    const statusUpper = (log.statusGeral || '').toUpperCase();
    return Boolean(
      log.isRedRow ||
      log.severity === 'error' ||
      statusUpper.includes('CRÍTICO') ||
      statusUpper.includes('ERRO') ||
      statusUpper.includes('DEF') ||
      statusUpper.includes('FALHA') ||
      statusUpper === 'NOK' ||
      [log.tela, log.teclado, log.mouse, log.internet, log.gabinete].some(
        (val) => val && !['OK', 'NORMAL', 'BOM'].includes(val.toUpperCase())
      )
    );
  };

  // Main Logs state (defaults to generated logs while fetching sheet data)
  const [logs, setLogs] = useState<LogEvent[]>(() => {
    return generateInitialLogs();
  });
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(SAVED_QUERIES_MOCK);

  // Count red logs in dataset
  const redLogsCount = useMemo(() => {
    return logs.filter(isRedLog).length;
  }, [logs]);

  // Handler to delete ALL red logs
  const handleDeleteRedLogs = () => {
    setLogs((prev) => {
      const redItems = prev.filter(isRedLog);
      const count = redItems.length;
      if (count > 0) {
        setDeleteNotice(`${count} registro(s) em vermelho com defeito foram excluídos com sucesso!`);
        setTimeout(() => setDeleteNotice(null), 5000);
      } else {
        setDeleteNotice('Nenhum registro em vermelho para excluir no momento.');
        setTimeout(() => setDeleteNotice(null), 3000);
      }
      return prev.filter((l) => !isRedLog(l));
    });
  };

  // Handler to delete a single log
  const handleDeleteSingleLog = (id: string) => {
    setLogs((prev) => {
      const target = prev.find((l) => l.id === id);
      if (target) {
        setDeleteNotice(`Registro "${target.computador}" (${target.dataHora}) foi excluído.`);
        setTimeout(() => setDeleteNotice(null), 3000);
      }
      return prev.filter((l) => l.id !== id);
    });
  };

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    period: '1h',
    severity: 'all',
    unit: 'all',
    user: 'all',
    computer: 'all',
    department: 'all',
    actionType: 'all',
  });

  // Load real data from Google Sheet macro endpoint on mount
  const loadDataFromSheet = async () => {
    setIsSheetLoading(true);
    try {
      const result = await fetchSheetData();
      if (result.data && result.data.length > 0) {
        setLogs(result.data);
        setLastSheetSync(result.lastSync || new Date().toLocaleTimeString('pt-BR'));
      } else if (result.lastSync) {
        setLastSheetSync(result.lastSync);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados da planilha, usando backup local:', err);
    } finally {
      setIsSheetLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromSheet();
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Compute unique users and computers from logs for FilterBar
  const availableUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      const u = l.usuario || l.user?.username;
      if (u) set.add(u);
    });
    return Array.from(set).sort();
  }, [logs]);

  const availableComputers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (filters.unit && filters.unit !== 'all' && l.unit !== filters.unit) {
        return;
      }
      const c = l.computador || l.computer?.hostname;
      if (filters.lab && filters.lab !== 'all') {
        const labInfo = extractLabInfo(c);
        if (labInfo.labCode !== filters.lab) {
          return;
        }
      }
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [logs, filters.unit, filters.lab]);

  // Compute available laboratories (e.g., L5, L1, L2, L3, C02)
  const availableLabs = useMemo(() => {
    return getAvailableLabs(logs);
  }, [logs]);

  // Filter logs logic
  const filteredLogs = useMemo(() => {
    const filtered = logs.filter((log) => {
      const userVal = log.usuario || log.user?.username || '';
      const compVal = log.computador || log.computer?.hostname || '';

      // Severity / Status filter (error = Red rows / Defeito, info = Conforme)
      if (filters.severity !== 'all') {
        if (filters.severity === 'error') {
          if (!log.isRedRow && log.severity !== 'error') return false;
        } else if (filters.severity === 'info') {
          if (log.isRedRow || log.severity === 'error') return false;
        } else if (log.severity !== filters.severity) {
          return false;
        }
      }

      // Unit filter (PORTO, NOTEBOOK PORTO, BEIRA MAR, NOTEBOOK BEIRA MAR)
      if (filters.unit && filters.unit !== 'all' && log.unit !== filters.unit) {
        return false;
      }

      // Lab filter (PT-L5-02-60000 -> L5)
      if (filters.lab && filters.lab !== 'all') {
        const labInfo = extractLabInfo(compVal);
        if (labInfo.labCode !== filters.lab) {
          return false;
        }
      }

      // User filter
      if (filters.user !== 'all' && userVal !== filters.user) {
        return false;
      }
      // Computer filter
      if (filters.computer !== 'all' && compVal !== filters.computer) {
        return false;
      }

      // Search Query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        if (query) {
          const matchMessage = (log.message || '').toLowerCase().includes(query);
          const matchComputer = compVal.toLowerCase().includes(query);
          const matchUser = userVal.toLowerCase().includes(query);
          const matchStatus = (log.statusGeral || '').toLowerCase().includes(query);
          const matchTela = (log.tela || '').toLowerCase().includes(query);
          const matchTeclado = (log.teclado || '').toLowerCase().includes(query);
          const matchMouse = (log.mouse || '').toLowerCase().includes(query);
          const matchInternet = (log.internet || '').toLowerCase().includes(query);
          const matchGabinete = (log.gabinete || '').toLowerCase().includes(query);
          const labInfo = extractLabInfo(compVal);
          const matchLab = labInfo.labLabel.toLowerCase().includes(query);

          if (
            !matchMessage &&
            !matchComputer &&
            !matchUser &&
            !matchStatus &&
            !matchTela &&
            !matchTeclado &&
            !matchMouse &&
            !matchInternet &&
            !matchGabinete &&
            !matchLab
          ) {
            return false;
          }
        }
      }

      return true;
    });

    // Always sort from most recent to oldest
    return sortLogsMostRecentFirst(filtered);
  }, [logs, filters]);

  // Update filter helper
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      period: '1h',
      severity: 'all',
      unit: 'all',
      lab: 'all',
      user: 'all',
      computer: 'all',
      department: 'all',
      actionType: 'all',
    });
  };

  const handleFilterByField = (field: string, value: string) => {
    setCurrentView('logs');
    if (field === 'user') {
      setFilters((prev) => ({ ...prev, user: value }));
    } else if (field === 'computer') {
      setFilters((prev) => ({ ...prev, computer: value }));
    } else if (field === 'lab') {
      setFilters((prev) => ({ ...prev, lab: value }));
    } else if (field === 'severity') {
      setFilters((prev) => ({ ...prev, severity: value as any }));
    }
  };

  // Run Query button handler
  const handleRunQuery = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  };

  // Manual Refresh handler (fetches latest spreadsheet records)
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadDataFromSheet();
    setIsRefreshing(false);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['InsertId', 'Data_Hora', 'Severidade', 'Computador', 'Usuario', 'Mensagem', 'TraceId'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.severity,
      l.computer.hostname,
      l.user.username,
      `"${l.message.replace(/"/g, '""')}"`,
      l.traceId,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `logs_acesso_computadores_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `logs_acesso_computadores_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Save new query
  const handleSaveNewQuery = (title: string, queryStr: string) => {
    const newSq: SavedQuery = {
      id: `sq-${Date.now()}`,
      title,
      query: queryStr,
      description: `Consulta salva para monitorar ${title}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      filters: { ...filters },
    };
    setSavedQueries([newSq, ...savedQueries]);
  };

  // Tab navigation handler
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'saved') {
      setShowSavedModal(true);
    }
  };

  // If user is not logged in, render the LoginView
  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex flex-col lg:flex-row font-sans transition-colors duration-150">
      {/* 240px Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        selectedProject={selectedProject}
        onSelectProject={(p) => setSelectedProject(p)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSelectLogFilter={(f) => handleFilterByField('severity', f.severity)}
          currentUser={currentUser}
          onLogout={async () => {
            await logoutFirebase();
            setCurrentUser(null);
          }}
          onOpenUserManagement={() => setShowUserManagementModal(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {deleteNotice && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 shadow-2xs flex items-center justify-between transition-all animate-fadeIn">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {deleteNotice}
              </span>
              <button
                onClick={() => setDeleteNotice(null)}
                className="text-emerald-600 hover:text-emerald-900 dark:hover:text-white font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {currentView === 'logs' && (
            <>
              {/* Page Title & Actions */}
              <PageTitle
                totalLogsCount={filteredLogs.length}
                onExportCsv={handleExportCsv}
                onExportJson={handleExportJson}
                onRefresh={handleManualRefresh}
                isRefreshing={isRefreshing || isSheetLoading}
              />

              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                displayedCount={filteredLogs.length}
                totalCount={logs.length}
                availableUsers={availableUsers}
                availableComputers={availableComputers}
                availableLabs={availableLabs}
              />

              {/* Main Container Card */}
              <div className="bg-white dark:bg-neutral-900 border border-[#E5E7EB] dark:border-neutral-800 rounded-2xl p-6 shadow-2xs space-y-6 transition-all">
                {/* Log Table Component */}
                <LogTable
                  logs={filteredLogs}
                  onFilterByField={handleFilterByField}
                  onDeleteSingleLog={handleDeleteSingleLog}
                  onDeleteRedLogs={handleDeleteRedLogs}
                  redLogsCount={redLogsCount}
                />
              </div>
            </>
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              logs={logs}
              onNavigateToLogsWithFilter={(f) => {
                handleFilterChange({
                  severity: f.severity ? (f.severity as any) : 'all',
                  user: f.user || 'all',
                  computer: f.computer || 'all',
                  unit: f.unit || 'all',
                });
                setCurrentView('logs');
              }}
            />
          )}

          {currentView !== 'logs' &&
            currentView !== 'dashboard' && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center space-y-3 shadow-2xs">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white capitalize">
                  Módulo: {currentView}
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Painel de controle sincronizado com os dados da planilha de logs de acesso.
                </p>
                <button
                  onClick={() => setCurrentView('logs')}
                  className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  Voltar para os Logs
                </button>
              </div>
            )}
        </main>
      </div>

      {/* Modals */}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}

      {showSavedModal && (
        <SavedQueriesModal
          savedQueries={savedQueries}
          onSelectQuery={(sq) => {
            handleFilterChange({ searchQuery: sq.query, ...sq.filters });
            setActiveTab('query');
          }}
          onClose={() => setShowSavedModal(false)}
          onSaveNewQuery={handleSaveNewQuery}
          currentQueryValue={filters.searchQuery}
        />
      )}

      {showUserManagementModal && (
        <UserManagementModal
          isOpen={showUserManagementModal}
          onClose={() => setShowUserManagementModal(false)}
          currentUserUid={currentUser?.uid || ''}
        />
      )}
    </div>
  );
}
