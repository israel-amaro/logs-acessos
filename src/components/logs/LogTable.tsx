import React, { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, Monitor, Keyboard, Mouse, Wifi, HardDrive, ShieldAlert, Trash2 } from 'lucide-react';
import { LogEvent } from '../../types/log';
import { JsonViewer } from './JsonViewer';
import { extractLabInfo } from '../../utils/labUtils';

interface LogTableProps {
  logs: LogEvent[];
  onFilterByField: (field: string, value: string) => void;
  onSelectLogForDetail?: (log: LogEvent) => void;
  onDeleteSingleLog?: (id: string) => void;
  onDeleteRedLogs?: () => void;
  redLogsCount?: number;
}

export const LogTable: React.FC<LogTableProps> = ({
  logs,
  onFilterByField,
  onDeleteSingleLog,
  onDeleteRedLogs,
  redLogsCount = 0,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Pagination calculations
  const totalPages = Math.ceil(logs.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

  const renderStatusBadge = (val: string) => {
    const isOk = val.toUpperCase() === 'OK' || val.toUpperCase() === 'NORMAL' || val.toUpperCase() === 'BOM';
    if (isOk) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {val}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 text-[10px] font-bold animate-pulse">
        <AlertTriangle className="w-3 h-3 text-red-600" />
        {val}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Table Container with horizontal and vertical scroll */}
      <div className="relative overflow-x-auto overflow-y-auto max-h-[620px] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xs">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-20 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <tr className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              <th className="py-3 px-2 w-8 text-center"></th>
              <th className="py-3 px-3">Unidade</th>
              <th className="py-3 px-3">Data / Hora</th>
              <th className="py-3 px-3">Computador</th>
              <th className="py-3 px-3">Usuário</th>
              <th className="py-3 px-2 text-center">Tela</th>
              <th className="py-3 px-2 text-center">Teclado</th>
              <th className="py-3 px-2 text-center">Mouse / TouchPad</th>
              <th className="py-3 px-2 text-center">Internet</th>
              <th className="py-3 px-2 text-center">Gabinete/PC</th>
              <th className="py-3 px-3 text-center">Status Geral</th>
              <th className="py-3 px-2 text-center w-12">Excluir</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs font-medium">
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => {
                const isExpanded = expandedRowId === log.id;
                const isRed = log.isRedRow || log.severity === 'error' || log.statusGeral.toUpperCase().includes('CRÍTICO') || log.statusGeral.toUpperCase().includes('ERRO');

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={(e) => toggleExpand(log.id, e)}
                      className={`group transition-all cursor-pointer ${
                        isRed
                          ? 'bg-red-50/90 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border-l-4 border-l-red-600'
                          : isExpanded
                          ? 'bg-neutral-100 dark:bg-neutral-800/80 border-l-4 border-l-neutral-400'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Chevron */}
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={(e) => toggleExpand(log.id, e)}
                          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className={`w-4 h-4 ${isRed ? 'text-red-700 dark:text-red-300 font-bold' : 'text-neutral-900 dark:text-white'}`} />
                          ) : (
                            <ChevronRight className={`w-4 h-4 ${isRed ? 'text-red-600 dark:text-red-400' : 'text-neutral-400'}`} />
                          )}
                        </button>
                      </td>

                      {/* Unidade */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 font-bold text-[10px]">
                          {log.unit || 'PORTO'}
                        </span>
                      </td>

                      {/* Data / Hora */}
                      <td className={`py-3 px-3 whitespace-nowrap font-mono text-[11px] font-semibold ${isRed ? 'text-red-950 dark:text-red-100' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {log.dataHora || log.timestamp}
                      </td>

                      {/* Computador */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onFilterByField('computer', log.computador);
                            }}
                            className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold hover:underline cursor-pointer ${
                              isRed ? 'text-red-900 dark:text-red-200' : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                            title="Filtrar por este computador"
                          >
                            <Monitor className={`w-3.5 h-3.5 ${isRed ? 'text-red-600' : 'text-neutral-500'}`} />
                            {log.computador}
                          </span>
                          {(() => {
                            const lab = extractLabInfo(log.computador);
                            if (lab.labCode !== 'OUTROS') {
                              return (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFilterByField('lab', lab.labCode);
                                  }}
                                  className="px-1.5 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-900 dark:bg-purple-950 dark:text-purple-200 font-sans text-[9px] font-extrabold cursor-pointer border border-purple-200 dark:border-purple-800 shadow-2xs"
                                  title={`Filtrar pelo ${lab.labLabel}`}
                                >
                                  {lab.labCode}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>

                      {/* Usuário */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onFilterByField('user', log.usuario);
                          }}
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold hover:underline cursor-pointer ${
                            isRed ? 'text-red-800 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-400'
                          }`}
                          title="Filtrar por este usuário"
                        >
                          {log.usuario}
                        </span>
                      </td>

                      {/* Tela */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {renderStatusBadge(log.tela)}
                      </td>

                      {/* Teclado */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {renderStatusBadge(log.teclado)}
                      </td>

                      {/* Mouse / TouchPad */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {renderStatusBadge(log.touchpad || log.mouse || 'OK')}
                      </td>

                      {/* Internet */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {renderStatusBadge(log.internet)}
                      </td>

                      {/* Gabinete/PC */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        {log.unit?.includes('NOTEBOOK') || log.isNotebook ? (
                          <span className="text-neutral-400 font-mono text-xs">-</span>
                        ) : (
                          renderStatusBadge(log.gabinete)
                        )}
                      </td>

                      {/* Status Geral */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isRed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[11px] shadow-2xs tracking-wide">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {log.statusGeral}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {log.statusGeral}
                          </span>
                        )}
                      </td>

                      {/* Excluir Botão */}
                      <td className="py-3 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {onDeleteSingleLog && (
                          <button
                            onClick={() => onDeleteSingleLog(log.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
                            title="Excluir este registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Row Details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={11} className="p-0 bg-neutral-50 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
                          <div className="p-4 space-y-3">
                            <JsonViewer log={log} onFilterByField={onFilterByField} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-neutral-400 font-mono text-xs">
                  Nenhum registro encontrado para os critérios selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 pt-2">
        <div className="flex items-center space-x-2">
          <span>Itens por página:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs font-semibold focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="pl-2">
            Mostrando <span className="font-semibold text-neutral-800 dark:text-neutral-200">{startIndex + 1}</span> a{' '}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {Math.min(startIndex + pageSize, logs.length)}
            </span>{' '}
            de <span className="font-semibold text-neutral-800 dark:text-neutral-200">{logs.length}</span>
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <span className="px-3 py-1.5 font-mono text-neutral-700 dark:text-neutral-300">
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};
