import React from 'react';
import { Search, Bookmark, History } from 'lucide-react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  savedQueriesCount?: number;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onTabChange,
  savedQueriesCount = 4,
}) => {
  const tabs = [
    { id: 'query', label: 'Construtor de Consulta', icon: Search },
    { id: 'saved', label: 'Consultas Salvas', icon: Bookmark, badge: savedQueriesCount },
    { id: 'recent', label: 'Histórico Recente', icon: History },
  ];

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex space-x-8 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-3 flex items-center space-x-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-neutral-900 dark:text-white font-bold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
                  {tab.badge}
                </span>
              )}

              {/* Active Bottom Indicator Line */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
