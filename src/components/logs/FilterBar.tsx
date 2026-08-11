import React from 'react';
import { Calendar, AlertOctagon, User, Monitor, X, SlidersHorizontal, DoorClosed } from 'lucide-react';
import { FilterState, LogSeverity } from '../../types/log';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  displayedCount: number;
  totalCount: number;
  availableUsers?: string[];
  availableComputers?: string[];
  availableLabs?: { code: string; label: string; count: number }[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  displayedCount,
  totalCount,
  availableUsers = [],
  availableComputers = [],
  availableLabs = [],
}) => {
  const activeFiltersCount =
    (filters.severity !== 'all' ? 1 : 0) +
    (filters.unit && filters.unit !== 'all' ? 1 : 0) +
    (filters.lab && filters.lab !== 'all' ? 1 : 0) +
    (filters.user !== 'all' ? 1 : 0) +
    (filters.computer !== 'all' ? 1 : 0) +
    (filters.period !== '1h' ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selects Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Unit Select (The 4 installation units) */}
          <div className="relative flex items-center">
            <SlidersHorizontal className="absolute left-3 w-4 h-4 text-blue-600 pointer-events-none" />
            <select
              value={filters.unit || 'all'}
              onChange={(e) => onFilterChange({ unit: e.target.value })}
              className="h-10 pl-9 pr-8 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer shadow-2xs"
            >
              <option value="all">Unidade: Todas as 4</option>
              <option value="PORTO">PORTO (Desktop)</option>
              <option value="NOTEBOOK PORTO">NOTEBOOK PORTO</option>
              <option value="BEIRA MAR">BEIRA MAR (Desktop)</option>
              <option value="NOTEBOOK BEIRA MAR">NOTEBOOK BEIRA MAR</option>
            </select>
          </div>

          {/* Laboratory Select (SENAI Hostname Pattern: PT-L5-02-60000 -> L5) */}
          <div className="relative flex items-center">
            <DoorClosed className="absolute left-3 w-4 h-4 text-purple-600 pointer-events-none" />
            <select
              value={filters.lab || 'all'}
              onChange={(e) => onFilterChange({ lab: e.target.value })}
              className="h-10 pl-9 pr-8 bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-bold text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all cursor-pointer shadow-2xs"
            >
              <option value="all">Laboratório: Todos</option>
              {availableLabs.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.count} {l.count === 1 ? 'computador' : 'computadores'})
                </option>
              ))}
            </select>
          </div>

          {/* Period Select */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <select
              value={filters.period}
              onChange={(e) => onFilterChange({ period: e.target.value })}
              className="h-10 pl-9 pr-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 dark:focus:border-neutral-100 transition-all cursor-pointer shadow-2xs"
            >
              <option value="15m">Últimos 15 minutos</option>
              <option value="1h">Última 1 hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="all">Todo o período</option>
            </select>
          </div>

          {/* Severity Select */}
          <div className="relative flex items-center">
            <AlertOctagon className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <select
              value={filters.severity}
              onChange={(e) => onFilterChange({ severity: e.target.value as LogSeverity | 'all' })}
              className="h-10 pl-9 pr-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 dark:focus:border-neutral-100 transition-all cursor-pointer shadow-2xs"
            >
              <option value="all">Status: Todos</option>
              <option value="info">Info / Conforme</option>
              <option value="error">Linha Vermelha / Defeito</option>
            </select>
          </div>

          {/* Computer Select */}
          <div className="relative flex items-center">
            <Monitor className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <select
              value={filters.computer}
              onChange={(e) => onFilterChange({ computer: e.target.value })}
              className="h-10 pl-9 pr-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 dark:focus:border-neutral-100 transition-all cursor-pointer shadow-2xs max-w-[200px] truncate"
            >
              <option value="all">
                {filters.lab && filters.lab !== 'all'
                  ? `Computador: Todos do ${filters.lab} (${availableComputers.length})`
                  : `Computador: Todos (${availableComputers.length})`}
              </option>
              {availableComputers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className="h-10 px-3 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros ({activeFiltersCount})</span>
            </button>
          )}
        </div>

        {/* Counter - Displays "Exibindo X registros" */}
        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 font-mono">
          Exibindo <span className="font-bold text-neutral-900 dark:text-white">{displayedCount.toLocaleString('pt-BR')}</span> de{' '}
          <span>{totalCount.toLocaleString('pt-BR')}</span> registros
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400">Filtros Ativos:</span>
          {filters.severity !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-medium text-[11px]">
              Status: {filters.severity}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ severity: 'all' })}
              />
            </span>
          )}
          {filters.lab && filters.lab !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100 font-medium text-[11px]">
              Lab: {filters.lab}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ lab: 'all' })}
              />
            </span>
          )}
          {filters.user !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-medium text-[11px]">
              Usuário: {filters.user}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ user: 'all' })}
              />
            </span>
          )}
          {filters.computer !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 font-medium text-[11px]">
              Computador: {filters.computer}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => onFilterChange({ computer: 'all' })}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
