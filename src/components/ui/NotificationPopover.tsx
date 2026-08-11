import React from 'react';
import { Bell, ShieldAlert, CheckCircle, Info, X } from 'lucide-react';

interface NotificationPopoverProps {
  onClose: () => void;
  onSelectLogFilter?: (filter: { severity: 'error' | 'warning'; user?: string }) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  onClose,
  onSelectLogFilter,
}) => {
  const notifications = [
    {
      id: '1',
      title: 'Múltiplas falhas de login detectadas',
      description: 'Host WKSTN-FIN-042 registrou 5 tentativas malsucedidas do usuário m.silva.',
      time: 'Há 4 min',
      type: 'alert' as const,
      severity: 'error' as const,
      user: 'm.silva',
    },
    {
      id: '2',
      title: 'Elevação de privilégio admin (Sudo)',
      description: 'Usuário c.almeida executou elevação de permissão no servidor SERVER-AUTH-01.',
      time: 'Há 18 min',
      type: 'warning' as const,
      severity: 'warning' as const,
      user: 'c.almeida',
    },
    {
      id: '3',
      title: 'Atualização de Regras de Auditoria',
      description: 'Regra de bloqueio automático para portas RDP em lote foi aplicada com sucesso.',
      time: 'Há 1h',
      type: 'info' as const,
      severity: 'warning' as const,
    },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
            Alertas e Notificações de Segurança
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              if (onSelectLogFilter) {
                onSelectLogFilter({ severity: notif.severity, user: notif.user });
              }
              onClose();
            }}
            className="p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 font-medium text-xs text-gray-900 dark:text-gray-100">
                {notif.type === 'alert' && <ShieldAlert className="w-3.5 h-3.5 text-red-600" />}
                {notif.type === 'warning' && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                {notif.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-500" />}
                <span>{notif.title}</span>
              </span>
              <span className="text-[10px] text-gray-400">{notif.time}</span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
              {notif.description}
            </p>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-center">
        <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
          Ver todas as 12 regras ativas →
        </span>
      </div>
    </div>
  );
};
