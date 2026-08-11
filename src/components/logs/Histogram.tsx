import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { LogEvent } from '../../types/log';

interface HistogramProps {
  logs: LogEvent[];
  onSelectTimeRange?: (bucketTime: string) => void;
}

export const Histogram: React.FC<HistogramProps> = ({ logs, onSelectTimeRange }) => {
  // Aggregate logs into time buckets (e.g. 12 buckets across the time range)
  const processHistogramData = () => {
    if (!logs.length) return [];

    // Map timestamps into hourly or 10-minute buckets
    const bucketMap: Record<string, { displayTime: string; count: number; error: number; warning: number; info: number; success: number }> = {};

    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      // Format: "10:00" or "Jul 28, 10:00"
      const key = `${date.getHours().toString().padStart(2, '0')}:${Math.floor(date.getMinutes() / 10) * 10}`;
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const displayTime = `${monthNames[date.getMonth()]} ${date.getDate()}, ${key}`;

      if (!bucketMap[displayTime]) {
        bucketMap[displayTime] = { displayTime, count: 0, error: 0, warning: 0, info: 0, success: 0 };
      }

      bucketMap[displayTime].count += 1;
      if (log.severity === 'error') bucketMap[displayTime].error += 1;
      else if (log.severity === 'warning') bucketMap[displayTime].warning += 1;
      else if (log.severity === 'info') bucketMap[displayTime].info += 1;
      else if (log.severity === 'success') bucketMap[displayTime].success += 1;
    });

    return Object.values(bucketMap).reverse().slice(-18);
  };

  const data = processHistogramData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xl text-xs space-y-1 z-50">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.displayTime}</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
              {item.count} {item.count === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          {item.error > 0 && (
            <p className="text-[11px] text-red-600 font-medium">{item.error} falhas de acesso/sistema</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Distribuição do Fluxo de Eventos
        </h3>
        <span className="text-[11px] font-mono text-neutral-500">
          Intervalo de agregação: 10 min
        </span>
      </div>

      <div className="h-28 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="displayTime"
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
              <Bar
                dataKey="count"
                fill="#171717"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
                onClick={(entry) => onSelectTimeRange && onSelectTimeRange(entry.displayTime)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.error > 0 ? '#DC2626' : entry.warning > 0 ? '#F59E0B' : '#262626'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400">
            Nenhum evento registrado no intervalo selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
