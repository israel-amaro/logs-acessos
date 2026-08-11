import React, { useState } from 'react';
import { Bell, Menu, Moon, Sun, FileSpreadsheet, LogOut, ShieldCheck, UserPlus } from 'lucide-react';
import { NotificationPopover } from '../ui/NotificationPopover';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHelp?: () => void;
  onOpenMobileSidebar?: () => void;
  isLiveTail?: boolean;
  onToggleLiveTail?: () => void;
  onSelectLogFilter?: (filter: { severity: 'error' | 'warning'; user?: string }) => void;
  lastSyncTime?: string;
  onSyncSheet?: () => void;
  isSyncingSheet?: boolean;
  currentUser?: { username: string; role: 'admin' | 'operator'; name: string } | null;
  onLogout?: () => void;
  onOpenUserManagement?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenMobileSidebar,
  onSelectLogFilter,
  lastSyncTime,
  onSyncSheet,
  isSyncingSheet,
  currentUser,
  onLogout,
  onOpenUserManagement,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left Area (Mobile Menu & Sync) */}
      <div className="flex items-center space-x-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Google Sheet Sync Button */}
        {onSyncSheet && (
          <button
            onClick={onSyncSheet}
            disabled={isSyncingSheet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            title="Sincronizar com a planilha online do Google Apps Script"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sincronizar Planilha</span>
            {lastSyncTime && (
              <span className="text-[10px] text-neutral-400 font-mono">({lastSyncTime})</span>
            )}
          </button>
        )}
      </div>

      {/* Right Area Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Admin User Management Button */}
        {currentUser?.role === 'admin' && onOpenUserManagement && (
          <button
            onClick={onOpenUserManagement}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all cursor-pointer"
            title="Criar e gerenciar usuários no Firebase"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Criar Usuários</span>
          </button>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
            title="Notificações e Alertas"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-neutral-900" />
          </button>

          {showNotifications && (
            <NotificationPopover
              onClose={() => setShowNotifications(false)}
              onSelectLogFilter={onSelectLogFilter}
            />
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-neutral-600" />}
        </button>

        <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

        {/* Profile Avatar & User State */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="relative w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black ring-2 ring-blue-500/30">
            <span>{currentUser?.role === 'admin' ? 'AD' : 'OP'}</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {currentUser?.name || 'Admin TI'}
              </span>
              {currentUser?.role === 'admin' && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" title="Perfil Administrador" />
              )}
            </div>
            <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase font-mono">
              {currentUser?.role === 'admin' ? 'Administrador' : 'Operador'}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors ml-1 cursor-pointer"
              title="Sair / Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

