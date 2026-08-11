import React from 'react';
import { X, BookOpen, Terminal, Filter, Code2, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
              Guia Rápido - Log Explorer de Computadores
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
          <p className="leading-relaxed">
            O **CloudSoft Log Explorer** permite a análise em tempo real e investigações forenses de
            autenticação e acesso em computadores da infraestrutura corporativa.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100 text-xs">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Sintaxe de Consulta de Log (Query Syntax)</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Utilize palavras-chave ou operadores lógicos AND / OR / NOT:
            </p>
            <div className="font-mono text-[11px] bg-white dark:bg-gray-950 p-2 rounded border border-gray-200 dark:border-gray-800 space-y-1 text-blue-600 dark:text-blue-400">
              <div>user="m.silva" AND computer="WKSTN-FIN-042"</div>
              <div>Severity=Error OR action="user.login.failed"</div>
              <div>period="24h" AND department="Financeiro"</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 dark:border-gray-800 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filtros Interativos</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Filtre rapidamente por Usuário, Computador / Host, Nível de Severidade e Período de Tempo.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 p-3 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                <Code2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Análise de JSON</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Clique na seta `&gt;` em qualquer linha da tabela para expandir os dados estruturados e metadados de sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
