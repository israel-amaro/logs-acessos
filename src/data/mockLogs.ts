import { LogEvent, SavedQuery, UnitType } from '../types/log';

export function parseChecklistRowToLogEvent(item: any, idx: number, forcedUnit?: UnitType): LogEvent {
  const dataHora = item['Data/Hora'] || item['Data_Hora'] || item['Data/Hora '] || item.dataHora || item.timestamp || new Date().toLocaleString('pt-BR');
  const computador = item['Computador'] || item.computador || item.hostname || `COMP-${String(idx + 1).padStart(2, '0')}`;
  const usuario = item['Usuário'] || item['Usuario'] || item.usuario || item.username || 'operador';
  const tela = item['Tela'] || item.tela || 'OK';
  const teclado = item['Teclado'] || item.teclado || 'OK';
  
  // TouchPad is specific to Notebooks in Google Sheets
  const touchpad = item['Touch Pad'] || item['TouchPad'] || item['Touchpad'] || item.touchpad || '';
  const mouse = item['Mouse'] || item.mouse || touchpad || 'OK';
  const internet = item['Internet'] || item.internet || 'OK';
  
  // Determine Unit first
  let unit: UnitType = forcedUnit || 'PORTO';
  if (!forcedUnit) {
    let rawUnit = (item['Unidade'] || item['Local'] || item['Aba'] || item.unidade || item.unit || '').toString().trim().toUpperCase();
    if (rawUnit.includes('NOTEBOOK BEIRA') || rawUnit.includes('NOTEBOOK_BEIRA')) {
      unit = 'NOTEBOOK BEIRA MAR';
    } else if (rawUnit.includes('BEIRA') || rawUnit.includes('BEIRAMAR')) {
      unit = rawUnit.includes('NOTEBOOK') || rawUnit.includes('NOTE') ? 'NOTEBOOK BEIRA MAR' : 'BEIRA MAR';
    } else if (rawUnit.includes('NOTEBOOK PORTO') || rawUnit.includes('NOTEBOOK_PORTO')) {
      unit = 'NOTEBOOK PORTO';
    } else if (rawUnit.includes('PORTO')) {
      unit = rawUnit.includes('NOTEBOOK') || rawUnit.includes('NOTE') ? 'NOTEBOOK PORTO' : 'PORTO';
    } else {
      const compUpper = computador.toUpperCase();
      if (compUpper.includes('BM-NOTE') || compUpper.includes('BEIRA-NOTE')) {
        unit = 'NOTEBOOK BEIRA MAR';
      } else if (compUpper.includes('BM') || compUpper.includes('BEIRA')) {
        unit = 'BEIRA MAR';
      } else if (compUpper.includes('PORTO-NOTE') || compUpper.includes('NOTEBOOK-PORTO') || compUpper.includes('NB-PORTO') || compUpper.includes('PRT-C02')) {
        unit = 'NOTEBOOK PORTO';
      } else if (compUpper.includes('PORTO')) {
        unit = 'PORTO';
      } else {
        const units: UnitType[] = ['PORTO', 'NOTEBOOK PORTO', 'BEIRA MAR', 'NOTEBOOK BEIRA MAR'];
        unit = units[idx % units.length];
      }
    }
  }

  const isNotebook = unit.includes('NOTEBOOK') || Boolean(touchpad);

  // Gabinete/PC is present for Desktops, for Notebooks it is '-' or N/A
  const gabinete = isNotebook 
    ? (item['Gabinete/PC'] || item['Gabinete'] || item.gabinete || '-')
    : (item['Gabinete/PC'] || item['Gabinete'] || item.gabinete || 'OK');

  const statusGeral = item['Status Geral'] || item['Status_Geral'] || item.statusGeral || 'OK';

  // Comprehensive check if row has defects / irregularities
  const statusUpper = statusGeral.toUpperCase();
  const isRedRow = Boolean(
    item.isRedRow ||
    item.linhaVermelha ||
    statusUpper.includes('CRÍTICO') ||
    statusUpper.includes('ERRO') ||
    statusUpper.includes('DEF') ||
    statusUpper.includes('FALHA') ||
    statusUpper.includes('ATENÇÃO') ||
    statusUpper.includes('NOK') ||
    statusUpper.includes('NÃO') ||
    [tela, teclado, mouse, touchpad, internet, gabinete].some((val) => {
      if (!val || val === '-') return false;
      const v = val.toUpperCase().trim();
      return !['OK', 'NORMAL', 'BOM'].includes(v);
    })
  );

  const severity = isRedRow ? 'error' : 'success';

  // Summarize issues
  const issues = [];
  if (tela.toUpperCase() !== 'OK') issues.push(`Tela: ${tela}`);
  if (teclado.toUpperCase() !== 'OK') issues.push(`Teclado: ${teclado}`);
  if (touchpad && touchpad.toUpperCase() !== 'OK') issues.push(`Touch Pad: ${touchpad}`);
  if (!isNotebook && mouse.toUpperCase() !== 'OK') issues.push(`Mouse: ${mouse}`);
  if (internet.toUpperCase() !== 'OK') issues.push(`Internet: ${internet}`);
  if (!isNotebook && gabinete.toUpperCase() !== 'OK' && gabinete !== '-') issues.push(`Gabinete/PC: ${gabinete}`);

  const message = issues.length > 0 
    ? `[${unit}] Irregularidade em [${issues.join(' | ')}] - Status Geral: ${statusGeral}` 
    : `[${unit}] Checklist OK - Todos os itens em conformidade - Status Geral: ${statusGeral}`;

  return {
    id: item.id || `sheet-row-${idx + 1}`,
    timestamp: dataHora,
    dataHora,
    computador,
    usuario,
    tela,
    teclado,
    mouse,
    touchpad: touchpad || (isNotebook ? mouse : undefined),
    internet,
    gabinete,
    statusGeral,
    isRedRow,
    isNotebook,
    unit,
    severity,
    computer: {
      hostname: computador,
      department: `SENAI - ${unit}`,
      location: unit,
    },
    user: {
      username: usuario,
      fullName: usuario,
      department: unit,
    },
    action: isRedRow ? 'checklist.irregularidade' : 'checklist.conforme',
    message,
  };
}

import { sortLogsMostRecentFirst } from '../utils/labUtils';

// Initial realistic spreadsheet records matching exact patterns from the linked Google Sheet tabs
export const SPREADSHEET_CHECKLIST_DATA = [
  // PORTO (Desktops) - Standard hostname pattern: PT-L5-02-60000 (PT = Porto, L5 = Lab 5, 02 = Posição, 60000 = Patrimônio)
  { "Data/Hora": "05/08/2026 10:45:12", "Unidade": "PORTO", "Computador": "PT-L5-01-60000", "Usuário": "marcos.silva", "Tela": "OK", "Teclado": "OK", "Mouse": "OK", "Internet": "OK", "Gabinete/PC": "OK", "Status Geral": "OK" },
  { "Data/Hora": "05/08/2026 10:42:00", "Unidade": "PORTO", "Computador": "PT-L5-02-60001", "Usuário": "ana.paula", "Tela": "Com Defeito", "Teclado": "OK", "Mouse": "OK", "Internet": "OK", "Gabinete/PC": "OK", "Status Geral": "CRÍTICO (Linha Vermelha)", isRedRow: true },
  { "Data/Hora": "05/08/2026 10:38:50", "Unidade": "PORTO", "Computador": "PT-L3-04-60005", "Usuário": "carlos.eduardo", "Tela": "OK", "Teclado": "OK", "Mouse": "Sem Resposta", "Internet": "OK", "Gabinete/PC": "OK", "Status Geral": "ATENÇÃO / DEFEITO", isRedRow: true },
  { "Data/Hora": "05/08/2026 10:35:10", "Unidade": "PORTO", "Computador": "PT-L2-01-60009", "Usuário": "juliana.costa", "Tela": "OK", "Teclado": "OK", "Mouse": "OK", "Internet": "OK", "Gabinete/PC": "OK", "Status Geral": "OK" },

  // NOTEBOOK PORTO (Exact records matching Google Sheets tab + SENAI Lab pattern)
  { "Data/Hora": "05/08/2026 12:31:00", "Unidade": "NOTEBOOK PORTO", "Computador": "PT-L5-05-60012", "Usuário": "Porto", "Tela": "OK", "Teclado": "NÃO OK (Faltando tecla do chatgpt)", "Touch Pad": "OK", "Internet": "OK", "Status Geral": "ATENÇÃO / DEFEITO", isRedRow: true },
  { "Data/Hora": "05/08/2026 12:30:00", "Unidade": "NOTEBOOK PORTO", "Computador": "DESKTOP-JQLF", "Usuário": "Porto", "Tela": "OK", "Teclado": "OK", "Touch Pad": "OK", "Internet": "OK", "Status Geral": "OK" },
  { "Data/Hora": "05/08/2026 12:10:00", "Unidade": "NOTEBOOK PORTO", "Computador": "PRT-C02-1TTC2", "Usuário": "mdt", "Tela": "OK", "Teclado": "OK", "Touch Pad": "OK", "Internet": "OK", "Status Geral": "OK" },
  { "Data/Hora": "05/08/2026 10:20:44", "Unidade": "NOTEBOOK PORTO", "Computador": "PT-L1-08-60020", "Usuário": "fernanda.lima", "Tela": "OK", "Teclado": "OK", "Touch Pad": "Sem Resposta", "Internet": "Sem Conexão", "Status Geral": "FALHA DE REDE", isRedRow: true },

  // BEIRA MAR (Desktops)
  { "Data/Hora": "05/08/2026 10:15:30", "Unidade": "BEIRA MAR", "Computador": "BM-L1-01-50001", "Usuário": "gabriel.oliveira", "Tela": "OK", "Teclado": "OK", "Mouse": "OK", "Internet": "OK", "Gabinete/PC": "Não Liga", "Status Geral": "CRÍTICO - HARDWARE", isRedRow: true },
  { "Data/Hora": "05/08/2026 10:10:05", "Unidade": "BEIRA MAR", "Computador": "BM-L1-02-50002", "Usuário": "beatriz.souza", "Tela": "OK", "Teclado": "OK", "Mouse": "OK", "Internet": "OK", "Gabinete/PC": "OK", "Status Geral": "OK" },
  { "Data/Hora": "05/08/2026 10:05:22", "Unidade": "BEIRA MAR", "Computador": "BM-L2-03-50010", "Usuário": "alessandro.alves", "Tela": "OK", "Teclado": "OK", "Mouse": "OK", "Internet": "OK", "Gabinete/PC": "OK", "Status Geral": "OK" },

  // NOTEBOOK BEIRA MAR
  { "Data/Hora": "05/08/2026 09:58:11", "Unidade": "NOTEBOOK BEIRA MAR", "Computador": "BM-L1-09-50025", "Usuário": "admin.ti", "Tela": "OK", "Teclado": "OK", "Touch Pad": "OK", "Internet": "OK", "Status Geral": "OK" },
  { "Data/Hora": "05/08/2026 09:50:00", "Unidade": "NOTEBOOK BEIRA MAR", "Computador": "BM-L2-10-50030", "Usuário": "suporte.ti", "Tela": "Com Risco / Manchada", "Teclado": "OK", "Touch Pad": "OK", "Internet": "OK", "Status Geral": "CRÍTICO", isRedRow: true },
  { "Data/Hora": "05/08/2026 09:42:30", "Unidade": "NOTEBOOK BEIRA MAR", "Computador": "BM-L3-01-50040", "Usuário": "diego.ferreira", "Tela": "OK", "Teclado": "OK", "Touch Pad": "OK", "Internet": "OK", "Status Geral": "OK" },
];

export function generateInitialLogs(): LogEvent[] {
  const logs = SPREADSHEET_CHECKLIST_DATA.map((item, idx) => parseChecklistRowToLogEvent(item, idx));
  return sortLogsMostRecentFirst(logs);
}

export const SAVED_QUERIES_MOCK: SavedQuery[] = [
  {
    id: 'sq-2',
    title: 'Irregularidades de Teclado e Mouse',
    query: 'Teclado!=OK OR Mouse!=OK',
    description: 'Exibe computadores com problemas em periféricos de entrada.',
    createdAt: '28/07/2026',
    filters: {},
  },
  {
    id: 'sq-3',
    title: 'Problemas de Gabinete / PC',
    query: 'Gabinete!=OK',
    description: 'Computadores que não ligam, lacre violado ou com ruídos no gabinete.',
    createdAt: '28/07/2026',
    filters: {},
  },
];

