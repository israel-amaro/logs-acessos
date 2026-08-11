import React, { useState } from 'react';
import { Copy, Check, Code, Monitor, User, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { LogEvent } from '../../types/log';

interface JsonViewerProps {
  log: LogEvent;
  onFilterByField?: (field: string, value: string) => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ log, onFilterByField }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'checklist' | 'json'>('checklist');

  const checklistObject = {
    "Data/Hora": log.dataHora || log.timestamp,
    "Computador": log.computador,
    "Usuário": log.usuario,
    "Tela": log.tela,
    "Teclado": log.teclado,
    "Mouse": log.mouse,
    "Internet": log.internet,
    "Gabinete/PC": log.gabinete,
    "Status Geral": log.statusGeral,
    "Linha Vermelha (Defeito)": log.isRedRow ? "SIM (CRÍTICO)" : "NÃO (CONFORME)",
  };

  const jsonString = JSON.stringify(checklistObject, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOkVal = (val: string) => val.toUpperCase() === 'OK' || val.toUpperCase() === 'NORMAL' || val.toUpperCase() === 'BOM';

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-xs space-y-4 shadow-sm">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'checklist'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resumo da Planilha (9 Itens)</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'json'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Formato JSON</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {onFilterByField && (
            <>
              <button
                onClick={() => onFilterByField('user', log.usuario)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 text-[11px] font-semibold transition-colors"
              >
                + Filtrar Usuário ({log.usuario})
              </button>
              <button
                onClick={() => onFilterByField('computer', log.computador)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 text-[11px] font-semibold transition-colors"
              >
                + Filtrar Computador ({log.computador})
              </button>
            </>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 text-[11px] font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Dados</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Main info card */}
          <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Identificação do Registro</div>
            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <span className="text-neutral-500">Data / Hora:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{log.dataHora || log.timestamp}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <span className="text-neutral-500">Computador:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-neutral-400" />
                  {log.computador}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Usuário do Checklist:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {log.usuario}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Status card */}
          <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 col-span-2">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Inspeção de Equipamentos da Estação</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Tela:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${isOkVal(log.tela) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-red-600 bg-red-100 font-extrabold'}`}>
                  {log.tela}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Teclado:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${isOkVal(log.teclado) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-red-600 bg-red-100 font-extrabold'}`}>
                  {log.teclado}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Mouse:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${isOkVal(log.mouse) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-red-600 bg-red-100 font-extrabold'}`}>
                  {log.mouse}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Internet:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${isOkVal(log.internet) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-red-600 bg-red-100 font-extrabold'}`}>
                  {log.internet}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Gabinete/PC:</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${isOkVal(log.gabinete) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-red-600 bg-red-100 font-extrabold'}`}>
                  {log.gabinete}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">Status Geral:</span>
                {log.isRedRow ? (
                  <span className="font-extrabold px-2 py-0.5 rounded text-[11px] text-white bg-red-600 animate-pulse flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    {log.statusGeral}
                  </span>
                ) : (
                  <span className="font-bold px-2 py-0.5 rounded text-[11px] text-white bg-emerald-600">
                    {log.statusGeral}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'json' && (
        <pre className="p-3.5 rounded-xl bg-neutral-900 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-neutral-800">
          {jsonString}
        </pre>
      )}
    </div>
  );
};
