import React, { useState } from 'react';
import { Play, X, Code, Sparkles } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onRunQuery: () => void;
  onClear: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onRunQuery,
  onClear,
  placeholder = 'Filtro de busca: computador="WKSTN-FIN-042" OU usuario="m.silva" OU severidade=error',
}) => {
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);

  const quickTemplates = [
    { label: 'Falhas de Login em Computadores', query: 'action="user.login.failed" OR severity=error' },
    { label: 'Elevação de Privilégio Admin', query: 'action="sudo.privilege_elevation" OR action="security.malware.blocked"' },
    { label: 'Usuário m.silva', query: 'user="m.silva"' },
    { label: 'Computador WKSTN-FIN-042', query: 'computer="WKSTN-FIN-042"' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onRunQuery();
      setShowQuerySuggestions(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Search Input Container */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Code className="w-4 h-4 text-neutral-400" />
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowQuerySuggestions(true)}
            placeholder={placeholder}
            className="w-full h-11 pl-10 pr-10 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-[10px] text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 dark:focus:border-neutral-100 transition-all shadow-2xs"
          />

          {value && (
            <button
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              title="Limpar consulta"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Run Query Button */}
        <button
          onClick={() => {
            onRunQuery();
            setShowQuerySuggestions(false);
          }}
          className="h-11 px-6 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 rounded-[10px] font-semibold text-xs flex items-center space-x-2 transition-all shadow-2xs cursor-pointer active:scale-98"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Executar Consulta</span>
        </button>
      </div>

      {/* Quick query templates bar */}
      {showQuerySuggestions && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Atalhos de Consulta:
          </span>
          {quickTemplates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(tpl.query);
                onRunQuery();
                setShowQuerySuggestions(false);
              }}
              className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono transition-colors"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
