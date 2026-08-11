import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { LogEvent } from '../../types/log';
import { BarChart3, PieChart as PieIcon, Monitor, Users } from 'lucide-react';

interface AnalyticsViewProps {
  logs: LogEvent[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs }) => {
  // Process logs by computer
  const computerData = () => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      map[l.computer.hostname] = (map[l.computer.hostname] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  };

  // Process severity data
  const severityData = () => {
    const counts = { info: 0, warning: 0, error: 0, success: 0 };
    logs.forEach((l) => {
      if (counts[l.severity] !== undefined) {
        counts[l.severity] += 1;
      }
    });
    return [
      { name: 'Info', value: counts.info, color: '#6B7280' },
      { name: 'Warning', value: counts.warning, color: '#F59E0B' },
      { name: 'Error', value: counts.error, color: '#DC2626' },
      { name: 'Success', value: counts.success, color: '#10B981' },
    ];
  };

  // Process top users
  const userData = () => {
    const map: Record<string, number> = {};
    logs.forEach((l) => {
      map[l.user.username] = (map[l.user.username] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const compChartData = computerData();
  const sevChartData = severityData();
  const usrChartData = userData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics & Tendências de Acesso
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Análise comportamental de hosts, pico de acessos por usuário e distribuição de severidades.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Computer Volume Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <Monitor className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Volume de Acessos por Estação de Trabalho
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <PieIcon className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Distribuição de Severidade dos Logs
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sevChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sevChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(val) => <span className="text-xs font-semibold">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top User Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <Users className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Top 6 Usuários com Maior Volume de Interação
            </h3>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usrChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
