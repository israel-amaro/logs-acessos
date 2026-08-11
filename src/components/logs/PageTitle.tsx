import React from 'react';
import { ChevronRight, Download, FileSpreadsheet, RefreshCw, Trash2 } from 'lucide-react';

interface PageTitleProps {
  projectName: string;
  totalLogsCount: number;
  onExportCsv: () => void;
  onExportJson: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  redLogsCount?: number;
  onDeleteRedLogs?: () => void;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  totalLogsCount,
  onExportCsv,
  onExportJson,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
      <div className="space-y-1">
        {/* Main Title */}
        <h1 className="text-[28px] font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
          Logs do Checklist SENAI
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onRefresh}
          className={`flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors shadow-2xs ${
            isRefreshing ? 'opacity-70' : ''
          }`}
          title="Atualizar logs manualmente da planilha online"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-900 dark:text-white' : ''}`} />
          <span>Atualizar</span>
        </button>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors shadow-2xs"
          title="Exportar logs para CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar CSV</span>
        </button>

        <button
          onClick={onExportJson}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors shadow-2xs"
          title="Exportar logs em formato JSON"
        >
          <Download className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
          <span>Exportar JSON</span>
        </button>
      </div>
    </div>
  );
};
