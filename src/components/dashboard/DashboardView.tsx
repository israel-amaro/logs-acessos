import React, { useState, useMemo } from 'react';
import {
  Monitor,
  Laptop,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Keyboard,
  Mouse,
  HardDrive,
  Tv,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { LogEvent, UnitType } from '../../types/log';
import { extractLabInfo, sortLogsMostRecentFirst } from '../../utils/labUtils';

interface DashboardViewProps {
  logs: LogEvent[];
  onNavigateToLogsWithFilter: (filter: { severity?: string; user?: string; computer?: string; unit?: string }) => void;
  onAddChecklistToUnit?: (newChecklist: Partial<LogEvent>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  logs,
  onNavigateToLogsWithFilter,
}) => {
  // Selected Unit Tab for deep inspection ('ALL' | 'PORTO' | 'NOTEBOOK PORTO' | 'BEIRA MAR' | 'NOTEBOOK BEIRA MAR')
  const [selectedUnitTab, setSelectedUnitTab] = useState<string>('ALL');

  // Helper to determine if a log is non-compliant / defective
  const isDefective = (log: LogEvent) => {
    const statusUpper = (log.statusGeral || '').toUpperCase();
    return Boolean(
      log.isRedRow ||
      log.severity === 'error' ||
      statusUpper.includes('CRÍTICO') ||
      statusUpper.includes('ERRO') ||
      statusUpper.includes('DEF') ||
      statusUpper.includes('FALHA') ||
      statusUpper.includes('ATENÇÃO') ||
      statusUpper.includes('NOK') ||
      statusUpper.includes('NÃO') ||
      [log.tela, log.teclado, log.mouse, log.touchpad, log.internet, log.gabinete].some(
        (val) => val && val !== '-' && !['OK', 'NORMAL', 'BOM'].includes(val.toUpperCase().trim())
      )
    );
  };

  // Group logs and computer statistics by the 4 Units
  const unitStats = useMemo(() => {
    const units: UnitType[] = ['PORTO', 'NOTEBOOK PORTO', 'BEIRA MAR', 'NOTEBOOK BEIRA MAR'];
    
    const stats: Record<UnitType, {
      unitName: UnitType;
      icon: 'desktop' | 'notebook';
      totalLogs: number;
      uniqueComputers: Set<string>;
      okComputersCount: number;
      defectiveComputersCount: number;
      defectiveLogs: LogEvent[];
      componentFailures: { tela: number; teclado: number; mouse: number; internet: number; gabinete: number };
    }> = {
      'PORTO': {
        unitName: 'PORTO',
        icon: 'desktop',
        totalLogs: 0,
        uniqueComputers: new Set(),
        okComputersCount: 0,
        defectiveComputersCount: 0,
        defectiveLogs: [],
        componentFailures: { tela: 0, teclado: 0, mouse: 0, internet: 0, gabinete: 0 },
      },
      'NOTEBOOK PORTO': {
        unitName: 'NOTEBOOK PORTO',
        icon: 'notebook',
        totalLogs: 0,
        uniqueComputers: new Set(),
        okComputersCount: 0,
        defectiveComputersCount: 0,
        defectiveLogs: [],
        componentFailures: { tela: 0, teclado: 0, mouse: 0, internet: 0, gabinete: 0 },
      },
      'BEIRA MAR': {
        unitName: 'BEIRA MAR',
        icon: 'desktop',
        totalLogs: 0,
        uniqueComputers: new Set(),
        okComputersCount: 0,
        defectiveComputersCount: 0,
        defectiveLogs: [],
        componentFailures: { tela: 0, teclado: 0, mouse: 0, internet: 0, gabinete: 0 },
      },
      'NOTEBOOK BEIRA MAR': {
        unitName: 'NOTEBOOK BEIRA MAR',
        icon: 'notebook',
        totalLogs: 0,
        uniqueComputers: new Set(),
        okComputersCount: 0,
        defectiveComputersCount: 0,
        defectiveLogs: [],
        componentFailures: { tela: 0, teclado: 0, mouse: 0, internet: 0, gabinete: 0 },
      },
    };

    logs.forEach((log) => {
      const u = log.unit || 'PORTO';
      if (!stats[u]) return;

      stats[u].totalLogs++;
      const comp = log.computador || log.computer?.hostname || 'N/A';
      stats[u].uniqueComputers.add(comp);

      if (isDefective(log)) {
        stats[u].defectiveComputersCount++;
        stats[u].defectiveLogs.push(log);

        if (log.tela && !['OK', 'NORMAL', 'BOM'].includes(log.tela.toUpperCase().trim())) stats[u].componentFailures.tela++;
        if (log.teclado && !['OK', 'NORMAL', 'BOM'].includes(log.teclado.toUpperCase().trim())) stats[u].componentFailures.teclado++;
        const mouseVal = log.touchpad || log.mouse;
        if (mouseVal && !['OK', 'NORMAL', 'BOM'].includes(mouseVal.toUpperCase().trim())) stats[u].componentFailures.mouse++;
        if (log.internet && !['OK', 'NORMAL', 'BOM'].includes(log.internet.toUpperCase().trim())) stats[u].componentFailures.internet++;
        if (!u.includes('NOTEBOOK') && log.gabinete && log.gabinete !== '-' && !['OK', 'NORMAL', 'BOM'].includes(log.gabinete.toUpperCase().trim())) stats[u].componentFailures.gabinete++;
      } else {
        stats[u].okComputersCount++;
      }
    });

    return stats;
  }, [logs]);

  // Global calculations
  const totalLogsCount = logs.length;
  const defectiveLogsTotal = logs.filter(isDefective).length;
  const okLogsTotal = totalLogsCount - defectiveLogsTotal;
  const conformityPercentage = totalLogsCount > 0 ? Math.round((okLogsTotal / totalLogsCount) * 100) : 100;

  // Filtered logs for the selected unit tab (sorted most recent to oldest)
  const displayLogs = useMemo(() => {
    const filtered = selectedUnitTab === 'ALL' ? logs : logs.filter((l) => l.unit === selectedUnitTab);
    return sortLogsMostRecentFirst(filtered);
  }, [logs, selectedUnitTab]);

  return (
    <div className="space-y-6">
      {/* Global Status Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Audited */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Auditados</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            {totalLogsCount} <span className="text-xs font-normal text-neutral-400">máquinas</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">
            Monitoramento das 4 unidades em tempo real
          </div>
        </div>

        {/* Card 2: Conformity Rate */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Taxa de Conformidade</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {conformityPercentage}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {okLogsTotal} equipamento(s) 100% OK
          </div>
        </div>

        {/* Card 3: Non-compliant / Red Rows */}
        <div
          onClick={() => onNavigateToLogsWithFilter({ severity: 'error' })}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Não Conformes (Com Defeito)</span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
            {defectiveLogsTotal}
          </div>
          <div className="text-[11px] text-red-600 font-medium flex items-center justify-between">
            <span>Requer atenção técnica</span>
            <span>Ver detalhes →</span>
          </div>
        </div>

        {/* Card 4: Active Units */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Unidades Mapeadas</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            4 / 4
          </div>
          <div className="text-[11px] text-neutral-500">
            Porto Desktop, Notebook Porto, Beira Mar & Notebook Beira Mar
          </div>
        </div>
      </div>

      {/* THE 4 UNITS CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span>Situação por Unidade / Categoria</span>
          </h3>
          <span className="text-xs text-neutral-500">Selecione uma unidade para filtrar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['PORTO', 'NOTEBOOK PORTO', 'BEIRA MAR', 'NOTEBOOK BEIRA MAR'] as UnitType[]).map((uKey) => {
            const stat = unitStats[uKey];
            const isNotebook = stat.icon === 'notebook';
            const isSelected = selectedUnitTab === uKey;
            const hasDefects = stat.defectiveComputersCount > 0;

            return (
              <div
                key={uKey}
                onClick={() => {
                  setSelectedUnitTab(isSelected ? 'ALL' : uKey);
                  onNavigateToLogsWithFilter({ unit: uKey });
                }}
                className={`bg-white dark:bg-neutral-900 border rounded-2xl p-4 shadow-2xs space-y-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20'
                    : hasDefects
                    ? 'border-red-200 dark:border-red-900/60 hover:border-red-400'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-xl ${
                      isNotebook
                        ? 'bg-sky-50 dark:bg-sky-950 text-sky-600'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-600'
                    }`}>
                      {isNotebook ? <Laptop className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-neutral-900 dark:text-white tracking-tight">
                        {uKey}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {stat.uniqueComputers.size} máquina(s)
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {hasDefects ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      {stat.defectiveComputersCount} Defeito(s)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      100% OK
                    </span>
                  )}
                </div>

                {/* Counts Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Conformes</span>
                    <span className="text-base font-bold text-emerald-800 dark:text-emerald-200 font-mono">
                      {stat.okComputersCount}
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    hasDefects
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/40'
                      : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800'
                  }`}>
                    <span className={`block text-[10px] font-semibold ${hasDefects ? 'text-red-700 dark:text-red-400' : 'text-neutral-500'}`}>
                      Não Conformes
                    </span>
                    <span className={`text-base font-bold font-mono ${hasDefects ? 'text-red-800 dark:text-red-200' : 'text-neutral-400'}`}>
                      {stat.defectiveComputersCount}
                    </span>
                  </div>
                </div>

                {/* Component Breakdown Mini Icons */}
                <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                  <span className="flex items-center gap-1" title="Tela">
                    <Tv className={`w-3 h-3 ${stat.componentFailures.tela > 0 ? 'text-red-500 font-bold' : 'text-emerald-500'}`} />
                    <span>{stat.componentFailures.tela === 0 ? 'OK' : stat.componentFailures.tela}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Teclado">
                    <Keyboard className={`w-3 h-3 ${stat.componentFailures.teclado > 0 ? 'text-red-500 font-bold' : 'text-emerald-500'}`} />
                    <span>{stat.componentFailures.teclado === 0 ? 'OK' : stat.componentFailures.teclado}</span>
                  </span>
                  <span className="flex items-center gap-1" title={isNotebook ? 'Touch Pad' : 'Mouse'}>
                    <Mouse className={`w-3 h-3 ${stat.componentFailures.mouse > 0 ? 'text-red-500 font-bold' : 'text-emerald-500'}`} />
                    <span>{stat.componentFailures.mouse === 0 ? 'OK' : stat.componentFailures.mouse}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Internet">
                    <Wifi className={`w-3 h-3 ${stat.componentFailures.internet > 0 ? 'text-red-500 font-bold' : 'text-emerald-500'}`} />
                    <span>{stat.componentFailures.internet === 0 ? 'OK' : stat.componentFailures.internet}</span>
                  </span>
                  {!isNotebook && (
                    <span className="flex items-center gap-1" title="Gabinete/PC">
                      <HardDrive className={`w-3 h-3 ${stat.componentFailures.gabinete > 0 ? 'text-red-500 font-bold' : 'text-emerald-500'}`} />
                      <span>{stat.componentFailures.gabinete === 0 ? 'OK' : stat.componentFailures.gabinete}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED COMPUTER MATRIX TABLE BY UNIT */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xs space-y-4">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600" />
              <span>Lista de Equipamentos por Unidade</span>
            </h3>
            <p className="text-[11px] text-neutral-400">Clique para alternar entre as 4 abas correspondentes ao instalador SENAI</p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedUnitTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedUnitTab === 'ALL'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Todas ({logs.length})
            </button>
            {(['PORTO', 'NOTEBOOK PORTO', 'BEIRA MAR', 'NOTEBOOK BEIRA MAR'] as UnitType[]).map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUnitTab(u)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedUnitTab === u
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Computers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-extrabold">Data / Hora</th>
                <th className="py-2.5 px-3">Computador</th>
                <th className="py-2.5 px-3">Usuário</th>
                <th className="py-2.5 px-2 text-center">Tela</th>
                <th className="py-2.5 px-2 text-center">Teclado</th>
                <th className="py-2.5 px-2 text-center">
                  {selectedUnitTab.includes('NOTEBOOK') ? 'Touch Pad' : 'Mouse / TouchPad'}
                </th>
                <th className="py-2.5 px-2 text-center">Internet</th>
                <th className="py-2.5 px-2 text-center">
                  {selectedUnitTab.includes('NOTEBOOK') ? '-' : 'Gabinete'}
                </th>
                <th className="py-2.5 px-3 text-center">Status Geral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {displayLogs.length > 0 ? (
                displayLogs.map((log) => {
                  const defective = isDefective(log);
                  const isNotebookRow = log.unit?.includes('NOTEBOOK') || log.isNotebook;
                  const mouseOrTouchpadVal = log.touchpad || log.mouse || 'OK';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => onNavigateToLogsWithFilter({ computer: log.computador })}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
                        defective ? 'bg-red-50/70 dark:bg-red-950/40 border-l-4 border-l-red-600' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300">
                          {log.unit || 'PORTO'}
                        </span>
                      </td>

                      {/* DATA / HORA */}
                      <td className="py-3 px-3 font-mono font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap text-[11px]">
                        {log.dataHora || log.timestamp}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{log.computador}</span>
                          {(() => {
                            const lab = extractLabInfo(log.computador);
                            if (lab.labCode !== 'OUTROS') {
                              return (
                                <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-sans text-[9px] font-extrabold border border-purple-200 dark:border-purple-800">
                                  {lab.labCode}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {log.usuario}
                      </td>

                      {/* TELA */}
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.tela === 'OK' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>{log.tela}</span>
                      </td>

                      {/* TECLADO */}
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.teclado === 'OK' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>{log.teclado}</span>
                      </td>

                      {/* MOUSE / TOUCHPAD */}
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ['OK', 'NORMAL', 'BOM'].includes(mouseOrTouchpadVal.toUpperCase().trim())
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>{mouseOrTouchpadVal}</span>
                      </td>

                      {/* INTERNET */}
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.internet === 'OK' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>{log.internet}</span>
                      </td>

                      {/* GABINETE */}
                      <td className="py-3 px-2 text-center font-mono">
                        {isNotebookRow ? (
                          <span className="text-neutral-400 text-[11px] font-mono">-</span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.gabinete === 'OK' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>{log.gabinete}</span>
                        )}
                      </td>

                      {/* STATUS GERAL */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {defective ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase shadow-2xs tracking-wide">
                            🔴 {log.statusGeral}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] uppercase shadow-2xs">
                            🟢 Conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-neutral-400 font-mono">
                    Nenhum computador registrado nesta unidade.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
