import React from 'react';
import { Bookmark, Play, Plus, X, Sparkles } from 'lucide-react';
import { SavedQuery } from '../../types/log';

interface SavedQueriesModalProps {
  savedQueries: SavedQuery[];
  onSelectQuery: (sq: SavedQuery) => void;
  onClose: () => void;
  onSaveNewQuery: (title: string, queryStr: string) => void;
  currentQueryValue: string;
}

export const SavedQueriesModal: React.FC<SavedQueriesModalProps> = ({
  savedQueries,
  onSelectQuery,
  onClose,
  onSaveNewQuery,
  currentQueryValue,
}) => {
  const [newTitle, setNewTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentQueryValue.trim()) return;
    onSaveNewQuery(newTitle, currentQueryValue);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              Consultas de Logs Salvas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option to Save Current Search */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Salvar Consulta Atual como Atalho</span>
          </button>
        ) : (
          <form onSubmit={handleSave} className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Salvar Nova Consulta
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Título da Consulta:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Falhas de Login - Turno Noturno"
                className="w-full h-9 px-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-medium text-neutral-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">Filtro / Query:</label>
              <div className="p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded font-mono text-[11px] text-neutral-900 dark:text-neutral-100 font-bold truncate">
                {currentQueryValue || 'Nenhuma query informada'}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-2xs"
              >
                Salvar
              </button>
            </div>
          </form>
        )}

        {/* List of Saved Queries */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {savedQueries.map((sq) => (
            <div
              key={sq.id}
              className="p-3.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 hover:border-neutral-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                  {sq.title}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{sq.createdAt}</span>
              </div>

              <p className="text-[11px] text-neutral-500 leading-snug">{sq.description}</p>

              <div className="flex items-center justify-between pt-1">
                <code className="text-[11px] text-neutral-900 dark:text-neutral-100 font-bold font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded truncate max-w-[320px]">
                  {sq.query}
                </code>

                <button
                  onClick={() => {
                    onSelectQuery(sq);
                    onClose();
                  }}
                  className="px-3 py-1 bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-900 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Executar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
