import React from 'react';
import { Circle, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { LogSeverity } from '../../types/log';

interface SeverityBadgeProps {
  severity: LogSeverity;
  showText?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showText = true,
  className = '',
}) => {
  switch (severity) {
    case 'info':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 ${className}`}
        >
          <Circle className="w-3 h-3 fill-gray-500 text-gray-500" />
          {showText && <span>Info</span>}
        </span>
      );

    case 'warning':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          {showText && <span>Warning</span>}
        </span>
      );

    case 'error':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/60 ${className}`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          {showText && <span>Error</span>}
        </span>
      );

    case 'success':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {showText && <span>Success</span>}
        </span>
      );

    default:
      return null;
  }
};
